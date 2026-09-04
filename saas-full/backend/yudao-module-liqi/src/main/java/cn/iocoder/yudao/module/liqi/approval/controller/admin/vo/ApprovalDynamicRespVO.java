package cn.iocoder.yudao.module.liqi.approval.controller.admin.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 企业获批动态 Response VO")
@Data
public class ApprovalDynamicRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "企业名称")
    @ExcelProperty("企业名称")
    private String enterpriseName;

    @Schema(description = "统一社会信用代码")
    @ExcelProperty("统一社会信用代码")
    private String creditCode;

    @Schema(description = "法定代表人")
    @ExcelProperty("法定代表人")
    private String legalPerson;

    @Schema(description = "获批项目")
    @ExcelProperty("获批项目")
    private String approvalProject;

    @Schema(description = "获批时间")
    @ExcelProperty("获批时间")
    private LocalDateTime approvalTime;

    @Schema(description = "状态：0=正常，1=异常")
    @ExcelProperty("状态")
    private Integer status;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
