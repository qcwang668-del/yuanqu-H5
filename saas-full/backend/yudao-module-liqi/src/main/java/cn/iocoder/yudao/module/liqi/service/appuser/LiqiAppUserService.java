package cn.iocoder.yudao.module.liqi.service.appuser;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserPageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserSaveReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.appuser.LiqiAppUserDO;

import javax.validation.Valid;

/**
 * 力企 - APP 用户 Service
 */
public interface LiqiAppUserService {

    Long createAppUser(@Valid AppUserSaveReqVO createReqVO);

    void updateAppUser(@Valid AppUserSaveReqVO updateReqVO);

    void deleteAppUser(Long id);

    LiqiAppUserDO getAppUser(Long id);

    PageResult<LiqiAppUserDO> getAppUserPage(AppUserPageReqVO pageReqVO);

}
