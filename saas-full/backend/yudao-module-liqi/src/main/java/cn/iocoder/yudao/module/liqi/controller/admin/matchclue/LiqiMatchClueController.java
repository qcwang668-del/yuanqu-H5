package cn.iocoder.yudao.module.liqi.controller.admin.matchclue;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.matchclue.vo.MatchCluePageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.matchclue.vo.MatchClueRespVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.matchclue.LiqiMatchClueDO;
import cn.iocoder.yudao.module.liqi.service.matchclue.LiqiMatchClueService;
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

@Tag(name = "管理后台 - 匹配线索（平台管理-匹配线索管理）")
@RestController
@RequestMapping("/liqi/match-clue")
@Validated
public class LiqiMatchClueController {

    @Resource
    private LiqiMatchClueService matchClueService;

    @GetMapping("/page")
    @Operation(summary = "获得匹配线索分页")
    @PreAuthorize("@ss.hasPermission('liqi:match-clue:query')")
    public CommonResult<PageResult<MatchClueRespVO>> getMatchCluePage(@Valid MatchCluePageReqVO pageReqVO) {
        PageResult<LiqiMatchClueDO> pageResult = matchClueService.getMatchCluePage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, MatchClueRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出匹配线索 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:match-clue:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportMatchClueExcel(@Valid MatchCluePageReqVO pageReqVO,
                                     HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiMatchClueDO> list = matchClueService.getMatchCluePage(pageReqVO).getList();
        ExcelUtils.write(response, "匹配线索.xls", "数据", MatchClueRespVO.class,
                BeanUtils.toBean(list, MatchClueRespVO.class));
    }

}
