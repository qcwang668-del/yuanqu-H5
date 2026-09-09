package cn.iocoder.yudao.module.liqi.service.daas;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.iocoder.yudao.module.liqi.controller.admin.daas.vo.QiYeInfoRespVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.DAAS_ENTITY_ID_BLANK;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.DAAS_INVOKE_FAILURE;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.DAAS_KEYWORD_BLANK;
import static cn.iocoder.yudao.module.liqi.enums.ErrorCodeConstants.DAAS_POLICY_ID_BLANK;

/**
 * 力企云 DaaS 企业数据平台客户端。
 *
 * <p>鉴权：每次请求在请求头携带 {@code appKey / timestamp(毫秒) / nonce(UUID) / sign}，
 * 其中 {@code sign = MD5(appKey + timestamp + nonce + appSecret)}（小写 32 位 HEX）。
 *
 * <p>已封装接口：
 * <ul>
 *   <li>{@link #getBaseInfo(String)}：企业基本信息（GET，{@code /api/business/qiyedata/qiye-base-info}），按 entityId 查详情；</li>
 *   <li>{@link #fuzzyMatch(String, Integer, Integer)}：企业模糊匹配（POST，{@code /api/bizPolicydata/qiye-fuzzy-matching}），关键词搜企业。</li>
 * </ul>
 *
 * <p>本组件只负责「签名 + 发 HTTP + 解包」，后端任意 Service 可 {@code @Resource} 注入复用；
 * REST 入口见 {@code LiqiDaasController}。
 */
@Slf4j
@Component
public class DaasClient {

    /** 企业基本信息（GET） */
    private static final String PATH_BASE_INFO = "/api/business/qiyedata/qiye-base-info";
    /** 企业模糊匹配（POST JSON） */
    private static final String PATH_FUZZY_MATCH = "/api/bizPolicydata/qiye-fuzzy-matching";
    /** 政策列表（POST JSON） */
    private static final String PATH_POLICY_LIST = "/api/bizPolicydata/policy-list";
    /**
     * 政策详情（GET，ID 拼在路径末尾）。
     *
     * <p>注意：平台文档写的是 {@code ?id=xxx} 查询参数形式，实测返回 {@code 400 请求参数不正确}，
     * 真实可用形式为路径式 {@code /policy-detail/{id}}，故此处按路径式拼接。</p>
     */
    private static final String PATH_POLICY_DETAIL = "/api/bizPolicydata/policy-detail/";

    /** 平台对 pageSize 的硬上限，超过返回「参数错误,pageSize不能超过50.」 */
    public static final int POLICY_PAGE_SIZE_MAX = 50;

    @Resource
    private DaasProperties properties;

    // ============================== 业务接口 ==============================

    /**
     * 企业基本信息（详情）。
     *
     * @param entityId 统一社会信用代码 / 唯一 id（必填）
     * @return 企业详情；查无结果（data 为空）时返回 {@code null}
     */
    public QiYeInfoRespVO getBaseInfo(String entityId) {
        if (StrUtil.isBlank(entityId)) {
            throw exception(DAAS_ENTITY_ID_BLANK);
        }
        String url = properties.getBaseUrl() + PATH_BASE_INFO;
        String text;
        try {
            HttpRequest request = HttpRequest.get(url)
                    .form("entityId", entityId) // GET：form 参数拼到 query string
                    .timeout(properties.getTimeoutGetMs());
            signHeaders().forEach(request::header);
            text = request.execute().body();
        } catch (Exception e) {
            log.warn("[DaasClient][getBaseInfo] 请求异常 entityId={}", entityId, e);
            throw exception(DAAS_INVOKE_FAILURE, "网络异常：" + e.getMessage());
        }
        JSONObject data = unwrap(text, "qiye-base-info");
        return data == null ? null : data.toBean(QiYeInfoRespVO.class);
    }

    /**
     * 企业模糊匹配（关键词搜企业，分页）。
     *
     * @param keyword 企业名称关键词（必填，模糊匹配）
     * @param page    页码，从 1 开始；{@code null} 不传由平台默认
     * @param size    每页条数；{@code null} 不传由平台默认
     * @return 平台 data 原样结构（含 page/size/total/list/reportableAmount 等），已转为标准 JDK Map/List
     */
    public Map<String, Object> fuzzyMatch(String keyword, Integer page, Integer size) {
        if (StrUtil.isBlank(keyword)) {
            throw exception(DAAS_KEYWORD_BLANK);
        }
        String url = properties.getBaseUrl() + PATH_FUZZY_MATCH;
        JSONObject body = new JSONObject();
        body.set("keyword", keyword);
        if (page != null) {
            body.set("page", page);
        }
        if (size != null) {
            body.set("size", size);
        }
        String text;
        try {
            HttpRequest request = HttpRequest.post(url)
                    .header("Content-Type", "application/json")
                    .body(body.toString())
                    .timeout(properties.getTimeoutPostMs()); // 该接口较慢（实测约 27s），超时放宽
            signHeaders().forEach(request::header);
            text = request.execute().body();
        } catch (Exception e) {
            log.warn("[DaasClient][fuzzyMatch] 请求异常 keyword={}", keyword, e);
            throw exception(DAAS_INVOKE_FAILURE, "网络异常：" + e.getMessage());
        }
        JSONObject data = unwrap(text, "qiye-fuzzy-matching");
        return data == null ? null : toPlainMap(data);
    }


    /**
     * 政策列表（分页）。
     * 入参均为可选：不传地区则返回全国数据；years 需与 month 同时传才生效。
     */
    public Map<String, Object> policyList(String provinceCode, String cityCode, String areaCode,
                                          Integer years, Integer month,
                                          Integer pageNo, Integer pageSize) {
        JSONObject body = new JSONObject();
        putIfNotBlank(body, "provinceCode", provinceCode);
        putIfNotBlank(body, "cityCode", cityCode);
        putIfNotBlank(body, "areaCode", areaCode);
        if (years != null && month != null) {
            body.set("years", years);
            body.set("month", month);
        }
        body.set("pageNo", pageNo == null || pageNo < 1 ? 1 : pageNo);
        int size = pageSize == null || pageSize < 1 ? 10 : pageSize;
        body.set("pageSize", Math.min(size, POLICY_PAGE_SIZE_MAX));
        String text;
        try {
            HttpRequest request = HttpRequest.post(properties.getBaseUrl() + PATH_POLICY_LIST)
                    .header("Content-Type", "application/json")
                    .body(body.toString())
                    .timeout(properties.getTimeoutPostMs());
            signHeaders().forEach(request::header);
            text = request.execute().body();
        } catch (Exception e) {
            log.warn("[DaasClient][policyList] 请求异常 province={} city={}", provinceCode, cityCode, e);
            throw exception(DAAS_INVOKE_FAILURE, "网络异常：" + e.getMessage());
        }
        JSONObject data = unwrap(text, "policy-list");
        return data == null ? null : toPlainMap(data);
    }

    /**
     * 政策详情（含 originText 正文与 fileVoList 附件）。
     */
    public Map<String, Object> policyDetail(String id) {
        if (StrUtil.isBlank(id)) {
            throw exception(DAAS_POLICY_ID_BLANK);
        }
        String text;
        try {
            HttpRequest request = HttpRequest.get(properties.getBaseUrl() + PATH_POLICY_DETAIL + id.trim())
                    .timeout(properties.getTimeoutGetMs());
            signHeaders().forEach(request::header);
            text = request.execute().body();
        } catch (Exception e) {
            log.warn("[DaasClient][policyDetail] 请求异常 id={}", id, e);
            throw exception(DAAS_INVOKE_FAILURE, "网络异常：" + e.getMessage());
        }
        JSONObject data = unwrap(text, "policy-detail");
        return data == null ? null : toPlainMap(data);
    }

    /** 非空才写入请求体，避免给平台传空串导致筛选异常 */
    private static void putIfNotBlank(JSONObject body, String key, String value) {
        if (StrUtil.isNotBlank(value)) {
            body.set(key, value.trim());
        }
    }

    // ============================== 内部方法 ==============================

    /**
     * 生成鉴权请求头：appKey / timestamp(毫秒) / nonce(UUID) / sign。
     * 签名规则：MD5(appKey + timestamp + nonce + appSecret)。
     */
    private Map<String, String> signHeaders() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String nonce = IdUtil.randomUUID();
        String sign = SecureUtil.md5(properties.getAppKey() + timestamp + nonce + properties.getAppSecret());
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("appKey", properties.getAppKey());
        headers.put("timestamp", timestamp);
        headers.put("nonce", nonce);
        headers.put("sign", sign);
        return headers;
    }

    /**
     * 统一解包平台 CommonResult：{@code {code, msg, data}}。
     * 成功 code 兼容 {@code 0}（模糊匹配）与 {@code 200}（基本信息）；否则抛业务异常。
     *
     * @return data 节点；data 为 null 时返回 {@code null}
     */
    private JSONObject unwrap(String text, String api) {
        if (!JSONUtil.isTypeJSON(text)) {
            log.warn("[DaasClient][{}] 返回非 JSON：{}", api, StrUtil.sub(text, 0, 200));
            throw exception(DAAS_INVOKE_FAILURE, "平台返回非 JSON");
        }
        JSONObject raw = JSONUtil.parseObj(text);
        Integer code = raw.getInt("code", -1);
        if (code == null || (code != 0 && code != 200)) {
            String msg = raw.getStr("msg");
            log.warn("[DaasClient][{}] 平台业务错误 code={} msg={}", api, code, msg);
            throw exception(DAAS_INVOKE_FAILURE, StrUtil.format("code={} {}", code, msg));
        }
        return raw.getJSONObject("data");
    }

    /**
     * 把 hutool JSONObject 递归转为标准 JDK {@code Map/List/String/Number/Boolean/null}，
     * 避免 hutool JSON 类型经 Spring Jackson 序列化时的兼容问题。
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
