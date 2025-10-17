<template>
  <titleBar close min full :isPosition="false"/>
  <div class="home_wrapper">
    <div class="home_left"><Menu /></div>
    <div class="home_right"><Content /></div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive } from 'vue'
import Menu from './Menu/Menu.vue'
import Content from './Content/Content.vue'
import titleBar from '@/components/titleBar/titleBar.vue'

</script>

<style lang="scss" scoped>
.home_wrapper {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  .home_left {
    flex: 0 0 65px;
    height: 100%;
  }
  .home_right {
    flex: 1;
    height: 100%;
  }
}
</style>