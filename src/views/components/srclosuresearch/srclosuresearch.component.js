import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate';
import Multiselect from 'vue-multiselect'
//import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'srclosuresearch',
  components: {
    Paginate,
    Multiselect

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
      SRLedgerDetails:false,
      pageno: 0,
      pagecount: 0

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
       var hubEncrypt = window.localStorage.getItem('accesshubdata')
       var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
       var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
       var hubArr=JSON.parse(hubtext);

       this.input = ({
           hubid: [hubArr[0].HubID],
           appkey: '$#@COD&&Mang&*^%$$'
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
           if(result.data.code == 200){
           this.SRList = result.data.data;
         }else{
            this.$alertify.error("Data Not Found")
         }
         }, error => {
           console.error(error)
         })
    },
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getMonthlySRLedgerDetails()
    },
    getMonthlySRLedgerDetails(){
      this.SRLedgerDetails = true
      this.input = ({
        srid: this.SR_Name,
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
            this.SRLedgerList = result.data.data.rows;

            let totalRows     = result.data.data.count

            this.resultCount  = result.data.data.count
            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }

          }
        }, error => {
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
           this.getMonthlySRLedgerDetails();
         }
        // event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
