package cn.iocoder.yudao.module.liqi.importexport.controller.admin.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 我的导入导出记录 Response VO")
@Data
public class ImportExportRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "文件名称")
    @ExcelProperty("文件名称")
    private String fileName;

    @Schema(description = "类型：0=导入，1=导出")
    @ExcelProperty("类型")
    private Integer type;

    @Schema(description = "模块")
    @ExcelProperty("模块")
    private String module;

    @Schema(description = "状态：0=处理中，1=成功，2=失败")
    @ExcelProperty("状态")
    private Integer status;

    @Schema(description = "文件地址")
    @ExcelProperty("文件地址")
    private String fileUrl;

    @Schema(description = "错误信息")
    @ExcelProperty("错误信息")
    private String errMsg;

    @Schema(description = "操作时间")
    @ExcelProperty("操作时间")
    private LocalDateTime createTime;

}
