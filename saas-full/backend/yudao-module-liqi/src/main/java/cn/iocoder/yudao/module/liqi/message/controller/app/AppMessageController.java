package cn.iocoder.yudao.module.liqi.message.controller.app;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.message.dal.dataobject.LiqiUserMessageDO;
import cn.iocoder.yudao.module.liqi.message.service.LiqiUserMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;
import static cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils.getLoginUserId;

@Tag(name = "用户 APP - 我的消息（政策推送/提醒）")
@RestController
@RequestMapping("/liqi/message")
@Validated
public class AppMessageController {

    @Resource
    private LiqiUserMessageService userMessageService;

    @GetMapping("/page")
    @Operation(summary = "我的消息分页（source=external 外部政策 / park 园区发布，空=全部）")
    public CommonResult<PageResult<LiqiUserMessageDO>> page(
            @RequestParam(value = "pageNo", required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(value = "pageSize", required = false, defaultValue = "20") Integer pageSize,
            @RequestParam(value = "source", required = false) String source) {
        return success(userMessageService.pageMyMessages(getLoginUserId(), pageNo, pageSize, source));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "未读消息数")
    public CommonResult<Long> unreadCount() {
        return success(userMessageService.unreadCount(getLoginUserId()));
    }

    @PutMapping("/read")
    @Operation(summary = "全部标记已读")
    public CommonResult<Boolean> markRead() {
        userMessageService.markRead(getLoginUserId());
        return success(true);
    }

}
