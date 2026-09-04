package cn.iocoder.yudao.module.liqi.controller.admin.enterprise.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Schema(description = "管理后台 - 企业库分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class EnterprisePageReqVO extends PageParam {

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "所属行业")
    private String industry;

    @Schema(description = "注册地址（园区关键词）")
    private String registerAddress;

}
