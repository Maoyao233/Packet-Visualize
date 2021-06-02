<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <el-container>
    <el-aside>
      <h4>请选择排序方式：</h4>
      <el-select v-model="sortFunc">
        <el-option
          v-for="(item,index) in func_options"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <br />
      <el-button type="primary" round v-on:click="randomizeSortArray()">随机数据</el-button>
      <el-popover placement="right" trigger="click">
        <el-slider
          v-on:change="$message({type:'success',message:'修改成功，重置动画后生效'})"
          v-model="eventDelay"
          :format-tooltip="formatToolTip"
          :max="1000"
          :min="100"
        ></el-slider>
        <el-button type="primary" round>动画速度</el-button>
      </el-popover>
      <el-progress type="circle" :percentage="percentage"></el-progress>
    </el-aside>
    <el-main>
      
    </el-main>
  </el-container>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import store from './store/index'

export default {
  name: 'App',
  store,
  components: {
    //HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
