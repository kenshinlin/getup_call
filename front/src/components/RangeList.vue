<template>
    <div>
        <range-item v-for="(item, index) in list " :key="item.username" :data="item" :index="index"/>
    </div>
</template>

<script>
  import RangeItem from '@/components/RangeItem'

  export default {
    props:["list"],
    components: {
      RangeItem
    }
  }
</script>
