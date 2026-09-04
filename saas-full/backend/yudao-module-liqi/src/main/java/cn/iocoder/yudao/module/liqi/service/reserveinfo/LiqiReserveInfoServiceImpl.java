package cn.iocoder.yudao.module.liqi.service.reserveinfo;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo.vo.ReserveInfoPageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo.LiqiReserveInfoDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.reserveinfo.LiqiReserveInfoMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 预留信息 Service 实现类
 */
@Service
@Validated
public class LiqiReserveInfoServiceImpl implements LiqiReserveInfoService {

    @Resource
    private LiqiReserveInfoMapper reserveInfoMapper;

    @Override
    public PageResult<LiqiReserveInfoDO> getReserveInfoPage(ReserveInfoPageReqVO pageReqVO) {
        return reserveInfoMapper.selectPage(pageReqVO);
    }

}
