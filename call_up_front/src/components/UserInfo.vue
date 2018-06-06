<template>
<div class="user-info">
  <div v-show="data&&data.address">
    <img v-show="data.address" :src="data.avatar" class="avatar">
    <p class="text-middle">{{data.username}}</p>
    <p class="word-break">
      <span>地址</span>
      <span class="text-danger word-break">{{data.address}}</span>
      <Tag v-show="data.inChallenge" color="red">挑战中</Tag>
    </p>
    <p>注册 {{createAt}}</p>
    <p>上次支付挑战金 {{payDepositAt}}</p>
    <div>
      <ul class="tabs">
        <li @click="changeTab('call')" :class="[selectTab=='call'?'on':'']">打卡记录</li>
        <li @click="changeTab('challenge')" :class="[selectTab=='challenge'?'on':'']">挑战记录</li>
      </ul>
    </div>
    <div class="panel">
      <div v-show="selectTab=='call'">
        <div v-show="!callRecords||!callRecords.length">没有打卡记录</div>
        <div v-for="item in callRecords " :key="item">{{item}}</div>
      </div>
      <div v-show="selectTab=='challenge'">
        <div v-show="!payRecords||!payRecords.length">没有挑战记录</div>
        <div v-for="item in payRecords " :key="item">{{item}}</div>
      </div>
    </div>
  </div>
  <div v-show="!data||!data.address" class="panel">
    无用户信息
  </div>
</div>
</template>
<script>
import {DEPOSIT_AMOUNT, BROKEN_RAGE_AMOUNT} from '../constants/'
import {formatTime} from '../utils/'

export default {
  props:['data'],
  data(){
    return {
      selectTab: 'call'
    }
  },
  computed:{
    callRecords(){
      return (this.data.callRecords||[]).map(t=>t.t)
    },
    payRecords(){
      let list =this.data.payRecords||[]
      return list.map(n=>formatTime(n, true))
    },
    createAt(){return formatTime(this.data.createAt)},
    payDepositAt(){return formatTime(this.data.payDepositAt)}
  },

  methods:{
    changeTab(selectTab){
      this.selectTab = selectTab
      this.$emit('changetab')
    }
  }
}
</script>

<style>
.user-info{
  padding: 12px;
}
.user-info .tabs{
  font-size: 12px;
  width: 168px;
  margin: 12px auto;
}

.panel{
  padding:8px;
}
</style>