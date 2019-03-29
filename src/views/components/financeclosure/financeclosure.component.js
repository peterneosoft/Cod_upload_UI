import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'svcclosurep2p',
  components: {
      Paginate,
      VueElementLoading
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
      totalzoneamt: '0.00'

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
    this.localuserid      = userdetail.userid;

    this.getZoneData();
    this.GetReasonList();
  },

  methods: {

    setid(name, key){
      return name+key;
    },

    //to get All Hub List
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

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getsumofzonehubamt',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.zoneAmtList = result.data.data;
        }, error => {
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

    //to get All Hub List
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
        this.GetSVCledgerData()
    },

    GetFinanceledgerData() {

        this.input = ({
            offset: this.pageno,
            limit: 10,
            hubid: this.HubId,
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

            let finance = result.data.data;
            finance.forEach((fin,key)=>{
              this.form.finreason[fin.svcledgerid] = fin.financereasonid;
              if(!fin.financereasonid)
                this.form.hide[fin.svcledgerid] = 0;
            });

            this.isLoading = false;
            let totalRows     = result.data.count;
            this.resultCount  = result.data.count;
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
          this.HubName = event.target[1].selectedOptions[0].attributes.title.nodeValue;
          this.HubID = event.target[1].selectedOptions[0].attributes.value.nodeValue;
          this.StatusVal = event.target[2].selectedOptions[0].attributes.title.nodeValue;
          if(this.StatusVal == "Close"){
              this.StatusVal = "Transacton Closed"
          }else{
              this.StatusVal
          }
          this.GetFinanceledgerData(event);
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    updateSVCFinanceledger(event) {
     let insertflag= 0;
      let finreasonid = ''; let ledgerid = ''; let financedate = ''; let amount = 0; let financeid = ""; let amountid = "";
      this.form.finreason.map((obj,key) =>{
        finreasonid = obj;
        ledgerid = key;
      });
      this.form.financeconfirmdate.map((obj,key) =>{
        financedate = obj;
        financeid = key;
      });

      this.form.confirmamount.map((obj,key) =>{
        amount = obj;
        amountid = key;

      });
      if(finreasonid){
        let financeconfirmdate = document.getElementById('financeconfirmdate'+ledgerid).value;
        let confirmamount = document.getElementById('confirmamount'+ledgerid).value;
        if(!financeconfirmdate){
          let error = document.getElementById("d_t");
           error.style.display = "block";
        }else{
          let error = document.getElementById("d_t");
          error.style.display = "None";
          insertflag=1;

        }
      }
      if(finreasonid == "5"){
        let financeconfirmdate = document.getElementById('financeconfirmdate'+ledgerid).value;
        let confirmamount = document.getElementById('confirmamount'+ledgerid).value;
        if(!financeconfirmdate || !confirmamount){
         let error = document.getElementById("d_t");
          error.style.display = "block";
         let errord_a = document.getElementById("d_a");
          errord_a.style.display = "block";
         return false;
       }else{
         let error = document.getElementById("d_t");
         error.style.display = "None";
         let errord_a = document.getElementById("d_a");
         errord_a.style.display = "None";
         insertflag=1;

       }
      }

      if(insertflag){
      this.input = ({
          svcledgerid: ledgerid,
          financereasonid: finreasonid,
          financeconfirmdate: financedate,
          confirmamount: amount,
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

    onUpdate: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.updateSVCFinanceledger(event);
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
