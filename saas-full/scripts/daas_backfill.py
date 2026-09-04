#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
力企云 DaaS 企业工商信息批量回填脚本。
读 企业名<TAB>统一社会信用代码 名单 → 逐家调 DaaS qiye-base-info → 生成 UPDATE liqi_enterprise 的 SQL。
用法（宿主机 root 跑，能访问 daas.liqicloud.com）：
  python3 scripts/daas_backfill.py <名单.txt> <输出.sql>
之后：docker exec -i liqi-mysql mysql -uroot -p*** --default-character-set=utf8mb4 ruoyi-vue-pro < 输出.sql
"""
import hashlib, time, uuid, json, sys, urllib.request, urllib.parse

APPKEY = "LQC_b76906b4dL07AKRqgU4P"
APPSECRET = "25678de6f99df113d083afeeeb723f3e"
URL = "https://daas.liqicloud.com/api/business/qiyedata/qiye-base-info"

# 本地列长度（超出按字符截断，防 strict mode 报错）
MAXLEN = {"legal_person": 32, "registered_capital": 40, "industry": 80, "register_address": 200,
          "company_org_type": 64, "reg_status": 32, "reg_institute": 128, "former_name": 512,
          "reg_number": 32, "actual_capital": 64, "staff_num_range": 32}


def sign(ts, nonce):
    return hashlib.md5((APPKEY + ts + nonce + APPSECRET).encode("utf-8")).hexdigest()


def query(entity_id, retries=2):
    for i in range(retries + 1):
        try:
            ts = str(int(time.time() * 1000))
            nonce = str(uuid.uuid4())
            q = urllib.parse.urlencode({"entityId": entity_id})
            req = urllib.request.Request(
                URL + "?" + q,
                headers={"appKey": APPKEY, "timestamp": ts, "nonce": nonce, "sign": sign(ts, nonce)})
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception:
            if i == retries:
                return None
            time.sleep(1.0)
    return None


def esc(v):
    if v is None:
        return ""
    return str(v).replace("\\", "\\\\").replace("'", "''")


def clip(col, val):
    s = "" if val is None else str(val)
    n = MAXLEN.get(col)
    if n and len(s) > n:
        s = s[:n]
    return esc(s)


def main():
    txt_path, out_path = sys.argv[1], sys.argv[2]
    rows = []
    with open(txt_path, encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\r\n").split("\t")
            if len(parts) >= 2 and parts[0].strip() and parts[1].strip():
                rows.append((parts[0].strip(), parts[1].strip()))

    sql = ["SET NAMES utf8mb4;", "START TRANSACTION;"]
    hit = miss = 0
    for name, code in rows:
        resp = query(code)
        d = (resp or {}).get("data")
        if not d:
            sql.append(f"UPDATE liqi_enterprise SET enrich_status=2 WHERE credit_code='{esc(code)}';")
            miss += 1
            print(f"  ✘ {code} {name} —— 无工商数据")
            continue
        hit += 1
        cap = d.get("regCapital")
        cap_s = (f"{cap}{d.get('regCapitalType') or ''}") if cap is not None else ""
        industry = " / ".join([x for x in [d.get("industryLv1Name"), d.get("industryLv2Name"),
                                           d.get("industryLv3Name"), d.get("industryLv4Name")] if x])
        sets = [
            f"legal_person='{clip('legal_person', d.get('legalName'))}'",
            f"registered_capital='{clip('registered_capital', cap_s)}'",
            f"industry='{clip('industry', industry)}'",
            f"register_address='{clip('register_address', d.get('regAddress'))}'",
            f"company_org_type='{clip('company_org_type', d.get('zcbComType'))}'",
            f"reg_status='{clip('reg_status', d.get('entStatus'))}'",
            f"business_scope='{esc(d.get('opScope'))}'",
            f"reg_institute='{clip('reg_institute', d.get('regOrg'))}'",
            f"former_name='{clip('former_name', d.get('companyFormerName'))}'",
            f"reg_number='{clip('reg_number', d.get('licenseNumber'))}'",
            f"org_number='{clip('reg_number', d.get('organizationNumber'))}'",
            "enrich_status=1",
            "enrich_time=NOW()",
        ]
        if d.get("regDate"):
            sets.append(f"establish_date='{esc(d.get('regDate'))}'")
        if d.get("socialStaffNum") is not None:
            try:
                sets.append(f"insured_count={int(d.get('socialStaffNum'))}")
            except Exception:
                pass
        sql.append(f"UPDATE liqi_enterprise SET {', '.join(sets)} WHERE credit_code='{esc(code)}';")
        print(f"  ✔ {code} {d.get('companyName')} | {d.get('legalName')} | {d.get('entStatus')}")
        time.sleep(0.12)
    sql.append("COMMIT;")
    sql.append(f"-- 回填完成：命中 {hit}，未命中 {miss}，共 {len(rows)}")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql) + "\n")
    print(f"\n=== 命中 {hit} / 未命中 {miss} / 共 {len(rows)}；SQL 已写出：{out_path} ===")


if __name__ == "__main__":
    main()
