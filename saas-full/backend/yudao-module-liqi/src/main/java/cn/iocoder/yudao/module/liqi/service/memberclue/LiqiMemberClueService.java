package cn.iocoder.yudao.module.liqi.service.memberclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.memberclue.vo.MemberCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.memberclue.LiqiMemberClueDO;

/**
 * 力企 - 会员线索 Service 接口
 */
public interface LiqiMemberClueService {

    /**
     * 获得会员线索分页
     *
     * @param pageReqVO 分页查询
     * @return 会员线索分页
     */
    PageResult<LiqiMemberClueDO> getMemberCluePage(MemberCluePageReqVO pageReqVO);

}
