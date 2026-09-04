package cn.iocoder.yudao.module.liqi.controller.admin.matchclue.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 匹配线索分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class MatchCluePageReqVO extends PageParam {

    @Schema(description = "用户名")
    private String reserveUserName;

    @Schema(description = "手机号")
    private String reservePhone;

    @Schema(description = "来源：0=小程序，1=PC端")
    private Integer source;

    @Schema(description = "项目名称（申报内容）")
    private String content;

    @Schema(description = "预留信息入口")
    private String reserveType;

    @Schema(description = "预留方式")
    private String reserveWay;

    @Schema(description = "预留信息时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] reserveTime;

}
