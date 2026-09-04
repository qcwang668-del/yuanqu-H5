package cn.iocoder.yudao.module.liqi.controller.admin.appuser;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserPageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserRespVO;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserSaveReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.appuser.LiqiAppUserDO;
import cn.iocoder.yudao.module.liqi.service.appuser.LiqiAppUserService;
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

@Tag(name = "管理后台 - 平台用户（力企 APP 用户）")
@RestController
@RequestMapping("/liqi/app-user")
@Validated
public class LiqiAppUserController {

    @Resource
    private LiqiAppUserService appUserService;

    @PostMapping("/create")
    @Operation(summary = "创建 APP 用户")
    @PreAuthorize("@ss.hasPermission('liqi:app-user:create')")
    public CommonResult<Long> createAppUser(@Valid @RequestBody AppUserSaveReqVO createReqVO) {
        return success(appUserService.createAppUser(createReqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "更新 APP 用户")
    @PreAuthorize("@ss.hasPermission('liqi:app-user:update')")
    public CommonResult<Boolean> updateAppUser(@Valid @RequestBody AppUserSaveReqVO updateReqVO) {
        appUserService.updateAppUser(updateReqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除 APP 用户")
    @Parameter(name = "id", description = "编号", required = true)
    @PreAuthorize("@ss.hasPermission('liqi:app-user:delete')")
    public CommonResult<Boolean> deleteAppUser(@RequestParam("id") Long id) {
        appUserService.deleteAppUser(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得 APP 用户")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    @PreAuthorize("@ss.hasPermission('liqi:app-user:query')")
    public CommonResult<AppUserRespVO> getAppUser(@RequestParam("id") Long id) {
        LiqiAppUserDO appUser = appUserService.getAppUser(id);
        return success(BeanUtils.toBean(appUser, AppUserRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获得 APP 用户分页")
    @PreAuthorize("@ss.hasPermission('liqi:app-user:query')")
    public CommonResult<PageResult<AppUserRespVO>> getAppUserPage(@Valid AppUserPageReqVO pageReqVO) {
        PageResult<LiqiAppUserDO> pageResult = appUserService.getAppUserPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, AppUserRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出 APP 用户 Excel")
    @PreAuthorize("@ss.hasPermission('liqi:app-user:export')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportAppUserExcel(@Valid AppUserPageReqVO pageReqVO,
                                   HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<LiqiAppUserDO> list = appUserService.getAppUserPage(pageReqVO).getList();
        ExcelUtils.write(response, "APP用户.xls", "数据", AppUserRespVO.class,
                BeanUtils.toBean(list, AppUserRespVO.class));
    }

}
