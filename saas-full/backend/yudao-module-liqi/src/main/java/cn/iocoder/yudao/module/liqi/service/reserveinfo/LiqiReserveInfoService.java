package cn.iocoder.yudao.module.liqi.service.reserveinfo;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo.vo.ReserveInfoPageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo.LiqiReserveInfoDO;

/**
 * 力企 - 预留信息 Service
 */
public interface LiqiReserveInfoService {

    PageResult<LiqiReserveInfoDO> getReserveInfoPage(ReserveInfoPageReqVO pageReqVO);

}
