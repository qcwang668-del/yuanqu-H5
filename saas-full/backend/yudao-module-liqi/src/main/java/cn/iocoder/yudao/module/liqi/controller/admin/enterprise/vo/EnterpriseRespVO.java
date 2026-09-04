package cn.iocoder.yudao.module.liqi.controller.admin.enterprise.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

@Schema(description = "管理后台 - 企业库 Response VO")
@Data
public class EnterpriseRespVO {

    @Schema(description = "编号")
    private Long id;

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "法定代表人")
    private String legalPerson;

    @Schema(description = "成立时间")
    private LocalDate establishDate;

    @Schema(description = "注册资本")
    private String registeredCapital;

    @Schema(description = "参保人数")
    private Integer insuredCount;

    @Schema(description = "所属行业")
    private String industry;

    @Schema(description = "注册地址")
    private String registerAddress;

    @Schema(description = "logo 简称")
    private String shortName;

    @Schema(description = "logo 颜色")
    private String logoColor;

    @Schema(description = "统一社会信用代码")
    private String creditCode;

    @Schema(description = "经营状态")
    private String regStatus;

    @Schema(description = "企业类型")
    private String companyOrgType;

}
