package cn.iocoder.yudao.module.liqi.service.app;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppEnterpriseBindReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppFavoriteReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppPolicyApplyCreateReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppSubscribeSaveReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.bind.LiqiUserEnterpriseBindDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.favorite.LiqiPolicyFavoriteDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo.LiqiReserveInfoDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.subscribe.LiqiSubscribeSettingDO;

import java.util.List;

/**
 * 力企 C 端 - 用户业务 Service（收藏 / 申报 / 订阅 / 企业绑定，均为本地业务数据）
 */
public interface AppUserBizService {

    // ---- 收藏 ----
    Long addFavorite(Long userId, AppFavoriteReqVO reqVO);
    void cancelFavorite(Long userId, String policyId);
    List<LiqiPolicyFavoriteDO> favoriteList(Long userId);
    boolean isFavorite(Long userId, String policyId);

    // ---- 申报（改道：H5 政策申报统一写入「预留信息」表）----
    Long createApply(Long userId, AppPolicyApplyCreateReqVO reqVO);
    PageResult<LiqiReserveInfoDO> applyPage(Long userId, Integer pageNo, Integer pageSize);

    // ---- 订阅 ----
    void saveSubscribe(Long userId, AppSubscribeSaveReqVO reqVO);
    LiqiSubscribeSettingDO getSubscribe(Long userId);

    // ---- 企业绑定 ----
    LiqiUserEnterpriseBindDO bindEnterprise(Long userId, AppEnterpriseBindReqVO reqVO);
    LiqiUserEnterpriseBindDO getBind(Long userId);

}
