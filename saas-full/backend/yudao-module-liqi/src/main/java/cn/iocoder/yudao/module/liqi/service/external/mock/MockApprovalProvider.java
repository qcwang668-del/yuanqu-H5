package cn.iocoder.yudao.module.liqi.service.external.mock;

import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.module.liqi.service.external.ApprovalProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.ApprovalDTO;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 获批数据 Provider 的 Mock 实现：内置示例企业的获批/认定记录。
 *
 * <p>真实"企业获批/补贴"接口开通后，新增 RemoteApprovalProvider 替换本实现。</p>
 */
@Component
@Profile("!prod")
@ConditionalOnMissingBean(name = "remoteApprovalProvider")
public class MockApprovalProvider implements ApprovalProvider {

    @Override
    public List<ApprovalDTO> listApprovals(String keyword) {
        if (StrUtil.isBlank(keyword)) {
            return new ArrayList<>();
        }
        String kw = keyword.trim();
        // 与 Mock 企业库呼应的示例获批记录
        if (kw.contains("云启") || kw.contains("91440300MA5E1YQ01A")) {
            return Arrays.asList(
                    a("国家高新技术企业认定", "2023-12-20", "深圳市科技创新委员会", null, "GR20234420XXXX"),
                    a("专精特新中小企业认定", "2024-03-15", "深圳市工业和信息化局", null, "深专精特新2024XXX"),
                    a("研发投入后补助", "2024-09-10", "深圳市南山区科技创新局", "20.00", "南科创〔2024〕XX号"),
                    a("入园企业租金补贴", "2024-06-08", "深圳湾生态园", "15.00", "园区2024租补XX"));
        }
        if (kw.contains("芯澜") || kw.contains("91440300MA5E1YQ02B")) {
            return Arrays.asList(
                    a("国家高新技术企业认定", "2023-11-30", "深圳市科技创新委员会", null, "GR20234420YYYY"),
                    a("技术改造投资补贴", "2024-05-18", "深圳市工业和信息化局", "100.00", "深工信技改2024XX"));
        }
        if (kw.contains("穗创") || kw.contains("91440101MA9X1AB01G")) {
            return Arrays.asList(
                    a("国家高新技术企业认定", "2023-10-25", "广东省科学技术厅", null, "GR20234400XXXX"),
                    a("研发投入后补助（园区专项）", "2024-08-22", "广州天河智慧城", "20.00", "天河智慧城2024研发"));
        }
        // 其余企业：返回一条通用高新技术企业认定示例（演示）；真实环境以接口为准
        return Arrays.asList(
                a("科技型中小企业入库", "2024-04-10", "广东省科学技术厅", null, "科小2024入库XXXX"));
    }

    private static ApprovalDTO a(String name, String time, String dept, String subsidy, String batch) {
        return ApprovalDTO.builder()
                .projectName(name).approvalTime(time).department(dept).subsidy(subsidy).batchNo(batch)
                .build();
    }

}
