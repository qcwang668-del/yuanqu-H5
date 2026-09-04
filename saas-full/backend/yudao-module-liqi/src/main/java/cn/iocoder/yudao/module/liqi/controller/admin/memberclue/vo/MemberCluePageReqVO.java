package cn.iocoder.yudao.module.liqi.controller.admin.memberclue.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 会员线索分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class MemberCluePageReqVO extends PageParam {

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "高企/资质类型：0=高新技术企业，1=科技型中小企业，2=专精特新")
    private Integer clueType;

    @Schema(description = "注册地址")
    private String registerAddress;

    @Schema(description = "线索来源：0=小程序，1=PC端，2=系统匹配")
    private Integer source;

    @Schema(description = "状态：0=待跟进，1=跟进中，2=已转化，3=已关闭")
    private Integer status;

    @Schema(description = "创建时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] createTime;

}
