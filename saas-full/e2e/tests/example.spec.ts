import { test, expect } from '@playwright/test';

/**
 * 示例 E2E 测试
 * 测试首页加载和基本交互
 */
test.describe('首页功能', () => {
  test('应该成功加载首页', async ({ page }) => {
    // 1. 访问首页
    await page.goto('/');

    // 截图：首页加载
    await page.screenshot({
      path: 'evidence/homepage/01_页面加载.png',
      fullPage: true
    });

    // 2. 验证页面标题
    await expect(page).toHaveTitle(/智远力企-saas/);

    // 3. 验证关键元素存在
    // await expect(page.locator('header')).toBeVisible();
    // await expect(page.locator('main')).toBeVisible();
  });

  test('应该处理用户交互', async ({ page }) => {
    await page.goto('/');

    // 示例：点击按钮
    // const button = page.locator('button[data-testid="submit"]');
    // await button.click();

    // 截图：交互后状态
    // await page.screenshot({
    //   path: 'evidence/homepage/02_点击按钮.png'
    // });

    // 验证结果
    // await expect(page.locator('.result')).toBeVisible();
  });

  test('应该处理错误情况', async ({ page }) => {
    await page.goto('/');

    // 测试边界情况
    // 例如：空输入、无效数据等

    // 截图：错误状态
    // await page.screenshot({
    //   path: 'evidence/homepage/03_错误处理.png'
    // });
  });
});

/**
 * E2E 测试编写规范：
 *
 * 1. 每个测试文件对应一个功能模块
 * 2. 使用 test.describe 分组相关测试
 * 3. 关键步骤必须截图，命名规范：01_步骤描述.png
 * 4. 覆盖 golden path + 边界 case
 * 5. 使用 data-testid 而非 CSS 选择器定位元素
 * 6. 验证点清晰明确，使用语义化断言
 */
