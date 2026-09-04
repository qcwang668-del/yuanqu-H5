package cn.iocoder.yudao.module.liqi.live.controller.admin;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.live.controller.admin.vo.LivePageReqVO;
import cn.iocoder.yudao.module.liqi.live.controller.admin.vo.LiveSaveReqVO;
import cn.iocoder.yudao.module.liqi.live.dal.dataobject.LiqiLiveDO;
import cn.iocoder.yudao.module.liqi.live.service.LiqiLiveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 直播大讲堂")
@RestController
@RequestMapping("/liqi/live")
@Validated
public class LiqiLiveController {

    @Resource
    private LiqiLiveService liveService;

    @PostMapping("/create")
    @Operation(summary = "新增直播")
    @PreAuthorize("@ss.hasPermission('liqi:live:create')")
    public CommonResult<Long> createLive(@Valid @RequestBody LiveSaveReqVO reqVO) {
        return success(liveService.createLive(reqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "修改直播")
    @PreAuthorize("@ss.hasPermission('liqi:live:update')")
    public CommonResult<Boolean> updateLive(@Valid @RequestBody LiveSaveReqVO reqVO) {
        liveService.updateLive(reqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除直播")
    @PreAuthorize("@ss.hasPermission('liqi:live:delete')")
    public CommonResult<Boolean> deleteLive(@RequestParam("id") Long id) {
        liveService.deleteLive(id);
        return success(true);
    }

    @PutMapping("/update-status")
    @Operation(summary = "更新直播状态（0预告 1直播中 2回放 3下架）")
    @PreAuthorize("@ss.hasPermission('liqi:live:update')")
    public CommonResult<Boolean> updateStatus(@RequestParam("id") Long id,
                                              @RequestParam("status") Integer status) {
        liveService.updateStatus(id, status);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "直播详情")
    @PreAuthorize("@ss.hasPermission('liqi:live:query')")
    public CommonResult<LiqiLiveDO> getLive(@RequestParam("id") Long id) {
        return success(liveService.getLive(id));
    }

    @GetMapping("/page")
    @Operation(summary = "直播分页")
    @PreAuthorize("@ss.hasPermission('liqi:live:query')")
    public CommonResult<PageResult<LiqiLiveDO>> getLivePage(@Valid LivePageReqVO pageReqVO) {
        return success(liveService.getLivePage(pageReqVO));
    }

}
