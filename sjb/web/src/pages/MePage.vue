<template>
	<div class="me-page">
		<div v-show="showInfo" class="basic">
	    <img :src="info.avatar" class="avatar">
	    <p class="text-middle">{{info.username}}</p>
	    <p class="word-break">
	      <span>地址</span>
	      <span class="word-break">
	      	<span class="text-danger">{{info.address}}</span>
					<Icon type="compose" @click="showAddressEdit"/>
	      </span>
	    </p>
	    <p>注册 {{info.createAt}}</p>
		</div>
		<vote-list :voteList="voteList" page="me" v-show="voteList.length>0"/>
		<div v-show="!showInfo" class="text-center">
			输入钱包地址
			<Icon type="compose" @click="showAddressEdit"/>
		</div>
		<Modal
      v-model="addressModal"
      @on-ok="fetchData"
      title="输入钱包地址">
      <Input v-model="address" placeholder="输入地址"/>
  </Modal>
	</div>
</template>

<script>
import {simulateCall, formatTime} from '../utils/'
import VoteList from '../components/VoteList'
import Cookies from 'js-cookie'

export default {
	data(){
		return {
			info: {},
			voteList: [],
			addressModal:false,
			address: Cookies.get('nas_wallet_address')
		}
	},

	computed:{
		showInfo(){
			return this.address && this.info.address
		}
	},

	components:{
		VoteList
	},

	mounted(){
		this.fetchData()
	},

	methods:{
		fetchData(){
			this.info = {}
			this.voteList = []
			if(!this.address){
				return
			}
			this.$Loading.start()

			simulateCall({
				function:"userVoteList",
				args: [this.address]
			})
			.then(({info, list})=>{
				info.createAt = formatTime(info.createAt)
				this.info = info

				this.voteList = list.map(v=>{
					v.user = info
					return v
				})
				Cookies.set('nas_wallet_address', this.address, 365)
				console.log( 'this.voteList ', this.voteList )
			})
			.then(()=>this.$Loading.finish())
			.catch(e=>{
				this.$Message.error(e)
				this.$Loading.finish()
			})
		},
		showAddressEdit(){
			this.addressModal = true
		}
	}
}
</script>
<style scoped>
.me-page{
	padding: 8px;
	background-color: #fff;
	height: 70%;
}
.basic{
	text-align: center;
}
</style>