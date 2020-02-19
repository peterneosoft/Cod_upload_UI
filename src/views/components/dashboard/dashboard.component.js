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
      barLoading: false,
      pieLoading: false,
      amountLoading: false,
      collectionLoading: false,
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
      Search:0,
      hubCollectionList:[],
      maxCOD:[],
      minCOD:[],
      resultHubCollCount:"",
      zoneid:"",
      stateid:"",
      cityid:"",
      localhubid:"",
      localhubname:"",
      resultdate:"",
      searchComponent: false,
      barComponent: false,
      pieComponent: false,
      amountComponent: false,
      collectionComponent: false,
      zoneLoading: false,
      stateLoading: false,
      cityLoading: false,
      piechart: {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        title: {
           text: '<b>Total Orders</b>'
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
    this.localhubname     = hubdetail[0].HubName;

    this.BarChart.title.text =  '<b>'+hubdetail[0].HubName+'</b>';

    this.getZoneData();
    this.getHubWiseCollectionData();
    this.getPieShipmentPercent();

    var date = new Date();
    ToDate.max = FromDate.max = date.toISOString().split("T")[0];

    var permissiondataEncrypt = window.localStorage.getItem('accesspermissiondata')
    var bytes                 = CryptoJS.AES.decrypt(permissiondataEncrypt.toString(), 'Key');
    var plaintext             = bytes.toString(CryptoJS.enc.Utf8);
    var permissiondata        = JSON.parse(plaintext);
    let DashboardArr          = permissiondata.filter(function (val) {
        return val.name == "Dashboard";
    });

    let childrenArr = DashboardArr[0]["children"];

    for (var i = 0; i < childrenArr.length; i++) {
        if (childrenArr[i].name === 'searchComponent') this.searchComponent = true;
        if (childrenArr[i].name === 'barComponent') this.barComponent = true;
        if (childrenArr[i].name === 'pieComponent') this.pieComponent = true;
        if (childrenArr[i].name === 'amountComponent') this.amountComponent = true;
        if (childrenArr[i].name === 'collectionComponent') this.collectionComponent = true;
    }
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
      this.zone = this.state = this.city = ""; this.stateList = [];
      this.input = {}
      this.zoneLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.zoneLoading = false;
          this.zoneList = [{hubzoneid:'0', hubzonename:'All Zone', hubzonecode:'All Zone'}].concat(result.data.zone.data);
        }, error => {
          this.zoneLoading = false;
          console.error(error)
        })
    },

    getPieShipmentPercent() {
      this.input = ({
          hubids: [this.localhubid]
      })
      this.pieLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getPieShipmentPercent',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.resultdate = result.data.fdate+" to "+result.data.tdate
          let tot = parseFloat(result.data.prepaidPer)+parseFloat(result.data.walletPer)+parseFloat(result.data.cardPer)+parseFloat(result.data.cashPer)+parseFloat(result.data.ndrPer)+parseFloat(result.data.payphiPer);

          if((result.data.code == 200) && (tot > 0)){

            let y = [result.data.prepaidPer,result.data.walletPer,result.data.cardPer,result.data.cashPer,result.data.ndrPer,result.data.payphiPer]
            let name = ["Prepaid","Wallet","Card","Cash","NDR","PayPhi"]
            let chartDataObj = {};
            for(let i=0;i<y.length;i++){
              chartDataObj.y    = parseFloat(y[i]);
              chartDataObj.name = name[i];
              this.piechart.series.data.push(chartDataObj)
              chartDataObj = {}
            }
            this.pieLoading = false;
          }else{

            let chartDataObj  = {};
            chartDataObj.y    = parseFloat(1);
            chartDataObj.name = "No data to display";

            this.piechart.series.data.push(chartDataObj);
            this.piechart.tooltip.pointFormat = 'Series 1: <b>0%</b>';
            this.pieLoading = false;
          }

        }, error => {
          this.pieLoading = false;
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
          hubids: (this.hubArray[0])?this.hubArray[0]:0,
          fromdate: this.FromDate,
          todate: this.ToDate,
      })
      this.pieLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getPieShipmentPercent',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.resultdate = result.data.fdate+" to "+result.data.tdate;
          this.hubArray   = [];
          let tot = parseFloat(result.data.prepaidPer)+parseFloat(result.data.walletPer)+parseFloat(result.data.cardPer)+parseFloat(result.data.cashPer)+parseFloat(result.data.ndrPer)+parseFloat(result.data.payphiPer);

          if((result.data.code == 200) && (tot > 0)){

            let y             = [result.data.prepaidPer,result.data.walletPer,result.data.cardPer,result.data.cashPer,result.data.ndrPer,result.data.payphiPer]
            let name          = ["Prepaid","Wallet","Card","Cash","NDR","PayPhi"]
            let chartDataObj  = {};

            for(let i=0;i<y.length;i++){
              chartDataObj.y    = parseFloat(y[i]);
              chartDataObj.name = name[i];
              this.piechart.series.data.push(chartDataObj)
              chartDataObj = {}
            }
            this.pieLoading = false;
          }else{

            let chartDataObj  = {};
            chartDataObj.y    = parseFloat(1);
            chartDataObj.name = "No data to display";

            this.piechart.series.data.push(chartDataObj);
            this.piechart.tooltip.pointFormat = 'Series 1: <b>0%</b>';
            this.pieLoading = false;
          }
        }, error => {
          this.pieLoading = false;
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
      this.amountLoading = true; this.barLoading = true; this.pieLoading = true; this.collectionLoading = true;
      let filter ="";
      let id = 0;
      if(this.city){
        filter = "city"
        id = event.target[2].selectedOptions[0].attributes.isid.nodeValue;
        this.BarChart.title.text = '<b>'+this.city+'</b>'
      }else if(this.state){
        filter = "state"
        id = event.target[1].selectedOptions[0].attributes.isid.nodeValue;
        this.BarChart.title.text = '<b>'+this.state+'</b>'
      }else {
        filter = "zone"
        id = event.target[0].selectedOptions[0].attributes.isid.nodeValue;
        this.BarChart.title.text = '<b>'+this.zone+'</b>'
      }
      this.input = ({
          filter: filter,
          id: id
      })

      if(filter == 'zone' && id == 0){

        let date1 = new Date(this.FromDate);
        let date2 = new Date(this.ToDate);
        let diffTime = Math.abs(date2 - date1);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if(diffDays > 30){
          document.getElementById("fdate").innerHTML="Difference between From date & To date should not be greater than 30 days.";
          this.amountLoading = false; this.barLoading = false; this.pieLoading = false; this.collectionLoading = false; this.Search = 1;
          return false;
        }else{
          this.getPieShipmentPercentSearch()
          this.getHubWiseCollectionDataSearch()
        }
      }else{
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

            this.amountLoading = false; this.barLoading = false; this.pieLoading = false; this.collectionLoading = false;
          }
        }, error => {
          this.amountLoading = false; this.barLoading = false; this.pieLoading = false; this.collectionLoading = false;
          console.error(error)
          this.$alertify.error('Error Occured');
        })
      }
    },

    getStateData() {
      this.state = this.city = ""; this.stateList = this.cityList = [];
      if(this.zone=="" ){
        return false;
      }
      this.input = ({
          statezonename: this.zone
      })
      this.stateLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/GetZoneStateList',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.stateLoading = false;
          this.stateList = result.data.state.data;
        }, error => {
          this.stateLoading = false;
          console.error(error)
        })
    },

    getCityData() {
      this.city = ""; this.cityList = [];
      if(this.state==""){
        return false;
      }
      this.input = ({
          citystatename: this.state
      })
      this.cityLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/GetStateCityList',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.cityLoading = false;
          this.cityList = result.data.city.data;
        }, error => {
          this.cityLoading = false;
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
      this.amountLoading = true; this.barLoading = true; this.collectionLoading = false;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'gethubwisecollection',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.resultdate = result.data.fdate+" to "+result.data.tdate

          if(result.data.code == 200){
            this.hubCollectionList = result.data.data;
            this.pendPerc = result.data.pendPerc;
            this.recPerc = result.data.recPerc;
            this.totPerc = result.data.totPerc;
            this.resultHubCollCount = result.data.data.length;

            this.maxCOD = result.data.MaxCOD;
            this.minCOD = result.data.MinCOD;

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
            this.amountLoading = false; this.barLoading = false; this.collectionLoading = false;
          }else{
             this.hubCollectionList = [];
             this.resultHubCollCount  = 0

             this.maxCOD = {
               hubname:this.localhubname,
               received:'0.00',
             };
             this.minCOD = {
               hubname:this.localhubname,
               received:'0.00',
             };

             let y = [0,0,0]
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
             this.amountLoading = false; this.barLoading = false; this.collectionLoading = false;
          }
        }, error => {
          this.amountLoading = false; this.barLoading = false; this.collectionLoading = false;
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
          hubids: (this.hubArray[0])?this.hubArray[0]:0,
          fromdate: this.FromDate,
          todate: this.ToDate,
      })
      this.amountLoading = true; this.barLoading = true; this.collectionLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'gethubwisecollection',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.resultdate = result.data.fdate+" to "+result.data.tdate
          if(result.data.code == 200){
            this.hubCollectionList = result.data.data;
            this.pendPerc = result.data.pendPerc;
            this.recPerc = result.data.recPerc;
            this.totPerc = result.data.totPerc;
            this.resultHubCollCount = result.data.data.length;

            this.maxCOD = result.data.MaxCOD;
            this.minCOD = result.data.MinCOD;

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
            this.amountLoading = false; this.barLoading = false; this.collectionLoading = false;
          }else{
             this.resultdata = true;
             this.hubCollectionList = [];
             this.resultHubCollCount  = 0;

             this.maxCOD = {
               hubname:this.localhubname,
               received:'0.00',
             };
             this.minCOD = {
               hubname:this.localhubname,
               received:'0.00',
             };

             let y = [0,0,0]
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
             this.amountLoading = false; this.barLoading = false; this.collectionLoading = false;
          }
        }, error => {
          this.amountLoading = false; this.barLoading = false; this.collectionLoading = false;
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validate().then((result) => {
        if(result){
            this.Search = 0; this.amountLoading = true; this.barLoading = true; this.pieLoading = true; this.collectionLoading = true;
            this.getHubIdsArray(event);
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.FromDate = this.ToDate = ''; this.zone = this.state = this.city ='';
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
