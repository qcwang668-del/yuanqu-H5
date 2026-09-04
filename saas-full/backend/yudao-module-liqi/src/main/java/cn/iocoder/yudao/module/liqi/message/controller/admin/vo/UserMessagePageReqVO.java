package cn.iocoder.yudao.module.liqi.message.controller.admin.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Schema(description = "管理后台 - 推送记录分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserMessagePageReqVO extends PageParam {

    @Schema(description = "会员用户 ID")
    private Long userId;

    @Schema(description = "消息标题（模糊）")
    private String title;

    @Schema(description = "类型：1 政策推送 2 临期提醒 3 系统通知")
    private Integer type;

    @Schema(description = "推送方式：auto/manual")
    private String bizType;

    @Schema(description = "政策来源：external 外部采集 / park 园区发布")
    private String source;

}
