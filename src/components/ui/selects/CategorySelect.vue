<script setup lang="ts">
import IconArrow from '@/components/icons/IconArrow.vue'
import { Button } from '@/components/ui/button'
import { useCategoryStore } from '@/store/category.ts'
import { TCategory } from '@/store/types/categoryTypes.ts'
import { Check, Pencil, Trash2, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    selected?: TCategory
    disabled?: boolean
    error?: string
  }>(),
  {
    disabled: false,
  }
)

const emit = defineEmits(['select'])

const open = ref(false)
const categoryForm = ref({} as TCategory)
const categoryStore = useCategoryStore()
const { categories } = storeToRefs(categoryStore)
const editInput = ref(0)
const updatedName = ref('')
const formError = ref('')

const openSelect = () => {
  open.value = !open.value
  if (open.value) {
    setTimeout(() => {
      window.addEventListener('click', closeSelect)
    })
  } else {
    closeSelect()
  }
}

const closeSelect = (e?: MouseEvent) => {
  if (
    !e ||
    !e.target ||
    !(e.target as HTMLElement).closest('.data-for-select')
  ) {
    open.value = false
    window.removeEventListener('click', closeSelect)
    editInput.value = 0
    updatedName.value = ''
  }
}

const select = (datum: any) => {
  if (!editInput.value) {
    if (datum?.id) {
      emit('select', datum)
    } else {
      emit('select', {})
    }
    closeSelect()
  }
}

const submit = async () => {
  const data = await categoryStore.actionCreateCategory(categoryForm.value)
  categoryForm.value = {} as TCategory
  if (data.status == 201) {
    await categoryStore.actionGetCategories()
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        formError.value = data.response.data.errors[item][0]
      }
    })
  }
}

const deleteCategory = async (id: number) => {
  await categoryStore.actionDeleteCategory(id)
  await categoryStore.actionGetCategories()
}

const editCategory = async (data: TCategory) => {
  updatedName.value = data.name
  editInput.value = data.id
}

const updateCategory = async () => {
  await categoryStore.actionUpdateCategory({
    id: editInput.value,
    name: updatedName.value,
  })
  updatedName.value = ''
  editInput.value = 0
  await categoryStore.actionGetCategories()
}

const selectedData = computed(() =>
  categories.value.data?.filter((item) => item?.id == props.selected?.id)
)

onMounted(async () => {
  await categoryStore.actionGetCategories()
})
</script>

<template>
  <div class="select-content">
    <div
      class="select flex cursor-pointer items-center"
      :class="{ open }"
      @click="!disabled ? openSelect() : ''"
    >
      <p
        class="placeholder subtitle"
        :class="{ show: selectedData?.[0]?.name }"
      >
        {{ `${$t('Category')} *` }}
      </p>
      <p
        class="body-text selected-name cursor-pointer"
        :class="{ selected: selectedData?.[0]?.name }"
      >
        {{ selectedData?.[0]?.name ?? `${$t('Category')} *` }}
      </p>
      <IconArrow class="arrow" />
      <span class="error-text body-text" v-if="error || formError">{{
        error || formError
      }}</span>
    </div>
    <div class="data-for-select flex flex-col gap-2" v-if="open">
      <form
        class="create-form flex items-center justify-between gap-2.5"
        @submit.prevent="submit"
      >
        <input
          type="text"
          :placeholder="$t('Write_a_category')"
          v-model="categoryForm.name"
        />
        <button class="body-text">{{ $t('Add') }}</button>
      </form>
      <div
        class="select-item flex cursor-pointer items-center justify-between gap-2"
        :class="{ selected: datum.id === selectedData?.[0]?.id }"
        v-for="datum in categories.data"
        @click="select(datum)"
      >
        <span class="body-text" v-if="editInput !== datum.id">{{
          datum?.name
        }}</span>
        <input type="text" class="body-text" v-model="updatedName" v-else />
        <div class="actions flex" v-if="editInput !== datum.id">
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            class="text-[var(--neutral-400)]"
            @click.stop="editCategory(datum)"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            class="text-[var(--neutral-400)]"
            @click.stop="deleteCategory(datum.id)"
          >
            <Trash2 />
          </Button>
        </div>
        <div class="actions flex" v-else>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            @click.stop="updateCategory"
          >
            <Check class="text-[var(--success-400)]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            class="text-[var(--neutral-400)]"
            @click.stop="editInput = 0"
          >
            <X />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.select-content {
  position: relative;

  .select {
    padding: 8px 14px 8px 16px;
    border-radius: 4px;
    border: 1px solid var(--gray-200);

    &.error {
      border: 1px solid var(--warning-500);
    }

    .error-text {
      padding: 4px 10px;
      color: var(--white);
      background: var(--warning-400);
      border-radius: 4px;
      position: absolute;
      width: 100%;
      left: 0;
      bottom: calc(100% + 14px);
      z-index: 1;

      &:before {
        content: '';
        position: absolute;
        bottom: -17px;
        left: 8px;
        transform: translateY(-50%);
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 12px solid var(--warning-400);
      }
    }

    .selected-name {
      min-width: 156px;
      width: calc(100% - 20px);

      &:not(.selected) {
        color: var(--gray-200);
      }
    }

    .placeholder {
      display: none;
      position: absolute;
      left: 16px;
      top: -7px;
      background: var(--white);
      color: var(--gray-200);

      &.show {
        display: inline-block;
      }
    }

    .arrow {
      fill: none;
      transition: 0.3s all;
    }

    &.open {
      .arrow {
        transform: rotateX(-180deg);
      }
    }
  }

  .data-for-select {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 2px);
    z-index: 100;
    background: var(--white);
    border-radius: 4px;
    padding: 8px 19px;
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow: 0 0 10px 0 #d5d8e6;

    .select-item {
      span {
        display: block;
        background: none;
      }

      input {
        background: none;
        padding: 0;
        margin: 0;
      }
    }
  }

  .create-form {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--gray-100);

    input {
      padding: 2px 0;
      border: none;
      &:focus ~ button {
        color: var(--primary-500);
      }
    }

    button {
      background: none;
      color: var(--primary-200);
      border: none;
      cursor: pointer;
      &:hover {
        color: var(--primary-300) !important;
      }
    }
  }
}
</style>
