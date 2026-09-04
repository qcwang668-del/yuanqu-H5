import request from '@/config/axios'

// 力企 - 我的导入导出记录（顶层菜单：我的导入导出）
export interface ImportExportVO {
  id: number
  fileName: string
  type: number // 0=导入 1=导出
  module: string
  status: number // 0=处理中 1=成功 2=失败
  fileUrl: string
  errMsg: string
  createTime: Date
}

// 分页查询
export const getImportExportPage = (params: any) => {
  return request.get({ url: '/liqi/import-export/page', params })
}

// 删除
export const deleteImportExport = (id: number) => {
  return request.delete({ url: '/liqi/import-export/delete?id=' + id })
}

// 导出
export const exportImportExport = (params: any) => {
  return request.download({ url: '/liqi/import-export/export-excel', params })
}
