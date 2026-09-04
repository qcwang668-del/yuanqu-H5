import type { App } from 'vue'
// 需要全局引入一些组件，如ElScrollbar，不然一些下拉项样式有问题
import { ElLoading, ElScrollbar, ElButton, ElTable } from 'element-plus'

const plugins = [ElLoading]

const components = [ElScrollbar, ElButton]

/**
 * 全局启用表格「列宽拖拽调整」。
 *
 * ElementPlus 的 el-table 只有在开启 border 时，表头列之间才会出现可拖拽的分隔线；
 * 而列的 resizable 默认已经是 true。因此这里把 ElTable 的 border 默认值改为 true，
 * 即可让全系统所有 <el-table> 都支持拖动表头分隔线调整列宽，无需逐页改动。
 *
 * 仍显式写了 :border="false" 的少数页面会保持原样（不受影响）。
 */
const enableTableColumnResize = () => {
  const props = (ElTable as any)?.props
  if (props && 'border' in props) {
    props.border = { type: Boolean, default: true }
  }
}

export const setupElementPlus = (app: App<Element>) => {
  enableTableColumnResize()

  plugins.forEach((plugin) => {
    app.use(plugin)
  })

  components.forEach((component) => {
    app.component(component.name!, component)
  })
}
