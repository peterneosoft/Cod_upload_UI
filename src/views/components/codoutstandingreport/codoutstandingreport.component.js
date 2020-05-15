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
      excelLoading: false,
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
      deliverydate:'',
      SearchZoneIds:[]
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    deliverydate.max = date.toISOString().split("T")[0];

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
      let zData = this.zoneIdArr = this.hubList = this.RSCList = []; this.HubId = this.RSCName = []; this.disableHub = false;
      if($.isArray(this.zone) === false){
        this.zone = new Array(this.zone);
      }

      this.zone.forEach(function (val) {
        zData.push({'hubzoneid':val.hubzoneid, 'hubzonename':val.hubzonename});
      });

      this.zoneIdArr = zData;

      if(zData.length===1){
        this.getHubData(zData[0].hubzoneid);
        this.getRSCData(zData[0].hubzoneid);
      }else{
        this.disableHub = true;
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getCODOutstandingReport()
    },

    exportCODOutstandingData(zData, hubIdArr){

      this.reportlink = '';

      this.input = ({
          hubid: hubIdArr,
          zoneid: zData,
          deliverydate:this.deliverydate
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'exportCODOutstandingReport',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          // this.getDownloadCsvObject(result.data.data);
          this.exportf=true;
          this.reportlink = result.data.data;
        }else{
          this.exportf=false; this.reportlink = '';
        }
      }, error => {
        this.exportf=false; this.reportlink = '';
        console.error(error)
        this.$alertify.error('Error Occured');
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

    /** getDownloadCsvObject(csvData) {
      var today   = new Date();
      var dd      = today.getDate();
      var mm      = today.getMonth() + 1;
      var yyyy    = today.getFullYear();
      var today   = dd + "" + mm + "" + yyyy;
      var data, filename, link;
      filename = "OutstandingCODreport_" + today + ".csv";
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
      this.excelLoading = false;
      return result;
    }, **/

    getCODOutstandingReport(){
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

      let hubIdArr = [...new Set([].concat(...hubArr.concat(RSCArr)))];

      this.input = ({
          hubid: hubIdArr,
          zoneid: zData,
          deliverydate:this.deliverydate,
          status: this.status,
          offset:this.pageno,
          limit:10
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getCODOutstandingReport',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.CODOutstandingReport = result.data.data;
            this.isLoading = false;
            let totalRows = result.data.count
            this.resultCount = result.data.count
            if (totalRows < 10) {
                 this.pagecount = 1
             } else {
                 this.pagecount = Math.ceil(totalRows / 10)
             }

             this.exportCODOutstandingData(zData, hubIdArr);
           }else{
             this.CODOutstandingReport = [];
             this.isLoading = false;
             this.resultCount = 0;
           }
          },
           error => {
             this.CODOutstandingReport = []; this.isLoading = false; this.resultCount = 0;
             console.error(error); this.$alertify.error('Error Occured');
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
          this.zoneList = [{hubzoneid:'0', hubzonename:'All Zone', hubzonecode:'All Zone'}].concat(result.data.zone.data);
        }, error => {
          this.zoneLoading = false;
          console.error(error)
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
          url: apiUrl.api_url + 'external/getzonehub',
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
          this.RSCLoading = false; this.RSCName = []; this.RSCList = [];
          if(result.data.rsc.code == 200){
            this.RSCList = [{HubID:'0', HubName:'All RSC', HubCode:'All RSC'}].concat(result.data.rsc.data);
          }
        }, error => {
          this.RSCLoading = false; console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0; this.exportf = false;
          this.getCODOutstandingReport()
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.deliverydate = this.zone = ''; this.hubList = this.HubId = this.RSCList = this.RSCName = this.CODOutstandingReport = [];
      this.exportf = this.disableHub = false; this.pageno = this.resultCount = 0;
      this.$validator.reset(); this.errors.clear();
    },
  }
}
