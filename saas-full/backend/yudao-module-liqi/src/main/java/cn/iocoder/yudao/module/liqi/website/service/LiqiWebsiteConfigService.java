package cn.iocoder.yudao.module.liqi.website.service;

import cn.iocoder.yudao.module.liqi.website.controller.admin.vo.WebsiteConfigSaveReqVO;
import cn.iocoder.yudao.module.liqi.website.dal.dataobject.LiqiWebsiteConfigDO;

import javax.validation.Valid;

/**
 * 力企 - 网站配置 Service（单例配置）
 */
public interface LiqiWebsiteConfigService {

    /**
     * 获得当前租户的网站配置（无则返回 null）
     */
    LiqiWebsiteConfigDO getConfig();

    /**
     * 保存网站配置（有则更新，无则新增）
     */
    void saveConfig(@Valid WebsiteConfigSaveReqVO saveReqVO);

}
