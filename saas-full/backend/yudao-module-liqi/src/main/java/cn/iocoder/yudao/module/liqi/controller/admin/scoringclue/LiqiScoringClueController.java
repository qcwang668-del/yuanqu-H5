package cn.iocoder.yudao.module.liqi.controller.admin.scoringclue;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.scoringclue.vo.ScoringCluePageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.scoringclue.vo.ScoringClueRespVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.scoringclue.LiqiScoringClueDO;
import cn.iocoder.yudao.module.liqi.service.scoringclue.LiqiScoringClueService;
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

@Tag(name = "管理后台 - 评分线索管理（力企平台管理）")
@RestController
@RequestMapping("/liqi/scoring-clue")
@Validated
public class LiqiScoringClueController {

    @Resource
    private LiqiScoringClueService scoringClueService;

    @GetMapping("/page")
    @Operation(summary = "获得评分线索分页")
    @PreAuthorize("@ss.hasPermission('liqi:scoring-clue:query')")
    public CommonResult<PageResult<ScoringClueRespVO>> getScoringCluePage(@Valid ScoringCluePageReqVO pageReqVO) {
        PageResult<LiqiScoringClueDO> pageResult = scoringClueService.getScoringCluePage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, ScoringClueRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出评分线索 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:scoring-clue:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportScoringClueExcel(@Valid ScoringCluePageReqVO pageReqVO,
                                       HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiScoringClueDO> list = scoringClueService.getScoringCluePage(pageReqVO).getList();
        ExcelUtils.write(response, "评分线索.xls", "数据", ScoringClueRespVO.class,
                BeanUtils.toBean(list, ScoringClueRespVO.class));
    }

}
