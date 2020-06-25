<style>
.dropdown-menu{
  top: 20px;
  right: -2px
}
.dropdown-hub{
  height: 355px;
  max-height: 251px;
  overflow-x: hidden;
}
</style>

<template>
  <div class="breadcrumb">
    <ul>
      <li v-for="(breadcrumb, idx) in breadcrumbList" :key="idx" @click="routeTo(idx)" :class="{'linked': !!breadcrumb.link}">
        {{ breadcrumb.name }}
      </li>

      <li v-if="this.hubAccess.length<2" style="right: 2%; position: absolute;"><b>Logged In Hub:</b>&nbsp;{{hub}}</li>

      <li v-if="this.hubAccess.length>1" style="right: 8%; width: 28%; position: absolute;"><b>Change Hub:</b>&nbsp;
        <Multiselect :options="hubAccess" @input="setHUBAccess()" name="hubdropdown" id="hubdropdown" v-model="hubdropdown" placeholder="Select Hub" label="HubName" track-by="HubID" :optionHeight="100" :hide-selected="true" style="margin: 2px -95px 9px 15px; width: 90%; z-index:1000;margin-right: -92px;">
           <template slot="noResult"><p>No Record Found.</p></template>
        </Multiselect>
      </li>
    </ul>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js';
import apiUrl from '../constants'
import axios from 'axios'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'Breadcrumb',
  components: {
      Multiselect
  },
  data () {
    return {
      breadcrumbList: [],
      hub:[],
      userToken:'',
      userdetail:'',
      HubId:'',
      hubAccess:[],
      hubdropdown:[],
    }
  },
  mounted () {
    this.updateList();

    var hubEncrypt  = window.localStorage.getItem('accesshubdata')
    var hubbytes    = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
    var hubtext     = hubbytes.toString(CryptoJS.enc.Utf8);
    var hubArr      = JSON.parse(hubtext);
    this.hub        = hubArr[0].HubName;
    this.hubdropdown= hubArr;


    this.userToken = window.localStorage.getItem('accessuserToken').replace(/"/g, '');

    let userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    let bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    this.userdetail       = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    this.getHUBAccess();
  },
  watch: { '$route' () { this.updateList() } },
  methods: {
    routeTo (pRouteTo) {
      if (this.breadcrumbList[pRouteTo].link) this.$router.push(this.breadcrumbList[pRouteTo].link)
    },
    updateList () { this.breadcrumbList = this.$route.meta.breadcrumb },

    getHUBAccess() {
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getHUBAccess',
          data: { userid:this.userdetail.userid, username:this.userdetail.username },
          headers: {
            'Authorization': 'Bearer '+this.userToken
          }
        })
        .then(result => {

          if(result.data.code==200){
            this.hubAccess = result.data.data;
          }else{
            this.hubAccess = [];
          }
        }, error => {
          console.error(error)
        })
    },

    setHUBAccess() {
      let HubObj = '';
      HubObj = this.hubdropdown;

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/setHUBAccess',
          data: { HubID: HubObj.HubID, userid:this.userdetail.userid, username:this.userdetail.username },
          headers: {
            'Authorization': 'Bearer '+this.userToken
          }
        })
        .then(result => {
          if(result.data.code==200){

            let newArr = []; newArr.push(HubObj);
            let hubEncrypt = CryptoJS.AES.encrypt(JSON.stringify(newArr), "Key");
            window.localStorage.setItem('accesshubdata', '');
            window.localStorage.setItem('accesshubdata', hubEncrypt);

            if(window.localStorage.getItem('accesshubdata')){
              //document.getElementById('logout').click();
              location.reload();
            }
            this.$alertify.success(result.data.msg);
            //this.$alertify.success('Hub Updated Successfully, Please Re-login.');
          }else{
            this.$alertify.error(result.data.msg);
          }
        }, error => {
          console.error(error)
        })
    },
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
