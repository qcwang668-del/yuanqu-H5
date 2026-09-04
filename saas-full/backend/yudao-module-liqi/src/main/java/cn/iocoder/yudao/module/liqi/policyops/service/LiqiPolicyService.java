package cn.iocoder.yudao.module.liqi.policyops.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo.PolicyPageReqVO;
import cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo.PolicySaveReqVO;
import cn.iocoder.yudao.module.liqi.policyops.dal.dataobject.LiqiPolicyDO;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;

import java.util.List;

/**
 * 力企 - 园区政策库 Service（园区/协会自主发布）
 */
public interface LiqiPolicyService {

    Long createPolicy(PolicySaveReqVO reqVO);

    void updatePolicy(PolicySaveReqVO reqVO);

    void deletePolicy(Long id);

    /** 上架/下架（status：0 上架 1 下架） */
    void updateStatus(Long id, Integer status);

    LiqiPolicyDO getPolicy(Long id);

    PageResult<LiqiPolicyDO> getPolicyPage(PolicyPageReqVO reqVO);

    /** 已上架的园区发布政策（供 PolicyProvider 合并；政府政策仍走外部 Provider） */
    List<LiqiPolicyDO> listOnlineParkPolicies();

    /** 按对外 ID（"L"+id）查单条园区政策，转成统一 PolicyDTO */
    PolicyDTO getParkPolicyDto(String externalId);

    /** C 端：园区发布政策分页（合并进政策流的 type=park 分支），按 PolicyQuery 条件过滤 */
    PageResult<PolicyDTO> pageParkPolicies(PolicyQuery query);

    /** C 端：按企业画像匹配园区发布政策（智能匹配/精准推送共用） */
    List<PolicyDTO> matchParkPolicies(EnterpriseSnapshot snapshot);

}
