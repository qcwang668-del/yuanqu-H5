package cn.iocoder.yudao.module.liqi.dal.dataobject.memberclue;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 会员线索 DO（企业管理-会员线索管理）
 *
 * <p>逆向自门户「会员线索管理」视图（localStorage: memberCluesMgSearchInfo，
 * 接口 /system/qiye/high-tech-enterprise/clue/page）。</p>
 */
@TableName("liqi_member_clue")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiMemberClueDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 企业名称 */
    private String enterpriseName;
    /** 高企/资质类型：0=高新技术企业，1=科技型中小企业，2=专精特新 */
    private Integer clueType;
    /** 注册地址 */
    private String registerAddress;
    /** 符合条件（命中的政策/资质说明） */
    private String matchCondition;
    /** 线索来源：0=小程序，1=PC端，2=系统匹配 */
    private Integer source;
    /** 状态：0=待跟进，1=跟进中，2=已转化，3=已关闭 */
    private Integer status;

}
