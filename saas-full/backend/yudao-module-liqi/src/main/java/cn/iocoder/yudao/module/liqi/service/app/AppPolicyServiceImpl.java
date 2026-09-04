package cn.iocoder.yudao.module.liqi.service.app;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.dal.dataobject.bind.LiqiUserEnterpriseBindDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.bind.LiqiUserEnterpriseBindMapper;
import cn.iocoder.yudao.module.liqi.policyops.service.LiqiPolicyService;
import cn.iocoder.yudao.module.liqi.policyops.service.LiqiPolicyServiceImpl;
import cn.iocoder.yudao.module.liqi.service.external.PolicyProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Validated
public class AppPolicyServiceImpl implements AppPolicyService {

    @Resource
    private PolicyProvider policyProvider;
    @Resource
    private LiqiPolicyService liqiPolicyService;
    @Resource
    private LiqiUserEnterpriseBindMapper bindMapper;

    @Override
    public PageResult<PolicyDTO> pagePolicy(PolicyQuery query) {
        String type = query.getType();
        // 园区发布：一律走本地库（园区/协会自主发布）；政府三类走外部 Provider
        if ("park".equals(type)) {
            return liqiPolicyService.pageParkPolicies(query);
        }
        if (type != null && !type.isEmpty()) {
            return policyProvider.pagePolicy(query);
        }
        // 全部（type 为空）：外部政府政策（排除 park，园区以库为准）+ 本地园区政策，合并按发布日期倒序分页
        List<PolicyDTO> govList = policyProvider.pagePolicy(query).getList().stream()
                .filter(x -> !"park".equals(x.getType()))
                .collect(Collectors.toList());
        List<PolicyDTO> parkList = liqiPolicyService.pageParkPolicies(query).getList();
        List<PolicyDTO> merged = new ArrayList<>();
        merged.addAll(govList);
        merged.addAll(parkList);
        merged.sort(Comparator.comparing(PolicyDTO::getPublishDate,
                Comparator.nullsLast(Comparator.reverseOrder())));
        int pageNo = query.getPageNo() == null ? 1 : query.getPageNo();
        int pageSize = query.getPageSize() == null ? 10 : query.getPageSize();
        int from = Math.max(0, (pageNo - 1) * pageSize);
        int to = Math.min(merged.size(), from + pageSize);
        List<PolicyDTO> page = from >= merged.size() ? new ArrayList<>() : merged.subList(from, to);
        return new PageResult<>(page, (long) merged.size());
    }

    @Override
    public PolicyDTO getPolicy(String id) {
        // 园区政策对外 ID 为 "L"+库主键；其余为外部政策
        if (id != null && id.startsWith(LiqiPolicyServiceImpl.PARK_ID_PREFIX)) {
            PolicyDTO park = liqiPolicyService.getParkPolicyDto(id);
            if (park != null) {
                return park;
            }
        }
        return policyProvider.getPolicy(id);
    }

    @Override
    public List<PolicyDTO> matchPolicies(Long userId) {
        LiqiUserEnterpriseBindDO bind = bindMapper.selectByUser(userId);
        if (bind == null) {
            return new ArrayList<>();
        }
        EnterpriseSnapshot snapshot = new EnterpriseSnapshot();
        snapshot.setName(bind.getEnterpriseName());
        snapshot.setCreditCode(bind.getCreditCode());
        snapshot.setRegion(bind.getSnapshotRegion());
        snapshot.setIndustry(bind.getSnapshotIndustry());
        snapshot.setQualifications(bind.getSnapshotQualifications());
        return matchBySnapshot(snapshot);
    }

    @Override
    public List<PolicyDTO> matchBySnapshot(EnterpriseSnapshot snapshot) {
        if (snapshot == null) {
            return new ArrayList<>();
        }
        // 政府政策（外部，排除 park）+ 园区政策（库）合并，按剩余天数升序取前 10
        List<PolicyDTO> merged = new ArrayList<>();
        merged.addAll(policyProvider.matchPolicies(snapshot).stream()
                .filter(x -> !"park".equals(x.getType())).collect(Collectors.toList()));
        merged.addAll(liqiPolicyService.matchParkPolicies(snapshot));
        merged.sort(Comparator.comparing(PolicyDTO::getRemainDays,
                Comparator.nullsLast(Comparator.naturalOrder())));
        return merged.stream().limit(10).collect(Collectors.toList());
    }

}
