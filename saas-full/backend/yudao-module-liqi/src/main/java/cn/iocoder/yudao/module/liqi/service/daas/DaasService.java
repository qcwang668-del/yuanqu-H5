package cn.iocoder.yudao.module.liqi.service.daas;

import cn.iocoder.yudao.module.liqi.controller.admin.daas.vo.QiYeInfoRespVO;

import java.util.Map;

/**
 * 力企云 DaaS 企业数据 Service。
 *
 * <p>对外提供两类企业数据能力，底层由 {@link DaasClient} 完成签名与 HTTP 调用：
 * <ul>
 *   <li>{@link #getBaseInfo(String)}：按 entityId（统一社会信用代码）查企业工商详情；</li>
 *   <li>{@link #fuzzyMatch(String, Integer, Integer)}：按关键词模糊搜索企业（分页）。</li>
 * </ul>
 */
public interface DaasService {

    /**
     * 企业基本信息（工商详情）。
     *
     * @param entityId 统一社会信用代码 / 唯一 id
     * @return 企业详情；查无结果返回 {@code null}
     */
    QiYeInfoRespVO getBaseInfo(String entityId);

    /**
     * 企业模糊匹配（关键词搜企业，分页）。
     *
     * @param keyword 企业名称关键词
     * @param page    页码（从 1 开始）
     * @param size    每页条数
     * @return 平台 data 原样结构（page/size/total/list/reportableAmount 等）
     */
    Map<String, Object> fuzzyMatch(String keyword, Integer page, Integer size);

}
