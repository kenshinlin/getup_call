<template>
  <div>
    <Modal 
      :value="visible" 
      @input="$emit('input', $event)"
      title="输入钱包地址" 
      @on-ok="ok" 
      :loading="modalLoading">
      <div>
        <Form :label-width="40">
          <FormItem label="地址" class="form-item">
            <Input placeholder="输入钱包地址" v-model="address"/>
          </FormItem>
        </Form>
        <a target="_blank" href="https://nano.nebulas.io/index_cn.html">
          <Icon type="ios-information"></Icon>
          下载NAS App注册钱包
        </a>
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
        address: Cookies.get('nas_wallet_address'),
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
        let address = this.address

        if( !address ){
          this.modalLoading = false
          Vue.nextTick().then(()=>this.modalLoading=true)
          return this.$Message.error('请输入钱包地址')
        }else{
          this.sign()
        }
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
            this.$Message.info("签到成功")
            this.$emit('input',false)
          },
          error: msg=>{
            this.$Message.error('签到失败，'+msg)
            this.modalLoading = false
            Vue.nextTick().then(()=>this.modalLoading=true)
          }
        })
      }
    }
  }
</script>