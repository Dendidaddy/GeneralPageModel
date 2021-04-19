<template>
  <div>
    <div class="name">{{ name }}：</div>
    <div class="inputContainer">
      <el-cascader v-model="value" :props="props" :options="option" :show-all-levels="false" collapse-tags @change="changeLabel" />
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
        },
        cascaderNextData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        const that = this
        return {
            value: that.data || [],
            shareScopeEnd: that.data || [],
            props: {
                multiple: that.multi,
                checkStrictly: true,
                lazy: true,
                lazyLoad(node, resolve) {
                    that.$emit('cascaderMethod', node.value)
                    setTimeout(() => {
                        resolve(that.cascaderNextData)
                    }, 1000)
                }
            }
        }
    },
    watch: {
        data(newValue, oldValue) {
            this.value = newValue.selectTrain
        }
    },
    methods: {
        changeLabel(val) {
            // 是否与上次的类型相同
            let changeFlag = false
            let changeItem = null
            if (this.shareScopeEnd.length === 0) {
                this.value = val
            } else {
                // 与原数组比对
                this.value.forEach((item) => {
                    if (item[0] !== this.shareScopeEnd[0][0]) { // 一级标签不同
                        changeFlag = true
                        changeItem = item
                    }
                })
            }
            if (changeFlag) {
                this.value = []
                this.value.push(changeItem)
            }
            this.shareScopeEnd = this.value
            this.$emit('inputChange', this.value)
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
