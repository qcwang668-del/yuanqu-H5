package cn.iocoder.yudao.module.liqi.dal.mysql.bind;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.bind.LiqiUserEnterpriseBindDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 力企 - 用户企业绑定 Mapper
 */
@Mapper
public interface LiqiUserEnterpriseBindMapper extends BaseMapperX<LiqiUserEnterpriseBindDO> {

    default LiqiUserEnterpriseBindDO selectByUser(Long userId) {
        return selectOne(new LambdaQueryWrapperX<LiqiUserEnterpriseBindDO>()
                .eq(LiqiUserEnterpriseBindDO::getUserId, userId)
                .last("LIMIT 1"));
    }

    default int deleteByUser(Long userId) {
        return delete(new LambdaQueryWrapperX<LiqiUserEnterpriseBindDO>()
                .eq(LiqiUserEnterpriseBindDO::getUserId, userId));
    }

    /** 查询某园区下所有绑定企业（园区运营推送候选名单用） */
    default List<LiqiUserEnterpriseBindDO> selectListByPark(Long parkId) {
        return selectList(new LambdaQueryWrapperX<LiqiUserEnterpriseBindDO>()
                .eq(LiqiUserEnterpriseBindDO::getParkId, parkId)
                .orderByDesc(LiqiUserEnterpriseBindDO::getId));
    }

}
