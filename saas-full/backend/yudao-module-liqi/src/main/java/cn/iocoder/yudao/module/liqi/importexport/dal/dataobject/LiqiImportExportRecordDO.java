package cn.iocoder.yudao.module.liqi.importexport.dal.dataobject;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 我的导入导出记录 DO（顶层菜单：我的导入导出）
 */
@TableName("liqi_import_export_record")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiImportExportRecordDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 文件名称 */
    private String fileName;
    /** 类型：0=导入，1=导出 */
    private Integer type;
    /** 模块（导入/导出模块） */
    private String module;
    /** 状态：0=处理中，1=成功，2=失败 */
    private Integer status;
    /** 文件地址（导入/导出附件） */
    private String fileUrl;
    /** 错误信息 */
    private String errMsg;

}
