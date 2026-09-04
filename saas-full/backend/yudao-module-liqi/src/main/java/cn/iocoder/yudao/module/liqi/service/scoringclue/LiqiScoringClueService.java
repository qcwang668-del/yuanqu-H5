package cn.iocoder.yudao.module.liqi.service.scoringclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.scoringclue.vo.ScoringCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.scoringclue.LiqiScoringClueDO;

/**
 * 力企 - 评分线索 Service 接口
 */
public interface LiqiScoringClueService {

    /**
     * 获得评分线索分页
     *
     * @param pageReqVO 分页查询
     * @return 评分线索分页
     */
    PageResult<LiqiScoringClueDO> getScoringCluePage(ScoringCluePageReqVO pageReqVO);

}
