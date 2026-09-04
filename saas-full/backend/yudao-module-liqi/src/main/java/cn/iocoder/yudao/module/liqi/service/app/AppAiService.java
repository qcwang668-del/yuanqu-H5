package cn.iocoder.yudao.module.liqi.service.app;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * 力企 C 端 - AI 政策助手 Service（复用火山方舟 LLM）
 */
public interface AppAiService {

    /** 政策详情「帮我读懂（说人话）」：非流式返回大白话解读 */
    String explainPolicy(String policyId);

    /** 政策助手多轮/单轮问答（SSE 流式，事件 data 为纯文本增量，结束发 [DONE]） */
    SseEmitter streamChat(String content);

}
