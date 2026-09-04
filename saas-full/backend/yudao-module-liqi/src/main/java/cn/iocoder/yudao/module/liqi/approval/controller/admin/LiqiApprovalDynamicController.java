package cn.iocoder.yudao.module.liqi.approval.controller.admin;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.approval.controller.admin.vo.ApprovalDynamicPageReqVO;
import cn.iocoder.yudao.module.liqi.approval.controller.admin.vo.ApprovalDynamicRespVO;
import cn.iocoder.yudao.module.liqi.approval.dal.dataobject.LiqiApprovalDynamicDO;
import cn.iocoder.yudao.module.liqi.approval.service.LiqiApprovalDynamicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

import static cn.iocoder.yudao.framework.apilog.core.enums.OperateTypeEnum.EXPORT;
import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 企业获批动态（企业管理）")
@RestController
@RequestMapping("/liqi/approval-dynamic")
@Validated
public class LiqiApprovalDynamicController {

    @Resource
    private LiqiApprovalDynamicService approvalDynamicService;

    @GetMapping("/page")
    @Operation(summary = "获得企业获批动态分页")
    @PreAuthorize("@ss.hasPermission('liqi:approval-dynamic:query')")
    public CommonResult<PageResult<ApprovalDynamicRespVO>> getApprovalDynamicPage(@Valid ApprovalDynamicPageReqVO pageReqVO) {
        PageResult<LiqiApprovalDynamicDO> pageResult = approvalDynamicService.getApprovalDynamicPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, ApprovalDynamicRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出企业获批动态 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:approval-dynamic:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportApprovalDynamicExcel(@Valid ApprovalDynamicPageReqVO pageReqVO,
                                           HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiApprovalDynamicDO> list = approvalDynamicService.getApprovalDynamicPage(pageReqVO).getList();
        ExcelUtils.write(response, "企业获批动态.xls", "数据", ApprovalDynamicRespVO.class,
                BeanUtils.toBean(list, ApprovalDynamicRespVO.class));
    }

}
