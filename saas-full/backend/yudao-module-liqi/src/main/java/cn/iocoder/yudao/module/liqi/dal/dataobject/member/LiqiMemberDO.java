package cn.iocoder.yudao.module.liqi.dal.dataobject.member;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 会员 DO（企业管理-会员管理系统）
 *
 * 逆向自 saas 前端 chunk index-DDtGtXRR.js（接口 /system/partner/member/page）
 */
@TableName("liqi_member")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiMemberDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 企业名称 */
    private String enterpriseName;
    /** 法人 */
    private String legalPerson;
    /** 注册地址 */
    private String registerAddress;
    /** 手机号 */
    private String phone;
    /** 企业负责人姓名 */
    private String responsiblePersonName;
    /** 企业负责人联系方式 */
    private String responsiblePersonPhone;
    /** 企业对接人姓名 */
    private String contactPersonName;
    /** 企业对接人联系方式 */
    private String contactPersonPhone;
    /** 是否推送客户：0=否，1=是 */
    private Integer isPushedCustomer;
    /** 创建人姓名 */
    private String creatorName;

}
