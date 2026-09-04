package cn.iocoder.yudao.module.liqi.service.app;

import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.module.liqi.service.agent.LlmChatClient;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.AI_CONTENT_BLANK;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.AI_POLICY_NOT_FOUND;

/**
 * 力企 C 端 - AI 政策助手 Service 实现（复用火山方舟 LLM，OpenAI 兼容）
 */
@Slf4j
@Service
@Validated
public class AppAiServiceImpl implements AppAiService {

    /** 政策助手人设 */
    private static final String ASSISTANT_SYS =
            "你是「力企云 AI 政策助手」，熟悉国家及地方惠企政策、高新/专精特新认定、研发补贴、设备更新、创业扶持等。"
          + "请用中文、口语化、条理清晰地回答企业用户问题，把政策讲成大白话；不确定的信息如实说明，不编造政策条款或补贴金额。";

    @Resource
    private LlmChatClient llmChatClient;
    @Resource
    private AppPolicyService appPolicyService;

    @Override
    public String explainPolicy(String policyId) {
        PolicyDTO p = appPolicyService.getPolicy(policyId);
        if (p == null) {
            throw exception(AI_POLICY_NOT_FOUND);
        }
        StringBuilder user = new StringBuilder();
        user.append("请把下面这条惠企政策翻译成企业老板能看懂的大白话，简要说明：谁能申报、能拿多少钱、截止时间、大概要准备什么。\n\n");
        user.append("政策标题：").append(p.getTitle()).append("\n");
        if (StrUtil.isNotBlank(p.getSubsidyMax())) {
            user.append("最高补贴：").append(p.getSubsidyMax()).append(" 万元\n");
        }
        if (StrUtil.isNotBlank(p.getRegion())) {
            user.append("地区：").append(p.getRegion()).append("\n");
        }
        if (StrUtil.isNotBlank(p.getDeadline())) {
            user.append("截止日期：").append(p.getDeadline()).append("\n");
        }
        user.append("政策正文/摘要：\n").append(StrUtil.blankToDefault(p.getContent(), p.getSummary()));

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(LlmChatClient.msg("system", ASSISTANT_SYS));
        messages.add(LlmChatClient.msg("user", user.toString()));
        StringBuilder buf = new StringBuilder();
        llmChatClient.chatStream(null, messages, null, new LlmChatClient.ContentHandler() {
            @Override
            public void onContent(String delta) { buf.append(delta); }
        });
        return buf.toString();
    }

    @Override
    public SseEmitter streamChat(String content) {
        if (StrUtil.isBlank(content)) {
            throw exception(AI_CONTENT_BLANK);
        }
        SseEmitter emitter = new SseEmitter(3 * 60 * 1000L);
        emitter.onError(t -> log.warn("[AI助手] SSE 异常: {}", t.toString()));
        Thread worker = new Thread(() -> {
            try {
                List<Map<String, Object>> messages = new ArrayList<>();
                messages.add(LlmChatClient.msg("system", ASSISTANT_SYS));
                messages.add(LlmChatClient.msg("user", content));
                llmChatClient.chatStream(null, messages, null, new LlmChatClient.ContentHandler() {
                    @Override
                    public void onContent(String delta) {
                        try {
                            emitter.send(delta, MediaType.TEXT_PLAIN);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }
                });
                emitter.send("[DONE]", MediaType.TEXT_PLAIN);
                emitter.complete();
            } catch (Exception e) {
                log.error("[AI助手] 流式问答失败", e);
                try { emitter.send("【AI 助手暂时不可用，请稍后再试】", MediaType.TEXT_PLAIN); } catch (IOException ignore) {}
                emitter.complete();
            }
        }, "liqi-app-ai");
        worker.setDaemon(true);
        worker.start();
        return emitter;
    }

}
