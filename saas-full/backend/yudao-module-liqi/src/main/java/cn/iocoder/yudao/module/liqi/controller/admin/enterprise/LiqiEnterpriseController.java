package cn.iocoder.yudao.module.liqi.controller.admin.enterprise;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.enterprise.vo.EnterprisePageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.enterprise.vo.EnterpriseRespVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise.LiqiEnterpriseDO;
import cn.iocoder.yudao.module.liqi.service.enterprise.LiqiEnterpriseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 企业库（深圳湾生态园）")
@RestController
@RequestMapping("/liqi/enterprise")
@Validated
public class LiqiEnterpriseController {

    @Resource
    private LiqiEnterpriseService enterpriseService;

    @GetMapping("/page")
    @Operation(summary = "获得企业分页")
    @PreAuthorize("@ss.hasPermission('liqi:enterprise:query')")
    public CommonResult<PageResult<EnterpriseRespVO>> getEnterprisePage(@Valid EnterprisePageReqVO pageReqVO) {
        PageResult<LiqiEnterpriseDO> pageResult = enterpriseService.getEnterprisePage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, EnterpriseRespVO.class));
    }

    @GetMapping("/stats")
    @Operation(summary = "企业统计（供园区大屏调用）")
    @PreAuthorize("@ss.hasPermission('liqi:enterprise:query')")
    public CommonResult<Map<String, Object>> getStats() {
        return success(enterpriseService.getEnterpriseStats());
    }

    @GetMapping("/get")
    @Operation(summary = "获得企业详情（含股东子表）")
    @PreAuthorize("@ss.hasPermission('liqi:enterprise:query')")
    public CommonResult<Map<String, Object>> getDetail(@RequestParam("id") Long id) {
        return success(enterpriseService.getEnterpriseDetail(id));
    }

    @PostMapping("/enrich")
    @Operation(summary = "按需实时调天眼查回填工商信息 + 股东")
    @PreAuthorize("@ss.hasPermission('liqi:enterprise:query')")
    public CommonResult<Map<String, Object>> enrich(@RequestParam("id") Long id) {
        return success(enterpriseService.enrich(id));
    }

}
