<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.text-link{ color: #175199; outline: none;}
.text-gray{color: #8590a6;}
.text-danger{color:#ed3f14;}
.text-large{font-size: 24px;}
.no-margin-top{margin-top: 0;}

</style>
