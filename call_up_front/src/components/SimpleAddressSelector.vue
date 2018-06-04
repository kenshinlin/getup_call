<template>
  <div>
    <Modal 
      :value="visible" 
      @input="$emit('input', $event)"
      title="输入钱包地址" 
      @on-ok="ok" 
      :mask-closable="false"
      :loading="modalLoading"
      class-name="vertical-center-modal"
      >
      <div>
        <!-- <Form :label-width="40">
          <FormItem label="地址" class="form-item">

            <Input placeholder="输入钱包地址" v-model="address"/>
          </FormItem>
        </Form> -->
        <Alert type="warning" show-icon>
          打卡提示
          <template slot="desc">
            <p>
              <p v-show="address.length>0">
                <span>上次操作钱包地址：</span>
                <p class="text-danger word-break">{{address}}</p>
              </p>
            </p>
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
  import Cookies from 'js-cookie'

  export default {
    props:['value'],
    data(){
      return {
        address: Cookies.get('nas_wallet_address')||'',
        modalLoading:true
      }
    },
    computed:{
      visible(){
        return this.value
      }
    },

    methods:{
      ok(){
        // let address = this.address

        // if( !address ){
        //   this.modalLoading = false
        //   Vue.nextTick().then(()=>this.modalLoading=true)
        //   return this.$Message.error('请输入钱包地址')
        // }else{
          this.sign()
        // }
      },

      sign(){
        let value = "0";
        let callFunction = "doCall" 
        let args =  [ this.address ]

        callContract({
          value,
          function: callFunction,
          args,
          success: txInfo=>{
            this.$Message.info("打卡成功")
            this.$emit('input',false)
            this.$emit('complete')            
          },
          error: msg=>{
            this.$Message.error('打卡失败，'+msg)
            this.modalLoading = false
            Vue.nextTick().then(()=>this.modalLoading=true)
          }
        })
      }
    }
  }
</script>

<style>
.ivu-alert-with-desc{margin-bottom: 0;}
</style>