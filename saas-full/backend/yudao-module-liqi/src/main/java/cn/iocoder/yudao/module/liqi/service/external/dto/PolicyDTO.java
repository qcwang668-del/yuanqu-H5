package cn.iocoder.yudao.module.liqi.service.external.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 政策数据传输对象（来自外部政策接口，本地不落库）
 *
 * type 取值：
 *  project   政策项目
 *  original  政策原文
 *  public    公示公告
 *  park      园区发布
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDTO {

    /** 外部政策 ID（真实接口返回；Mock 阶段为内置编号字符串） */
    private String id;
    /** 政策标题 */
    private String title;
    /** 类型：project / original / public / park */
    private String type;
    /** 最高补贴（万元），无补贴为 null */
    private String subsidyMax;
    /** 所属地区，如 深圳市/南山区/全国 */
    private String region;
    /** 所属行业，如 科技服务 */
    private String industry;
    /** 分类标签，如 专精特新/研发投入/技术改造 */
    private List<String> tags;
    /** 截止日期（yyyy-MM-dd），长期有效为 null */
    private String deadline;
    /** 剩余天数（由发布方/计算得出，仅展示用） */
    private Integer remainDays;
    /** 发布部门/来源 */
    private String publishOrg;
    /** 发布日期（yyyy-MM-dd） */
    private String publishDate;
    /** 园区名称（type=park 时） */
    private String parkName;
    /** 摘要 */
    private String summary;
    /** 政策正文（详情接口返回，列表可为 null） */
    private String content;
    /** 附件名称列表 */
    private List<String> attachments;
    /** 外部原文链接 */
    private String sourceUrl;

}
