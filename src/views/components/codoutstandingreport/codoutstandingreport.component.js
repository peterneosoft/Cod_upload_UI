import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'codoutstandingreport',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  props: [],

  data() {
    return {
      zoneList:[],
      hubList:[],
      CODOutstandingReport:[],
      zone:[],
      zoneIdArr:[],
      HubId:[],
      resultCount:'',
      hubname:"",
      pageno:0,
      pagecount:0,
      isLoading:false,
      exportf:false,
      disableHub:false,
      zoneLoading:false,
      hubLoading:false,
      RSCLoading:false,
      RSCList:[],
      RSCName:[],
      SearchHubIds:[],
      SearchRSCIds:[],
      reportlink:'',
      SearchZoneIds:[],
      deliverydate:'',
      searchview:'',
      selected: 'svcoutstanding',
      options: [
        { text: 'RSC/SVC Outstanding', value: 'svcoutstanding' },
        { text: 'RSC Vendor Wise', value: 'rscoutstanding' },
        { text: 'Finance Outstanding', value: 'financeoutstanding' },
        { text: 'COD Summary', value: 'summary' }
      ],
      SearchZIds:[],
      SearchHIds:[]
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    deliverydate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.getZoneData();
  },

  methods: {
    multiple(){
      let key = this.zone.length-1;
      if(this.zone.length>0 && this.zone[key].hubzoneid == 0){
        this.SearchZoneIds = [];
        this.zone = this.zone[key];

        for (let item of this.zoneList) {
          if (item.hubzoneid != 0) {
            this.SearchZoneIds.push(item);
          }
        }
      }

      if(this.zone.hubzoneid == 0){ return false; }
      else{ this.SearchZoneIds = []; return true; }
    },

    multipleHub(){
      let key = this.HubId.length-1;
      if(this.HubId.length>0 && this.HubId[key].HubID == 0){
        this.SearchHubIds = [];
        this.HubId = this.HubId[key];

        for (let item of this.hubList) {
          if (item.HubID != 0) {
            this.SearchHubIds.push(item.HubID);
          }
        }
      }

      if(this.HubId.HubID == 0){ return false; }
      else{ this.SearchHubIds = []; return true; }
    },

    multipleRSC(){
      let key = this.RSCName.length-1;
      if(this.RSCName.length>0 && this.RSCName[key].HubID == 0){
        this.SearchRSCIds = [];
        this.RSCName = this.RSCName[key];

        for (let item of this.RSCList) {
          if (item.HubID != 0) {
            this.SearchRSCIds.push(item.HubID);
          }
        }
      }

      if(this.RSCName.HubID == 0){ return false; }
      else{ this.SearchRSCIds = []; return true; }
    },

    addHubData() {
      let zData = this.zoneIdArr = [];  this.hubList = []; this.HubId = []; this.RSCList = []; this.RSCName = []; this.disableHub = false;
      if($.isArray(this.zone) === false){
        this.zone = new Array(this.zone);
      }

      this.zone.forEach(function (val) {
        zData.push({'hubzoneid':val.hubzoneid, 'hubzonename':val.hubzonename});
      });

      this.zoneIdArr = zData;

      if(zData.length===1 && zData[0].hubzoneid > 0){

        if(this.selected!='rscoutstanding'){
          this.getHubData(zData[0].hubzoneid);
        }
        this.getRSCData(zData[0].hubzoneid);
      }else{
        this.disableHub = true;
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getCODOutstandingReport()
    },

    exportCODOutstandingData(){

      if(this.reportlink){
        window.open(this.reportlink);
      }else{
        let rep = ''; this.exportf = false;

        this.input = ({
          hubid: this.SearchHIds,
          zoneid: this.SearchZIds,
          deliverydate:this.deliverydate
        })

        if(this.selected=='summary' && this.deliverydate){
          rep = apiUrl.api_url + 'exportCODSummaryReport';
        }else if(this.selected=='svcoutstanding' && this.deliverydate){
          rep = apiUrl.api_url + 'exportSVCOutstandingReport';
        }else if(this.selected=='financeoutstanding' && this.deliverydate){
          rep = apiUrl.api_url + 'exportCODOutstandingReport';
        }else if(this.selected=='rscoutstanding'){
          rep = apiUrl.api_url + 'exportRSCOutstandingReport';

          this.input = ({
            hubid: this.SearchHIds,
            zoneid: this.SearchZIds
          })
        }

        axios({
            method: 'POST',
            'url': rep,
            'data': this.input,
            headers: {
                'Authorization': 'Bearer '+this.myStr
            }
        })
        .then(result => {
          if(result.data.code == 200){
            this.exportf = true; this.reportlink = result.data.data; window.open(this.reportlink);
          }else{
            this.exportf = false; this.reportlink = '';
          }
        }, error => {
          this.exportf = false; this.reportlink = ''; console.error(error); this.$alertify.error('Error Occured');
        })
      }
    },

    getCODOutstandingReport(){
      this.isLoading = true; let zData = []; let hubArr = []; let RSCArr = []; let rep = '';

      if(this.SearchZoneIds.length>0){
        zData = this.SearchZoneIds;
      }else{

        this.zone.forEach(function (val) {
          zData.push(val);
        });
      }

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

      let hubIdArr    = [...new Set([].concat(...hubArr.concat(RSCArr)))];
      this.SearchZIds = zData; this.SearchHIds = hubIdArr;

      this.input = ({
        hubid: this.SearchHIds,
        zoneid: this.SearchZIds,
        deliverydate:this.deliverydate,
        status: this.status,
        offset:this.pageno,
        limit:10
      })

      if(this.selected=='summary' && this.deliverydate){
        rep = apiUrl.api_url + 'getCODSummaryReport';
      }else if(this.selected=='svcoutstanding' && this.deliverydate){
        rep = apiUrl.api_url + 'getSVCOutstandingReport';
      }else if(this.selected=='financeoutstanding' && this.deliverydate){
        rep = apiUrl.api_url + 'getCODOutstandingReport';
      }else if(this.selected=='rscoutstanding'){
        rep = apiUrl.api_url + 'getRSCOutstandingReport';

        this.input = ({
          hubid: this.SearchHIds,
          zoneid: this.SearchZIds,
          offset:this.pageno,
          limit:10
        })
      }

      axios({
          method: 'POST',
          url: rep,
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){

            this.CODOutstandingReport   = result.data.data;
            this.exportf                = true;
            let totalRows               = result.data.count
            this.resultCount            = result.data.count

            if (totalRows < 10) {
               this.pagecount           = 1
             } else {
               this.pagecount           = Math.ceil(totalRows / 10)
             }
           }else{
             this.CODOutstandingReport  = []; this.exportf = false; this.resultCount = 0;
           }
           this.isLoading               = false;
          },
           error => {
             this.CODOutstandingReport = []; this.isLoading = false; this.exportf = false; this.resultCount = 0;
             console.error(error); this.$alertify.error('Error Occured');
        })
    },

    //to get All Zone List
    getZoneData() {
      this.input = {}; this.zoneLoading = true; this.disableHub = false; this.zoneList = [];
      this.HubId = this.hubList = this.RSCName = this.RSCList = this.CODOutstandingReport = []; this.resultCount = 0;
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

          if(this.role=='financemanager' || this.role=='admin'){
            this.zoneList = [{hubzoneid:'0', hubzonename:'All Zone', hubzonecode:'All Zone'}].concat(result.data.zone.data);
          }else{
            if(window.localStorage.getItem('accesszone')){
              result.data.zone.data.map(item => {
                let obj = window.localStorage.getItem('accesszone').split(",").find(el => el == item.hubzoneid);
                if(obj) this.zoneList.push(item);
              });
            }else{ this.zoneList = result.data.zone.data; }
          }
          this.addHubData();
        }, error => {
          this.zoneLoading = false; console.error(error)
        })
    },

    //to get All Zone Wise Hub List
    getHubData(zoneid) {
      if(zoneid==""){
        return false;
      }
      this.input = ({
          zoneid: zoneid
      })
      this.hubLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonesvc',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubLoading = false; this.HubId = []; this.hubList = [];
          if(result.data.hub.code == 200){
            this.hubList = [{HubID:'0', HubName:'All Hub', HubCode:'All Hub'}].concat(result.data.hub.data);
          }
        }, error => {
          this.hubLoading = false; console.error(error)
        })
    },

    //to get All Zone Wise RSC List
    getRSCData(zoneid) {
      if(zoneid==""){
        return false;
      }
      this.input = ({
          zoneid: zoneid
      })
      this.RSCLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonersc',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
           this.RSCName = []; this.RSCList = [];
          if(result.data.rsc.code == 200){
            this.RSCList = [{HubID:'0', HubName:'All RSC', HubCode:'All RSC'}].concat(result.data.rsc.data);
          }
        }, error => {
          this.RSCLoading = false; console.error(error)
        })

        axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonersctosvc',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.RSCLoading = false; this.RSCName = []; 
          if(result.data.rsctosvc.code == 200){
            this.RSCList = this.RSCList.concat(result.data.rsctosvc.data);
          }
        }, error => {
          this.RSCLoading = false; console.error(error)
        })
        this.RSCLoading = false;
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        if(this.selected){
          this.pageno = 0; document.getElementById("opt").innerHTML=""; this.exportf = false;

          if(((this.selected=='summary' || this.selected=='svcoutstanding' || this.selected=='financeoutstanding') && this.deliverydate) || this.selected=='rscoutstanding'){
            if(this.selected == 'rscoutstanding' && this.RSCName.length<=0) return false;
            this.reportlink = ''; this.getCODOutstandingReport();
          }
        }else{
          document.getElementById("opt").innerHTML="Please choose atleast one search option ( SVC Outstanding OR RSC Owner OR Finance Outstanding OR COD Summary)."; return false;
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.deliverydate = this.zone = ''; this.hubList = this.HubId = this.RSCList = this.RSCName = this.CODOutstandingReport = this.SearchZIds = this.SearchHIds = [];
      this.exportf = this.disableHub = this.RSCLoading = this.zoneLoading = false; this.pageno = this.resultCount = 0; this.reportlink = '';
      this.$validator.reset(); this.errors.clear();
    }
  }
}
