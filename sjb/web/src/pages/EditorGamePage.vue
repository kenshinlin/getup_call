<template>
<div class="text-center editor-page">
 	<Row class="row">
      <Col span="24">
        <Select v-model="homeTeamID" filterable placeholder="选择主队">
          <Option v-for="(item, index) in teamList" :value="index" :key="index">{{ item.nameZh }}</Option>
        </Select>
      </Col>
  </Row>
  <Row class="row">
    <Col span="24">
      <Select v-model="guestTimeID" filterable placeholder="选择主队">
        <Option v-for="(item, index) in teamList" :value="index" :key="index">{{ item.nameZh }}</Option>
      </Select>
    </Col>
  </Row>
  <Row class="row">
  	<Col span="24">
      <DatePicker type="date" v-model="date" placeholder="开始日期"></DatePicker>
    </Col>
  </Row>
  <Row class="row">
  	<Col span="24">
      <TimePicker format="HH:mm" v-model="time" placeholder="开始时间"></TimePicker>
    </Col>
  </Row>
  <Button type="primary" @click="submit">
  	{{fetching?`提交中(${fetchCount})`:'提交'}}
  </Button>
</div>
</template>
<script>
import {formatTime, callContract, toDateNumString, simulateCall} from '../utils/'


export default {
	data(){
		return {
			homeTeamID: null,
			guestTimeID:null,
			date:null,
			time:null,
			teamList:[],
			fetchCount:0,
			fetching:false
		}
	},

	created(){
		this.$Loading.start()
		simulateCall({function:"teamList"}).then(l=>{
			console.log('teamList', l)
			this.teamList=l
			this.$Loading.finish()
		})
	},

	methods:{
		submit(){
			this.fetching = true
			let startAt = new Date(formatTime(this.date) + ' ' + this.time).getTime() - 8*60*60*1000
			startAt = new Date(startAt)
			startAt = formatTime(startAt, true)
			callContract({ 
				value:0,
				function:"addGame", 
				onRefetch:fetchCount=>{
          this.fetchCount = fetchCount
        },
				args:[this.homeTeamID, this.guestTimeID, startAt],
				success:()=>{this.$Message.info('成功'); this.fetching=false;},
				error:()=>{this.$Message.error('失败');this.fetching=false}
			})
		}
	}


}
</script>
<style scoped>
.editor-page{padding: 12px;}
.row{margin-bottom: 12px;}
</style>