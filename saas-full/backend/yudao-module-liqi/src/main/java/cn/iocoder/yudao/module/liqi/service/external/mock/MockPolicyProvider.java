package cn.iocoder.yudao.module.liqi.service.external.mock;

import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.external.PolicyProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 政策 Provider 的 Mock 实现：内置示例政策（与 H5 演示页一致）。
 *
 * <p>仅在未配置真实 PolicyProvider、且非 prod 环境时生效。
 * 真实政策接口到位后，新增 RemotePolicyProvider（@Component + @Primary 或 @ConditionalOnProperty）
 * 即可替换本实现，上层零改动。</p>
 */
@Component
@Profile("!prod")
@ConditionalOnMissingBean(name = "remotePolicyProvider")
public class MockPolicyProvider implements PolicyProvider {

    private final List<PolicyDTO> store = new ArrayList<>();

    @PostConstruct
    void init() {
        store.add(p("P1001", "2026年专业技术服务与事故调查统计分技术委员会委员人选征集（第一届）",
                "project", null, "全国", "专业技术服务", tags("技术改造"),
                "2026-09-30", 30, "中华人民共和国应急管理部", "2026-08-27", null,
                "面向行业内专家征集委员人选，参与专业技术服务与事故调查统计相关标准制修订。"));
        store.add(p("P1002", "2026年高等学校电子信息类优质数字教材建设项目（第二批）",
                "project", "3.00", "全国", "电子信息", tags("研发投入"),
                "2026-10-03", 33, "中国电子学会", "2026-08-25", null,
                "支持高校电子信息类数字教材建设，入选项目给予建设经费补助。"));
        store.add(p("P1003", "2027年宝安区创业扶持补贴申报",
                "project", "20.00", "深圳市/宝安区", "综合", tags("创业扶持"),
                "2026-12-31", 120, "宝安区人力资源局", "2026-08-20", null,
                "面向宝安区初次创业的各类人员，给予一次性创业扶持补贴及场地租金补贴。"));
        store.add(p("P1004", "2026年专精特新中小企业认定及奖励申报",
                "project", "50.00", "深圳市", "制造业", tags("专精特新"),
                "2026-10-15", 45, "深圳市工业和信息化局", "2026-08-18", null,
                "对新认定的专精特新中小企业、专精特新「小巨人」企业给予分级奖励。"));
        store.add(p("P1005", "国家高新技术企业认定奖补（2026 年度）",
                "project", "30.00", "深圳市/南山区", "科技服务", tags("高企认定", "研发投入"),
                "2026-09-20", 20, "南山区科技创新局", "2026-08-15", null,
                "对首次认定及重新认定的国家高新技术企业给予奖励，并支持研发费用加计扣除。"));
        store.add(p("P1006", "技术改造投资补贴项目申报",
                "project", "100.00", "深圳市", "制造业", tags("技术改造", "设备更新"),
                "2026-09-03", 3, "深圳市工业和信息化局", "2026-08-10", null,
                "对企业技术改造设备投资按比例给予事后补助，单个项目最高 100 万元。"));
        store.add(p("P1007", "研发费用加计扣除政策（汇算清缴）",
                "original", null, "全国", "综合", tags("研发投入", "研发补贴"),
                null, null, "国家税务总局", "2026-01-01", null,
                "企业开展研发活动中实际发生的研发费用，未形成无形资产的按 100% 加计扣除。"));
        store.add(p("P1008", "关于进一步支持小微企业融资的若干措施",
                "original", null, "全国", "综合", tags("创业扶持"),
                null, null, "国务院办公厅", "2026-03-12", null,
                "加大对小微企业信贷支持力度，落实普惠小微贷款支持工具。"));
        store.add(p("P1009", "2026年第二批拟认定高新技术企业名单公示",
                "public", null, "深圳市", "科技服务", tags("高企认定"),
                "2026-09-10", 10, "深圳市科技创新委员会", "2026-08-28", null,
                "现将 2026 年第二批拟认定高新技术企业名单予以公示，公示期 10 个工作日。"));
        store.add(p("P1010", "专精特新「小巨人」企业复核结果公示",
                "public", null, "全国", "制造业", tags("专精特新"),
                "2026-09-05", 5, "工业和信息化部", "2026-08-26", null,
                "对第一批、第二批专精特新「小巨人」企业复核结果进行公示。"));
        store.add(p("P2001", "深圳湾生态科技园 2026 年入园企业租金补贴申报",
                "park", "15.00", "深圳市/南山区", "科技服务", tags("园区发布", "创业扶持"),
                "2026-09-30", 33, "深圳湾生态科技园", "2026-08-27", "深圳湾生态科技园",
                "面向新入园的科技型中小企业，按实际租金给予最高 50% 补贴，单个企业最高 15 万元。",
                "【项目简介】面向南山区内符合条件的入园/意向企业，按实际租金给予补贴。\n一、面向对象：深圳市南山区内符合条件的入园/意向科技型中小企业。\n二、补贴标准：按实际租金最高 50%，单企业最高 15 万元。\n三、申报材料：租赁合同、租金发票、营业执照、上年度纳税证明。"));
        store.add(p("P2002", "广州天河智慧城 2026 研发投入后补助（园区专项）",
                "park", "20.00", "广州市/天河区", "软件和信息技术", tags("园区发布", "研发补贴"),
                "2026-10-20", 50, "广州天河智慧城", "2026-08-22", "广州天河智慧城",
                "对园区内科技企业年度研发投入给予后补助，最高 20 万元。"));
        store.add(p("P2003", "北京朝阳 CBD 企业设备更新奖励",
                "park", "10.00", "北京市/朝阳区", "现代服务", tags("园区发布", "设备更新"),
                "2026-11-15", 76, "北京朝阳CBD", "2026-08-12", "北京朝阳CBD",
                "鼓励园区企业开展生产/办公设备更新，按投入给予奖励。"));
    }

    @Override
    public PageResult<PolicyDTO> pagePolicy(PolicyQuery q) {
        List<PolicyDTO> list = store.stream()
                .filter(x -> StrUtil.isBlank(q.getType()) || q.getType().equals(x.getType()))
                .filter(x -> StrUtil.isBlank(q.getKeyword())
                        || StrUtil.contains(x.getTitle(), q.getKeyword())
                        || (x.getSummary() != null && StrUtil.contains(x.getSummary(), q.getKeyword())))
                .filter(x -> StrUtil.isBlank(q.getRegion()) || matchRegion(x.getRegion(), q.getRegion()))
                .filter(x -> StrUtil.isBlank(q.getIndustry())
                        || (x.getIndustry() != null && x.getIndustry().contains(q.getIndustry())))
                .filter(x -> StrUtil.isBlank(q.getCategory())
                        || (x.getTags() != null && x.getTags().contains(q.getCategory())))
                .sorted(Comparator.comparing(PolicyDTO::getPublishDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
        int total = list.size();
        int from = Math.max(0, (q.getPageNo() - 1) * q.getPageSize());
        int to = Math.min(total, from + q.getPageSize());
        List<PolicyDTO> page = from >= total ? new ArrayList<>() : list.subList(from, to);
        return new PageResult<>(page, (long) total);
    }

    @Override
    public PolicyDTO getPolicy(String id) {
        return store.stream().filter(x -> x.getId().equals(id)).findFirst().orElse(null);
    }

    @Override
    public List<PolicyDTO> matchPolicies(EnterpriseSnapshot s) {
        if (s == null) {
            return new ArrayList<>();
        }
        return store.stream()
                .filter(x -> "project".equals(x.getType()) || "park".equals(x.getType()))
                .filter(x -> matchRegion(x.getRegion(), s.getRegion())
                        || (StrUtil.isNotBlank(s.getIndustry()) && x.getIndustry() != null
                            && (x.getIndustry().contains(s.getIndustry()) || s.getIndustry().contains(x.getIndustry())))
                        || matchQualification(x.getTags(), s.getQualifications()))
                .sorted(Comparator.comparing(PolicyDTO::getRemainDays,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(10)
                .collect(Collectors.toList());
    }

    /** 地区命中：政策地区为"全国"或包含企业地区省/市，或企业地区包含政策地区 */
    private boolean matchRegion(String policyRegion, String userRegion) {
        if (StrUtil.isBlank(policyRegion) || StrUtil.isBlank(userRegion)) {
            return false;
        }
        if (policyRegion.contains("全国")) {
            return true;
        }
        return policyRegion.contains(userRegion) || userRegion.contains(policyRegion);
    }

    /** 资质命中：政策标签与企业资质有交集（如 高企认定↔高新技术企业） */
    private boolean matchQualification(List<String> tags, String qualifications) {
        if (tags == null || StrUtil.isBlank(qualifications)) {
            return false;
        }
        return tags.stream().anyMatch(t -> {
            if (t.contains("高企") && qualifications.contains("高新技术")) return true;
            if (t.contains("专精特新") && qualifications.contains("专精特新")) return true;
            return qualifications.contains(t);
        });
    }

    private static List<String> tags(String... t) {
        return new ArrayList<>(Arrays.asList(t));
    }

    private static PolicyDTO p(String id, String title, String type, String subsidyMax,
                               String region, String industry, List<String> tags, String deadline,
                               Integer remainDays, String org, String publishDate, String parkName,
                               String summary) {
        return p(id, title, type, subsidyMax, region, industry, tags, deadline, remainDays,
                org, publishDate, parkName, summary, summary);
    }

    private static PolicyDTO p(String id, String title, String type, String subsidyMax,
                               String region, String industry, List<String> tags, String deadline,
                               Integer remainDays, String org, String publishDate, String parkName,
                               String summary, String content) {
        return PolicyDTO.builder()
                .id(id).title(title).type(type).subsidyMax(subsidyMax)
                .region(region).industry(industry).tags(tags).deadline(deadline)
                .remainDays(remainDays).publishOrg(org).publishDate(publishDate)
                .parkName(parkName).summary(summary).content(content)
                .attachments(new ArrayList<>())
                .sourceUrl("").build();
    }

}
