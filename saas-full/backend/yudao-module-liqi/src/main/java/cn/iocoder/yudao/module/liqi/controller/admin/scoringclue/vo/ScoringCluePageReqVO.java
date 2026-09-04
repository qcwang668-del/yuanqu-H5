package cn.iocoder.yudao.module.liqi.controller.admin.scoringclue.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 评分线索分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class ScoringCluePageReqVO extends PageParam {

    @Schema(description = "用户名")
    private String userName;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "来源：1=小程序，2=PC端")
    private Integer clueSource;

    @Schema(description = "参与评分公司名称")
    private String companyName;

    @Schema(description = "咨询方式：1=微信咨询，2=电话咨询")
    private Integer contactInformation;

    @Schema(description = "评分时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] scoreTime;

}
