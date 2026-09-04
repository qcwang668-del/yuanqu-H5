package cn.iocoder.yudao.module.liqi.message.service;

import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.tenant.core.util.TenantUtils;
import cn.iocoder.yudao.module.liqi.dal.dataobject.bind.LiqiUserEnterpriseBindDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.bind.LiqiUserEnterpriseBindMapper;
import cn.iocoder.yudao.module.liqi.message.controller.admin.vo.ParkPushCandidateVO;
import cn.iocoder.yudao.module.liqi.message.controller.admin.vo.UserMessagePageReqVO;
import cn.iocoder.yudao.module.liqi.message.dal.dataobject.LiqiUserMessageDO;
import cn.iocoder.yudao.module.liqi.message.dal.mysql.LiqiUserMessageMapper;
import cn.iocoder.yudao.module.liqi.policyops.dal.dataobject.LiqiPolicyDO;
import cn.iocoder.yudao.module.liqi.policyops.service.LiqiPolicyService;
import cn.iocoder.yudao.module.liqi.service.app.AppPolicyService;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 力企 - C 端站内消息 Service 实现。
 *
 * <p>两条推送线：① 外部政策定时自动推（source=external, bizType=auto），按绑定企业画像匹配；
 * ② 园区政策运营手动推（source=park, bizType=manual），园区运营在后台选本园区符合企业勾选推送。
 * 订阅能力已下线，自动推送不再读订阅偏好。</p>
 */
@Service
@Validated
public class LiqiUserMessageServiceImpl implements LiqiUserMessageService {

    /** 自动推送只看近 N 天发布的政策 */
    private static final int AUTO_PUBLISH_WITHIN_DAYS = 7;
    private static final String SOURCE_EXTERNAL = "external";
    private static final String SOURCE_PARK = "park";

    @Resource
    private LiqiUserMessageMapper messageMapper;
    @Resource
    private LiqiUserEnterpriseBindMapper bindMapper;
    @Resource
    private AppPolicyService appPolicyService;
    @Resource
    private LiqiPolicyService liqiPolicyService;

    // ---------------- C 端 ----------------
    @Override
    public PageResult<LiqiUserMessageDO> pageMyMessages(Long userId, Integer pageNo, Integer pageSize, String source) {
        PageParam pp = new PageParam();
        pp.setPageNo(pageNo == null ? 1 : pageNo);
        pp.setPageSize(pageSize == null ? 20 : pageSize);
        return messageMapper.selectPageByUser(userId, pp, source);
    }

    @Override
    public Long unreadCount(Long userId) {
        return messageMapper.selectUnreadCount(userId);
    }

    @Override
    public void markRead(Long userId) {
        messageMapper.markReadByUser(userId);
    }

    // ---------------- 运营定向推送（通用：外部/园区） ----------------
    @Override
    public int pushByPolicy(String policyId, String target) {
        String source = isParkPolicy(policyId) ? SOURCE_PARK : SOURCE_EXTERNAL;
        List<LiqiUserEnterpriseBindDO> binds = TenantUtils.executeIgnore(
                () -> bindMapper.selectList(new LambdaQueryWrapperX<>()));
        int[] count = {0};
        for (LiqiUserEnterpriseBindDO bind : binds) {
            TenantUtils.execute(bind.getTenantId(), () -> {
                PolicyDTO policy = appPolicyService.getPolicy(policyId);
                if (policy == null) {
                    return;
                }
                if ("match".equals(target)) {
                    boolean hit = appPolicyService.matchPolicies(bind.getUserId()).stream()
                            .anyMatch(p -> policyId.equals(p.getId()));
                    if (!hit) {
                        return;
                    }
                }
                if (messageMapper.existsByUserAndPolicy(bind.getUserId(), policyId, 1, source)) {
                    return;
                }
                sendPolicyMessage(bind.getUserId(), bind.getEnterpriseName(), policy, "manual", source);
                count[0]++;
            });
        }
        return count[0];
    }

    // ---------------- 园区运营：候选企业预览 + 勾选推送 ----------------
    @Override
    public List<ParkPushCandidateVO> candidatesOfParkPolicy(String policyId) {
        List<ParkPushCandidateVO> result = new ArrayList<>();
        LiqiPolicyDO policy = getParkPolicyDO(policyId);
        if (policy == null || policy.getParkId() == null) {
            return result;
        }
        PolicyDTO policyDto = liqiPolicyService.getParkPolicyDto(policyId);
        // 本园区下所有绑定企业（跨租户）
        List<LiqiUserEnterpriseBindDO> binds = TenantUtils.executeIgnore(
                () -> bindMapper.selectListByPark(policy.getParkId()));
        for (LiqiUserEnterpriseBindDO bind : binds) {
            TenantUtils.execute(bind.getTenantId(), () -> {
                ParkPushCandidateVO vo = new ParkPushCandidateVO();
                vo.setUserId(bind.getUserId());
                vo.setEnterpriseName(bind.getEnterpriseName());
                vo.setLegalPerson(bind.getLegalPerson());
                vo.setIndustry(bind.getSnapshotIndustry());
                vo.setRegion(bind.getSnapshotRegion());
                vo.setParkName(bind.getParkName());
                boolean matched = liqiPolicyService.matchParkPolicies(toSnapshot(bind)).stream()
                        .anyMatch(p -> policyId.equals(p.getId()));
                vo.setMatched(matched);
                vo.setReasons(buildReasons(policyDto, bind));
                vo.setPushed(messageMapper.existsByUserAndPolicy(bind.getUserId(), policyId, 1, SOURCE_PARK));
                result.add(vo);
            });
        }
        // 匹配的排前面
        result.sort((a, b) -> Boolean.compare(Boolean.TRUE.equals(b.getMatched()), Boolean.TRUE.equals(a.getMatched())));
        return result;
    }

    @Override
    public int pushParkPolicyToUsers(String policyId, List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return 0;
        }
        PolicyDTO policy = appPolicyService.getPolicy(policyId);
        if (policy == null) {
            return 0;
        }
        int[] count = {0};
        for (Long uid : userIds) {
            // 跨租户取绑定（含租户 id、企业名）
            LiqiUserEnterpriseBindDO bind = TenantUtils.executeIgnore(() -> bindMapper.selectByUser(uid));
            if (bind == null) {
                continue;
            }
            TenantUtils.execute(bind.getTenantId(), () -> {
                if (messageMapper.existsByUserAndPolicy(uid, policyId, 1, SOURCE_PARK)) {
                    return;
                }
                sendPolicyMessage(uid, bind.getEnterpriseName(), policy, "manual", SOURCE_PARK);
                count[0]++;
            });
        }
        return count[0];
    }

    @Override
    public PageResult<LiqiUserMessageDO> getAdminPage(UserMessagePageReqVO reqVO) {
        return messageMapper.selectAdminPage(reqVO);
    }

    // ---------------- 定时任务：外部政策自动找人 ----------------
    @Override
    public int autoMatchPush() {
        List<LiqiUserEnterpriseBindDO> binds = TenantUtils.executeIgnore(
                () -> bindMapper.selectList(new LambdaQueryWrapperX<>()));
        LocalDate since = LocalDate.now().minusDays(AUTO_PUBLISH_WITHIN_DAYS);
        int[] count = {0};
        for (LiqiUserEnterpriseBindDO bind : binds) {
            TenantUtils.execute(bind.getTenantId(), () -> {
                List<PolicyDTO> matched = appPolicyService.matchPolicies(bind.getUserId());
                for (PolicyDTO p : matched) {
                    // 线一仅自动推外部政策；园区政策由运营手动推（线二）
                    if (isParkPolicy(p.getId())) {
                        continue;
                    }
                    if (!isRecent(p.getPublishDate(), since)) {
                        continue;
                    }
                    if (messageMapper.existsByUserAndPolicy(bind.getUserId(), p.getId(), 1, SOURCE_EXTERNAL)) {
                        continue;
                    }
                    sendPolicyMessage(bind.getUserId(), bind.getEnterpriseName(), p, "auto", SOURCE_EXTERNAL);
                    count[0]++;
                }
            });
        }
        return count[0];
    }

    // ---------------- 内部方法 ----------------
    private void sendPolicyMessage(Long userId, String enterpriseName, PolicyDTO p, String bizType, String source) {
        String title = "为您匹配到可申报政策：" + StrUtil.sub(p.getTitle(), 0, 20);
        StringBuilder content = new StringBuilder();
        content.append("根据您绑定企业「").append(StrUtil.blankToDefault(enterpriseName, "您的企业"))
                .append("」的画像，为您匹配到政策《").append(p.getTitle()).append("》。");
        if (StrUtil.isNotBlank(p.getSubsidyMax())) {
            content.append("最高补贴 ").append(p.getSubsidyMax()).append(" 万元。");
        }
        if (StrUtil.isNotBlank(p.getDeadline())) {
            content.append("申报截止 ").append(p.getDeadline()).append("，请及时申报。");
        }
        LiqiUserMessageDO msg = LiqiUserMessageDO.builder()
                .userId(userId).type(1).title(title).content(content.toString())
                .policyId(p.getId()).policyTitle(p.getTitle()).bizType(bizType).source(source).isRead(0)
                .build();
        messageMapper.insert(msg);
    }

    private LiqiPolicyDO getParkPolicyDO(String policyId) {
        if (!isParkPolicy(policyId)) {
            return null;
        }
        try {
            Long dbId = Long.valueOf(policyId.substring(1)); // 去掉园区政策前缀 "L"
            return liqiPolicyService.getPolicy(dbId);
        } catch (Exception e) {
            return null;
        }
    }

    private static boolean isParkPolicy(String policyId) {
        return policyId != null && policyId.startsWith("L");
    }

    private static EnterpriseSnapshot toSnapshot(LiqiUserEnterpriseBindDO bind) {
        EnterpriseSnapshot s = new EnterpriseSnapshot();
        s.setName(bind.getEnterpriseName());
        s.setCreditCode(bind.getCreditCode());
        s.setRegion(bind.getSnapshotRegion());
        s.setIndustry(bind.getSnapshotIndustry());
        s.setQualifications(bind.getSnapshotQualifications());
        return s;
    }

    /** 匹配理由：地区 / 行业 / 资质 命中项 */
    private List<String> buildReasons(PolicyDTO policy, LiqiUserEnterpriseBindDO bind) {
        List<String> reasons = new ArrayList<>();
        if (policy == null) {
            return reasons;
        }
        if (StrUtil.isNotBlank(policy.getRegion()) && StrUtil.isNotBlank(bind.getSnapshotRegion())
                && (policy.getRegion().contains("全国")
                    || policy.getRegion().contains(bind.getSnapshotRegion())
                    || bind.getSnapshotRegion().contains(policy.getRegion()))) {
            reasons.add("地区匹配：" + bind.getSnapshotRegion());
        }
        if (StrUtil.isNotBlank(policy.getIndustry()) && StrUtil.isNotBlank(bind.getSnapshotIndustry())
                && (policy.getIndustry().contains(bind.getSnapshotIndustry())
                    || bind.getSnapshotIndustry().contains(policy.getIndustry()))) {
            reasons.add("行业匹配：" + bind.getSnapshotIndustry());
        }
        if (policy.getTags() != null && StrUtil.isNotBlank(bind.getSnapshotQualifications())) {
            String qual = bind.getSnapshotQualifications();
            boolean hit = policy.getTags().stream().anyMatch(t ->
                    (t.contains("高企") && qual.contains("高新技术"))
                            || (t.contains("专精特新") && qual.contains("专精特新"))
                            || qual.contains(t));
            if (hit) {
                reasons.add("资质匹配：" + qual);
            }
        }
        return reasons;
    }

    private boolean isRecent(String publishDate, LocalDate since) {
        if (StrUtil.isBlank(publishDate)) {
            return false;
        }
        try {
            return !LocalDate.parse(publishDate).isBefore(since);
        } catch (Exception e) {
            return false;
        }
    }

}
