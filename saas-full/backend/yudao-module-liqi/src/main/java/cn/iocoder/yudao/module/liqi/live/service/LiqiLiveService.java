package cn.iocoder.yudao.module.liqi.live.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.live.controller.admin.vo.LivePageReqVO;
import cn.iocoder.yudao.module.liqi.live.controller.admin.vo.LiveSaveReqVO;
import cn.iocoder.yudao.module.liqi.live.dal.dataobject.LiqiLiveDO;

import java.util.List;

/**
 * 力企 - 直播大讲堂 Service
 */
public interface LiqiLiveService {

    Long createLive(LiveSaveReqVO reqVO);

    void updateLive(LiveSaveReqVO reqVO);

    void deleteLive(Long id);

    void updateStatus(Long id, Integer status);

    LiqiLiveDO getLive(Long id);

    PageResult<LiqiLiveDO> getLivePage(LivePageReqVO reqVO);

    /** C 端：未下架直播列表（预告/直播中/回放） */
    List<LiqiLiveDO> listAppLives();

}
