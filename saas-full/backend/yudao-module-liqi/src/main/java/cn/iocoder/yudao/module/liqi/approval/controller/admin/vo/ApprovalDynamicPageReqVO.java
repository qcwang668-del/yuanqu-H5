package cn.iocoder.yudao.module.liqi.approval.controller.admin.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 企业获批动态分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalDynamicPageReqVO extends PageParam {

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "统一社会信用代码")
    private String creditCode;

    @Schema(description = "法定代表人")
    private String legalPerson;

    @Schema(description = "获批项目")
    private String approvalProject;

    @Schema(description = "状态：0=正常，1=异常")
    private Integer status;

    @Schema(description = "获批时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] approvalTime;

}
