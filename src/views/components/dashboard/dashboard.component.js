import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import PieExample from './../../charts/PieExample'

export default {
  name: 'dashboard',
  components: {
      Paginate,
      VueElementLoading,
      PieExample
  },

  data() {
    return {
      cardPer:'',

      cashPer:'',
      ndrPer:'',
      prepaidPer:'',
      walletPer:'',
      zone:'',
      state:'',
      FromDate:'',
      ToDate:'',
      city:'',
      popupZone:'',
      popupState:'',
      PopupCity:'',
      hub:'',
      datacollection:null,
      stateList: [],
      zoneList: [],
      cityList: [],
      hubList: [],
      calcModal: false,
      max: 100,
      pendPerc:0,
      recPerc:0,
      totPerc:0,
      hubCollectionList:[],
      maxCOD:[],
      minCOD:[],
      resultHubCollCount:0
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
    this.getHubWiseCollectionData();
    this.getMaxMinCODCollectionData();
    this.getPieShipmentPercent();

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
    getPieShipmentPercent() {
      let hubidArr = [];
      this.hubList.forEach(function (val) {
        hubidArr.push(val.HubID);
      });

      this.input = ({
          hubids: [139, 401],
          fromdate: this.fromdate,
          todate: this.todate,
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getPieShipmentPercent',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {

              this.cardPer = result.data.cardPer
              this.cashPer = result.data.cashPer
              this.ndrPer = result.data.ndrPer
              this.prepaidPer = result.data.prepaidPer
              this.walletPer = result.data.walletPer

            this.datacollection = {
             labels: ['Prepaid', 'Wallet', 'Card', 'Cash','NDR'],
             datasets: [
               {
                 backgroundColor: [
                   '#41B883',
                   '#E46651',
                   '#00D8FF',
                   '#DD1B16',
                   '#FDCC0D'
                 ],
                 data: [this.prepaidPer, this.walletPer, this.cardPer, this.cashPer,this.ndrPer]

               }
             ]
           }
           console.log("this.datacollection",JSON.stringify(this.datacollection));
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
    saveData(){
      let hubEncrypt = CryptoJS.AES.encrypt(this.hub, "Key");
      window.localStorage.setItem('accesshubdata', hubEncrypt);
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

    //to get Hub Collection
    getHubWiseCollectionData() {

      let hubidArr = [];
      this.hubList.forEach(function (val) {
        hubidArr.push(val.HubID);
      });

      this.input = ({
          hubids: [139, 401],
          fromdate: this.fromdate,
          todate: this.todate,
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'gethubwisecollection',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubCollectionList = result.data.data;
          this.pendPerc = result.data.pendPerc;
          this.recPerc = result.data.recPerc;
          this.totPerc = result.data.totPerc;
          this.resultHubCollCount = result.data.data.length;
        }, error => {
          console.error(error)
        })
    },

    //to get Hub Collection
    getMaxMinCODCollectionData() {
      let hubidArr = [];
      this.hubList.forEach(function (val) {
        hubidArr.push(val.HubID);
      });

      this.input = ({
          hubids: [139, 401],
          fromdate: this.fromdate,
          todate: this.todate,
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getMaxMinCODCollection',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.maxCOD = result.data.MaxCOD;
          this.minCOD = result.data.MinCOD;
        }, error => {
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          // this.state = this.hub =this.city=this.zone = "";
           this.saveData(event);
           this.$alertify.success("Data Submit Successfully");
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },
  }
}
