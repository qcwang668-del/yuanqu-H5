package cn.iocoder.yudao.module.liqi.controller.admin.matchclue.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 匹配线索 Response VO")
@Data
public class MatchClueRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "用户名")
    @ExcelProperty("用户名")
    private String reserveUserName;

    @Schema(description = "手机号")
    @ExcelProperty("手机号")
    private String reservePhone;

    @Schema(description = "来源：0=小程序，1=PC端")
    @ExcelProperty("来源")
    private Integer source;

    @Schema(description = "公司名称")
    @ExcelProperty("公司名称")
    private String company;

    @Schema(description = "申报内容")
    @ExcelProperty("申报内容")
    private String content;

    @Schema(description = "预留信息入口")
    @ExcelProperty("预留信息入口")
    private String reserveType;

    @Schema(description = "预留方式")
    @ExcelProperty("预留方式")
    private String reserveWay;

    @Schema(description = "预留信息时间")
    @ExcelProperty("预留信息时间")
    private LocalDateTime reserveTime;

    @Schema(description = "推荐人")
    @ExcelProperty("推荐人")
    private String recommendUserName;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
