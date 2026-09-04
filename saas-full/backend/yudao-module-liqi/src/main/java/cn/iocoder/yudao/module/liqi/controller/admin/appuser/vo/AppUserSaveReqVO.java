package cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - APP 用户新增/修改 Request VO")
@Data
public class AppUserSaveReqVO {

    @Schema(description = "编号")
    private Long id;

    @Schema(description = "用户名")
    private String userName;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "来源：0=小程序，1=PC端")
    private Integer source;

    @Schema(description = "维护企业")
    private String maintainEnterprise;

    @Schema(description = "推广用户量")
    private Integer promoteCount;

    @Schema(description = "一级推广人")
    private String firstPromoter;

    @Schema(description = "二级推广人")
    private String secondPromoter;

    @Schema(description = "注册时间")
    private LocalDateTime registerTime;

    @Schema(description = "最近登录时间")
    private LocalDateTime lastLoginTime;

}
