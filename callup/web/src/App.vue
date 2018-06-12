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
body,html,#app{
  height: 100%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size:14px;
  position: relative;
}

@media screen and (min-width: 580px){
  #app{
    width: 450px;
    height: 650px;
    margin: 0 auto;
    border: 2px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 0.8571rem 1.0714rem 0 rgba(0, 0, 0, 0.24), 0 1.2143rem 3.5714rem 0 rgba(0, 0, 0, 0.19);
  }
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
    margin-top: -80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.vertical-center-modal .ivu-modal{
    top: 0;
}

.avatar{
  width: 30px;
  height:30px;
  object-fit:cover;
  border-radius:4px;
  vertical-align:middle;
  margin-right: 6px
}

.float-left{float:left;}
.float-right{float:right;}

div.ivu-modal-footer{
  display: flex;
  padding: 0;
}
div.ivu-modal-footer>button{
  flex: 1;
}

button.ivu-btn-primary,button.ivu-btn-primary:active{
  background-color: #f90;
  border-color: #f90;
}

button.ivu-btn-primary:hover{
  background-color: #f5bc6a;
  border-color: #f5bc6a;
}

div.ivu-modal-footer>button:first-child{
  /* border-radius: 0 0 0 4px; */
  display: none;
}
div.ivu-modal-footer>button:last-child{
  border-radius: 0 0 4px 4px;
  margin-left: 0;
}

div.ivu-modal-body{
  padding: 8px;
}
div .ivu-modal-close{top:3px;}
div.ivu-modal-header{padding: 10px 12px;}
</style>
