package cn.iocoder.yudao.module.liqi.website.dal.mysql;

import cn.hutool.core.collection.CollUtil;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.website.dal.dataobject.LiqiWebsiteConfigDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 网站配置 Mapper
 */
@Mapper
public interface LiqiWebsiteConfigMapper extends BaseMapperX<LiqiWebsiteConfigDO> {

    /**
     * 查询当前租户的唯一网站配置（无则返回 null）。
     * 说明：TenantBaseDO 由多租户插件自动追加 tenant_id 过滤，此处取第一条即可。
     */
    default LiqiWebsiteConfigDO selectByTenant() {
        return CollUtil.getFirst(selectList(new LambdaQueryWrapperX<LiqiWebsiteConfigDO>()
                .orderByAsc(LiqiWebsiteConfigDO::getId)));
    }

}
