package cn.iocoder.yudao.module.liqi.dal.mysql.enterprise;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise.LiqiEnterpriseShareholderDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 力企 - 企业库 · 股东信息 Mapper
 */
@Mapper
public interface LiqiEnterpriseShareholderMapper extends BaseMapperX<LiqiEnterpriseShareholderDO> {

    default List<LiqiEnterpriseShareholderDO> selectListByEnterpriseId(Long enterpriseId) {
        return selectList(new LambdaQueryWrapperX<LiqiEnterpriseShareholderDO>()
                .eq(LiqiEnterpriseShareholderDO::getEnterpriseId, enterpriseId));
    }

    default void deleteByEnterpriseId(Long enterpriseId) {
        delete(new LambdaQueryWrapperX<LiqiEnterpriseShareholderDO>()
                .eq(LiqiEnterpriseShareholderDO::getEnterpriseId, enterpriseId));
    }

}
