<template>
  <div id="app">
    <router-view/>  
  </div>
</template>

<script>
import HomePage from './pages/HomePage'

export default {
  name: 'App',
  components: {
    HomePage
  },
  created(){
    this.$Loading.config({
      color: '#f90',
      failedColor: '#f90',
      height: 5
    })
    this.$Message.config({
      top: 80,
      duration: 5
    })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
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
div.ivu-card-head{padding: 6px 12px 4px;}
div.ivu-card-body{padding: 6px;}
div.ivu-timeline-item-content{padding-left: 19px;}
table{border-spacing:0;}
td, th{padding: 2px 0;}
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
</style>
