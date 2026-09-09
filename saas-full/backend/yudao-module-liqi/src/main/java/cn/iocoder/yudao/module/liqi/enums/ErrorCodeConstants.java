package cn.iocoder.yudao.module.liqi.enums;

import cn.iocoder.yudao.framework.common.exception.ErrorCode;

/**
 * 力企模块错误码（区间 1-099-000-000 ~ 1-099-999-999）
 */
public interface ErrorCodeConstants {

    ErrorCode APP_USER_NOT_EXISTS = new ErrorCode(1_099_001_001, "APP 用户不存在");

    // ========== DaaS 企业数据平台 1-099-002-000 ==========
    ErrorCode DAAS_INVOKE_FAILURE = new ErrorCode(1_099_002_001, "DaaS 企业数据接口调用失败：{}");
    ErrorCode DAAS_ENTITY_ID_BLANK = new ErrorCode(1_099_002_002, "企业标识 entityId 不能为空");
    ErrorCode DAAS_KEYWORD_BLANK = new ErrorCode(1_099_002_003, "查询关键词 keyword 不能为空");
    ErrorCode DAAS_POLICY_ID_BLANK = new ErrorCode(1_099_002_004, "政策 ID 不能为空");

    // ========== 园区政策库 1-099-003-000 ==========
    ErrorCode POLICY_NOT_EXISTS = new ErrorCode(1_099_003_001, "园区政策不存在或已删除");

    // ========== 直播大讲堂 1-099-005-000 ==========
    ErrorCode LIVE_NOT_EXISTS = new ErrorCode(1_099_005_001, "直播不存在或已删除");

    // ========== C 端 AI 政策助手 1-099-006-000 ==========
    ErrorCode AI_CONTENT_BLANK = new ErrorCode(1_099_006_001, "提问内容不能为空");
    ErrorCode AI_POLICY_NOT_FOUND = new ErrorCode(1_099_006_002, "未找到该政策，无法解读");

    // ========== AISpider 大模型服务（企业政策智能匹配）1-099-007-000 ==========
    ErrorCode BIGMODEL_INVOKE_FAILURE = new ErrorCode(1_099_007_001, "大模型智能匹配接口调用失败：{}");
    ErrorCode BIGMODEL_COMPANY_BLANK = new ErrorCode(1_099_007_002, "企业名称不能为空");

}
