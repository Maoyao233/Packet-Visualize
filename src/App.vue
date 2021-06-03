<template>
<<<<<<< HEAD
  <div class="container border">
    <div class="d-flex justify-content-center" id="p5Canvas"></div>
  </div>
</template>

<script>
//import HelloWorld from "./components/HelloWorld.vue";
//import VueP5 from "vue-p5";
//import Example from './components/Example.vue'
import P5 from "p5";

export default {
  name: "App",
  mounted() {
    // NOTE: Use p5 as an instance mode
    //const P5 = require("p5");
    new P5((p5) => {
      var speed = 2;
      var posX = 0;

      // NOTE: Set up is here
      p5.setup = () => {
        const canvas = p5.createCanvas(800, 600);
        canvas.parent("p5Canvas");

        p5.ellipse(p5.width / 2, p5.height / 2, 500, 500);
      };
      // NOTE: Draw is here
      p5.draw = () => {
        p5.background(0);
        const degree = p5.frameCount * 3;
        const y = p5.sin(p5.radians(degree)) * 50;

        p5.push();
        p5.translate(0, p5.height / 2);
        p5.ellipse(posX, y, 50, 50);
        p5.pop();
        posX += speed;

        if (posX > p5.width || posX < 0) {
          speed *= -1;
        }
      };
    });
=======
  <el-container>
    <el-header style="height: 100px"><h2>数据包传输</h2></el-header>
    <el-container>
      <el-aside>
        <el-form ref="form" :model="form" label-width="110px">
          <el-form-item label="源IP地址">
            <el-input v-model="form.srcIP"></el-input>
          </el-form-item>
          <el-form-item label="目标IP地址">
            <el-input v-model="form.dstIP"></el-input>
          </el-form-item>
          <el-form-item label="源端口">
            <el-input v-model="form.srcPort"></el-input>
          </el-form-item>
          <el-form-item label="目标端口">
            <el-input v-model="form.dstPort"></el-input>
          </el-form-item>
          <el-form-item label="源MAC地址">
            <el-input v-model="form.srcMac"></el-input>
          </el-form-item>
          <el-form-item label="目标MAC地址">
            <el-input v-model="form.dstMac"></el-input>
          </el-form-item>
          <el-form-item label="协议">
            <el-radio-group v-model="form.protocol">
              <el-radio label="TCP"></el-radio>
              <el-radio label="UDP"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="报文内容">
            <el-input type="textarea" v-model="form.data"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">确定</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-aside>
      <el-main>
        <PacketVisualizer
          ref="PacketVisualizer"
          :data="submitForm.data"
          :protocol="submitForm.protocol"
          :src-i-p="submitForm.srcIP"
          :dst-i-p="submitForm.dstIP"
          :src-port="submitForm.srcPort"
          :dst-port="submitForm.dstPort"
          :src-mac="submitForm.srcMac"
          :dst-mac="submitForm.dstMac"
      /></el-main>
    </el-container>
    <el-footer></el-footer>
  </el-container>
</template>

<script>
import PacketVisualizer from "./components/PacketVisualizer.vue";

const defaultForm = {
  srcIP: "192.168.1.1",
  dstIP: "192.168.1.2",
  srcPort: "20000",
  dstPort: "80",
  srcMac: "4D:EF:60:85:7C:D8",
  dstMac: "27:48:F4:D8:19:02",
  protocol: "TCP",
  data: "Hello world!",
};

export default {
  name: "App",
  components: {
    PacketVisualizer,
  },
  data() {
    return {
      form: {
        srcIP: "192.168.1.1",
        dstIP: "192.168.1.2",
        srcPort: "20000",
        dstPort: "80",
        srcMac: "4D:EF:60:85:7C:D8",
        dstMac: "27:48:F4:D8:19:02",
        protocol: "TCP",
        data: "Hello world!",
      },
      submitForm: {
        srcIP: "192.168.1.1",
        dstIP: "192.168.1.2",
        srcPort: "20000",
        dstPort: "80",
        srcMac: "4D:EF:60:85:7C:D8",
        dstMac: "27:48:F4:D8:19:02",
        protocol: "TCP",
        data: "Hello world!",
      },
    };
  },
  methods: {
    onSubmit() {
      this.submitForm = this.form;
      this.$refs.PacketVisualizer.reset();
    },
    onReset() {
      this.form = defaultForm;
      this.$refs.PacketVisualizer.reset();
    },
>>>>>>> ymy-test
  },
};
</script>

<style>
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-left: 200px;
  margin-right: 200px;
}
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  height: 100px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  padding-top: 20px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
}

.el-form {
  margin-right: 40px;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 160px;
}

body > .el-container {
  margin-bottom: 40px;
}
</style>
