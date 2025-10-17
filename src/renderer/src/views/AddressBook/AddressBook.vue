<template>
  <div class="address_book_wrapper">
    <AddressBookList />
    <AddressBookApplyList />
  </div>
</template>

<script lang='ts' setup>
import AddressBookList from './components/AddressBookList.vue'
import AddressBookApplyList from './components/AddressBookApplyList.vue'
import { ref, reactive } from 'vue'

</script>

<style lang="scss" scoped>
.address_book_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>