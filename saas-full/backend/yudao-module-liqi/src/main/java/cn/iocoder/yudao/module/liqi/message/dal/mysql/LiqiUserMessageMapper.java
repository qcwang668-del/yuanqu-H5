package cn.iocoder.yudao.module.liqi.message.dal.mysql;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.message.controller.admin.vo.UserMessagePageReqVO;
import cn.iocoder.yudao.module.liqi.message.dal.dataobject.LiqiUserMessageDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - C 端站内消息 Mapper
 */
@Mapper
public interface LiqiUserMessageMapper extends BaseMapperX<LiqiUserMessageDO> {

    default PageResult<LiqiUserMessageDO> selectPageByUser(Long userId, PageParam pageParam, String source) {
        return selectPage(pageParam, new LambdaQueryWrapperX<LiqiUserMessageDO>()
                .eq(LiqiUserMessageDO::getUserId, userId)
                .eqIfPresent(LiqiUserMessageDO::getSource, source)
                .orderByDesc(LiqiUserMessageDO::getId));
    }

    default Long selectUnreadCount(Long userId) {
        return selectCount(new LambdaQueryWrapperX<LiqiUserMessageDO>()
                .eq(LiqiUserMessageDO::getUserId, userId)
                .eq(LiqiUserMessageDO::getIsRead, 0));
    }

    /** 去重：某用户是否已有某政策、某来源的消息（防重复推送） */
    default boolean existsByUserAndPolicy(Long userId, String policyId, Integer type, String source) {
        return selectCount(new LambdaQueryWrapperX<LiqiUserMessageDO>()
                .eq(LiqiUserMessageDO::getUserId, userId)
                .eq(LiqiUserMessageDO::getPolicyId, policyId)
                .eq(type != null, LiqiUserMessageDO::getType, type)
                .eqIfPresent(LiqiUserMessageDO::getSource, source)) > 0;
    }

    default int markReadByUser(Long userId) {
        LiqiUserMessageDO update = new LiqiUserMessageDO();
        update.setIsRead(1);
        return update(update, new LambdaQueryWrapperX<LiqiUserMessageDO>()
                .eq(LiqiUserMessageDO::getUserId, userId)
                .eq(LiqiUserMessageDO::getIsRead, 0));
    }

    default PageResult<LiqiUserMessageDO> selectAdminPage(UserMessagePageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiUserMessageDO>()
                .eqIfPresent(LiqiUserMessageDO::getUserId, reqVO.getUserId())
                .likeIfPresent(LiqiUserMessageDO::getTitle, reqVO.getTitle())
                .eqIfPresent(LiqiUserMessageDO::getType, reqVO.getType())
                .eqIfPresent(LiqiUserMessageDO::getBizType, reqVO.getBizType())
                .eqIfPresent(LiqiUserMessageDO::getSource, reqVO.getSource())
                .orderByDesc(LiqiUserMessageDO::getId));
    }

}
