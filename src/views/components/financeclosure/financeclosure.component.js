import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'svcclosurep2p',
  components: {
      Paginate,
      VueElementLoading,
      Multiselect
  },

  data() {
    return {
      zone:'',
      HubId:'',
      HubName:'',
      HubID:'',
      status:1,
      StatusVal:'',
      isLoading: false,
      resultCount: 0,
      pagecount: 0,
      pageno: 0,
      count: 0,
      hubList: [],
      zoneList: [],
      listFinanceledgerData: [],
      FinanceReasonList: [],
      vid: '',
      vfin: '',
      data: '',
      form: {
          finreason: [],
          financeconfirmdate: [],
          confirmamount: [],
          hide: []
      },
      zoneAmtList: [],
      totalzoneamt: '0.00',
      resultdate: '',
      resultfdate: '',
      zoneLoading: false,
    }
  },

  computed: {

  },

  created() {
    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
    this.GetSumOfZoneHubAmtData();
  },

  mounted() {

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    this.getZoneData();
    this.GetReasonList();
  },

  methods: {

    setid(name, key){
      return name+key;
    },

    //to get All Zone List
    getZoneData() {

      this.input = {}
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.zoneList = result.data.zone.data;
        }, error => {
          console.error(error)
        })
    },

    //to get Hub List According to Zone
    GetSumOfZoneHubAmtData() {
      this.input = {}
      this.zoneLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getsumofzonehubamt',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.zoneLoading = false;
          this.zoneAmtList = result.data.data;
          this.resultdate  = result.data.date;
        }, error => {
          this.zoneLoading = false;
          console.error(error)
        })
    },

    //to get Hub List According to Zone
    getHubData() {

      if(this.zone==""){
        return false;
      }

      this.input = ({
          zoneid: this.zone
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubList = result.data.hub.data;
        }, error => {
          console.error(error)
        })
    },

    GetReasonList(){
      this.input = ({
        ReasonType:"Finance"
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getCODReasons',
          data: this.input,
          headers: {
             'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.FinanceReasonList = result.data.Reasons.data;
        }, error => {
          console.error(error)
        })
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetFinanceledgerData()
    },

    GetFinanceledgerData() {
        $('span[id^="vri"]').hide();
        $('span[id^="vrl"]').show();

        this.input = ({
            offset: this.pageno,
            limit: 10,
            hubid: this.HubId.HubID,
            statusid: this.status
        })
        this.isLoading = true;
        axios({
            method: 'POST',
            'url': apiUrl.api_url + 'financeledgermaster',
            'data': this.input,
            headers: {
                'Authorization': 'Bearer '+this.myStr
            }
        })
        .then(result => {

          if(result.data.code == 200){
            this.listFinanceledgerData = result.data.data;

            $(".text-danger").html("");

            let finance = result.data.data;
            finance.forEach((fin,key)=>{
              this.form.finreason[fin.svcledgerid] = fin.financereasonid;

              if(!fin.financereasonid){
                this.form.finreason[fin.svcledgerid] = '';
                this.form.hide[fin.svcledgerid] = 0;
              }
            });

            this.isLoading = false;
            let totalRows     = result.data.count;
            this.resultCount  = result.data.count;
            this.resultfdate  = result.data.fdate;
            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }else{
            this.listFinanceledgerData=[];
            this.resultCount  = 0;
            this.isLoading = false;
          }
        }, error => {
            console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.HubName = this.HubId.HubName;
          this.HubID = this.HubId.HubID;
          this.StatusVal = event.target[2].selectedOptions[0].attributes.title.nodeValue;
          if(this.StatusVal == "Close"){
              this.StatusVal = "Transaction Closed"
          }else{
              this.StatusVal = "Transaction Open"
          }
          this.GetFinanceledgerData(event);
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    updateSVCFinanceledger(elem) {

      let insertflag= 0; let ledgerid = elem; let financeconfirmdate = ''; let confirmamount = 0;

      let finreasonid = document.getElementById('finreason'+ledgerid).value;

      if(finreasonid==null || finreasonid==undefined || finreasonid==""){
         document.getElementById("finR"+ledgerid).innerHTML="Please select reason.";
         return false;
      }else{
        document.getElementById("finR"+ledgerid).innerHTML="";
        financeconfirmdate = document.getElementById('financeconfirmdate'+ledgerid).value;

        if(finreasonid == 84){

          confirmamount = document.getElementById('confirmamount'+ledgerid).value;

          if(confirmamount==null || confirmamount==undefined || confirmamount==""){
            document.getElementById("finA"+ledgerid).innerHTML="Please enter received amount.";
            return false;
          }else{
            document.getElementById("finA"+ledgerid).innerHTML="";
          }
        }
        if(financeconfirmdate==null || financeconfirmdate==undefined || financeconfirmdate==""){
          document.getElementById("finD"+ledgerid).innerHTML="Please select date.";
          return false;
        }else{
          document.getElementById("finD"+ledgerid).innerHTML="";
        }
        insertflag=1;
      }

      if(insertflag){
        this.input = ({
            svcledgerid: ledgerid,
            financereasonid: parseInt(finreasonid),
            financeconfirmdate: financeconfirmdate,
            confirmamount: confirmamount,
            hubid: this.HubID,
            username: this.localuserid
        })
        axios({
            method: 'POST',
            'url': apiUrl.api_url + 'updateSVCLedgerDetails',
            'data': this.input,
            headers: {
                'Authorization': 'Bearer '+this.myStr
            }
        })
        .then((response) => {
          if (response.data.code == 200) {
            this.$alertify.success(response.data.message);
            this.form.finreason = [];
            this.form.financeconfirmdate = [];
            this.form.confirmamount = [];
            this.form.hide[ledgerid] = ledgerid;
            this.GetFinanceledgerData();

          } else if (response.data.code == 202) {
            this.$alertify.error(response.data.message)
          }
          event.target.reset();
        })
        .catch((httpException) => {
            console.error('exception is:::::::::', httpException)
        });
      }
    },

    onUpdate: function(elem) {
      if(elem){
        this.updateSVCFinanceledger(elem);
      }else{
        console.log('errors exist', elem)
        return false;
      }
    },

    resetForm() {
      this.zone = this.HubId = this.status = ''; this.pageno = this.resultCount = 0; this.listFinanceledgerData = [];
      this.$validator.reset();
      this.errors.clear();
    },

    showHideImages(index){
      $('#vri'+index).show();
      $('#vrl'+index).hide();
    }
  }
}
