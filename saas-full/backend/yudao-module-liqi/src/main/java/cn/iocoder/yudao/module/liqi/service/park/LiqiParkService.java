package cn.iocoder.yudao.module.liqi.service.park;

import cn.iocoder.yudao.module.liqi.dal.dataobject.park.LiqiParkDO;

import java.util.List;

/**
 * 力企 - 园区 Service
 */
public interface LiqiParkService {

    /** 获取启用的园区列表（下拉用） */
    List<LiqiParkDO> getEnabledParkList();

    /** 获取园区 */
    LiqiParkDO getPark(Long id);

}
