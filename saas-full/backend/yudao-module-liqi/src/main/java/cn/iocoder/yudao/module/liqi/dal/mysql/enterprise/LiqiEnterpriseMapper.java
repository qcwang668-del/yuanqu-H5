package cn.iocoder.yudao.module.liqi.dal.mysql.enterprise;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.controller.admin.enterprise.vo.EnterprisePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise.LiqiEnterpriseDO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 力企 - 企业库 Mapper
 */
@Mapper
public interface LiqiEnterpriseMapper extends BaseMapperX<LiqiEnterpriseDO> {

    default PageResult<LiqiEnterpriseDO> selectPage(EnterprisePageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiEnterpriseDO>()
                .likeIfPresent(LiqiEnterpriseDO::getEnterpriseName, reqVO.getEnterpriseName())
                .likeIfPresent(LiqiEnterpriseDO::getIndustry, reqVO.getIndustry())
                .likeIfPresent(LiqiEnterpriseDO::getRegisterAddress, reqVO.getRegisterAddress())
                .orderByAsc(LiqiEnterpriseDO::getId));
    }

    /** 行业分布（name=行业, value=数量），倒序 */
    default List<Map<String, Object>> selectIndustryCount() {
        return selectMaps(new QueryWrapper<LiqiEnterpriseDO>()
                .select("industry AS name, count(*) AS value")
                .groupBy("industry")
                .orderByDesc("count(*)"));
    }

    /** 参保人数 Top N 企业（当作榜单） */
    default List<LiqiEnterpriseDO> selectTop(int n) {
        return selectList(new LambdaQueryWrapperX<LiqiEnterpriseDO>()
                .orderByDesc(LiqiEnterpriseDO::getInsuredCount)
                .last("limit " + n));
    }

}
