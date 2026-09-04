package cn.iocoder.yudao.module.liqi.controller.admin.park;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.park.vo.ParkRespVO;
import cn.iocoder.yudao.module.liqi.service.park.LiqiParkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 园区")
@RestController
@RequestMapping("/liqi/park")
@Validated
public class LiqiParkController {

    @Resource
    private LiqiParkService parkService;

    @GetMapping("/list")
    @Operation(summary = "获取启用园区列表（会员关联园区下拉用）")
    @PreAuthorize("@ss.hasPermission('liqi:member:query')")
    public CommonResult<List<ParkRespVO>> getParkList() {
        return success(BeanUtils.toBean(parkService.getEnabledParkList(), ParkRespVO.class));
    }

}
