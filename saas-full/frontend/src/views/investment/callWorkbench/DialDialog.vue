<!--
  AI 外呼 · 拨号弹窗（纯前端演示）
  拨号中 → 通话中（计时 + 声波动画 + AI 话术字幕逐句滚动）→ 挂断 → 通话小结
  后续接入真实外呼平台时，仅需把 startDial/挂断 里的定时器换成 WebRTC/SIP 事件回调。
-->
<template>
  <el-dialog
    :model-value="modelValue"
    :show-close="false"
    width="520px"
    align-center
    class="dial-dlg"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @closed="reset"
  >
    <div class="dial-body" :class="stage">
      <!-- 头部：企业 + 号码 -->
      <div class="dial-head">
        <div class="dh-logo" :style="{ background: ent?.logoColor || '#3f6fd0' }">
          {{ ent?.shortName || ent?.enterpriseName?.slice(0, 2) }}
        </div>
        <div class="dh-info">
          <div class="dh-name">{{ ent?.enterpriseName }}</div>
          <div class="dh-phone">
            <el-icon><Phone /></el-icon>
            <span>{{ phone?.label }} · {{ phone?.number }}</span>
          </div>
        </div>
        <div class="dh-badge">AI 智能外呼</div>
      </div>

      <!-- 拨号中 -->
      <div v-if="stage === 'dialing'" class="dial-stage">
        <div class="ring">
          <span class="ring-dot"></span>
          <el-icon class="ring-ic"><PhoneFilled /></el-icon>
        </div>
        <div class="stage-tip">正在为您接通 AI 外呼线路…</div>
        <el-button plain size="small" @click="simulateMissed">模拟无人接听</el-button>
      </div>

      <!-- 通话中 -->
      <div v-else-if="stage === 'talking'" class="dial-stage talking">
        <div class="talk-top">
          <div class="wave">
            <i v-for="n in 18" :key="n" :style="{ animationDelay: n * 0.06 + 's' }"></i>
          </div>
          <div class="timer">{{ fmtTime(seconds) }}</div>
        </div>
        <!-- AI 话术实时字幕 -->
        <div ref="subtitleRef" class="subtitles">
          <div v-for="(t, i) in shownLines" :key="i" class="sub-line" :class="t.role">
            <span class="who">{{ t.role === 'ai' ? 'AI' : t.role === 'cust' ? '客户' : '系统' }}</span>
            <span class="txt">{{ t.text }}</span>
          </div>
          <div v-if="typing" class="sub-line ai typing">
            <span class="who">AI</span><span class="txt">正在应答<i>.</i><i>.</i><i>.</i></span>
          </div>
        </div>
      </div>

      <!-- 通话小结 -->
      <div v-else-if="stage === 'summary'" class="dial-stage summary">
        <div class="sum-row">
          <span class="lb">通话结果</span>
          <el-radio-group v-model="form.connected">
            <el-radio-button :value="true">已接通</el-radio-button>
            <el-radio-button :value="false">未接通</el-radio-button>
          </el-radio-group>
          <span class="dur">时长 {{ fmtTime(seconds) }}</span>
        </div>
        <div v-if="form.connected" class="sum-row">
          <span class="lb">意向分级</span>
          <el-radio-group v-model="form.intent">
            <el-radio-button value="A">A · 高意向</el-radio-button>
            <el-radio-button value="B">B · 中意向</el-radio-button>
            <el-radio-button value="C">C · 低意向</el-radio-button>
          </el-radio-group>
        </div>
        <div class="sum-row col">
          <span class="lb">通话备注</span>
          <el-select
            v-model="tpl"
            placeholder="选择常用备注模板快速填写"
            clearable
            size="small"
            style="width: 100%; margin-bottom: 8px"
            @change="(v) => v && (form.note = v)"
          >
            <el-option v-for="t in NOTE_TEMPLATES" :key="t" :label="t" :value="t" />
          </el-select>
          <el-input v-model="form.note" type="textarea" :rows="3" placeholder="记录客户反馈、需求、下一步动作…" />
        </div>
        <div class="sum-row rec">
          <span class="lb">通话录音</span>
          <div class="rec-box">
            <el-icon><VideoPlay /></el-icon>
            <div class="rec-wave"><i v-for="n in 40" :key="n" :style="{ height: 4 + ((n * 7) % 18) + 'px' }"></i></div>
            <span class="rec-time">{{ fmtTime(seconds) }}</span>
            <el-tag size="small" type="info" effect="plain">录音占位（接入后可回放）</el-tag>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dial-footer">
        <template v-if="stage === 'talking'">
          <el-button type="danger" round @click="hangup">
            <el-icon><PhoneFilled /></el-icon>&nbsp;挂断
          </el-button>
        </template>
        <template v-else-if="stage === 'summary'">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="confirm">保存通话记录</el-button>
        </template>
        <template v-else>
          <el-button @click="close">取消呼叫</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, reactive, watch } from 'vue'
import { Phone, PhoneFilled, VideoPlay } from '@element-plus/icons-vue'
import { AI_SCRIPT_CONNECTED, AI_SCRIPT_MISSED, NOTE_TEMPLATES } from './mock'

const props = defineProps<{
  modelValue: boolean
  ent: any
  phone: any
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'done', payload: { connected: boolean; intent: '' | 'A' | 'B' | 'C'; note: string; duration: number }): void
}>()

type Stage = 'dialing' | 'talking' | 'summary'
const stage = ref<Stage>('dialing')
const seconds = ref(0)
const shownLines = ref<{ role: string; text: string }[]>([])
const typing = ref(false)
const subtitleRef = ref<HTMLElement>()
const tpl = ref('')
const form = reactive<{ connected: boolean; intent: '' | 'A' | 'B' | 'C'; note: string }>({
  connected: true,
  intent: 'A',
  note: ''
})

let timer: any = null
let scriptTimer: any = null
let dialTimer: any = null
let missed = false

const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const clearTimers = () => {
  clearInterval(timer); timer = null
  clearTimeout(scriptTimer); scriptTimer = null
  clearTimeout(dialTimer); dialTimer = null
}

const reset = () => {
  clearTimers()
  stage.value = 'dialing'
  seconds.value = 0
  shownLines.value = []
  typing.value = false
  tpl.value = ''
  missed = false
  form.connected = true
  form.intent = 'A'
  form.note = ''
}

// 打开弹窗即自动拨号
watch(
  () => props.modelValue,
  (v) => {
    if (v) startDial()
    else clearTimers()
  }
)

const startDial = () => {
  reset()
  dialTimer = setTimeout(() => {
    if (missed) return
    enterTalking()
  }, 1600)
}

const simulateMissed = () => {
  missed = true
  clearTimers()
  const lines = AI_SCRIPT_MISSED(props.ent?.enterpriseName || '目标企业')
  shownLines.value = lines
  form.connected = false
  form.intent = ''
  form.note = '无人接听，稍后重拨'
  seconds.value = 8
  stage.value = 'summary'
}

const enterTalking = () => {
  stage.value = 'talking'
  seconds.value = 0
  timer = setInterval(() => (seconds.value += 1), 1000)
  const lines = AI_SCRIPT_CONNECTED(props.ent?.enterpriseName || '目标企业')
  let i = 0
  const next = () => {
    if (i >= lines.length) { typing.value = false; return }
    typing.value = lines[i].role === 'ai'
    scriptTimer = setTimeout(() => {
      shownLines.value.push(lines[i])
      typing.value = false
      i++
      nextTick(() => {
        if (subtitleRef.value) subtitleRef.value.scrollTop = subtitleRef.value.scrollHeight
      })
      scriptTimer = setTimeout(next, 700)
    }, 900)
  }
  next()
}

const hangup = () => {
  clearTimers()
  stage.value = 'summary'
  form.connected = true
  if (!form.intent) form.intent = 'A'
}

const confirm = () => {
  emit('done', {
    connected: form.connected,
    intent: form.connected ? form.intent : '',
    note: form.note,
    duration: seconds.value
  })
  emit('update:modelValue', false)
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dial-body { padding: 4px 4px 0; }
.dial-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
  position: relative;
}
.dh-logo {
  width: 48px; height: 48px; border-radius: 10px;
  display: grid; place-items: center;
  color: #fff; font-weight: 700; font-size: 16px; flex: none;
}
.dh-info { flex: 1; min-width: 0; }
.dh-name { font-size: 16px; font-weight: 600; color: #1f2d3d; }
.dh-phone { display: flex; align-items: center; gap: 5px; color: #2f6fe0; font-size: 13px; margin-top: 4px; }
.dh-badge {
  position: absolute; top: 0; right: 0;
  background: linear-gradient(135deg, #2f86e0, #1863c7);
  color: #fff; font-size: 11px; padding: 3px 9px; border-radius: 10px;
}
.dial-stage { padding: 22px 6px; text-align: center; }

/* 拨号中 */
.ring { position: relative; width: 88px; height: 88px; margin: 6px auto 18px; }
.ring-dot {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(47, 134, 224, 0.18); animation: ringPulse 1.4s infinite;
}
.ring-ic {
  position: absolute; inset: 0; margin: auto; width: 44px; height: 44px;
  color: #fff; background: linear-gradient(135deg, #2f86e0, #1863c7);
  border-radius: 50%; padding: 12px; font-size: 22px;
}
@keyframes ringPulse { 0% { transform: scale(0.8); opacity: 1 } 100% { transform: scale(1.9); opacity: 0 } }
.stage-tip { color: #6b7a90; font-size: 14px; margin-bottom: 16px; }

/* 通话中 */
.talk-top { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 14px; }
.wave { display: flex; align-items: center; gap: 3px; height: 34px; }
.wave i {
  width: 3px; height: 8px; border-radius: 2px;
  background: linear-gradient(#2f86e0, #58c0a8); animation: wave 0.9s ease-in-out infinite;
}
@keyframes wave { 0%, 100% { height: 7px } 50% { height: 30px } }
.timer { font-size: 20px; font-weight: 700; color: #1863c7; font-variant-numeric: tabular-nums; }
.subtitles {
  text-align: left; max-height: 210px; overflow-y: auto;
  background: #f6f8fc; border-radius: 10px; padding: 12px 14px;
}
.sub-line { display: flex; gap: 8px; margin-bottom: 10px; font-size: 13px; line-height: 1.6; }
.sub-line .who {
  flex: none; width: 34px; height: 20px; border-radius: 5px; font-size: 11px;
  display: grid; place-items: center; color: #fff;
}
.sub-line.ai .who { background: #2f86e0; }
.sub-line.cust .who { background: #58c0a8; }
.sub-line.sys .who { background: #b0b8c4; }
.sub-line.cust { flex-direction: row-reverse; text-align: right; }
.sub-line .txt { color: #33404f; }
.sub-line.sys .txt { color: #94a0ae; }
.typing .txt i { animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0.2 } }

/* 小结 */
.summary { text-align: left; padding: 16px 6px 4px; }
.sum-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.sum-row.col { flex-direction: column; align-items: stretch; gap: 6px; }
.sum-row .lb { flex: none; width: 64px; color: #6b7a90; font-size: 13px; }
.sum-row .dur { color: #909aa8; font-size: 12px; margin-left: auto; }
.rec-box {
  flex: 1; display: flex; align-items: center; gap: 8px;
  background: #f6f8fc; border-radius: 8px; padding: 8px 12px; color: #2f6fe0;
}
.rec-wave { display: flex; align-items: center; gap: 2px; height: 22px; }
.rec-wave i { width: 2px; background: #9ec3f0; border-radius: 1px; }
.rec-time { font-size: 12px; color: #6b7a90; }
.dial-footer { text-align: center; }
</style>
