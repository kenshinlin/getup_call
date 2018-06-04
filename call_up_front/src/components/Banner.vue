<template>
  <div class="top-banner">
    <p>明日资金池</p>
    <p class="text-large">{{totalPrize||'--'}} NAS</p>
    <p>挑战者{{totalPeople}}人</p>
  </div>
</template>
<script>
import {DEPOSIT_AMOUNT, BROKEN_RAGE_AMOUNT} from '../constants/'

export default {
  props:['data'],
  computed:{
    totalPeople(){return this.data.length},
    totalPrize(){ return this.data.length?(DEPOSIT_AMOUNT - BROKEN_RAGE_AMOUNT ) * this.data.length:'--' }
  }
}
</script>
<style>
.top-banner{
  padding: 20px 0 10px;
}
</style>