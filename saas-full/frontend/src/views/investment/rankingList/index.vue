<!--
  智慧招商 · 榜单招商
  卡片网格目录：政府认定榜单 / 平台特色榜单 / 商业综合榜单（财富·福布斯·其他）
  参考截图 1:1 还原；浅色主题，融入后台内容区。
-->
<template>
  <div class="ranking-list">
    <!-- 政府认定榜单 / 平台特色榜单：单层分组 -->
    <div v-for="sec in flatSections" :key="sec.title" class="rk-sec">
      <div class="rk-sec-hd"><span class="bar"></span>{{ sec.title }}</div>
      <div class="rk-grid">
        <div
          v-for="it in sec.items"
          :key="it.name"
          class="rk-card"
          @click="openRank(it)"
        >
          <div class="rk-icon" :style="{ background: it.bg }">{{ it.icon }}</div>
          <div class="rk-body">
            <div class="rk-name" :title="it.name">{{ it.name }}</div>
            <div class="rk-desc" :title="it.desc">{{ it.desc }}</div>
          </div>
          <span
            class="rk-star"
            :class="{ on: faved.has(it.name) }"
            :title="faved.has(it.name) ? '取消收藏' : '收藏'"
            @click.stop="toggleFav(it.name)"
          >{{ faved.has(it.name) ? '★' : '☆' }}</span>
        </div>
      </div>
    </div>

    <!-- 商业综合榜单：二级分组（财富 / 福布斯 / 其他，各带查看更多） -->
    <div class="rk-sec">
      <div class="rk-sec-hd"><span class="bar"></span>商业综合榜单</div>
      <div v-for="grp in bizGroups" :key="grp.sub" class="rk-subgrp">
        <div class="rk-sub-hd">
          <span class="sub-t">{{ grp.sub }}</span>
          <span class="more" @click="openMore(grp.sub)">查看更多 ›</span>
        </div>
        <div class="rk-grid">
          <div
            v-for="it in grp.items"
            :key="it.name"
            class="rk-card"
            @click="openRank(it)"
          >
            <div class="rk-icon" :style="{ background: it.bg }">{{ it.icon }}</div>
            <div class="rk-body">
              <div class="rk-name" :title="it.name">{{ it.name }}</div>
              <div class="rk-desc" :title="it.desc">{{ it.desc }}</div>
            </div>
            <span
              class="rk-star"
              :class="{ on: faved.has(it.name) }"
              :title="faved.has(it.name) ? '取消收藏' : '收藏'"
              @click.stop="toggleFav(it.name)"
            >{{ faved.has(it.name) ? '★' : '☆' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'InvestmentRankingList' })

type Item = { name: string; desc: string; icon: string; bg: string }
const B1 = 'linear-gradient(135deg,#eaf1ff,#dbe8ff)'
const B2 = 'linear-gradient(135deg,#e8f7f0,#d7f0e4)'
const B3 = 'linear-gradient(135deg,#fff3e6,#ffe6cc)'
const B4 = 'linear-gradient(135deg,#f0ecff,#e3dcff)'

const govItems: Item[] = [
  { name: '专精特新', desc: '全国专精特新中小企业', icon: '💎', bg: B1 },
  { name: '专精特新小巨人', desc: '专精特新企业中的排头兵', icon: '🦾', bg: B1 },
  { name: '科技小巨人', desc: '全国科技小巨人企业', icon: '🚀', bg: B1 },
  { name: '科技型中小企业', desc: '全国科技型中小企业', icon: '🔬', bg: B1 },
  { name: '雏鹰企业', desc: '成立十年内的创新型企业', icon: '🦅', bg: B1 },
  { name: '高新企业', desc: '在国家重点领域拥有核心知识产权', icon: '🏅', bg: B1 },
  { name: '制造业单项冠军', desc: '在行业内有较强竞争优势', icon: '🏆', bg: B1 },
  { name: '制造业单项冠军培育企业', desc: '在行业内有较强竞争优势', icon: '🥇', bg: B1 },
  { name: '技术创新示范企业', desc: '在行业内有较强竞争优势', icon: '⚙️', bg: B1 },
  { name: '独角兽企业', desc: '成立时间10年估值超过10亿的企业', icon: '🦄', bg: B1 },
  { name: '隐形冠军', desc: '未被外界关注的冠军企业', icon: '🛡️', bg: B1 },
  { name: '瞪羚企业', desc: '进入高成长期的中小企业', icon: '🦌', bg: B1 }
]
const featItems: Item[] = [
  { name: '融资能力榜', desc: '融资企业和融资能力指标排行', icon: '💰', bg: B2 },
  { name: '成长潜力榜', desc: '企业与行业的发展前景排行', icon: '📈', bg: B2 },
  { name: '科技引领榜', desc: '企业科技创新能力排行', icon: '🔭', bg: B2 },
  { name: '绿色榜', desc: '企业绿色能力排行', icon: '🌿', bg: B2 }
]

const flatSections = reactive([
  { title: '政府认定榜单', items: govItems },
  { title: '平台特色榜单', items: featItems }
])

const bizGroups = reactive([
  {
    sub: '财富榜单',
    items: [
      { name: '2025年度《财富》最受赞赏的中国公司榜单', desc: '财富', icon: '📊', bg: B3 },
      { name: '2025年度《财富》中国科技排行榜', desc: '财富', icon: '📊', bg: B3 },
      { name: '2025年度《财富》中国ESG影响力榜', desc: '财富', icon: '📊', bg: B3 },
      { name: '2024年度《财富》最受赞赏的中国公司榜单', desc: '财富', icon: '📊', bg: B3 },
      { name: '2024年度《财富》中国科技排行榜', desc: '财富', icon: '📊', bg: B3 }
    ] as Item[]
  },
  {
    sub: '福布斯榜单',
    items: [
      { name: '2025年度福布斯全球最佳雇主榜中的部分中国内地公司', desc: '福布斯', icon: '🏢', bg: B4 },
      { name: '2025年度福布斯中国人工智能科技企业排行榜', desc: '福布斯', icon: '🏢', bg: B4 },
      { name: '2024年度福布斯中国人工智能科技企业排行榜', desc: '福布斯', icon: '🏢', bg: B4 },
      { name: '2022年度福布斯中国客户服务企业Top100评选入围名单', desc: '福布斯', icon: '🏢', bg: B4 }
    ] as Item[]
  },
  {
    sub: '其他榜单',
    items: [
      { name: '2025年度胡润中国瞪羚企业', desc: '其他', icon: '📋', bg: B1 },
      { name: '2025年度胡润中国人工智能企业排行榜', desc: '其他', icon: '📋', bg: B1 },
      { name: '2025年中国互联网成长型企业排行榜', desc: '其他', icon: '📋', bg: B1 },
      { name: '2025年中国高科技高成长企业榜', desc: '其他', icon: '📋', bg: B1 },
      { name: '2025年中国石油和化工企业销售收入百强榜', desc: '其他', icon: '📋', bg: B1 }
    ] as Item[]
  }
])

const faved = reactive(new Set<string>())
const toggleFav = (name: string) => {
  if (faved.has(name)) { faved.delete(name); ElMessage.info('已取消收藏') }
  else { faved.add(name); ElMessage.success('已加入收藏') }
}
const router = useRouter()
// 点击榜单卡片 / 查看更多 → 跳转企业列表页
const openRank = (it: Item) => router.push({ path: '/park-enterprise-list', query: { name: it.name } })
const openMore = (sub: string) => router.push({ path: '/park-enterprise-list', query: { name: sub } })
</script>

<style scoped>
.ranking-list {
  padding: 16px 20px;
  background: #f4f6fb;
  min-height: 100%;
}
.rk-sec { margin-bottom: 22px; }
.rk-sec-hd {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 12px;
}
.rk-sec-hd .bar {
  width: 4px;
  height: 15px;
  background: #2d5af0;
  border-radius: 2px;
  margin-right: 8px;
}
.rk-subgrp { margin-bottom: 14px; }
.rk-sub-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 10px;
}
.rk-sub-hd .sub-t { font-size: 13px; color: #2d5af0; font-weight: 600; }
.rk-sub-hd .more { font-size: 12px; color: #8a94a6; cursor: pointer; }
.rk-sub-hd .more:hover { color: #2d5af0; }
.rk-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.rk-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  padding: 14px 15px;
  cursor: pointer;
  transition: 0.18s;
  overflow: hidden;
}
.rk-card:hover {
  border-color: #b9cdf5;
  box-shadow: 0 6px 18px rgba(45, 90, 240, 0.1);
  transform: translateY(-2px);
}
.rk-icon {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 19px;
}
.rk-body { flex: 1; min-width: 0; }
.rk-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #1f2d3d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rk-desc {
  font-size: 11.5px;
  color: #9aa4b2;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rk-star {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 15px;
  color: #c6cdd8;
  transition: 0.15s;
}
.rk-star:hover { color: #f0b24f; transform: scale(1.15); }
.rk-star.on { color: #f0b24f; }
@media (max-width: 1440px) {
  .rk-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 1100px) {
  .rk-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
