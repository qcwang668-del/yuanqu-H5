package cn.iocoder.yudao.module.liqi.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Schema(description = "用户 APP - 政策申报创建 Request VO")
@Data
public class AppPolicyApplyCreateReqVO {

    @Schema(description = "外部政策 ID（可空，手动填报场景）")
    private String policyId;

    @Schema(description = "政策标题")
    private String policyTitle;

    @Schema(description = "政策类型")
    private String policyType;

    @Schema(description = "申报企业全称", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "申报企业全称不能为空")
    private String enterpriseName;

    @Schema(description = "联系人", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "联系人不能为空")
    private String contactName;

    @Schema(description = "联系电话", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;

    @Schema(description = "备注")
    private String remark;

}
