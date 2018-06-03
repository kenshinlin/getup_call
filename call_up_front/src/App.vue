<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size:14px;
}
.word-break{word-break:break-all;}
.text-link{ color: #175199; outline: none;}
.text-gray{color: #8590a6;}
.text-danger{color:#ed3f14;}
.text-primary{color:#f90;}
.text-large{font-size: 24px;}
.text-middle{font-size: 16px;}
.text-center{text-align:center;}
.text-bold{font-weight:bold;}
.no-margin-top{margin-top: 0;}


.vertical-center-modal{
    display: flex;
    align-items: center;
    justify-content: center;
}

.vertical-center-modal .ivu-modal{
    top: 0;
}

.avatar{
  width: 40px;
  height:40px;
  object-fit:cover;
  border-radius:4px;
  vertical-align:middle;
  margin-right: 6px
}

.float-left{float:left;}
.float-right{float:right;}
</style>
