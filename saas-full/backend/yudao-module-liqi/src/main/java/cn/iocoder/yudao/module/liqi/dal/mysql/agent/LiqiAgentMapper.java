package cn.iocoder.yudao.module.liqi.dal.mysql.agent;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LiqiAgentMapper extends BaseMapperX<LiqiAgentDO> {

    default List<LiqiAgentDO> selectListByStatus(Integer status) {
        return selectList(new LambdaQueryWrapperX<LiqiAgentDO>()
                .eq(LiqiAgentDO::getStatus, status)
                .orderByAsc(LiqiAgentDO::getSort));
    }

}
