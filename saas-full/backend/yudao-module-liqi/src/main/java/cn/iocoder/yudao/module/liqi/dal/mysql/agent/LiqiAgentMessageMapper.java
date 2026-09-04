package cn.iocoder.yudao.module.liqi.dal.mysql.agent;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentMessageDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LiqiAgentMessageMapper extends BaseMapperX<LiqiAgentMessageDO> {

    default List<LiqiAgentMessageDO> selectListByConversation(Long conversationId) {
        return selectList(new LambdaQueryWrapperX<LiqiAgentMessageDO>()
                .eq(LiqiAgentMessageDO::getConversationId, conversationId)
                .orderByAsc(LiqiAgentMessageDO::getId));
    }

}
