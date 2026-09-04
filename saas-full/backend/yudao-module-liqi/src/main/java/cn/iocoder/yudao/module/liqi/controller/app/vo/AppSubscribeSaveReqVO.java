package cn.iocoder.yudao.module.liqi.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "用户 APP - 订阅推送设置保存 Request VO")
@Data
public class AppSubscribeSaveReqVO {

    @Schema(description = "专精特新 1订阅 0不订阅")
    private Integer subZjx = 0;
    @Schema(description = "研发补贴")
    private Integer subRd = 0;
    @Schema(description = "设备更新")
    private Integer subEquip = 0;
    @Schema(description = "高企认定")
    private Integer subHigh = 0;
    @Schema(description = "创业扶持")
    private Integer subStartup = 0;
    @Schema(description = "园区发布")
    private Integer subPark = 0;
    @Schema(description = "关注地区")
    private String region;
    @Schema(description = "关注行业")
    private String industry;

}
