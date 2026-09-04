package cn.iocoder.yudao.module.liqi.dal.mysql.agent;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentConversationDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LiqiAgentConversationMapper extends BaseMapperX<LiqiAgentConversationDO> {

    default List<LiqiAgentConversationDO> selectListByUserAndAgent(Long userId, Long agentId) {
        return selectList(new LambdaQueryWrapperX<LiqiAgentConversationDO>()
                .eq(LiqiAgentConversationDO::getUserId, userId)
                .eqIfPresent(LiqiAgentConversationDO::getAgentId, agentId)
                .orderByDesc(LiqiAgentConversationDO::getId));
    }

}
