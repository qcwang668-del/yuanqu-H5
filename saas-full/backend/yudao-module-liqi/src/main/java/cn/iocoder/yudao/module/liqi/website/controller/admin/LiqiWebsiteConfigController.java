package cn.iocoder.yudao.module.liqi.website.controller.admin;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.module.liqi.website.controller.admin.vo.WebsiteConfigRespVO;
import cn.iocoder.yudao.module.liqi.website.controller.admin.vo.WebsiteConfigSaveReqVO;
import cn.iocoder.yudao.module.liqi.website.dal.dataobject.LiqiWebsiteConfigDO;
import cn.iocoder.yudao.module.liqi.website.service.LiqiWebsiteConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 网站配置（系统管理-网站配置）")
@RestController
@RequestMapping("/liqi/website-config")
@Validated
public class LiqiWebsiteConfigController {

    @Resource
    private LiqiWebsiteConfigService websiteConfigService;

    @GetMapping("/get")
    @Operation(summary = "获得网站配置")
    @PreAuthorize("@ss.hasPermission('liqi:website-config:query')")
    public CommonResult<WebsiteConfigRespVO> getWebsiteConfig() {
        LiqiWebsiteConfigDO config = websiteConfigService.getConfig();
        return success(BeanUtils.toBean(config, WebsiteConfigRespVO.class));
    }

    @PutMapping("/update")
    @Operation(summary = "保存网站配置")
    @PreAuthorize("@ss.hasPermission('liqi:website-config:update')")
    public CommonResult<Boolean> updateWebsiteConfig(@Valid @RequestBody WebsiteConfigSaveReqVO updateReqVO) {
        websiteConfigService.saveConfig(updateReqVO);
        return success(true);
    }

}
