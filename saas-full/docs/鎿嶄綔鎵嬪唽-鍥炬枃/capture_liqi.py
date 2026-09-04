# -*- coding: utf-8 -*-
"""力企云(芋道 + Element Plus)适配版采图：登录 → 逐页导航截图。
基于 webapp-manual-gen/capture_helper.py，替换登录与交互为芋道版。
用法：python3 capture_liqi.py --config config.json --shotlist shotlist.json
"""
import sys, os, time, json, argparse
sys.path.insert(0, "/home/fangnan/.claude/skills/drissionpage-server/scripts")


def by_placeholder(p, ph):
    for e in p.eles("tag:input"):
        try:
            if (e.attr("placeholder") or "") == ph and e.states.is_displayed:
                return e
        except Exception:
            pass
    return None


JS_SET = ("var el=arguments[0];"
          "var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;"
          "d.call(el, arguments[1]);"
          "el.dispatchEvent(new Event('input',{bubbles:true}));"
          "el.dispatchEvent(new Event('change',{bubbles:true}));return el.value;")


def fill_ph(p, ph, val):
    e = by_placeholder(p, ph)
    if not e:
        return False
    # Vue 受控输入：用原生 setter 清空并赋值，再派发 input/change 事件
    try:
        e.click()
    except Exception:
        pass
    try:
        p.run_js(JS_SET, e, "")
        p.run_js(JS_SET, e, val)
    except Exception:
        try:
            e.clear(True); e.input(val)
        except Exception:
            pass
    time.sleep(0.3)
    return True


def click_login(p):
    for b in p.eles("tag:button"):
        try:
            if (b.text or "").strip() in ("登录", "登 录") and b.states.is_displayed:
                b.click(); return True
        except Exception:
            pass
    return False


def ensure_login(p, base, tenant, username, password):
    p.get(base + "/login"); time.sleep(6)
    fill_ph(p, "请输入租户名称", tenant)
    fill_ph(p, "请输入用户名", username)
    fill_ph(p, "请输入密码", password)
    time.sleep(0.5)
    click_login(p)
    time.sleep(7)
    # 跳走 /login 即成功
    return "/login" not in p.url


def click_text(p, txt, exact=False):
    for tg in ("button", "span", "a", "li", "div"):
        for el in p.eles("t:" + tg):
            t = (el.text or "").strip()
            if ((t == txt) if exact else (txt and txt in t)):
                try:
                    if el.states.is_displayed:
                        el.click(); return True
                except Exception:
                    pass
    return False


def do_action(p, act):
    if "click_text" in act:
        click_text(p, act["click_text"], exact=act.get("exact", False))
    elif "js" in act:
        try:
            p.run_js(act["js"])
        except Exception:
            pass
    time.sleep(act.get("wait", 1.5))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--shotlist", required=True)
    args = ap.parse_args()
    cfg = json.load(open(args.config, encoding="utf-8"))
    sl = json.load(open(args.shotlist, encoding="utf-8"))
    base_dir = os.path.dirname(os.path.abspath(args.config))
    img_dir = os.path.join(base_dir, cfg.get("img_dir", "img"))
    os.makedirs(img_dir, exist_ok=True)

    login = cfg.get("login", {})
    base = sl.get("base") or login.get("base", "http://127.0.0.1:5180")
    tenant = login.get("tenant", "芋道源码")
    username = login.get("username", "admin")
    password = login.get("password", "admin123")

    from dp_browser import new_page
    p = new_page()
    try:
        p.set.window.size(1920, 1080)
    except Exception:
        pass
    time.sleep(1)

    if not ensure_login(p, base, tenant, username, password):
        print("LOGIN_FAILED url=", p.url)
        try:
            p.get_screenshot(path=os.path.join(img_dir, "_login_failed.png"))
        except Exception:
            pass
        p.quit(); sys.exit(1)
    print("LOGIN_OK url=", p.url)

    ok = 0
    for s in sl["shots"]:
        if s.get("url"):
            p.get(base + s["url"]); time.sleep(s.get("wait", 5))
        for act in s.get("actions", []):
            do_action(p, act)
        time.sleep(0.5)
        path = os.path.join(img_dir, s["name"] + ".png")
        try:
            p.get_screenshot(path=path); ok += 1
            print("SHOT", s["name"], "url=", p.url)
        except Exception as e:
            print("SHOT_FAIL", s["name"], str(e)[:80])
    p.quit()
    print("DONE ok=%d/%d img_dir=%s" % (ok, len(sl["shots"]), img_dir))


if __name__ == "__main__":
    main()
