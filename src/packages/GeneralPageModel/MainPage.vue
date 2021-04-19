<template>
  <div>
    <el-container v-if="pageType === 'table' || pageType === 'chart'">
      <a v-if="hasBack===true" @click="goBack">
        <svg style="position: absolute; height: 32px; width: 100px; top: 8px; zIndex: 99">
          <use xlink:href="#icon-back" />
        </svg>
      </a>
      <el-main>
        <el-row class="row">
          <el-form ref="ruleForm" :model="ruleForm" :inline="true">
            <el-form-item v-for="i in pagePara.length" :key="i" :label="pagePara[i-1].name" :prop="pagePara[i-1].para">
              <el-input v-if="pagePara[i-1].type === 'input'" v-model="ruleForm[pagePara[i-1].para]" @input="e => inputChange(e, pagePara[i-1].para)" />
              <el-select v-if="pagePara[i-1].type === 'select'" v-model="ruleForm[pagePara[i-1].para]" clearable filterable @change="e => inputChange(e, pagePara[i-1].para, pagePara[i-1].method)">
                <el-option
                  v-for="item in pagePara[i-1].option"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select v-if="pagePara[i-1].type === 'multi'" v-model="ruleForm[pagePara[i-1].para]" multiple collapse-tags @change="e => inputChange(e, pagePara[i-1].para)">
                <el-checkbox v-model="pagePara[i-1].check" class="selectCheck" @change="e => selectAll(e, pagePara[i-1])">全选</el-checkbox>
                <el-option
                  v-for="item in pagePara[i-1].option"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-date-picker
                v-if="pagePara[i-1].type === 'date'"
                v-model="ruleForm[pagePara[i-1].para]"
                type="date"
                placeholde="日期"
                value-format="yyyy-MM-dd"
                @change="e => inputChange(e, pagePara[i-1].para)"
              />
              <el-date-picker
                v-if="pagePara[i-1].type === 'timerange'"
                v-model="ruleForm[pagePara[i-1].para]"
                type="datetimerange"
                range-separator="-"
                start-placeholde="开始日期"
                end-placeholde="结束日期"
                value-format="yyyy-MM-dd hh:mm:ss"
                @change="e => inputChange(e, pagePara[i-1].para)"
              />
            </el-form-item>
            <el-form-item>
              <el-button v-if="hasSearch===true" type="success" @click="search">搜索</el-button>
              <el-button v-if="hasSearch===true" type="warning" @click="reset('ruleForm')">重置</el-button>
              <el-button v-if="hasExport===true" type="primary" @click="exportExcel">导出</el-button>
            </el-form-item>
            <el-button v-if="hasTree===true" class="floatRight" type="primary" @click="treeShow">树形展示</el-button>
            <el-button v-if="hasChart===true && pageType==='table'" class="floatRight" type="primary" @click="chartShow">图表展示</el-button>
            <el-button v-if="hasChart===true && pageType==='chart'" class="floatRight" type="primary" @click="tableShow">表格展示</el-button>
          </el-form>
        </el-row>
        <el-row class="row">
          <el-button v-if="hasAdd===true" type="primary" @click="addShow">新增</el-button>
          <el-button v-if="hasMulti===true" type="danger" :disabled="deleteSelect.length === 0" @click="handleMultiDelete">批量删除</el-button>
          <el-button v-if="hasImport===true" type="primary" @click="importShow">导入</el-button>
        </el-row>
        <el-row class="row">
          <el-pagination
            v-if="pagination"
            :current-page="pagination.pageNum"
            :page-size="pagination.pageSize"
            :page-sizes="[10, 50, 100, 1000]"
            layout="total, prev, pager, next, sizes, jumper"
            :total="pagination.totalSize"
            @current-change="currentPage"
            @size-change="handleSizeChange"
          />
        </el-row>
        <el-row class="row">
          <el-table
            v-if="pageType==='table'"
            v-loading="loading"
            :data="tableData"
            border
            fit
            @selection-change="selectArInfo"
          >
            <el-table-column v-if="hasMulti===true" fixed type="selection" width="40px" />
            <template v-for="(col) in columns">
              <el-table-column
                :key="col.dataItem"
                :show-overflow-tooltip="true"
                :prop="col.dataItem"
                :label="col.dataName"
                align="center"
              />
            </template>
            <el-table-column v-if="hasOperate===false && hasDetail === true" fixed="right" label="详情" align="center" width="80">
              <template slot-scope="{row}">
                <el-button v-if="hasDetail === true" type="info" size="mini" style="marginRight: 12px" @click="detailShow(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
            <el-table-column v-if="hasOperate===true" fixed="right" label="操作" align="center" :min-width="hasDetail === true ? 240 : 160">
              <template slot-scope="{row}">
                <el-button type="primary" size="mini" style="marginRight: 12px" @click="editShow(row)">
                  编辑
                </el-button>
                <template>
                  <el-popover
                    placement="top"
                    width="170"
                    :v-model="deleteVisible"
                  >
                    <p>是否确认删除该条数据？</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" @click="handleDeleteCancel()">取消</el-button>
                      <el-button type="primary" size="mini" @click="handleDeleteConfirm(row)">确定</el-button>
                    </div>
                    <el-button v-if="row.status!='deleted'" slot="reference" size="mini" type="danger" style="marginRight: 12px" @click="handleDelete()">删除</el-button>
                  </el-popover>
                </template>
                <el-button v-if="hasDetail === true" type="info" size="mini" style="marginRight: 12px" @click="detailShow(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="pageType==='chart'" id="indexLineChart" v-loading="loading" style="width: 100%; height: 360px" :style="styleObject" />
        </el-row>
        <transition name="fade">
          <el-row class="row">
            <el-pagination
              v-if="pagination && pagination.pageSize > 50 && pagination.totalSize > 50"
              :current-page="pagination.pageNum"
              :page-size="pagination.pageSize"
              :page-sizes="[10, 50, 100, 1000]"
              layout="total, prev, pager, next, sizes, jumper"
              :total="pagination.totalSize"
              @current-change="currentPage"
              @size-change="handleSizeChange"
            />
          </el-row>
        </transition>
      </el-main>
      <el-backtop />
    </el-container>
    <el-container v-if="pageType === 'tree'" id="box">
      <el-aside id="left" width="200px">
        <el-row class="backToTable">
          <a v-if="hasBack===true" @click="goBack">
            <svg style="position: absolute; height: 32px; width: 100px; top: 2px; left: -24px; zIndex: 99">
              <use xlink:href="#icon-back" />
            </svg>
          </a>
          <el-button type="primary" @click="tableShow">表格展示</el-button>
        </el-row>
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
        />
        <el-tree
          ref="tree"
          v-loading="loading"
          node-key="id"
          :default-expanded-keys="currentExpand"
          :expand-on-click-node="false"
          :highlight-current="true"
          :current-node-key="currentNodeKey"
          :data="treeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          @node-click="handleTreeClick"
          @node-contextmenu="handleTreeRightClick"
        />
        <div class="dev-type-main-left">
          <!--鼠标右键菜单栏 -->
          <div v-show="showRightMenu">
            <div id="menu" class="tree-right-menu">
              <div class="button-div">
                <el-button class="tree-right-menu-button" type="primary" @click="addShow">新增</el-button>
              </div>
              <div class="button-div">
                <el-button class="tree-right-menu-button" type="primary" @click="editShow(selectNodeData)">编辑</el-button>
              </div>
              <div class="button-div">
                <el-popover
                  placement="top"
                  width="170"
                  :v-model="deleteVisible"
                >
                  <p>是否确认删除该条数据及其下属包含数据？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" @click="handleDeleteCancel()">取消</el-button>
                    <el-button type="primary" size="mini" @click="handleDeleteConfirm({id: selectNodeId})">确定</el-button>
                  </div>
                  <el-button slot="reference" class="tree-right-menu-button" type="danger" @click="handleDelete">删除</el-button>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
      </el-aside>
      <div id="resize" />
      <el-container id="right" class="treeDetailContainer">
        <div class="detailDiv">
          <el-row v-for="i in treeDataDetail.length" :key="i" class="detailRow">
            <div v-if="treeDataDetail[i-1].type === 'normal'">
              <div v-for="j in treeDataDetail[i-1].namePara.length" :key="i * 10 + j" class="combine">
                <input-data :name="treeDataDetail[i-1].namePara[j-1].name" :type="treeDataDetail[i-1].namePara[j-1].type" :data="treeDataDetail[i-1].dataPara[treeDataDetail[i-1].namePara[j-1].item]" />
              </div>
            </div>
            <div v-if="treeDataDetail[i-1].type === 'tab'">
              <div class="detailTitle">{{ treeDataDetail[i-1].title }}</div>
              <el-tabs :value="treeDataDetail[i-1].tabs[0].tabName">
                <el-tab-pane v-for="j in treeDataDetail[i-1].tabs.length" :key="i * 10 + j" :label="treeDataDetail[i-1].tabs[j-1].tabName" :name="treeDataDetail[i-1].tabs[j-1].tabName">
                  <div v-for="k in treeDataDetail[i-1].tabs[j-1].namePara.length" :key="i * 100 + j * 10 + k" class="combine">
                    <input-data :name="treeDataDetail[i-1].tabs[j-1].namePara[k-1].name" :type="treeDataDetail[i-1].tabs[j-1].namePara[k-1].type" :data="treeDataDetail[i-1].tabs[j-1].dataPara[k-1]" />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
            <div v-if="treeDataDetail[i-1].type === 'table'" class="treeDataTable">
              <div class="detailTitle">{{ treeDataDetail[i-1].title }}</div>
              <el-table
                :data="treeDataDetail[i-1].tableData"
                border
                fit
              >
                <template v-for="(col) in treeDataDetail[i-1].columns">
                  <el-table-column
                    :key="col.dataItem"
                    :show-overflow-tooltip="true"
                    :prop="col.dataItem"
                    :label="col.dataName"
                    align="center"
                  />
                </template>
              </el-table>
            </div>
          </el-row>
          <el-row>
            <div class="botArea" />
          </el-row>
        </div>
      </el-container>
    </el-container>
    <main-modal
      v-if="type === 'new'"
      title="新增"
      :next-step="nextStep"
      :reset-list="resetList"
      :visible="type === 'new'"
      :type="type"
      :modal-names="modalNames"
      :add-para="addPara"
      @handleConfirm="handleAddConfirm"
      @handleModalCancel="handleModalCancel"
      @modalSearch="modalSearch"
    />
    <main-modal
      v-if="type === 'edit'"
      title="编辑"
      :next-step="nextStep"
      :reset-list="resetList"
      :visible="type === 'edit'"
      :type="type"
      :modal-names="editModalNames || modalNames"
      :row-data="rowData"
      :edit-para="editPara"
      @handleConfirm="handleEditConfirm"
      @handleModalCancel="handleModalCancel"
    />
    <import-modal
      v-if="type === 'import'"
      title="导入"
      :visible="type === 'import'"
      :download-url="downloadUrl"
      @handleModalCancel="handleModalCancel"
      @importData="importData"
    />
  </div>
</template>
<script>
import _ from 'lodash'
import './back.svg'
import MainModal from './MainModal'
import ImportModal from './ImportModal'
import InputData from './InputData'
var echarts = require('echarts')
export default {
  name: 'GeneralPageModel',
    components: {
        InputData: InputData,
        MainModal: MainModal,
        ImportModal: ImportModal
    },
    props: {
        page: {
            type: String,
            default: 'city'
        },
        setPageType: {
            type: String,
            default: undefined
        },
        hasAdd: {
            type: Boolean,
            default: true
        },
        hasMulti: {
            type: Boolean,
            default: true
        },
        hasOperate: {
            type: Boolean,
            default: true
        },
        hasBack: {
            type: Boolean,
            default: false
        },
        hasImport: {
            type: Boolean,
            default: false
        },
        hasSearch: {
            type: Boolean,
            default: true
        },
        hasExport: {
            type: Boolean,
            default: false
        },
        hasTree: {
            type: Boolean,
            default: false
        },
        hasChart: {
            type: Boolean,
            default: false
        },
        hasDetail: {
            type: Boolean,
            default: false
        },
        backPath: {
            type: String,
            default: '/dashboard'
        },
        loading: {
            type: Boolean,
            default: false
        },
        columns: {
            type: Array,
            default: () => []
        },
        tableData: {
            type: Array,
            default: () => []
        },
        pagination: {
            type: Object,
            default: undefined
        },
        modalNames: {
            type: Array,
            default: () => []
        },
        editModalNames: {
            type: Array,
            default: undefined
        },
        pagePara: {
            type: Array,
            default: () => []
        },
        ruleForm: {
            type: Object,
            default: () => {}
        },
        addPara: {
            type: Array,
            default: () => []
        },
        editPara: {
            type: Array,
            default: () => []
        },
        coachNum: {
            type: Number,
            default: 1
        },
        trainTypeId: {
            type: Number,
            default: 1
        },
        downloadUrl: {
            type: String,
            default: ''
        },
        chartOption: {
            type: Object,
            default: () => {}
        },
        treeData: {
            type: Array,
            default: () => []
        },
        treeProps: {
            type: Object,
            default: () => {}
        },
        treeDataDetail: {
            type: Array,
            default: () => []
        },
        defaultNodeKey: {
            type: Number || String,
            default: undefined
        },
        rightClickNodeData: {
            type: Object,
            default: () => {}
        },
        hasEditMethod: {
            type: Boolean,
            default: false
        },
        editRowData: {
            type: Object,
            default: () => {}
        },
        nextStep: {
            type: Boolean,
            default: undefined
        }
    },
    data() {
        return {
            model: {},
            pageSizeNow: this.pagination ? this.pagination.pageSize : 1,
            rowData: {},
            deleteSelect: [],
            deleteVisible: false,
            type: '',
            pageType: 'table',
            filterText: '',
            currentNodeKey: undefined,
            currentExpand: undefined,
            selectNodeId: undefined,
            selectNodeData: {},
            showRightMenu: false,
            totalChecked: true,
            resetList: false,
            styleObject: {
                height: (window.innerHeight - 400) + 'px'
            }
        }
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val)
        },
        defaultNodeKey(newVal, oldVal) {
            const temp = []
            temp.push(newVal)
            this.currentExpand = temp
            this.currentNodeKey = newVal
            this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(newVal)
            })
        },
        rightClickNodeData(newVal, oldVal) {
            this.selectNodeData = newVal
        },
        chartOption(newVal, oldVal) {
            const tempChart = document.getElementById('indexLineChart')
            if (tempChart) {
                const pChart = echarts.init(tempChart)
                pChart.setOption(newVal, true)
            }
        },
        editRowData(newVal, oldVal) {
            this.rowData = newVal
        }
    },
    created() {
        if (this.setPageType !== undefined) {
            this.pageType = this.setPageType
        }
        if (this.pageType === 'chart') {
            if (_.isEmpty(this.chartOption) !== true) {
                this.$nextTick(() => {
                    this.drawChart()
                })
            }
        }
    },
    mounted() {
        if (this.hasTree === true) {
            this.dragControllerDiv()
        }
    },
    updated() {
        if (this.$refs.tree) {
            this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(this.$refs.tree.currentNodeKey)
            })
        }
    },
    methods: {
        pattern(string) {
            const chinese = new RegExp('[\u4E00-\u9FA5]+')
            const number = new RegExp('[0-9]+')
            if (chinese.test(string)) {
                return '中文'
            }
            if (number.test(string)) {
                return '数字'
            }
        },
        selectAll(e, pagePara) {
            pagePara.check = e
            if (e === true) {
                pagePara.option.map((item) => {
                    this.ruleForm[pagePara.para].push(item.value)
                })
            } else {
                this.ruleForm[pagePara.para] = []
            }
        },
        inputChange(value, para, method) {
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
                pageSize: this.pagination ? this.pagination.pageSize : 10,
                model: this.model
            }
            this.$emit('search', data)
        },
        reset(formName) {
            this.model = {}
            this.$refs[formName].resetFields()
            this.$emit('search')
        },
        exportExcel() {
            this.$emit('exportExcel', this.model)
        },
        currentPage(page) {
            const data = {
                pageNum: page,
                pageSize: this.pageSizeNow,
                model: this.model
            }
            this.$emit('search', data)
        },
        handleSizeChange(size) {
            this.pageSizeNow = size
            const data = {
                pageNum: 1,
                pageSize: size,
                model: this.model
            }
            this.$emit('search', data)
        },
        addShow() {
            this.type = 'new'
        },
        editShow(value) {
            this.type = 'edit'
            if (this.hasEditMethod === true) {
                this.$emit('editMethod', value.id)
            } else {
                this.rowData = value
            }
        },
        detailShow(value) {
            this.$emit('detail', value)
        },
        importShow() {
            this.type = 'import'
        },
        handleAddConfirm(data, reset) {
            this.resetList = reset
            for (let i = 0; i < this.modalNames.length; i++) {
                if (this.modalNames[i].type === 'normal') {
                    for (let j = 0; j < data.length; j++) {
                        for (const key in data[j]) {
                            if (data[j][key] !== '0' && !data[j][key]) {
                                for (let k = 0; k < this.addPara[i].length; k++) {
                                    if (key === this.addPara[i][k]) {
                                        this.$alert(this.modalNames[i].name[k].name + '不能为空')
                                        return false
                                    }
                                }
                            }
                        }
                    }
                } else if (this.modalNames[i].type === 'table') {
                    for (let j = 0; j < data.length; j++) {
                        for (const key in data[j]) {
                            if (data[j][key] !== '0' && !data[j][key]) {
                                for (let k = 0; k < this.addPara[i].length; k++) {
                                    if (key === this.addPara[i][k]) {
                                        this.$alert('表格选项不能为空')
                                        return false
                                    }
                                }
                            }
                        }
                    }
                } else if (this.modalNames[i].type === 'dynamicTable') {
                    for (let j = 0; j < data.length; j++) {
                        for (const key in data[j]) {
                            if (data[j][key] !== '0' && !data[j][key]) {
                                for (let k = 0; k < this.addPara[i].length; k++) {
                                    if (key === this.addPara[i][k]) {
                                        this.$alert(this.modalNames[i].tableColumn[k].dataName + '不能为空')
                                        return false
                                    }
                                }
                            }
                        }
                    }
                }
            }
            this.resetList = true
            this.$emit('add', data)
            if (this.nextStep !== true) {
                this.type = ''
            }
        },
        handleEditConfirm(data) {
            for (let i = 0; i < data.length; i++) {
                for (var key in data[i]) {
                    if (data[key] !== '0' && !data[i][key]) {
                        for (let j = 0; j < this.addPara[i].length; j++) {
                            if (key === this.addPara[i][j]) {
                                this.$alert(this.modalNames[i].name[j].name + '不能为空')
                                return false
                            }
                        }
                    }
                }
            }
            this.$emit('edit', data)
            if (this.nextStep !== true) {
                this.type = ''
            }
        },
        handleModalCancel() {
            this.type = ''
        },
        selectArInfo(val) {
            const tempSelect = []
            // 将选中的行的id赋值
            for (var i in val) {
                tempSelect[i] = val[i].id
            }
            this.deleteSelect = tempSelect
        },
        handleDelete() {
            this.deleteVisible = true
        },
        handleDeleteCancel() {
            document.querySelector('#app').click()
        },
        handleDeleteConfirm(row) {
            document.querySelector('#app').click()
            this.$emit('delete', row.id)
        },
        handleMultiDelete() {
            const ids = []
            // 将id赋值
            for (var i in this.deleteSelect) {
                ids[i] = this.deleteSelect[i]
            }
            this.$confirm('是否确认删除选中的数据？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$emit('deleteMulti', ids)
            }).catch(err => {
                this.$alert(err.response.data.message, err.message)
            })
        },
        importData(data) {
            this.$emit('importData', data)
        },
        modalSearch(data) {
            this.$emit('modalSearch', data)
        },
        goBack() {
            this.$router.replace({ path: this.backPath })
        },
        treeShow() {
            this.pageType = 'tree'
        },
        tableShow() {
            this.pageType = 'table'
            this.$emit('changeType', this.pageType)
        },
        chartShow() {
            this.pageType = 'chart'
            this.$emit('changeType', this.pageType)
            this.$nextTick(() => {
                this.drawChart()
            })
        },
        drawChart() {
            const tempChart = document.getElementById('indexLineChart')
            const pChart = echarts.init(tempChart)
            pChart.setOption(this.chartOption, true)
        },
        filterNode(value, data) {
            if (!value) {
                return true
            }
            return data[this.treeProps.label].indexOf(value) !== -1
        },
        handleTreeClick(value) {
            this.$emit('treeNodeDetail', value.id)
        },
        handleTreeRightClick(event, value, node, self) {
            this.showRightMenu = false // 先把模态框关死，目的是：第二次或者第n次右键鼠标的时候 它默认的是true
            this.showRightMenu = true
            this.selectNodeId = value.id
            this.$emit('setRightClickNodeId', this.selectNodeId)
            const menu = document.querySelector('#menu')
            menu.style.left = event.clientX > 230 ? event.clientX - 190 + 'px' : event.clientX - 40 + 'px'
            menu.style.top = event.clientY - 75 + 'px'
            // 给整个document添加监听鼠标事件，点击任何位置执行closeRightMenu方法，及时将菜单关闭
            document.addEventListener('click', this.closeRightMenu)
        },
        closeRightMenu() {
            this.showRightMenu = false
            // 及时关掉鼠标监听事件
            document.removeEventListener('click', this.closeRightMenu)
        },
        dragControllerDiv: function() {
            const resize = document.getElementById('resize')
            const left = document.getElementById('left')
            const right = document.getElementById('right')
            const box = document.getElementById('box')

            resize.onmousedown = function(e) {
                const startX = e.clientX
                resize.left = resize.offsetLeft
                document.onmousemove = function(e) {
                    const endX = e.clientX
                    let moveLen = resize.left + (endX - startX)
                    const maxT = box.clientWidth - resize.offsetWidth
                    if (moveLen < 200) moveLen = 200
                    if (moveLen > maxT - 280) moveLen = maxT - 280
                    resize.style.left = moveLen
                    left.style.width = moveLen + 'px'
                    right.style.width = (box.clientWidth - moveLen - 20) + 'px'
                }
                document.onmouseup = function() {
                    document.onmousemove = null
                    document.onmouseup = null
                    resize.releaseCapture && resize.releaseCapture()
                }
                resize.setCapture && resize.setCapture()
                return false
            }
        }
    }
}
</script>
<style scoped>
.el-container{
  position: relative;
  color: #acc2ff;
}
.el-form /deep/ .el-form-item--small.el-form-item{
  margin-bottom: 8px;
}
.el-form /deep/ .el-form-item__label{
  color:#acc2ff;
}
.el-row /deep/ .el-button--small {
  margin-right: 14px;
  margin-bottom: 4px;
}
.el-row /deep/ .el-button+.el-button {
  margin-left: 0px;
}
.el-tree {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}
.el-tree>.el-tree-node {
  display: inline-block;
  min-width: 100%;
}
.row{
  margin: 24px 0;
}
.inputContainer {
  display: inline-block;
  margin-right: 14px;
}
.combine {
  display: inline-block;
  height: 34px;
  margin-top: 32px;
  margin-right: 32px;
}
.fade-enter{
  opacity: 0;
}
.fade-enter-active {
  transition: opacity 1s;
}
.fade-leave-to {
  opacity: 0;
}
.fade-leave-active{
  transition: opacity 1s;
}
.floatRight{
  float: right;
}
.el-aside {
  height: calc(100vh - 84px);
  margin-bottom: 0px;
  background: #014fb5;
}
.treeDetailContainer {
  height: calc(100vh - 84px);
  overflow-y: auto;
  overflow-x: hidden;
}
.detailDiv {
  padding: 12px;
}
.detailRow {
  margin: 12px 0;
}
.detailTitle {
  margin: 12px;
  font-size: 20px;
  font-weight: 600;
}
.botArea {
  height: 24px;
}
.backToTable {
  padding: 8px 56px;
  padding-top: 0;
}
.treeDataTable /deep/ .el-table{
  width: 100%;
}
.treeDataTable /deep/ .el-table__header-wrapper table,.el-table__body-wrapper table{
  width: 100% !important;
}
.treeDataTable /deep/ .el-table__body, .el-table__footer, .el-table__header{
  table-layout: auto;
}
.treeDataTable /deep/ .el-table--enable-row-hover .el-table__body tr:hover>td{
  background-color: #039 !important;
}
.dev-type-main-left {
  overflow: auto;
  padding: 10px;
}
.tree-right-menu {
  z-index: 1;
  position: absolute;
  height: 156px;
  width: 110px;
  position: absolute;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #003399;
}
.tree-right-menu-button {
  display: block;
  margin: 10px;
}
.button-div {
  margin: 14px;
}
.selectCheck{
  text-align: right;
  width: 100%;
  padding-right: 10px;
}
#resize {
    position: relative;
    width:20px;
    height:calc(100vh - 84px);
    cursor: w-resize;
    float:left;
}
</style>
