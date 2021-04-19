<template>
  <el-dialog
    v-dialogDrag
    :title="title"
    :visible.sync="visible"
    :destroy-on-close="true"
    :show-close="false"
    :before-close="handleCancel"
  >
    <el-row>
      <div class="name">模板下载：</div>
      <div class="inputContainer">
        <el-button type="primary" @click="download()">下载</el-button>
      </div>
    </el-row>
    <el-row>
      <el-upload
        action=""
        :http-request="fileUpload"
        :file-list="fileList"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
      >
        导入文件：
        <el-button v-if="fileList.length == 0"> 请选择文件 </el-button>
      </el-upload>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel()">取 消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm()"
      >导 入</el-button>
    </div>
  </el-dialog>
</template>
<script>
import './directives'
export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        visible: {
            type: Boolean,
            default: false
        },
        downloadUrl: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            formData: new window.FormData(),
            fileList: []
        }
    },
    methods: {
        handleCancel() {
            this.$emit('handleModalCancel')
        },
        download() {
            window.location.href = this.downloadUrl
        },
        fileUpload(item) {
            // 赋值上传文件列表用于显示
            this.fileList.push(item.file)
            // 赋值导入需要的文件数据
            this.formData.append('file', item.file)
        },
        handleRemove() {
            // 移除上传文件列表
            this.fileList.pop()
            // 移除导入需要的文件数据
            this.formData.delete('file')
        },
        beforeRemove(file) {
            return this.$confirm(`确定移除${file.name}？`)
        },
        handleConfirm() {
            this.$emit('importData', this.formData)
            this.$emit('handleModalCancel')
        }
    }
}
</script>
<style scoped>
.el-row{
  margin-top: 24px;
}
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
