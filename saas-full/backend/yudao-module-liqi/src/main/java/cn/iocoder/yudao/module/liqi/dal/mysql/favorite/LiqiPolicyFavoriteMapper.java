package cn.iocoder.yudao.module.liqi.dal.mysql.favorite;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.favorite.LiqiPolicyFavoriteDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 力企 - 政策收藏 Mapper
 */
@Mapper
public interface LiqiPolicyFavoriteMapper extends BaseMapperX<LiqiPolicyFavoriteDO> {

    default List<LiqiPolicyFavoriteDO> selectListByUser(Long userId) {
        return selectList(new LambdaQueryWrapperX<LiqiPolicyFavoriteDO>()
                .eq(LiqiPolicyFavoriteDO::getUserId, userId)
                .orderByDesc(LiqiPolicyFavoriteDO::getId));
    }

    default LiqiPolicyFavoriteDO selectByUserAndPolicy(Long userId, String policyId) {
        return selectOne(new LambdaQueryWrapperX<LiqiPolicyFavoriteDO>()
                .eq(LiqiPolicyFavoriteDO::getUserId, userId)
                .eq(LiqiPolicyFavoriteDO::getPolicyId, policyId));
    }

    default int deleteByUserAndPolicy(Long userId, String policyId) {
        return delete(new LambdaQueryWrapperX<LiqiPolicyFavoriteDO>()
                .eq(LiqiPolicyFavoriteDO::getUserId, userId)
                .eq(LiqiPolicyFavoriteDO::getPolicyId, policyId));
    }

}
