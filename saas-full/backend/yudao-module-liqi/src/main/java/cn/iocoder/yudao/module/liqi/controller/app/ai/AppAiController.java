package cn.iocoder.yudao.module.liqi.controller.app.ai;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.module.liqi.service.app.AppAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.Resource;
import javax.annotation.security.PermitAll;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 APP - AI 政策助手")
@RestController
@RequestMapping("/liqi/ai")
@Validated
public class AppAiController {

    @Resource
    private AppAiService appAiService;

    @GetMapping("/explain")
    @Operation(summary = "帮我读懂（把政策翻译成大白话）")
    @PermitAll
    public CommonResult<String> explain(@RequestParam("policyId") String policyId) {
        return success(appAiService.explainPolicy(policyId));
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "政策助手问答（SSE 流式，正文为纯文本增量，结束发 [DONE]）")
    @PermitAll
    public SseEmitter chat(@RequestBody Map<String, String> body) {
        return appAiService.streamChat(body == null ? null : body.get("content"));
    }

}
