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
      let projectID = CryptoJS.AES.encrypt('$#@COD&&Mang&*^%$$', "xb-cod-security");
      //let projectInfo = projectID.toString(CryptoJS.enc.Utf8);

      axios.post(apiUrl.api_url + 'userapp/auth', {
          'username': this.username,
          'password': this.password
        })
        .then((response) => {

          if(response.data.code==200){
            this.$router.push('/dashboard');
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
