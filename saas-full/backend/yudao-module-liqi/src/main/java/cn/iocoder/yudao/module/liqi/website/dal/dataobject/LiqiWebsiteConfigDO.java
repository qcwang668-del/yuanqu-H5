package cn.iocoder.yudao.module.liqi.website.dal.dataobject;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 网站配置 DO（系统管理-网站配置，单例配置表单）
 */
@TableName("liqi_website_config")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiWebsiteConfigDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 二级域名 */
    private String domainName;
    /** 重定向域名 */
    private String redirectDomainName;
    /** 网站备案号 */
    private String icpNum;
    /** 品牌名称 */
    private String brandName;
    /** 品牌 LOGO（横向） */
    private String brandLogoHorizontal;
    /** 品牌 LOGO（竖向） */
    private String brandLogoVertical;
    /** 小程序二维码 */
    private String smallProgramQrCode;

}
