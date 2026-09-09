package cn.iocoder.yudao.module.liqi.service.external.remote;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HtmlUtil;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.daas.DaasClient;
import cn.iocoder.yudao.module.liqi.service.external.PolicyProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * 政策 Provider 的真实实现：对接力企云 DaaS 政策库（城市固定为深圳市）。
 *
 * <p>启用方式：{@code liqi.policy.remote-enabled=true}。启用后本 Bean 以 {@link Primary}
 * 覆盖 {@code MockPolicyProvider}，H5 端 {@code /app-api/liqi/policy/*} 即返回真实政策。</p>
 *
 * <h3>为什么要做本地快照</h3>
 * <p>DaaS 政策接口实测存在约 <b>10 次/分钟</b> 的限流（超限返回 {@code 400 请求参数不正确}，
 * 冷却约 90s），且 {@code policy-list} <b>不支持关键词/行业/分类筛选</b>。
 * 因此这里一次性预取若干页构建本地快照，分页、关键词、地区筛选全部在内存完成，
 * 既满足 H5 的筛选交互，又把远程调用压到最低。</p>
 *
 * <h3>字段可用性（实测）</h3>
 * <ul>
 *   <li>列表接口仅 {@code id / policyName / deptName} 可用；{@code subsidy / reportDeadLine /
 *       rank / 地区编码} 全为 null，{@code officialPublishTime} 恒为 epoch 0；</li>
 *   <li>详情接口（路径式 {@code /policy-detail/{id}}）额外提供 {@code originText} 正文、
 *       {@code fileVoList} 附件、{@code rank} 级别与 {@code provinceName/cityName/areaName} 地区名；</li>
 *   <li>故 {@code subsidyMax / deadline / remainDays / tags / industry} 只能留空，
 *       待 DaaS 补齐字段后再映射。</li>
 * </ul>
 */
@Slf4j
@Primary
@Component("remotePolicyProvider")
@ConditionalOnProperty(prefix = "liqi.policy", name = "remote-enabled", havingValue = "true")
public class RemotePolicyProvider implements PolicyProvider {

    /** DaaS 政策统一归入的 H5 类型：政策项目 */
    private static final String TYPE_PROJECT = "project";
    /** 摘要最大长度 */
    private static final int SUMMARY_MAX = 120;
    /** 全量补全时允许的连续失败次数，超过则终止本轮，等下次缓存过期重试 */
    private static final int FULL_LOAD_MAX_FAIL = 3;

    @Resource
    private DaasClient daasClient;
    @Resource
    private RemotePolicyProperties properties;

    /** 政策列表本地快照（id -> 政策），保持平台返回顺序（按发布时间倒序） */
    private final Map<String, PolicyDTO> listSnapshot = Collections.synchronizedMap(new LinkedHashMap<>());
    /** 详情缓存（含正文/附件/地区），key = 政策 ID */
    private final Map<String, PolicyDTO> detailCache = Collections.synchronizedMap(new LinkedHashMap<>());
    /** 快照最后刷新时间戳（毫秒），0 表示尚未加载 */
    private final AtomicLong snapshotAt = new AtomicLong(0);
    /** 上次远程失败时间戳，用于限流冷却，冷却期内不再打远程 */
    private final AtomicLong lastFailAt = new AtomicLong(0);
    /** 平台返回的政策总数（深圳市实测约 1884），0 表示尚未探明 */
    private final AtomicInteger remoteTotal = new AtomicInteger(0);
    /** 已完整加载到的页码，后台补全任务从此页 +1 继续 */
    private final AtomicInteger loadedPage = new AtomicInteger(0);
    /** 全量补全任务运行标记，保证同一时刻只有一个后台线程 */
    private final AtomicBoolean fullLoading = new AtomicBoolean(false);

    // ============================== PolicyProvider ==============================

    @Override
    public PageResult<PolicyDTO> pagePolicy(PolicyQuery query) {
        List<PolicyDTO> all = snapshot();
        // 用户翻到后台尚未补全的页时，同步穿透拉取该页，避免"有总数但翻页为空"
        all = ensurePageLoaded(all, query);
        List<PolicyDTO> filtered = all.stream()
                .filter(x -> matchKeyword(x, query.getKeyword()))
                .filter(x -> matchRegion(x.getRegion(), query.getRegion()))
                .collect(Collectors.toList());
        int pageNo = query.getPageNo() == null || query.getPageNo() < 1 ? 1 : query.getPageNo();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1 ? 10 : query.getPageSize();
        int cached = filtered.size();
        // 无筛选条件时上报平台真实总数：后台补全期间缓存是渐进增长的，
        // 若直接用 cached 会让 H5 的总数/页数在加载过程中不断跳变。
        boolean unfiltered = StrUtil.isBlank(query.getKeyword()) && StrUtil.isBlank(query.getRegion());
        int total = unfiltered ? Math.max(cached, remoteTotal.get()) : cached;
        int from = Math.max(0, (pageNo - 1) * pageSize);
        if (from >= cached) {
            return new PageResult<>(new ArrayList<>(), (long) total);
        }
        int to = Math.min(cached, from + pageSize);
        return new PageResult<>(new ArrayList<>(filtered.subList(from, to)), (long) total);
    }

    @Override
    public PolicyDTO getPolicy(String id) {
        if (StrUtil.isBlank(id)) {
            return null;
        }
        PolicyDTO cached = detailCache.get(id);
        if (cached != null) {
            return cached;
        }
        if (inCooldown()) {
            // 冷却期内不打远程，退化为列表快照里的浅数据（有标题/来源，无正文）
            return listSnapshot.get(id);
        }
        Map<String, Object> data;
        try {
            data = daasClient.policyDetail(id);
        } catch (Exception e) {
            markFail();
            log.warn("[RemotePolicyProvider] 政策详情获取失败，回落列表快照 id={}", id, e);
            return listSnapshot.get(id);
        }
        if (data == null) {
            return listSnapshot.get(id);
        }
        PolicyDTO dto = convertDetail(data);
        if (dto != null) {
            detailCache.put(id, dto);
        }
        return dto;
    }

    /**
     * 按企业画像匹配政策。
     *
     * <p>DaaS 未提供画像匹配接口，且政策数据缺少行业/资质/补贴等结构化字段，
     * 这里只能基于「地区 + 标题关键词」做粗匹配，作用有限。
     * 真正的智能匹配建议继续走 AISpider 大模型（{@code /liqi/policy/ai-match}）。</p>
     */
    @Override
    public List<PolicyDTO> matchPolicies(EnterpriseSnapshot snapshotInfo) {
        if (snapshotInfo == null) {
            return new ArrayList<>();
        }
        List<PolicyDTO> all = snapshot();
        return all.stream()
                .filter(x -> matchRegion(x.getRegion(), snapshotInfo.getRegion())
                        || hitIndustryKeyword(x.getTitle(), snapshotInfo.getIndustry())
                        || hitQualificationKeyword(x.getTitle(), snapshotInfo.getQualifications()))
                .limit(10)
                .collect(Collectors.toList());
    }

    // ============================== 快照维护 ==============================

    /**
     * 保证目标页数据已在缓存中：无筛选条件且用户翻到未加载区间时，同步拉取所需页。
     *
     * <p>后台补全是顺序推进的，用户直接跳到靠后页码时该页可能还没到。
     * 这里按 pageNo/pageSize 换算出 DaaS 的页号（每页 50）并即时拉取，
     * 拉完后把新数据并入快照，后台任务仍会继续补齐中间空隙。</p>
     *
     * @return 补齐后的列表；无需补齐时原样返回
     */
    private List<PolicyDTO> ensurePageLoaded(List<PolicyDTO> current, PolicyQuery query) {
        boolean unfiltered = StrUtil.isBlank(query.getKeyword()) && StrUtil.isBlank(query.getRegion());
        if (!unfiltered || inCooldown()) {
            return current;
        }
        int pageNo = query.getPageNo() == null || query.getPageNo() < 1 ? 1 : query.getPageNo();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1 ? 10 : query.getPageSize();
        int needCount = pageNo * pageSize;
        if (current.size() >= needCount || current.size() >= remoteTotal.get()) {
            return current; // 已够用或已全部加载
        }
        int pageSizeMax = DaasClient.POLICY_PAGE_SIZE_MAX;
        int needDaasPage = (needCount + pageSizeMax - 1) / pageSizeMax;
        int maxPage = totalPages();
        if (maxPage > 0) {
            needDaasPage = Math.min(needDaasPage, maxPage);
        }
        boolean changed = false;
        // 从已加载页之后补到目标页；跨度大时逐页拉，节流由 requestIntervalMs 控制
        for (int page = loadedPage.get() + 1; page <= needDaasPage; page++) {
            if (page > loadedPage.get() + 1) {
                sleepQuietly(properties.getRequestIntervalMs());
            }
            try {
                List<PolicyDTO> pageList = convertList(fetchPage(page));
                if (pageList.isEmpty()) {
                    break;
                }
                synchronized (listSnapshot) {
                    pageList.forEach(x -> listSnapshot.put(x.getId(), x));
                }
                loadedPage.set(page);
                changed = true;
            } catch (Exception e) {
                markFail();
                log.warn("[RemotePolicyProvider] 按需拉取第 {} 页失败，返回已缓存的 {} 条", page, listSnapshot.size());
                break;
            }
        }
        if (!changed) {
            return current;
        }
        synchronized (listSnapshot) {
            return new ArrayList<>(listSnapshot.values());
        }
    }

    /**
     * 取本地快照（全量政策列表）。
     *
     * <p>首次调用同步拉取第一页，拿到平台 total 后立即返回，避免首屏等待；
     * 剩余页由后台线程按限流间隔补全。刷新失败则返回旧快照，保证 C 端不报错。</p>
     */
    private List<PolicyDTO> snapshot() {
        long ttlMs = Math.max(1, properties.getListCacheMinutes()) * 60_000L;
        boolean expired = System.currentTimeMillis() - snapshotAt.get() > ttlMs;
        if (listSnapshot.isEmpty() || expired) {
            loadFirstPage(expired);
        }
        startFullLoadIfNeeded();
        synchronized (listSnapshot) {
            return new ArrayList<>(listSnapshot.values());
        }
    }

    /**
     * 同步拉取第一页并记录平台 total。
     *
     * @param expired 缓存已过期，需要重新校准 total（此时不清空旧数据，避免瞬间空列表）
     */
    private synchronized void loadFirstPage(boolean expired) {
        long ttlMs = Math.max(1, properties.getListCacheMinutes()) * 60_000L;
        if (!listSnapshot.isEmpty() && System.currentTimeMillis() - snapshotAt.get() <= ttlMs) {
            return; // 已被其它线程刷新
        }
        if (inCooldown()) {
            return;
        }
        Map<String, Object> data;
        try {
            data = fetchPage(1);
        } catch (Exception e) {
            markFail();
            log.warn("[RemotePolicyProvider] 政策首页拉取失败，沿用旧快照（{} 条）", listSnapshot.size(), e);
            return;
        }
        List<PolicyDTO> first = convertList(data);
        if (first.isEmpty()) {
            return;
        }
        Object total = data == null ? null : data.get("total");
        if (total instanceof Number) {
            remoteTotal.set(((Number) total).intValue());
        }
        synchronized (listSnapshot) {
            // 覆盖同 ID 条目而非清空重建，保证过期刷新期间列表始终可用（不会瞬间变空）
            first.forEach(x -> listSnapshot.put(x.getId(), x));
        }
        snapshotAt.set(System.currentTimeMillis());
        if (expired) {
            // 缓存过期：重新校准 total 并让后台任务从第 2 页重新走一轮，拉取新增政策
            loadedPage.set(1);
        } else {
            loadedPage.compareAndSet(0, 1);
        }
        log.info("[RemotePolicyProvider] 政策首页已加载，city={} total={} 当前缓存 {} 条",
                properties.getCityCode(), remoteTotal.get(), listSnapshot.size());
    }

    /**
     * 启动后台全量补全任务（幂等，同一时刻只跑一个）。
     *
     * <p>按 {@code requestIntervalMs} 节流逐页拉取，直到覆盖 total 或到达 maxPages 上限。
     * 期间 H5 每次请求都能读到已加载的部分，数据是渐进完整的。</p>
     */
    private void startFullLoadIfNeeded() {
        if (!properties.isFullLoadEnabled()) {
            return;
        }
        if (remoteTotal.get() <= 0 || listSnapshot.size() >= remoteTotal.get()) {
            return; // total 未知或已拉满
        }
        if (!fullLoading.compareAndSet(false, true)) {
            return; // 已有任务在跑
        }
        Thread worker = new Thread(this::fullLoadLoop, "liqi-policy-fullload");
        worker.setDaemon(true);
        worker.start();
    }

    /** 后台全量补全主循环：节流逐页拉取，异常/限流则退避重试 */
    private void fullLoadLoop() {
        try {
            int totalPages = totalPages();
            if (totalPages <= 1) {
                return; // total 未探明或仅一页，无需补全
            }
            int consecutiveFail = 0;
            for (int pageNo = loadedPage.get() + 1; pageNo <= totalPages; pageNo++) {
                if (listSnapshot.size() >= remoteTotal.get()) {
                    break;
                }
                sleepQuietly(properties.getRequestIntervalMs());
                Map<String, Object> data;
                try {
                    data = fetchPage(pageNo);
                    consecutiveFail = 0;
                } catch (Exception e) {
                    consecutiveFail++;
                    markFail();
                    log.warn("[RemotePolicyProvider] 全量补全第 {} 页失败（连续 {} 次），已缓存 {} 条",
                            pageNo, consecutiveFail, listSnapshot.size());
                    if (consecutiveFail >= FULL_LOAD_MAX_FAIL) {
                        log.warn("[RemotePolicyProvider] 连续失败达上限，终止本轮全量补全");
                        break;
                    }
                    // 限流退避：等一个冷却周期后重试同一页
                    sleepQuietly(Math.max(1, properties.getCooldownSeconds()) * 1000L);
                    pageNo--;
                    continue;
                }
                List<PolicyDTO> pageList = convertList(data);
                if (pageList.isEmpty()) {
                    break; // 已到末页
                }
                synchronized (listSnapshot) {
                    pageList.forEach(x -> listSnapshot.put(x.getId(), x));
                }
                loadedPage.set(pageNo);
                if (pageNo % 10 == 0 || listSnapshot.size() >= remoteTotal.get()) {
                    log.info("[RemotePolicyProvider] 全量补全进度 {}/{} 页，已缓存 {}/{} 条",
                            pageNo, totalPages, listSnapshot.size(), remoteTotal.get());
                }
            }
            log.info("[RemotePolicyProvider] 全量补全结束，共缓存 {}/{} 条", listSnapshot.size(), remoteTotal.get());
        } catch (Exception e) {
            log.error("[RemotePolicyProvider] 全量补全任务异常退出", e);
        } finally {
            fullLoading.set(false);
        }
    }

    /** 需要拉取的总页数：由 total 推算，受 maxPages 上限约束（0=不限） */
    private int totalPages() {
        int total = remoteTotal.get();
        int pages = (total + DaasClient.POLICY_PAGE_SIZE_MAX - 1) / DaasClient.POLICY_PAGE_SIZE_MAX;
        int limit = properties.getMaxPages();
        return limit > 0 ? Math.min(pages, limit) : pages;
    }

    /** 发起一次列表请求（统一入口，便于节流与日志） */
    private Map<String, Object> fetchPage(int pageNo) {
        return daasClient.policyList(properties.getProvinceCode(), properties.getCityCode(),
                properties.getAreaCode(), null, null, pageNo, DaasClient.POLICY_PAGE_SIZE_MAX);
    }

    private static void sleepQuietly(long ms) {
        if (ms <= 0) {
            return;
        }
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private boolean inCooldown() {
        long cd = Math.max(0, properties.getCooldownSeconds()) * 1000L;
        return System.currentTimeMillis() - lastFailAt.get() < cd;
    }

    private void markFail() {
        lastFailAt.set(System.currentTimeMillis());
    }
    // ============================== 字段映射 ==============================

    /** 列表响应 -> PolicyDTO（浅数据：无正文/附件） */
    @SuppressWarnings("unchecked")
    private List<PolicyDTO> convertList(Map<String, Object> data) {
        List<PolicyDTO> result = new ArrayList<>();
        if (data == null) {
            return result;
        }
        Object listObj = data.get("list");
        if (!(listObj instanceof List)) {
            return result;
        }
        for (Object item : (List<Object>) listObj) {
            if (!(item instanceof Map)) {
                continue;
            }
            Map<String, Object> m = (Map<String, Object>) item;
            String id = str(m.get("id"));
            if (StrUtil.isBlank(id)) {
                continue;
            }
            result.add(PolicyDTO.builder()
                    .id(id)
                    .title(str(m.get("policyName")))
                    .type(TYPE_PROJECT)
                    .publishOrg(str(m.get("deptName")))
                    // 列表接口地区字段恒为 null，用配置城市兜底，保证前端「所属地区」有值
                    .region(defaultRegion())
                    .publishDate(normalizeDate(m.get("officialPublishTime")))
                    .tags(new ArrayList<>())
                    .attachments(new ArrayList<>())
                    .build());
        }
        return result;
    }

    /** 详情响应 -> PolicyDTO（含正文/附件/地区/级别） */
    @SuppressWarnings("unchecked")
    private PolicyDTO convertDetail(Map<String, Object> d) {
        String id = str(d.get("id"));
        if (StrUtil.isBlank(id)) {
            return null;
        }
        String plain = toPlainText(str(d.get("originText")));
        // 附件：名称列表（兼容旧前端）+ 明细（含可下载 URL）
        List<String> attachmentNames = new ArrayList<>();
        List<PolicyDTO.PolicyFile> attachmentFiles = new ArrayList<>();
        Object files = d.get("fileVoList");
        if (files instanceof List) {
            for (Object f : (List<Object>) files) {
                if (!(f instanceof Map)) {
                    continue;
                }
                Map<String, Object> fm = (Map<String, Object>) f;
                String url = str(fm.get("fileUrl"));
                if (StrUtil.isBlank(url)) {
                    continue;
                }
                String name = str(fm.get("fileName"));
                if (StrUtil.isBlank(name)) {
                    name = StrUtil.subAfter(url, "/", true);
                }
                attachmentNames.add(name);
                attachmentFiles.add(PolicyDTO.PolicyFile.builder()
                        .fileName(name).fileUrl(url).fileType(str(fm.get("fileType")))
                        .build());
            }
        }
        // 列表快照里的浅数据作为兜底（标题/来源在详情缺字段时不至于丢失）
        PolicyDTO shallow = listSnapshot.get(id);
        String title = StrUtil.blankToDefault(str(d.get("policyName")),
                shallow == null ? null : shallow.getTitle());
        String org = StrUtil.blankToDefault(str(d.get("deptName")),
                shallow == null ? null : shallow.getPublishOrg());
        String publishDate = normalizeDate(d.get("officialPublishTime"));
        if (StrUtil.isBlank(publishDate) && shallow != null) {
            publishDate = shallow.getPublishDate();
        }
        return PolicyDTO.builder()
                .id(id)
                .title(title)
                // DaaS 用 rank 表示级别（1 国家/2 省/3 市/4 区），H5 的 type 语义不同，统一归入政策项目
                .type(TYPE_PROJECT)
                .publishOrg(org)
                .region(buildRegion(d))
                .publishDate(publishDate)
                .summary(buildSummary(plain))
                .content(plain)
                .attachments(attachmentNames)
                .attachmentFiles(attachmentFiles)
                // 以下字段 DaaS 政策接口未提供（实测恒为 null），保持空值，前端按「—/长期有效」展示
                .subsidyMax(null)
                .industry(null)
                .tags(new ArrayList<>())
                .deadline(null)
                .remainDays(null)
                .sourceUrl(str(d.get("originUrl")))
                .build();
    }

    /**
     * 正文 HTML -> 纯文本，保留段落换行。
     *
     * <p>DaaS 的 {@code originText} 是被 {@code <div class="aispider">} 包裹的 HTML，
     * 段落用 {@code <p>}、换行用 {@code <br/>}。直接 {@code cleanHtmlTag} 会把所有段落
     * 挤成一行，正文动辄数千字将完全不可读，故先把块级标签转成换行再清标签，
     * 并统一全角空格 {@code \u3000} 与 HTML 实体。</p>
     */
    private static String toPlainText(String html) {
        if (StrUtil.isBlank(html)) {
            return "";
        }
        String s = html;
        // 段落/换行标签 -> 换行符
        s = s.replaceAll("(?i)<\\s*br\\s*/?\\s*>", "\n");
        s = s.replaceAll("(?i)</\\s*(p|div|li|tr|h[1-6])\\s*>", "\n");
        // 去掉标签与 HTML 实体
        s = HtmlUtil.cleanHtmlTag(s);
        s = HtmlUtil.unescape(s);
        // 归一化空白：全角空格与制表符转普通空格，压缩行内多余空格
        s = s.replace('\u3000', ' ').replace("\t", " ");
        s = s.replaceAll("[ ]{2,}", " ");
        // 逐行 trim，去掉空行，最多保留单个空行分隔
        String[] lines = s.split("\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String t = line.trim();
            if (t.isEmpty()) {
                continue;
            }
            if (sb.length() > 0) {
                sb.append("\n");
            }
            sb.append(t);
        }
        return sb.toString();
    }

    /** 摘要：取正文首段（不足则截断），用于列表与政策卡片展示 */
    private static String buildSummary(String plain) {
        if (StrUtil.isBlank(plain)) {
            return null;
        }
        String first = plain.split("\n")[0].trim();
        if (first.length() >= 20 || plain.indexOf('\n') < 0) {
            return StrUtil.sub(first, 0, SUMMARY_MAX);
        }
        // 首行过短（多为「各有关单位：」这类称呼），并入后续内容
        return StrUtil.sub(plain.replace("\n", " "), 0, SUMMARY_MAX);
    }
    /** 地区名拼接：省/市/区，优先用详情返回的名称字段 */
    private String buildRegion(Map<String, Object> d) {
        String city = str(d.get("cityName"));
        String area = str(d.get("areaName"));
        String province = str(d.get("provinceName"));
        StringBuilder sb = new StringBuilder();
        if (StrUtil.isNotBlank(city)) {
            sb.append(city);
        } else if (StrUtil.isNotBlank(province)) {
            sb.append(province);
        }
        if (StrUtil.isNotBlank(area)) {
            if (sb.length() > 0) {
                sb.append("/");
            }
            sb.append(area);
        }
        return sb.length() > 0 ? sb.toString() : defaultRegion();
    }

    /** 配置城市对应的展示地区（列表接口无地区字段时兜底） */
    private String defaultRegion() {
        return "440300".equals(properties.getCityCode()) ? "深圳市" : properties.getCityCode();
    }

    /**
     * 发布时间归一化为 {@code yyyy-MM-dd}。
     *
     * <p>DaaS 现状：列表返回字符串 {@code "1970-01-01T08:00"}，详情返回数字 {@code 0}，
     * 均为无效值（epoch 0）。此处一律识别并返回 {@code null}，避免前端显示 1970。
     * 待平台修复后本方法自动生效。</p>
     */
    private static String normalizeDate(Object v) {
        if (v == null) {
            return null;
        }
        if (v instanceof Number) {
            long ms = ((Number) v).longValue();
            if (ms <= 0) {
                return null;
            }
            return java.time.Instant.ofEpochMilli(ms)
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate().toString();
        }
        String s = String.valueOf(v).trim();
        if (StrUtil.isBlank(s) || "null".equals(s) || s.startsWith("1970-01-01")) {
            return null;
        }
        return s.length() >= 10 ? s.substring(0, 10) : s;
    }

    /**
     * 取字符串值。
     *
     * <p>注意：hutool 会把 JSON 里的 {@code null} 解析为 {@code JSONNull} 实例而非 Java {@code null}，
     * 直接 {@code String.valueOf} 会得到字面量 {@code "null"}（曾导致地区拼成「深圳市/null」），
     * 故这里统一把 {@code "null"} 归一为 {@code null}。</p>
     */
    private static String str(Object v) {
        if (v == null) {
            return null;
        }
        String s = String.valueOf(v).trim();
        return s.isEmpty() || "null".equals(s) ? null : s;
    }

    // ============================== 内存筛选 ==============================

    private static boolean matchKeyword(PolicyDTO p, String keyword) {
        if (StrUtil.isBlank(keyword)) {
            return true;
        }
        return StrUtil.containsIgnoreCase(p.getTitle(), keyword)
                || StrUtil.containsIgnoreCase(p.getPublishOrg(), keyword);
    }

    private static boolean matchRegion(String policyRegion, String queryRegion) {
        if (StrUtil.isBlank(queryRegion)) {
            return true;
        }
        if (StrUtil.isBlank(policyRegion)) {
            return false;
        }
        return policyRegion.contains(queryRegion) || queryRegion.contains(policyRegion);
    }

    private static boolean hitIndustryKeyword(String title, String industry) {
        return StrUtil.isNotBlank(industry) && StrUtil.isNotBlank(title) && title.contains(industry);
    }

    private static boolean hitQualificationKeyword(String title, String qualifications) {
        if (StrUtil.isBlank(qualifications) || StrUtil.isBlank(title)) {
            return false;
        }
        if (qualifications.contains("高新技术") && title.contains("高新")) {
            return true;
        }
        return qualifications.contains("专精特新") && title.contains("专精特新");
    }

}