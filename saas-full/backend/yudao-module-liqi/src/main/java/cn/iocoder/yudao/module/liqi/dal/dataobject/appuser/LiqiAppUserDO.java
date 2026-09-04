package cn.iocoder.yudao.module.liqi.dal.dataobject.appuser;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 力企 - APP 用户 DO（平台管理-用户管理）
 */
@TableName("liqi_app_user")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiAppUserDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 用户名 */
    private String userName;
    /** 手机号 */
    private String phone;
    /** 来源：0=小程序，1=PC端 */
    private Integer source;
    /** 维护企业 */
    private String maintainEnterprise;
    /** 推广用户量 */
    private Integer promoteCount;
    /** 一级推广人 */
    private String firstPromoter;
    /** 二级推广人 */
    private String secondPromoter;
    /** 注册时间 */
    private LocalDateTime registerTime;
    /** 最近登录时间 */
    private LocalDateTime lastLoginTime;

}
