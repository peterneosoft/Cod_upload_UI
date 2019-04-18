import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import {Chart} from 'highcharts-vue'

export default {
  name: 'dashboard',
  components: {
      Paginate,
      VueElementLoading,
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
      result:false,
      resultdata:false,
      popupZone:'',
      popupState:'',
      PopupCity:'',
      hub:'',
      datacollection:null,
      stateList: [],
      hubArray: [],
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
      resultHubCollCount:"",
       zoneid:"",
       stateid:"",
       cityid:"",
       localhubid:"",
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
          },

        BarChart: {
          chart: {
              type: 'bar',
              inverted:true
          },
          title: {
              text:""

          },
          xAxis: {
              type: 'category'
          },
          yAxis: {
            title: {
                text:null

            }
          },
          credits: {
            enabled: false
          },
          legend: {
              enabled: false
          },
          plotOptions: {
              series: {
                  borderWidth: 0,
                  dataLabels: {
                      enabled: true,
                      format: '{point.y:.1f}%'
                  }
              }
          },
          tooltip: {
              headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
              pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
          },

       series: [{
            name: "",
            colorByPoint: true,
            data: []
         }]
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

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;

    this.BarChart.title.text =  hubdetail[0].HubName

    this.getZoneData();
    this.getHubWiseCollectionData();
    this.getMaxMinCODCollectionData();
    this.getPieShipmentPercent();

    var date = new Date();
    ToDate.max = FromDate.max = date.toISOString().split("T")[0];
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
      this.input = ({
          hubids: [this.localhubid]
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

    getPieShipmentPercentSearch() {
      if(this.FromDate == ""){
       this.FromDate =  null
      }
      if(this.ToDate == ""){
       this.ToDate =  null
      }
      this.piechart.series.data = [];
      this.input = ({
          hubids: this.hubArray[0],
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
          if(result.data.code == 200){
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
            this.hubArray=[];
            this.result = false;
          }
          if(result.data.code == 204){
            this.hubArray=[];
            this.result = true;
          }

        }, error => {
          console.error(error)
        })
    },

    getHubIdsArray(event) {

      if(this.FromDate > this.ToDate){
         document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
         return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      let filter ="";
      let id = 0;
      if(this.city){
        this.cityid = event.target[2].selectedOptions[0].attributes.title.nodeValue;
        filter = "city"
        id = this.cityid
        this.BarChart.title.text = this.city
      }else if(this.state){
        this.stateid = event.target[1].selectedOptions[0].attributes.title.nodeValue;
        filter = "state"
        id = this.stateid
        this.BarChart.title.text = this.state
      }else {
        this.zoneid = event.target[0].selectedOptions[0].attributes.title.nodeValue;
        filter = "zone"
        id = this.zoneid
        this.BarChart.title.text = this.zone
      }
      this.input = ({
          filter: filter,
          id: id
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getHubIdsArray',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
          this.hubArray.push(result.data.hubids)
          this.getPieShipmentPercentSearch()
          this.getHubWiseCollectionDataSearch()
          this.getMaxMinCODCollectionDataSearch()
        }else{
          this.hubCollectionList  = [];
          this.resultHubCollCount  = 0;
          this.maxCOD = [];
          this.minCOD = [];
          this.BarChart.series.map(chart=>{
          chart.data = [];
           })
          this.resultdata = true;
          this.piechart.series.data = [];
          this.result = true;
          this.$alertify.success("No Record Found");
        }
        }, error => {
          console.error(error)
        })
    },

    getStateData() {
      this.state = "";
      this.city = "";
      if(this.zone=="" ){
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
      this.city = "";
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

    //to get Hub Collection
    getHubWiseCollectionData() {
      this.input = ({
          hubids: [this.localhubid]
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
          if(result.data.code == 200){
          this.hubCollectionList = result.data.data;
          this.pendPerc = result.data.pendPerc;
          this.recPerc = result.data.recPerc;
          this.totPerc = result.data.totPerc;
          this.resultHubCollCount = result.data.data.length;

          let y = [this.pendPerc,this.recPerc,this.totPerc]
          let name = ["Pending","Received","Total Amount"]
          let barDataObj = {};
              for(let i=0;i<y.length;i++){
                barDataObj.y = parseFloat(y[i]);
                barDataObj.name = name[i];
                this.BarChart.series.map(chart=>{
                  chart.data.push(barDataObj)
                })
                barDataObj ={}
              }
              this.hubArray=[];
        }
        if(result.data.code == 204){
           this.hubCollectionList = [];
           this.resultHubCollCount  = 0
            this.hubArray=[];
        }
        }, error => {
          console.error(error)
        })
    },

    getHubWiseCollectionDataSearch() {
      if(this.FromDate == ""){
       this.FromDate =  null
      }
      if(this.ToDate == ""){
       this.ToDate =  null
      }
      this.BarChart.series.map(chart=>{
      chart.data = [];
      })

      this.input = ({
          hubids: this.hubArray[0],
          fromdate: this.FromDate,
          todate: this.ToDate,
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
          if(result.data.code == 200){
          this.hubCollectionList = result.data.data;
          this.pendPerc = result.data.pendPerc;
          this.recPerc = result.data.recPerc;
          this.totPerc = result.data.totPerc;
          this.resultHubCollCount = result.data.data.length;

          let y = [this.pendPerc,this.recPerc,this.totPerc]
          let name = ["Pending","Received","Total Amount"]
          let barDataObj = {};
              for(let i=0;i<y.length;i++){
                barDataObj.y = parseFloat(y[i]);
                barDataObj.name = name[i];
                this.BarChart.series.map(chart=>{
                chart.data.push(barDataObj)
                })
                barDataObj ={}
              }
              this.resultdata = false;
        }
        if(result.data.code == 204){
           this.resultdata = true;
           this.hubCollectionList = [];
           this.BarChart.series.data =[];
           this.resultHubCollCount  = 0;
        }
        }, error => {
          console.error(error)
        })
    },

    //to get Hub Collection
    getMaxMinCODCollectionData() {
      this.input = ({
          hubids: [this.localhubid]
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

          if(result.data.code == 200){
          this.maxCOD = result.data.MaxCOD;
          this.minCOD = result.data.MinCOD;
        }else{
          this.$alertify.success("No Record Found");
        }
        }, error => {
          console.error(error)
        })
    },

    getMaxMinCODCollectionDataSearch() {
      if(this.FromDate == ""){
       this.FromDate =  null
      }
      if(this.ToDate == ""){
       this.ToDate =  null
      }
      this.input = ({
          hubids: this.hubArray[0],
          fromdate: this.FromDate,
          todate: this.ToDate
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

          if(result.data.code == 200){
          this.maxCOD = result.data.MaxCOD;
          this.minCOD = result.data.MinCOD;
        }
        if(result.data.code == 204){
            this.maxCOD = [];
            this.minCOD = [];
        }
        }, error => {
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validate().then((result) => {
        if(result){
           this.getHubIdsArray(event);
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },
  }
}
