<template>
    <div style="padding-left: 20px" class="group-wrap">
        <a-form :layout="formLayout" label-width="70px" class="label-left">
            <a-form-item prop="name" label="节点名称" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <a-input v-model="singleActionItem.name" style="width:180px" @input="inputchange"></a-input>
            </a-form-item>
            <!-- 审批节点 -->
            <div v-if="singleActionItem.actionType === 'work-flow-approval'">
                <a-form-item prop="name" label="审批人" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                    <div class="approve-list" @click="showApproveByDialog">
                        <span class="approve-text" v-if="!singleActionItem.approveList||singleActionItem.approveList.length==0">点击设置审批人</span>
                        <a-tag v-else class="approve-list-tag" v-for="(aItem,aindex) in singleActionItem.approveList" :key="aItem.type+aItem.id" :color="colorMap[aItem.type]" closable @close="closeTag(aindex)">
                            {{ aItem.name }}
                        </a-tag>
                    </div>
                </a-form-item>

                <a-form-item prop="name" label="审批方式" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                    <a-select v-model="singleActionItem.methods" style="width: 185px; line-height: 52px" @change="handleMethodChange">
                        <a-select-option v-for="(workItem, key) in approvalMethods" :key="key" :value="''+workItem.value">{{ workItem.name }}</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item prop="name" label="审批意见" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                    <a-checkbox v-model="singleActionItem.adoptRequired">通过时必填</a-checkbox>
                    <a-checkbox v-model="singleActionItem.rejectRequired">否定时必填</a-checkbox>
                </a-form-item>
            </div>
            <!-- 审批业务处理节点 -->
            <div style="padding-top: 10px" v-if="singleActionItem.actionType === 'work-flow-business-handler'">
                <a-form-item prop="name" label="条件服务" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                    <a-cascader 
                    v-model="singleActionItem.interfaceDataConfig.echoIds"
                    :options="interfaceApiAll"
                    :field-names="{ label: 'name', value: 'queryId', children: 'children' }"
                    placeholder="Please select" @change="changeInterface" />
                </a-form-item>
                <!-- 参数配置 -->
                <div style="padding: 10px 0 0">输入参数</div>
                <a-form-item v-for="(item, index) in singleActionItem.interfaceDataConfig
              .paramsConfigs" :key="index" :label="item.paramName" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                    <!-- TODO -->
                    <a-select v-model="item.paramValue" style="width: 180px; line-height: 52px" @change="handleBusinessChange">
                        <a-select-option v-for="(workItem, key) in workFlowParams" :key="key" :value="workItem.value" >{{ workItem.name }}</a-select-option>
                    </a-select>
                </a-form-item>
            </div>
            <!-- 审批条件节点 -->

            <div style="padding-top: 10px" v-if="singleActionItem.actionType === 'work-flow-if'">
                <div style="display:flex;justify-content: space-around;align-items: center;">
                    <valueSelect ref="valueSelect" style="width: 180px; line-height: 32px" :paramItem="singleActionItem" :isBind="true" @handleChange="handleChange" />
                    <!-- 判断 -->
                    <a-select class="menu-item-select-middle"  v-model="singleActionItem.logicOperator">
                        <a-select-option v-for="(value, key) in {
                            '=': '=',
                            '>': '>',
                            '>=': '>=',
                            '<': '<',
                            '<=': '<=',
                            '!=': '!=',
                            isNull: 'isNull',
                            isNotNull: 'isNotNull',
                        }" :key="key" :value="key">{{ value }}</a-select-option>
                    </a-select>
                    <a-input placeholder="请输入内容"  v-model="singleActionItem.logicValue" style="width: 180px;line-height:32px; ">

                    </a-input>
                </div>

                <!-- 判断之后的处理：： 因为在面板模式下不支持条件判断，只能文本显示 -->
                <!-- <div>
        {{ actionItem.logicChildren }}
      </div> -->
            </div>
        </a-form>
        <selectApproveBy ref="approveList" :dialog-visible.sync="selectVisible" :deptTreeList="deptTreeList" title="部门成员列表" @saveApprove="saveApprove" />
    </div>
</template>

<script>
/**
 * 事件行为配置
 */

import {
    getProcessApiParamsService,
    getProcesseDataList,
    getReportInterfaceList,
    getReportDetail,
} from "@/api/chartsData";

import { getProcessParamService } from "@/api/process";

import { getListAllV4 } from "@/api/report";

import valueSelect from "@/views/workflow/edit/right-menu/module/value-select.vue"
import { getWorkFlowUserTree } from "@/api/workflow/index";
import selectApproveBy from "./dialog/index"
export default {
    name: "eventActionView",
    components: {
        valueSelect,
        selectApproveBy
    },
    props: {
        actionItem: {
            type: Object,
            default: () => { },
        },
        refreshComponentList: {
            type: Array,
            default: () => [],
        },
        dialogBoxComponentList: {
            type: Array,
            default: () => [],
        },
        linearComponentList: {
            type: Array,
            default: () => [],
        },

        subpageList: {
            type: Array,
            default: () => [],
        },
        deviceDesignType: {
            type: String,
            default: "MOBILE",
        },
        interfaceApiAll: {
            type: Array,
            default: () => [],
        },
        interfaceApiNewAll: {
            type: Array,
            default: () => [],
        },
        hrefPageList: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        formItemLayout() {
            const { formLayout } = this;
            return formLayout === "horizontal"
                ? {
                    labelCol: { span: 4 },
                    wrapperCol: { span: 14 },
                }
                : {};
        }
    },
    data() {
        return {
            radio: "",
            radio1: "",
            title: "",
            formLayout: "horizontal",
            singleActionItem: {
                name: null,
            },
            userTreeList: [],
            deptTreeList: [],
            interfaceKeyList: {},
            // hrefPageList: [],
            paramsActiveNames: "",
            statusActiveNames: "",
            // interfaceApiAll: [],
            processApiParamsList: [], // 接口参数列表
            levelList: [
                {
                    name: "最高级",
                },
                {
                    name: "2级",
                },
                {
                    name: "3级",
                },
                {
                    name: "4级",
                },
                {
                    name: "5级",
                },
                {
                    name: "6级",
                },
                {
                    name: "7级",
                },
                {
                    name: "8级",
                },
                {
                    name: "9级",
                },
            ],
            workFlowParams: [
                {
                    name: "记录ID",
                    value: "log_id"
                },
                {
                    name: "审核人(上个节点)",
                    value: "approved_user"
                },
                {
                    name: "审核意见(上个节点)",
                    value: "approved_advice"
                },
                {
                    name: "发起人ID",
                    value: "start_user"
                },
            ],
            approvalMethods: [
                {
                    name: "或签（一名审批人通过或否决即可）",
                    value: "1",
                },
                {
                    name: "会签（需所有审批人通过）",
                    value: "2",
                },
                {
                    name: "会签（只需一名审批人通过，否决需全员否决）",
                    value: "3",
                },
            ],
            workFlow: {
                operateApiId: null,
                zhuji: false,
                param: "",
                methods: "1",
                page: "",
                adoptRequired: false,
                rejectRequired: false,
            },
            selectVisible: false,
            colorMap: {
                "dept": "#f50",
                "user": "#1890ff",
            },
            cascaderValueTemp:[],
        };
    },
    watch: {
        actionItem(val) {
            this.singleActionItem = val; //新增result的watch，监听变更并同步到myResult上
        },
    },
    created() {
        // // TODO 每次打开流程或者拖动一个新的组件都会调用一次，找时间优化了 ，可以放到vuex 里面去取
        // this.queryInterfaceDataList();
        // this.queryReportList();
    },
    mounted() { },
    methods: {
        init(diagram) {
            console.log("right menu init", diagram);
            this.singleActionItem = diagram.properties;
            this.title = diagram.title;
            if (!this.singleActionItem.name) {
                this.singleActionItem.name = diagram.title;
            }
            this.initUserTree();
            // // TODO 每次打开流程或者拖动一个新的组件都会调用一次，找时间优化了 ，可以放到vuex 里面去取
            // this.queryInterfaceDataList();
            // this.queryReportList();

            console.log('this.$refs["valueSelect"]', this.$refs["valueSelect"])
        },
        closeTag(index) {
            this.singleActionItem.approveList.splice(index, 1)
            console.log('----closeTag------', this.singleActionItem.approveList)
        },
        
        saveApprove(approveList) {
            console.log('----saveApprove------', approveList)
            this.singleActionItem.approveList = approveList
            console.log('----singleActionItem------', this.singleActionItem)
        },
        initUserTree() {
            getWorkFlowUserTree().then((res) => {
                this.userTreeList = res.data.data.userList;
                this.deptTreeList = res.data.data.deptList;
                console.log("--------------", res, this.userTreeList);
            });
        },
        handleMethodChange(val){
            console.log('-------handleMethodChange-------',val)
            this.$forceUpdate();
        },
        handleUserChange(data) {
            console.log("---------user", data);
            this.singleActionItem.approveUserId = "";
            data &&
                data.forEach((item) => {
                    if (item.length > 0) {
                        this.singleActionItem.approveUserId +=
                            item[item.length - 1] + ",";
                    }
                });
            if (this.singleActionItem.approveUserId.length > 0) {
                this.singleActionItem.approveUserId =
                    this.singleActionItem.approveUserId.substring(
                        0,
                        this.singleActionItem.approveUserId.length - 1
                    );
            }
            console.log(
                "---------this.singleActionItem.approveUserId----",
                this.singleActionItem.approveUserId
            );
        },
        inputchange() {
            this.$forceUpdate();
        },
        queryReportList() {
            const data = {
                parentId: 0,
                queryType: this.deviceDesignType,
            };
            getListAllV4(data).then((res) => {
                this.hrefPageList = res.dataList || [];
            });
        },
        addLinkParam() {
            let param = {
                paramName: "",
                paramsValue: "",
            };
            if (!this.singleActionItem.params) {
                this.singleActionItem.params = [];
            }

            this.singleActionItem.params.push(param);
            this.$forceUpdate();
        },
        // 获取接口数据列表
        queryInterfaceDataList() {
            getReportInterfaceList().then((res) => {
                this.interfaceApiAll = res.dataList;
            });
        },

        handleAddColumnAction(interfaceDataConfig) {
            if (!interfaceDataConfig) return false;
            if (!interfaceDataConfig.statusActionList) {
                interfaceDataConfig.statusActionList = [];
            }
            interfaceDataConfig.statusActionList.push({
                actionType: "",
                interfaceDataConfig: {
                    statusName: "",
                    statusValue: "",
                    hrefPageParams: [],
                },
            });
            this.$forceUpdate();
        },
        handleOptionsRemoveActionList(index, interfaceDataConfig) {
            interfaceDataConfig.splice(index, 1);
        },
        handleOptionsRemoveInterfaceConfig(index, interfaceDataConfig) {
            interfaceDataConfig.paramsConfigs.splice(index, 1);
        },
        handleChange(data, paramItem) {
            if (paramItem.param_value_type == "T") {
                paramItem.relevanceComponentUuid = data[1].id;
                // console.log('12341234', paramItem, data)
                if (data.length === 3) {
                    // TODO:: 待优化 目前组件有三层的是Table组件（特殊处理）
                    paramItem.param_v_key = data[2].data.value;
                }
            } else if (paramItem.param_value_type == "V") {
                paramItem.type = data[0].type;
                paramItem.param_v_key = data[1].id;
                if (data[0].type == "customInterface") {
                    paramItem.param_value = data[1].data.value;
                    paramItem.operateApiId = data[0].id;
                } else {
                    paramItem.param_value = data[1].data.value.operateHrefPageParamValue;
                }
            } else if (paramItem.param_value_type == "B") {
                paramItem.type = data[0].type;
                if (data[0].type == "radio-button-tables") {
                    paramItem.param_v_table = data[0].data.name;
                    paramItem.param_v_key = data[1].id;
                    paramItem.param_value = ""; // 接口值取不到的
                } else if (
                    data[0].type == "radio-button-interface" ||
                    data[0].type == "radio-button-connect"
                ) {
                    paramItem.param_v_name = data[0].data.name;
                    paramItem.middle = data[1].id;
                    if (data.length > 2) {
                        // 2022-02-25
                        paramItem.param_v_key = data[2].id;
                        paramItem.param_value = data[2].data.value; // 接口值取不到的
                    } else {
                        paramItem.operateApiId = data[0].id;
                    }
                }
            }
            this.$forceUpdate();
        },
        handleBusinessChange(val) {
            this.$forceUpdate();
        },
        changeImportInterface(id) {
            this.singleActionItem.interfaceDataConfig.paramsConfigs = [];
            if (id) {
                this.singleActionItem.interfaceDataConfig.operateApiId = id;
                this.queryProcessApiParamAndRes(id, "import");
            }
        },
        changeInterface(ids) {
            this.singleActionItem.interfaceDataConfig.echoIds = ids;
            let id = ids[ids.length-1];
            this.singleActionItem.interfaceDataConfig.paramsConfigs = [];
            if (id) {
                this.singleActionItem.interfaceDataConfig.operateApiId = id;
                this.queryProcessApiParamAndRes(id);
            }
        },
        queryProcessApiParamAndRes(id, type) {
            const data = {
                processId: id,
            };
            getProcessParamService(data).then((res) => {
                let paramsList = res.data.params;
                paramsList &&
                    paramsList.forEach((item) => {
                        let param = {
                            paramName: item.name,
                            paramValue: "",
                        };
                        if (type == "import") {
                            param.custom = item.custom || false;
                        }
                        this.singleActionItem.interfaceDataConfig.paramsConfigs.push(param);
                    });
                this.$forceUpdate();
                let interfaceName = res.data.processName;
                let obj = {
                    label: interfaceName, // 依次判断数据接口、数据表、数据集
                    value: {
                        type: "customInterface",
                        id: id,
                        // data: res.data
                    },
                    children: [],
                };
                res.data.res &&
                    res.data.res.forEach((rItem) => {
                        let children = {
                            label: rItem.name,
                            value: {
                                type: "customInterface",
                                id: rItem.name,
                                data: {
                                    value: "",
                                },
                            },
                        };
                        obj.children.push(children);
                    });
                this.$pageDataModelEngine.saveWorkflowInterfaceData(id, obj);
            });
        },

        // 获取接口数据入参
        queryProcessApiParamsService(id) {
            getProcessApiParamsService({ id }).then((res) => {
                let paramsList = res.data.params;
                paramsList &&
                    paramsList.forEach((item) => {
                        let param = {
                            paramName: item.name,
                            paramValue: "",
                        };
                        this.singleActionItem.interfaceDataConfig.paramsConfigs.push(param);
                    });
                this.$forceUpdate();
            });
        },
        queryProcessApiResService(id) {
            const data = {
                dataApiId: id,
                params: {},
            };
            getProcesseDataList(data).then((res) => {
                if (res.code === 0) {
                    this.interfaceKeyList = [];

                    // 2021-12-18 按照新逻辑 存取
                    let interfaceName;
                    this.interfaceApiAll.forEach((iItem) => {
                        if (iItem.id == id) {
                            interfaceName = iItem.name;
                        }
                    });
                    let obj = {
                        label: interfaceName, // 依次判断数据接口、数据表、数据集
                        value: {
                            type: "customInterface",
                            id: id,
                            // data: res.data
                        },
                        children: [],
                    };
                    for (const i in res.data) {
                        this.interfaceKeyList.push(i);
                        let paramValue = {
                            type: "interface",
                            operateApiId:
                                this.singleActionItem.interfaceDataConfig.operateApiId,
                        };
                        let children = {
                            label: i,
                            value: {
                                type: "customInterface",
                                id: i,
                                data: {
                                    value: res.data[i],
                                },
                            },
                        };
                        obj.children.push(children);
                    }
                    this.$pageDataModelEngine.saveWorkflowInterfaceData(id, obj);
                } else {
                    this.$message.error(res.message);
                }
            });
        },
        handleHrefPage(reportId) {
            if (reportId) {
                const data = {
                    reportId: reportId,
                };
                getReportDetail(data)
                    .then((res) => {
                        let data = res.data || {};
                        // 上传组件存类型
                        let configJson = JSON.parse(data.configJson || "{}");

                        let paramList = configJson.config.pageParamsList;
                        this.singleActionItem.interfaceDataConfig.hrefPageParams = [];
                        paramList &&
                            paramList.forEach((param) => {
                                let data = {
                                    operateHrefPageParamName: param.operateHrefPageParamName,
                                };
                                this.singleActionItem.interfaceDataConfig.hrefPageParams.push(
                                    data
                                );
                            });
                        this.$forceUpdate();
                    })
                    .catch(() => {
                        // 上传组件失败存类型
                        setStorage("subType", "");
                    });
            } else {
                this.singleActionItem.interfaceDataConfig.hrefPageParams = [];
            }
        },

        chosenParam(item, radioItem) {
            item.param_value_type = radioItem.value;
            this.$forceUpdate();
        },
        saveActionSet(val) {
            this.singleActionItem.actionSet = val;
        },
        savePopupValue(val) {
            this.singleActionItem.popupBody = val;
        },
        change() {
            this.$forceUpdate(); // 偶尔输入不了
        },
        changeLink() {
            if (this.singleActionItem.dynamic) {
                this.singleActionItem.linkDynamic = {};
            }
        },
        showApproveByDialog() {
            this.selectVisible = true;
            if(!this.singleActionItem.approveList){
                this.singleActionItem.approveList=[];
            }
            this.$refs['approveList'].dialogOpen(JSON.parse(JSON.stringify(this.singleActionItem.approveList)) || [])
            // console.log('---------++++',)
        },
    },
};
</script>

<style lang="scss" scoped>
.panel-del-btn {
    position: absolute;
    right: 5px;
    padding: 4px;
}


// 覆写el-label
.label-left /deep/.a-form-item__label {
    float: left;
    line-height: 52px;
}
.review-div {
    margin-top: 10px;
}
.link-div {
    display: flex;
    align-items: center;
}
.link-operator {
    font-size: 18px;
    margin-left: 10px;
}
/deep/.a-form-item--small .el-radio {
    margin-right: 10px;
    line-height: 52px !important;
}
/deep/.a-form-item__content {
    line-height: 52px !important;
}
/deep/.a-form-item {
    margin-bottom: 10px;
}
.group-wrap {
    /deep/.a-input {
        width: 160px;
        line-height: 40px;
    }
    /deep/.a-input--suffix {
        width: 100%;
    }
    /deep/.a-select {
        width: 100%;
    }
    /deep/.menu-item-select-middle {
        width: 90px;
    }
    .menu-item-select-middle {
        /deep/.a-input {
            width: 100%;
        }
    }
}
.setting-apprival {
    cursor: pointer;
}
.approve-list {
    line-height: 22px !important;
    margin-right: 10px;
}
.approve-text {
    text-align: center;
    line-height: 68px;
    display: block;
    width: 100%;
    cursor: pointer;
}
.approve-list-tag {
    margin: 5px;
}
.ant-form-item {
    margin: 0;
    margin: 20px 0;
}
</style>
