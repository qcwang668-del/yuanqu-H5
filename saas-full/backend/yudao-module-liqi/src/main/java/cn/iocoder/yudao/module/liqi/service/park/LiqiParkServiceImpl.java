package cn.iocoder.yudao.module.liqi.service.park;

import cn.iocoder.yudao.module.liqi.dal.dataobject.park.LiqiParkDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.park.LiqiParkMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.util.List;

/**
 * 力企 - 园区 Service 实现类
 */
@Service
@Validated
public class LiqiParkServiceImpl implements LiqiParkService {

    @Resource
    private LiqiParkMapper parkMapper;

    @Override
    public List<LiqiParkDO> getEnabledParkList() {
        return parkMapper.selectEnabledList();
    }

    @Override
    public LiqiParkDO getPark(Long id) {
        return parkMapper.selectById(id);
    }

}
