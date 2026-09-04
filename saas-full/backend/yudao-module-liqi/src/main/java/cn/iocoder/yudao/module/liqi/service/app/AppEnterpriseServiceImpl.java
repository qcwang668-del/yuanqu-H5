package cn.iocoder.yudao.module.liqi.service.app;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.dal.dataobject.park.LiqiParkDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.park.LiqiParkMapper;
import cn.iocoder.yudao.module.liqi.service.external.EnterpriseProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.RegionQuery;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

@Service
@Validated
public class AppEnterpriseServiceImpl implements AppEnterpriseService {

    @Resource
    private EnterpriseProvider enterpriseProvider;
    @Resource
    private LiqiParkMapper parkMapper;

    @Override
    public PageResult<EnterpriseDTO> listByPark(Long parkId, Integer pageNo, Integer pageSize, String industry) {
        LiqiParkDO park = parkMapper.selectById(parkId);
        RegionQuery q = new RegionQuery();
        q.setPageNo(pageNo == null ? 1 : pageNo);
        q.setPageSize(pageSize == null ? 20 : pageSize);
        q.setIndustry(industry);
        if (park != null) {
            // 园区 → 外部地区查询入参映射
            q.setProvince(park.getRegionProvince());
            q.setCity(park.getCity());
            q.setDistrict(park.getRegionDistrict());
            q.setAddressKeyword(park.getAddressKeyword());
        }
        return enterpriseProvider.searchByRegion(q);
    }

    @Override
    public EnterpriseDTO getBaseInfo(String keyword) {
        return enterpriseProvider.getBaseInfo(keyword);
    }

}
