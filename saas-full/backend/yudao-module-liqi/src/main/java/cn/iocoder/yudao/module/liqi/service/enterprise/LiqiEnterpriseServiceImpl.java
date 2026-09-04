package cn.iocoder.yudao.module.liqi.service.enterprise;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.enterprise.vo.EnterprisePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise.LiqiEnterpriseDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise.LiqiEnterpriseShareholderDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.enterprise.LiqiEnterpriseMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.enterprise.LiqiEnterpriseShareholderMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 力企 - 企业库 Service 实现类
 */
@Service
@Validated
public class LiqiEnterpriseServiceImpl implements LiqiEnterpriseService {

    @Resource
    private LiqiEnterpriseMapper enterpriseMapper;
    @Resource
    private LiqiEnterpriseShareholderMapper shareholderMapper;
    @Resource
    private TycClient tycClient;

    @Override
    public PageResult<LiqiEnterpriseDO> getEnterprisePage(EnterprisePageReqVO pageReqVO) {
        return enterpriseMapper.selectPage(pageReqVO);
    }

    @Override
    public Map<String, Object> getEnterpriseDetail(Long id) {
        Map<String, Object> result = new LinkedHashMap<>();
        LiqiEnterpriseDO ent = enterpriseMapper.selectById(id);
        result.put("enterprise", ent);
        result.put("shareholders", ent == null ? new ArrayList<>() : shareholderMapper.selectListByEnterpriseId(id));
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> enrich(Long id) {
        LiqiEnterpriseDO ent = enterpriseMapper.selectById(id);
        if (ent == null) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("code", 404);
            r.put("msg", "企业不存在");
            return r;
        }
        // 关键词优先用统一社会信用代码，否则用工商全称
        String keyword = StrUtil.isNotBlank(ent.getCreditCode()) ? ent.getCreditCode() : ent.getEnterpriseName();
        JSONObject base = tycClient.baseInfo(keyword);
        if (base == null) {
            // 查无结果（多为虚构名/简称）
            ent.setEnrichStatus(2);
            ent.setEnrichTime(LocalDateTime.now());
            enterpriseMapper.updateById(ent);
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("code", 0);
            r.put("enriched", false);
            r.put("msg", "天眼查查无结果（需工商登记全称/统一社会信用代码）");
            r.putAll(getEnterpriseDetail(id));
            return r;
        }
        // 映射工商基本信息 → 主表扩展列
        ent.setLegalPerson(strOr(base.getStr("legalPersonName"), ent.getLegalPerson()));
        ent.setRegisteredCapital(strOr(base.getStr("regCapital"), ent.getRegisteredCapital()));
        ent.setIndustry(strOr(base.getStr("industry"), ent.getIndustry()));
        ent.setRegisterAddress(strOr(base.getStr("regLocation"), ent.getRegisterAddress()));
        ent.setCreditCode(base.getStr("creditCode"));
        ent.setRegNumber(base.getStr("regNumber"));
        ent.setOrgNumber(base.getStr("orgNumber"));
        ent.setTaxNumber(base.getStr("taxNumber"));
        ent.setFormerName(base.getStr("historyNames"));
        ent.setCompanyOrgType(base.getStr("companyOrgType"));
        ent.setRegStatus(base.getStr("regStatus"));
        ent.setActualCapital(base.getStr("actualCapital"));
        ent.setStaffNumRange(base.getStr("staffNumRange"));
        ent.setRegInstitute(base.getStr("regInstitute"));
        ent.setBondName(base.getStr("bondName"));
        ent.setBondNum(base.getStr("bondNum"));
        ent.setBusinessScope(base.getStr("businessScope"));
        ent.setTags(base.getStr("tags"));
        Integer socialStaffNum = base.getInt("socialStaffNum");
        if (socialStaffNum != null) {
            ent.setInsuredCount(socialStaffNum);
        }
        ent.setEnrichStatus(1);
        ent.setEnrichTime(LocalDateTime.now());
        enterpriseMapper.updateById(ent);
        // 股东：全量替换
        shareholderMapper.deleteByEnterpriseId(id);
        List<String[]> holders = tycClient.holders(keyword);
        for (String[] h : holders) {
            shareholderMapper.insert(LiqiEnterpriseShareholderDO.builder()
                    .enterpriseId(id).name(h[0]).percent(h[1]).build());
        }
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("code", 0);
        r.put("enriched", true);
        r.put("msg", "回填成功");
        r.putAll(getEnterpriseDetail(id));
        return r;
    }

    private static String strOr(String v, String fallback) {
        return StrUtil.isNotBlank(v) ? v : fallback;
    }

    @Override
    public Map<String, Object> getEnterpriseStats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", enterpriseMapper.selectCount(null));
        result.put("industries", enterpriseMapper.selectIndustryCount());
        // 榜单：参保人数 Top 10 企业
        List<Map<String, Object>> topList = new ArrayList<>();
        for (LiqiEnterpriseDO e : enterpriseMapper.selectTop(10)) {
            Map<String, Object> t = new LinkedHashMap<>();
            t.put("name", e.getEnterpriseName());
            t.put("value", e.getInsuredCount());
            topList.add(t);
        }
        result.put("topList", topList);
        return result;
    }

}
