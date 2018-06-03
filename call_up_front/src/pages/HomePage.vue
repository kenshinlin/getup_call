<template>
  <div>
    <div>{{address}}</div>
    <div style="word-break:break-all;height:100px;overflow:auto;">{{JSON.stringify(userInfo)}}</div>
    <div>
      <Button type="warning" shape="circle" @click="enroll">报名</Button>
      <Button 
        type="warning" 
        shape="circle" 
        @click="selectAddress">签到</Button>
    </div>
    <div>
      榜单
      <range-list :list="range"/>
    </div>
    <simple-address-selector v-model="showAddressSelector" @complete="fetchData"/>
    <enroll-modal v-model="showEnrollModal" @complete="fetchData"/>
  </div>
</template>

<script>
// import AddressSelector from '@/components/AddressSelector'
import SimpleAddressSelector from '@/components/SimpleAddressSelector'
import EnrollModal from '@/components/EnrollModal'
import RangeList from '@/components/RangeList'
import {simulateCall} from '../utils/'
import Cookies from 'js-cookie'

export default {
  name: 'HomePage',
  data () {
    return {
      showAddressSelector:false,
      showEnrollModal:false,
      address: Cookies.get('nas_wallet_address'),
      range:[], //排行榜
      userInfo:{}
    }
  },

  components:{
    SimpleAddressSelector,
    EnrollModal,
    RangeList
  },
  mounted(){
    this.fetchData()
    this.$Message.config({
      top: 80,
      duration: 5
    })
  },
  methods:{
    enroll(){
      this.showEnrollModal = true
    },

    selectAddress(){
      this.showAddressSelector = true
    },

    fetchData(){
      this.fetchRange()
      this.fetchUserInfo()
    },

    fetchRange(){
      simulateCall({function:"range"}).then(range=>this.range=range)
    },
    fetchUserInfo(){
      let address = this.address
      if( address ){
        simulateCall({function:"userInfo", args:[address]}).then(userInfo=>{
          this.userInfo=userInfo
          console.log('fetchUserInfo', userInfo)
        })
      }
    }
  }
}
</script>