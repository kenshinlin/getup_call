<template>
  <div>
    <Modal 
      :value="visible" 
      @input="$emit('input', $event)"
      title="报名确认" 
      @on-ok="ok" 
      :ok-text="okLabel"
      :mask-closable="false"
      :loading="modalLoading"
      class-name="vertical-center-modal"
      >
      <div>
        <upload-avatar v-model="avatar"/>
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
  import UploadAvatar from '@/components/UploadAvatar'

  export default {
    props:['value'],
    data(){
      return {
        username:"",
        avatar:'',
        modalLoading:true,
        deposit:DEPOSIT_AMOUNT,
        submitting: false,
        fetchCount:0
      }
    },

    components:{ UploadAvatar},
    computed:{
      visible(){
        return this.value
      },
      okLabel(){
        return this.submitting?`正在查询报名结果（${this.fetchCount}）`:'报名'
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
        }
        
        if( !this.avatar ){
          this.modalLoading = false
          Vue.nextTick().then(()=>this.modalLoading=true)
          return this.$Message.error('请上传头像')
        }
        this.enroll()
      },

      enroll(){
        this.submitting = true
        let username = this.username
        let avatar = this.avatar
        let value = DEPOSIT_AMOUNT
        let callFunction = "payDeposit"
        let args =  [username, avatar]

        callContract({
          value,
          function: callFunction,
          args,
          onRefetch: fetchCount=>{
            this.fetchCount = fetchCount
          },
          success: txInfo=>{
            this.$Message.info('支付成功')
            this.$emit('input',false)
            this.$emit('complete')
            this.submitting = false
          },
          error: msg=>{
            this.$Message.error('支付失败，'+msg)
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
