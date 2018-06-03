<template>
<div>
  <div class="user-info" v-show="data&&data.address">
    <img v-show="data.address" :src="data.avatar" class="avatar">
    <p class="text-middle">{{data.username}}</p>
    <p class="word-break">
      <span>地址</span>
      <span class="text-danger word-break">{{data.address}}</span>
      <Tag v-show="data.inChallenge" color="red">挑战中</Tag>
    </p>
    <p>注册 {{createAt}}</p>
    <p>上次支付挑战金 {{payDepositAt}}</p>
  </div>
  <div style="width:166px;margin:0 auto;">
    <Tabs size="small">
          <TabPane label="打卡记录">
                <div v-show="!callRecords||!callRecords.length">没有打卡记录</div>
                <div v-for="item in callRecords " :key="item">{{item}}</div>
            </TabPane>
            <TabPane label="挑战记录">
                <div v-show="!payRecords||!payRecords.length">没有打卡记录</div>
                <div v-for="item in payRecords " :key="item">{{item}}</div>
            </TabPane>
        </Tabs>
    </div>
  </div>
</template>
<script>
import {DEPOSIT_AMOUNT, BROKEN_RAGE_AMOUNT} from '../constants/'
import {formatTime} from '../utils/'

export default {
  props:['data'],
  computed:{
    callRecords(){
      let list =this.data.callRecords||[]
      return list.map(n=>formatTime(n, true))
    },
    payRecords(){
      let list =this.data.payRecords||[]
      return list.map(n=>formatTime(n, true))
    },
    createAt(){return formatTime(this.data.createAt)},
    payDepositAt(){return formatTime(this.data.payDepositAt)}
  }
}

</script>