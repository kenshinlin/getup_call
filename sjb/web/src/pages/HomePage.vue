<template>
	<div>
		<game-list :list="gameList" @vote="vote"/>
		<enroll-modal v-model="showEnrollModal" :voteInfo="voteInfo" @complete="fetchData"/>
	</div>
</template>
<script>

import GameList from '../components/GameList'
import EnrollModal from '../components/EnrollModal'
import {simulateCall, isWechat} from '../utils/'
import Cookies from 'js-cookie'

export default {
	name:"HomePage",
	data(){
		return {
			gameList:[],
			address: Cookies.get('nas_wallet_address'),
			username: '',
			avatar:'',
			showEnrollModal: false,
			voteInfo: {}
		}
	},

	components:{
		GameList,
		EnrollModal
	},

	mounted(){
		this.fetchData()
		if( isWechat() ){
      this.$Message.info('请在手机或PC浏览器打开，不要在微信打开')
    }
	},

	methods: {
		fetchData(){
			this.fetchGameList()
		},

		fetchGameList(){
			this.$Loading.start()

			return simulateCall({function:"gameList"})
				.then(gameList=>this.gameList=gameList)
				.then(()=>this.$Loading.finish())
		},

		vote( info ){
			this.voteInfo = info
			this.showEnrollModal = true
		}
	}

}

</script>