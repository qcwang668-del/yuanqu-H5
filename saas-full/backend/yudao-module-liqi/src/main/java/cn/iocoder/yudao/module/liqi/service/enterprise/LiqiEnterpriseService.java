package cn.iocoder.yudao.module.liqi.service.enterprise;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.enterprise.vo.EnterprisePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise.LiqiEnterpriseDO;

import java.util.Map;

/**
 * 力企 - 企业库 Service
 */
public interface LiqiEnterpriseService {

    PageResult<LiqiEnterpriseDO> getEnterprisePage(EnterprisePageReqVO pageReqVO);

    /** 企业统计（供园区大屏调用）：total 总数、industries 行业分布、topList 榜单 */
    Map<String, Object> getEnterpriseStats();

    /** 企业详情：主表全字段 + 股东子表 */
    Map<String, Object> getEnterpriseDetail(Long id);

    /**
     * 按需实时调天眼查回填企业工商信息 + 股东，写入企业库并返回最新详情。
     * 天眼查仅认工商登记全称/统一社会信用代码；虚构名/简称查无结果时 enrichStatus=2。
     */
    Map<String, Object> enrich(Long id);

}
