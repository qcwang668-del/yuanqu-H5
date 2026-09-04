package cn.iocoder.yudao.module.liqi.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Schema(description = "用户 APP - 政策收藏 Request VO")
@Data
public class AppFavoriteReqVO {

    @Schema(description = "外部政策 ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "政策 ID 不能为空")
    private String policyId;

    @Schema(description = "政策标题（快照）")
    private String policyTitle;

    @Schema(description = "政策类型")
    private String policyType;

    @Schema(description = "发布部门/园区")
    private String publishOrg;

}
