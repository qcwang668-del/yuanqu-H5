package cn.iocoder.yudao.module.liqi.service.app;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;

/**
 * 力企 C 端 - 企业 Service（数据来自外部 EnterpriseProvider / 天眼查，本地不落全量）
 */
public interface AppEnterpriseService {

    /** 按园区 ID（地区映射）实时拉取外部最新企业列表 */
    PageResult<EnterpriseDTO> listByPark(Long parkId, Integer pageNo, Integer pageSize, String industry);

    /** 按关键词（企业名/信用代码）查工商详情，用于绑定前确认 */
    EnterpriseDTO getBaseInfo(String keyword);

}
