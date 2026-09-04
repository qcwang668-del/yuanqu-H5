package cn.iocoder.yudao.module.liqi.service.bigmodel;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.BIGMODEL_COMPANY_BLANK;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.BIGMODEL_INVOKE_FAILURE;

/**
 * AISpider 大模型服务客户端（企业政策智能匹配）。
 *
 * <p>接口文档：{@code http://<host>/swagger/}（drf-yasg，basePath 为 {@code /api}）。
 * 该服务无需鉴权，业务接口统一带 {@code /api} 前缀（不带会 404）。
 *
 * <p>已封装接口：
 * <ul>
 *   <li>{@link #companyPolicyMatch(String, Double, Integer)}：企业政策智能匹配（同步），
 *       {@code POST /api/bigmodel/company_policy_match/submit-task-sync/}；
 *       入参公司名（必填）+ 营业收入（万元，可选）+ 社保人数（可选），
 *       返回按大模型综合得分排序的可申报政策列表（含 5 维打分 / 评估理由 / 风险提示 / 匹配等级）。</li>
 * </ul>
 *
 * <p>同步大模型任务实测约 40~60s，超时见 {@link PolicyMatchProperties#getTimeoutMs()}。
 * 本组件只负责「发 HTTP + 解包 + 转标准 JDK 结构」，结果实时透传、不落库。
 */
@Slf4j
@Component
public class PolicyMatchClient {

    /** 企业政策智能匹配（同步） */
    private static final String PATH_COMPANY_POLICY_MATCH = "/api/bigmodel/company_policy_match/submit-task-sync/";

    @Resource
    private PolicyMatchProperties properties;

    /**
     * 企业政策智能匹配（同步）。
     *
     * @param companyName 企业名称（必填）
     * @param revenue     营业收入（万元，可选，前端输入优先）；{@code null} 不传
     * @param staffNum    社保人数（可选，前端输入优先）；{@code null} 不传
     * @return 平台 {@code result} 节点原样结构：{@code {company, total, list:[{projectName, projectId,
     *         publishTime, rank, area, vectorScore, llmScore, matchLevel, riskNotes,
     *         scores:{industry_match,...}, dimensionReasoning:{industry,...}}]}}，已转为标准 JDK Map/List
     */
    public Map<String, Object> companyPolicyMatch(String companyName, Double revenue, Integer staffNum) {
        if (StrUtil.isBlank(companyName)) {
            throw exception(BIGMODEL_COMPANY_BLANK);
        }
        String url = properties.getBaseUrl() + PATH_COMPANY_POLICY_MATCH;
        JSONObject body = new JSONObject();
        body.set("companyName", companyName);
        if (revenue != null) {
            body.set("revenue", revenue);
        }
        if (staffNum != null) {
            body.set("staffNum", staffNum);
        }
        String text;
        try {
            text = HttpRequest.post(url)
                    .header("Content-Type", "application/json")
                    .body(body.toString())
                    .timeout(properties.getTimeoutMs()) // 同步大模型任务较慢（实测约 40~60s），超时放宽
                    .execute().body();
        } catch (Exception e) {
            log.warn("[PolicyMatchClient][companyPolicyMatch] 请求异常 company={}", companyName, e);
            throw exception(BIGMODEL_INVOKE_FAILURE, "网络异常：" + e.getMessage());
        }
        // 平台约定：status=200 成功，result 为业务数据；其余 status 携带 msg 报错
        if (!JSONUtil.isTypeJSON(text)) {
            log.warn("[PolicyMatchClient][companyPolicyMatch] 返回非 JSON：{}", StrUtil.sub(text, 0, 200));
            throw exception(BIGMODEL_INVOKE_FAILURE, "大模型服务返回非 JSON");
        }
        JSONObject raw = JSONUtil.parseObj(text);
        Integer status = raw.getInt("status", -1);
        if (status == null || status != 200) {
            String msg = raw.getStr("msg");
            log.warn("[PolicyMatchClient][companyPolicyMatch] 平台业务错误 status={} msg={}", status, msg);
            throw exception(BIGMODEL_INVOKE_FAILURE, StrUtil.format("status={} {}", status, msg));
        }
        JSONObject result = raw.getJSONObject("result");
        return result == null ? null : toPlainMap(result);
    }

    // ============================== 内部方法 ==============================

    /**
     * 把 hutool JSONObject 递归转为标准 JDK {@code Map/List/String/Number/Boolean/null}，
     * 避免 hutool JSON 类型经 Spring Jackson 序列化时的兼容问题（与 DaasClient 一致）。
     */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> toPlainMap(JSONObject json) {
        return (Map<String, Object>) toPlain(json);
    }

    private static Object toPlain(Object obj) {
        if (obj instanceof JSONObject) {
            Map<String, Object> map = new LinkedHashMap<>();
            ((JSONObject) obj).forEach((k, v) -> map.put(k, toPlain(v)));
            return map;
        }
        if (obj instanceof JSONArray) {
            List<Object> list = new ArrayList<>();
            for (Object item : (JSONArray) obj) {
                list.add(toPlain(item));
            }
            return list;
        }
        return obj; // String / Number / Boolean / null
    }

}
