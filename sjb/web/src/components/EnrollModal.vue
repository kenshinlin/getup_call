<template>
  <div>
    <Modal 
      :value="visible" 
      @input="$emit('input', $event)"
      title="竞猜确认" 
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
          <FormItem label="金额（NAS）" class="form-item">
            <InputNumber v-model="jetton"></InputNumber>
          </FormItem>
        </Form>
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
  import {callContract} from '../utils/'
  import UploadAvatar from './UploadAvatar'

  export default {
    props:['value', 'voteInfo'],
    data(){
      return {
        username:"",
        avatar:'',
        modalLoading:true,
        jetton: null,
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
        return this.submitting?`正在等待区块链保存数据（${this.fetchCount}）`:'竞猜'
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

        if( !this.jetton ){
          this.modalLoading = false
          Vue.nextTick().then(()=>this.modalLoading=true)
          return this.$Message.error('请填写金额')
        }
        this.enroll()
      },

      enroll(){
        this.submitting = true
        let username = this.username
        let avatar = this.avatar
        let value = this.jetton
        let callFunction = "vote"
        let {gameID, voteTo, gap } = this.voteInfo
        let args =  [gameID, voteTo, gap, username, avatar]

        callContract({
          value,
          function: callFunction,
          args,
          onRefetch: fetchCount=>{
            this.fetchCount = fetchCount
          },
          success: txInfo=>{
            this.$Message.info('竞猜成功')
            this.$emit('input',false)
            this.$emit('complete')
            this.submitting = false
          },
          error: msg=>{
            this.$Message.error('竞猜失败，'+msg)
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
