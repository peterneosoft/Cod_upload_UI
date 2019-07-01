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
      ClientId:"",
      ClientList:[],
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
      exportf:false
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
    GetClientData() {
      axios({
        method: 'GET',
        url: apiUrl.api_url + 'external/getclientlist',
        data: {},
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        this.ClientList = result.data.clients.data;
      }, error => {
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
        document.getElementById("opt").innerHTML="Please choose one option ( Delivery Date OR Transaction Date ).";
        return false;
      }

      let cData = [];
      this.ClientId.forEach(function (val) {
        cData.push(val.ClientMasterID);
      });

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
          this.exportf=true;
          let totalRows     = result.data.count;
          this.resultCount  = result.data.count;
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
        }else{
          this.listCODRemitanceData=[];
          this.resultCount  = 0;
          this.isLoading = false;
          this.exportf=false;
        }
      }, error => {
          this.exportf=false;
          console.error(error)
      })
    },

    exportCODRemittanceDetailsData(){
      let cData = [];
      this.ClientId.forEach(function (val) {
        cData.push(val.ClientMasterID);
      });
      this.isLoading = true;
      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'exportCODRemittanceDetailsReport?ClientId='+cData+'&fromDate='+this.fromDate+'&toDate='+this.toDate+'&search='+this.selected,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          this.getDownloadCsvObject(result.data.data);
          this.isLoading = false;
        }else{
          this.isLoading = false;
        }
      }, error => {
          this.isLoading = false;
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
      this.isLoading = false;
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
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        this.pageno = 0; this.exportf = false;
        this.GetCODRemittanceDetailsData(event);
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
