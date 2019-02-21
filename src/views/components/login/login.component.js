import apiUrl from '../../../constants';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export default {
  name: 'login',
  components: {},
  props: [],
  data() {
    return {
      username: '',
      password: ''
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {

    checklogin() {
      axios.post(apiUrl.api_url + 'userapp/auth', {
          'username': this.username,
          'password': this.password
        })
        .then((response) => {
          //console.log(response);
          if(response.data.code==200){
            this.input = {
              username: this.username,
              password: this.password
            };
            var token = JSON.stringify(response.data.token);
            axios({
              method: "POST",
              url: apiUrl.api_url + "validateUser",
              data: this.input,
              headers: {
                'Authorization': 'Bearer ' + response.data.token
              }
              }).then((response) => {
                if (response.data[0].userdetail.length <= 0) {
                  this.$alertify.error("Login Failed")
                }
                if (response.data[1].permissions.length > 0) {
                  //debugger
                  var permissionEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data[1].permissions), "Key");
                  var userdetailEncrypt = CryptoJS.AES.encrypt(JSON.stringify(response.data[0].userdetail), "Key");
                  window.localStorage.setItem('permissiondata', permissionEncrypt);
                  window.localStorage.setItem('userdetail', userdetailEncrypt);
                  window.localStorage.setItem('isLoggedIn', true);
                  window.localStorage.setItem('userToken', token);

                  var userdetailEncrypt = window.localStorage.getItem('userdetail')
                  var permissionEncrypt = window.localStorage.getItem('permissiondata')
                  var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
                  var permissiondatabytes = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
                  var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                  var permissiondataplaintext = permissiondatabytes.toString(CryptoJS.enc.Utf8);

                  var userdetail = JSON.parse(plaintext);
                  var permissiondata = JSON.parse(permissiondataplaintext);
                  var uasertype = userdetail[0].utype;

                  if (uasertype === null || uasertype === '') {
                    this.$router.push('/'+permissiondata[0].url);
                    this.$alertify.success("Loged In Successfully");
                  } else {
                    this.$router.push('/'+permissiondata[0].url);
                    this.$alertify.success("Loged In Successfully");
                  }

                }
              }).catch((httpException) => {
                //this.$alertify.success("Logging Failed");
                console.error('exception is:::::::::', httpException)
              })
            }else{
              this.$alertify.success("Logging Failed");
            }
          })
        .catch((httpException) => {
          this.$alertify.success("Logging Failed");
          console.error('exception is:::::::::', httpException)
        })
    }
  }
}
