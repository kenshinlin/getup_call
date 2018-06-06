<template>
  <div class="range-item">
      <div class="float-left">
        <span :class="rangeIndexClass">{{index+1}}</span>
        <img class="avatar" :src="data.avatar"/>
        <span class="text-link">{{data.username}}</span>
        <span>{{callTimes}}天</span>
      </div>
      <div class="float-right" v-if="type!='challenge'" style="line-height:30px;">
        <span v-show="data.callAt">{{callAt}} 打卡</span>
        <span v-show="!data.callAt">没打过卡</span>
      </div>
      <div class="float-right" v-if="type=='challenge'" style="line-height:30px;">
        <span>{{payDepositAt}}报名</span>
      </div>
  </div>
</template>

<script>
  import RangeItem from '@/components/RangeItem'
  import {formatTime} from '../utils/'

  export default {
    props:["data", "index", "type"],
    data(){
      let rangeIndexClass = {
        'text-danger': this.index==0,
        'text-primary': this.index==1,
        'text-link': this.index==2,
        'text-bold': this.index<3
      }
      return {rangeIndexClass}
    },
    computed:{
      callTimes(){
        return this.data.callRecords?this.data.callRecords.length:'0'
      },
      callAt(){
        return formatTime(this.data.callAt, true, false)
      },
      payDepositAt(){
        return formatTime(this.data.payDepositAt, true, false)
      }
    }
  }
</script>

<style>
.range-item{
  text-align:left;
  overflow:auto;
  padding: 8px 12px;
}
</style>
