package cn.iocoder.yudao.module.liqi.service.external.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 企业工商信息 DTO（来自天眼查等外部接口，本地不落全量）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseDTO {

    /** 企业名称 */
    private String name;
    /** 统一社会信用代码 */
    private String creditCode;
    /** 法定代表人 */
    private String legalPerson;
    /** 注册地址 */
    private String registerAddress;
    /** 所属行业 */
    private String industry;
    /** 注册资本 */
    private String registeredCapital;
    /** 经营状态 */
    private String regStatus;
    /** 成立日期 */
    private String establishDate;
    /** 经营范围 */
    private String businessScope;
    /** 企业标签（; 分隔） */
    private String tags;

}
