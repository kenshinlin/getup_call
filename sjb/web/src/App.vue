<template>
  <div id="app">
    <div class="app-inner">
      <div class="page-header" :style="{height:bannerHeight+'px'}"></div>
      <router-view/>  
    </div>
    <div class="footer">
      <ul>
        <li><a href="#/home">首页</a></li>
        <li><a href="#/allgames">赛程</a></li>
        <li><a href="#/rules">规则</a></li>
        <li v-if="isAdmin"><a href="#/addgame">录入游戏</a></li>
        <li><a href="#/me">我的</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
import {ADMIN_ADDR} from './constants/'
import Cookies from 'js-cookie'

export default {
  name: 'App',
  data(){
    let isAdmin = Cookies.get('nas_wallet_address') == ADMIN_ADDR

    return {
      isAdmin,
      bannerHeight: 300
    }
  },
  created(){
    this.$Loading.config({
      color: '#19be6b',
      failedColor: '#19be6b',
      height: 5
    })
    this.$Message.config({
      top: 80,
      duration: 5
    })

    // setTimeout(()=>this.bannerHeight=30, 5000)
  }
}
</script>

<style>
html, body, #app, .app-inner{height: 100%;}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #ece0e0;
  position: relative;
}

.app-inner{
  overflow: auto;
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

.page-header{
  background-image: url('./assets/bg.jpeg'); 
  background-size: cover;
  /*background-attachment: fixed;*/
  background-position: 0% 34%;
}

.footer{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.footer ul{
  display: flex;
  list-style: none;
  justify-content: center;
}
.footer ul li{
  list-style: none;
  padding: 4px 12px;
  background: #ea3f33;
  color: #FFF;
  font-weight: bold;
}

.footer ul li:first-child{
  border-radius: 4px 0 0 0;
}

.footer ul li:last-child{
  border-radius: 0 4px 0 0 ;
}

.footer a{
  color: #FFF;
}


.flex{
  display: flex;
}
.text-bold{font-weight: bold;}
.text-danger{color: #ed3f14;}
.text-green{color: #19be6b;}
.flex .grow{flex-grow: 1;}
.flex.space-between{ justify-content: space-between; }
.flex.space-center{ justify-content: center; }
.text-center{text-align: center;}
.text-left{text-align: left;}
.text-small{font-size: 10px;}
div.ivu-card-head{padding: 6px 12px 4px;}
div.ivu-card-body{padding: 6px;}
div.ivu-timeline-item-content{padding-left: 19px;}
table{border-spacing:0;}
table td, th{padding: 2px 0;}
.avatar{
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
  vertical-align: middle;
}

/*以下对话框样式*/
.vertical-center-modal{
    margin-top: -80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.vertical-center-modal .ivu-modal{
    top: 0;
}
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
div.ivu-form-item{margin-bottom: 12px;}
div.ivu-card:hover{box-shadow: 0 1px 1px rgba(0,0,0,.2);}

ul.ivu-timeline.ivu-timeline-pending .ivu-timeline-item:nth-last-of-type(2) .ivu-timeline-item-tail{
  border-left: 1px dotted #ea3f33;
}

.shouqi{
  transition: height .5s linear 5s;
}
</style>
