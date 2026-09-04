package cn.iocoder.yudao.module.liqi.dal.dataobject.agent;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 智能体对话消息 DO（智能体广场）
 */
@TableName("liqi_agent_message")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiAgentMessageDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 会话编号 {@link LiqiAgentConversationDO#getId()} */
    private Long conversationId;
    /** 角色：user / assistant / tool */
    private String role;
    /** 文本内容 */
    private String content;
    /** 工具调用记录（JSON 数组，证据留痕：调了哪个 MCP 工具、入参、原始返回摘要） */
    private String toolCalls;

}
