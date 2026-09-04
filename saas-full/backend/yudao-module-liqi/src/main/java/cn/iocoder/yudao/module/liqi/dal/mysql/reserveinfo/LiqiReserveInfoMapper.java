package cn.iocoder.yudao.module.liqi.dal.mysql.reserveinfo;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.controller.admin.reserveinfo.vo.ReserveInfoPageReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo.LiqiReserveInfoDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 预留信息 Mapper
 */
@Mapper
public interface LiqiReserveInfoMapper extends BaseMapperX<LiqiReserveInfoDO> {

    default PageResult<LiqiReserveInfoDO> selectPage(ReserveInfoPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiReserveInfoDO>()
                .likeIfPresent(LiqiReserveInfoDO::getReserveUserName, reqVO.getReserveUserName())
                .likeIfPresent(LiqiReserveInfoDO::getReservePhone, reqVO.getReservePhone())
                .eqIfPresent(LiqiReserveInfoDO::getSource, reqVO.getSource())
                .likeIfPresent(LiqiReserveInfoDO::getContent, reqVO.getContent())
                .eqIfPresent(LiqiReserveInfoDO::getReserveType, reqVO.getReserveType())
                .eqIfPresent(LiqiReserveInfoDO::getReserveWay, reqVO.getReserveWay())
                .betweenIfPresent(LiqiReserveInfoDO::getCreateTime, reqVO.getCreateTime())
                .orderByDesc(LiqiReserveInfoDO::getId));
    }

    /**
     * H5「我的申报」分页：按会员用户 + 预留方式=我要申报(1) + 来源=小程序(1) 过滤。
     * 改道后 H5 政策申报统一写入预留信息表。
     */
    default PageResult<LiqiReserveInfoDO> selectAppApplyPage(Long userId, PageParam pageParam) {
        return selectPage(pageParam, new LambdaQueryWrapperX<LiqiReserveInfoDO>()
                .eq(LiqiReserveInfoDO::getUserId, userId)
                .eq(LiqiReserveInfoDO::getReserveWay, 1)
                .eq(LiqiReserveInfoDO::getSource, 1)
                .orderByDesc(LiqiReserveInfoDO::getId));
    }

}
