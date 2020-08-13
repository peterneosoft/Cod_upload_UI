import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';

export default {
  name: 'invoicereport',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  props: [],

  data() {
    return {
      category:'RSC',
      invoiceno:'',
      zone:[],
      shipmenttype:'',
      srname:'',
      toDate:'',
      fromDate:'',
      RSCName:[],
      HubName:[],
      zoneList:[],
      zoneIdArr:[],
      shipmentList:[],
      HubRSCList:[],
      invoiceLedger:[],
      resultCount:'',
      pageno:0,
      pagecount:0,
      isLoading:false,
      excelLoading: false,
      exportf:false,
      zoneLoading:false,
      hubLoading:false,
      RSCLoading:false,
      shipmentLoading:false,
      srLoading:false,
      reportlink:'',
      localusername:''
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localusername    = userdetail.username;

    this.getZoneData();
    this.getBusinessConfig();
  },

  methods: {
    addHubData(event) {
      this.HubRSCList = []; this.HubName = []; this.RSCName = [];

      if(this.category && this.zone.hubzoneid){
        this.getHubRSCData(this.category, this.zone.hubzoneid);
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getInvoiceSummaryReport()
    },

    exportHubWiswData(){
      this.reportlink = '';

      let hubArr = []; let RSCArr = [];
      if(this.SearchHubIds.length>0){
        hubArr = this.SearchHubIds;
      }else{
        if($.isArray(this.HubId) === false){
          this.HubId = new Array(this.HubId);
        }

        this.HubId.forEach(function (val) {
          hubArr.push(val.HubID);
        });
      }

      if(this.SearchRSCIds.length>0){
        RSCArr = this.SearchRSCIds;
      }else{
        if($.isArray(this.RSCName) === false){
          this.RSCName = new Array(this.RSCName);
        }

        this.RSCName.forEach(function (val) {
          RSCArr.push(val.HubID);
        });
      }

      let hubIdArr = [...new Set([].concat(...hubArr.concat(RSCArr)))];

      this.input = ({
          hubid: hubIdArr,
          zoneid: this.zoneIdArr,
          status: this.status,
          fromdate: this.fromDate,
          todate: this.toDate
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'exportHubWiseCODReports',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          //this.getDownloadCsvObject(result.data.data);
          this.exportf=true;
          this.reportlink = result.data.data;
        }else{
           this.exportf = false; this.reportlink = '';
        }
      }, error => {
         this.exportf = false; this.reportlink = '';
        console.error(error)
      })
    },

    exportreport(){
      this.excelLoading = true;
      if(this.reportlink){
        window.open(this.reportlink);
        this.excelLoading = false;
      }else{
        this.excelLoading = false;
      }
    },

    getInvoiceSummaryReport(){
      console.log('category==', this.category, 'invoiceno==', this.invoiceno, 'RSCName==', this.RSCName);
      console.log('zone==', this.zone, 'shipmenttype==', this.shipmenttype);
      console.log('toDate==', this.toDate, 'fromDate==', this.fromDate, 'HubName==', this.HubName);

      if(this.fromDate > this.toDate){
         document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
         return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      this.isLoading = true;

      let hubArr = []; let RSCArr = [];
      if(this.SearchHubIds.length>0){
        hubArr = this.SearchHubIds;
      }else{
        if($.isArray(this.HubId) === false){
          this.HubId = new Array(this.HubId);
        }

        this.HubId.forEach(function (val) {
          hubArr.push(val.HubID);
        });
      }

      if(this.SearchRSCIds.length>0){
        RSCArr = this.SearchRSCIds;
      }else{
        if($.isArray(this.RSCName) === false){
          this.RSCName = new Array(this.RSCName);
        }

        this.RSCName.forEach(function (val) {
          RSCArr.push(val.HubID);
        });
      }

      let hubIdArr = [...new Set([].concat(...hubArr.concat(RSCArr)))];

      this.input = ({
          hubid: hubIdArr,
          zoneid: this.zoneIdArr,
          fromdate: this.fromDate,
          todate: this.toDate,
          status: this.status,
          offset:this.pageno,
          limit:10
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getInvoiceSummaryReport',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.invoiceLedger = result.data.data;
            this.isLoading = false;
            let totalRows = result.data.count
            this.resultCount = result.data.count
            if (totalRows < 10) {
                 this.pagecount = 1
             } else {
                 this.pagecount = Math.ceil(totalRows / 10)
             }
             this.exportHubWiswData();
           }else{
             this.invoiceLedger = [];
             this.isLoading = false;
             this.resultCount = 0;
           }
          },
           error => {
             this.isLoading = false;
             console.error(error)
        })
    },

    //to get All Zone List
    getZoneData() {
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
          this.zoneList = result.data.zone.data;
        }, error => {
          this.zoneLoading = false;
          console.error(error)
        })
    },

    //to get All Business Configuration list
    getBusinessConfig() {
      this.input = ({
          username: this.localusername
      })
      this.shipmentLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getBusinessConfig',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.shipmentLoading = false;
          this.shipmentList = result.data.data;
        }, error => {
          this.shipmentLoading = false;
          console.error(error)
        })
    },

    //to get Zone Wise Hub/RSC List
    getHubRSCData(category, zoneid) {
      this.input = ({
          entity: category,
          zoneid: zoneid,
          username: this.localusername
      })
      this.hubLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getEntityDetails',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubLoading = this.RSCLoading = false;

          if(result.data.code==200){
            this.HubRSCList = result.data.data;
          }
        }, error => {
          this.hubLoading = this.RSCLoading = false;
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0; this.exportf = false;
          this.getInvoiceSummaryReport()
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.fromDate = this.toDate = this.zone = ''; this.HubRSCList = this.HubName = this.RSCName = this.invoiceLedger = [];
      this.pageno = this.resultCount = 0; this.category = 'RSC'; this.exportf = false;
      this.$validator.reset();
      this.errors.clear();
    }
  }
}
