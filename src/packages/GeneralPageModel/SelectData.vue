<template>
  <div>
    <div class="name">{{ name }}：</div>
    <div class="inputContainer">
      <el-select v-model="value" :multiple="multi" :collapse-tags="multi" filterable clearable @change="select">
        <el-option
          v-for="item in option"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>
<script>
export default {
    props: {
        name: {
            type: String,
            default: ''
        },
        data: {
            type: undefined,
            default: undefined
        },
        option: {
            type: Array,
            default: () => []
        },
        multi: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            value: this.data
        }
    },
    watch: {
        data(newValue, oldValue) {
            this.value = newValue
        }
    },
    methods: {
        select(value) {
            this.$emit('inputChange', value)
        }
    }

}
</script>
<style scoped>
.name{
  display: inline-block;
  height: 32px;
  padding: 7px;
}
.inputContainer {
  display: inline-block;
  margin-right: 14px;
}
</style>
