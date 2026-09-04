package cn.iocoder.yudao.module.liqi.service.app;

import cn.hutool.core.util.ReUtil;
import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.module.liqi.service.external.ApprovalProvider;
import cn.iocoder.yudao.module.liqi.service.external.EnterpriseProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.ApprovalDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 企业获批查询聚合：企业信息（企业信息库）+ 已获批（外部获批接口）+ 可申报（画像匹配）。
 */
@Service
@Validated
public class AppCompanyServiceImpl implements AppCompanyService {

    @Resource
    private EnterpriseProvider enterpriseProvider;
    @Resource
    private ApprovalProvider approvalProvider;
    @Resource
    private AppPolicyService appPolicyService;

    @Override
    public Map<String, Object> checkCompany(String keyword) {
        Map<String, Object> result = new HashMap<>();
        // 1) 企业基本信息（现有企业信息数据库）
        EnterpriseDTO enterprise = enterpriseProvider.getBaseInfo(keyword);
        result.put("enterprise", enterprise);

        // 2) 已获批项目（外部获批接口）
        List<ApprovalDTO> approvals = approvalProvider.listApprovals(keyword);
        result.put("approvals", approvals);

        // 3) 可申报项目（用企业信息库画像匹配政策）
        List<PolicyDTO> policies = appPolicyService.matchBySnapshot(toSnapshot(enterprise));
        result.put("policies", policies);
        return result;
    }

    private static EnterpriseSnapshot toSnapshot(EnterpriseDTO ent) {
        EnterpriseSnapshot s = new EnterpriseSnapshot();
        if (ent == null) {
            return s;
        }
        s.setName(ent.getName());
        s.setCreditCode(ent.getCreditCode());
        s.setRegion(extractRegion(ent.getRegisterAddress()));
        s.setIndustry(ent.getIndustry());
        s.setQualifications(ent.getTags());
        return s;
    }

    /** 从注册地址提取"市/区"规范化地区，与企业绑定逻辑保持一致 */
    private static String extractRegion(String address) {
        if (StrUtil.isBlank(address)) {
            return "";
        }
        String city = ReUtil.get("([一-龥]{2,}?市)", address, 1);
        String district = ReUtil.get("([一-龥]{2,}?[区县])", address, 1);
        StringBuilder sb = new StringBuilder();
        if (StrUtil.isNotBlank(city)) {
            sb.append(city);
        }
        if (StrUtil.isNotBlank(district)) {
            sb.append("/").append(district);
        }
        return sb.length() > 0 ? sb.toString() : address;
    }

}
