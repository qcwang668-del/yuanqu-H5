<!--
  智慧招商 · 地图招商（Leaflet + 高德免费栅格瓦片，无需任何 AK / key）
  左：可拖动缩放的深圳地图 + 半径圈 + 编号企业标记 + 点标记弹窗（圈选/拖动模式）
  右：当前区域 + 多维筛选面板 + 企业结果列表 + 分页
  瓦片为高德公开栅格瓦片，浏览器直连取图，演示稳定；坐标系 GCJ-02。
-->
<template>
  <div class="map-invest">
    <!-- ===== 左：地图 ===== -->
    <div class="mi-map-wrap">
      <div ref="mapContainerRef" class="mi-map"></div>
      <!-- 模式切换 -->
      <div class="mi-tools">
        <button class="mi-tool" :class="{ on: mode === 'circle' }" @click="setMode('circle')">
          <span class="ic">◎</span>圈选模式
        </button>
        <button class="mi-tool" :class="{ on: mode === 'drag' }" @click="setMode('drag')">
          <span class="ic">✥</span>拖动模式
        </button>
      </div>
      <!-- 城市选择 -->
      <div class="mi-city">
        <el-select v-model="city" size="default" style="width: 120px" @change="onCityChange">
          <el-option v-for="c in CITIES" :key="c.name" :label="c.name" :value="c.name" />
        </el-select>
      </div>
      <div v-if="mapError" class="mi-map-err">
        <el-empty :description="mapError" />
      </div>
    </div>

    <!-- ===== 右：筛选 + 列表 ===== -->
    <div class="mi-side">
      <!-- 当前区域 -->
      <div class="mi-area">
        <span class="lb">当前区域：</span>
        <span class="addr" :title="address">{{ address }}</span>
        <span class="near">附近</span>
        <el-input v-model.number="radiusKm" size="small" style="width: 64px" @change="onRadiusChange">
          <template #suffix>km</template>
        </el-input>
        <span class="near">以内公司</span>
      </div>

      <!-- 筛选面板 -->
      <div class="mi-filters">
        <div class="fr">
          <span class="frk">基本信息</span>
          <el-select v-for="f in baseFilters" :key="f.key" v-model="filters[f.key]" :placeholder="f.label" clearable size="small" class="fsel">
            <el-option v-for="o in f.options" :key="o" :label="o" :value="o" />
          </el-select>
        </div>
        <div class="fr">
          <span class="frk">高级筛选</span>
          <el-select v-for="f in advFilters" :key="f.key" v-model="filters[f.key]" :placeholder="f.label" clearable size="small" class="fsel">
            <el-option v-for="o in f.options" :key="o" :label="o" :value="o" />
          </el-select>
        </div>
        <div class="fr">
          <span class="frk"></span>
          <el-select v-for="f in riskFilters" :key="f.key" v-model="filters[f.key]" :placeholder="f.label" clearable size="small" class="fsel">
            <el-option v-for="o in f.options" :key="o" :label="o" :value="o" />
          </el-select>
        </div>
      </div>

      <!-- 结果条 -->
      <div class="mi-resbar">
        <div class="cnt">共为您找到 <b>{{ totalResults.toLocaleString() }}</b> 条相关结果</div>
        <div class="ops">
          <el-select v-model="lockView" size="small" style="width: 118px">
            <el-option label="只看未解锁" value="unlock" />
            <el-option label="查看全部" value="all" />
          </el-select>
          <el-select v-model="clueOp" size="small" style="width: 108px" placeholder="线索操作">
            <el-option label="批量解锁" value="unlock" />
            <el-option label="加入线索池" value="pool" />
            <el-option label="导出线索" value="export" />
          </el-select>
          <el-select v-model="batchScope" size="small" style="width: 148px">
            <el-option label="操作前5千条线索" value="5000" />
            <el-option label="操作前1千条线索" value="1000" />
            <el-option label="操作当前页" value="page" />
          </el-select>
          <el-button type="success" size="small" :disabled="!selected.length" @click="addSelectedToCall">
            加入待联系（{{ selected.length }}）
          </el-button>
          <el-badge :value="callStore.count" :hidden="callStore.count === 0" type="danger">
            <el-button size="small" @click="goWorkbench">📞 客户池管理</el-button>
          </el-badge>
        </div>
      </div>

      <!-- 企业列表 -->
      <el-table :data="pagedCompanies" size="small" height="calc(100vh - 360px)" @selection-change="onSel">
        <el-table-column type="selection" width="38" />
        <el-table-column label="序号" type="index" width="52" :index="(i) => (page - 1) * pageSize + i + 1" />
        <el-table-column label="公司名称" min-width="200">
          <template #default="{ row }">
            <span class="co-link" @click="focusCompany(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="详情" width="60" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
        <el-table-column label="法定代表人" prop="legal" width="100" />
        <el-table-column label="注册资本" prop="capital" width="96" />
        <el-table-column label="成立日期" prop="date" width="106" />
        <el-table-column label="行业" prop="industry" min-width="118" show-overflow-tooltip />
        <el-table-column label="状态" width="72">
          <template #default="{ row }">
            <el-tag size="small" type="success" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="mi-pager">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="companies.length"
          layout="prev, pager, next"
          small
          background
        />
      </div>
    </div>

    <!-- 企业详情抽屉 -->
    <EnterpriseDrawer v-model="detailVisible" :enterprise="detailEnt" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCallListStore } from '@/store/modules/callList'
import EnterpriseDrawer from '@/views/park/enterpriseList/EnterpriseDrawer.vue'
import { detailFromParkEntity } from '@/views/park/enterpriseList/enterpriseData'

defineOptions({ name: 'InvestmentMapInvest' })

const router = useRouter()
const callStore = useCallListStore()
const goWorkbench = () => router.push('/customer-pool')

// 企业详情抽屉（地图招商：企业名称后「详情」列触发）
const detailVisible = ref(false)
const detailEnt = ref<any>(null)
const openDetail = (row: any) => {
  detailEnt.value = detailFromParkEntity({
    id: row.name,
    enterpriseName: row.name,
    legalPerson: row.legal,
    registeredCapital: row.capital,
    establishDate: row.date,
    industry: row.industry,
    status: row.status,
    registerAddress: row.address || ''
  })
  detailVisible.value = true
}

/* ------- 城市中心（高德/GCJ-02 坐标） ------- */
const CITIES = [
  { name: '深圳市', lng: 113.9442, lat: 22.5178, addr: '广东省深圳市南山区粤海街道高新南九道6 深圳湾科技生态园6栋 附近' },
  { name: '广州市', lng: 113.324, lat: 23.1066, addr: '广东省广州市天河区珠江新城 附近' },
  { name: '东莞市', lng: 113.7518, lat: 23.0207, addr: '广东省东莞市南城街道 附近' },
  { name: '北京市', lng: 116.4074, lat: 39.9042, addr: '北京市朝阳区 附近' },
  { name: '上海市', lng: 121.4737, lat: 31.2304, addr: '上海市浦东新区陆家嘴 附近' }
]
const city = ref('深圳市')
const address = ref(CITIES[0].addr)
const radiusKm = ref(5)
const mode = ref<'circle' | 'drag'>('drag')
const totalResults = ref(720256)

/* ------- 筛选项 ------- */
const baseFilters = [
  { key: 'industry', label: '所属行业', options: ['批发和零售业', '信息传输、软件和信息技术服务业', '制造业', '科学研究和技术服务业', '房地产业', '文化、体育和娱乐业'] },
  { key: 'regStatus', label: '登记状态', options: ['存续', '在业', '注销', '吊销', '迁出'] },
  { key: 'age', label: '成立年限', options: ['1年内', '1-3年', '3-5年', '5-10年', '10年以上'] },
  { key: 'capital', label: '注册资本', options: ['10万以下', '10-100万', '100-500万', '500-1000万', '1000万以上'] },
  { key: 'org', label: '组织机构', options: ['有限责任公司', '股份有限公司', '个人独资企业', '合伙企业'] }
]
const advFilters = [
  { key: 'insured', label: '参保人数', options: ['0人', '1-49人', '50-99人', '100-499人', '500人以上'] },
  { key: 'trademark', label: '商标数量', options: ['无', '1-9', '10-49', '50以上'] },
  { key: 'patent', label: '专利数量', options: ['无', '1-9', '10-49', '50以上'] },
  { key: 'listed', label: '上市企业', options: ['A股', '港股', '新三板', '未上市'] },
  { key: 'tax', label: '纳税信用', options: ['A级', 'B级', 'M级', 'C级', 'D级'] }
]
const riskFilters = [
  { key: 'adminPunish', label: '行政处罚', options: ['无', '有'] },
  { key: 'envPunish', label: '环保处罚', options: ['无', '有'] },
  { key: 'abnormal', label: '经营异常', options: ['无', '有'] },
  { key: 'illegal', label: '严重违法', options: ['无', '有'] }
]
const filters = reactive<Record<string, any>>({})
const lockView = ref('unlock')
const clueOp = ref('')
const batchScope = ref('5000')

/* ------- 企业列表（模拟数据，GCJ-02 经纬度用于地图标记） ------- */
type Company = { name: string; legal: string; capital: string; date: string; industry: string; status: string; lng: number; lat: number }
const companies = ref<Company[]>([
  { name: '深圳市奥荣芯科技有限公司', legal: '黄家军', capital: '10万元', date: '2026-01-20', industry: '批发和零售业', status: '存续', lng: 113.9490, lat: 22.5250 },
  { name: '深圳市壹简简科技有限公司', legal: '石庚', capital: '-', date: '2026-01-21', industry: '信息传输、软件', status: '存续', lng: 113.9380, lat: 22.5205 },
  { name: '深圳市嘉宸钧合咨询顾问有限公司', legal: '杨远芝', capital: '10万元', date: '2026-01-23', industry: '租赁和商务服务业', status: '存续', lng: 113.9430, lat: 22.5135 },
  { name: '深圳元颂文化传播有限公司', legal: '杨杰斯', capital: '20万元', date: '2026-01-26', industry: '文化、体育和娱乐业', status: '存续', lng: 113.9510, lat: 22.5165 },
  { name: '深圳市焰点服饰有限公司', legal: '李巧思', capital: '10万元', date: '2026-01-27', industry: '批发和零售业', status: '存续', lng: 113.9455, lat: 22.5110 },
  { name: '深圳华侨城国际旅行社有限公司', legal: '陈扬', capital: '-', date: '2026-01-27', industry: '租赁和商务服务业', status: '存续', lng: 113.9400, lat: 22.5185 },
  { name: '深圳市港湾城服物业服务有限公司', legal: '冯慧', capital: '100万元', date: '2026-02-02', industry: '房地产业', status: '存续', lng: 113.9475, lat: 22.5225 },
  { name: '深圳万里云珠宝有限公司', legal: '姚振辉', capital: '10万元', date: '2026-02-24', industry: '批发和零售业', status: '存续', lng: 113.9420, lat: 22.5095 },
  { name: '深圳市沫米家居材料科技有限公司', legal: '杜海鹏', capital: '50万元', date: '2026-02-11', industry: '批发和零售业', status: '存续', lng: 113.9530, lat: 22.5195 },
  { name: '深圳市云图智能装备有限公司', legal: '王磊', capital: '300万元', date: '2026-02-15', industry: '制造业', status: '存续', lng: 113.9385, lat: 22.5150 },
  { name: '深圳前海云智数据有限公司', legal: '周敏', capital: '500万元', date: '2026-03-03', industry: '信息传输、软件', status: '存续', lng: 113.9500, lat: 22.5275 },
  { name: '深圳市鹏芯光电科技有限公司', legal: '刘洋', capital: '800万元', date: '2026-03-08', industry: '制造业', status: '存续', lng: 113.9545, lat: 22.5120 }
])
const page = ref(1)
const pageSize = 10
const pagedCompanies = computed(() => companies.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const selected = ref<Company[]>([])
const onSel = (rows: Company[]) => (selected.value = rows)
const addSelectedToCall = () => {
  const n = callStore.addEnterprises(selected.value, '地图招商')
  ElMessage.success(`已加入待联系 ${n} 家企业${n < selected.value.length ? '（部分已存在，自动去重）' : ''}`)
}

/* ------- Leaflet 地图 ------- */
const mapContainerRef = ref<HTMLElement>()
const mapError = ref('')
let map: L.Map | null = null
let circle: L.Circle | null = null
let markerLayer: L.LayerGroup | null = null

const currentCenter = (): L.LatLngExpression => {
  const c = CITIES.find((x) => x.name === city.value) || CITIES[0]
  return [c.lat, c.lng]
}

const numberedIcon = (n: number) =>
  L.divIcon({
    className: 'mi-pin',
    html: `<div class="mi-pin-dot">${n}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  })

const drawOverlays = (center: L.LatLngExpression) => {
  if (!map) return
  if (circle) { circle.remove(); circle = null }
  if (markerLayer) { markerLayer.remove(); markerLayer = null }
  // 半径圈
  circle = L.circle(center, {
    radius: radiusKm.value * 1000,
    color: '#1863c7',
    weight: 2,
    opacity: 0.9,
    fillColor: '#3f8ae0',
    fillOpacity: 0.14
  }).addTo(map)
  // 编号企业标记
  markerLayer = L.layerGroup().addTo(map)
  companies.value.slice(0, 10).forEach((co, i) => {
    const m = L.marker([co.lat, co.lng], { icon: numberedIcon(i + 1) })
    m.bindPopup(
      `<div style="min-width:190px">
         <div style="font-weight:bold;font-size:13px;margin-bottom:4px">${co.name}</div>
         <div style="color:#666;font-size:12px;line-height:1.7">
           法定代表人：${co.legal}<br/>注册资本：${co.capital}<br/>成立：${co.date}<br/>行业：${co.industry}
         </div>
       </div>`
    )
    markerLayer!.addLayer(m)
  })
}

const initMap = () => {
  if (!mapContainerRef.value) return
  map = L.map(mapContainerRef.value, {
    center: currentCenter(),
    zoom: 13,
    zoomControl: false,
    attributionControl: true
  })
  // 高德栅格瓦片（路网+标注，公开地址，无需 key）
  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    attribution: '© 高德地图'
  }).addTo(map)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map)
  drawOverlays(currentCenter())
  // 圈选模式：点击地图设定圈选中心
  map.on('click', (e: L.LeafletMouseEvent) => {
    if (mode.value !== 'circle') return
    drawOverlays(e.latlng)
    totalResults.value = 680000 + Math.floor(Math.abs(Math.sin(e.latlng.lat * 100)) * 80000)
    ElMessage.success('已在所选位置圈选，正在检索该范围内企业')
  })
}

const setMode = (m: 'circle' | 'drag') => {
  mode.value = m
  ElMessage.info(m === 'circle' ? '圈选模式：在地图上点选圈选中心' : '拖动模式：拖动地图浏览')
}
const onRadiusChange = () => {
  if (!radiusKm.value || radiusKm.value <= 0) radiusKm.value = 5
  drawOverlays(currentCenter())
}
const onCityChange = () => {
  const c = CITIES.find((x) => x.name === city.value) || CITIES[0]
  address.value = c.addr
  if (map) {
    map.setView([c.lat, c.lng], 13)
    drawOverlays([c.lat, c.lng])
  }
}
const focusCompany = (co: Company) => {
  if (map) map.setView([co.lat, co.lng], 15)
  ElMessage.info(`定位企业：${co.name}`)
}

onMounted(() => {
  try {
    initMap()
  } catch (e: any) {
    mapError.value = '地图加载失败：' + (e?.message || '请检查网络')
  }
})
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-invest {
  display: flex;
  gap: 12px;
  height: calc(100vh - 110px);
  padding: 12px 16px;
  background: #f4f6fb;
}
/* 左：地图 */
.mi-map-wrap {
  position: relative;
  flex: 0 0 56%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e6ebf2;
  background: #eef2f7;
}
.mi-map { width: 100%; height: 100%; z-index: 1; }
.mi-map-err { position: absolute; inset: 0; display: grid; place-items: center; background: #fff; z-index: 5; }
.mi-tools {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 400;
  display: flex;
  gap: 10px;
}
.mi-tool {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 8px;
  background: #fff;
  color: #3c4a63;
  font-size: 13px;
  border: 1px solid #e3e8f0;
  box-shadow: 0 3px 10px rgba(12, 38, 80, 0.12);
  cursor: pointer;
  transition: 0.16s;
}
.mi-tool .ic { font-size: 15px; }
.mi-tool:hover { color: #1863c7; }
.mi-tool.on { background: linear-gradient(135deg, #1c6bd0, #0c4693); color: #fff; border-color: transparent; }
.mi-city { position: absolute; top: 14px; right: 14px; z-index: 400; }
/* 右：侧栏 */
.mi-side {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 10px;
  padding: 14px 16px;
  overflow: hidden;
}
.mi-area {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  color: #1f2d3d;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f5;
}
.mi-area .lb { color: #8a94a6; }
.mi-area .addr { color: #1863c7; max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi-area .near { color: #6b7688; }
.mi-filters { padding: 12px 0; border-bottom: 1px solid #f0f2f5; }
.mi-filters .fr { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.mi-filters .fr:last-child { margin-bottom: 0; }
.mi-filters .frk { flex: 0 0 60px; font-size: 12.5px; color: #6b7688; }
.mi-filters .fsel { flex: 1; min-width: 0; }
.mi-resbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 0;
}
.mi-resbar .cnt { font-size: 13px; color: #3c4a63; }
.mi-resbar .cnt b { color: #e0483c; font-size: 15px; margin: 0 2px; }
.mi-resbar .ops { display: flex; gap: 8px; }
.co-link { color: #1863c7; cursor: pointer; }
.co-link:hover { text-decoration: underline; }
.mi-pager { display: flex; justify-content: flex-end; padding-top: 10px; }
</style>

<!-- 编号标记样式（divIcon 注入，非 scoped 才能命中） -->
<style>
.mi-pin { background: transparent; border: none; }
.mi-pin-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2f86e0, #1863c7);
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mi-map .leaflet-popup-content { margin: 10px 12px; }
</style>
