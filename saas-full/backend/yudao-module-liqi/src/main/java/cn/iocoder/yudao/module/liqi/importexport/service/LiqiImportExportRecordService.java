package cn.iocoder.yudao.module.liqi.importexport.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.importexport.controller.admin.vo.ImportExportPageReqVO;
import cn.iocoder.yudao.module.liqi.importexport.dal.dataobject.LiqiImportExportRecordDO;

/**
 * 力企 - 我的导入导出记录 Service
 */
public interface LiqiImportExportRecordService {

    PageResult<LiqiImportExportRecordDO> getRecordPage(ImportExportPageReqVO pageReqVO);

    void deleteRecord(Long id);

}
