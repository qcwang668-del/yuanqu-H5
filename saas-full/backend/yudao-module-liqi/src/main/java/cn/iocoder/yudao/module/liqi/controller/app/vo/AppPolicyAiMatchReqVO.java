package cn.iocoder.yudao.module.liqi.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 用户 APP - 企业政策智能匹配 Request VO（输入企业名，实时调大模型匹配可申报政策）。
 */
@Schema(description = "用户 APP - 企业政策智能匹配 Request VO")
@Data
public class AppPolicyAiMatchReqVO {

    @Schema(description = "企业名称（必填）", requiredMode = Schema.RequiredMode.REQUIRED,
            example = "深圳启程智远网络有限公司")
    @NotBlank(message = "企业名称不能为空")
    private String companyName;

    @Schema(description = "营业收入（万元，可选，填了更准）", example = "5000")
    private Double revenue;

    @Schema(description = "社保人数（可选，填了更准）", example = "100")
    private Integer staffNum;

}
