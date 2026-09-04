package cn.iocoder.yudao.module.liqi.importexport.dal.mysql;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.liqi.importexport.controller.admin.vo.ImportExportPageReqVO;
import cn.iocoder.yudao.module.liqi.importexport.dal.dataobject.LiqiImportExportRecordDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 力企 - 我的导入导出记录 Mapper
 */
@Mapper
public interface LiqiImportExportRecordMapper extends BaseMapperX<LiqiImportExportRecordDO> {

    default PageResult<LiqiImportExportRecordDO> selectPage(ImportExportPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<LiqiImportExportRecordDO>()
                .likeIfPresent(LiqiImportExportRecordDO::getFileName, reqVO.getFileName())
                .eqIfPresent(LiqiImportExportRecordDO::getType, reqVO.getType())
                .likeIfPresent(LiqiImportExportRecordDO::getModule, reqVO.getModule())
                .eqIfPresent(LiqiImportExportRecordDO::getStatus, reqVO.getStatus())
                .betweenIfPresent(LiqiImportExportRecordDO::getCreateTime, reqVO.getCreateTime())
                .orderByDesc(LiqiImportExportRecordDO::getId));
    }

}
