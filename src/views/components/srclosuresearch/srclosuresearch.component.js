import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'srclosuresearch',
  components: {
    Paginate,
    Multiselect,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      SR_Name:'',
      toDate:'',
      fromDate:'',
      resultCount:'',
      urltoken:'',
      SRList:[],
      SRLedgerList:[],
      localhubid:0,
      isLoading:false,
      srLoading:false,
      srStatusLoading:false,
      srLedger:true,
      srStatusLedger:false,
      pageno: 0,
      pagecount: 0,
      resultClosureCount: 0,
      pendingSRClosureList:'',
      closuredate:''
    }
  },
  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];
    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;
    this.urltoken = window.localStorage.getItem('accessuserToken');
    this.GetDeliveryAgentData();
  },

  methods: {
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
              this.$alertify.error("Data Not Found")
           }
         }, error => {
           this.srLoading = false;
           console.error(error)
         })
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getMonthlySRLedgerDetails()
    },

    getMonthlySRLedgerDetails(){
      if(this.fromDate > this.toDate){
         document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
         return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      this.SRLedgerList = [];
      this.isLoading = true;
      this.srLedger = true; this.srStatusLedger = this.srStatusLoading = false;
      this.input = ({
        srid: this.SR_Name.srid,
        hubid:this.localhubid,
        fromdate:this.fromDate,
        todate:this.toDate,
        offset:this.pageno,
        limit:10
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getMonthlySRLedgerDetails',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.isLoading = false;
            this.SRLedgerList = result.data.data.rows;
            let totalRows     = result.data.data.count
            this.resultCount  = result.data.data.count

            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }
          if(result.data.code == 204){
            this.isLoading = false;
            this.resultCount  = 0
          }
        }, error => {
          this.isLoading = false;
          console.error(error)
          this.$alertify.error('Error Occured');
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
           this.pageno = 0;
           this.getMonthlySRLedgerDetails();
         }
        // event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.fromDate = this.toDate = this.SR_Name = ''; this.SRLedgerList=[]; this.resultCount = this.pageno = 0;
      document.getElementById("fdate").innerHTML="";
      this.$validator.reset();
      this.errors.clear();
    },

    srStatus() {
      this.srLedger = this.isLoading = false; this.srStatusLedger = this.srStatusLoading = true;

      this.input = ({
        hubid:[this.localhubid]
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getSRClosureStatus',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        this.closuredate = result.data.date;
        if(result.data.code == 200){
          this.srStatusLoading = false;
          let penarr = [];
          result.data.data.pending.forEach(function (val) {
            penarr.push(val.SRName);
          });
          this.pendingSRClosureList = penarr.join(', ');
          this.resultClosureCount  = penarr.length;
          this.pagecount = 1
        }else{
          this.srStatusLoading = false;
          this.resultClosureCount  = 0
        }
      }, error => {
        this.srStatusLoading = false;
        console.error(error)
        this.$alertify.error('Error Occured');
      })
    },
  }
}
