package cn.iocoder.yudao.module.liqi.service.daas;

import cn.iocoder.yudao.module.liqi.controller.admin.daas.vo.QiYeInfoRespVO;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Map;

/**
 * 力企云 DaaS 企业数据 Service 实现：委托 {@link DaasClient} 完成签名调用。
 * 后续如需本地缓存、企业库回填等，在此层扩展，Controller 与 Client 均无需改动。
 */
@Service
public class DaasServiceImpl implements DaasService {

    @Resource
    private DaasClient daasClient;

    @Override
    public QiYeInfoRespVO getBaseInfo(String entityId) {
        return daasClient.getBaseInfo(entityId);
    }

    @Override
    public Map<String, Object> fuzzyMatch(String keyword, Integer page, Integer size) {
        return daasClient.fuzzyMatch(keyword, page, size);
    }

}
