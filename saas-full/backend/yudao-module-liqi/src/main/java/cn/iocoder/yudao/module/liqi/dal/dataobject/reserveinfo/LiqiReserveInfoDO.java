package cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 预留信息 DO（平台管理-预留信息管理）
 */
@TableName("liqi_reserve_info")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiReserveInfoDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 预留人（用户名） */
    private String reserveUserName;
    /** 手机号 */
    private String reservePhone;
    /** H5 会员用户ID（H5「政策申报」留资时回写，用于"我的申报"按用户隔离；0/NULL=游客提交） */
    private Long userId;
    /** 来源：1=小程序，2=PC端 */
    private Integer source;
    /** 公司名称 */
    private String company;
    /** 公司实体编号（公司名称跳转用） */
    private Long entityId;
    /** 申报内容 / 项目名称 */
    private String content;
    /** 预留信息入口：1=项目详情，4=企业详情 */
    private Integer reserveType;
    /** 预留方式：1=我要申报，2=微信咨询，3=电话咨询 */
    private Integer reserveWay;
    /** 关联业务编号（申报内容跳转用） */
    private Long relationId;
    /** 推荐人 */
    private String recommendUserName;

}
