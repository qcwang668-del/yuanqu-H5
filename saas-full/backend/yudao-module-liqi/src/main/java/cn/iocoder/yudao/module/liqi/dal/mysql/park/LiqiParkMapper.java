package cn.iocoder.yudao.module.liqi.dal.mysql.park;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.park.LiqiParkDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 力企 - 园区 Mapper
 */
@Mapper
public interface LiqiParkMapper extends BaseMapperX<LiqiParkDO> {

    default List<LiqiParkDO> selectEnabledList() {
        return selectList(new LambdaQueryWrapperX<LiqiParkDO>()
                .eqIfPresent(LiqiParkDO::getStatus, 0)
                .orderByAsc(LiqiParkDO::getId));
    }

}
