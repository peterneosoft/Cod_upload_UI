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
      HubId:[],
      SearchHubIds:[],
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
          recoveryamount: [],
          hide: []
      },
      zoneAmtList: [],
      totalzoneamt: '0.00',
      resultdate: '',
      resultfdate: '',
      zoneLoading: false,
      allZoneLoading: false,
      hubLoading: false,
      modalAWBNoShow:false,
      awbnotype:'',
      awbnumber:''
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
    multipleHub(){
      let key = this.HubId.length-1;
      if(this.HubId.length>0 && this.HubId[key].HubID == 0){
        this.SearchHubIds = [];
        this.HubId = this.HubId[key];

        for (let item of this.hubList) {
          if (item.HubID != 0) {
            this.SearchHubIds.push(item.HubID);
          }
        }
      }

      if(this.HubId.HubID == 0){ return false; }
      else{ this.SearchHubIds = []; return true; }
    },

    setid(name, key){
      return name+key;
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
            'Authorization': 'Bearer '+this.myStr
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

      this.HubId = this.hubList = [];

      this.hubLoading = true;
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
          this.hubLoading = false;
          if(result.data.hub.data.length > 0) this.hubList = [{HubID:'0', HubName:'All Hub', HubCode:'All Hub'}].concat(result.data.hub.data);
        }, error => {
          this.hubLoading = false;
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

        let hubArr = [];
        if(this.SearchHubIds.length>0){
          hubArr = this.SearchHubIds;
        }else{
          if($.isArray(this.HubId) === false){
            this.HubId = new Array(this.HubId);
          }

          this.HubId.forEach(function (val) {
            hubArr.push(val.HubID);
          });
        }

        this.input = ({
            offset: this.pageno,
            limit: 10,
            hubid: hubArr,
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
            this.$alertify.error('Error Occured');
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
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

    updateSVCFinanceledger(elem, findata) {

      let insertflag= 0; let ledgerid = elem; let financeconfirmdate = ''; let confirmamount = 0; let recoveryamount = 0;

      let finreasonid = document.getElementById('finreason'+ledgerid).value;

      if(finreasonid==null || finreasonid==undefined || finreasonid==""){
         document.getElementById("finR"+ledgerid).innerHTML="Reason is required.";
         return false;
      }else{
        document.getElementById("finR"+ledgerid).innerHTML="";

        financeconfirmdate = document.getElementById('financeconfirmdate'+ledgerid).value;
        if(financeconfirmdate==null || financeconfirmdate==undefined || financeconfirmdate==""){
          document.getElementById("finD"+ledgerid).innerHTML="Date is required.";
          return false;
        }else{
          document.getElementById("finD"+ledgerid).innerHTML="";
        }

        if(finreasonid == 84 || finreasonid == 124 || finreasonid == 187 || finreasonid == 125 || finreasonid == 218){
          confirmamount = document.getElementById('confirmamount'+ledgerid).value;

          if(confirmamount==null || confirmamount==undefined || confirmamount==""){
            document.getElementById("finA"+ledgerid).innerHTML="Received amount is required.";
            return false;
          }else{
            document.getElementById("finA"+ledgerid).innerHTML="";
          }

          recoveryamount = document.getElementById('recoveryamount'+ledgerid).value;

          if((finreasonid == 125 || finreasonid == 218) && (recoveryamount==null || recoveryamount==undefined || recoveryamount=="")){
            document.getElementById("finDR"+ledgerid).innerHTML="Self Debit/Client Recovery amount is required.";
            return false;
          }else{
            document.getElementById("finDR"+ledgerid).innerHTML="";
          }
        }

        insertflag=1;
      }

      if(insertflag){
        this.input = ({
            svcledgerid: ledgerid,
            financereasonid: parseInt(finreasonid),
            financeconfirmdate: financeconfirmdate,
            confirmamount: confirmamount,
            recoveryamount: recoveryamount,
            hubid: findata.hubid,
            username: this.localuserid,
            deliverydate: findata.deliverydate,
            formatdeldate: findata.formatdeldate,
            bankid: findata.bankid
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

          } else {
            this.$alertify.error(response.data.message)
          }
        })
        .catch((httpException) => {
            console.error('exception is:::::::::', httpException)
            this.$alertify.error('Error Occured');
        });
      }
    },

    onUpdate: function(elem, findata) {
      if(elem){
        this.updateSVCFinanceledger(elem, findata);
      }else{
        console.log('errors exist', elem)
        return false;
      }
    },

    resetForm() {
      this.zone = this.HubId = ''; this.pageno = this.resultCount = 0; this.listFinanceledgerData = []; this.status = 1;
      this.$validator.reset();
      this.errors.clear();
    },

    showHideImages(index, elem){
      if(elem=='vrrl'){
        $('#vrl'+index).show();
        $('#vri'+index).hide();

        $('#vrri'+index).show();
        $('#vrrl'+index).hide();
      }else{
        $('#vrri'+index).hide();
        $('#vrrl'+index).show();

        $('#vri'+index).show();
        $('#vrl'+index).hide();
      }
    },

    scrollWin() {
      if(this.zone && this.HubId && this.status) window.scrollBy(0, 1000);
    },

    showAWBNo(typ, ele){
      this.awbnotype = ''; this.awbnumber = '';
      this.awbnotype = typ + ' AWB Number:';
      this.awbnumber = ele;
      this.$refs.awbModalRef.show();
    },

    closeAWBNoModal() {
        this.modalAWBNoShow = false
    },
  }
}
