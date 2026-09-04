package cn.iocoder.yudao.module.liqi.dal.mysql.matchclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.controller.admin.matchclue.vo.MatchCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.matchclue.LiqiMatchClueDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 匹配线索 Mapper
 */
@Mapper
public interface LiqiMatchClueMapper extends BaseMapperX<LiqiMatchClueDO> {

    default PageResult<LiqiMatchClueDO> selectPage(MatchCluePageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiMatchClueDO>()
                .likeIfPresent(LiqiMatchClueDO::getReserveUserName, reqVO.getReserveUserName())
                .likeIfPresent(LiqiMatchClueDO::getReservePhone, reqVO.getReservePhone())
                .eqIfPresent(LiqiMatchClueDO::getSource, reqVO.getSource())
                .likeIfPresent(LiqiMatchClueDO::getContent, reqVO.getContent())
                .eqIfPresent(LiqiMatchClueDO::getReserveType, reqVO.getReserveType())
                .eqIfPresent(LiqiMatchClueDO::getReserveWay, reqVO.getReserveWay())
                .betweenIfPresent(LiqiMatchClueDO::getReserveTime, reqVO.getReserveTime())
                .orderByDesc(LiqiMatchClueDO::getId));
    }

}
