<template>
  <div v-loading="viewLoading" class="workflow-setting-container">
    <a-row class="setting-title" v-if="!showFlow">
      <a-col :span="6">
        <a-row
          ><a-button
            @click="
              addScope
            "
            >添加分类</a-button
          ></a-row
        >
        <a-menu class="a-menu-vertical-demo">
          <a-menu-item
            :index="scopeIndex.toString()"
            :key="scopeIndex"
            v-for="(scopeItem, scopeIndex) in scopeList"
            @click="clickScope(scopeItem)"
          >
            <span>
              {{ scopeItem.scopeName }}
              <a-icon class="setting-delete" style="cursor: pointer" type="delete"  @click.stop="delScope(scopeItem)" />
              <a-icon class="setting-edit" style="cursor: pointer" type="edit" @click.stop="editScope(scopeItem)"  />
            </span>
          </a-menu-item>
        </a-menu>
      </a-col>
      <a-col :span="18">
        <a-row
          ><a-button @click="openWorkflowDialog">添加工作流</a-button></a-row
        >
        <a-table :columns="columns" :data-source="flowList" :scroll="{ x: 'max-content' | true, y: 500 }" style="width: 100%">
          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)">设计</a>
            <a-divider type="vertical" />
            <a @click="handleUpdate(record)">修改</a>
            <a-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
          </span>
        </a-table>
      </a-col>
    </a-row>
    <workFlowEdit v-if="showFlow" :id="flowId" @goBack="goBack" />
    <addScopeDialog
      ref="addScope"
      :dialog-visible.sync="addScopeVisible"
      :title="scopeTitle"
      @initData="initScope"
    />
    <addWorkflowDialog
      ref="addWorkflow"
      :dialog-visible.sync="addWorkflowVisible"
      :title="workflowTitle"
      @initData="initFlowData"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  getWorkFlowScopeList,
  getWorkFlowList,
  deleteWorkFlowScope,
  deleteWorkFlow,
} from "@/api/workflow/index";
import workFlowEdit from "@/views/workflow/edit/index.vue";
import addScopeDialog from "./dialog-module/add-scope.vue";
import addWorkflowDialog from "./dialog-module/add-workflow.vue";
export default {
  components: { workFlowEdit, addScopeDialog, addWorkflowDialog },
  data() {
    return {
      viewLoading: false,
      scopeList: [],
      flowList: [],
      flowId: null,
      showFlow: false,
      scopeTitle:'添加分类',
      workflowTitle:'添加工作流',
      addScopeVisible: false,
      addWorkflowVisible: false,
      selectScopeId: null,
      selectScopeName: null,
      selectFlowId: null,
      selectFlowName: null,
      columns: [
        {
          title: "id",
          dataIndex: "id",
          key: "id",
        },
        {
          title: "名称",
          dataIndex: "workflowName",
          key: "workflowName",
        },
        {
          title: "备注",
          dataIndex: "address",
          key: "address",
        },
        {
          title: "修改人",
          dataIndex: "updateBy",
          key: "updateBy",
        },
        {
          title: "修改日期",
          dataIndex: "updateTime",
          key: "updateTime",
        },
        {
          title: "操作",
          key: "action",
          scopedSlots: { customRender: "action" },
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["projectId", "projectList"]),
  },
  created() {
    this.initScope();
  },
  methods: {
    initScope() {
      getWorkFlowScopeList().then((res) => {
        this.scopeList = res.dataList;
      });
    },
    delScope(scopeItem) {
        let _this = this;
      this.$antdConfirm({
        title:"提示",
        content:"请确认是否删除",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        onOk(){
            _this.deleteScopeService(scopeItem.businessId);
        },
      })

    },
    deleteScopeService(scopeId) {
      let param = {
        businessScopeId: scopeId,
      };
      deleteWorkFlowScope(param).then((res) => {
        this.$message({
          message: "删除成功",
          type: "success",
        });
        this.initScope();
      });
    },
    addScope(){
      this.addScopeVisible = true;
      this.scopeTitle = '添加分类'
      this.$refs['addScope'].dialogOpen();
    },
    editScope(scopeItem) {
      this.addScopeVisible = true;
      this.selectScopeId = scopeItem.businessId;
      this.selectScopeName = scopeItem.scopeName;
      this.scopeTitle = '编辑分类'
      this.$refs['addScope'].dialogOpen(scopeItem.businessId,scopeItem.scopeName);
    },
    clickScope(scopeItem) {
      this.selectScopeId = scopeItem.businessId;
      this.initFlowList(scopeItem.businessId);
    },
    initFlowData() {
      this.initFlowList(this.selectScopeId);
    },
    initFlowList(businessScopeId) {
      let param = {
        businessScopeId: businessScopeId,
      };
      getWorkFlowList(param).then((res) => {
        this.flowList = res.dataList;
      });
    },
    openWorkflowDialog() {
      this.selectFlowId = null;
      this.selectFlowName = null;
      this.addWorkflowVisible = true;
      this.workflowTitle = '添加工作流'
      this.$refs['addWorkflow'].dialogOpen(undefined, this.selectScopeId);
    },
    handleEdit(row) {
      this.flowId = row.id;
      this.showFlow = true;
    },
    handleUpdate(row) {
      this.selectFlowId = row.id;
      this.selectFlowName = row.workflowName;
      this.addWorkflowVisible = true;
      this.workflowTitle = '编辑工作流'
      this.$refs['addWorkflow'].dialogOpen(row.id,row.scopeId,row.workflowName);
    },
    handleDelete(row) {
        let _this = this;
      this.$antdConfirm({
        title:"提示",
        content:"请确认是否删除",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        onOk(){
            _this.deleteWorkflowService(row);
        },
      })

    },
    deleteWorkflowService(row){
        let param = {
        businessId: row.id,
      };

      deleteWorkFlow(param).then((res) => {
        this.$message({
          message: "删除成功",
          type: "success",
        });
        this.initFlowList(this.selectScopeId);
      });
    },
    goBack() {
      this.showFlow = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.workflow-setting-container {
  .setting-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 20px;
    line-height: 28px;
  }
}
.setting-edit {
  float: right;
  margin-top: 14px;
}
.setting-delete {
  float: right;
  margin-right: 10px;
  margin-top: 14px;
}
a {
    color: #1890ff;
    text-decoration: none;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    transition: color .3s;
    -webkit-text-decoration-skip: objects;
}
</style>
