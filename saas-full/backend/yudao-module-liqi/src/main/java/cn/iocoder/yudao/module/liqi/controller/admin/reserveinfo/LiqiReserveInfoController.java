package cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo.vo.ReserveInfoPageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo.vo.ReserveInfoRespVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo.LiqiReserveInfoDO;
import cn.iocoder.yudao.module.liqi.service.reserveinfo.LiqiReserveInfoService;
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

@Tag(name = "管理后台 - 平台预留信息（力企 预留信息管理）")
@RestController
@RequestMapping("/liqi/reserve-info")
@Validated
public class LiqiReserveInfoController {

    @Resource
    private LiqiReserveInfoService reserveInfoService;

    @GetMapping("/page")
    @Operation(summary = "获得预留信息分页")
    @PreAuthorize("@ss.hasPermission('liqi:reserve-info:query')")
    public CommonResult<PageResult<ReserveInfoRespVO>> getReserveInfoPage(@Valid ReserveInfoPageReqVO pageReqVO) {
        PageResult<LiqiReserveInfoDO> pageResult = reserveInfoService.getReserveInfoPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, ReserveInfoRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出预留信息 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:reserve-info:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportReserveInfoExcel(@Valid ReserveInfoPageReqVO pageReqVO,
                                       HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiReserveInfoDO> list = reserveInfoService.getReserveInfoPage(pageReqVO).getList();
        ExcelUtils.write(response, "预留信息.xls", "数据", ReserveInfoRespVO.class,
                BeanUtils.toBean(list, ReserveInfoRespVO.class));
    }

}
