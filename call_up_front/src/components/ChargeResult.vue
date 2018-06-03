<template>
  <div class="charge-result">
    <p class="text-bold text-middle title">{{dayZh}}日打卡战况</p>
    <p v-show="hasPrize">
      <span class="text-primary text-bold">{{out}}</span>人出局，
      <span class="text-primary text-bold">{{success}}</span>人打卡成功，瓜分
      <span class="text-primary text-bold">{{total}} NAS</span>
    </p>
    <p v-show="!hasPrize">
      <span v-show="!out||out=='--'">没有人出局</span>
      <span v-show="!success||success=='--'">没有人打卡成功</span>
    </p>
  </div>
</template>
<script>
import {DEPOSIT_AMOUNT, BROKEN_RAGE_AMOUNT, CALL_END_HOUR} from '../constants/'

export default {
  props:['data'],
  data(){
    let now = new Date()
    let hour = now.getHours()
    let hasCharge = hour > CALL_END_HOUR
    return {
      hasCharge
    }
  },
  computed:{
    dayZh(){return this.hasCharge?'今':'昨'},
    out(){
      if( this.data.challengeFailUserList  ){
        return this.data.challengeFailUserList.length
      }else{
        return '--'
      }
    },
    total(){ 
      if( this.data.challengeFailUserList  ){
        let c = this.data.challengeFailUserList.length
        return (DEPOSIT_AMOUNT - BROKEN_RAGE_AMOUNT ) * c
      }else{
        return '--'
      }
    },
    success(){
      if( this.data.challengeSuccUserList  ){
        return this.data.challengeSuccUserList.length
      }else{
        return '--'
      }
    },
    hasPrize(){
      return this.data.challengeFailUserList && this.data.challengeSuccUserList&&this.data.challengeFailUserList.length>0 && this.data.challengeSuccUserList.length>0
    }
  }
  
}
</script>
<style>

.charge-result{
  padding: 0 0 12px;
  overflow: auto;
}
.title{
  margin: 12px 0 4px;
}
</style>