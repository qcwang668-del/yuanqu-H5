package cn.iocoder.yudao.module.liqi.controller.app.policy;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.controller.app.vo.AppPolicyAiMatchReqVO;
import cn.iocoder.yudao.module.liqi.service.app.AppPolicyService;
import cn.iocoder.yudao.module.liqi.service.app.AppUserBizService;
import cn.iocoder.yudao.module.liqi.service.bigmodel.ArkPolicyMatchService;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyDTO;
import cn.iocoder.yudao.module.liqi.service.external.dto.PolicyQuery;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.annotation.security.PermitAll;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;
import static cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils.getLoginUserId;

@Tag(name = "用户 APP - 政策")
@RestController
@RequestMapping("/liqi/policy")
@Validated
public class AppPolicyController {

    @Resource
    private AppPolicyService policyService;
    @Resource
    private AppUserBizService userBizService;
    @Resource
    private ArkPolicyMatchService arkPolicyMatchService;

    @GetMapping("/page")
    @Operation(summary = "政策分页列表（类型/关键词/地区/行业/分类筛选）")
    @PermitAll
    public CommonResult<PageResult<PolicyDTO>> pagePolicy(PolicyQuery query) {
        return success(policyService.pagePolicy(query));
    }

    @GetMapping("/get")
    @Operation(summary = "政策详情")
    @PermitAll
    public CommonResult<Map<String, Object>> getPolicy(@RequestParam("id") String id) {
        PolicyDTO policy = policyService.getPolicy(id);
        Map<String, Object> data = new HashMap<>();
        data.put("policy", policy);
        Long userId = getLoginUserId();
        data.put("favorited", userId != null && userBizService.isFavorite(userId, id));
        return success(data);
    }

    @GetMapping("/match")
    @Operation(summary = "智能匹配政策（按我绑定的企业画像）")
    public CommonResult<List<PolicyDTO>> matchPolicies() {
        return success(policyService.matchPolicies(getLoginUserId()));
    }

    @PostMapping("/ai-match")
    @Operation(summary = "企业政策智能匹配（输入企业名，AI 大模型评估本地政策库，返回可申报政策 + 5 维打分）")
    @PermitAll
    public CommonResult<Map<String, Object>> aiMatchPolicy(@Valid @RequestBody AppPolicyAiMatchReqVO reqVO) {
        Map<String, Object> result = arkPolicyMatchService.companyPolicyMatch(
                reqVO.getCompanyName(), reqVO.getRevenue(), reqVO.getStaffNum());
        return success(result);
    }

    @GetMapping("/favorite-status")
    @Operation(summary = "查询某政策是否已收藏（游客返回 false）")
    @PermitAll
    public CommonResult<Boolean> favoriteStatus(@RequestParam("policyId") String policyId) {
        Long userId = getLoginUserId();
        return success(userId != null && userBizService.isFavorite(userId, policyId));
    }

}
