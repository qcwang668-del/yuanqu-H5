package cn.iocoder.yudao.module.liqi.dal.mysql.memberclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.controller.admin.memberclue.vo.MemberCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.memberclue.LiqiMemberClueDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 会员线索 Mapper
 */
@Mapper
public interface LiqiMemberClueMapper extends BaseMapperX<LiqiMemberClueDO> {

    default PageResult<LiqiMemberClueDO> selectPage(MemberCluePageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiMemberClueDO>()
                .likeIfPresent(LiqiMemberClueDO::getEnterpriseName, reqVO.getEnterpriseName())
                .eqIfPresent(LiqiMemberClueDO::getClueType, reqVO.getClueType())
                .likeIfPresent(LiqiMemberClueDO::getRegisterAddress, reqVO.getRegisterAddress())
                .eqIfPresent(LiqiMemberClueDO::getSource, reqVO.getSource())
                .eqIfPresent(LiqiMemberClueDO::getStatus, reqVO.getStatus())
                .betweenIfPresent(LiqiMemberClueDO::getCreateTime, reqVO.getCreateTime())
                .orderByDesc(LiqiMemberClueDO::getId));
    }

}
