package cn.iocoder.yudao.module.liqi.dal.mysql.appuser;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.controller.admin.appuser.vo.AppUserPageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.appuser.LiqiAppUserDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - APP 用户 Mapper
 */
@Mapper
public interface LiqiAppUserMapper extends BaseMapperX<LiqiAppUserDO> {

    default PageResult<LiqiAppUserDO> selectPage(AppUserPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiAppUserDO>()
                .likeIfPresent(LiqiAppUserDO::getUserName, reqVO.getUserName())
                .likeIfPresent(LiqiAppUserDO::getPhone, reqVO.getPhone())
                .eqIfPresent(LiqiAppUserDO::getSource, reqVO.getSource())
                .betweenIfPresent(LiqiAppUserDO::getRegisterTime, reqVO.getRegisterTime())
                .betweenIfPresent(LiqiAppUserDO::getLastLoginTime, reqVO.getLastLoginTime())
                .orderByDesc(LiqiAppUserDO::getId));
    }

}
