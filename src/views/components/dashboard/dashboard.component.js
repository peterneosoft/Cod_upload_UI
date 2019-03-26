  import apiUrl from '../../../constants'
  import axios from 'axios'
  import CryptoJS from 'crypto-js';
  import { Validator } from 'vee-validate'
  import Paginate from 'vuejs-paginate'
  import VueElementLoading from 'vue-element-loading';

  export default {
    name: 'dashboard',
    components: {
        Paginate,
        VueElementLoading
    },

    data() {
      return {
        zone:'',
        state:'',
        FromDate:'',
        ToDate:'',
        city:'',
        hub:'',
        stateList: [],
        zoneList: [],
        cityList: [],
        hubList: [],
        calcModal: false
      }
    },

    computed: {

    },

    mounted() {
      var userToken = window.localStorage.getItem('accessuserToken')
      this.myStr = userToken.replace(/"/g, '');

      var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
      var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
      var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
      var userdetail        = JSON.parse(plaintext);
      this.localuserid      = userdetail.userid;

      this.getZoneData();

    },

    methods: {
      POPUP() {
          this.calcModal = true
      },
      closeCalcModal() {
          this.calcModal = false

      },

      //to get All Hub List
      getZoneData() {

        this.input = {}
        axios({
            method: 'POST',
            url: apiUrl.api_url + 'external/getallzones',
            data: this.input,
            headers: {
              'Authorization': 'Bearer '+this.myStr
            }
          })
          .then(result => {
            this.zoneList = result.data.zone.data;

          }, error => {
            console.error(error)
          })
      },
      getStateData() {
        if(this.zone==""){
          return false;
        }
        this.input = ({
            statezonename: this.zone
        })
        axios({
            method: 'POST',
            url: apiUrl.api_url + 'external/GetZoneStateList',
            data: this.input,
            headers: {
              'Authorization': 'Bearer '+this.myStr
            }
          })
          .then(result => {
            this.stateList = result.data.state.data;

          }, error => {
            console.error(error)
          })
      },
      getCityData() {
        if(this.state==""){
          return false;
        }
        this.input = ({
            citystatename: this.state
        })
        axios({
            method: 'POST',
            url: apiUrl.api_url + 'external/GetStateCityList',
            data: this.input,
            headers: {
              'Authorization': 'Bearer '+this.myStr
            }
          })
          .then(result => {
            this.cityList = result.data.city.data;
          }, error => {
            console.error(error)
          })
      },
      getHubData() {
        if(this.city==""){
          return false;
        }
        this.input = ({
            cityname: this.city
        })
        axios({
            method: 'POST',
            url: apiUrl.api_url + 'external/GetCityHubList',
            data: this.input,
            headers: {
              'Authorization': 'Bearer '+this.myStr
            }
          })
          .then(result => {
            this.hubList = result.data.hub.data;
          }, error => {
            console.error(error)
          })
      },
      onSubmit: function(event) {
        this.$validator.validateAll().then((result) => {
          if(result){
            // this.state = this.hub =this.city=this.zone = "";
             this.$alertify.success("Data Submit Successfully");
           }
        }).catch(() => {
          console.log('errors exist', this.errors)
        });
      },
    }
  }
