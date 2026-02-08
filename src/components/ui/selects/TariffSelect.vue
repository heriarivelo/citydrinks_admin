<script setup lang="ts">
import IconArrow from '@/components/icons/IconArrow.vue'
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import IconSubmit from '@/components/icons/IconSubmit.vue'
import IconEdit16 from '@/components/icons/IconEdit16.vue'
import IconDelete16 from '@/components/icons/IconDelete16.vue'
import IconCancel16 from '@/components/icons/IconCancel16.vue'
import { TTariff } from '@/store/types/tariffTypes.ts'
import { useTariffStore } from '@/store/tariff.ts'
import { Button } from '@/components/ui/button'
import { Check, Minus, Pencil, Trash2, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    selected?: TTariff
    disabled?: boolean
    showDeleteButton?: boolean
    hideEditDelete?: boolean
  }>(),
  {
    selected: null,
    disabled: false,
    showDeleteButton: false,
    hideEditDelete: false,
  }
)

const emit = defineEmits(['select'])

const open = ref(false)
const tariffForm = ref({} as TTariff)
const tariffStore = useTariffStore()
const { tariffs } = storeToRefs(tariffStore)
const editInput = ref(0)
const updatedName = ref('')

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
    updatedName.value = ''
    editInput.value = 0
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
  await tariffStore.actionCreateTariff(tariffForm.value)
  tariffForm.value = {} as TTariff
  await tariffStore.actionGetTariffs()
}

const deleteTariff = async (id: number) => {
  await tariffStore.actionDeleteTariff(id)
  await tariffStore.actionGetTariffs()
}

const removeTariff = async () => {
  emit('select', {})
}

const editTariff = async (data: TTariff) => {
  updatedName.value = data.name
  editInput.value = data.id
}

const updateTariff = async () => {
  await tariffStore.actionUpdateTariff({
    id: editInput.value,
    name: updatedName.value,
  })
  updatedName.value = ''
  editInput.value = 0
  await tariffStore.actionGetTariffs()
}

const selectedData = computed(() =>
  tariffs.value.data?.filter((item) => item?.id == props.selected?.id)
)

onMounted(async () => {
  await tariffStore.actionGetTariffs()
})
</script>

<template>
  <div class="select-content">
    <div
      class="select flex cursor-pointer items-center justify-between whitespace-nowrap"
      :class="{ open }"
      @click="!disabled ? openSelect() : ''"
    >
      <p
        class="placeholder subtitle"
        :class="{ show: selectedData?.[0]?.name }"
      >
        {{ `${$t('Tariff')}` }}
      </p>
      <div class="flex items-center gap-4">
        <p
          class="body-text selected-name cursor-pointer"
          :class="{ selected: selectedData?.[0]?.name }"
        >
          {{ selectedData?.[0]?.name ?? `${$t('Tariff')}` }}
        </p>
        <Button
          v-if="props.showDeleteButton && selectedData?.[0]?.name"
          variant="destructive"
          type="button"
          size="iconSm"
          class="size-5 shrink-0 rounded-full hover:opacity-80"
          @click="removeTariff"
        >
          <Minus />
        </Button>
      </div>
      <IconArrow class="arrow" />
    </div>
    <div class="data-for-select flex flex-col gap-2" v-if="open">
      <form
        class="create-form flex items-center justify-between gap-2.5"
        @submit.prevent="submit"
      >
        <input
          type="text"
          :placeholder="$t('Write_a_tariff')"
          v-model="tariffForm.name"
        />
        <button class="body-text">{{ $t('Add') }}</button>
      </form>
      <div
        class="select-item flex cursor-pointer items-center justify-between gap-2"
        :class="{ selected: datum.id === selectedData?.[0]?.id }"
        v-for="datum in tariffs.data"
        @click="select(datum)"
      >
        <span class="body-text" v-if="editInput !== datum.id">{{
          datum?.name
        }}</span>
        <input type="text" class="body-text" v-model="updatedName" v-else />
        <div
          class="actions flex"
          v-if="!hideEditDelete && editInput !== datum.id"
        >
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            class="text-[var(--neutral-400)]"
            @click.stop="editTariff(datum)"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            class="text-[var(--neutral-400)]"
            @click.stop="deleteTariff(datum.id)"
          >
            <Trash2 />
          </Button>
        </div>
        <div class="actions flex" v-else-if="!hideEditDelete">
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            @click.stop="updateTariff"
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

    .selected-name {
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
    width: 295px;

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
