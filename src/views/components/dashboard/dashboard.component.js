import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import {Chart} from 'highcharts-vue'
import PieExample from './../../charts/PieExample'

export default {
  name: 'dashboard',
  components: {
      Paginate,
      VueElementLoading,
      PieExample,
      highcharts:Chart
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
      FromDate:null,
      ToDate:null,
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
      resultHubCollCount:0,
    piechart: {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
           text: 'Total Orders'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: false,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                  connectorColor: 'silver'
                },showInLegend: true
              }
            },
            credits: {
              enabled: false
            },
            series: {
              name: 'Share',
              colorByPoint: true,
              data: []
            },
          }
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
          fromdate: this.FromDate,
          todate: this.ToDate,
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

              let y = [this.prepaidPer,this.walletPer,this.cardPer,this.cashPer,this.ndrPer,]
              let name = ["Prepaid","Wallet","Card","Cash","NDR"]
              let chartDataObj = {};
                  for(let i=0;i<y.length;i++){
                    chartDataObj.y = parseFloat(y[i]);
                    chartDataObj.name = name[i];
                    this.piechart.series.data.push(chartDataObj)
                    chartDataObj ={}
                  }
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
