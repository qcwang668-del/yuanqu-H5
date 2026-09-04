package cn.iocoder.yudao.module.liqi.importexport.controller.admin.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 我的导入导出记录分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class ImportExportPageReqVO extends PageParam {

    @Schema(description = "文件名称")
    private String fileName;

    @Schema(description = "类型：0=导入，1=导出")
    private Integer type;

    @Schema(description = "模块")
    private String module;

    @Schema(description = "状态：0=处理中，1=成功，2=失败")
    private Integer status;

    @Schema(description = "创建时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] createTime;

}
