package cn.iocoder.yudao.module.liqi.service.external.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 企业获批项目 DTO（已获得的补贴/资质认定，来自外部获批接口，本地不落库）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDTO {

    /** 获批项目名称，如 国家高新技术企业认定 / 专精特新中小企业 / 研发投入后补助 */
    private String projectName;
    /** 获批/认定时间（yyyy-MM-dd） */
    private String approvalTime;
    /** 认定/发布部门 */
    private String department;
    /** 补贴/奖励金额（万元，无金额的资质认定为 null） */
    private String subsidy;
    /** 批次/文号（可空） */
    private String batchNo;

}
