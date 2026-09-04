package cn.iocoder.yudao.module.liqi.controller.app.user;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppEnterpriseBindReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppFavoriteReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppPolicyApplyCreateReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppSubscribeSaveReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.bind.LiqiUserEnterpriseBindDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.favorite.LiqiPolicyFavoriteDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo.LiqiReserveInfoDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.subscribe.LiqiSubscribeSettingDO;
import cn.iocoder.yudao.module.liqi.service.app.AppUserBizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.annotation.security.PermitAll;
import javax.validation.Valid;
import java.util.List;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;
import static cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils.getLoginUserId;

/**
 * 用户 APP - 我的（收藏 / 申报 / 订阅 / 企业绑定）。
 * 均需登录（会员 token），不带 @PermitAll。
 */
@Tag(name = "用户 APP - 我的")
@RestController
@RequestMapping("/liqi")
@Validated
public class AppUserController {

    @Resource
    private AppUserBizService userBizService;

    // ---------------- 收藏 ----------------
    @PostMapping("/favorite/add")
    @Operation(summary = "收藏政策")
    public CommonResult<Long> addFavorite(@RequestBody @Valid AppFavoriteReqVO reqVO) {
        return success(userBizService.addFavorite(getLoginUserId(), reqVO));
    }

    @DeleteMapping("/favorite/cancel")
    @Operation(summary = "取消收藏")
    public CommonResult<Boolean> cancelFavorite(@RequestParam("policyId") String policyId) {
        userBizService.cancelFavorite(getLoginUserId(), policyId);
        return success(true);
    }

    @GetMapping("/favorite/list")
    @Operation(summary = "我的收藏列表")
    public CommonResult<List<LiqiPolicyFavoriteDO>> favoriteList() {
        return success(userBizService.favoriteList(getLoginUserId()));
    }

    // ---------------- 申报 ----------------
    @PostMapping("/apply/create")
    @Operation(summary = "提交政策申报（游客可提交，登录后关联账号）")
    @PermitAll
    public CommonResult<Long> createApply(@RequestBody @Valid AppPolicyApplyCreateReqVO reqVO) {
        return success(userBizService.createApply(getLoginUserId(), reqVO));
    }

    @GetMapping("/apply/page")
    @Operation(summary = "我的申报记录")
    public CommonResult<PageResult<LiqiReserveInfoDO>> applyPage(
            @RequestParam(value = "pageNo", required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") Integer pageSize) {
        return success(userBizService.applyPage(getLoginUserId(), pageNo, pageSize));
    }

    // ---------------- 订阅 ----------------
    @GetMapping("/subscribe/get")
    @Operation(summary = "获取我的订阅设置")
    public CommonResult<LiqiSubscribeSettingDO> getSubscribe() {
        return success(userBizService.getSubscribe(getLoginUserId()));
    }

    @PostMapping("/subscribe/save")
    @Operation(summary = "保存订阅设置")
    public CommonResult<Boolean> saveSubscribe(@RequestBody AppSubscribeSaveReqVO reqVO) {
        userBizService.saveSubscribe(getLoginUserId(), reqVO);
        return success(true);
    }

    // ---------------- 企业绑定 ----------------
    @PostMapping("/bind/bind")
    @Operation(summary = "绑定企业（按名称/信用代码调外部工商接口取画像快照）")
    public CommonResult<LiqiUserEnterpriseBindDO> bindEnterprise(@RequestBody @Valid AppEnterpriseBindReqVO reqVO) {
        return success(userBizService.bindEnterprise(getLoginUserId(), reqVO));
    }

    @GetMapping("/bind/get")
    @Operation(summary = "获取我绑定的企业")
    public CommonResult<LiqiUserEnterpriseBindDO> getBind() {
        return success(userBizService.getBind(getLoginUserId()));
    }

}
