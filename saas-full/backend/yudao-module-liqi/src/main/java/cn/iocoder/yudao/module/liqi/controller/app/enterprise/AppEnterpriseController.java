package cn.iocoder.yudao.module.liqi.controller.app.enterprise;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.app.AppEnterpriseService;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.annotation.security.PermitAll;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 APP - 企业（外部数据）")
@RestController
@RequestMapping("/liqi/enterprise")
@Validated
public class AppEnterpriseController {

    @Resource
    private AppEnterpriseService enterpriseService;

    @GetMapping("/by-park")
    @Operation(summary = "按园区地址实时拉取外部最新企业列表")
    @PermitAll
    public CommonResult<PageResult<EnterpriseDTO>> listByPark(
            @RequestParam("parkId") Long parkId,
            @RequestParam(value = "pageNo", required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(value = "pageSize", required = false, defaultValue = "20") Integer pageSize,
            @RequestParam(value = "industry", required = false) String industry) {
        return success(enterpriseService.listByPark(parkId, pageNo, pageSize, industry));
    }

    @GetMapping("/base-info")
    @Operation(summary = "查企业工商详情（绑定前确认，外部天眼查）")
    @PermitAll
    public CommonResult<EnterpriseDTO> getBaseInfo(@RequestParam("keyword") String keyword) {
        return success(enterpriseService.getBaseInfo(keyword));
    }

}
