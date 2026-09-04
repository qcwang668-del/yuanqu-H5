package cn.iocoder.yudao.module.liqi.message.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.message.controller.admin.vo.ParkPushCandidateVO;
import cn.iocoder.yudao.module.liqi.message.controller.admin.vo.UserMessagePageReqVO;
import cn.iocoder.yudao.module.liqi.message.dal.dataobject.LiqiUserMessageDO;

import java.util.List;

/**
 * 力企 - C 端站内消息 Service（政策精准推送 / 临期提醒 / 系统通知）
 *
 * <p>消息来源 source：external=外部采集政策（自动按企业画像推）；
 * park=园区发布政策（园区运营手动筛选企业推）。</p>
 */
public interface LiqiUserMessageService {

    // ---- C 端 ----
    /** 我的消息分页；source=external/park 时按来源过滤，空=全部 */
    PageResult<LiqiUserMessageDO> pageMyMessages(Long userId, Integer pageNo, Integer pageSize, String source);

    Long unreadCount(Long userId);

    void markRead(Long userId);

    // ---- 运营定向推送 ----
    /**
     * 运营选一条政策定向推送（自动按政策 ID 判断 source：L 开头=园区，其余=外部）。
     *
     * @param target all=所有已绑定企业会员；match=画像与该政策匹配的会员
     */
    int pushByPolicy(String policyId, String target);

    /** 园区运营：预览某条园区政策可推送的候选企业名单（本园区绑定企业 + 画像匹配结果）。 */
    List<ParkPushCandidateVO> candidatesOfParkPolicy(String policyId);

    /** 园区运营：把一条园区政策推送给勾选的会员（已推过的跳过）。 */
    int pushParkPolicyToUsers(String policyId, List<Long> userIds);

    /** 管理后台：推送记录分页 */
    PageResult<LiqiUserMessageDO> getAdminPage(UserMessagePageReqVO reqVO);

    // ---- 定时任务 ----
    /**
     * 自动"政策找人"：按会员绑定企业画像，把近 7 天新政策匹配推送（source=external，已去重）。
     * 不再依赖订阅偏好（订阅能力已下线）。
     */
    int autoMatchPush();

}
