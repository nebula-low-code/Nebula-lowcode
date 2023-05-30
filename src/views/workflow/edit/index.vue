<template>
  <div class="workflow-wrap">
    <a-page-header @back="goBack" title="工作流编辑页面">
      <template slot="extra">
        <a-button
          type="text"
          class="save_btn"
          icon="save"
          @click="saveData"
        >
          保存
        </a-button>
      </template>
    </a-page-header>

    <div class="split-pane-page-wrapper right-menu-div">
      <div slot="left" class="pane left-pane">
        <div id="drag-items" class="shapes">
          <a-collapse
            v-model="collapseActives"
            @change="handleChange"
            class="aside-menu drag-shape"
          >
            <a-collapse-panel
              :title="aside.label"
              :name="key"
              v-for="(aside, key) in mList"
              :key="key"
              :header="aside.label"
            >
              <draggable
                tag="ul"
                class="menu-item-wrap"
                handle=".handle"
                :list="aside.componentList"
                v-bind="{
                  sort: false,
                }"
                @end="onDragMoveEnd"
                @start="onDragMoveStart($event, aside.componentList)"
              >
                <li
                  v-for="(componentConfig, configKey) in aside.componentList"
                  :key="configKey"
                  class="handle"
                >
                  <div class="drag-shape-img">
                    <img
                      class="drag-shape-icon"
                      :data-shape-type="componentConfig.type"
                      :data-shape-name="componentConfig.name"
                      :src="componentConfig.url"
                    />
                  </div>

                  <div class="icon-text">
                    <span>{{ componentConfig.name }}</span>
                  </div>
                </li>
              </draggable>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
      <div
        slot="middle"
        class="pane middle-pane middle-wrap"
        style="overflow: auto"
      >
        <div id="container" style="background-color: white"></div>
        <div id="menu">
          <div>
            <!-- <button id="pulse-button" @click="configDiagram">配置</button>
            <button id="pulse-button" @click="copyDiagram">复制</button>-->
            <button id="delete-button" @click="deleteDiagram">删除</button>
          </div>
        </div>
        <div class="r-menu"></div>
      </div>
      <a-drawer
        :title="drawerTitle"
        :visible.sync="drawer"
        direction="rtl"
        width="40%"
        :wrap-style="{ position: 'absolute' }"
        :body-style="{ padding: 0 }"
        @close="handleDrawerClose"
      >
        <RightMenu
          ref="rightMenu"
          :curDiagram="curDiagram"
          :deviceDesignType="deviceDesignType"
          :interfaceApiAll="interfaceApiAll"
          :interfaceApiNewAll="interfaceApiNewAll"
          :hrefPageList="hrefPageList"
        />
      </a-drawer>
    </div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { pcMenuList, mobileMenuList, workFlowList } from "./left-menu/menu";
import Draggable from "vuedraggable";
import RightMenu from "./right-menu/event-item.vue";
import {
  getConnectListService,
  getConnectProcessListService,
} from "@/api/database.js";

import SplitPane from "./split-pane";
import Konva from "konva";
import EventFlow from "./eventFlow";
import { getReportInterfaceList } from "@/api/chartsData";
import { getProcessParamService } from "@/api/process";
import {
  getReportTreeListV5Service,
  getProjectFileTreeListV5Service,
} from "@/api/v5";

import { workFlowDetail, addWorkFlow } from "@/api/workflow/index";
export default {
  name: "addRole",
  props: {
    id: {
      type: String | Number,
      default: "",
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: "",
    },
  },
  components: {
    SplitPane,
    RightMenu,
    Draggable,
  },
  data() {
    return {
      listLoading: false,
      drawer: false,
      drawerTitle: "",
      authorityAllListTree: [],
      roleInfo: {
        roleName: "",
        roleExplain: "",
        authIdList: [],
      },
      nextflow: undefined,
      roleList: [],
      checkKeys: [],
      isEdit: true,
      collapseActives: [0, 1, 2, 3, 4],
      mList: [],
      draggingNode: "",
      draggingNodeName: "",
      curDiagram: {},
      selectedDiagram: {},
      interfaceApiAll: [],
      interfaceApiNewAll: [],
      hrefPageList: [],
      eventList: [],
      deviceDesignType: "pc",
      // linearComponentList:[],
      // refreshComponentList:[],
    };
  },
  computed: {
    // isShowDialog: {
    //   get() {
    //     return this.dialogVisible;
    //   },
    //   set(val) {
    //     this.$emit("update:dialogVisible", val);
    //   },
    // },
    ...mapGetters(["projectId"]),
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.dialogOpen();
    });
  },
  destroyed() {
    window.removeEventListener("drop", this.drop, false);
    this.nextflow.destroyChildren();
  },
  methods: {
    handleChange() {},
    save() {
      this.listLoading = false;
    },
    // syncData(data) {
    //   console.log("config data", JSON.stringify(data), this.curDiagram);

    //   //设置当前Diagram的名称
    //   if (data.title) {
    //     if (data.title.length > 12) {
    //       this.$message.error("节点名称不能超过12个字");
    //     } else {
    //       this.curDiagram.setTitle(data, this.curDiagram.type, data.title);
    //       delete data.title;
    //     }
    //   }
    //   this.curDiagram.properties = data;

    //   this.showWindowBDrawer = false; // 显示可拖动抽屉
    //   this.curDiagram = {};

    //   //      this.saveData()
    // },
    dialogOpen() {
      this.mList = workFlowList;
      this.deviceDesignType = "PC";
      this.initFlow();
      // 初始化 接口，页面以及流程中使用的接口（返回值）
      // this.queryInterfaceDataList();
      this.initInterfaceApiAll();
      this.queryReportList();
    },

    queryProcessApiParamAndRes(id, currentActionItem) {
      const data = {
        processId: id,
      };
      getProcessParamService(data).then((res) => {
        let paramsList = res.data.params;
        paramsList &&
          paramsList.forEach((item) => {
            // 去重
            let paramExist = false;
            currentActionItem.interfaceDataConfig.paramsConfigs.forEach(
              (pItem) => {
                if (pItem.paramName == item.name) {
                  paramExist = true;
                }
              }
            );
            if (!paramExist) {
              let param = {
                paramName: item.name,
              };
              currentActionItem.interfaceDataConfig.paramsConfigs.push(param);
            }
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
        this.$pageDataModelEngine.saveCustomInterfaceData(id, obj);
      });
    },
    saveData() {
      var configJson = this.nextflow.export();
      console.log("flow data:", configJson);
      let scheme = {
        nodes: configJson.nodes,
      };

      let params = {
        workflowName: this.processName,
        scheme: JSON.stringify(scheme),
      };
      if (this.id) {
        params.id = this.id;
      }
      addWorkFlow(params).then((res) => {
        this.$message({
          message: "保存成功",
          type: "success",
        });
      });
    },
    goBack() {
      this.$emit("goBack");
    },
    // 阿八八八阿巴（添加第三方接口作为可选项）TODO:: 待优化  @宇清 检查代码
    initInterfaceApiAll() {
      this.interfaceApiNewAll = [];
      this.queryInterfaceDataList();
      this.getConnectList();
    },
    getConnectList() {
      getConnectListService().then((res) => {
        if (res.code == 0) {
          const connectList = res.dataList;
          connectList.forEach((item, index) => {
            let dataList = [];
            this.interfaceApiNewAll.push({
              dataType: "directory",
              name: item.name,
              queryId: index + 2,
              rank: index + 2,
              treeId: index + 2,
              children: dataList,
            });
            getConnectProcessListService({
              connectId: item.id,
            }).then((res) => {
              const connectProcessList = res.dataList || [];
              connectProcessList.forEach((item) => {
                dataList.push(item);
              });
            });
          });
        }
      });
    },
    // 获取接口数据列表
    queryInterfaceDataList() {
      return getProjectFileTreeListV5Service().then((res) => {
        this.interfaceApiAll = res.dataList;
        this.interfaceApiNewAll.push({
          dataType: "directory",
          name: "后端接口",
          queryId: 1,
          rank: 1,
          treeId: 1,
          children: res.dataList || [],
        });
      });
    },
    queryReportList() {
      const data = {
        queryType: this.deviceDesignType,
      };
      getReportTreeListV5Service(data).then((res) => {
        this.hrefPageList = res.dataList || [];
      });
    },
    initFlow() {
      let _this = this;
      this.$nextTick(() => {
        var a = Konva;
        var width = document.body.clientWidth - 660;
        var height = 600;
        _this.nextflow = new EventFlow(width, height);

        _this.draggingNode = null;
        _this.draggingNodeName = null;
        // document
        //   .getElementById("drag-items")
        //   .addEventListener("dragstart", _this.dragStart);

        var con = _this.nextflow.stage.container();
        con.addEventListener("dragover", function (e) {
          e.preventDefault(); // !important
        });

        con.addEventListener("drop", _this.drop);

        let nextflow = _this.nextflow;
        let currentShape;

        _this.nextflow.on("click", _this.onSelect);

        var menuNode = document.getElementById("menu");

        window.addEventListener("click", (e) => {
          // hide menu
          menuNode.style.display = "none";
        });
        nextflow.stage.on("click", function (e) {
          if (!e.target.parent) {
            console.log("stage click");
            _this.drawer = false;
          }
        });

        nextflow.stage.on("contextmenu", function (e) {
          // prevent default behavior
          e.evt.preventDefault();
          if (e.target === nextflow.stage) {
            return;
          }
          currentShape = e.target.parent;
          _this.selectedDiagram = currentShape.diagram;
          if (
            _this.selectedDiagram !== undefined &&
            _this.selectedDiagram.type === "start"
          ) {
            _this.showDelete = false;
          } else {
            _this.showDelete = true;
          }
          // show menu
          menuNode.style.display = "initial";

          let pos = currentShape.absolutePosition();
          menuNode.style.top = pos.y + 10 + "px"; // currentShape. nextflow.stage.getPointerPosition().y + 10 +'px';
          menuNode.style.left = pos.x + 44 + "px"; // nextflow.stage.getPointerPosition().x + 10 + 'px';
        });

        let param = {
          businessId: this.id,
        };
        workFlowDetail(param).then((res) => {
          console.log("-------------", res);
          this.nextflow.destroyChildren();
          let scheme = JSON.parse(res.data.scheme);
          this.nextflow.import(scheme);
        });
      });
    },
    initEventFlow() {},
    drop(e) {
      var _this = this;
      e.preventDefault();
      _this.nextflow.stage.setPointersPositions(e);
      const pos = _this.nextflow.stage.getPointerPosition();
      _this.nextflow.createDiagram(
        _this.draggingNode,
        _this.draggingNodeName,
        pos.x,
        pos.y
      );
    },
    onSelect(diagram) {
      let _this = this;
      this.drawer = true;
      this.curDiagram = diagram;
      this.drawerTitle = diagram.properties.name;
      this.$nextTick((item) => {
        _this.$refs["rightMenu"].init(diagram);
        // this.selectedDiagram = diagram;
        // this.showWindowType = diagram.type; // 获取节点类型
        // this.showWindowSubType = diagram.subType;
        // this.showWindowBDrawer = true; // 显示可拖动抽屉
      });
    },
    deleteDiagram: function () {
      var r = confirm("是否删除该组件?");
      if (r == true) {
        if (this.selectedDiagram !== undefined) {
          //删除组件的时候，需要将对应的变量一起删除
          this.nextflow.deleteDiagram(this.selectedDiagram);
        }
      }
    },
    getNodeData(target, attr) {
      var node = target.attributes[attr];
      if (node) {
        return node.nodeValue;
      } else {
        return "";
      }
    },
    handleClose() {
      this.isShowDialog = false;
      let configJson = this.nextflow.export();
      this.$emit("eventSave", configJson.nodes);
    },
    handleDrawerClose() {
      this.drawer = false;
      console.log("config data", this.curDiagram);
      if (this.curDiagram.properties.name) {
        if (this.curDiagram.properties.name.length > 12) {
          this.$message({
            message: "节点名称不能超过12个字",
            type: "error",
          });
        } else {
          this.curDiagram.setTitle(
            this.curDiagram.properties,
            this.curDiagram.type,
            this.curDiagram.properties.name
          );
        }
      }
      this.curDiagram.title = this.curDiagram = {};

      //      this.saveData()
    },
    onDragMoveEnd() {},
    onDragMoveStart(e) {
      console.log("onDragMoveStart", e);
      var _this = this;
      var imgs = e.item.getElementsByClassName("drag-shape-icon");
      if (imgs !== undefined && imgs.length > 0) {
        _this.draggingNode = _this.getNodeData(imgs[0], "data-shape-type");
        _this.draggingNodeName = _this.getNodeData(imgs[0], "data-shape-name");
      }
    },
  },
};
</script>
<style lang="scss">
.workflow-wrap {
  padding: 0 16px;
  .header_left {
    -webkit-box-flex: 0;
    -ms-flex: 0;
    flex: 0;
  }
  .header_right {
    width: 100%;
    text-align: center;
  }
}
</style>
<style lang="less" scoped>

.new-role {
  float: right;
}
.split-pane-page-wrapper {
  display: flex;
  border-top: 1px solid #e0e0e0;
  // height:100%
  .pane {
    width: 100%;
    height: 100%;

    &.left-pane {
      background: white;
      width: 260px;
      flex-shrink: 0;
      /*padding-top: 20px;*/
    }
    &.middle-pane {
      position: relative;
      background: white;
      padding: 10px;
      box-shadow: 0 0 2px 1px #ccc;
      border-radius: 5px;
    }

    &.right-pane {
      width: 315px;
      padding-left: 10px;
      flex-shrink: 0;
    }

    &.top-pane {
      background: sandybrown;
    }

    &.bottom-pane {
      background: palevioletred;
    }
  }
  .center-middle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .custom-trigger {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #000000;
    position: absolute;
    .center-middle;
    box-shadow: 0 0 6px 0 rgba(28, 36, 56, 0.4);

    i.trigger-icon {
      .center-middle;
    }
  }
}
.aside-collapse-title {
  padding-left: 20px;
  font-size: 14px;
  font-weight: bold;
}

.shapes {
  align-items: center;
  /*display: flex;
    flex-direction: column;
    display: -webkit-flex;
    -webkit-flex-direction: column;  */
  -webkit-touch-callout: none;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  .dragdrop-cursor {
    cursor: move !important;
  }

  .drag-shape {
    overflow: hidden;
    padding: 0px;

    // height: 50px;
    // line-height:50px;
    // text-align: center;
    .drag-shape-img {
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    span {
      text-align: center;
    }
  }
  li {
    width: 33%;
    display: inline-block;
    padding: 5px;
    &:hover {
      color: #409eff;
      border: 1px dashed #409eff;
      margin: -1px;
      cursor: pointer;
    }
  }
  /deep/.a-collapse-item__content {
    padding-top: 1px;
    padding-left: 1px;
  }
}

.menu-item-wrap {
  padding: 0 10px;
  height:540px;
  li {
    display: inline-flex;
    //display: flex;
    flex-direction: row;
    width: 46%;
    margin: 0 8px 8px 0;
    //text-align: center;
    color: #666;
    cursor: pointer;
    border: 1px solid #e5e6e8;
    border-radius: 6px;
    padding: 0 8px;
    height: 36px;

    &:hover {
      color: #409eff;
      border: 1px dashed #409eff;
      margin: 0 8px 8px 0;
    }

    .iconfont {
      //font-size: 45px;
      font-size: 12px;
      line-height: 36px;
    }

    .icon-text {
      font-size: 12px;
      line-height: 36px;
      margin-left: 8px;
      white-space: nowrap;
      //margin-top: -12px;
    }
  }
}

.drag-shape-icon {
  width: 16px;
  height: 36px;
  margin: auto;
}


#menu {
  display: none;
  position: absolute;
  width: 60px;
  background-color: white;
  box-shadow: 0 0 5px grey;
  border-radius: 3px;
}

#menu span {
  display: inline-block;
}
#menu button {
  width: 100%;
  background-color: white;
  border: none;
  margin: 0;
  padding: 10px;
  color: #333333;
}

#menu button:hover {
  background-color: #17678b;
}

</style>
