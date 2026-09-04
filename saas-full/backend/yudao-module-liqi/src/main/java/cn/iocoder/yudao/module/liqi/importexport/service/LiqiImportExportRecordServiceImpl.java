package cn.iocoder.yudao.module.liqi.importexport.service;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.importexport.controller.admin.vo.ImportExportPageReqVO;
import cn.iocoder.yudao.module.liqi.importexport.dal.dataobject.LiqiImportExportRecordDO;
import cn.iocoder.yudao.module.liqi.importexport.dal.mysql.LiqiImportExportRecordMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;

/**
 * 力企 - 我的导入导出记录 Service 实现类
 */
@Service
@Validated
public class LiqiImportExportRecordServiceImpl implements LiqiImportExportRecordService {

    @Resource
    private LiqiImportExportRecordMapper importExportRecordMapper;

    @Override
    public PageResult<LiqiImportExportRecordDO> getRecordPage(ImportExportPageReqVO pageReqVO) {
        return importExportRecordMapper.selectPage(pageReqVO);
    }

    @Override
    public void deleteRecord(Long id) {
        importExportRecordMapper.deleteById(id);
    }

}
