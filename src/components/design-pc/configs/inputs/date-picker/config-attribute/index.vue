<template>
  <div class="text-config">
    <a-form labelAlign="right" :label-col="{ span: 6 }" :colon="false" autocomplete="off">
      <a-form-item label="标签名称">
        <ValueInput :options="options" value-key="label" en-value-key="enLabel"></ValueInput>
      </a-form-item>
      <a-form-item label="标签显示">
        <LabelDisplay :options="options" value-key="labelAlign" width-key="width" label-show-key="labelShow"> </LabelDisplay>
      </a-form-item>
      <a-form-item label="提示信息">
        <ValueInput :options="options" value-key="placeholder" en-value-key="enPlaceHolder"></ValueInput>
      </a-form-item>
      <a-form-item label="禁选日期">
        <RadioButton :options="options" value-key="forbidRange" :radio-options="forbidOptions"></RadioButton>
      </a-form-item>
      <a-form-item label="尺寸">
        <RadioButton :options="options" value-key="size" :radio-options="sizeOptions"></RadioButton>
      </a-form-item>
      <a-form-item>
        <InputValidate :options="options" :hide-validator="true" :hide-reg="true"></InputValidate>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ValueInput from '@/components/common-attribute-config/value-input.vue'
import LabelDisplay from '@/components/common-attribute-config/label-display.vue'
import RadioButton from '@/components/common-attribute-config/radio-button.vue'
import InputValidate from '@/components/common-attribute-config/value-validate.vue'
import { useDataStore } from '@/stores'

const store = useDataStore()
const options = computed(() => store.currentCheckedComponent.options)

const forbidOptions = [
  {
    label: '无',
    value: ''
  },
  {
    label: '过去',
    value: 'before'
  },
  {
    label: '以后',
    value: 'after'
  }
]

const sizeOptions = [
  {
    label: '大',
    value: 'large'
  },
  {
    label: '中',
    value: 'default'
  },
  {
    label: '小',
    value: 'small'
  }
]
</script>

<style lang="less" scoped></style>
