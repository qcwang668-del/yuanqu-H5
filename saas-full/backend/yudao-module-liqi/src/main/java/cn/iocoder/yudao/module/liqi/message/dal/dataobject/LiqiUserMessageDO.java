package cn.iocoder.yudao.module.liqi.message.dal.dataobject;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - C 端站内消息 DO（政策精准推送 / 临期提醒 / 系统通知）
 */
@TableName("liqi_user_message")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiUserMessageDO extends TenantBaseDO {

    @TableId
    private Long id;
    /** 会员用户 ID */
    private Long userId;
    /** 类型：1 政策推送 2 临期提醒 3 系统通知 */
    private Integer type;
    /** 消息标题 */
    private String title;
    /** 消息内容 */
    private String content;
    /** 关联政策 ID（可跳转详情） */
    private String policyId;
    /** 关联政策标题快照 */
    private String policyTitle;
    /** 推送方式：auto 系统自动 / manual 运营定向 */
    private String bizType;
    /** 政策来源：external 外部采集政策 / park 园区发布政策 */
    private String source;
    /** 是否已读：0 未读 1 已读 */
    private Integer isRead;

}
