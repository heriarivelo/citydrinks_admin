import { TableColumn } from '@/components/table/UITable.vue'
import { ref, watch } from 'vue'

export function useColumns(defaultColumns: TableColumn[], storageKey: string) {
  const savedColumns = localStorage.getItem(storageKey)
  const columns = ref(savedColumns ? JSON.parse(savedColumns) : defaultColumns)

  const toggleColumnVisibility = (column: TableColumn) => {
    const updatedColumns = columns.value.map((col) =>
      col.key === column.key ? { ...col, visible: !col.visible } : col
    )
    columns.value = updatedColumns
    localStorage.setItem(storageKey, JSON.stringify(updatedColumns))
  }

  const isColumnVisible = (key: string) => {
    return columns.value.find((col) => col.key === key)?.visible
  }

  watch(columns, (newColumns) => {
    localStorage.setItem(storageKey, JSON.stringify(newColumns))
  })

  return {
    columns,
    toggleColumnVisibility,
    isColumnVisible,
  }
}
