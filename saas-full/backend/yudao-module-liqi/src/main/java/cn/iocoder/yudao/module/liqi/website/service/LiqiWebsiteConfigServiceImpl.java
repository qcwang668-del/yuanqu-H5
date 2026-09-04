package cn.iocoder.yudao.module.liqi.website.service;

import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.module.liqi.website.controller.admin.vo.WebsiteConfigSaveReqVO;
import cn.iocoder.yudao.module.liqi.website.dal.dataobject.LiqiWebsiteConfigDO;
import cn.iocoder.yudao.module.liqi.website.dal.mysql.LiqiWebsiteConfigMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 网站配置 Service 实现类（单例配置）
 */
@Service
@Validated
public class LiqiWebsiteConfigServiceImpl implements LiqiWebsiteConfigService {

    @Resource
    private LiqiWebsiteConfigMapper websiteConfigMapper;

    @Override
    public LiqiWebsiteConfigDO getConfig() {
        return websiteConfigMapper.selectByTenant();
    }

    @Override
    public void saveConfig(WebsiteConfigSaveReqVO saveReqVO) {
        LiqiWebsiteConfigDO exists = websiteConfigMapper.selectByTenant();
        if (exists == null) {
            // 无配置：新增
            LiqiWebsiteConfigDO insertObj = BeanUtils.toBean(saveReqVO, LiqiWebsiteConfigDO.class);
            insertObj.setId(null);
            websiteConfigMapper.insert(insertObj);
            return;
        }
        // 有配置：更新（沿用已有主键，避免误插多条）
        LiqiWebsiteConfigDO updateObj = BeanUtils.toBean(saveReqVO, LiqiWebsiteConfigDO.class);
        updateObj.setId(exists.getId());
        websiteConfigMapper.updateById(updateObj);
    }

}
