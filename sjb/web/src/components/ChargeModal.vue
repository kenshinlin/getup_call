<template>
  <div>
    <Modal 
      :value="visible" 
      @input="$emit('input', $event)"
      title="结算确认" 
      @on-ok="ok" 
      :ok-text="okLabel"
      :mask-closable="false"
      :loading="modalLoading"
      class-name="vertical-center-modal"
      >
      <div>
      	胜者：
        <RadioGroup v-model="winTeamName">
	        <Radio :label="game.homeTeam.nameZh"></Radio>
	        <Radio :label="game.guestTeam.nameZh"></Radio>
		    </RadioGroup>
		    <p style="margin-top:12px;"> 
					<InputNumber v-model="gap" placeholder="胜球数"/>
				</p>
      </div>
    </Modal>
  </div>
</template>

<script>
import Vue from 'vue'
import Cookies from 'js-cookie'
import {callContract} from '../utils/'

export default {
  props:['game', 'value'],
  data(){
    return {
      winTeamName:"",
      gap:null,
      address:Cookies.get('nas_wallet_address'),
      modalLoading:true,
      submitting: false,
      fetchCount:0
    }
  },

  computed:{
    visible(){
      return this.value
    },
    okLabel(){
      return this.submitting?`正在查询结算结果（${this.fetchCount}）`:'报名'
    }
  },

  methods:{
    ok(){
        this.checkForm()
    },

    checkForm(){
      if( null === this.gap || ''===this.gap || this.gap*1<0 ){
        this.modalLoading = false
        Vue.nextTick().then(()=>this.modalLoading=true)
        return this.$Message.error('请输入胜球数')
      }
      
      if( !this.winTeamName ){
        this.modalLoading = false
        Vue.nextTick().then(()=>this.modalLoading=true)
        return this.$Message.error('请选择胜球队')
      }
      this.enroll()
    },

    enroll(){
      this.submitting = true
      let callFunction = "charge"
      let {homeTeam, guestTeam, homeTeamID, guestTeamID} = this.game

      let winTeamID = homeTeam.nameZh==this.winTeamName? homeTeamID: guestTeamID
      let args =  [this.game.id, winTeamID, this.gap]

      callContract({
        value:0,
        function: callFunction,
        args,
        onRefetch: fetchCount=>{
          this.fetchCount = fetchCount
        },
        success: txInfo=>{
          this.$Message.info('结算成功')
          this.$emit('input',false)
          this.$emit('complete')
          this.submitting = false
        },
        error: msg=>{
          this.$Message.error('结算失败，'+msg)
          this.modalLoading = false
          this.submitting = false
          Vue.nextTick().then(()=>this.modalLoading=true)
        }
      })
    }
  }
}
</script>


<style>
  .inline-form .form-item, .form-item:last-child{
    margin-bottom:8px;
  }
</style>
