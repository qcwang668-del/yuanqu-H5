package cn.iocoder.yudao.module.liqi.policyops.dal.mysql;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo.PolicyPageReqVO;
import cn.iocoder.yudao.module.liqi.policyops.dal.dataobject.LiqiPolicyDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 力企 - 政策库 Mapper（园区自主发布）
 */
@Mapper
public interface LiqiPolicyMapper extends BaseMapperX<LiqiPolicyDO> {

    default PageResult<LiqiPolicyDO> selectPage(PolicyPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiPolicyDO>()
                .likeIfPresent(LiqiPolicyDO::getTitle, reqVO.getTitle())
                .eqIfPresent(LiqiPolicyDO::getType, reqVO.getType())
                .eqIfPresent(LiqiPolicyDO::getParkId, reqVO.getParkId())
                .eqIfPresent(LiqiPolicyDO::getCategory, reqVO.getCategory())
                .eqIfPresent(LiqiPolicyDO::getStatus, reqVO.getStatus())
                .orderByDesc(LiqiPolicyDO::getPublishDate)
                .orderByDesc(LiqiPolicyDO::getId));
    }

    /** C 端：查询已上架的园区发布政策（H5 园区发布专区 / 合并进 PolicyProvider） */
    default List<LiqiPolicyDO> selectOnlineParkPolicies() {
        return selectList(new LambdaQueryWrapperX<LiqiPolicyDO>()
                .eq(LiqiPolicyDO::getStatus, 0)
                .eq(LiqiPolicyDO::getType, "park")
                .orderByDesc(LiqiPolicyDO::getPublishDate)
                .orderByDesc(LiqiPolicyDO::getId));
    }

}
