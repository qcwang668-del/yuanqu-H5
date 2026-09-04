package cn.iocoder.yudao.module.liqi.dal.mysql.member;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.controller.admin.member.vo.MemberPageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.member.LiqiMemberDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 会员 Mapper
 */
@Mapper
public interface LiqiMemberMapper extends BaseMapperX<LiqiMemberDO> {

    default PageResult<LiqiMemberDO> selectPage(MemberPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiMemberDO>()
                .likeIfPresent(LiqiMemberDO::getEnterpriseName, reqVO.getEnterpriseName())
                .likeIfPresent(LiqiMemberDO::getPhone, reqVO.getPhone())
                .eqIfPresent(LiqiMemberDO::getIsPushedCustomer, reqVO.getIsPushedCustomer())
                // 关联园区：按园区地址关键词 LIKE 匹配注册地址
                .likeIfPresent(LiqiMemberDO::getRegisterAddress, reqVO.getRegisterAddressKeyword())
                .orderByDesc(LiqiMemberDO::getId));
    }

}
