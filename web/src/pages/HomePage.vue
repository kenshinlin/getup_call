<template>
  <div id="pageContent">
    <div class="page-header">
      <div class="logo">
        <img src="../assets/logo.png"/>
        <span>全民早起</span>
      </div>
      <div>
        <banner :data="prizePool"/>
        <div>
          <Button class="enroll-btn" type="warning" shape="circle" @click="enroll">报名</Button>
          <Button 
            class="call-btn"
            type="warning" 
            shape="circle" 
            @click="selectAddress">打卡</Button>
        </div>
        <p class="rule-tip" @click="showRule">
          <span>游戏规则</span> <Icon type="help-circled"></Icon>
        </p>
        <charge-result :data="chargeResultData||{}"/>
      </div>
      <div class="bg">
        <img src="../assets/banner2.jpg" />
      </div>
    </div>
    <div>
      <ul class="tabs">
        <li @click="changeTab('rank')" :class="[selectTab=='rank'?'on':'']">坚持榜</li>
        <li @click="changeTab('challenge')" :class="[selectTab=='challenge'?'on':'']">挑战者</li>
        <li @click="changeTab('me')" :class="[selectTab=='me'?'on':'']">我的</li>
      </ul>
    </div>
    <div>
      <range-list v-show="selectTab=='rank'" :list="range"/>
      <range-list v-show="selectTab=='challenge'" :list="prizePool" type="challenge"/>
      <user-info v-show="selectTab=='me'" :data="userInfo" @changetab="checkFooterFix"/>
    </div>
    <simple-address-selector v-model="showAddressSelector" @complete="fetchData"/>
    <enroll-modal v-model="showEnrollModal" @complete="fetchData"/>
    <Modal 
      v-model="ruleVisible"
      title="全民早起游戏规则" 
      :mask-closable="false"
      class-name="vertical-center-modal"
      >
        <ol style="padding:12px;">
          <li>每天北京时间6点到8点打卡有效</li>
          <li>报名需支付挑战金，挑战金不退还，报名后第二天开始打卡</li>
          <li>每天打卡一次，打卡可获得奖金</li>
          <li>一旦中断打卡，你的挑战金将被当天打卡的人平分</li>
          <li>平台收取10%挑战金</li>          
        </ol>
      <div slot="footer"></div>
    </Modal>
    <app-footer :fixFooter="fixFooter" :check="check" />
  </div>
</template>

<script>
// import AddressSelector from '@/components/AddressSelector'
import SimpleAddressSelector from '@/components/SimpleAddressSelector'
import EnrollModal from '@/components/EnrollModal'
import RangeList from '@/components/RangeList'
import Banner from '@/components/Banner'
import ChargeResult from '@/components/ChargeResult'
import UserInfo from '@/components/UserInfo'
import AppFooter from '@/components/AppFooter'
import {simulateCall, today, isWechat} from '../utils/'
import Cookies from 'js-cookie'
import { CALL_END_HOUR } from '../constants/'


export default {
  name: 'HomePage',
  data () {
    return {
      showAddressSelector:false,
      showEnrollModal:false,
      address: Cookies.get('nas_wallet_address'),
      range:[], //排行榜
      userInfo:{},
      prizePool: [],
      todayChargeResult:{},
      yesterdayChargeResult:{},
      selectTab: 'rank',
      ruleVisible:false,
      fixFooter:false,
      check:true
    }
  },

  components:{
    SimpleAddressSelector,
    EnrollModal,
    RangeList,
    Banner,
    ChargeResult,
    UserInfo,
    AppFooter
  },
  mounted(){
    this.$Loading.config({
      color: '#f90',
      failedColor: '#f90',
      height: 5
    })
    this.fetchData()
    this.$Message.config({
      top: 80,
      duration: 5
    })
    this.checkFooterFix()
  },

  computed:{
    chargeResultData(){
      let now = new Date()
      let hour = now.getHours()

      let hasCharge = hour > CALL_END_HOUR
      return hasCharge?this.todayChargeResult:this.yesterdayChargeResult
    }
  },

  methods:{
    changeTab(selectTab){
      this.selectTab = selectTab
      this.checkFooterFix()
    },
    showRule(){this.ruleVisible=true},
    enroll(){
      if( isWechat() ){
        this.$Message.info('请在手机或PC浏览器打开，不要在微信打开')
      }
      this.showEnrollModal = true
    },

    selectAddress(){
      if( isWechat() ){
        this.$Message.info('请在手机或PC浏览器打开，不要在微信打开')
      }
      this.showAddressSelector = true
    },

    fetchData(){
      this.$Loading.start()

      Promise.all([
        this.fetchRange(),
        this.fetchUserInfo(),
        this.fetchPrizePool(),
        this.fetchChargeResult()
      ]).then(()=>this.$Loading.finish())
        .catch(()=>this.$Loading.start())
    },

    fetchChargeResult(){
      let now = new Date()
      let hour = now.getHours()

      let hasCharge = hour > CALL_END_HOUR

      let day
      if( hasCharge ){
        day = today()
      }else{
        let t = new Date( now.getTime() - 24*60*60*1000 )
        day = today(t)
      }

      return simulateCall({function:"dayChargeInfo", args:[day]}).then(result=>{
        if( hasCharge ){
          this.todayChargeResult = result
        }else{
          this.yesterdayChargeResult = result
        }
      })
    },

    fetchRange(){
      return simulateCall({function:"range"}).then(range=>this.range=range)
    },

    fetchPrizePool(){
      return simulateCall({function:"prizePool"}).then(prizePool=>this.prizePool=prizePool)
    },

    fetchUserInfo(){
      let address = this.address
      if( address ){
        return simulateCall({function:"userInfo", args:[address]}).then(userInfo=>{
          this.userInfo=userInfo||{}
          console.log('fetchUserInfo', userInfo)
        })
      }
    },
    checkFooterFix(){
      let appEl = document.getElementById('app')
      let pageContent = document.getElementById('pageContent')

      // this.fixFooter = false
      this.check = true
      window.setTimeout(()=>{
        let screenHeight = appEl.getBoundingClientRect().height
        let bodyHeight = pageContent.getBoundingClientRect().height
        this.fixFooter = screenHeight - bodyHeight > ( this.fixFooter ? 82: 4)
        this.check = false
      }, 0)
    }
  }
}
</script>
<style>
.page-header{
  /* background: #f7f7f7; */
  border-bottom: 1px solid rgba(26,26,26,.06);
  box-shadow: 0 1px 3px 0 rgba(23,81,153,.05);
  /* background-image:url('../assets/banner2.jpg'); */
  color:#FFF;
  /* font-weight:bold; */
  position:relative;
}
.page-header .bg{
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
  z-index:-1;
}

.page-header .bg img{
  width: 100%;
	height: 100%;
	object-fit: cover;
	-webkit-filter: blur(5px); /* Chrome, Opera */
       -moz-filter: blur(5px);
        -ms-filter: blur(5px);    
            filter: blur(5px);
}

.logo{
  position:absolute;
  left:3px;
  top:3px;

  background:#555;
  border-radius:4px;
  color:#FFF;
  font-weight:bold;
  font-size:12px;
  padding:3px 3px 2px;
}
.logo img{
  width:20px;
  height:20px;
  vertical-align:middle;
}

.call-btn, .enroll-btn{
  padding-left: 24px;
  padding-right: 24px;
}
.enroll-btn{margin-right: 18px;}
.tabs{
  display: flex;
  width: 240px;
  list-style: none;
  margin:0 auto;
  border-bottom: 1px solid #ddd;
}

.tabs>li{
  flex: 1;
  padding: 6px 0;
  text-align: center;
}

.tabs>li.on{
  color: #f90;
  border-bottom: 2px solid #f90;
  margin-bottom: -1px;
}
.rule-tip{
  position: absolute;
  top: 7px;
  right: 7px;
}
</style>