package cn.iocoder.yudao.module.liqi.controller.admin.park.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "管理后台 - 园区 Response VO")
@Data
public class ParkRespVO {

    @Schema(description = "编号")
    private Long id;

    @Schema(description = "园区名称")
    private String parkName;

    @Schema(description = "地址匹配关键词")
    private String addressKeyword;

    @Schema(description = "城市")
    private String city;

}
