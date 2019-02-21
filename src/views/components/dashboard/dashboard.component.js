import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import {
  Validator
} from 'vee-validate'

export default {
  name: 'dashboard',
  components: {},
  props: [],
  data() {
    return {
      systemUserCount: 0,
      appUserCount: 0,
      systemRoleCount: 0,
      appRoleCount: 0,
      totalProjectCount: 0,
      clientusers:0,
      adminuser:0,
      deliverycount:0,
      clientvendorcount:0
    }
  },
  computed: {

  },
  mounted() {
    var userToken = window.localStorage.getItem('userToken')
    this.myStr = userToken.replace(/"/g, '');
    this.getRoleCount();
    this.getUsersCount();
    this.getProjectsCount();
  },
  methods: {
    getRoleCount() {
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'getrolecount',
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          this.systemRoleCount = parseInt(result.data[1]["rolecount"]);
          this.appRoleCount = parseInt(result.data[0]["rolecount"]);
        }, error => {
          console.error(error)
        })
    },
    getUsersCount() {
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'getuserscount',
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          this.clientusers = result.data[0]['clientusercount'];
          this.adminuser = result.data[0]['admincount'];
          this.deliverycount = result.data[0]['Deliverycount'];
          this.clientvendorcount = result.data[0]['ClientVendorcount'];
        }, error => {
          console.error(error)
        })
    },

    getProjectsCount() {
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'getprojectcount',
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          this.totalProjectCount = result.data.count;
        }, error => {
          console.error(error)
        })
    },
    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        console.log('form is valid', this.model)
        event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
