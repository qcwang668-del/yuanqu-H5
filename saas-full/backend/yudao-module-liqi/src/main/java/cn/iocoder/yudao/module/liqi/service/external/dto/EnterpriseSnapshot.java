package cn.iocoder.yudao.module.liqi.service.external.dto;

import lombok.Data;

/**
 * 企业画像快照（用户绑定企业时从外部取一次、落库到绑定表），
 * 供智能匹配 / 精准推送离线使用，避免每次实时查外部。
 */
@Data
public class EnterpriseSnapshot {

    private String name;
    private String creditCode;
    private String region;
    private String industry;
    /** 资质/标签，如 高新技术企业;专精特新 */
    private String qualifications;

}
