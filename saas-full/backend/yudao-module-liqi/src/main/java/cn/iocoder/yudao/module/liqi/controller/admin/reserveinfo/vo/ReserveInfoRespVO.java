package cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 预留信息 Response VO")
@Data
public class ReserveInfoRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "用户名")
    @ExcelProperty("用户名")
    private String reserveUserName;

    @Schema(description = "手机号")
    @ExcelProperty("手机号")
    private String reservePhone;

    @Schema(description = "来源：1=小程序，2=PC端")
    @ExcelProperty("来源")
    private Integer source;

    @Schema(description = "公司名称")
    @ExcelProperty("公司名称")
    private String company;

    @Schema(description = "公司实体编号")
    private Long entityId;

    @Schema(description = "申报内容")
    @ExcelProperty("申报内容")
    private String content;

    @Schema(description = "预留信息入口：1=项目详情，4=企业详情")
    @ExcelProperty("预留信息入口")
    private Integer reserveType;

    @Schema(description = "预留方式：1=我要申报，2=微信咨询，3=电话咨询")
    @ExcelProperty("预留方式")
    private Integer reserveWay;

    @Schema(description = "关联业务编号")
    private Long relationId;

    @Schema(description = "推荐人")
    @ExcelProperty("推荐人")
    private String recommendUserName;

    @Schema(description = "预留信息时间")
    @ExcelProperty("预留信息时间")
    private LocalDateTime updateTime;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
