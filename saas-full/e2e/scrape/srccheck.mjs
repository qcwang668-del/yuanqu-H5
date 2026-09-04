import { chromium } from '@playwright/test'
const OUT='/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b=await chromium.launch({headless:true,args:['--no-sandbox']})
const ctx=await b.newContext({viewport:{width:1680,height:1080}})
const p=await ctx.newPage(); p.setDefaultTimeout(15000)
await p.goto('https://clue.liqicloud.com/',{waitUntil:'networkidle'}).catch(()=>{})
await p.waitForTimeout(2000)
await p.fill('input[name="username"]','19911110000'); await p.fill('input[name="password"]','admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(3500)
const ok=p.locator('button:has-text("确定")').first(); if(await ok.count()){await ok.click();await p.waitForTimeout(4500)}
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(()=>{})
await p.waitForTimeout(1000)
await p.evaluate(()=>{const el=Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find(e=>(e.textContent||'').trim()==='企业查询'); if(el)(el.closest('.ant-menu-item, li, a')||el).click()})
await p.waitForTimeout(4500)
// 读所有 iframe 的 src
const srcs=await p.evaluate(()=>Array.from(document.querySelectorAll('iframe')).map(f=>f.src))
console.log('IFRAME SRCS=',JSON.stringify(srcs,null,1))
// 读 parent localStorage 里的 token 键
const ls=await p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/token|auth|access/i.test(k))o[k]=(localStorage.getItem(k)||'').slice(0,40)}return o})
console.log('PARENT LS token keys=',JSON.stringify(ls,null,1))
// 读 plugin frame 的 localStorage token
const fr=p.frames().find(f=>f.url().includes('clue-plugin'))
const fls=await fr.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=(localStorage.getItem(k)||'').slice(0,30)}return o}).catch(()=>({}))
console.log('PLUGIN LS keys=',JSON.stringify(Object.keys(fls)))
await b.close()
