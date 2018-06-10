<template>
  <div class="game-list">
    <Timeline pending>
      <TimelineItem v-for="dayInfo in dayList" :key="dayInfo.day">
        <p class="time">{{dayInfo.day}}</p>
        <game-item @vote="vote" v-for="game in dayInfo.list" :key="game.id" :data="game"/>
      </TimelineItem>
    </Timeline>
  </div>
</template>

<script>
import GameItem from './GameItem'
import {today} from '../utils/'
export default {
  name: 'GameList',
  props:['list'],
  components:{
    GameItem
  },
  computed:{
    dayList(){
      let list = this.list.map((g,i)=>{
        g.id = i
        g.day = today( new Date(g.startAt) )
        return g
      })
      let dayListMap = {}

      list.forEach(g=>{
        let temp = dayListMap[g.day]||[]
        temp.push(g)
        dayListMap[g.day] = temp
      })

      let dayList = []
      for( var day in dayListMap ){
        dayList.push({
          day,
          list: dayListMap[day]
        })
      }
      console.log("dayList", dayList)
      return dayList
    }
  },
  methods:{
    vote(info){
      this.$emit('vote', info)
    }
  }
}
</script>

<style scoped>
.game-list{
  text-align: left;
  padding: 12px;
}
.time{
  font-weight: bold;
  padding: 0 0 12px;
}
</style>
