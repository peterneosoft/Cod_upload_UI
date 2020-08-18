import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'hubwisetracking',
  components: {
    Paginate,
    Multiselect,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      deliverydate:'',
      zoneList:[],
      hubList:[],
      HubNm:'',
      HubId:'',
      zone:'',
      resultCount:0,
      deldate:'',
      urltoken:'',
      reportlink:'',
      srSummaryList:[],
      localhubid:0,
      isLoading:false,
      allZoneLoading:false,
      hubLoading:false,
      pageno: 0,
      pagecount: 0,
      modalShippingShow:false,
      excelLoading:false,
      exportf:false,
      assignArr: [],
      cardArr: [],
      cashArr: [],
      payphiArr: [],
      walletArr: [],
      awbnotype: '',
      awbArr: [],
      totalCashAmt:0,
      totalPayphiAmt:0,
      totalCardAmt:0,
      totalWalletAmt:0,
      totalRazorpayAmt:0
    }
  },
  computed: {

  },

  mounted() {
    var date = new Date();
    deliverydate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;
    this.urltoken         = window.localStorage.getItem('accessuserToken');
    this.getZoneData();
  },

  methods: {
    showShippingidModal(typ, ele){
      this.awbnotype = ''; this.awbArr = [];
      this.awbnotype = typ;
      this.awbArr = ele;
      this.$refs.shippingModalRef.show();
    },
    closeShippingidModal() {
        this.modalShippingShow = false
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

    onSubmit: function(event) {

      this.$validator.validateAll().then((result) => {
       if(result){
         this.getSRSummary();
       }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.deliverydate = this.deldate = this.HubId = this.zone = this.reportlink = ''; this.hubList = this.srSummaryList = []; this.resultCount = this.pageno = this.pagecount = 0;
      this.totalCashAmt = this.totalPayphiAmt = this.totalCardAmt = this.totalWalletAmt = this.totalRazorpayAmt = 0;
      this.exportf = false; this.$validator.reset(); this.errors.clear();
    },

    getSRSummary() {
      this.isLoading = true;

      this.input = ({
        hubid:this.HubId.HubID,
        srid:new Array(),
        deliverydate:this.deliverydate
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getSRSummary',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        this.isLoading = false;

        if(result.data.code == 200){
          this.deldate          = result.data.date
          this.srSummaryList    = result.data.SRlist
          this.resultCount      = result.data.SRlist.length;

          this.totalCashAmt     = result.data.totalCashAmt;
          this.totalPayphiAmt   = result.data.totalPayphiAmt;
          this.totalCardAmt     = result.data.totalCardAmt;
          this.totalWalletAmt   = result.data.totalWalletAmt;
          this.totalRazorpayAmt = result.data.totalRazorpayAmt;

          this.pagecount        = 1;
          this.exportf          = true;
        }else{
          this.totalCashAmt = this.totalPayphiAmt = this.totalCardAmt = this.totalWalletAmt = this.totalRazorpayAmt = 0;
          this.srSummaryList = []; this.resultCount = this.pagecount = 0; this.exportf = false;
        }
      }, error => {
        this.isLoading = this.exportf = false;
        console.error(error)
        this.$alertify.error('Error Occured');
      })
    },

    exportSRSummaryData(){
      this.reportlink = '';

      this.input = ({
        hubid:this.HubId.HubID,
        srid:new Array(),
        deliverydate:this.deliverydate
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'exportSRSummary',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        if(result.data.code == 200){
          this.getDownloadCsvObject(result.data.data);
          this.exportf    = this.excelLoading = true;
          this.reportlink = result.data.data;
        }else{
           this.exportf = this.excelLoading = false; this.reportlink = '';
        }
      }, error => {
        this.exportf = this.excelLoading = false; this.reportlink = '';
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
      filename = "SRSummaryReport_" + today + ".csv";
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
  }
}
