package cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Schema(description = "管理后台 - 园区政策分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class PolicyPageReqVO extends PageParam {

    @Schema(description = "政策标题（模糊）")
    private String title;

    @Schema(description = "类型")
    private String type;

    @Schema(description = "所属园区编号")
    private Long parkId;

    @Schema(description = "分类标签")
    private String category;

    @Schema(description = "状态：0 已上架 1 已下架")
    private Integer status;

}
