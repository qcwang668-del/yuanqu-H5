package cn.iocoder.yudao.module.liqi.approval.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.approval.controller.admin.vo.ApprovalDynamicPageReqVO;
import cn.iocoder.yudao.module.liqi.approval.dal.dataobject.LiqiApprovalDynamicDO;

/**
 * 力企 - 企业获批动态 Service 接口
 */
public interface LiqiApprovalDynamicService {

    /**
     * 获得企业获批动态分页
     *
     * @param pageReqVO 分页查询
     * @return 企业获批动态分页
     */
    PageResult<LiqiApprovalDynamicDO> getApprovalDynamicPage(ApprovalDynamicPageReqVO pageReqVO);

}
