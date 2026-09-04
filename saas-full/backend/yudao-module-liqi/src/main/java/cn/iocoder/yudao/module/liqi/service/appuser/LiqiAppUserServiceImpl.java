package cn.iocoder.yudao.module.liqi.service.appuser;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserPageReqVO;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserSaveReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.appuser.LiqiAppUserDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.appuser.LiqiAppUserMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.APP_USER_NOT_EXISTS;

/**
 * 力企 - APP 用户 Service 实现类
 */
@Service
@Validated
public class LiqiAppUserServiceImpl implements LiqiAppUserService {

    @Resource
    private LiqiAppUserMapper appUserMapper;

    @Override
    public Long createAppUser(AppUserSaveReqVO createReqVO) {
        LiqiAppUserDO appUser = BeanUtils.toBean(createReqVO, LiqiAppUserDO.class);
        appUserMapper.insert(appUser);
        return appUser.getId();
    }

    @Override
    public void updateAppUser(AppUserSaveReqVO updateReqVO) {
        validateAppUserExists(updateReqVO.getId());
        LiqiAppUserDO updateObj = BeanUtils.toBean(updateReqVO, LiqiAppUserDO.class);
        appUserMapper.updateById(updateObj);
    }

    @Override
    public void deleteAppUser(Long id) {
        validateAppUserExists(id);
        appUserMapper.deleteById(id);
    }

    private void validateAppUserExists(Long id) {
        if (appUserMapper.selectById(id) == null) {
            throw exception(APP_USER_NOT_EXISTS);
        }
    }

    @Override
    public LiqiAppUserDO getAppUser(Long id) {
        return appUserMapper.selectById(id);
    }

    @Override
    public PageResult<LiqiAppUserDO> getAppUserPage(AppUserPageReqVO pageReqVO) {
        return appUserMapper.selectPage(pageReqVO);
    }

}
