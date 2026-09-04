package cn.iocoder.yudao.module.liqi.controller.admin.agent;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.module.liqi.controller.admin.agent.vo.AgentChatSendReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentConversationDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentMessageDO;
import cn.iocoder.yudao.module.liqi.service.agent.LiqiAgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.List;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 智能体广场")
@RestController
@RequestMapping("/liqi/agent")
@Validated
public class LiqiAgentController {

    @Resource
    private LiqiAgentService agentService;

    @GetMapping("/list")
    @Operation(summary = "获得启用中的智能体列表（广场卡片）")
    @PreAuthorize("@ss.hasPermission('liqi:agent:query')")
    public CommonResult<List<LiqiAgentDO>> getAgentList() {
        return success(agentService.getEnabledAgentList());
    }

    @GetMapping("/conversation/list")
    @Operation(summary = "获得我的会话列表")
    @PreAuthorize("@ss.hasPermission('liqi:agent:query')")
    public CommonResult<List<LiqiAgentConversationDO>> getConversationList(
            @RequestParam(value = "agentId", required = false) Long agentId) {
        return success(agentService.getConversationList(agentId));
    }

    @GetMapping("/message/list")
    @Operation(summary = "获得会话消息列表")
    @PreAuthorize("@ss.hasPermission('liqi:agent:query')")
    public CommonResult<List<LiqiAgentMessageDO>> getMessageList(@RequestParam("conversationId") Long conversationId) {
        return success(agentService.getMessageList(conversationId));
    }

    @PostMapping("/conversation/create")
    @Operation(summary = "新建会话")
    @PreAuthorize("@ss.hasPermission('liqi:agent:query')")
    public CommonResult<Long> createConversation(@RequestParam("agentId") Long agentId,
                                                 @RequestParam(value = "title", required = false) String title) {
        return success(agentService.createConversation(agentId, title));
    }

    @PostMapping(value = "/chat/send-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "发送消息（SSE 流式返回）")
    @PreAuthorize("@ss.hasPermission('liqi:agent:query')")
    public SseEmitter sendChatStream(@Valid @RequestBody AgentChatSendReqVO reqVO) {
        return agentService.streamChat(reqVO.getAgentId(), reqVO.getConversationId(), reqVO.getContent());
    }

}
