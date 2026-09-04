package cn.iocoder.yudao.module.liqi.controller.admin.daas.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DaaS 企业基本信息 Response VO（对应平台 QiYeInfoNewVO，企业工商详情 36 个字段）。
 *
 * <p>字段名与平台返回 JSON 保持一致，由 hutool 按名映射；包装类型用于区分「未返回(null)」与「0」。
 */
@Schema(description = "DaaS 企业基本信息 Response VO")
@Data
public class QiYeInfoRespVO {

    @Schema(description = "统一社会信用代码/唯一 id")
    private String entityId;

    @Schema(description = "公司名称")
    private String companyName;

    @Schema(description = "公司曾用名")
    private String companyFormerName;

    @Schema(description = "企业英文名称")
    private String entityEnglishName;

    @Schema(description = "网址")
    private String zcbWeb;

    @Schema(description = "邮箱")
    private String zcbEmail;

    @Schema(description = "法定代表人")
    private String legalName;

    @Schema(description = "注册资本")
    private BigDecimal regCapital;

    @Schema(description = "注册资本币种")
    private String regCapitalType;

    @Schema(description = "经营状态")
    private String entStatus;

    @Schema(description = "注册地址")
    private String regAddress;

    @Schema(description = "行业一级分类编码")
    private Integer industryLv1;

    @Schema(description = "行业一级分类名")
    private String industryLv1Name;

    @Schema(description = "行业二级分类编码")
    private Integer industryLv2;

    @Schema(description = "行业二级分类名")
    private String industryLv2Name;

    @Schema(description = "行业三级分类编码")
    private Integer industryLv3;

    @Schema(description = "行业三级分类名")
    private String industryLv3Name;

    @Schema(description = "行业四级分类编码")
    private Integer industryLv4;

    @Schema(description = "行业四级分类名")
    private String industryLv4Name;

    @Schema(description = "成立日期")
    private String regDate;

    @Schema(description = "工商注册号")
    private String licenseNumber;

    @Schema(description = "企业类型")
    private String zcbComType;

    @Schema(description = "经营期限自")
    private String opFrom;

    @Schema(description = "经营期限至")
    private String opTo;

    @Schema(description = "登记机关")
    private String regOrg;

    @Schema(description = "核准日期")
    private String checkDate;

    @Schema(description = "经营范围")
    private String opScope;

    @Schema(description = "省码")
    private Integer regProvincesCode;

    @Schema(description = "市码")
    private Integer regCityCode;

    @Schema(description = "区码")
    private Integer regDistrictCode;

    @Schema(description = "补贴总金额")
    private BigDecimal subsidyTotalMoney;

    @Schema(description = "参保人数(人员规模)")
    private Integer socialStaffNum;

    @Schema(description = "组织机构代码")
    private String organizationNumber;

    @Schema(description = "企业规模：1 微型 / 2 小型 / 3 中型 / 4 大型")
    private Integer companyScale;

    @Schema(description = "最终展示信息(荣誉、资质等)")
    private List<String> finalShowInfo;

}
