<template>
  <el-row id="card-row">
    <transition name="bounce">
      <el-col :span="4" v-if="MacHeader !== ''">
        <div class="card mac-header" :class="sendingStatus">MacHeader</div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4" v-if="IPHeader !== ''">
        <div class="card mac-header" :class="sendingStatus">IPHeader</div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4" v-if="TCPHeader !== ''">
        <div class="card mac-header" :class="sendingStatus">TCPHeader</div>
      </el-col>
    </transition>
    <transition name="bounce">
      <el-col :span="4" v-if="UDPHeader !== ''">
        <div class="card mac-header" :class="sendingStatus">UDPHeader</div>
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
</template>

<script>
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
      funcForStep: [
        () => {
          if (this.protocol === "TCP") this.TCPHeader = "1";
          else this.UDPHeader = "1";
        },
        () => {
          this.IPHeader = "1";
        },
        () => {
          this.MacHeader = "1";
        },
        () => {
          this.padding = "1";
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
<style scoped>
.card {
  border: 1px;
  background: #409eff77;
  height: 100px;
  line-height: 100px;
  border-radius: 30px;
  box-shadow: 0 0 25px #1405e21b;
  transition: all 1000ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
