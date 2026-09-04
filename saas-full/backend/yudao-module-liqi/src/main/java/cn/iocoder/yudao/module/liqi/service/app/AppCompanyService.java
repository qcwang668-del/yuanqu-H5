package cn.iocoder.yudao.module.liqi.service.app;

import cn.iocoder.yudao.module.liqi.service.external.dto.ApprovalDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;

import java.util.List;
import java.util.Map;

/**
 * 力企 C 端 - 企业获批查询 Service（聚合：企业信息 + 已获批 + 可申报）
 */
public interface AppCompanyService {

    /**
     * 企业获批查询。
     *
     * @return { enterprise 企业信息(企业信息库), approvals 已获批(外部接口), policies 可申报(画像匹配) }
     */
    Map<String, Object> checkCompany(String keyword);

}
