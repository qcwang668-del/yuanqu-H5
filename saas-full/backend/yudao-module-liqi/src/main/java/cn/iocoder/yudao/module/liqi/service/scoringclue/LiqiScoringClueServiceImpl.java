package cn.iocoder.yudao.module.liqi.service.scoringclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.scoringclue.vo.ScoringCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.scoringclue.LiqiScoringClueDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.scoringclue.LiqiScoringClueMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 评分线索 Service 实现类
 */
@Service
@Validated
public class LiqiScoringClueServiceImpl implements LiqiScoringClueService {

    @Resource
    private LiqiScoringClueMapper scoringClueMapper;

    @Override
    public PageResult<LiqiScoringClueDO> getScoringCluePage(ScoringCluePageReqVO pageReqVO) {
        return scoringClueMapper.selectPage(pageReqVO);
    }

}
