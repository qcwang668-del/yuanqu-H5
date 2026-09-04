package cn.iocoder.yudao.module.liqi.live.dal.dataobject;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 力企 - 专家直播大讲堂 DO
 *
 * <p>直播观看/回放均跳第三方地址（腾讯会议/视频号等），平台只做排期与入口管理。</p>
 */
@TableName("liqi_live")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiLiveDO extends TenantBaseDO {

    @TableId
    private Long id;
    /** 直播标题 */
    private String title;
    /** 讲师/专家 */
    private String lecturer;
    /** 讲师简介 */
    private String lecturerDesc;
    /** 封面图 */
    private String coverUrl;
    /** 直播简介 */
    private String summary;
    /** 直播间地址（第三方） */
    private String liveUrl;
    /** 回放地址 */
    private String replayUrl;
    /** 开播时间 */
    private LocalDateTime startTime;
    /** 结束时间 */
    private LocalDateTime endTime;
    /** 状态：0 预告 1 直播中 2 回放 3 已下架 */
    private Integer status;
    /** 排序 */
    private Integer sort;

}
