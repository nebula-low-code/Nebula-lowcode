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
                    v-model="dataForm.workflowName"
                    maxlength="50"
                />
            </a-form-item>
            <a-form-item/>
        </a-form>
    </a-modal>
</template>

<script>
import {addWorkFlow, renameWorkFlow} from "@/api/workflow/index";

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
            id: "",
            scopeId: "",
            workflowName: "",
            isActiveType: "ProcessFlow",
            btnLoading: false,
            formLayout: "horizontal",
            dataForm: {
                workflowName: "",
            },
            rules: {
                workflowName: [
                    {required: true, message: "请输入名称", trigger: "blur"},
                ],
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
            const {formLayout} = this;
            return formLayout === "horizontal"
                ? {
                    labelCol: {span: 4},
                    wrapperCol: {span: 14},
                }
                : {};
        },
    },
    created() {
    },
    mounted() {
    },
    methods: {
        cancal() {
            this.isShowDialog = false;
            this.dataForm = {
                workflowName: "",
            };
        },

        saveNew() {
            // this.$refs.processForm.validate(async (valid) => {
            //   if (valid) {
            let params;
//update
            if (this.id) {
                params = {
                    workflowName: this.dataForm.workflowName,
                    scopeId: this.scopeId,
                    id: this.id,
                };
                renameWorkFlow(params).then((res) => {
                    if (res.code === 0) {
                        this.$emit("initData");
                        this.isShowDialog = false;
                    }
                });
            } else {
                if (this.scopeId) {
                    params = {
                        workflowName: this.dataForm.workflowName,
                        scopeId: this.scopeId,
                        scheme:
                            '{"nodes":[{"version":1,"id":0,"x":100,"y":81,"title":"开始","type":"start","outputs":[{"id":2837,"x":243,"y":115,"title":null}],"properties":{}}]}',
                    };
                    addWorkFlow(params).then((res) => {
                        if (res.code === 0) {
                            this.$emit("initData");
                            this.isShowDialog = false;
                        }
                    })
                } else {
                    this.$message.error('请选择分组')
                }

            }
            //   }
            // });
        },

        dialogOpen(id, scopeId, workflowName) {
            if (id) {
                this.id = id;
                this.scopeId = scopeId;
                this.workflowName = workflowName;
            } else {
                this.id = null;
                this.scopeId = scopeId;
                this.workflowName = null;
            }
            this.dataForm = {
                workflowName: this.workflowName,
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
