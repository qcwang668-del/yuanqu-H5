package cn.iocoder.yudao.module.liqi.website.controller.admin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 网站配置 Response VO")
@Data
public class WebsiteConfigRespVO {

    @Schema(description = "编号")
    private Long id;

    @Schema(description = "二级域名")
    private String domainName;

    @Schema(description = "重定向域名")
    private String redirectDomainName;

    @Schema(description = "网站备案号")
    private String icpNum;

    @Schema(description = "品牌名称")
    private String brandName;

    @Schema(description = "品牌 LOGO（横向）")
    private String brandLogoHorizontal;

    @Schema(description = "品牌 LOGO（竖向）")
    private String brandLogoVertical;

    @Schema(description = "小程序二维码")
    private String smallProgramQrCode;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
