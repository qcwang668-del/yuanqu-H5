package cn.iocoder.yudao.module.liqi.approval.dal.mysql;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.approval.controller.admin.vo.ApprovalDynamicPageReqVO;
import cn.iocoder.yudao.module.liqi.approval.dal.dataobject.LiqiApprovalDynamicDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 企业获批动态 Mapper
 */
@Mapper
public interface LiqiApprovalDynamicMapper extends BaseMapperX<LiqiApprovalDynamicDO> {

    default PageResult<LiqiApprovalDynamicDO> selectPage(ApprovalDynamicPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiApprovalDynamicDO>()
                .likeIfPresent(LiqiApprovalDynamicDO::getEnterpriseName, reqVO.getEnterpriseName())
                .likeIfPresent(LiqiApprovalDynamicDO::getCreditCode, reqVO.getCreditCode())
                .likeIfPresent(LiqiApprovalDynamicDO::getLegalPerson, reqVO.getLegalPerson())
                .likeIfPresent(LiqiApprovalDynamicDO::getApprovalProject, reqVO.getApprovalProject())
                .eqIfPresent(LiqiApprovalDynamicDO::getStatus, reqVO.getStatus())
                .betweenIfPresent(LiqiApprovalDynamicDO::getApprovalTime, reqVO.getApprovalTime())
                .orderByDesc(LiqiApprovalDynamicDO::getId));
    }

}
