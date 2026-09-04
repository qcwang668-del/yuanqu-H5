package cn.iocoder.yudao.module.liqi.controller.admin.member.vo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Schema(description = "管理后台 - 会员分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class MemberPageReqVO extends PageParam {

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "是否推送客户：0=否，1=是")
    private Integer isPushedCustomer;

    @Schema(description = "关联园区编号（选择后按园区地址关键词筛选注册地址）")
    private Long parkId;

    /** 内部使用：由 parkId 解析出的园区地址关键词，用于 LIKE 匹配注册地址（不对外暴露） */
    private String registerAddressKeyword;

}
