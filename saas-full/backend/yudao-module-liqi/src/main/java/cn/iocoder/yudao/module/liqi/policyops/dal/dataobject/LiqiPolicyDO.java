package cn.iocoder.yudao.module.liqi.policyops.dal.dataobject;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

/**
 * 力企 - 政策库 DO（园区/协会自主发布；type=park）。
 *
 * <p>政府类政策（project/original/public）仍由外部 {@code PolicyProvider} 提供、零落库；
 * 本表只存园区/协会在运营后台自助发布、可在 H5「园区发布」专区展示的政策。</p>
 */
@TableName("liqi_policy")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiPolicyDO extends TenantBaseDO {

    /** 编号（对外 PolicyDTO.id = "L" + id，与外部 P 开头政策区分） */
    @TableId
    private Long id;
    /** 政策标题 */
    private String title;
    /** 类型：park 园区发布 */
    private String type;
    /** 所属园区 liqi_park.id（可空） */
    private Long parkId;
    /** 园区/发布主体名称快照 */
    private String parkName;
    /** 最高补贴（万元） */
    private String subsidyMax;
    /** 所属地区，如 深圳市/南山区 */
    private String region;
    /** 所属行业 */
    private String industry;
    /** 主分类标签，如 专精特新/研发投入/设备更新/高企认定/创业扶持 */
    private String category;
    /** 标签（; 分隔） */
    private String tags;
    /** 申报截止日期，长期有效为空 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deadline;
    /** 发布部门/来源 */
    private String publishOrg;
    /** 发布日期 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate publishDate;
    /** 摘要 */
    private String summary;
    /** 政策正文 */
    private String content;
    /** 外部原文链接 */
    private String sourceUrl;
    /** 申报联系人 */
    private String contactName;
    /** 申报咨询电话 */
    private String contactPhone;
    /** 可见范围：all 全部 / park 本园区 / region 本地区 */
    private String visibleScope;
    /** 状态：0 已上架 1 已下架（草稿） */
    private Integer status;

}
