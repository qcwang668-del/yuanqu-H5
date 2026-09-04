package cn.iocoder.yudao.module.liqi.controller.admin.scoringclue.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 评分线索 Response VO")
@Data
public class ScoringClueRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "用户名")
    @ExcelProperty("用户名")
    private String userName;

    @Schema(description = "手机号")
    @ExcelProperty("手机号")
    private String phone;

    @Schema(description = "来源：1=小程序，2=PC端")
    @ExcelProperty("来源")
    private Integer clueSource;

    @Schema(description = "参与评分公司名称")
    @ExcelProperty("公司名称")
    private String companyName;

    @Schema(description = "咨询方式：1=微信咨询，2=电话咨询")
    @ExcelProperty("咨询方式")
    private Integer contactInformation;

    @Schema(description = "评分时间")
    @ExcelProperty("评分时间")
    private LocalDateTime scoreTime;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
