package cn.iocoder.yudao.module.liqi.service.matchclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.matchclue.vo.MatchCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.matchclue.LiqiMatchClueDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.matchclue.LiqiMatchClueMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 匹配线索 Service 实现类
 */
@Service
@Validated
public class LiqiMatchClueServiceImpl implements LiqiMatchClueService {

    @Resource
    private LiqiMatchClueMapper matchClueMapper;

    @Override
    public PageResult<LiqiMatchClueDO> getMatchCluePage(MatchCluePageReqVO pageReqVO) {
        return matchClueMapper.selectPage(pageReqVO);
    }

}
