<template>
  <div class="app">
    <AppHeader/>
    <div class="app-body">
      <Sidebar/>
      <main class="main">
        <breadcrumb :list="list"/>
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
      <AppAside/>
    </div>
    <AppFooter/>
  </div>
</template>

<script>
//import nav from '../_nav'
import { Header as AppHeader, Sidebar, Aside as AppAside, Footer as AppFooter, Breadcrumb } from '../components/'
import CryptoJS from 'crypto-js';
import axios from 'axios';
import apiUrl from '../constants'
export default {
  name: 'full',
  components: {
    AppHeader,
    Sidebar,
    AppAside,
    AppFooter,
    Breadcrumb
  },
  data () {
    return {
  //    nav: nav.items
    }
  },
  computed: {
    name () {
      return this.$route.name
    },
    list () {
      let t2 = new Date().setHours(new Date().getHours());
      if(window.localStorage.getItem('logoutTime') && window.localStorage.getItem('logoutTime') < t2){
        this.logout();
      }else{
        return this.$route.matched
      }
    }
  },
  methods: {
    logout() {
      let userToken = window.localStorage.getItem('accessuserToken').replace(/"/g, '');

      let userdetailEncrypt = window.localStorage.getItem('accessuserdata')
      let bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
      let userdetail        = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'userapp/logout',
        data: { userid:userdetail.userid },
        headers: {
          'Authorization': 'Bearer '+userToken
        }
      })
      .then((response) => {

        localStorage.removeItem('accesshubdata')
        localStorage.removeItem('accesspermissiondata')
        localStorage.removeItem('accessuserdata')
        localStorage.removeItem('accessuserToken')
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('logoutTime')
        localStorage.removeItem('accessrole')
        this.$router.push('/login')
      })
      .catch((httpException) => {
        console.error('exception is:::::::::', httpException)
      })
    }
  }
}
</script>
