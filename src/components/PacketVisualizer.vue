<template>
  <el-row id="card-row">
    <transition name="bounce">
      <el-col :span="4" v-if="MacHeader !== ''">
        <div
          class="card mac-header"
          :class="sendingStatus"
          @click="MacExplanationDisp = true"
        >
          MacHeader
        </div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4" v-if="IPHeader !== ''">
        <div
          class="card ip-header"
          :class="sendingStatus"
          @click="IPExplanationDisp = true"
        >
          IPHeader
        </div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4" v-if="TCPHeader !== ''">
        <div
          class="card tcp-header"
          :class="sendingStatus"
          @click="TCPExplanationDisp = true"
        >
          TCPHeader
        </div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4" v-if="UDPHeader !== ''">
        <div
          class="card udp-header"
          :class="sendingStatus"
          @click="UDPExplanationDisp = true"
        >
          UDPHeader
        </div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4">
        <div class="card data" :class="sendingStatus">
          {{ data.length > 18 ? data.slice(0, 15) + "..." : data }}
        </div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4" v-if="padding !== ''">
        <div class="card data" :class="sendingStatus">padding</div>
      </el-col>
    </transition>
  </el-row>
  <el-row>
    <el-button
      id="primary-btn"
      type="primary"
      @click="nxtStep()"
      :disabled="curStep === funcForStep.length"
    >
      {{ buttonText[curStep]() }}
    </el-button>
    <el-button @click="reset()">重置 </el-button>
  </el-row>

  <el-dialog title="TCP报头" v-model="TCPExplanationDisp">
    <el-descriptions border>
      <el-descriptions-item
        v-for="(explanation, index) in TCPExplanation"
        :key="index"
        :label="explanation.key"
      >
        <el-tooltip
          effect="light"
          v-if="explanation.desc"
          :content="explanation.desc"
        >
          <el-tag>
            {{ valueToHex(explanation.value) }}
          </el-tag>
        </el-tooltip>
        <el-tag v-else>
          {{ valueToHex(explanation.value) }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
  <el-dialog title="UDP报头" v-model="UDPExplanationDisp"
    ><el-descriptions border>
      <el-descriptions-item
        v-for="(explanation, index) in UDPExplanation"
        :key="index"
        :label="explanation.key"
        >{{ valueToHex(explanation.value) }}</el-descriptions-item
      >
    </el-descriptions></el-dialog
  >
  <el-dialog title="IP报头" v-model="IPExplanationDisp"
    ><el-descriptions border>
      <el-descriptions-item
        v-for="(explanation, index) in IPExplanation"
        :key="index"
        :label="explanation.key"
        >{{ valueToHex(explanation.value) }}</el-descriptions-item
      >
    </el-descriptions></el-dialog
  >
  <el-dialog title="Mac报头" v-model="MacExplanationDisp"
    ><el-descriptions border>
      <el-descriptions-item
        v-for="(explanation, index) in MacExplanation"
        :key="index"
        :label="explanation.key"
        >{{ valueToHex(explanation.value) }}</el-descriptions-item
      >
    </el-descriptions></el-dialog
  >
</template>

<script>
const toHex = (v) => {
  let res = "";
  while (v != 0) {
    let u = v % 16;
    res += u < 10 ? u : String.fromCharCode(u - 10 + "A".charCodeAt(0));
    v >>>= 4;
  }
  return res === "" ? "0" : res;
};

import {
  getTCPHeaderInfo,
  getUDPHeaderInfo,
  getIPHeaderInfo,
  getEthernetHeaderInfo,
} from "./Add.js";

export default {
  name: "PacketVisualizer",
  props: {
    data: String,
    protocol: String,
    srcIP: String,
    dstIP: String,
    srcPort: String,
    dstPort: String,
    srcMac: String,
    dstMac: String,
  },
  computed: {
    sendingStatus() {
      return {
        "pack-sended": this.isSended,
      };
    },
    runningStatus() {
      return {
        "btn-finished": this.curStep === this.funcForStep.length - 1,
      };
    },
  },
  data: function () {
    return {
      TCPHeader: "",
      UDPHeader: "",
      IPHeader: "",
      MacHeader: "",
      padding: "",
      curStep: 0,
      curData: "",
      funcForStep: [
        () => {
          if (this.protocol === "TCP") {
            const ret = getTCPHeaderInfo(this.srcPort, this.dstPort);
            this.TCPHeader = ret.TCPHeader;
            this.curData = this.TCPHeader + this.data;
            this.TCPExplanation = ret.explanation;
          } else {
            const ret = getUDPHeaderInfo(this.data, this.srcPort, this.dstPort);
            this.UDPHeader = ret.UDPHeader;
            this.curData = this.UDPHeader + this.data;
            this.UDPExplanation = ret.explanation;
          }
        },
        () => {
          const ret = getIPHeaderInfo(this.srcIP, this.dstIP, this.curData);
          this.IPHeader = ret.IPHeader;
          //console.log(this.IPHeader);
          this.curData = this.IPHeader + this.curData;
          this.IPExplanation = ret.explanation;
        },
        () => {
          const ret = getEthernetHeaderInfo(this.srcMac, this.dstMac);
          this.MacHeader = ret.EthernetHeader;
          this.curData = this.MacHeader + this.curData;
          this.MacExplanation = ret.explanation;
        },
        () => {
          if (this.curData.length < 60) {
            this.padding = "\0".repeat(60 - this.curData.length);
            this.curData += this.padding;
          }
        },
        () => {
          this.isSended = true;
        },
        () => {
          this.MacHeader = this.padding = "";
        },
        () => {
          this.IPHeader = "";
        },
        () => {
          this.TCPHeader = this.UDPHeader = "";
          this.$message({
            type: "success",
            message: "传输完成！",
          });
        },
      ],
      buttonText: [
        () => (this.protocol === "TCP" ? "添加TCP头" : "添加UDP头"),
        () => "添加IP头",
        () => "添加以太网头",
        () => "填充帧",
        () => "发送",
        () => "解析以太网头",
        () => "解析IP头",
        () => (this.protocol === "TCP" ? "解析TCP头" : "解析UDP头"),
        () => "传输完成",
      ],
      TCPExplanation: [],
      UDPExplanation: [],
      IPExplanation: [],
      MacExplanation: [],
      TCPExplanationDisp: false,
      UDPExplanationDisp: false,
      IPExplanationDisp: false,
      MacExplanationDisp: false,
      isSended: false,
    };
  },
  methods: {
    nxtStep() {
      if (this.curStep < this.funcForStep.length) {
        this.funcForStep[this.curStep++]();
      }
    },
    reset() {
      this.curStep = 0;
      this.TCPHeader = this.UDPHeader = this.IPHeader = this.MacHeader = this.padding =
        "";
      this.isSended = false;
    },
    valueToHex(value) {
      //console.log(typeof value);
      if (typeof value === "string") {
        let res = "";
        for (let index = 0; index < value.length; index++) {
          let tmp = toHex(value.charCodeAt(index));
          if (tmp.length === 1) {
            tmp = "0" + tmp;
          }
          res += tmp + " ";
        }
        return res.trim();
      } else {
        return toHex(Number(value));
      }
    },
  },

  /*
  computed: {
    getDataTransform() {
      return "transform: translate({0}px, {1}px);".format(
        this.IPHeader === "" ? 
      );
    },
  },*/
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.card {
  border: 1px;
  background: #409eff77;
  height: 100px;
  line-height: 100px;
  border-radius: 30px;
  box-shadow: 0 0 25px #1405e21b;
  transition: all 1000ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

#app > section > section > main > div > div > div.el-dialog__header {
  padding: 30px 20px 0px;
}

.tcp-header,
.udp-header,
.ip-header,
.mac-header {
  cursor: pointer;
}

.pack-sended {
  background: #67c23aaa;
  transform: translateY(175px);
}

.el-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-tag {
  display: inline-flex;
  align-self: center;
}

#card-row {
  margin-top: 100px;
  margin-bottom: 250px;
  align-content: center;
}

#primary-btn {
  width: 120px;
}

.btn-finished {
  background: #909399;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
