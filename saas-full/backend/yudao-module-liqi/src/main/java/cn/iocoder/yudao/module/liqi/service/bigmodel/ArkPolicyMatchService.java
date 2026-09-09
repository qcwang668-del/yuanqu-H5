package cn.iocoder.yudao.module.liqi.service.bigmodel;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.iocoder.yudao.module.liqi.service.agent.LlmChatClient;
import cn.iocoder.yudao.module.liqi.service.app.AppPolicyService;
import cn.iocoder.yudao.module.liqi.service.external.EnterpriseProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseSnapshot;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.BIGMODEL_COMPANY_BLANK;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.BIGMODEL_INVOKE_FAILURE;

@Slf4j
@Service
public class ArkPolicyMatchService {

    private static final String SCORING_SYS =
            "你是资深惠企政策申报顾问，熟悉国家及地方产业扶持政策、高新技术企业与专精特新认定、研发费用加计扣除、"
          + "设备更新改造、创业就业补贴等申报口径。你的任务是判断给定企业与候选政策的匹配度。\n"
          + "评分维度（均为 0~1 的小数，保留两位）：\n"
          + "industry_match 行业匹配度；capability_match 能力/经营范围匹配度；cert_match 资质与信誉匹配度；"
          + "region_match 地区匹配度；scale_match 规模（营收/人数）匹配度。\n"
          + "严格要求：\n"
          + "1) 只输出 JSON，不要 Markdown 代码块、不要任何解释性文字；\n"
          + "2) 信息不足时按保守估计给分，不要编造企业未提供的资质或数据；\n"
          + "3) matchLevel 只能取「高度匹配」「中度匹配」「弱匹配」三者之一；\n"
          + "4) riskNotes 用一句话说明申报风险或缺口，无明显风险填空字符串。";

    private static final int CANDIDATE_LIMIT = 10;

    @Resource
    private LlmChatClient llmChatClient;
    @Resource
    private AppPolicyService appPolicyService;
    @Resource
    private EnterpriseProvider enterpriseProvider;

    public Map<String, Object> companyPolicyMatch(String companyName, Double revenue, Integer staffNum) {
        if (StrUtil.isBlank(companyName)) {
            throw exception(BIGMODEL_COMPANY_BLANK);
        }
        EnterpriseSnapshot snapshot = loadSnapshot(companyName);
        List<PolicyDTO> candidates = appPolicyService.matchBySnapshot(snapshot);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("company", companyName);
        if (candidates.isEmpty()) {
            result.put("total", 0);
            result.put("list", new ArrayList<>());
            return result;
        }
        if (candidates.size() > CANDIDATE_LIMIT) {
            candidates = candidates.subList(0, CANDIDATE_LIMIT);
        }
        JSONArray scored = scoreByLlm(companyName, snapshot, revenue, staffNum, candidates);
        List<Map<String, Object>> list = mergeScores(candidates, scored);
        result.put("total", list.size());
        result.put("list", list);
        return result;
    }

    private EnterpriseSnapshot loadSnapshot(String companyName) {
        EnterpriseSnapshot snapshot = new EnterpriseSnapshot();
        snapshot.setName(companyName);
        try {
            EnterpriseDTO ent = enterpriseProvider.getBaseInfo(companyName);
            if (ent != null) {
                snapshot.setCreditCode(ent.getCreditCode());
                snapshot.setIndustry(ent.getIndustry());
                snapshot.setQualifications(ent.getTags());
                snapshot.setRegion(extractRegion(ent.getRegisterAddress()));
            }
        } catch (Exception e) {
            log.warn("[ArkPolicyMatch] 企业画像查询失败，降级为仅按企业名匹配", e);
        }
        return snapshot;
    }

    private static String extractRegion(String address) {
        if (StrUtil.isBlank(address)) return "";
        String city = cn.hutool.core.util.ReUtil.get("([一-龥]{2,}?市)", address, 1);
        String district = cn.hutool.core.util.ReUtil.get("([一-龥]{2,}?[区县])", address, 1);
        StringBuilder sb = new StringBuilder();
        if (StrUtil.isNotBlank(city)) sb.append(city);
        if (StrUtil.isNotBlank(district)) sb.append("/").append(district);
        return sb.length() > 0 ? sb.toString() : address;
    }

    private JSONArray scoreByLlm(String companyName, EnterpriseSnapshot snapshot,
                                 Double revenue, Integer staffNum, List<PolicyDTO> candidates) {
        StringBuilder user = new StringBuilder();
        user.append("【企业信息】\n").append("企业名称：").append(companyName).append("\n");
        appendIfPresent(user, "所属行业", snapshot.getIndustry());
        appendIfPresent(user, "所在地区", snapshot.getRegion());
        appendIfPresent(user, "资质标签", snapshot.getQualifications());
        if (revenue != null) user.append("营业收入：").append(revenue).append(" 万元\n");
        if (staffNum != null) user.append("社保人数：").append(staffNum).append(" 人\n");
        user.append("\n【候选政策】\n");
        for (int i = 0; i < candidates.size(); i++) {
            PolicyDTO p = candidates.get(i);
            user.append(i + 1).append(". 标题：").append(StrUtil.blankToDefault(p.getTitle(), "")).append("\n");
            appendIfPresent(user, "   地区", p.getRegion());
            appendIfPresent(user, "   行业", p.getIndustry());
            appendIfPresent(user, "   最高补贴(万元)", p.getSubsidyMax());
            appendIfPresent(user, "   截止日期", p.getDeadline());
            String brief = StrUtil.blankToDefault(p.getSummary(), p.getContent());
            if (StrUtil.isNotBlank(brief))
                user.append("   摘要：").append(StrUtil.sub(brief, 0, 300)).append("\n");
        }
        user.append("\n请对上述 ").append(candidates.size()).append(" 条政策逐条评估，按如下 JSON 结构输出，")
            .append("items 顺序与候选政策编号一一对应：\n")
            .append("{\"items\":[{\"index\":1,\"scores\":{\"industry_match\":0.00,\"capability_match\":0.00,")
            .append("\"cert_match\":0.00,\"region_match\":0.00,\"scale_match\":0.00},")
            .append("\"llmScore\":0.00,\"matchLevel\":\"高度匹配\",\"riskNotes\":\"\",")
            .append("\"dimensionReasoning\":{\"industry\":\"\",\"capability\":\"\",\"cert\":\"\",")
            .append("\"region\":\"\",\"scale\":\"\"}}]}");

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(LlmChatClient.msg("system", SCORING_SYS));
        messages.add(LlmChatClient.msg("user", user.toString()));
        StringBuilder buf = new StringBuilder();
        try {
            llmChatClient.chatStream(null, messages, null, delta -> buf.append(delta));
        } catch (Exception e) {
            log.warn("[ArkPolicyMatch] 大模型调用失败 company={}", companyName, e);
            throw exception(BIGMODEL_INVOKE_FAILURE, e.getMessage());
        }
        return parseItems(buf.toString());
    }

    private JSONArray parseItems(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start < 0 || end <= start) {
            log.warn("[ArkPolicyMatch] 模型输出无 JSON：{}", StrUtil.sub(text, 0, 300));
            throw exception(BIGMODEL_INVOKE_FAILURE, "大模型返回结果无法解析");
        }
        String json = text.substring(start, end + 1);
        if (!JSONUtil.isTypeJSON(json)) {
            log.warn("[ArkPolicyMatch] 模型输出非 JSON：{}", StrUtil.sub(text, 0, 300));
            throw exception(BIGMODEL_INVOKE_FAILURE, "大模型返回结果无法解析");
        }
        JSONArray items = JSONUtil.parseObj(json).getJSONArray("items");
        if (items == null) {
            throw exception(BIGMODEL_INVOKE_FAILURE, "大模型返回结果缺少 items");
        }
        return items;
    }

    private List<Map<String, Object>> mergeScores(List<PolicyDTO> candidates, JSONArray items) {
        Map<Integer, JSONObject> byIndex = new LinkedHashMap<>();
        for (int i = 0; i < items.size(); i++) {
            JSONObject item = items.getJSONObject(i);
            if (item == null) continue;
            byIndex.put(item.getInt("index", i + 1), item);
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (int i = 0; i < candidates.size(); i++) {
            PolicyDTO p = candidates.get(i);
            JSONObject item = byIndex.get(i + 1);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("projectName", p.getTitle());
            row.put("projectId", p.getId());
            row.put("publishTime", p.getPublishDate());
            row.put("rank", StrUtil.blankToDefault(p.getType(), "policy"));
            row.put("area", p.getRegion());
            row.put("vectorScore", null);
            if (item == null) {
                row.put("llmScore", 0);
                row.put("matchLevel", "弱匹配");
                row.put("riskNotes", "");
                row.put("scores", new LinkedHashMap<String, Object>());
                row.put("dimensionReasoning", new LinkedHashMap<String, Object>());
            } else {
                row.put("llmScore", item.get("llmScore"));
                row.put("matchLevel", item.getStr("matchLevel", ""));
                row.put("riskNotes", item.getStr("riskNotes", ""));
                row.put("scores", toPlain(item.getJSONObject("scores")));
                row.put("dimensionReasoning", toPlain(item.getJSONObject("dimensionReasoning")));
            }
            list.add(row);
        }
        return list;
    }

    private static Map<String, Object> toPlain(JSONObject json) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (json == null) return map;
        for (String key : json.keySet())
            map.put(key, json.get(key) instanceof JSONObject ? toPlain((JSONObject) json.get(key)) : json.get(key));
        return map;
    }

    private static void appendIfPresent(StringBuilder sb, String label, String value) {
        if (StrUtil.isNotBlank(value)) sb.append(label).append("：").append(value).append("\n");
    }
}
