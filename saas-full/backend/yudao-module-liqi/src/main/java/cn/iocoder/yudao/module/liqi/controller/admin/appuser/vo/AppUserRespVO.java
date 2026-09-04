package cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - APP 用户 Response VO")
@Data
public class AppUserRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "用户名")
    @ExcelProperty("用户名")
    private String userName;

    @Schema(description = "手机号")
    @ExcelProperty("手机号")
    private String phone;

    @Schema(description = "来源：0=小程序，1=PC端")
    @ExcelProperty("来源")
    private Integer source;

    @Schema(description = "维护企业")
    @ExcelProperty("维护企业")
    private String maintainEnterprise;

    @Schema(description = "推广用户量")
    @ExcelProperty("推广用户量")
    private Integer promoteCount;

    @Schema(description = "一级推广人")
    @ExcelProperty("一级推广人")
    private String firstPromoter;

    @Schema(description = "二级推广人")
    @ExcelProperty("二级推广人")
    private String secondPromoter;

    @Schema(description = "注册时间")
    @ExcelProperty("注册时间")
    private LocalDateTime registerTime;

    @Schema(description = "最近登录时间")
    @ExcelProperty("最近登录时间")
    private LocalDateTime lastLoginTime;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
