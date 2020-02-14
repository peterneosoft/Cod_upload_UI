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
    if(!this.loginShow){
      //console.log("hi");
      this.tokenid=this.$route.params.id;
      this.outhlogin();
    }

  },
  methods: {
    outhlogin(){

        let projectID = CryptoJS.AES.encrypt('$#@COD&&Mang&*^%$$', "xb-cod-security");
        //let projectInfo = projectID.toString(CryptoJS.enc.Utf8);
        this.isLoading = true;
        axios.post(apiUrl.api_url + 'userapp/loginwithsso', {
          'token': this.tokenid
        })
        .then((response) => {
          window.localStorage.setItem('accesspermissiondata', '');
          window.localStorage.setItem('accessuserdata', '');
          window.localStorage.setItem('isLoggedIn',false);
          window.localStorage.setItem('accessuserToken', '');

          if(response.data.token!=''){
            let permissionEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data.urlDetails), "Key");
            let usersEncrupt = CryptoJS.AES.encrypt(JSON.stringify(response.data.userinfo), "Key");
            window.localStorage.setItem('accesspermissiondata', permissionEncrypt);
            window.localStorage.setItem('accessuserdata', usersEncrupt);
            window.localStorage.setItem('isLoggedIn',true);
            window.localStorage.setItem('accessuserToken', response.data.token);
            permissionEncrypt = window.localStorage.getItem('accesspermissiondata')
            let permissiondatabytes = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
            let permissiondataplaintext = permissiondatabytes.toString(CryptoJS.enc.Utf8);
            let permissiondata = JSON.parse(permissiondataplaintext);

            if(response.data.code==200){
                this.isLoading = false;
                this.$router.push(permissiondata[0].url);
            }else{
              this.isLoading = false;
              this.$alertify.success("Logging Failed");
            }

            let hubEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data.hubData), "Key");
            window.localStorage.setItem('accesshubdata', hubEncrypt);
          }else{
            this.isLoading = false;
            this.$alertify.error("Centeral Login Failed");
          }

        })
        .catch((httpException) => {
          this.isLoading = false;
          this.$alertify.error("Centeral Login Failed");
          console.error('exception is:::::::::', httpException)
        })
    },
    checklogin() {
      let projectID = CryptoJS.AES.encrypt('$#@COD&&Mang&*^%$$', "xb-cod-security");
      //let projectInfo = projectID.toString(CryptoJS.enc.Utf8);
      this.isLoading = true;
      axios.post(apiUrl.api_url + 'userapp/auth', {
        'username': this.username,
        'password': this.password
      })
      .then((response) => {
        window.localStorage.setItem('accesspermissiondata', '');
        window.localStorage.setItem('accessuserdata', '');
        window.localStorage.setItem('isLoggedIn',false);
        window.localStorage.setItem('accessuserToken', '');

        if(response.data.token!=''){
          let permissionEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data.urlDetails), "Key");
          let usersEncrupt = CryptoJS.AES.encrypt(JSON.stringify(response.data.userinfo), "Key");
          window.localStorage.setItem('accesspermissiondata', permissionEncrypt);
          window.localStorage.setItem('accessuserdata', usersEncrupt);
          window.localStorage.setItem('isLoggedIn',true);
          window.localStorage.setItem('accessuserToken', response.data.token);
          permissionEncrypt = window.localStorage.getItem('accesspermissiondata')
          let permissiondatabytes = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
          let permissiondataplaintext = permissiondatabytes.toString(CryptoJS.enc.Utf8);
          let permissiondata = JSON.parse(permissiondataplaintext);

          if(response.data.code==200){
              this.isLoading = false;
              this.$router.push(permissiondata[0].url);
              location.reload(true);
          }else{
            this.isLoading = false;
            this.$alertify.error("Logging Failed");
          }

          let hubEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data.hubData), "Key");
          window.localStorage.setItem('accesshubdata', hubEncrypt);
        }else{
          this.isLoading = false;
          this.$alertify.error("Logging Failed");
        }

      })
      .catch((httpException) => {
        this.isLoading = false;
        this.$alertify.error("Logging Failed");
        console.error('exception is:::::::::', httpException)
      })
    },
    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.checklogin();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },
  }
}
