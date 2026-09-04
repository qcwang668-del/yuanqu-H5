package cn.iocoder.yudao.module.liqi.service.external;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.RegionQuery;

/**
 * 企业数据 Provider —— 抽象外部企业工商接口（天眼查等）。
 *
 * <p>工商详情复用现有 {@code TycClient}（baseinfo/holder）；
 * "按地区批量搜索企业列表"需天眼查区域搜索权限（当前 landray 代理未开通），
 * 未开通前由 {@code MockEnterpriseProvider} 返回示例。真实实现应加短缓存（~5-10min）。</p>
 */
public interface EnterpriseProvider {

    /** 按地区（园区地址映射的省/市/区 + 关键词）分页搜索企业列表 */
    PageResult<EnterpriseDTO> searchByRegion(RegionQuery query);

    /** 按企业名称/统一社会信用代码查工商详情 */
    EnterpriseDTO getBaseInfo(String keyword);

}
