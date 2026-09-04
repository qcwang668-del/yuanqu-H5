package cn.iocoder.yudao.module.liqi.message.controller.admin;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.module.liqi.message.controller.admin.vo.ParkPushCandidateVO;
import cn.iocoder.yudao.module.liqi.message.controller.admin.vo.UserMessagePageReqVO;
import cn.iocoder.yudao.module.liqi.message.dal.dataobject.LiqiUserMessageDO;
import cn.iocoder.yudao.module.liqi.message.service.LiqiUserMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.List;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "管理后台 - 推送记录（政策找人）")
@RestController
@RequestMapping("/liqi/push-message")
@Validated
public class LiqiPushMessageController {

    @Resource
    private LiqiUserMessageService userMessageService;

    @GetMapping("/page")
    @Operation(summary = "推送记录分页")
    @PreAuthorize("@ss.hasPermission('liqi:push-message:query')")
    public CommonResult<PageResult<LiqiUserMessageDO>> getPage(@Valid UserMessagePageReqVO pageReqVO) {
        return success(userMessageService.getAdminPage(pageReqVO));
    }

    @PostMapping("/push")
    @Operation(summary = "运营定向推送一条政策（target=all 全部已绑定会员 / match 画像匹配会员）")
    @PreAuthorize("@ss.hasPermission('liqi:push-message:push')")
    public CommonResult<Integer> push(@RequestParam("policyId") String policyId,
                                      @RequestParam(value = "target", defaultValue = "match") String target) {
        return success(userMessageService.pushByPolicy(policyId, target));
    }

    @GetMapping("/park-candidates")
    @Operation(summary = "园区政策：预览本园区可推送的候选企业名单（含匹配理由/是否已推）")
    @PreAuthorize("@ss.hasPermission('liqi:push-message:push')")
    public CommonResult<List<ParkPushCandidateVO>> parkCandidates(@RequestParam("policyId") String policyId) {
        return success(userMessageService.candidatesOfParkPolicy(policyId));
    }

    @PostMapping("/park-push")
    @Operation(summary = "园区政策：推送给勾选的会员（userIds）")
    @PreAuthorize("@ss.hasPermission('liqi:push-message:push')")
    public CommonResult<Integer> parkPush(@RequestParam("policyId") String policyId,
                                          @RequestBody ParkPushReqVO reqVO) {
        return success(userMessageService.pushParkPolicyToUsers(policyId, reqVO.getUserIds()));
    }

    @lombok.Data
    public static class ParkPushReqVO {
        /** 勾选的会员用户 ID 列表 */
        private List<Long> userIds;
    }

}
