<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import UploadIcon from '@/components/icons/ui/UploadIcon.vue'
import IconDelete from '@/components/icons/IconDelete.vue'

const emit = defineEmits(['upload'])

const props = defineProps<{
  error?: string
  justPick: boolean
  dataImage?: string
}>()

const image = ref('')
const imageName = ref('')
const fileError = ref('')
const fileSuccess = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const preventDefaults = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const highlight = (e: DragEvent) => {
  preventDefaults(e)
  if (e.target instanceof HTMLElement) {
    e.target.classList.add('highlight')
  }
}

const unHighlight = (e: DragEvent) => {
  preventDefaults(e)
  if (e.target instanceof HTMLElement) {
    e.target.classList.remove('highlight')
  }
}

const handleDrop = (e: DragEvent) => {
  unHighlight(e)
  const files = e.dataTransfer?.files

  if (files && files.length > 0) {
    const file = files[0]

    imageName.value = file.name
    fileError.value = ''
    image.value = ''
    fileSuccess.value = false

    // Check if the dropped file is an image
    if (file.type.match('image.*')) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        if (event.target?.result) {
          image.value = event.target.result as string
          emit('upload', file)
        }
      }
      fileSuccess.value = true
      // Read the dropped file as a data URL
      reader.readAsDataURL(file)
    } else {
      image.value = 'error'
      fileError.value =
        'This document is not supported, please delete and upload another file.'
    }
  }
}

const handleFileUpload = (event: Event) => {
  if (event.target instanceof HTMLInputElement) {
    const files = event.target.files
    handleFile(files)
  }
}

const handleFile = (files: FileList | null) => {
  if (files && files.length > 0) {
    const file = files[0]

    imageName.value = file.name
    fileError.value = ''
    image.value = ''
    fileSuccess.value = false

    // Check if the selected file is an image
    if (file && file.type.match('image.*')) {
      const reader = new FileReader()

      reader.onload = async (event) => {
        if (event.target?.result) {
          image.value = event.target.result as string
          emit('upload', file)
        }
      }
      fileSuccess.value = true
      // Read the selected file as a data URL
      reader.readAsDataURL(file)
    } else {
      image.value = 'error'
      fileError.value =
        'This document is not supported, please delete and upload another file.'
    }
  }
}

const openFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const removeImage = () => {
  image.value = ''
  fileError.value = ''
  imageName.value = ''
  fileSuccess.value = false
  emit('upload', '')
}

watchEffect(() => {
  if (props.dataImage && !image.value) {
    imageName.value = props.dataImage.substring(
      props.dataImage.lastIndexOf('/') + 1
    )
  }
})
</script>

<template>
  <div class="image-input flex flex-col gap-5" :class="{ error }">
    <div class="drop-area" :class="{ dashed: !image && !dataImage }">
      <div
        class="drop-content"
        @dragenter="highlight"
        @dragover="highlight"
        @dragleave="unHighlight"
        @drop="handleDrop"
      >
        <template v-if="(!image || fileError) && !dataImage">
          <UploadIcon />
          <p class="drag">
            Drag & drop files or
            <span class="browse" @click="openFileInput">Browse</span>
          </p>
          <p class="format">Supported formats: JPEG, PNG</p>
        </template>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          style="display: none"
          @change="handleFileUpload"
        />

        <img
          @click="!justPick ? openFileInput() : ''"
          v-if="(image && !fileError) || dataImage"
          :src="dataImage && !image ? dataImage : image"
          alt="Uploaded Image"
        />
      </div>
    </div>
    <label
      for=""
      v-if="!justPick"
      :class="{
        error: fileError,
        success: fileSuccess,
        visible: image || dataImage,
      }"
    >
      <input type="text" v-model="imageName" class="download-input" disabled />
      <IconDelete @click="removeImage" />
      <span class="upload-bar"></span>
    </label>
    <span class="error-text body-text" v-if="error || fileError"
      >{{ fileError }} {{ error }}</span
    >
  </div>
</template>

<style scoped lang="scss">
.image-input {
  width: 327px;
  height: 320px;
  display: flex;
  background: var(--neutral-100);
  border-radius: 4px;
  border: 1px dotted var(--gray-200);
  position: relative;

  &.error {
    border-color: var(--warning-500);
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

  .drop-area {
    text-align: center;
    background-attachment: var(--brand-white);
    max-width: 338px;
    width: 100%;
    height: 100%;
    border-radius: 4px;

    &.dashed {
      border: 1px dashed var(--grey-60);
    }

    .drop-content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: flex-col;
      @media screen and (max-width: 920px) {
        padding: 31px 0;
      }

      svg {
        margin-bottom: 20px;
        @media screen and (max-width: 920px) {
          width: 39px;
          height: 36px;
          margin-bottom: 12px;
        }
      }

      .drag {
        font-family: Roboto, serif;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
        letter-spacing: 0;
        text-align: center;
        color: var(--brand-black);
        @media screen and (max-width: 920px) {
          font-size: 12px;
          line-height: 14px;
          margin-bottom: 4px;
        }

        .browse {
          font-weight: 700;
          color: var(--brand-black);
          text-decoration: underline;
          cursor: pointer;
        }
      }

      .format {
        font-family: Roboto, serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: 0;
        text-align: center;
        color: var(--grey-60);
        @media screen and (max-width: 920px) {
          font-size: 8px;
          line-height: 10px;
        }
      }

      img {
        object-fit: contain;
        width: 100%;
        height: 100%;
        max-width: 383px;
        max-height: 313px;
      }

      .highlight {
        border-color: #000;
      }
    }
  }

  label {
    width: 0;
    visibility: hidden;
    position: absolute;

    &.visible {
      width: 100%;
      position: relative;
      visibility: visible;

      .download-input {
        transition: 0.5s ease-in-out all;
      }
    }

    &.error {
      .upload-bar {
        background: var(--warning-400);
        width: 100%;
      }

      .download-input {
        border: 1px solid var(--warning-400);
      }
    }

    &.success {
      .upload-bar {
        background-color: var(--success);
        width: 100%;
      }

      .download-input {
        border: 1px solid var(--success);
      }
    }

    .download-input {
      width: 100%;
      padding: 8px 8px 10px;

      border: 1px solid var(--grey-60);
      border-radius: 4px;
      font-family: Roboto, serif;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0;
    }

    svg {
      position: absolute;
      right: 10px;
      top: 10px;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .upload-bar {
      position: absolute;
      bottom: 0;
      height: 2px;
      border-radius: 10px;
      left: 0;
      width: 0;
      transition: 0.5s ease-in-out all;
      background-color: var(--brand-blue);
    }
  }
}
</style>
