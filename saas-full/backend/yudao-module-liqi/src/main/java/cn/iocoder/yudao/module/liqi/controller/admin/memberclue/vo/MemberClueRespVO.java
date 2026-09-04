package cn.iocoder.yudao.module.liqi.controller.admin.memberclue.vo;

import cn.idev.excel.annotation.ExcelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 会员线索 Response VO")
@Data
public class MemberClueRespVO {

    @Schema(description = "编号")
    @ExcelProperty("编号")
    private Long id;

    @Schema(description = "企业名称")
    @ExcelProperty("企业名称")
    private String enterpriseName;

    @Schema(description = "高企/资质类型：0=高新技术企业，1=科技型中小企业，2=专精特新")
    @ExcelProperty("高企/资质类型")
    private Integer clueType;

    @Schema(description = "注册地址")
    @ExcelProperty("注册地址")
    private String registerAddress;

    @Schema(description = "符合条件")
    @ExcelProperty("符合条件")
    private String matchCondition;

    @Schema(description = "线索来源：0=小程序，1=PC端，2=系统匹配")
    @ExcelProperty("线索来源")
    private Integer source;

    @Schema(description = "状态：0=待跟进，1=跟进中，2=已转化，3=已关闭")
    @ExcelProperty("状态")
    private Integer status;

    @Schema(description = "创建时间")
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

}
