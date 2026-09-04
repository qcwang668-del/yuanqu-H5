package cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 企业库 · 股东信息 DO（天眼查回填）
 */
@TableName("liqi_enterprise_shareholder")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiEnterpriseShareholderDO extends TenantBaseDO {

    @TableId
    private Long id;
    /** 企业编号 */
    private Long enterpriseId;
    /** 股东名称 */
    private String name;
    /** 持股比例 */
    private String percent;
    /** 认缴出资额 */
    private String amount;
    /** 股东类型 */
    private String shareholderType;

}
