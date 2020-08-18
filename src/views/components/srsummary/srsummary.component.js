import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'srsummary',
  components: {
    Paginate,
    Multiselect,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      deliverydate:'',
      resultCount:0,
      deldate:'',
      urltoken:'',
      reportlink:'',
      srSummaryList:[],
      localhubid:0,
      isLoading:false,
      srLoading:false,
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
      ShowHideFilter:0,
      SR_Name:'',
      SRList:[],
      agentLoading:false,
      agentList:[],
      Agent_Name:'',
      SRArr:[],
      searchview:'',
      selected: 'sr',
      options: [
        { text: 'SR Summary', value: 'sr' },
        { text: 'Agent Summary', value: 'agent' }
      ],
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
    this.GetDeliveryAgentData();
    this.GetAgentData();
    this.getSRSummary();
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

    onSubmit: function(event) {

      this.$validator.validateAll().then(() => {
       if(this.SR_Name===null) this.SR_Name = '';
       console.log('this.selected==', this.selected);
       if(this.selected){
         if(((this.selected=='agent' && this.Agent_Name) || (this.selected=='sr')) && (this.deliverydate)){
           this.pageno = 0; document.getElementById("opt").innerHTML="";
           this.getSRSummary();
         }
       }else{
         document.getElementById("opt").innerHTML="Please choose atleast one search option ( SR Closure OR Agent Closure )."; return false;
       }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.deliverydate = this.deldate = this.reportlink = this.SR_Name = this.Agent_Name = ''; this.srSummaryList = this.SRList = []; this.resultCount = this.pageno = this.pagecount = 0;
      this.totalCashAmt = this.totalPayphiAmt = this.totalCardAmt = this.totalWalletAmt = this.totalRazorpayAmt = 0;
      this.exportf = false; this.$validator.reset(); this.errors.clear();
      this.GetDeliveryAgentData();
    },

    getSRSummary() {
      this.isLoading = true;

      this.input = ({
        hubid:this.localhubid,
        srid: (this.SR_Name.srid) ? [this.SR_Name.srid]: (this.SRArr && this.SRArr.length>0) ? this.SRArr: (this.Agent_Name.id) ? [this.Agent_Name.id] : new Array(),
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
          this.deldate          = result.data.date;
          this.srSummaryList    = result.data.SRlist;
          this.resultCount      = result.data.SRlist.length;

          this.totalCashAmt     = result.data.totalCashAmt;
          this.totalPayphiAmt   = result.data.totalPayphiAmt;
          this.totalCardAmt     = result.data.totalCardAmt;
          this.totalWalletAmt   = result.data.totalWalletAmt;
          this.totalRazorpayAmt = result.data.totalRazorpayAmt;

          this.pagecount        = 1;
          this.exportf          = true;
        }else{
          this.srSummaryList = []; this.resultCount = this.pagecount = 0; this.exportf = false;
          this.totalCashAmt = this.totalPayphiAmt = this.totalCardAmt = this.totalWalletAmt = this.totalRazorpayAmt = 0;
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
        hubid:this.localhubid,
        srid: (this.SR_Name.srid) ? [this.SR_Name.srid]: (this.SRArr && this.SRArr.length>0) ? this.SRArr: (this.Agent_Name.id) ? [this.Agent_Name.id] : new Array(),
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

    //to get SR List
    GetDeliveryAgentData(){
      this.srLoading = true;
       var hubEncrypt = window.localStorage.getItem('accesshubdata')
       var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
       var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
       var hubArr=JSON.parse(hubtext);

       this.input = ({
           hubid: [hubArr[0].HubID]
       })

       axios({
         method: 'POST',
         url: apiUrl.api_url + 'external/GetdeliveryAgentsFromHubId',
         data: this.input,
         headers: {
           'Authorization': 'Bearer '+this.urltoken
         }
       })
       .then(result => {
         this.srLoading = false;
         if(result.data.code == 200){
           this.SRList = result.data.data;
         }else{
            this.$alertify.error("SR not found")
         }
       }, error => {
         this.srLoading = false;
         console.error(error)
       })
    },

    //to get Agent List
    GetAgentData(){
      this.agentLoading = true;
      var hubEncrypt = window.localStorage.getItem('accesshubdata')
      var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
      var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
      var hubArr=JSON.parse(hubtext);

      this.input = ({
        hubid: hubArr[0].HubID
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getAgentList',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        if(result.data.code == 200){
          this.agentList = result.data.AgentList;
        }else{
          this.$alertify.error("Agent list not found")
        }
        this.agentLoading = false;
      }, error => {
        this.agentLoading = false; console.error(error)
      })
    },

    GetAgentSRData(){
      if(this.Agent_Name){
        this.srLoading = true; this.SRArr = this.SRList = []; this.SR_Name = '';
         var hubEncrypt = window.localStorage.getItem('accesshubdata')
         var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
         var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
         var hubArr=JSON.parse(hubtext);

         this.input = ({
             id: this.Agent_Name.id,
             hubid: hubArr[0].HubID
         })

         axios({
           method: 'POST',
           url: apiUrl.api_url + 'getSRAgentList',
           data: this.input,
           headers: {
             'Authorization': 'Bearer '+this.urltoken
           }
         })
         .then(result => {
           if(result.data.code == 200){
             this.SRList = result.data.SRAgentList;
             this.SRArr = result.data.sridArr;
           }else{
              this.$alertify.error("SR not found for selected agent.")
           }
           this.srLoading = false;
         }, error => {
           this.srLoading = false; console.error(error)
         })
       }
    },

    changeRadio(ele){
      this.SRArr = this.SRList = []; this.SR_Name = this.Agent_Name = '';
      if(ele == 'sr'){
        this.GetDeliveryAgentData();
      }
    }
  }
}
