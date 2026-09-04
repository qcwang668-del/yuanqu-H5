package cn.iocoder.yudao.module.liqi.policyops.service;

import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo.PolicyPageReqVO;
import cn.iocoder.yudao.module.liqi.policyops.controller.admin.vo.PolicySaveReqVO;
import cn.iocoder.yudao.module.liqi.policyops.dal.dataobject.LiqiPolicyDO;
import cn.iocoder.yudao.module.liqi.policyops.dal.mysql.LiqiPolicyMapper;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.*;

/**
 * 力企 - 园区政策库 Service 实现
 */
@Service
@Validated
public class LiqiPolicyServiceImpl implements LiqiPolicyService {

    /** 园区政策对外 ID 前缀，与外部政策（P 开头）区分 */
    public static final String PARK_ID_PREFIX = "L";

    @Resource
    private LiqiPolicyMapper policyMapper;

    @Override
    public Long createPolicy(PolicySaveReqVO reqVO) {
        LiqiPolicyDO policy = BeanUtils.toBean(reqVO, LiqiPolicyDO.class);
        if (StrUtil.isBlank(policy.getType())) {
            policy.setType("park");
        }
        if (StrUtil.isBlank(policy.getVisibleScope())) {
            policy.setVisibleScope("all");
        }
        if (policy.getStatus() == null) {
            policy.setStatus(0);
        }
        if (policy.getPublishDate() == null) {
            policy.setPublishDate(LocalDate.now());
        }
        policyMapper.insert(policy);
        return policy.getId();
    }

    @Override
    public void updatePolicy(PolicySaveReqVO reqVO) {
        validateExists(reqVO.getId());
        LiqiPolicyDO update = BeanUtils.toBean(reqVO, LiqiPolicyDO.class);
        policyMapper.updateById(update);
    }

    @Override
    public void deletePolicy(Long id) {
        validateExists(id);
        policyMapper.deleteById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        validateExists(id);
        LiqiPolicyDO update = new LiqiPolicyDO();
        update.setId(id);
        update.setStatus(status);
        policyMapper.updateById(update);
    }

    @Override
    public LiqiPolicyDO getPolicy(Long id) {
        return policyMapper.selectById(id);
    }

    @Override
    public PageResult<LiqiPolicyDO> getPolicyPage(PolicyPageReqVO reqVO) {
        return policyMapper.selectPage(reqVO);
    }

    @Override
    public List<LiqiPolicyDO> listOnlineParkPolicies() {
        return policyMapper.selectOnlineParkPolicies();
    }

    @Override
    public PolicyDTO getParkPolicyDto(String externalId) {
        if (externalId == null || !externalId.startsWith(PARK_ID_PREFIX)) {
            return null;
        }
        Long id;
        try {
            id = Long.valueOf(externalId.substring(PARK_ID_PREFIX.length()));
        } catch (NumberFormatException e) {
            return null;
        }
        LiqiPolicyDO policy = policyMapper.selectById(id);
        if (policy == null || policy.getStatus() != null && policy.getStatus() != 0) {
            return null;
        }
        return toDto(policy);
    }

    @Override
    public PageResult<PolicyDTO> pageParkPolicies(PolicyQuery q) {
        List<PolicyDTO> all = policyMapper.selectOnlineParkPolicies().stream()
                .map(LiqiPolicyServiceImpl::toDto)
                .collect(Collectors.toList());
        List<PolicyDTO> filtered = all.stream()
                .filter(x -> StrUtil.isBlank(q.getKeyword())
                        || StrUtil.contains(x.getTitle(), q.getKeyword())
                        || (x.getSummary() != null && StrUtil.contains(x.getSummary(), q.getKeyword())))
                .filter(x -> StrUtil.isBlank(q.getRegion()) || matchRegion(x.getRegion(), q.getRegion()))
                .filter(x -> StrUtil.isBlank(q.getIndustry())
                        || (x.getIndustry() != null && x.getIndustry().contains(q.getIndustry())))
                .filter(x -> StrUtil.isBlank(q.getCategory())
                        || (x.getTags() != null && x.getTags().contains(q.getCategory())))
                .sorted(Comparator.comparing(PolicyDTO::getPublishDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
        int total = filtered.size();
        int pageNo = q.getPageNo() == null ? 1 : q.getPageNo();
        int pageSize = q.getPageSize() == null ? 10 : q.getPageSize();
        int from = Math.max(0, (pageNo - 1) * pageSize);
        int to = Math.min(total, from + pageSize);
        List<PolicyDTO> page = from >= total ? new ArrayList<>() : filtered.subList(from, to);
        return new PageResult<>(page, (long) total);
    }

    @Override
    public List<PolicyDTO> matchParkPolicies(EnterpriseSnapshot s) {
        if (s == null) {
            return new ArrayList<>();
        }
        return policyMapper.selectOnlineParkPolicies().stream()
                .map(LiqiPolicyServiceImpl::toDto)
                .filter(x -> matchRegion(x.getRegion(), s.getRegion())
                        || (StrUtil.isNotBlank(s.getIndustry()) && x.getIndustry() != null
                            && (x.getIndustry().contains(s.getIndustry()) || s.getIndustry().contains(x.getIndustry())))
                        || matchQualification(x.getTags(), s.getQualifications()))
                .sorted(Comparator.comparing(PolicyDTO::getRemainDays,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(10)
                .collect(Collectors.toList());
    }

    /** 地区命中：政策地区含"全国"或与企业地区互相包含 */
    private boolean matchRegion(String policyRegion, String userRegion) {
        if (StrUtil.isBlank(policyRegion) || StrUtil.isBlank(userRegion)) {
            return false;
        }
        if (policyRegion.contains("全国")) {
            return true;
        }
        return policyRegion.contains(userRegion) || userRegion.contains(policyRegion);
    }

    /** 资质命中：政策标签与企业资质有交集（高企↔高新技术、专精特新等） */
    private boolean matchQualification(List<String> tags, String qualifications) {
        if (tags == null || StrUtil.isBlank(qualifications)) {
            return false;
        }
        return tags.stream().anyMatch(t -> {
            if (t.contains("高企") && qualifications.contains("高新技术")) return true;
            if (t.contains("专精特新") && qualifications.contains("专精特新")) return true;
            return qualifications.contains(t);
        });
    }

    private void validateExists(Long id) {
        if (id == null || policyMapper.selectById(id) == null) {
            throw exception(POLICY_NOT_EXISTS);
        }
    }

    /** 园区政策 DO → 统一 PolicyDTO（供 PolicyProvider 合并到政策流） */
    public static PolicyDTO toDto(LiqiPolicyDO p) {
        return PolicyDTO.builder()
                .id(PARK_ID_PREFIX + p.getId())
                .title(p.getTitle())
                .type(StrUtil.isBlank(p.getType()) ? "park" : p.getType())
                .subsidyMax(p.getSubsidyMax())
                .region(p.getRegion())
                .industry(p.getIndustry())
                .tags(splitTags(p.getTags(), p.getCategory()))
                .deadline(p.getDeadline() == null ? null : p.getDeadline().toString())
                .remainDays(remainDays(p.getDeadline()))
                .publishOrg(StrUtil.isBlank(p.getPublishOrg()) ? p.getParkName() : p.getPublishOrg())
                .publishDate(p.getPublishDate() == null ? null : p.getPublishDate().toString())
                .parkName(p.getParkName())
                .summary(p.getSummary())
                .content(StrUtil.isBlank(p.getContent()) ? p.getSummary() : p.getContent())
                .attachments(new ArrayList<>())
                .sourceUrl(p.getSourceUrl() == null ? "" : p.getSourceUrl())
                .build();
    }

    private static List<String> splitTags(String tags, String category) {
        List<String> list = new ArrayList<>();
        if (StrUtil.isNotBlank(tags)) {
            list.addAll(Arrays.stream(tags.split("[;,；，]"))
                    .map(String::trim).filter(StrUtil::isNotBlank).collect(Collectors.toList()));
        }
        if (StrUtil.isNotBlank(category) && !list.contains(category)) {
            list.add(category);
        }
        return list;
    }

    private static Integer remainDays(LocalDate deadline) {
        if (deadline == null) {
            return null;
        }
        long days = ChronoUnit.DAYS.between(LocalDate.now(), deadline);
        return days >= 0 ? (int) days : (int) days; // 负数表示已过期，仍展示
    }

}
