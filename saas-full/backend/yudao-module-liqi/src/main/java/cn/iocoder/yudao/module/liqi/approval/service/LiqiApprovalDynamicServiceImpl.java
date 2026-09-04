package cn.iocoder.yudao.module.liqi.approval.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.approval.controller.admin.vo.ApprovalDynamicPageReqVO;
import cn.iocoder.yudao.module.liqi.approval.dal.dataobject.LiqiApprovalDynamicDO;
import cn.iocoder.yudao.module.liqi.approval.dal.mysql.LiqiApprovalDynamicMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 企业获批动态 Service 实现类
 */
@Service
@Validated
public class LiqiApprovalDynamicServiceImpl implements LiqiApprovalDynamicService {

    @Resource
    private LiqiApprovalDynamicMapper approvalDynamicMapper;

    @Override
    public PageResult<LiqiApprovalDynamicDO> getApprovalDynamicPage(ApprovalDynamicPageReqVO pageReqVO) {
        return approvalDynamicMapper.selectPage(pageReqVO);
    }

}
