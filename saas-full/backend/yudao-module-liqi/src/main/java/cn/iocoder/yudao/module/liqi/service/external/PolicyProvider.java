package cn.iocoder.yudao.module.liqi.service.external;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;

import java.util.List;

/**
 * 政策数据 Provider —— 抽象外部政策数据接口。
 *
 * <p>当前由 {@code MockPolicyProvider} 提供内置示例数据；
 * 真实政策接口文档到位后，新增一个实现（如 {@code RemotePolicyProvider}）并替换注入即可，
 * 上层 app-api / Service 零改动。真实实现应在本层加 Redis 缓存（详情 ~24h）。</p>
 */
public interface PolicyProvider {

    /** 政策分页列表（支持类型/关键词/地区/行业/分类筛选） */
    PageResult<PolicyDTO> pagePolicy(PolicyQuery query);

    /** 政策详情（正文/附件） */
    PolicyDTO getPolicy(String id);

    /** 按企业画像智能匹配可申报政策（智能匹配、精准推送共用） */
    List<PolicyDTO> matchPolicies(EnterpriseSnapshot snapshot);

}
