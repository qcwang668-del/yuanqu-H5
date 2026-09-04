package cn.iocoder.yudao.module.liqi.service.external.dto;

import lombok.Data;

/**
 * 政策列表查询条件（透传外部政策接口的筛选能力）
 */
@Data
public class PolicyQuery {

    /** 页码，从 1 开始 */
    private Integer pageNo = 1;
    /** 每页条数 */
    private Integer pageSize = 10;
    /** 类型：project / original / public / park；null=全部 */
    private String type;
    /** 关键词（标题/正文模糊） */
    private String keyword;
    /** 地区，如 深圳市/南山区/全国 */
    private String region;
    /** 行业 */
    private String industry;
    /** 分类标签，如 专精特新 */
    private String category;

}
