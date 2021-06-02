<template>
  <el-container>
    <el-header>数据包传输</el-header>
    <el-container>
      <el-main>
        
        <el-row :gutter="12">
          <el-col :span="6"> MAC frame header </el-col>
          <el-col :span="6"> IP header </el-col>
          <el-col :span="6"> {{ protocol }} header </el-col>
          <el-col :span="6"> message </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="6"> MAC frame header </el-col>
          <el-col :span="6"> IP header </el-col>
          <el-col :span="6"> {{ protocol }} header </el-col>
          <el-col :span="6"> message </el-col>
        </el-row>
      
        
      </el-main>
      <el-aside width="200px">Aside</el-aside>
    </el-container>
  </el-container>
</template>

<script>

export default {
  name: "HelloWorld",
  props: {
    msg: String,
    protocol: String,
  }
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
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

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

body > .el-container {
  margin-bottom: 40px;
}
</style>
