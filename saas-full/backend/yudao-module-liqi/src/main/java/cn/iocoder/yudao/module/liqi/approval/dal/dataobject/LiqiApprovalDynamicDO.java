package cn.iocoder.yudao.module.liqi.approval.dal.dataobject;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 力企 - 企业获批动态 DO（企业管理-企业获批动态）
 */
@TableName("liqi_approval_dynamic")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiApprovalDynamicDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 企业名称 */
    private String enterpriseName;
    /** 统一社会信用代码 */
    private String creditCode;
    /** 法定代表人 */
    private String legalPerson;
    /** 获批项目 */
    private String approvalProject;
    /** 获批时间 */
    private LocalDateTime approvalTime;
    /** 状态：0=正常，1=异常 */
    private Integer status;

}
