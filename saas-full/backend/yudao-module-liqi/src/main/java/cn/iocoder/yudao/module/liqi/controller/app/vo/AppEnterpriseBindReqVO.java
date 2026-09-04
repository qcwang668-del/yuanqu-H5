package cn.iocoder.yudao.module.liqi.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Schema(description = "用户 APP - 绑定企业 Request VO（按企业名称/信用代码调外部工商接口取快照）")
@Data
public class AppEnterpriseBindReqVO {

    @Schema(description = "企业名称或统一社会信用代码", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "企业名称不能为空")
    private String keyword;

}
