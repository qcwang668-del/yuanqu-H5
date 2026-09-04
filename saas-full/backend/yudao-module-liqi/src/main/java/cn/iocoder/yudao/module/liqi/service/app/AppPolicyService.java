package cn.iocoder.yudao.module.liqi.service.app;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;

import java.util.List;

/**
 * 力企 C 端 - 政策 Service（数据来自外部 PolicyProvider，本地不落库）
 */
public interface AppPolicyService {

    PageResult<PolicyDTO> pagePolicy(PolicyQuery query);

    PolicyDTO getPolicy(String id);

    /** 智能匹配：按用户绑定企业画像匹配可申报政策 */
    List<PolicyDTO> matchPolicies(Long userId);

    /** 按指定企业画像匹配可申报政策（智能匹配 / 企业获批查询共用） */
    List<PolicyDTO> matchBySnapshot(EnterpriseSnapshot snapshot);

}
