<template>
  <div>
    <Modal 
      :value="visible" 
      @input="$emit('input', $event)"
      :title="action" 
      @on-ok="ok" 
      @on-cancel="cancel">
      <div v-show="hasWalletView">
        <Form :label-width="40">
          <FormItem label="地址" class="form-item">
            <Input placeholder="输入钱包地址" v-model="address"/>
          </FormItem>
        </Form>
        <Button type="text" class="text-link no-margin-top" @click="switchView">
          创建NAS钱包
          <Icon type="arrow-right-c"></Icon>
        </Button>
      </div>
      <div v-show="!hasWalletView">
        <Form inline class="inline-form">
          <FormItem class="form-item">
            <Input placeholder="输入钱包密码" type="password" v-model="passphrase">
              <!-- <Icon type="android-lock" slot="prepend"></Icon> -->
              <span slot="prepend">密码</span>
            </Input>
          </FormItem>
          <FormItem class="form-item">
              <Button type="primary" @click="genKeystore" :loading="keystoreCreating">创建</Button>
          </FormItem>
        </Form>
        <div>
          <Card v-show="newAddress">
            钱包地址为：{{newAddress}}
          </Card>
        </div>
        <Card v-show="keystore">
          <div slot="title">
            <p>
              请拷贝keystore到备忘录
            </p>
          </div>
          <a slot="extra" :data-clipboard-text="keystore" id="copyKeyBtn" class="text-link">
              <Icon type="ios-copy"></Icon>
              拷贝
          </a>
          <p class="word-break keystore">{{keystore}}</p>
        </Card>
        <Button type="text" class="text-link" @click="switchView">
          <Icon type="arrow-left-c"></Icon>
          已经有NAS钱包
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {Account} from 'nebulas'
  import Clipboard from 'clipboard'

  let clipboard

  export default {
    props:['value'],
    data(){
      return {
        keystoreCreating:false,
        hasWalletView:true,
        address:"",
        newAddress:"",
        passphrase:"",
        keystore:""
      }
    },
    computed:{
      visible(){
        return this.value
      },
      action(){
        return this.hasWalletView?'输入钱包地址':'创建NAS钱包'
      }
    },
    mounted(){
      clipboard = new Clipboard('#copyKeyBtn')
      clipboard.on('success', (e)=>this.$Message.info('拷贝成功，请保存'))
      clipboard.on('error', e=>this.$Message.error('拷贝失败，请手动操作'))
    },

    methods:{
      ok(){

        console.log('click ok')
      },

      cancel(){
        console.log('click cancel')
      },

      switchView(){
        this.hasWalletView = !this.hasWalletView
      },

      genKeystore(){
        let {passphrase} = this.$data
        if( !passphrase ){
          this.$Message.error("请输入密码")
        }else{
          this.keystoreCreating = true
          let account = Account.NewAccount()
          let keystore = account.toKeyString(passphrase)
          this.newAddress = account.getAddressString()
          this.keystore = keystore
          this.keystoreCreating = false
        }
      }
    }
  }
</script>

<style>
  .inline-form .form-item, .form-item:last-child{
    margin-bottom:8px;
  }
  .word-break{word-break: break-all;}
  .keystore{height: 150px;overflow: auto;}
</style>
