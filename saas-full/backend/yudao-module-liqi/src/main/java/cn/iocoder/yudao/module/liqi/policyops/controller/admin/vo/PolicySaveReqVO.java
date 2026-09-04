package cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDate;

@Schema(description = "管理后台 - 园区政策 新增/修改 Request VO")
@Data
public class PolicySaveReqVO {

    @Schema(description = "编号（修改时传）")
    private Long id;

    @Schema(description = "政策标题", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "政策标题不能为空")
    private String title;

    @Schema(description = "所属园区编号")
    private Long parkId;

    @Schema(description = "园区/发布主体名称")
    private String parkName;

    @Schema(description = "最高补贴（万元）")
    private String subsidyMax;

    @Schema(description = "所属地区")
    private String region;

    @Schema(description = "所属行业")
    private String industry;

    @Schema(description = "主分类标签")
    private String category;

    @Schema(description = "标签（; 分隔）")
    private String tags;

    @Schema(description = "申报截止日期")
    private LocalDate deadline;

    @Schema(description = "发布部门/来源")
    private String publishOrg;

    @Schema(description = "发布日期")
    private LocalDate publishDate;

    @Schema(description = "摘要")
    private String summary;

    @Schema(description = "政策正文")
    private String content;

    @Schema(description = "外部原文链接")
    private String sourceUrl;

    @Schema(description = "申报联系人")
    private String contactName;

    @Schema(description = "申报咨询电话")
    private String contactPhone;

    @Schema(description = "可见范围：all/park/region")
    private String visibleScope;

    @Schema(description = "状态：0 已上架 1 已下架")
    private Integer status;

}
