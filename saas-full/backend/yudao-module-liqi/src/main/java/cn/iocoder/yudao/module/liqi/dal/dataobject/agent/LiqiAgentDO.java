package cn.iocoder.yudao.module.liqi.dal.dataobject.agent;

import cn.iocoder.yudao.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 力企 - 智能体 DO（智能体广场）
 *
 * 一个智能体 = 一套人设(systemPrompt) + 一个大模型 + 可选的 MCP 工具集。
 * 工商信息智能体：mcpEnabled=1，挂载工商 MCP；
 * 企业司法智能体：mcpEnabled=0，纯对话占位（后续补司法 MCP 时置 1 并填 mcpUrl 即可）。
 */
@TableName("liqi_agent")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiqiAgentDO extends TenantBaseDO {

    /** 编号 */
    @TableId
    private Long id;
    /** 智能体名称 */
    private String name;
    /** 头像 */
    private String avatar;
    /** 简介（广场卡片展示） */
    private String description;
    /** 系统提示词（人设/能力边界） */
    private String systemPrompt;
    /** 模型提供方，如 ark（火山方舟） */
    private String provider;
    /** 模型标志，如 ark-code-latest；为空则用全局默认 */
    private String model;
    /** 是否启用 MCP 工具 */
    private Boolean mcpEnabled;
    /** MCP Server 地址（Streamable HTTP，形如 http://127.0.0.1:8800/mcp/） */
    private String mcpUrl;
    /** 排序 */
    private Integer sort;
    /** 状态（0 开启 1 关闭） */
    private Integer status;

}
