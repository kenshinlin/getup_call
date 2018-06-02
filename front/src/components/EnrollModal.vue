<template>
  <div>
    <Modal 
      :value="visible" 
      @input="$emit('input', $event)"
      title="报名确认" 
      @on-ok="ok" 
      ok-text="支付"
      :loading="modalLoading">
      <div>
        <Form :label-width="50">
          <FormItem label="用户名" class="form-item">
            <Input placeholder="输入用户名" v-model="username"/>
          </FormItem>
        </Form>
        支付挑战金：<span class="text-danger text-large">{{deposit}} NAS</span>
        <Alert type="warning" show-icon>
          支付前注意
          <template slot="desc">
            <p>
              移动端请先
              <a target="_blank" href="https://nano.nebulas.io/index_cn.html">
                下载NAS nano
              </a>
            </p>
            <p>
              PC端请先
              <a target="_blank" href="https://github.com/ChengOrangeJu/WebExtensionWallet">
                安装钱包插件
              </a>
            </p>
          </template>
        </Alert>
      </div>
    </Modal>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {DEPOSIT_AMOUNT} from '../constants/'
  import {callContract} from '../utils/'

  export default {
    props:['value'],
    data(){
      return {
        username:"",
        modalLoading:true,
        deposit:DEPOSIT_AMOUNT
      }
    },
    computed:{
      visible(){
        return this.value
      }
    },

    methods:{
      ok(){
          this.checkForm()
      },

      checkForm(){
        if( !this.username ){
          this.modalLoading = false
          Vue.nextTick().then(()=>this.modalLoading=true)
          return this.$Message.error('请输入用户名')
        }else{
          this.enroll()
        }
      },

      enroll(){
        let username = this.username
        let value = DEPOSIT_AMOUNT
        let callFunction = "payDeposit"
        let args =  [username]

        callContract({
          value,
          function: callFunction,
          args,
          success: txInfo=>{
            this.$Message.info('支付成功')
            this.$emit('input',false)
          },
          error: msg=>{
            this.$Message.error('支付失败，'+msg)
            this.modalLoading = false
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
