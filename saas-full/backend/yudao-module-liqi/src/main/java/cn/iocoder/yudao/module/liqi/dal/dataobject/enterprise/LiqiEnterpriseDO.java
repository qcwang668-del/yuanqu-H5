package cn.iocoder.yudao.module.liqi.dal.dataobject.enterprise;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 力企 - 企业库 DO（深圳湾生态园企业）
 */
@TableName("liqi_enterprise")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiEnterpriseDO extends TenantBaseDO {

    @TableId
    private Long id;
    /** 企业名称 */
    private String enterpriseName;
    /** 法定代表人 */
    private String legalPerson;
    /** 成立时间 */
    private LocalDate establishDate;
    /** 注册资本 */
    private String registeredCapital;
    /** 参保人数 */
    private Integer insuredCount;
    /** 所属行业 */
    private String industry;
    /** 注册地址 */
    private String registerAddress;
    /** logo 简称 */
    private String shortName;
    /** logo 颜色 */
    private String logoColor;

    // ========== 基本信息扩展维度（天眼查按需回填）==========
    /** 统一社会信用代码 */
    private String creditCode;
    /** 工商注册号 */
    private String regNumber;
    /** 组织机构代码 */
    private String orgNumber;
    /** 纳税人识别号 */
    private String taxNumber;
    /** 曾用名 */
    private String formerName;
    /** 企业类型 */
    private String companyOrgType;
    /** 经营状态 */
    private String regStatus;
    /** 实缴资本 */
    private String actualCapital;
    /** 人员规模 */
    private String staffNumRange;
    /** 登记机关 */
    private String regInstitute;
    /** 上市简称 */
    private String bondName;
    /** 上市代码 */
    private String bondNum;
    /** 经营范围 */
    private String businessScope;
    /** 企业标签（; 分隔） */
    private String tags;
    /** 工商回填状态：0未回填 1已回填 2查无结果 */
    private Integer enrichStatus;
    /** 最近工商回填时间 */
    private LocalDateTime enrichTime;

}
