package cn.iocoder.yudao.module.liqi.controller.admin.memberclue;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.memberclue.vo.MemberCluePageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.memberclue.vo.MemberClueRespVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.memberclue.LiqiMemberClueDO;
import cn.iocoder.yudao.module.liqi.service.memberclue.LiqiMemberClueService;
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

@Tag(name = "管理后台 - 会员线索（企业管理-会员线索管理）")
@RestController
@RequestMapping("/liqi/member-clue")
@Validated
public class LiqiMemberClueController {

    @Resource
    private LiqiMemberClueService memberClueService;

    @GetMapping("/page")
    @Operation(summary = "获得会员线索分页")
    @PreAuthorize("@ss.hasPermission('liqi:member-clue:query')")
    public CommonResult<PageResult<MemberClueRespVO>> getMemberCluePage(@Valid MemberCluePageReqVO pageReqVO) {
        PageResult<LiqiMemberClueDO> pageResult = memberClueService.getMemberCluePage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, MemberClueRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出会员线索 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:member-clue:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportMemberClueExcel(@Valid MemberCluePageReqVO pageReqVO,
                                      HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiMemberClueDO> list = memberClueService.getMemberCluePage(pageReqVO).getList();
        ExcelUtils.write(response, "会员线索.xls", "数据", MemberClueRespVO.class,
                BeanUtils.toBean(list, MemberClueRespVO.class));
    }

}
