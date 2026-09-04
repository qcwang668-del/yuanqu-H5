package cn.iocoder.yudao.module.liqi.service.external.mock;

import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.service.external.EnterpriseProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.RegionQuery;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 企业 Provider 的 Mock 实现：内置按园区地区分布的示例企业。
 *
 * <p>真实天眼查"区域企业搜索"接口开通后，新增 RemoteEnterpriseProvider
 * （工商详情可复用现有 TycClient.baseInfo）替换本实现。</p>
 */
@Component
@Profile("!prod")
@ConditionalOnMissingBean(name = "remoteEnterpriseProvider")
public class MockEnterpriseProvider implements EnterpriseProvider {

    private final List<EnterpriseDTO> store = new ArrayList<>();

    @PostConstruct
    void init() {
        // 深圳湾生态园（南山区）
        store.add(e("深圳市云启智能科技有限公司", "91440300MA5E1YQ01A", "张伟", "深圳市南山区科技园南区深圳湾生态园5栋", "科技服务", "500万元", "高新技术企业;专精特新"));
        store.add(e("深圳市芯澜半导体有限公司", "91440300MA5E1YQ02B", "李娜", "深圳市南山区科技园南区深圳湾生态园8栋", "制造业", "1000万元", "高新技术企业"));
        store.add(e("深圳市数联信息技术有限公司", "91440300MA5E1YQ03C", "王强", "深圳市南山区科技园南区深圳湾生态园2栋", "软件和信息技术", "300万元", ""));
        store.add(e("深圳市蓝海生物医药有限公司", "91440300MA5E1YQ04D", "陈静", "深圳市南山区科技园南区深圳湾生态园11栋", "生物医药", "800万元", "高新技术企业"));
        store.add(e("深圳市蜂巢机器人有限公司", "91440300MA5E1YQ05E", "刘洋", "深圳市南山区科技园南区深圳湾生态园6栋", "智能制造", "600万元", "专精特新"));
        store.add(e("深圳市微光新能源科技有限公司", "91440300MA5E1YQ06F", "赵敏", "深圳市南山区科技园南区深圳湾生态园9栋", "新能源", "700万元", ""));
        // 广州天河智慧城
        store.add(e("广州穗创软件科技有限公司", "91440101MA9X1AB01G", "孙磊", "广州市天河区天河智慧城核心区思成路1号", "软件和信息技术", "500万元", "高新技术企业"));
        store.add(e("广州云图数字科技有限公司", "91440101MA9X1AB02H", "周婷", "广州市天河区天河智慧城高唐路2号", "科技服务", "400万元", ""));
        store.add(e("广州智联物联网有限公司", "91440101MA9X1AB03I", "吴鹏", "广州市天河区天河智慧城软件路3号", "物联网", "600万元", "专精特新"));
        // 北京朝阳 CBD
        store.add(e("北京京诚商务服务有限公司", "91110105MA01XCD01J", "郑华", "北京市朝阳区建国门外大街1号国贸写字楼", "现代服务", "300万元", ""));
        store.add(e("北京华彩文化传媒有限公司", "91110105MA01XCD02K", "冯丽", "北京市朝阳区光华路5号院世纪财富中心", "文化传媒", "200万元", ""));
        store.add(e("北京恒信金融服务外包有限公司", "91110105MA01XCD03L", "何军", "北京市朝阳区东三环中路7号财富中心", "金融服务", "1000万元", ""));
    }

    @Override
    public PageResult<EnterpriseDTO> searchByRegion(RegionQuery q) {
        List<EnterpriseDTO> list = store.stream()
                .filter(x -> StrUtil.isBlank(q.getCity()) || x.getRegisterAddress().contains(q.getCity()))
                .filter(x -> StrUtil.isBlank(q.getDistrict()) || x.getRegisterAddress().contains(q.getDistrict()))
                .filter(x -> StrUtil.isBlank(q.getAddressKeyword())
                        || x.getRegisterAddress().contains(q.getAddressKeyword())
                        || x.getName().contains(q.getAddressKeyword()))
                .filter(x -> StrUtil.isBlank(q.getIndustry())
                        || (x.getIndustry() != null && x.getIndustry().contains(q.getIndustry())))
                .sorted(Comparator.comparing(EnterpriseDTO::getName))
                .collect(Collectors.toList());
        int total = list.size();
        int from = Math.max(0, (q.getPageNo() - 1) * q.getPageSize());
        int to = Math.min(total, from + q.getPageSize());
        List<EnterpriseDTO> page = from >= total ? new ArrayList<>() : list.subList(from, to);
        return new PageResult<>(page, (long) total);
    }

    @Override
    public EnterpriseDTO getBaseInfo(String keyword) {
        return store.stream()
                .filter(x -> x.getName().contains(keyword) || keyword.contains(x.getName())
                        || (StrUtil.isNotBlank(x.getCreditCode()) && x.getCreditCode().equals(keyword)))
                .findFirst()
                .orElseGet(() -> EnterpriseDTO.builder()
                        .name(keyword).creditCode("").legalPerson("-").registerAddress("-")
                        .industry("-").registeredCapital("-").regStatus("存续")
                        .establishDate("-").businessScope("（Mock：未命中内置企业，真实环境将调天眼查 baseinfo）").tags("")
                        .build());
    }

    private static EnterpriseDTO e(String name, String creditCode, String legalPerson,
                                   String address, String industry, String capital, String tags) {
        return EnterpriseDTO.builder()
                .name(name).creditCode(creditCode).legalPerson(legalPerson)
                .registerAddress(address).industry(industry).registeredCapital(capital)
                .regStatus("存续").establishDate("2018-06-15")
                .businessScope("技术开发、技术服务、技术咨询；企业管理咨询；货物及技术进出口。")
                .tags(tags).build();
    }

}
