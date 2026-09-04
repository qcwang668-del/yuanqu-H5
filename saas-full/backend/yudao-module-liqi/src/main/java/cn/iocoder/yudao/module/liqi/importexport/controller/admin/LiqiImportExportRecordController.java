package cn.iocoder.yudao.module.liqi.importexport.controller.admin;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.importexport.controller.admin.vo.ImportExportPageReqVO;
import cn.iocoder.yudao.module.liqi.importexport.controller.admin.vo.ImportExportRespVO;
import cn.iocoder.yudao.module.liqi.importexport.dal.dataobject.LiqiImportExportRecordDO;
import cn.iocoder.yudao.module.liqi.importexport.service.LiqiImportExportRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

@Tag(name = "管理后台 - 我的导入导出记录")
@RestController
@RequestMapping("/liqi/import-export")
@Validated
public class LiqiImportExportRecordController {

    @Resource
    private LiqiImportExportRecordService importExportRecordService;

    @GetMapping("/page")
    @Operation(summary = "获得我的导入导出记录分页")
    @PreAuthorize("@ss.hasPermission('liqi:import-export:query')")
    public CommonResult<PageResult<ImportExportRespVO>> getRecordPage(@Valid ImportExportPageReqVO pageReqVO) {
        PageResult<LiqiImportExportRecordDO> pageResult = importExportRecordService.getRecordPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, ImportExportRespVO.class));
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除我的导入导出记录")
    @Parameter(name = "id", description = "编号", required = true)
    @PreAuthorize("@ss.hasPermission('liqi:import-export:delete')")
    public CommonResult<Boolean> deleteRecord(@RequestParam("id") Long id) {
        importExportRecordService.deleteRecord(id);
        return success(true);
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出我的导入导出记录 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:import-export:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportRecordExcel(@Valid ImportExportPageReqVO pageReqVO,
                                  HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiImportExportRecordDO> list = importExportRecordService.getRecordPage(pageReqVO).getList();
        ExcelUtils.write(response, "我的导入导出记录.xls", "数据", ImportExportRespVO.class,
                BeanUtils.toBean(list, ImportExportRespVO.class));
    }

}
