package cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 预留信息分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class ReserveInfoPageReqVO extends PageParam {

    @Schema(description = "用户名")
    private String reserveUserName;

    @Schema(description = "手机号")
    private String reservePhone;

    @Schema(description = "来源：1=小程序，2=PC端")
    private Integer source;

    @Schema(description = "项目名称 / 申报内容")
    private String content;

    @Schema(description = "预留信息入口：1=项目详情，4=企业详情")
    private Integer reserveType;

    @Schema(description = "预留方式：1=我要申报，2=微信咨询，3=电话咨询")
    private Integer reserveWay;

    @Schema(description = "预留信息时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] createTime;

}
