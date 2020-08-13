import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate';
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'srclosuresearch',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  props: [],

  data() {
    return {
      resultSUCount:0,
      resultSUCODCount:0,
      resultDBCount:0,
      resultDiffCount:0,
      SUList:[],
      allSUList:[],
      DBList:[],
      allDBList:[],
      DiffList:[],
      zoneList:[],
      hubList:[],
      HubNm:'',
      HubId:'',
      zone:'',
      deliverydate:'',
      closuredate:'',
      allddate:'',
      localhubid:0,
      localhubname:'',
      isLoading:false,
      allZoneLoading:false,
      hubLoading:false,
      pageno: 0,
      pagecount: 0,
      urltoken:'',
      ShowHideFilter:0,
      ShowHideCron:0,
      crondate:'',
      cronrundate:'',
      hubids:'',
      cronLoading:false,
      cronDiffList:'',
      cronDiffCount:0,
      runLoading:false,
      hubidLoading:false,
      hubarrlength:0,
      hubidarr:'',
      awbhubids:'',
      appDate:'',
      apiDate:''
    }
  },
  computed: {

  },

  mounted() {
    var date = new Date();
    deliverydate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    this.appDate = date.toLocaleString();

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;
    this.localhubname     = hubdetail[0].HubName;

    this.urltoken = window.localStorage.getItem('accessuserToken');

    this.getSVCCronStatus();
    this.GetHubSettingsData();
    this.getZoneData();
    //this.awbDifference();
  },

  methods: {
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
    },

    //to get All Zone List
    getZoneData() {
      this.allZoneLoading = true;
      this.input = {}; this.zoneList = [];
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          this.allZoneLoading = false;
          if(result.data.zone.data.length > 0) this.zoneList = result.data.zone.data;
        }, error => {
          this.allZoneLoading = false; this.HubId = this.hubList = [];
          console.error(error)
        })
    },

    //to get Hub List According to Zone
    getHubData() {
      if(this.zone==""){
        return false;
      }

      this.HubId = ''; this.hubList = [];

      this.hubLoading = true;
      this.input = ({
          zoneid: this.zone
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          this.hubLoading = false;
          if(result.data.hub.data.length > 0) this.hubList = result.data.hub.data;
        }, error => {
          this.hubLoading = false;
          console.error(error)
        })
    },

    //to get difference between db and shipment update
    awbDifference() {
      this.isLoading = true; this.HubNm = ''; this.awbhubids = '';

      this.input = ({
        hubid:this.HubId ? this.HubId.HubID : this.localhubid,
        date:this.deliverydate,
        status:'Delivered',
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'checkAWBdifference',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        this.closuredate = result.data.date;
        this.SUList = this.DBList  = this.DiffList = [];
        this.HubNm = this.HubId.HubName ? this.HubId.HubName : this.localhubname;
        this.resultSUCount = this.resultDBCount = this.resultDiffCount = this.resultSUCODCount = 0;

        if(result.data.code == 200){
          this.SUList = result.data.SUdata;
          this.DBList  = result.data.DBdata;
          this.DiffList  = result.data.DiffData;

          this.resultSUCount = (this.SUList.TotalCnt>0)?1:0;
          this.resultSUCODCount = (this.SUList.TotalCODCnt>0)?1:0;
          this.resultDBCount = (this.DBList.DBTotalCODCnt>0)?1:0;
          this.resultDiffCount = (this.DiffList.TotalCODdiffCnt > 0)?1:0;

          this.pagecount = 1; this.pageno = 0;
        }
        this.isLoading = false;
      }, error => {
        this.isLoading = false; console.error(error); this.$alertify.error('Error Occured');
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
           if(this.awbhubids && this.awbhubids !=""){
             this.allawbDifference();
           }else{
            this.awbDifference();
           }
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
        this.$alertify.error('Error Occured');
      });
    },

    resetForm() {
      this.deliverydate = this.HubId = this.zone = this.awbhubids = '';
      this.resultSUCount = this.resultSUCODCount = this.resultDBCount = this.resultDiffCount = 0; this.pageno = this.pagecount = 1;
      this.SUList = this.DBList = this.allSUList = this.allDBList = this.hubList = this.DiffList = [];
      this.$validator.reset();
      this.errors.clear();
    },

    //to get failed svc hub id cron data
    getSVCCronStatus() {
      this.cronLoading = this.runLoading = true;

      if(this.crondate){
        this.input = ({ crondate:this.crondate })
      }else{
        this.input = {}
      }

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getSVCCronStatus',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        this.cronrundate  = result.data.crondate;
        this.apiDate      = result.data.currdate;
        this.cronDiffList = ''; this.cronDiffCount = 0;

        if(result.data.code == 200){
          this.cronDiffList  = result.data.hubArr.join(', ');
          this.cronDiffCount = result.data.hubArr.length;
        }

        this.cronLoading = this.runLoading = false;
      }, error => {
        this.cronLoading = this.runLoading = false; console.error(error); this.$alertify.error('Error Occured');
      })
    },

    //run cron job for failed svc hub ids
    svcCronRun() {
      this.runLoading = true;

      if(/\s/g.test(this.hubids) == true || this.hubids.indexOf(',') > -1){
        this.hubids = this.hubids.replace(/"|'| |,\s*$/g,'').split(',');
      }
      if(Array.isArray(this.hubids) == false){
        this.hubids = new Array(this.hubids);
      }

      this.input = ({
        hubArr:this.hubids.map(Number),
        ismanual:true
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'svccroninsertion',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        this.runLoading = false;
        if(result.data.code == 200){
          this.$alertify.success('Cron SVC hub ids processed successfully.');
          this.resetCron();
        }else{
          this.$alertify.error('Error Occured.');
        }
      }, error => {
        this.runLoading = false; console.error(error); this.$alertify.error('Error Occured');
      })
    },

    cronSubmit() {
      if(this.hubids){
        let error = document.getElementById("chi"); error.style.display  = "none";
        this.svcCronRun();
      }else{
        let error = document.getElementById("chi"); error.innerHTML = "Cron Hub Ids is required."; error.style.display = "block"; return false;
      }
    },

    getCronStatus() {
      if(this.crondate){
        let error = document.getElementById("cd"); error.style.display  = "none";
        this.getSVCCronStatus();
      }else{
        let error = document.getElementById("cd"); error.innerHTML = "Cron date is required."; error.style.display = "block"; return false;
      }
    },

    resetCron() {
      this.crondate = this.hubids = ''; this.cronLoading = this.runLoading = false; this.cronDiffList = ''; this.cronDiffCount = 0;
      let error1 = document.getElementById("cd"); error1.style.display  = "none";
      let error2 = document.getElementById("chi"); error2.style.display  = "none";
      this.getSVCCronStatus();
    },

    //to get Cron Hub List
    GetHubSettingsData() {

      this.input = ({
          offset: 0,
          limit: 10
      })
      this.hubidLoading = true;

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'gethubsettingids',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          this.hubarrlength = 0; this.hubidarr = '';
          if(result.data.code == 200){
            this.hubarrlength = result.data.data.length;
            this.hubidarr = result.data.data.join(', ');
          }
          this.hubidLoading  = false;
        }, error => {
          console.error(error); this.hubidLoading  = false;
        })
    },

    //to get all hub difference between db and shipment update
    allawbDifference() {
      this.isLoading = true; this.HubId = this.zone = '';

      if(/\s/g.test(this.awbhubids) == true || this.awbhubids.indexOf(',') > -1){
        this.awbhubids = this.awbhubids.replace(/"|'| |,\s*$/g,'').split(',');
      }
      if(Array.isArray(this.awbhubids) == false){
        this.awbhubids = new Array(this.awbhubids);
      }

      this.input = ({
        hubArr:this.awbhubids.map(Number),
        date:this.deliverydate
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'checkallAWBdifference',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        this.allddate = result.data.delivarydate;
        this.allSUList = this.allDBList = [];

        if(result.data.code == 200){
          this.allSUList = result.data.SUdata;
          this.allDBList  = result.data.DBdata;
        }
        this.isLoading = false;
      }, error => {
        this.isLoading = false; console.error(error); this.$alertify.error('Error Occured');
      })
    },
  }
}
