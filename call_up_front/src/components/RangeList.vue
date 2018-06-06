<template>
    <div class="range-list">
      <div class="panel" v-show="list.length<1">无数据</div>
      <range-item v-for="(item, index) in list " :type="type" :key="item.username" :data="item" :index="index"/>
    </div>
</template>

<script>
  import RangeItem from '@/components/RangeItem'

  export default {
    props:["list", 'type'],
    components: {
      RangeItem
    }
  }
</script>

<style>
.range-list{
  /* min-height: 170px; */
}
</style>
