package cn.iocoder.yudao.module.liqi.service.agent;

import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentConversationDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentMessageDO;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * 力企 - 智能体广场 Service
 */
public interface LiqiAgentService {

    /** 广场：获取启用中的智能体列表 */
    List<LiqiAgentDO> getEnabledAgentList();

    /** 获取当前用户的会话列表（可按智能体过滤） */
    List<LiqiAgentConversationDO> getConversationList(Long agentId);

    /** 获取某会话的消息列表 */
    List<LiqiAgentMessageDO> getMessageList(Long conversationId);

    /** 新建会话，返回会话编号 */
    Long createConversation(Long agentId, String title);

    /**
     * 发送消息并流式返回（SSE）。
     * 事件 data 为 JSON：
     *  - {"type":"conversation","conversationId":..,"title":..}
     *  - {"type":"content","delta":".."}
     *  - {"type":"tool","name":"..","status":"calling|done|error","summary":".."}
     *  - {"type":"done","conversationId":..}
     *  - {"type":"error","msg":".."}
     */
    SseEmitter streamChat(Long agentId, Long conversationId, String content);

}
