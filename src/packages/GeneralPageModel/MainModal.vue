<template>
  <el-dialog
    v-dialogDrag
    style="padding-bottom: 5vh"
    :title="title"
    :visible.sync="visible"
    :destroy-on-close="true"
    :show-close="false"
    :before-close="handleCancel"
  >
    <el-row v-for="j in modalNames.length" :key="j" class="rowMarginBot">
      <el-divider v-if="j > 1" />
      <div v-if="modalNames[j-1].type === 'normal'">
        <div v-if="modalNames[j-1].title !== undefined" class="detailTitle">{{ modalNames[j-1].title }}</div>
        <div v-for="i in modalNames[j-1].name.length" :key="j * 10 + i" class="combine">
          <input-data v-if="modalNames[j-1].name[i-1].type === 'input' || modalNames[j-1].name[i-1].type === 'int'" :name="modalNames[j-1].name[i-1].name" :data="type==='edit' ? rowData[editPara[j-1][i-1]] : ''" @inputChange="e => inputChange(e, j-1, i-1)" />
          <input-data v-if="modalNames[j-1].name[i-1].type === 'disabled'" :type="modalNames[j-1].name[i-1].type" :name="modalNames[j-1].name[i-1].name" :data="type==='edit' ? rowData[editPara[j-1][i-1]] : ''" @inputChange="e => inputChange(e, j-1, i-1)" />
          <select-data v-if="modalNames[j-1].name[i-1].type === 'select'" :name="modalNames[j-1].name[i-1].name" :data="type==='edit' ? rowData[editPara[j-1][i-1]] : ''" :option="modalNames[j-1].name[i-1].option" @inputChange="e => inputChange(e, j-1, i-1)" />
          <select-data v-if="modalNames[j-1].name[i-1].type === 'multi'" :multi="true" :name="modalNames[j-1].name[i-1].name" :data="type==='edit' ? rowData[editPara[j-1][i-1]] : ''" :option="modalNames[j-1].name[i-1].option" @inputChange="e => inputChange(e, j-1, i-1)" />
          <cascader-data v-if="modalNames[j-1].name[i-1].type === 'cascader'" :cascader-next-data="cascaderNextData" :multi="modalNames[j-1].name[i-1].multi" :name="modalNames[j-1].name[i-1].name" :data="type==='edit' ? rowData[editPara[j-1][i-1]] : ''" :option="modalNames[j-1].name[i-1].option" @cascaderMethod="cascaderMethod" @inputChange="e => inputChange(e, j-1, i-1)" />
        </div>
      </div>
      <div v-if="modalNames[j-1].type === 'table'">
        <el-row class="modalRow">
          <el-form ref="modalForm" :model="modalNames[j-1].searchForm" :inline="true">
            <el-form-item v-for="i in modalNames[j-1].searchPara.length" :key="i" :label="modalNames[j-1].searchPara[i-1].name" :prop="modalNames[j-1].searchPara[i-1].para">
              <el-input v-if="modalNames[j-1].searchPara[i-1].type === 'input'" v-model="modalNames[j-1].searchForm[modalNames[j-1].searchPara[i-1].para]" @input="e => searchChange(e, modalNames[j-1].searchPara[i-1].para)" />
              <el-select v-if="modalNames[j-1].searchPara[i-1].type === 'select'" v-model="modalNames[j-1].searchForm[modalNames[j-1].searchPara[i-1].para]" clearable filterable @change="e => searchChange(e, modalNames[j-1].searchPara[i-1].para, modalNames[j-1].searchPara[i-1].method)">
                <el-option
                  v-for="item in modalNames[j-1].searchPara[i-1].option"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select v-if="modalNames[j-1].searchPara[i-1].type === 'multi'" v-model="modalNames[j-1].searchForm[modalNames[j-1].searchPara[i-1].para]" multiple collapse-tags @change="e => searchChange(e, modalNames[j-1].searchPara[i-1].para)">
                <el-checkbox v-model="modalNames[j-1].searchPara[i-1].check" class="selectCheck" @change="e => selectAll(e, modalNames[j-1].searchPara[i-1])">全选</el-checkbox>
                <el-option
                  v-for="item in modalNames[j-1].searchPara[i-1].option"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-date-picker
                v-if="modalNames[j-1].searchPara[i-1].type === 'date'"
                v-model="modalNames[j-1].searchForm[modalNames[j-1].searchPara[i-1].para]"
                type="date"
                placeholde="日期"
                value-format="yyyy-MM-dd"
                @change="e => searchChange(e, modalNames[j-1].searchPara[i-1].para)"
              />
              <el-date-picker
                v-if="modalNames[j-1].searchPara[i-1].type === 'timerange'"
                v-model="modalNames[j-1].searchForm[modalNames[j-1].searchPara[i-1].para]"
                type="datetimerange"
                range-separator="-"
                start-placeholde="开始日期"
                end-placeholde="结束日期"
                value-format="yyyy-MM-dd hh:mm:ss"
                @change="e => searchChange(e, modalNames[j-1].searchPara[i-1].para)"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="search">搜索</el-button>
              <!-- <el-button type="warning" @click="reset('modalForm')">重置</el-button> -->
              <!-- <el-button v-if="hasExport===true" type="primary" @click="exportExcel">导出</el-button> -->
            </el-form-item>
          </el-form>
        </el-row>
        <el-row class="modalRow">
          <el-table
            v-loading="modalNames[j-1].loading"
            :data="modalNames[j-1].tableData"
            border
            fit
            @current-change="e => selectArInfo(e, j-1)"
          >
            <el-table-column width="35">
              <template slot-scope="scope">
                <el-radio v-model="tableRadio" :label="scope.row" />
              </template>
            </el-table-column>
            <template v-for="(col) in modalNames[j-1].tableColumn">
              <el-table-column
                :key="col.dataItem"
                :show-overflow-tooltip="true"
                :prop="col.dataItem"
                :label="col.dataName"
                align="center"
              />
            </template>
          </el-table>
        </el-row>
        <el-row class="modalRow">
          <el-pagination
            v-if="modalNames[j-1].tablePagi"
            :current-page="modalNames[j-1].tablePagi.pageNum"
            :page-size="modalNames[j-1].tablePagi.pageSize"
            layout="total, prev, pager, next, jumper"
            :total="modalNames[j-1].tablePagi.totalSize"
            @current-change="currentPage"
          />
        </el-row>
      </div>
      <div v-if="modalNames[j-1].type === 'dynamicTable'">
        <el-row class="modalRow">
          <el-button type="primary" @click="addRow(infiledList, modalNames[j-1].tableColumn)">添加</el-button>
        </el-row>
        <el-row class="modalRow">
          <el-table :data="infiledList">
            <el-table-column
              v-for="(col) in modalNames[j-1].tableColumn"
              :key="col.dataItem"
              :show-overflow-tooltip="true"
              :prop="col.dataItem"
              :label="col.dataName"
              align="center"
            >
              <template slot-scope="scope">
                <el-input v-if="col.type==='input'" v-model="scope.row[col.dataItem]" clearable />
                <el-select v-if="col.type==='select'" v-model="scope.row[col.dataItem]" clearable filterable>
                  <el-option
                    v-for="item in col.option"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- <el-button type="primary" @click="confirmRow(scope.$index, infiledList)">提交</el-button> -->
                <el-button type="danger" @click="deleteRow(scope.$index, infiledList)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </div>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="nextStep === undefined" @click="handleCancel()">取 消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm(infiledList)"
      >{{ nextStep === true ? '下一步' : '确 定' }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import _ from 'lodash'
import InputData from './InputData'
import SelectData from './SelectData'
import CascaderData from './CascaderData'
import './directives'
export default {
    components: {
        InputData: InputData,
        SelectData: SelectData,
        CascaderData: CascaderData
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        visible: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: ''
        },
        modalNames: {
            type: Array,
            default: () => []
        },
        addPara: {
            type: Array,
            default: () => []
        },
        rowData: {
            type: Object,
            default: () => {}
        },
        editPara: {
            type: Array,
            default: () => []
        },
        nextStep: {
            type: Boolean,
            default: undefined
        },
        resetList: {
            type: Boolean,
            default: false
        },
        cascaderNextData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            value: '',
            paraData: [],
            model: {},
            tableRadio: undefined,
            infiledList: []
        }
    },
    watch: {
        rowData(newVal, oldVal) {
            this.paraData = []
            for (let i = 0; i < this.editPara.length; i++) {
                this.paraData.push([])
                for (let j = 0; j < this.editPara[i].length - 1; j++) {
                    this.paraData[i].push(newVal[this.editPara[i][j]])
                }
            }
        },
        resetList(newVal, oldVal) {
            if (newVal === true) {
                this.infiledList = []
            }
        }
    },
    created() {
        if (this.type === 'new') {
            for (let i = 0; i < this.addPara.length; i++) {
                this.paraData.push([])
                for (let j = 0; j < this.addPara[i].length; j++) {
                    this.paraData[i].push('')
                }
            }
        }
        if (this.type === 'edit') {
            for (let i = 0; i < this.editPara.length; i++) {
                this.paraData.push([])
                for (let j = 0; j < this.editPara[i].length - 1; j++) {
                    this.paraData[i].push(this.rowData[this.editPara[i][j]])
                }
            }
        }
    },
    methods: {
        inputChange(value, j, i) {
            if (this.modalNames[j].name[i].type === 'int') {
                this.paraData[j][i] = parseInt(value)
            } else {
                this.paraData[j][i] = value
            }
        },
        searchChange(value, para, method) {
            if (method) {
                this.model[para] = value
                this.$emit(method, value)
            } else {
                if (value === '') {
                    this.model[para] = undefined
                } else {
                    this.model[para] = value
                }
            }
        },
        search() {
            const data = {
                pageNum: 1,
                pageSize: 10,
                model: this.model
            }
            this.$emit('modalSearch', data)
        },
        selectArInfo(data, j) {
            this.tableRadio = data
            this.paraData[j][0] = data
        },
        currentPage(page) {
            const data = {
                pageNum: page,
                pageSize: 10,
                model: this.model
            }
            this.$emit('modalSearch', data)
        },
        handleCancel() {
            if (this.nextStep === undefined) {
                this.$emit('handleModalCancel')
            }
        },
        handleConfirm(list) {
            const data = []
            if (this.type === 'new') {
                for (let i = 0; i < this.addPara.length; i++) {
                    data.push({})
                    for (let j = 0; j < this.addPara[i].length; j++) {
                        data[i][this.addPara[i][j]] = this.paraData[i][j]
                    }
                }
            }
            if (this.type === 'edit') {
                for (let i = 0; i < this.editPara.length; i++) {
                    data.push({})
                    for (let j = 0; j < this.editPara[i].length; j++) {
                        data[i][this.editPara[i][j]] = this.paraData[i][j]
                    }
                    data[i]['id'] = this.rowData['id']
                }
            }
            if (_.isEmpty(list) !== true) {
                const temp = []
                for (let i = 0; i < list.length; i++) {
                    temp.push(list[i])
                }
                this.$emit('handleConfirm', temp, false)
                // list.splice(0, list.length)
            } else {
                this.$emit('handleConfirm', data)
            }
        },
        addRow(tableData, column) {
            const temp = {}
            for (let i = 0; i < column.length; i++) {
                temp[column[i].dataItem] = ''
            }
            // temp.disable = false
            tableData.push(temp)
        },
        // confirmRow(index, rows) {
        //     console.log('index, rows: ', index, rows)
        //     rows[index].disable = true
        // },
        deleteRow(index, rows) {
            rows.splice(index, 1)
        },
        cascaderMethod(data) {
            this.$emit('cascaderMethod', data)
        }
    }
}
</script>
<style scoped>
div /deep/ .el-dialog__body{
  padding-top: 0px;
}
.rowMarginBot {
  margin-bottom: 12px;
}
.detailTitle {
  margin: 12px;
  font-size: 20px;
  font-weight: 600;
}
.combine {
  display: inline-block;
  height: 34px;
  margin-top: 32px;
  margin-right: 32px;
}
.modalRow{
  margin: 4px 0;
}
</style>
