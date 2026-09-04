package cn.iocoder.yudao.module.liqi.live.controller.app;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.module.liqi.live.dal.dataobject.LiqiLiveDO;
import cn.iocoder.yudao.module.liqi.live.service.LiqiLiveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.annotation.security.PermitAll;
import java.util.List;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 APP - 专家直播大讲堂")
@RestController
@RequestMapping("/liqi/live")
@Validated
public class AppLiveController {

    @Resource
    private LiqiLiveService liveService;

    @GetMapping("/list")
    @Operation(summary = "直播列表（预告/直播中/回放）")
    @PermitAll
    public CommonResult<List<LiqiLiveDO>> list() {
        return success(liveService.listAppLives());
    }

    @GetMapping("/get")
    @Operation(summary = "直播详情")
    @PermitAll
    public CommonResult<LiqiLiveDO> get(@RequestParam("id") Long id) {
        return success(liveService.getLive(id));
    }

}
