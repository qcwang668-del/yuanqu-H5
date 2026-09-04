package cn.iocoder.yudao.module.liqi.service.bigmodel.dto;

import lombok.Data;

import java.util.List;

/**
 * 企业政策智能匹配结果（透传 AISpider 大模型服务返回，字段原样保留）。
 *
 * <p>对应接口 {@code POST /api/bigmodel/company_policy_match/submit-task-sync/} 的 {@code result} 节点。
 */
@Data
public class PolicyMatchResult {

    /** 企业名称（回显） */
    private String company;

    /** 匹配到的政策总数 */
    private Integer total;

    /** 匹配政策列表（已按大模型综合得分排序） */
    private List<PolicyMatchItem> list;

    /**
     * 单条匹配政策。
     */
    @Data
    public static class PolicyMatchItem {

        /** 政策 / 项目名称 */
        private String projectName;

        /** 政策 / 项目 ID（外部大模型平台的项目 id） */
        private String projectId;

        /** 发布时间（ISO 字符串，如 2026-01-07T00:00:00） */
        private String publishTime;

        /** 政策级别：国家级 / 省级 / 市级 / 区级 等 */
        private String rank;

        /** 地区 */
        private String area;

        /** 向量检索得分（0~1） */
        private Double vectorScore;

        /** LLM 综合评估得分（0~1） */
        private Double llmScore;

        /** 匹配等级结论，如「高度匹配，可直接申报」 */
        private String matchLevel;

        /** 风险提示 / 申报注意事项 */
        private String riskNotes;

        /** 5 维度打分 */
        private Scores scores;

        /** 5 维度评估理由（自然语言） */
        private DimensionReasoning dimensionReasoning;
    }

    /**
     * 5 维度打分（均为 0~1）。
     */
    @Data
    public static class Scores {

        /** 行业匹配 */
        private Double industryMatch;

        /** 能力匹配 */
        private Double capabilityMatch;

        /** 资质 / 信誉匹配 */
        private Double certMatch;

        /** 地区匹配 */
        private Double regionMatch;

        /** 规模匹配 */
        private Double scaleMatch;
    }

    /**
     * 5 维度评估理由。
     */
    @Data
    public static class DimensionReasoning {

        /** 行业匹配理由 */
        private String industry;

        /** 能力匹配理由 */
        private String capability;

        /** 资质 / 信誉匹配理由 */
        private String cert;

        /** 地区匹配理由 */
        private String region;

        /** 规模匹配理由 */
        private String scale;
    }

}
