package cn.iocoder.yudao.module.liqi.controller.app.company;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.module.liqi.service.app.AppCompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.annotation.security.PermitAll;
import java.util.Map;

import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "用户 APP - 企业获批查询")
@RestController
@RequestMapping("/liqi/company")
@Validated
public class AppCompanyController {

    @Resource
    private AppCompanyService companyService;

    @GetMapping("/check")
    @Operation(summary = "企业获批查询：企业信息 + 已获批项目 + 可申报项目（免登录公开查询）")
    @PermitAll
    public CommonResult<Map<String, Object>> check(@RequestParam("keyword") String keyword) {
        return success(companyService.checkCompany(keyword));
    }

}
