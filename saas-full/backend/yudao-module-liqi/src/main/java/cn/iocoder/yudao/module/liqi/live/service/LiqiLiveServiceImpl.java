package cn.iocoder.yudao.module.liqi.live.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.module.liqi.live.controller.admin.vo.LivePageReqVO;
import cn.iocoder.yudao.module.liqi.live.controller.admin.vo.LiveSaveReqVO;
import cn.iocoder.yudao.module.liqi.live.dal.dataobject.LiqiLiveDO;
import cn.iocoder.yudao.module.liqi.live.dal.mysql.LiqiLiveMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.util.List;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.LIVE_NOT_EXISTS;

/**
 * 力企 - 直播大讲堂 Service 实现
 */
@Service
@Validated
public class LiqiLiveServiceImpl implements LiqiLiveService {

    @Resource
    private LiqiLiveMapper liveMapper;

    @Override
    public Long createLive(LiveSaveReqVO reqVO) {
        LiqiLiveDO live = BeanUtils.toBean(reqVO, LiqiLiveDO.class);
        if (live.getStatus() == null) {
            live.setStatus(0);
        }
        if (live.getSort() == null) {
            live.setSort(0);
        }
        liveMapper.insert(live);
        return live.getId();
    }

    @Override
    public void updateLive(LiveSaveReqVO reqVO) {
        validateExists(reqVO.getId());
        liveMapper.updateById(BeanUtils.toBean(reqVO, LiqiLiveDO.class));
    }

    @Override
    public void deleteLive(Long id) {
        validateExists(id);
        liveMapper.deleteById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        validateExists(id);
        LiqiLiveDO update = new LiqiLiveDO();
        update.setId(id);
        update.setStatus(status);
        liveMapper.updateById(update);
    }

    @Override
    public LiqiLiveDO getLive(Long id) {
        return liveMapper.selectById(id);
    }

    @Override
    public PageResult<LiqiLiveDO> getLivePage(LivePageReqVO reqVO) {
        return liveMapper.selectPage(reqVO);
    }

    @Override
    public List<LiqiLiveDO> listAppLives() {
        return liveMapper.selectAppList();
    }

    private void validateExists(Long id) {
        if (id == null || liveMapper.selectById(id) == null) {
            throw exception(LIVE_NOT_EXISTS);
        }
    }

}
