package cn.iocoder.yudao.module.liqi.dal.dataobject.scoringclue;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 力企 - 评分线索 DO（平台管理-评分线索管理）
 */
@TableName("liqi_scoring_clue")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiScoringClueDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 用户名 */
    private String userName;
    /** 手机号 */
    private String phone;
    /** 来源：1=小程序，2=PC端 */
    private Integer clueSource;
    /** 参与评分公司名称 */
    private String companyName;
    /** 咨询方式：1=微信咨询，2=电话咨询 */
    private Integer contactInformation;
    /** 评分时间 */
    private LocalDateTime scoreTime;

}
