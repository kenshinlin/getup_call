<template>
    <div>
        {{index+1}} - 
        {{data.username}}
        <span>{{data.callTimes}}</span>
    </div>
</template>

<script>
  import RangeItem from '@/components/RangeItem'

  export default {
    props:["data", "index"]
  }
</script>
