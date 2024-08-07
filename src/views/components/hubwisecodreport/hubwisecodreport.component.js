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
  name: 'hubwisecodreport',
  components: {Paginate,
  VueElementLoading,
  Multiselect
},
  props: [],

  data() {
    return {
      zoneList:[],
      hubList:[],
      CODLedgerReports:[],
      zone:[],
      zoneIdArr:[],
      HubId:[],
      resultCount:'',
      toDate:"",
      fromDate:"",
      status:"",
      hubname:"",
      pageno:0,
      pagecount:0,
      isLoading:false,
      exportf:false,
      disableHub:false,
      disableRSCOwner:false,
      zoneLoading:false,
      hubLoading:false,
      RSCLoading:false,
      RSCOwnerLoading:false,
      RSCList:[],
      RSCName:[],
      RSCOwnerList:[],
      rscowner:'',
      SearchHubIds:[],
      SearchRSCIds:[],
      reportlink:'',
      awbnotype:'',
      awbnumber:'',
      ReasonModalShow:false,
      RecExcModalShow:false,
      DisputeArr:[],
      SearchZoneIds:[],
      commentModalShow:false,
      comment:'',
      cType:'',
      role:'',
      SearchZIds:[],
      SearchHIds:[]
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr    = userToken.replace(/"/g, '');

    this.role     = window.localStorage.getItem('accessrole').toLowerCase().replace(/\s/g,'');

    this.getZoneData();
  },

  methods: {
    multiple(){
      let key = this.zone ? this.zone.length-1 : 0;
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
      else{ this.SearchZoneIds = []; return false; }
    },

    multipleHub(){
      let key = this.HubId ? this.HubId.length-1 : 0;
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
      let key = this.RSCName ? this.RSCName.length-1 : 0;
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
      let zData = this.zoneIdArr = [];  this.hubList = []; this.HubId = []; this.RSCList = []; this.RSCName = [];
      this.RSCOwnerList = []; this.rscowner = ''; this.disableHub = false;
      if($.isArray(this.zone) === false){
        this.zone = new Array(this.zone);
      }

      this.zone.forEach(function (val) {
        zData.push({'hubzoneid':val.hubzoneid, 'hubzonename':val.hubzonename});
      });

      this.zoneIdArr = zData;

      if(zData.length===1 && zData[0].hubzoneid > 0){
        this.getHubData(zData[0].hubzoneid);
        this.getRSCData(zData[0].hubzoneid);
      }else{
        this.disableHub = true;
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getHubWiseCODLedgerReports()
    },

    exportHubWiswData(){

      if(this.fromDate && this.toDate){
        let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if(diffDays > 30 && (this.SearchHIds.length!=1)){
          this.$alertify.error('For export report, date range should not be greater than 30 days');
          document.getElementById("fdate").innerHTML="For export report, date range should not be greater than 30 days."; return false;
        }else{
          document.getElementById("fdate").innerHTML="";
        }
      }

      if(this.reportlink){
        window.open(this.reportlink);
      }else{
        this.exportf = false;
        this.input = ({
          hubid: this.SearchHIds,
          zoneid: this.SearchZIds,
          rscowner: this.rscowner ? new Array(this.rscowner) : new Array(),
          status: this.status,
          fromdate: this.fromDate,
          todate: this.toDate
        })

        // if(this.role=='financemanager') rep = apiUrl.api_url + 'exportAllZoneCODReports';
        // else rep = apiUrl.api_url + 'exportHubWiseCODReports';
        let rep = apiUrl.api_url + 'exportHubWiseCODReports';

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

    /** getDownloadCsvObject(csvData) {
      var today   = new Date();
      var dd      = today.getDate();
      var mm      = today.getMonth() + 1;
      var yyyy    = today.getFullYear();
      var today   = dd + "" + mm + "" + yyyy;
      var data, filename, link;
      filename = "HubwiseCODreport_" + today + ".csv";
      var csv = this.convertArrayOfObjectsToCSV({
        data: csvData
      });
      if (csv == null) return;
      filename = filename || "export.csv";
      if (!csv.match(/^data:text\/csv/i)) {
        csv = "data:text/csv;charset=utf-8," + csv;
      }
      data = encodeURI(csv);
      link = document.createElement("a");
      link.setAttribute("href", data);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.removeChild(link);
    },

    convertArrayOfObjectsToCSV: function(args) {
      var result, ctr, keys, columnDelimiter, lineDelimiter, data;
      data = args.data || null;
      if (data == null || !data.length) {
        return null;
      }
      columnDelimiter = args.columnDelimiter || ",";
      lineDelimiter = args.lineDelimiter || "\n";
      keys = Object.keys(data[0]).slice(0);
      result = "";
      result += keys.join(columnDelimiter);
      result += lineDelimiter;
      data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
          if (ctr > 0) result += columnDelimiter;
          if (item[key] != null) {
            result += '"' + item[key] + '"';
          }
          ctr++;
        });
        result += lineDelimiter;
      });
      return result;
    }, **/

    getHubWiseCODLedgerReports(){
      this.isLoading = true;

      let zData = []; let hubArr = []; let RSCArr = [];

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
          rscowner: this.rscowner ? new Array(this.rscowner) : new Array(),
          fromdate: this.fromDate,
          todate: this.toDate,
          status: this.status,
          offset:this.pageno,
          limit:10
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getHubWiseCODLedgerReports',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.CODLedgerReports   = result.data.data;
            this.exportf            = true;
            let totalRows           = result.data.count
            this.resultCount        = result.data.count
            if (totalRows < 10) {
                 this.pagecount     = 1
             } else {
                 this.pagecount     = Math.ceil(totalRows / 10)
             }
           }else{
             this.CODLedgerReports  = [];
             this.exportf           = false;
             this.resultCount       = 0;
           }
           this.isLoading           = false;
          },
           error => {
             this.CODLedgerReports = []; this.resultCount = 0; this.isLoading = false; this.exportf = false;
             console.error(error); this.$alertify.error('Error Occured');
        })
    },

    //to get All Zone List
    getZoneData() {
      this.input = {}; this.zoneLoading = true; this.zoneList = [];
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
        }, error => {
          this.zoneLoading = false; console.error(error); this.$alertify.error('Zone Error');
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
          this.hubLoading = false; console.error(error); this.$alertify.error('Hub/ SVC Error');
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
          this.RSCLoading = false; this.RSCName = []; this.RSCList = [];
          if(result.data.rsc.code == 200){
            this.RSCList = [{HubID:'0', HubName:'All RSC', HubCode:'All RSC'}].concat(result.data.rsc.data);
          }
        }, error => {
          this.RSCLoading = false; console.error(error); this.$alertify.error('RSC Error');
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          if(this.rscowner){ this.fromDate = this.toDate = ''; }

          if((this.fromDate && this.toDate) && (this.fromDate > this.toDate)){
            let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
            return false;
          }else{
            this.pageno = 0; this.exportf = false; this.reportlink = ''; this.resultCount = 0;
            this.getHubWiseCODLedgerReports();
          }
        }else{
          this.$alertify.error('Error Occured');
        }
      }).catch(() => {
        console.log('errors exist', this.errors); this.$alertify.error('Error Occured');
      });
    },

    resetForm() {
      this.fromDate = this.toDate = ''; this.zone=""; this.hubList = this.HubId = this.RSCList = this.RSCName = this.SearchZIds = this.SearchHIds = []; this.rscowner = '';
      this.pageno = 0; this.status=""; this.CODLedgerReports = []; this.exportf = false; this.disableHub = false; this.resultCount = 0; this.reportlink = '';
      this.$validator.reset();
      this.errors.clear();
    },

    closeStatusRoleModal() {
      this.ReasonModalShow = false
      this.RecExcModalShow = false
      this.commentModalShow = false
    },

    showReasonAWBNo(ele){
      this.DisputeArr = [];
      this.DisputeArr = ele;
      this.$refs.myReasonModalRef.show();
    },

    showRecExcAWBNo(eletyp, ele, eleawb){

      this.DisputeArr = [];

      if(ele>0){
        let AWBArr = {}; AWBArr['awb'] = []

        if(eletyp == 'recovery'){
          AWBArr['Reason'] = "Self Debit/Client Recovery"
        }else if(eletyp == 'exception'){
          AWBArr['Reason'] = "Exception"
        }

        eleawb = eleawb.split(',');
        if(eleawb.length>0){
          eleawb.forEach(async(item, i) => {
            let obj = {};
            obj[item]=item;
            AWBArr['awb'].push(obj)
          });
        }else{
          let obj = {};
          obj[eleawb]=eleawb;
          AWBArr['awb'].push(obj)
        }
        AWBArr['amount'] = ele

        this.DisputeArr = new Array(AWBArr);
      }

      this.$refs.myRecExcModalRef.show();
    },

    showComment(ele, type){
      this.comment = []; this.cType = ''; this.comment = ele;
      if(type=='c') this.cType = 'Finance Comment'; else this.cType = 'Transaction Id';
      this.$refs.myCommentModalRef.show();
    },

    addRSCOwner() {
      this.disableRSCOwner = false; this.rscowner = '';

      if(this.RSCName && this.RSCName!=null){
        if(this.HubId.length<=0 && this.RSCName.HubID != 0){
          if($.isArray(this.RSCName) === false) this.RSCName = new Array(this.RSCName);
          if(this.RSCName.length===1){ this.disableRSCOwner = true; this.getRSCOwnerData(this.RSCName[0].HubID); }
        }
      }
    },

    //to get RSC Wise RSC Owner List
    getRSCOwnerData(rscID) {
      if(rscID==""){ return false; }
      this.RSCOwnerLoading = true; this.RSCOwnerList = [];

      this.input = ({ hubid: rscID });
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getHubRSCOwnerDetails',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.RSCOwnerLoading = false;

          if(result.data.code == 200){
            this.RSCOwnerList = result.data.RSCOwnerArr;
          }
        }, error => {
          this.RSCOwnerLoading = false; console.error(error);
        })
    },
  }
}
