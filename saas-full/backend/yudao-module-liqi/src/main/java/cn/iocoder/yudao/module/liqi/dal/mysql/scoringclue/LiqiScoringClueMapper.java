package cn.iocoder.yudao.module.liqi.dal.mysql.scoringclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.controller.admin.scoringclue.vo.ScoringCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.scoringclue.LiqiScoringClueDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 评分线索 Mapper
 */
@Mapper
public interface LiqiScoringClueMapper extends BaseMapperX<LiqiScoringClueDO> {

    default PageResult<LiqiScoringClueDO> selectPage(ScoringCluePageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiScoringClueDO>()
                .likeIfPresent(LiqiScoringClueDO::getUserName, reqVO.getUserName())
                .likeIfPresent(LiqiScoringClueDO::getPhone, reqVO.getPhone())
                .eqIfPresent(LiqiScoringClueDO::getClueSource, reqVO.getClueSource())
                .likeIfPresent(LiqiScoringClueDO::getCompanyName, reqVO.getCompanyName())
                .eqIfPresent(LiqiScoringClueDO::getContactInformation, reqVO.getContactInformation())
                .betweenIfPresent(LiqiScoringClueDO::getScoreTime, reqVO.getScoreTime())
                .orderByDesc(LiqiScoringClueDO::getId));
    }

}
