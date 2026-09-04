package cn.iocoder.yudao.module.liqi.live.controller.admin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Schema(description = "管理后台 - 直播 新增/修改 Request VO")
@Data
public class LiveSaveReqVO {

    @Schema(description = "编号（修改时传）")
    private Long id;

    @Schema(description = "直播标题", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "直播标题不能为空")
    private String title;

    @Schema(description = "讲师/专家")
    private String lecturer;

    @Schema(description = "讲师简介")
    private String lecturerDesc;

    @Schema(description = "封面图")
    private String coverUrl;

    @Schema(description = "直播简介")
    private String summary;

    @Schema(description = "直播间地址")
    private String liveUrl;

    @Schema(description = "回放地址")
    private String replayUrl;

    @Schema(description = "开播时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "状态：0 预告 1 直播中 2 回放 3 已下架")
    private Integer status;

    @Schema(description = "排序")
    private Integer sort;

}
