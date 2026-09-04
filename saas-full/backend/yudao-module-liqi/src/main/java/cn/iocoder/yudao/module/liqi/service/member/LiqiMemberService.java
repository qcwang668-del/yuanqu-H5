package cn.iocoder.yudao.module.liqi.service.member;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.member.vo.MemberPageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.member.LiqiMemberDO;

/**
 * 力企 - 会员 Service 接口
 */
public interface LiqiMemberService {

    /**
     * 获得会员分页
     *
     * @param pageReqVO 分页查询
     * @return 会员分页
     */
    PageResult<LiqiMemberDO> getMemberPage(MemberPageReqVO pageReqVO);

}
