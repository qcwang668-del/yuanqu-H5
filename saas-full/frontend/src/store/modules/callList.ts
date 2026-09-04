import { defineStore } from 'pinia'
import { store } from '@/store'
import { genPhones } from '@/views/investment/callWorkbench/mock'

/** 联系号码 */
export interface CallPhone {
  number: string
  label: string
  /** idle 未拨 / called 已拨未通 / connected 已接通 */
  state: 'idle' | 'called' | 'connected'
}

/** 单次通话记录 */
export interface CallRecord {
  phone: string
  connected: boolean
  intent: '' | 'A' | 'B' | 'C'
  note: string
  duration: number // 秒
  at: string
}

/** 待联系企业 */
export interface CallEnterprise {
  id: number | string
  enterpriseName: string
  shortName?: string
  logoColor?: string
  legalPerson?: string
  industry?: string
  registerAddress?: string
  registeredCapital?: string
  phones: CallPhone[]
  /** pending 待联系 / calling 外呼中 / connected 已接通 / missed 未接通 / converted 已转化 */
  status: 'pending' | 'calling' | 'connected' | 'missed' | 'converted'
  intent: '' | 'A' | 'B' | 'C'
  note: string
  source: string
  tags: string[]
  addedAt: string
  records: CallRecord[]
  pushedCrm: boolean
}

/** 推送到 CRM 的线索 */
export interface CrmClue {
  id: string
  enterpriseId: number | string
  enterpriseName: string
  intent: '' | 'A' | 'B' | 'C'
  source: string
  owner: string
  nextFollow: string
  note: string
  at: string
}

interface CallListState {
  list: CallEnterprise[]
  clues: CrmClue[]
}

const now = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const useCallListStore = defineStore('callList', {
  state: (): CallListState => ({
    list: [],
    clues: []
  }),
  persist: true,
  getters: {
    count(): number {
      return this.list.length
    },
    /** 转化漏斗统计 */
    funnel(): { added: number; called: number; connected: number; intent: number; converted: number } {
      const called = this.list.filter((e) => e.records.length > 0).length
      const connected = this.list.filter((e) => e.status === 'connected' || e.status === 'converted').length
      const intent = this.list.filter((e) => e.intent === 'A' || e.intent === 'B').length
      const converted = this.list.filter((e) => e.pushedCrm).length
      return { added: this.list.length, called, connected, intent, converted }
    }
  },
  actions: {
    /** 批量加入待联系（自动去重、派生号码），返回新增数量 */
    addEnterprises(raws: any[], source: string): number {
      const exist = new Set(this.list.map((e) => String(e.id)))
      let added = 0
      raws.forEach((r) => {
        const id = r.id ?? r.enterpriseName ?? r.name
        if (exist.has(String(id))) return
        exist.add(String(id))
        const name = r.enterpriseName || r.name || '未知企业'
        this.list.unshift({
          id,
          enterpriseName: name,
          shortName: r.shortName || name.slice(0, 2),
          logoColor: r.logoColor || '#3f6fd0',
          legalPerson: r.legalPerson || r.legal || '',
          industry: r.industry || '',
          registerAddress: r.registerAddress || r.address || '',
          registeredCapital: r.registeredCapital || r.capital || '',
          phones: genPhones(id, name).map((p) => ({ ...p, state: 'idle' })),
          status: 'pending',
          intent: '',
          note: '',
          source,
          tags: [],
          addedAt: now(),
          records: [],
          pushedCrm: false
        })
        added++
      })
      return added
    },
    remove(id: number | string) {
      this.list = this.list.filter((e) => String(e.id) !== String(id))
    },
    clearAll() {
      this.list = []
    },
    addPhone(id: number | string, number: string, label = '手动新增') {
      const e = this.list.find((x) => String(x.id) === String(id))
      if (e && number) e.phones.push({ number, label, state: 'idle' })
    },
    updateTags(id: number | string, tags: string[]) {
      const e = this.list.find((x) => String(x.id) === String(id))
      if (e) e.tags = tags
    },
    /** 落一次通话结果 */
    recordCall(id: number | string, phone: string, rec: Omit<CallRecord, 'phone' | 'at'>) {
      const e = this.list.find((x) => String(x.id) === String(id))
      if (!e) return
      e.records.unshift({ phone, at: now(), ...rec })
      const ph = e.phones.find((p) => p.number === phone)
      if (ph) ph.state = rec.connected ? 'connected' : 'called'
      if (rec.intent) e.intent = rec.intent
      if (rec.note) e.note = rec.note
      // 状态推进：接通优先，否则若从未接通则 missed
      if (rec.connected) e.status = 'connected'
      else if (e.status === 'pending' || e.status === 'calling') e.status = 'missed'
    },
    /** 一键推 CRM：生成线索并标记 */
    pushToCrm(id: number | string, opts: { owner?: string; nextFollow?: string } = {}): CrmClue | null {
      const e = this.list.find((x) => String(x.id) === String(id))
      if (!e) return null
      const clue: CrmClue = {
        id: 'CLUE-' + String(e.id) + '-' + Date.now(),
        enterpriseId: e.id,
        enterpriseName: e.enterpriseName,
        intent: e.intent,
        source: e.source,
        owner: opts.owner || '招商专员',
        nextFollow: opts.nextFollow || '',
        note: e.note,
        at: now()
      }
      this.clues.unshift(clue)
      e.pushedCrm = true
      e.status = 'converted'
      return clue
    }
  }
})

export const useCallListStoreWithOut = () => useCallListStore(store)
