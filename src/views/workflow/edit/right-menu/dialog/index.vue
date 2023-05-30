<template>
    <div class="downComment">
        <a-modal :title="title" width="620px" :before-close="handleClose" :visible.sync="isShowDialog" :confirmLoading="loading" :maskClosable="false" @open="dialogOpen" @cancel="close" @ok="saveOk">
            <div>
                <div class="approve-list">
                    <a-tag class="approve-list-tag" v-for="(aItem,aindex) in approveList" :key="aItem.type+aItem.id"  :color="colorMap[aItem.type]" closable @close="closeTag(aindex)">
                        {{ aItem.name }}
                    </a-tag>
                </div>
                <a-tabs default-active-key="1" @change="callback">
                    <a-tab-pane key="1" tab="组织架构">
                        <a-tree v-model="deptCheckedKeys" checkable :auto-expand-parent="autoExpandParent" :tree-data="deptTreeList" :replaceFields="replaceFields" checkStrictly @select="onSelect" @check="onCheckDept" />
                    </a-tab-pane>
                    <a-tab-pane key="2" tab="角色" force-render>
                        TODO
                    </a-tab-pane>
                    <a-tab-pane key="3" tab="成员">
                        <div style="display:flex">
                            <div class="member-div">
                                <div class="member-div-all" @click="showAllMember">
                                    全部成员
                                </div>
                                <a-tree v-model="userCheckedKeys" :selectedKeys="selectedKeys" :auto-expand-parent="autoExpandParent" :tree-data="deptTreeList" :replaceFields="replaceFields" checkStrictly @select="onSelect" />
                            </div>
                            <div class="member-div">
                                <div class="member-total member-item">
                                    <span>已选 {{currentUserCheck}}/{{memberList.length}}</span>
                                    <!-- TODO 全选功能 -->
                                    <!-- <a-checkbox  :checked="userCheckAll" @change="onChangeAll"></a-checkbox> -->
                                </div>
                                <div v-for="(item,index) in memberList" :key="index">
                                    <div class="member-item">
                                        <span>{{ item.name }}</span>
                                        <a-checkbox v-model="item.checked" @change="onChange">
                                        </a-checkbox>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </a-tab-pane>
                    <a-tab-pane key="4" tab="动态负责人">
                        TODO
                    </a-tab-pane>
                </a-tabs>
            </div>
        </a-modal>
    </div>
</template>

<script>
import { getWorkFlowUserList } from "@/api/workflow/index";
export default {
    name: "chooseApproveBy",
    props: {
        title: String,
        //0:从页面设计器打开 1:从侧边栏打开

        dialogVisible: {
            type: Boolean,
            default: false,
        },
        deptTreeList: {
            type: Array,
            default: () => [],
        },     
    },
    data() {
        return {
            remark: "",
            formLayout: "horizontal",
            dataForm: {
                name: "",
                remark: "",
            },
            deptCheckedKeys: [],
            userCheckedKeys: [],
            loading: false,
            autoExpandParent: true,
            treeData: [],
            replaceFields: {
                children: "children",
                title: "name",
                key: "id",
            },
            memberList: [],
            selectedKeys: [],
            colorMap: {
                "dept": "#f50",
                "user": "#1890ff",
            },
            currentUserCheck: 0,
            indeterminate: true,
            userCheckAll: false,
            approveList:[],
        };
    },
    computed: {
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
    components: {},
    watch: {},
    created() { },
    methods: {
        init() {
            this.deptCheckedKeys = [];
            this.userCheckedKeys = [];
            this.memberList.forEach(mItem => {
                mItem.checked = false
            })
            this.approveList.forEach(aItem => {
                if (aItem.type == "dept") {
                    this.deptCheckedKeys.push(aItem.id);
                } else if (aItem.type == "user") {
                    this.userCheckedKeys.push(aItem)
                    this.memberList.forEach(mItem => {
                        if (mItem.id == aItem.id) {
                            mItem.checked = true;
                        }
                    })
                }
            })
            this.echoUserCheck();
        },
        dialogOpen(approveList) {
            this.approveList = approveList;
            this.init();
        },
        dialogClose() { },
        saveOk() {
            this.$emit("saveApprove", this.approveList)
            this.handleClose();
        },
        closeTag(index) {
            this.approveList.splice(index, 1)
            // 删除approveList后需要重新渲染tab下面的树形结构
            this.init();
        },

        handleClose() {
            this.isShowDialog = false;
        },
        close() {
            this.isShowDialog = false;
        },
        tableRowClassName({ row, rowIndex }) {
            // 把每一行的索引放进row
            row.index = rowIndex;
        },

        // 失去焦点初始化
        inputBlur() {
            this.saveVar();
            this.tabClickIndex = null;
            this.tabClickLabel = "";
        },
        saveVar() {
            saveVarService(this.tabCLickRow).then((res) => {
                this.selectVarList(this.currentScopeId);
            });
        },
        deleteVar(row) {
            let businessId = row.id;
            this.$confirm("请确认是否删除?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.deelteGlobalVar(businessId);
                })
                .catch(() => { });
        },
        callback(key) {
            console.log(key);
        },
        onCheck(checkedKeys) {
            console.log("onCheck", checkedKeys);
            this.checkedKeys = checkedKeys;
        },
        onSelect(selectedKeys, info) {
            console.log("onSelect", selectedKeys, info);

            this.selectedKeys = selectedKeys;
            this.selectMemberList(selectedKeys[0]);
        },
        showAllMember() {
            this.selectedKeys = [];
            this.selectMemberList();
        },
        selectMemberList(deptId) {
            let params = {
                deptId: deptId
            }
            getWorkFlowUserList(params).then(res => {
                this.memberList = res.dataList;
                this.init();
            })
        },
        handleApproveListByTempList(tempList, type) {
            this.approveList && this.approveList.forEach((item, index) => {
                let existFlag = false;
                tempList.forEach(tItem => {
                    if ((item.type == tItem.type) && (item.id == tItem.id)) {
                        existFlag = true
                    }
                })
                if (!existFlag && type == item.type) {
                    this.approveList.splice(index, 1);
                }
            })
            tempList.forEach(tItem => {
                let existFlag = false;
                this.approveList && this.approveList.forEach((item, index) => {
                    if ((item.type == tItem.type) && (item.id == tItem.id)) {
                        existFlag = true
                    }
                })
                if (!existFlag) {
                    this.approveList.push(tItem)
                }
            })
            console.log('---------this.approveList',this.approveList)
        },
        onCheckDept(checkedKeys, info) {
            if (info.checked && info.checkedNodes) {
                let tempList = []
                info.checkedNodes.forEach(cItem => {
                    let props = cItem.data.props;
                    let aItem = {
                        id: props.id,
                        name: props.name,
                        type: props.type
                    }
                    tempList.push(aItem)
                })
                this.handleApproveListByTempList(tempList, "dept")
            } else {
                //从approveList里面移除
                let tempList = [];
                checkedKeys.checked.forEach(item => {
                    let aItem = {
                        id: item,
                        type: 'dept'
                    }
                    tempList.push(aItem)
                })
                this.handleApproveListByTempList(tempList, "dept")
            }
        },
        onChange(e) {
            console.log(`checked `, e, this.memberList);
            let tempList = [];
            this.userCheckAll = true;
            this.currentUserCheck = 0;
            this.memberList.forEach(item => {
                if (item.checked) {
                    let aItem = {
                        id: item.id,
                        name: item.name,
                        type: "user"
                    }
                    this.userCheckedKeys.push(aItem)
                } else {
                    this.userCheckedKeys.forEach((uItem,uIndex)=>{
                        if(uItem.id==item.id){
                            this.userCheckedKeys.splice(uIndex,1)
                        }
                    })
                    this.userCheckAll = false
                }
            })
            this.handleApproveListByTempList(this.userCheckedKeys, "user")
            this.currentUserCheck = tempList.length;
            this.indeterminate = this.userCheckAll;
        },
        echoUserCheck(){
            this.currentUserCheck = 0;
            this.memberList.forEach(item => {
                if (item.checked) {
                    this.currentUserCheck+=1;
                } 
            })
        },
        onChangeAll(e) {
            // 判断 allcheck 就反选，不然就全选
            let allCheck = true
            this.memberList.forEach(item => {
                if (!item.checked) {
                    allCheck = false
                }
            });
            if (allCheck) {
                this.memberList.forEach(item => {
                    item.checked = false
                });
            }
        },
    },
};
</script>

<style lang="scss">
.add-var {
    color: #409eff;
}
.delete-item {
    font-size: 20px;
    margin: 20px;
    cursor: pointer;
}
.el-tag + .el-tag {
    margin-left: 10px;
}
.scope-tag {
    cursor: pointer;
}
.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
.approve-list {
    height: 80px;
    border: 1px dashed #d7d9dc;
    padding: 5px 10px;
    overflow-y: auto;
}
.approve-list-tag {
    margin: 5px;
    line-height: 22px;
}
.member-div {
    display: inline-block;
    width: 50%;
    height: 100%;
}
.member-div-all {
    cursor: pointer;
    height: 30px;
    line-height: 30px;
}
.member-total {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #e1e3e5;
}
.member-item {
    height: 30px;
    line-height: 30px;
    display: flex;
    justify-content: space-between;
}
</style>