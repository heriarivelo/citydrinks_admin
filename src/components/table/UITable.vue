<script setup lang="ts">
import { Button } from '../ui/button'
import { Expand, SlidersVertical } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
const { fullScreen, columns, toggleColumnVisibility } = defineProps<{
  fullScreen?: boolean
  columns?: TableColumn[]
  toggleColumnVisibility?: (column: TableColumn) => void
}>()

export type TableColumn = {
  key: string
  label: string
  visible: boolean
}

const emit = defineEmits<{
  (event: 'full-screen'): void
  (event: 'update:columns', columns: TableColumn[]): void
}>()
</script>

<template>
  <div class="table-content">
    <table class="data-table">
      <thead class="h3">
        <slot name="thead" />
        <Button
          variant="ghost"
          size="iconSm"
          class="absolute end-4 top-4 bg-background"
          v-if="fullScreen"
          @click="$emit('full-screen')"
        >
          <Expand color="var(--primary-700)" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              size="iconSm"
              class="absolute end-2 top-3.5"
              v-if="columns"
            >
              <SlidersVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{{ $t('Columns_Filter') }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-for="column in columns"
              :key="column.key"
              class="py-0"
            >
              <label
                class="flex w-full items-center space-x-2 rounded-sm p-2 py-1 hover:bg-accent"
                @click.stop
              >
                <Checkbox
                  :checked="column.visible"
                  @update:checked="toggleColumnVisibility(column)"
                />
                <span>{{ column.label }}</span>
              </label>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </thead>
      <tbody class="body-text">
        <slot name="t-row" />
      </tbody>
      <tfoot class="body-text" v-if="$slots.tfoot">
        <slot name="tfoot" />
      </tfoot>
    </table>
  </div>
</template>

<style lang="scss">
.auto-transfer {
  background: var(--status-1);
}
table.data-table {
  width: 100%;
  border-collapse: collapse;
  padding: 0 48.5px;
  min-width: 1074px;

  td {
    &:first-of-type {
      padding-left: 1rem;
    }

    &:last-of-type {
      padding-right: 1rem;
      text-align: center;
    }
  }

  thead {
    color: var(--neutral-400);

    tr {
      td {
        background: var(--neutral-200);
        padding: 1rem;
        color: var(--brand-black);

        &:first-of-type {
          border-top-left-radius: 8px;
        }

        &:last-of-type {
          border-top-right-radius: 8px;
        }

        &.sort {
          cursor: pointer;

          p {
            position: relative;
            width: fit-content;

            span {
              display: block;

              &:after {
                transform: translateY(2px);
                position: absolute;
                content: url('@/assets/images/svg/table-default.svg');
                display: block;
                top: 0;
                right: -18px;
              }
            }
          }
        }

        &.desc {
          p {
            span {
              &:after {
                transform: translateY(2px);
                content: url('@/assets/images/svg/table-desc.svg');
                right: -18px;
              }
            }
          }
        }

        &.asc {
          p {
            span {
              &:after {
                transform: translateY(2px);
                content: url('@/assets/images/svg/table-asc.svg');
                right: -18px;
              }
            }
          }
        }
      }
    }
  }

  tbody {
    tr {
      td {
        color: var(--gray-300);
        padding: 10px 0 10px 16px;
        border-bottom: 1px solid var(--gray-100);

        &:first-of-type {
          border-left: 1px solid var(--gray-100);
        }

        &:last-of-type {
          border-right: 1px solid var(--gray-100);
        }

        .status {
          position: relative;

          &:before {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
            position: absolute;
            left: -15px;
            top: 50%;
            background: var(--warning-500);
            transform: translateY(-50%);
          }

          &.active:before {
            background: var(--success-500);
          }
        }
      }
    }
  }

  tfoot {
    background-color: var(--neutral-200);
    height: 42px;
    font-weight: 600;
    font-size: 1.125rem;
    td {
      border: 1px solid var(--gray-100);
      color: var(--brand-black);
      padding-inline: 1rem;
    }
  }

  .waiting-status {
    color: var(--success-500);
  }

  .active-status {
    color: var(--gray-300);
  }

  .blocked-status {
    color: var(--warning-500);
  }
}

.table-content {
  position: relative;
}
</style>
