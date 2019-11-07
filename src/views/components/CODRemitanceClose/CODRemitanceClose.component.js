import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'CODRemitanceClose',
  components: {
    Multiselect,
    Paginate,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      fromDate:"",
      toDate:"",
      myStr:"",
      ClientId:[],
      ClientList:[],
      SearchClientIds:[],
      selected: 'TransactionDate',
      options: [
        { text: 'Delivery Date', value: 'DeliveryDate' },
        { text: 'Transaction Date', value: 'TransactionDate' }
      ],
      value: null,
      optionss: ['list', 'of', 'options'],
      listCODRemitanceData:[],
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: '',
      localhubid: '',
      localhubname: '',
      exportf:false,
      excelLoading: false,
      clientLoading: false,
      reportlink:''
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
    this.GetClientData()
  },

  methods: {
    multiple(){
      let key = this.ClientId.length-1;
      if(this.ClientId.length>0 && this.ClientId[key].ClientMasterID == 0){
        this.SearchClientIds = [];
        this.ClientId = this.ClientId[key];

        for (let item of this.ClientList) {
          if (item.ClientMasterID != 0) {
            this.SearchClientIds.push(item.ClientMasterID);
          }
        }
      }

      if(this.ClientId.ClientMasterID == 0){ return false; }
      else{ this.SearchClientIds = []; return true; }
    },

    GetClientData() {
      this.clientLoading = true;
      axios({
        method: 'GET',
        url: apiUrl.api_url + 'external/getclientlist',
        data: {},
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        this.clientLoading = false;
        this.ClientList = [{ClientMasterID:'0', CompanyName:'All Client'}].concat(result.data.clients.data);
      }, error => {
        this.clientLoading = false;
        console.error(error)
      })
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetCODRemittanceDetailsData();
    },

    GetCODRemittanceDetailsData(event) {

      if(this.selected){
        if(this.fromDate > this.toDate){
           document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
           return false;
        }else{
          document.getElementById("fdate").innerHTML="";
        }
        document.getElementById("opt").innerHTML="";
      }else{
        document.getElementById("opt").innerHTML="Please choose atleast one option ( Delivery Date OR Transaction Date ).";
        return false;
      }

      let cData = [];
      if(this.SearchClientIds.length>0){
        cData = this.SearchClientIds;
      }else{
        if($.isArray(this.ClientId) === false){
          this.ClientId = new Array(this.ClientId);
        }

        this.ClientId.forEach(function (val) {
          cData.push(val.ClientMasterID);
        });
      }

      this.isLoading = true;
      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'codremittancedetailsmaster?ClientId='+cData+'&offset='+this.pageno+'&limit=10&fromDate='+this.fromDate+'&toDate='+this.toDate+'&search='+this.selected,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          this.listCODRemitanceData = result.data.data;
          this.isLoading = false;

          let totalRows     = result.data.count;
          this.resultCount  = result.data.count;
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
          this.exportCODRemittanceDetailsData();
        }else{
          this.listCODRemitanceData=[];
          this.resultCount  = 0;
          this.isLoading = false;
        }
      }, error => {
          console.error(error)
      })
    },

    exportCODRemittanceDetailsData(){
      let cData = []; this.reportlink = '';
      if(this.SearchClientIds.length>0){
        cData = this.SearchClientIds;
      }else{
        if($.isArray(this.ClientId) === false){
          this.ClientId = new Array(this.ClientId);
        }

        this.ClientId.forEach(function (val) {
          cData.push(val.ClientMasterID);
        });
      }

      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'exportCODRemittanceDetailsReport?ClientId='+cData+'&fromDate='+this.fromDate+'&toDate='+this.toDate+'&search='+this.selected,
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
      filename = "CODRemitanceClosed_" + today + ".csv";
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

    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        this.pageno = 0; this.exportf = false;
        if(this.fromDate && this.toDate){
          this.GetCODRemittanceDetailsData(event);
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.fromDate = this.toDate = ''; this.selected=""; this.ClientId=""; this.pageno = this.resultCount = 0;
      this.listCODRemitanceData = []; this.exportf=false;
      this.$validator.reset(); this.errors.clear();
    },
  }
}
