package cn.iocoder.yudao.module.liqi.service.memberclue;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.memberclue.vo.MemberCluePageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.memberclue.LiqiMemberClueDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.memberclue.LiqiMemberClueMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 会员线索 Service 实现类
 */
@Service
@Validated
public class LiqiMemberClueServiceImpl implements LiqiMemberClueService {

    @Resource
    private LiqiMemberClueMapper memberClueMapper;

    @Override
    public PageResult<LiqiMemberClueDO> getMemberCluePage(MemberCluePageReqVO pageReqVO) {
        return memberClueMapper.selectPage(pageReqVO);
    }

}
