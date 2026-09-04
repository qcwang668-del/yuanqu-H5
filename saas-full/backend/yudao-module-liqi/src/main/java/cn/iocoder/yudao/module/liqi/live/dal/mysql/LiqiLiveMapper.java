package cn.iocoder.yudao.module.liqi.live.dal.mysql;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.live.controller.admin.vo.LivePageReqVO;
import cn.iocoder.yudao.module.liqi.live.dal.dataobject.LiqiLiveDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 力企 - 直播大讲堂 Mapper
 */
@Mapper
public interface LiqiLiveMapper extends BaseMapperX<LiqiLiveDO> {

    default PageResult<LiqiLiveDO> selectPage(LivePageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiLiveDO>()
                .likeIfPresent(LiqiLiveDO::getTitle, reqVO.getTitle())
                .likeIfPresent(LiqiLiveDO::getLecturer, reqVO.getLecturer())
                .eqIfPresent(LiqiLiveDO::getStatus, reqVO.getStatus())
                .orderByAsc(LiqiLiveDO::getSort)
                .orderByDesc(LiqiLiveDO::getStartTime));
    }

    /** C 端：未下架的直播（预告/直播中/回放），按开播时间倒序 */
    default List<LiqiLiveDO> selectAppList() {
        return selectList(new LambdaQueryWrapperX<LiqiLiveDO>()
                .ne(LiqiLiveDO::getStatus, 3)
                .orderByDesc(LiqiLiveDO::getStartTime));
    }

}
