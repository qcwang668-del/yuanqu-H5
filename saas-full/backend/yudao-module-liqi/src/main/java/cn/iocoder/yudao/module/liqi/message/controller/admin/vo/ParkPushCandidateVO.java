package cn.iocoder.yudao.module.liqi.message.controller.admin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 园区政策推送 - 候选企业 VO（园区运营预览名单用）
 */
@Data
@Schema(description = "管理后台 - 园区政策推送候选企业 VO")
public class ParkPushCandidateVO {

    @Schema(description = "会员用户 ID（勾选推送用）")
    private Long userId;

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "法定代表人")
    private String legalPerson;

    @Schema(description = "所属行业")
    private String industry;

    @Schema(description = "所属地区")
    private String region;

    @Schema(description = "所属园区")
    private String parkName;

    @Schema(description = "是否画像匹配该政策")
    private Boolean matched;

    @Schema(description = "匹配理由（地区/行业/资质命中项）")
    private List<String> reasons;

    @Schema(description = "是否已推送过该政策")
    private Boolean pushed;

}
