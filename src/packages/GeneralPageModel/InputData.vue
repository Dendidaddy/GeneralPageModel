<template>
  <div>
    <div class="name">{{ name }}：</div>
    <div class="inputContainer">
      <el-input v-model="value" :disabled="type === 'disabled'" @input="input" />
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
        type: {
            type: String,
            default: undefined
        }
    },
    data() {
        return {
            value: this.data
        }
    },
    watch: {
        data(newVal, oldVal) {
            this.value = newVal
        }
    },
    methods: {
        input(value) {
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
