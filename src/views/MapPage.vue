<template>
  <div class="com-page">
      <single-map></single-map>
  </div>
</template>

<script>
export default {
    components:{
        SingleMap:()=>import('@/components/Map.vue')
    }
}
</script>

<style>

</style>