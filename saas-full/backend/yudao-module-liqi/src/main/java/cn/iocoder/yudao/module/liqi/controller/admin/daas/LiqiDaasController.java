package cn.iocoder.yudao.module.liqi.controller.admin.daas;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.module.liqi.controller.admin.daas.vo.QiYeInfoRespVO;
import cn.iocoder.yudao.module.liqi.service.daas.DaasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - DaaS 企业数据")
@RestController
@RequestMapping("/liqi/daas/enterprise")
@Validated
public class LiqiDaasController {

    @Resource
    private DaasService daasService;

    @GetMapping("/base-info")
    @Operation(summary = "企业基本信息（按统一社会信用代码 entityId 查工商详情）")
    @Parameter(name = "entityId", description = "统一社会信用代码/唯一 id", required = true, example = "91110108551385082Q")
    @PreAuthorize("@ss.hasPermission('liqi:daas:query')")
    public CommonResult<QiYeInfoRespVO> getBaseInfo(@RequestParam("entityId") String entityId) {
        return success(daasService.getBaseInfo(entityId));
    }

    @GetMapping("/fuzzy-match")
    @Operation(summary = "企业模糊匹配（按关键词搜企业，分页）")
    @PreAuthorize("@ss.hasPermission('liqi:daas:query')")
    public CommonResult<Map<String, Object>> fuzzyMatch(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size) {
        return success(daasService.fuzzyMatch(keyword, page, size));
    }

}
