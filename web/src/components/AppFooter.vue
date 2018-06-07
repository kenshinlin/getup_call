<template>
  <div :class="classObject">
    <p> © 2018 NAS 全民早起</p>
    <p>商务合作：kenshinlin@foxmail.com</p>
    <p>地址：深圳市南山区 </p>
  </div>
</template>
<script>
export default{
  props:['fixFooter', 'check'],
  computed:{
    classObject(){
      return {
        fix: this.fixFooter,
        footer: true, 
        hidden: this.check&&false
      }
    }
  }
}
</script>
<style>
.footer{
  margin-top:14px;
  background:#555;
  padding:8px;
  color:#ccc;
  font-size: 12px;
}
@media screen and (max-width: 580px){
  div.fix{position: fixed;}
}
.fix{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.hidden{
  visibility: hidden;
}
</style>