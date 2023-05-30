<template>
  <a-modal
    :visible.sync="isShowDialog"
    @open="dialogOpen"
    :title="title"
    @ok="saveNew"
    @cancel="cancal"
  >
    <a-form
      :layout="formLayout"
      ref="processForm"
      label-width="80px"
      :model="dataForm"
    >
      <a-form-item
        label="名称："
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
        prop="scopeName"
        size="small"
      >
        <a-input
          v-decorator="[
            'scopeName',
            {
              rules: [
                { required: true, message: '请输入名称', trigger: 'blur' },
              ],
            },
          ]"
          v-model="dataForm.scopeName"
          maxlength="50"
        />
      </a-form-item>
      <a-form-item />
    </a-form>
  </a-modal>
</template>

<script>
import { addWorkFlowScope } from "@/api/workflow/index";
export default {
  name: "AddProject",
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    detailData: {},
  },
  data() {
    return {
        id:"",
        scopeName:"",
      isActiveType: "ProcessFlow",
      btnLoading: false,
      dataForm: {
        scopeName: "",
      },
      formLayout: "horizontal",
      rules: {
        scopeName: [{ required: true, message: "请输入名称", trigger: "blur" }],
      },
    };
  },
  computed: {
    // ...mapGetters(["projectList"]),
    isShowDialog: {
      get() {
        return this.dialogVisible;
      },
      set(val) {
        this.$emit("update:dialogVisible", val);
      },
    },
    formItemLayout() {
      const { formLayout } = this;
      return formLayout === "horizontal"
        ? {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 },
          }
        : {};
    },
  },
  created() {},
  mounted() {},
  methods: {
    cancal() {
      this.isShowDialog = false;
      this.dataForm = {
        scopeName: "",
      };
    },

    saveNew() {
     
      //TODO 校验 
      var params = {
        scopeName: this.dataForm.scopeName,
        id: this.id,
      };
      addWorkFlowScope(params).then((res) => {
        if (res.code === 0) {
          this.$emit("initData");
          this.isShowDialog = false;
        }
      });
    },
    // add() {
    //   this.$refs.processForm.validate(async (valid) => {
    //     if (valid) {
    //       let params = {
    //         type: this.isActiveType,
    //         fileName: this.dataForm.fileName,
    //       };
    //       this.btnLoading = true;
    //       addProjectService(params)
    //         .then((res) => {
    //           this.$message.success("添加成功");
    //           this.$store.dispatch("project/getProjectList", true).then(() => {
    //             // location.reload();
    //             this.cancal()
    //             this.btnLoading = false;
    //           });
    //         })
    //         .catch(() => {
    //           this.btnLoading = false;
    //         });
    //     }
    //   });
    // },
    dialogOpen(id,scopeName) {
        console.log('-----dialogOpen-----',scopeName)
        if(id){
            this.id=id;
        }else{
            this.id=null;
        }
        if(scopeName){
            this.scopeName = scopeName
        }else{
            this.scopeName=null;
        }
      this.dataForm = {
        scopeName: this.scopeName,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.device-type-select {
  overflow: hidden;
  text-align: center;
  margin-bottom: 20px;
  .device-wrap {
    display: inline-block;
    &.active {
      color: #f56c6c;
    }
    cursor: pointer;
    .iconfont {
      font-size: 42px;
    }
  }
}
</style>
