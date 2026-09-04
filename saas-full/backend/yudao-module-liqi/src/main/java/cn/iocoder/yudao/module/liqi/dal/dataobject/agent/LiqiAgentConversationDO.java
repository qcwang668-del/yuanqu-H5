package cn.iocoder.yudao.module.liqi.dal.dataobject.agent;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 智能体会话 DO（智能体广场）
 */
@TableName("liqi_agent_conversation")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiAgentConversationDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 智能体编号 {@link LiqiAgentDO#getId()} */
    private Long agentId;
    /** 发起用户编号 */
    private Long userId;
    /** 会话标题（默认取首条消息前若干字） */
    private String title;

}
