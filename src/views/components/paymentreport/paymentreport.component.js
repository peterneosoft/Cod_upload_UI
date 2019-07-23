import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'paymentreport',
  components: {
    Multiselect,
    Paginate,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      myStr:'',
      trDate:'',
      ClientId:'',
      ClientList:[],
      listCODPaymentData:[],
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: '',
      createdby: '',
      exportf:false,
      excelLoading: false
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    trDate.max = date.toISOString().split("T")[0];

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.createdby        = userdetail.username;

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
        this.GetCODPaymentData();
    },

    GetCODPaymentData(event) {

      this.isLoading = true;

      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'codpaymentdetailsmaster?ClientId='+this.ClientId.ClientMasterID+'&Company='+this.ClientId.CompanyName+'&offset='+this.pageno+'&limit=10&trDate='+this.trDate+'&createdby='+this.createdby,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          this.listCODPaymentData = result.data.data;
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
          this.listCODPaymentData=[];
          this.resultCount  = 0;
          this.isLoading = false;
          this.exportf=false;
        }
      }, error => {
          this.exportf=false;
          console.error(error)
      })
    },

    exportCODPaymentData(){
      this.excelLoading = true;

      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'exportcodpaymentreport?ClientId='+this.ClientId.ClientMasterID+'&Company='+this.ClientId.CompanyName+'&trDate='+this.trDate+'&createdby='+this.createdby,
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
      filename = "CODPaymentReport_" + today + ".csv";
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

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0; this.exportf = false;
          this.GetCODPaymentData(event);
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.ClientId = ""; this.pageno = this.resultCount = 0; this.listCODPaymentData = []; this.trDate = ''; this.exportf = false;
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
