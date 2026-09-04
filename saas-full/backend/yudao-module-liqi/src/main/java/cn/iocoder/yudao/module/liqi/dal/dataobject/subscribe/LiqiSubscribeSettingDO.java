package cn.iocoder.yudao.module.liqi.dal.dataobject.subscribe;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 订阅推送设置 DO（每个会员一条；精准推送/临期提醒的匹配依据）
 */
@TableName("liqi_subscribe_setting")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiSubscribeSettingDO extends TenantBaseDO {

    @TableId
    private Long id;
    /** 会员用户 ID */
    private Long userId;
    /** 专精特新：1 订阅 0 未订阅 */
    private Integer subZjx;
    /** 研发补贴 */
    private Integer subRd;
    /** 设备更新 */
    private Integer subEquip;
    /** 高企认定 */
    private Integer subHigh;
    /** 创业扶持 */
    private Integer subStartup;
    /** 园区发布 */
    private Integer subPark;
    /** 关注地区 */
    private String region;
    /** 关注行业 */
    private String industry;

}
