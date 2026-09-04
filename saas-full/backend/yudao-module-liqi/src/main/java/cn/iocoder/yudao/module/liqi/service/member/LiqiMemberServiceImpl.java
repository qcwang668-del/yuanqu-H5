package cn.iocoder.yudao.module.liqi.service.member;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.admin.member.vo.MemberPageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.member.LiqiMemberDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.park.LiqiParkDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.member.LiqiMemberMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.park.LiqiParkMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 会员 Service 实现类
 */
@Service
@Validated
public class LiqiMemberServiceImpl implements LiqiMemberService {

    @Resource
    private LiqiMemberMapper memberMapper;
    @Resource
    private LiqiParkMapper parkMapper;

    @Override
    public PageResult<LiqiMemberDO> getMemberPage(MemberPageReqVO pageReqVO) {
        // 关联园区：若选择了园区，解析出园区地址关键词，用于按注册地址 LIKE 过滤
        if (pageReqVO.getParkId() != null) {
            LiqiParkDO park = parkMapper.selectById(pageReqVO.getParkId());
            // 园区存在则用其地址关键词；园区不存在则用一个不可能命中的值，返回空结果
            pageReqVO.setRegisterAddressKeyword(park != null ? park.getAddressKeyword() : "__NO_MATCH__");
        }
        return memberMapper.selectPage(pageReqVO);
    }

}
