package cn.iocoder.yudao.module.liqi.service.external.dto;

import lombok.Data;

/**
 * 按地区（园区地址）搜索企业的查询条件
 */
@Data
public class RegionQuery {

    private Integer pageNo = 1;
    private Integer pageSize = 20;
    /** 省 */
    private String province;
    /** 市 */
    private String city;
    /** 区/县 */
    private String district;
    /** 地址关键词（园区名/路段等，进一步缩小范围） */
    private String addressKeyword;
    /** 行业（可选） */
    private String industry;

}
