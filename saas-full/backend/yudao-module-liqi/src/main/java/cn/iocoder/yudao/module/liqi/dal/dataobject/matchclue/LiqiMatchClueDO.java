package cn.iocoder.yudao.module.liqi.dal.dataobject.matchclue;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 力企 - 匹配线索 DO（平台管理-匹配线索管理）
 */
@TableName("liqi_match_clue")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiMatchClueDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 预留用户名 */
    private String reserveUserName;
    /** 预留手机号 */
    private String reservePhone;
    /** 来源：0=小程序，1=PC端 */
    private Integer source;
    /** 公司名称 */
    private String company;
    /** 申报内容（项目名称） */
    private String content;
    /** 预留信息入口 */
    private String reserveType;
    /** 预留方式 */
    private String reserveWay;
    /** 预留信息时间 */
    private LocalDateTime reserveTime;
    /** 推荐人 */
    private String recommendUserName;

}
