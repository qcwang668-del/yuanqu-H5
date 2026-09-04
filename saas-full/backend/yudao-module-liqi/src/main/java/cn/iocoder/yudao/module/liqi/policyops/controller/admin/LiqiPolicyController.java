package cn.iocoder.yudao.module.liqi.policyops.controller.admin;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo.PolicyPageReqVO;
import cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo.PolicySaveReqVO;
import cn.iocoder.yudao.module.liqi.policyops.dal.dataobject.LiqiPolicyDO;
import cn.iocoder.yudao.module.liqi.policyops.service.LiqiPolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

import static cn.iocoder.yudao.framework.apilog.core.enums.OperateTypeEnum.EXPORT;
import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 园区政策发布")
@RestController
@RequestMapping("/liqi/policy")
@Validated
public class LiqiPolicyController {

    @Resource
    private LiqiPolicyService policyService;

    @PostMapping("/create")
    @Operation(summary = "新增园区政策")
    @PreAuthorize("@ss.hasPermission('liqi:policy:create')")
    public CommonResult<Long> createPolicy(@Valid @RequestBody PolicySaveReqVO reqVO) {
        return success(policyService.createPolicy(reqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "修改园区政策")
    @PreAuthorize("@ss.hasPermission('liqi:policy:update')")
    public CommonResult<Boolean> updatePolicy(@Valid @RequestBody PolicySaveReqVO reqVO) {
        policyService.updatePolicy(reqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除园区政策")
    @PreAuthorize("@ss.hasPermission('liqi:policy:delete')")
    public CommonResult<Boolean> deletePolicy(@RequestParam("id") Long id) {
        policyService.deletePolicy(id);
        return success(true);
    }

    @PutMapping("/update-status")
    @Operation(summary = "上架/下架")
    @PreAuthorize("@ss.hasPermission('liqi:policy:update')")
    public CommonResult<Boolean> updateStatus(@RequestParam("id") Long id,
                                              @RequestParam("status") Integer status) {
        policyService.updateStatus(id, status);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得园区政策详情")
    @PreAuthorize("@ss.hasPermission('liqi:policy:query')")
    public CommonResult<LiqiPolicyDO> getPolicy(@RequestParam("id") Long id) {
        return success(policyService.getPolicy(id));
    }

    @GetMapping("/page")
    @Operation(summary = "园区政策分页")
    @PreAuthorize("@ss.hasPermission('liqi:policy:query')")
    public CommonResult<PageResult<LiqiPolicyDO>> getPolicyPage(@Valid PolicyPageReqVO pageReqVO) {
        return success(policyService.getPolicyPage(pageReqVO));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出园区政策 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:policy:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportPolicyExcel(@Valid PolicyPageReqVO pageReqVO,
                                  HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiPolicyDO> list = policyService.getPolicyPage(pageReqVO).getList();
        ExcelUtils.write(response, "园区政策.xls", "数据", LiqiPolicyDO.class,
                BeanUtils.toBean(list, LiqiPolicyDO.class));
    }

}
