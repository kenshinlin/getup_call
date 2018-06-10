<template>
	<div class="vote-list">
		<table>
			<thead>
				<th>
					{{page==='me'?"球赛":"用户"}}
				</th>
				<th>筹码</th>
				<th>胜负</th>
				<th>竞猜时间</th>
			</thead>
			<tbody>
				<tr v-for="vote in fVoteList" :key="vote.createAt+vote.address">
					<td class="text-left" v-if="page!=='me'">
						<img :src="vote.user.avatar" class="avatar" />
						<span>{{vote.user.username}}</span>
					</td>
					<td class="text-small" v-if="page==='me'">
						<span>{{vote.game.homeTeam.nameZh}}</span> - 
						<span>{{vote.game.guestTeam.nameZh}}</span>
						<p>{{vote.startAtDate}}</p>
					</td>
					<td class="text-small">
						<p>{{vote.jetton}}</p>
						<p>{{vote.voteToTeam.nameZh}}(胜{{vote.gap}})</p>
					</td>
					<td>
						<span :class="{
							'text-danger':vote.winAmount>0, 
							'text-green':vote.winAmount<0
						}">{{vote.winAmount||'--'}}</span>
					</td>
					<td>
						<span>{{vote.createAt}}</span>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="text-center" v-show="fVoteList.length<1">目前还没有人参与竞猜</div>
	</div>
</template>
<script>
import {formatTime} from '../utils/'

export default {
	props:['voteList', 'page'],
	computed:{
		fVoteList(){
			this.voteList = this.voteList||[]
			return this.voteList.map(v=>{
				v.createAt = formatTime(v.createAt, true, false)
				if( v.game && v.game.startAt ){
					v.startAtDate = formatTime(v.game.startAt, false, false)
				}
				return v
			})
		}
	}
}
</script>

<style scoped>
.vote-list{
	max-height: 450px;
	overflow: auto;
}
table{width: 100%;margin-top: 12px;text-align: center;border-top: 1px solid #ddd;}
thead{font-size: 12px;background-color: #ddd;padding: 4px 0;}
</style>