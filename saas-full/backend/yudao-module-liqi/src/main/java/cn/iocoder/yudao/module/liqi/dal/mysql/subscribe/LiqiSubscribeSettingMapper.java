package cn.iocoder.yudao.module.liqi.dal.mysql.subscribe;

import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.dal.dataobject.subscribe.LiqiSubscribeSettingDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 订阅推送设置 Mapper
 */
@Mapper
public interface LiqiSubscribeSettingMapper extends BaseMapperX<LiqiSubscribeSettingDO> {

    default LiqiSubscribeSettingDO selectByUser(Long userId) {
        return selectOne(new LambdaQueryWrapperX<LiqiSubscribeSettingDO>()
                .eq(LiqiSubscribeSettingDO::getUserId, userId));
    }

}
