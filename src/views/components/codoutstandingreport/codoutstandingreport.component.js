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
      HubId:"",
      resultCount:'',
      hubname:"",
      pageno:0,
      pagecount:0,
      isLoading:false,
      excelLoading: false,
      exportf:false,
      disableHub:false,
      zoneLoading:false,
      hubLoading:false
    }
  },

  computed: {

  },

  mounted() {
    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.getZoneData();
  },

  methods: {
    multiple(){
      return true;
    },

    addHubData(event) {
      let zData = []; this.zoneIdArr = [];
      this.zone.forEach(function (val) {
        if (val.hubzoneid != '0'){
          zData.push({'hubzoneid':val.hubzoneid, 'hubzonename':val.hubzonename});
        }
      });

      if(zData.length===1){
        this.disableHub = false;
        this.zoneIdArr = zData;
        this.getHubData(zData[0].hubzoneid);
      }else{
        this.hubList = []; this.HubId = "";
        this.disableHub = true;
        this.zoneIdArr = zData;
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getCODOutstandingReport()
    },

    exportCODOutstandingData(){
      this.excelLoading = true;
      this.input = ({
          hubid: this.HubId.HubID,
          zoneid: this.zoneIdArr
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
          this.getDownloadCsvObject(result.data.data);
          this.excelLoading = false;
        }else{
          this.excelLoading = false;
        }
      }, error => {
        this.excelLoading = false;
        console.error(error)
      })
    },

    getDownloadCsvObject(csvData) {
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
    },

    getCODOutstandingReport(){
      this.input = ({
          hubid: this.HubId.HubID,
          zoneid: this.zoneIdArr,
          fromdate: this.fromDate,
          todate: this.toDate,
          status: this.status,
          offset:this.pageno,
          limit:10
      })
      this.isLoading = true;
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
            this.isLoading = false; this.exportf = true;
            let totalRows = result.data.count
            this.resultCount = result.data.count
            if (totalRows < 10) {
                 this.pagecount = 1
             } else {
                 this.pagecount = Math.ceil(totalRows / 10)
             }
           }else{
             this.CODOutstandingReport = [];
             this.isLoading = false; this.exportf = false;
             this.resultCount = 0;
           }
          },
           error => {
             this.exportf = false; this.isLoading = false;
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
          this.hubLoading = false;
          this.HubId = "";
          this.hubList = result.data.hub.data;
        }, error => {
          this.hubLoading = false;
          console.error(error)
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
      this.zone=""; this.hubList=[]; this.HubId=""; this.pageno = 0;
      this.CODOutstandingReport = []; this.exportf = false; this.disableHub = false; this.resultCount = 0;
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
