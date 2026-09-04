package cn.iocoder.yudao.module.liqi.dal.dataobject.favorite;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 政策收藏 DO（C 端用户收藏；政策本体来自外部接口，仅存外部 ID + 标题快照）
 */
@TableName("liqi_policy_favorite")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiPolicyFavoriteDO extends TenantBaseDO {

    @TableId
    private Long id;
    /** 会员用户 ID（member_user.id） */
    private Long userId;
    /** 外部政策 ID */
    private String policyId;
    /** 政策标题快照（外部政策下线后仍可展示） */
    private String policyTitle;
    /** 政策类型：project/original/public/park */
    private String policyType;
    /** 发布部门/园区快照 */
    private String publishOrg;

}
