package cn.iocoder.yudao.module.liqi.service.matchclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.matchclue.vo.MatchCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.matchclue.LiqiMatchClueDO;

/**
 * 力企 - 匹配线索 Service
 */
public interface LiqiMatchClueService {

    PageResult<LiqiMatchClueDO> getMatchCluePage(MatchCluePageReqVO pageReqVO);

}
