import { chromium } from '@playwright/test'
const BASE='http://127.0.0.1:5180'
const b=await chromium.launch({headless:true})
const p=await b.newPage()
const errs=[]
p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()) })
p.on('pageerror',e=>errs.push('PAGEERROR: '+(e.stack||e.message)))
await p.goto(BASE+'/',{waitUntil:'domcontentloaded'});await p.waitForTimeout(2500)
const fill=async(s,v)=>{const el=p.locator(s).first(); if(await el.count()){await el.fill('');await el.fill(v)}}
await fill('input[placeholder*="租户"]','芋道源码')
await fill('input[placeholder*="账号"], input[placeholder*="用户名"]','admin')
await fill('input[type="password"]','admin123')
await p.locator('.el-button--primary').first().click();await p.waitForTimeout(4500)
await p.goto(BASE+'/investment/chainInvest',{waitUntil:'domcontentloaded'});await p.waitForTimeout(3000)
console.log('URL=',p.url())
console.log('has .chain-invest=', await p.locator('.chain-invest').count())
console.log('--- ERRORS ('+errs.length+') ---')
console.log(errs.slice(0,10).join('\n\n'))
await b.close()
