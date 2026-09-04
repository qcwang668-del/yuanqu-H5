package cn.iocoder.yudao.module.liqi.controller.admin.agent.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Schema(description = "管理后台 - 智能体对话发送 Request VO")
@Data
public class AgentChatSendReqVO {

    @Schema(description = "智能体编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "智能体编号不能为空")
    private Long agentId;

    @Schema(description = "会话编号（为空则新建会话）", example = "1024")
    private Long conversationId;

    @Schema(description = "消息内容", requiredMode = Schema.RequiredMode.REQUIRED, example = "帮我查一下深圳市大疆创新科技有限公司的工商信息")
    @NotBlank(message = "消息内容不能为空")
    private String content;

}
