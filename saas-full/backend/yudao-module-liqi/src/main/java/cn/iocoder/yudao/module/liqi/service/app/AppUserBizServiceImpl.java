package cn.iocoder.yudao.module.liqi.service.app;

import cn.hutool.core.util.ReUtil;
import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppEnterpriseBindReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppFavoriteReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppPolicyApplyCreateReqVO;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppSubscribeSaveReqVO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.bind.LiqiUserEnterpriseBindDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.favorite.LiqiPolicyFavoriteDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.park.LiqiParkDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.reserveinfo.LiqiReserveInfoDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.subscribe.LiqiSubscribeSettingDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.bind.LiqiUserEnterpriseBindMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.favorite.LiqiPolicyFavoriteMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.park.LiqiParkMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.reserveinfo.LiqiReserveInfoMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.subscribe.LiqiSubscribeSettingMapper;
import cn.iocoder.yudao.module.liqi.service.external.EnterpriseProvider;
import cn.iocoder.yudao.module.liqi.service.external.dto.EnterpriseDTO;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.util.List;

@Service
@Validated
public class AppUserBizServiceImpl implements AppUserBizService {

    @Resource
    private LiqiPolicyFavoriteMapper favoriteMapper;
    @Resource
    private LiqiReserveInfoMapper reserveInfoMapper;
    @Resource
    private LiqiSubscribeSettingMapper subscribeMapper;
    @Resource
    private LiqiUserEnterpriseBindMapper bindMapper;
    @Resource
    private LiqiParkMapper parkMapper;
    @Resource
    private EnterpriseProvider enterpriseProvider;

    // ---------------- 收藏 ----------------
    @Override
    public Long addFavorite(Long userId, AppFavoriteReqVO req) {
        LiqiPolicyFavoriteDO exist = favoriteMapper.selectByUserAndPolicy(userId, req.getPolicyId());
        if (exist != null) {
            return exist.getId();
        }
        LiqiPolicyFavoriteDO fav = LiqiPolicyFavoriteDO.builder()
                .userId(userId).policyId(req.getPolicyId()).policyTitle(req.getPolicyTitle())
                .policyType(req.getPolicyType()).publishOrg(req.getPublishOrg())
                .build();
        favoriteMapper.insert(fav);
        return fav.getId();
    }

    @Override
    public void cancelFavorite(Long userId, String policyId) {
        favoriteMapper.deleteByUserAndPolicy(userId, policyId);
    }

    @Override
    public List<LiqiPolicyFavoriteDO> favoriteList(Long userId) {
        return favoriteMapper.selectListByUser(userId);
    }

    @Override
    public boolean isFavorite(Long userId, String policyId) {
        return favoriteMapper.selectByUserAndPolicy(userId, policyId) != null;
    }

    // ---------------- 申报（改道：统一写入「预留信息」表，后台预留信息管理可见）----------------
    @Override
    public Long createApply(Long userId, AppPolicyApplyCreateReqVO req) {
        // 申报内容：政策项目名称；备注拼入末尾，便于后台跟进
        String content = req.getPolicyTitle();
        if (StrUtil.isNotBlank(req.getRemark())) {
            content = (content == null ? "" : content) + "（备注：" + req.getRemark() + "）";
        }
        if (content != null && content.length() > 500) {
            content = content.substring(0, 500);
        }
        LiqiReserveInfoDO reserve = LiqiReserveInfoDO.builder()
                .reserveUserName(req.getContactName())   // 联系人 → 预留人
                .reservePhone(req.getContactPhone())     // 联系电话 → 手机号
                .userId(userId == null ? 0L : userId)    // H5 会员用户（游客=0）
                .source(1)                               // 1=小程序/H5
                .company(req.getEnterpriseName())        // 申报企业 → 公司名称
                .content(content)                        // 申报内容=政策项目名(+备注)
                .reserveType(1)                          // 1=项目详情（政策申报入口）
                .reserveWay(1)                           // 1=我要申报
                .build();
        reserveInfoMapper.insert(reserve);
        return reserve.getId();
    }

    @Override
    public PageResult<LiqiReserveInfoDO> applyPage(Long userId, Integer pageNo, Integer pageSize) {
        PageParam pp = new PageParam();
        pp.setPageNo(pageNo == null ? 1 : pageNo);
        pp.setPageSize(pageSize == null ? 10 : pageSize);
        return reserveInfoMapper.selectAppApplyPage(userId == null ? 0L : userId, pp);
    }

    // ---------------- 订阅 ----------------
    @Override
    public void saveSubscribe(Long userId, AppSubscribeSaveReqVO req) {
        LiqiSubscribeSettingDO exist = subscribeMapper.selectByUser(userId);
        if (exist == null) {
            LiqiSubscribeSettingDO s = LiqiSubscribeSettingDO.builder()
                    .userId(userId)
                    .subZjx(nz(req.getSubZjx())).subRd(nz(req.getSubRd()))
                    .subEquip(nz(req.getSubEquip())).subHigh(nz(req.getSubHigh()))
                    .subStartup(nz(req.getSubStartup())).subPark(nz(req.getSubPark()))
                    .region(req.getRegion()).industry(req.getIndustry())
                    .build();
            subscribeMapper.insert(s);
        } else {
            exist.setSubZjx(nz(req.getSubZjx()));
            exist.setSubRd(nz(req.getSubRd()));
            exist.setSubEquip(nz(req.getSubEquip()));
            exist.setSubHigh(nz(req.getSubHigh()));
            exist.setSubStartup(nz(req.getSubStartup()));
            exist.setSubPark(nz(req.getSubPark()));
            exist.setRegion(req.getRegion());
            exist.setIndustry(req.getIndustry());
            subscribeMapper.updateById(exist);
        }
    }

    @Override
    public LiqiSubscribeSettingDO getSubscribe(Long userId) {
        return subscribeMapper.selectByUser(userId);
    }

    // ---------------- 企业绑定 ----------------
    @Override
    public LiqiUserEnterpriseBindDO bindEnterprise(Long userId, AppEnterpriseBindReqVO req) {
        EnterpriseDTO ent = enterpriseProvider.getBaseInfo(req.getKeyword());
        String region = extractRegion(ent.getRegisterAddress());
        // 按企业注册地区自动归属园区（运营后台可调整）；匹配不到则为空
        LiqiParkDO park = resolvePark(ent.getRegisterAddress(), region);
        LiqiUserEnterpriseBindDO bind = LiqiUserEnterpriseBindDO.builder()
                .userId(userId)
                .enterpriseName(ent.getName())
                .creditCode(ent.getCreditCode())
                .parkId(park != null ? park.getId() : null)
                .parkName(park != null ? park.getParkName() : null)
                .legalPerson(ent.getLegalPerson())
                .snapshotRegion(region)
                .snapshotIndustry(ent.getIndustry())
                .snapshotQualifications(ent.getTags())
                .build();
        bindMapper.deleteByUser(userId);
        bindMapper.insert(bind);
        return bind;
    }

    /** 按企业注册地址/地区匹配所属园区：优先区/县，其次地址关键词，再次城市 */
    private LiqiParkDO resolvePark(String address, String region) {
        List<LiqiParkDO> parks = parkMapper.selectEnabledList();
        for (LiqiParkDO p : parks) {
            if (StrUtil.isNotBlank(p.getRegionDistrict()) && StrUtil.isNotBlank(address)
                    && address.contains(p.getRegionDistrict())) {
                return p;
            }
        }
        for (LiqiParkDO p : parks) {
            if (StrUtil.isNotBlank(p.getAddressKeyword()) && StrUtil.isNotBlank(address)
                    && address.contains(p.getAddressKeyword())) {
                return p;
            }
        }
        for (LiqiParkDO p : parks) {
            if (StrUtil.isNotBlank(p.getCity()) && StrUtil.isNotBlank(region)
                    && region.contains(p.getCity())) {
                return p;
            }
        }
        return null;
    }

    @Override
    public LiqiUserEnterpriseBindDO getBind(Long userId) {
        return bindMapper.selectByUser(userId);
    }

    private static Integer nz(Integer v) {
        return v == null ? 0 : v;
    }

    /** 从注册地址提取"市/区"规范化地区（如 深圳市南山区… → 深圳市/南山区），供政策地区匹配 */
    private static String extractRegion(String address) {
        if (StrUtil.isBlank(address)) {
            return "";
        }
        String city = ReUtil.get("([一-龥]{2,}?市)", address, 1);
        String district = ReUtil.get("([一-龥]{2,}?[区县])", address, 1);
        StringBuilder sb = new StringBuilder();
        if (StrUtil.isNotBlank(city)) {
            sb.append(city);
        }
        if (StrUtil.isNotBlank(district)) {
            sb.append("/").append(district);
        }
        return sb.length() > 0 ? sb.toString() : address;
    }

}
