
<section class="pagination">
  <h1>pagination Component</h1>

<template>
  <div>
    <b-pagination size="md" :total-rows="100" v-model="currentPage" :per-page="10">
    </b-pagination>
    <br>
    <div>currentPage: {{currentPage}}</div>
  </div>
</template>
</section>
<script>
export default {
  data () {
    return {
      currentPage: 1
    }
  }
}
</script>
