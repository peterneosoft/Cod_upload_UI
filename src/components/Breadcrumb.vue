<template>
  <div class="breadcrumb">
    <ul>
      <li
        v-for="(breadcrumb, idx) in breadcrumbList"
        :key="idx"
        @click="routeTo(idx)"
        :class="{'linked': !!breadcrumb.link}">

        {{ breadcrumb.name }}

      </li>

      <li style="margin-left:50%">Logged In Hub : {{hub}}</li>
    </ul>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js';

export default {
  name: 'Breadcrumb',
  data () {
    return {
      breadcrumbList: [],
      hub:''
    }
  },
  mounted () {
    this.updateList();

    var hubEncrypt = window.localStorage.getItem('accesshubdata')
    var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
    var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
    var hubArr=JSON.parse(hubtext);
    this.hub = hubArr[0].HubName;
  },
  watch: { '$route' () { this.updateList() } },
  methods: {
    routeTo (pRouteTo) {
      if (this.breadcrumbList[pRouteTo].link) this.$router.push(this.breadcrumbList[pRouteTo].link)
    },
    updateList () { this.breadcrumbList = this.$route.meta.breadcrumb }
  }
}
</script>
<style scoped>
  .breadcrumb {}
  ul {
    display: flex;
    justify-content: left;
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  ul > li {
    display: flex;
    float: left;
    height: 10px;
    width: auto;
    color: $default;
  /*  font-weight: bold; */
    font-size: 1em;
    cursor: default;
    align-items: center;
  }
  ul > li:not(:last-child)::after {
    content: '/';
    float: right;
    font-size: .8em;
    margin: 0 .5em;
    color: $light-default;
    cursor: default;
  }
  .linked {
    cursor: pointer;
    font-size: 1em;
    font-weight: normal;
    color:#4b8cbb !important;
  }
</style>
