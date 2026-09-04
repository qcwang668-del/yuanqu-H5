package cn.iocoder.yudao.module.liqi.controller.admin.member;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.member.vo.MemberPageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.member.vo.MemberRespVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.member.LiqiMemberDO;
import cn.iocoder.yudao.module.liqi.service.member.LiqiMemberService;
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

@Tag(name = "管理后台 - 会员管理（企业管理-会员管理系统）")
@RestController
@RequestMapping("/liqi/member")
@Validated
public class LiqiMemberController {

    @Resource
    private LiqiMemberService memberService;

    @GetMapping("/page")
    @Operation(summary = "获得会员分页")
    @PreAuthorize("@ss.hasPermission('liqi:member:query')")
    public CommonResult<PageResult<MemberRespVO>> getMemberPage(@Valid MemberPageReqVO pageReqVO) {
        PageResult<LiqiMemberDO> pageResult = memberService.getMemberPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, MemberRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出会员 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:member:query')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportMemberExcel(@Valid MemberPageReqVO pageReqVO,
                                  HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiMemberDO> list = memberService.getMemberPage(pageReqVO).getList();
        ExcelUtils.write(response, "会员管理.xls", "数据", MemberRespVO.class,
                BeanUtils.toBean(list, MemberRespVO.class));
    }

}
