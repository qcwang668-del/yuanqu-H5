package cn.iocoder.yudao.module.liqi.dal.dataobject.bind;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 用户企业绑定 DO（绑定外部企业时，快照地区/行业/资质，供智能匹配/精准推送离线使用）
 */
@TableName("liqi_user_enterprise_bind")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiUserEnterpriseBindDO extends TenantBaseDO {

    @TableId
    private Long id;
    /** 会员用户 ID */
    private Long userId;
    /** 企业名称 */
    private String enterpriseName;
    /** 统一社会信用代码 */
    private String creditCode;
    /** 所属园区 liqi_park.id（绑定时按企业地区自动匹配，可空；运营可改） */
    private Long parkId;
    /** 所属园区名称快照 */
    private String parkName;
    /** 法定代表人（快照） */
    private String legalPerson;
    /** 地区快照（如 深圳市/南山区） */
    private String snapshotRegion;
    /** 行业快照 */
    private String snapshotIndustry;
    /** 资质快照（高新技术企业;专精特新 等） */
    private String snapshotQualifications;

}
