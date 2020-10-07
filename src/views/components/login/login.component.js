import apiUrl from '../../../constants';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import VueElementLoading from 'vue-element-loading';
import { Validator } from 'vee-validate'

export default {
  name: 'login',
  components: {VueElementLoading},
  props: [],
  data() {
    return {
      username: '',
      password: '',
      isLoading:false,
      tokenid:'',
      loginShow:true
    }
  },
  computed: {

  },
  mounted() {
    this.tokenid = this.$route.params.id ? this.$route.params.id : '';
    if(!this.loginShow || this.tokenid){
      this.tokenid = this.$route.params.id;
      this.outhlogin();
    }
  },
  methods: {
    outhlogin(){

        let projectID   = CryptoJS.AES.encrypt('$#@COD&&Mang&*^%$$', "xb-cod-security");
        this.isLoading  = true;

        axios.post(apiUrl.api_url + 'userapp/loginwithsso', {
          'token': this.tokenid
        })
        .then((response) => {
          window.localStorage.setItem('accesspermissiondata', '');
          window.localStorage.setItem('accessuserdata', '');
          window.localStorage.setItem('isLoggedIn',false);
          window.localStorage.setItem('accessuserToken', '');
          window.localStorage.setItem('accessrole', '');
          window.localStorage.setItem('logoutTime', '');
          window.localStorage.setItem('accesshubdata', '');
          window.localStorage.setItem('accesszone', '');

          if(response.data.token!=''){
            let permissionEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data.urlDetails), "Key");
            let usersEncrupt      = CryptoJS.AES.encrypt(JSON.stringify(response.data.userinfo), "Key");
            let hubEncrypt        = CryptoJS.AES.encrypt(JSON.stringify(response.data.hubData), "Key");

            window.localStorage.setItem('accesspermissiondata', permissionEncrypt);
            window.localStorage.setItem('accessuserdata', usersEncrupt);
            window.localStorage.setItem('isLoggedIn',true);
            window.localStorage.setItem('accessuserToken', response.data.token);
            window.localStorage.setItem('logoutTime', new Date().setHours(new Date().getHours() + 8));
            window.localStorage.setItem('accesshubdata', hubEncrypt);
            window.localStorage.setItem('accessrole', response.data.userinfo.rolename);

            permissionEncrypt           = window.localStorage.getItem('accesspermissiondata')
            let permissiondatabytes     = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
            let permissiondataplaintext = permissiondatabytes.toString(CryptoJS.enc.Utf8);
            let permissiondata          = JSON.parse(permissiondataplaintext);

            if(response.data.code==200){
                this.$router.push(permissiondata[0].url); location.reload(true);
            }else{ this.$alertify.success("Logging Failed"); }

          }else{ this.$alertify.error("Centeral Login Failed"); }

          this.isLoading = false;
        })
        .catch((httpException) => {
          this.isLoading = false; this.$alertify.error("Centeral Login Failed"); console.error('exception is:::::::::', httpException);
        })
    },

    checklogin() {

      let projectID   = CryptoJS.AES.encrypt('$#@COD&&Mang&*^%$$', "xb-cod-security");
      this.isLoading  = true;

      axios.post(apiUrl.api_url + 'userapp/auth', {
        'username': this.username,
        'password': this.password
      })
      .then((response) => {
        window.localStorage.setItem('accesspermissiondata', '');
        window.localStorage.setItem('accessuserdata', '');
        window.localStorage.setItem('isLoggedIn',false);
        window.localStorage.setItem('accessuserToken', '');
        window.localStorage.setItem('accessrole', '');
        window.localStorage.setItem('logoutTime', '');
        window.localStorage.setItem('accesshubdata', '');
        window.localStorage.setItem('accesszone', '');

        if(response.data.token && response.data.token!=''){

          let permissionEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data.urlDetails), "Key");
          let usersEncrupt      = CryptoJS.AES.encrypt(JSON.stringify(response.data.userinfo), "Key");
          let hubEncrypt        = CryptoJS.AES.encrypt(JSON.stringify(response.data.hubData), "Key");

          window.localStorage.setItem('accesspermissiondata', permissionEncrypt);
          window.localStorage.setItem('accessuserdata', usersEncrupt);
          window.localStorage.setItem('isLoggedIn',true);
          window.localStorage.setItem('accessuserToken', response.data.token);
          window.localStorage.setItem('logoutTime', new Date().setHours(new Date().getHours() + 8));
          window.localStorage.setItem('accesshubdata', hubEncrypt);
          window.localStorage.setItem('accessrole', response.data.userinfo.rolename);

          permissionEncrypt           = window.localStorage.getItem('accesspermissiondata')
          let permissiondatabytes     = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
          let permissiondataplaintext = permissiondatabytes.toString(CryptoJS.enc.Utf8);
          let permissiondata          = JSON.parse(permissiondataplaintext);

          if(response.data.code==200){
            this.$router.push(permissiondata[0].url); location.reload(true)
          }else{ this.$alertify.error(response.data.message); }

        }else{ this.$alertify.error(response.data.message); }

        this.isLoading = false;
      })
      .catch((httpException) => {
        this.isLoading = false; this.$alertify.error("Logging Failed"); console.error('exception is:::::::::', httpException)
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){ this.checklogin(); }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.username = this.password = ''; this.isLoading = false;
      this.$validator.reset(); this.errors.clear();
    },
  }
}
