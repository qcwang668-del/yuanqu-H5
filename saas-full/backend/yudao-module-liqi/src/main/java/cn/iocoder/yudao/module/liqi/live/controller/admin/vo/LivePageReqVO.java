package cn.iocoder.yudao.module.liqi.live.controller.admin.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Schema(description = "管理后台 - 直播分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class LivePageReqVO extends PageParam {

    @Schema(description = "直播标题（模糊）")
    private String title;

    @Schema(description = "讲师（模糊）")
    private String lecturer;

    @Schema(description = "状态：0 预告 1 直播中 2 回放 3 已下架")
    private Integer status;

}
