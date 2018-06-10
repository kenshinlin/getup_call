<template>
	<div class="game-item">
		<Card>
			<p slot="title" class="card-title">
        {{data.homeTeam.nameZh}}-{{data.guestTeam.nameZh}}
        {{startAt}}
      </p>
			<div class="select-panel flex">
				<div class="text-center select-team" @click="selectTeam(data.homeTeamID)">
					<Avatar src="http://kk.kenniu.top/uimg/2018-06-07/hdImg_98b045d21993158aeb91b4d94d40e2431484901504090_1b8af908.jpg" />
					<p><Icon type="checkmark" v-show="selectHomeTeam" color="#ed3f14"></Icon></p>
					<!-- <Button type="primary" size="small" shape="circle">胜</Button> -->
				</div>
				<div class="grow">
					<div class="text-center" v-show="!hasSelectTeamAndGap">选择球队和胜球数</div>
					<div class="text-center" v-show="hasSelectTeamAndGap">
						选择
						<span class="text-danger text-bold">{{selectTeamNameZh}}</span> 胜
						<span class="text-danger text-bold">{{selectGapTxt}}</span>球
					</div>
					<div class="flex win-num-panel space-center">
						<div :class="{on:selectGap===0}" @click="setSelectGap(0)">0</div>
						<div :class="{on:selectGap===1}" @click="setSelectGap(1)">1</div>
						<div :class="{on:selectGap===2}" @click="setSelectGap(2)">2</div>
						<div :class="{on:selectGap===3}" @click="setSelectGap(3)">2+</div>
					</div>
				</div>
				<div class="text-center select-team" @click="selectTeam(data.guestTeamID)">
					<Avatar src="http://kk.kenniu.top/uimg/2018-06-07/mmexport1515053601248_93d543a6.png" />
					<p><Icon type="checkmark" v-show="selectGuestTeam" color="#ed3f14"></Icon></p>
					<!-- <Button type="primary" size="small" shape="circle">胜</Button> -->
				</div>
			</div>
			<div class="progress text-center" @click="toggleVoteList">
				<div>
					{{teamSupportCount.h}}人次（{{teamSupportCount.hp}}%） 
					- 
					{{teamSupportCount.g}}人次（{{teamSupportCount.gp}}%） 
				</div>
				<div class="grow">
					<Progress :percent="teamSupportCount.hp" status="wrong" hide-info/>
				</div>
			</div>
			<div class="progress text-center" @click="toggleVoteList">
				<div>
					{{teamSupportMoney.h}}NAS({{teamSupportMoney.hp}}%） 
					- 
					{{teamSupportMoney.g}}NAS({{teamSupportMoney.gp}}%） 
				</div>
				<div class="grow">
					<Progress :percent="teamSupportMoney.hp" status="wrong" hide-info/>
				</div>
			</div>
			<div class="text-center">
				<!-- <Button type="ghost" shape="circle">猜</Button> -->
				<Button type="primary" shape="circle" @click="vote" :disabled="!hasSelectTeamAndGap">竞 猜</Button>
			</div>
			<vote-list :voteList="data.voteList" v-show="showVoteList"/>
		</Card>
	</div>
</template>
<script>
import VoteList from './VoteList'
import {formatTime, simulateCall, fixedNumber} from '../utils/'

export default {
	name: 'GameItem',
	props:['data'],
	data(){
		return {
			selectGap: null,
			selectTeamID: null,
			showVoteList:false
		}
	},
	components:{
		VoteList
	},
	mounted(){
		// this.fetchGameVoteList()
	},

	computed:{
		startAt(){
			return formatTime( this.data.startAt, true, false)
		},
		hasSelectTeamAndGap(){
			return this.selectTeamID!==null && this.selectGap !==null
		},
		selectTeamNameZh(){
			if( this.selectTeamID === this.data.homeTeamID ){
				return this.data.homeTeam.nameZh
			}
			if( this.selectTeamID === this.data.guestTeamID ){
				return this.data.guestTeam.nameZh
			}
		},
		selectHomeTeam(){
			return this.selectTeamID === this.data.homeTeamID
		},
		selectGuestTeam(){
			return this.selectTeamID === this.data.guestTeamID
		},
		selectGapTxt(){
			return this.selectGap<=2?this.selectGap:'2+'
		},
		teamSupportCount(){
			let voteList = this.data.voteList

			if( voteList.length === 0 ){
				return {
					h:0,g:0, hp:0, gp:0
				}
			}
			let hList = voteList.filter(v=>v.voteTo===this.data.homeTeamID)||[]
			let gList = voteList.filter(v=>v.voteTo===this.data.guestTeamID)||[]
			return {
				h: hList.length,
				g: gList.length,
				hp: fixedNumber(hList.length/voteList.length, 2),
				gp: fixedNumber(gList.length/voteList.length, 2)
			}
		},
		teamSupportMoney(){
			let voteList = this.data.voteList

			if( voteList.length === 0 ){
				return {
					h:0,g:0, hp:0, gp:0
				}
			}

			let gList = voteList.filter(v=>v.voteTo===this.data.guestTeamID)||[]
			let hList = voteList.filter(v=>v.voteTo===this.data.homeTeamID)||[]

			let g=0
			let h=0

			gList.forEach(l=>g=g+l.jetton*1)
			hList.forEach(l=>h=h+l.jetton*1)

			g = fixedNumber(g)
			h = fixedNumber(h)

			return {h, g, hp: fixedNumber(h/(h+g), 2), gp:fixedNumber(g/(h+g), 2)}
		}

	},

	methods:{
		selectTeam(teamID){
			this.selectTeamID = teamID
		},

		setSelectGap(gap){
			this.selectGap = gap
		},
		vote(){
			this.$emit('vote', {
				gameID: this.data.id,
				voteTo: this.selectTeamID,
				gap: this.selectGap
			})
		},

		fetchGameVoteList(){
			simulateCall({function:"gameVoteList", args:[this.data.id]})
				.then(voteList=>this.voteList=voteList)
		},

		toggleVoteList(){
			this.showVoteList = !this.showVoteList
		}
	}
}
</script>
<style scoped>
.select-panel{

}
.win-num-panel div{
	border-radius: 50%;
	background: #ddd;
	font-weight: bold;
	border: 2px solid #555;
	width: 32px;
	height: 32px;
	line-height: 32px;
	text-align: center;
	margin: 4px 6px 8px 0;
}

.win-num-panel div:last-child{margin-right: 0}

.win-num-panel div.on{
	background: #ed3f14;
	color: #FFF;
}

.select-team{
	padding-top: 18px;
}

.progress .grow{margin: 0 8px 8px;}
.progress{
  border: 1px solid #ddd;
  padding-top: 4px;
  border-radius: 4px;
  margin-bottom: 8px;
}

</style>