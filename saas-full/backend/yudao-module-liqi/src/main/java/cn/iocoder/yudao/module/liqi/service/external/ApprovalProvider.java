package cn.iocoder.yudao.module.liqi.service.external;

import cn.iocoder.yudao.module.liqi.service.external.dto.ApprovalDTO;

import java.util.List;

/**
 * 企业获批数据 Provider —— 抽象外部"企业已获补贴/资质认定"接口。
 *
 * <p>当前由 {@code MockApprovalProvider} 提供示例；真实获批接口到位后新增
 * RemoteApprovalProvider 替换实现，上层零改动。建议加 Redis 缓存（企业获批相对稳定）。</p>
 */
public interface ApprovalProvider {

    /** 按企业名称/统一社会信用代码查询已获批项目列表（无记录返回空集合） */
    List<ApprovalDTO> listApprovals(String keyword);

}
