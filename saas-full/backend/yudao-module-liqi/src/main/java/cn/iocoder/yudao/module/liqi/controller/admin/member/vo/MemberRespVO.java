package cn.iocoder.yudao.module.liqi.controller.admin.member.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 会员 Response VO")
@Data
public class MemberRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "企业名称")
    @ExcelProperty("企业名称")
    private String enterpriseName;

    @Schema(description = "法人")
    @ExcelProperty("法人")
    private String legalPerson;

    @Schema(description = "注册地址")
    @ExcelProperty("注册地址")
    private String registerAddress;

    @Schema(description = "手机号")
    @ExcelProperty("手机号")
    private String phone;

    @Schema(description = "企业负责人姓名")
    @ExcelProperty("企业负责人姓名")
    private String responsiblePersonName;

    @Schema(description = "企业负责人联系方式")
    @ExcelProperty("企业负责人联系方式")
    private String responsiblePersonPhone;

    @Schema(description = "企业对接人姓名")
    @ExcelProperty("企业对接人姓名")
    private String contactPersonName;

    @Schema(description = "企业对接人联系方式")
    @ExcelProperty("企业对接人联系方式")
    private String contactPersonPhone;

    @Schema(description = "是否推送客户：0=否，1=是")
    @ExcelProperty("是否推送客户")
    private Integer isPushedCustomer;

    @Schema(description = "创建人姓名")
    @ExcelProperty("创建人")
    private String creatorName;

    @Schema(description = "创建时间")
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

}
