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
      AWBAmount: 0,
      AWBArr: '',
      RecAmt: '',
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
          AWBNo: [],
          hide: [],
          button:[],
          radio:[],
          RecAmt:[],
          subLoading:[],
          comment:[]
      },
      zoneAmtList: [],
      totalzoneamt: '0.00',
      resultdate: '',
      resultfdate: '',
      zoneLoading: false,
      allZoneLoading: false,
      hubLoading: false,
      awbnotype:'',
      awbnumber:'',
      modalShow:false,
      cardModalShow:false,
      findata:[],
      elem:'',
      DisputeArr:[],
      ReasonModalShow:false,
      RecExcModalShow:false
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
              this.form.radio[fin.svcledgerid] = 'awb';
              this.form.subLoading[fin.svcledgerid] = false;

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
          this.pageno = this.pagecount = 0;
          this.GetFinanceledgerData(event);
        }else{
          this.$alertify.error('Error Occured');
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    showCardModal(AWBAmount, elem, findata){
      this.$refs.myCardModalRef.show(AWBAmount)
    },
    hideCardModal(ele, findata) {
      if(ele == 0){
        this.$refs.myCardModalRef.hide()
        this.updateSVCFinanceledger(this.elem, this.findata);
      }else{
        this.$refs.myCardModalRef.hide()
      }
    },
    closeStatusRoleModal() {
      this.modalShow = false
      this.cardModalShow = false
      this.ReasonModalShow = false
      this.RecExcModalShow = false
    },

    cardawbno(AWBNo, elem, findata, AWBAmount){
      let awbArr = []; this.AWBAmount = 0; this.DisputeArr = [];

      if(AWBNo){
        this.form.AWBNo[this.elem] = this.checkAWB(AWBNo);
        awbArr.push({ ReasonID:this.form.finreason[this.elem], AWBNo:this.checkAWB(AWBNo) });
      }else{
        awbArr.push({ ReasonID:this.form.finreason[this.elem], AWBNo:[], ReasonAmt:(AWBAmount)?AWBAmount:'0' });
      }

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'getAWBNo',
          'data': ({DisputeArr: awbArr}),
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then((awbres) => {
        if (awbres.data.code == 200) {
          if(awbres.data.invalidAwb.length>0){
            this.$alertify.error("Some of AWB numbers are invalid, please check: "+awbres.data.invalidAwb.join(', ')); return false;
          }else{
            this.AWBAmount = awbres.data.total;
            this.DisputeArr = awbres.data.result;
            this.showCardModal(this.AWBAmount, elem, findata);
          }
        } else{
          this.$alertify.error("AWB numbers are invalid, please check."); return false;
        }
      })
      .catch((httpException) => {
         this.$alertify.error('Error occured'); return false;
      });
    },

    checkAWB(awbno){

      if(awbno){
        if(/\s/g.test(awbno) == true || awbno.indexOf(',') > -1){
          awbno =awbno.replace(/,\s*$/, "").replace(/ /g,'').split(',');
        }
        if(Array.isArray(awbno) == false){
          awbno = new Array(awbno);
        }

        return awbno;
      }
    },

    updateSVCFinanceledger(elem, findata) {

      let insertflag= 0; let ledgerid = elem; let financeconfirmdate = ''; let confirmamount = 0;

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
        }

        insertflag=1;
      }

      this.form.button[ledgerid] = true; this.form.subLoading[ledgerid] = true;

      if(insertflag){
        this.input = ({
            svcledgerid: ledgerid,
            financereasonid: parseInt(finreasonid),
            financeconfirmdate: financeconfirmdate,
            confirmamount: confirmamount,
            AWBNo: (this.form.AWBNo[this.elem])? this.form.AWBNo[this.elem] : new Array(),
            recoveryamount: (this.AWBAmount)?this.AWBAmount:0,
            hubid: findata.hubid,
            username: this.localuserid,
            deliverydate: findata.deliverydate,
            formatdeldate: findata.formatdeldate,
            bankid: findata.bankid,
            comment: this.form.comment[this.elem]
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
            this.form.RecAmt = [];
            this.form.comment = [];
            this.form.hide[ledgerid] = ledgerid;
            this.GetFinanceledgerData();

          } else {
            this.$alertify.error(response.data.message)
          }
          this.form.button[ledgerid] = false; this.form.subLoading[ledgerid] = false;
        })
        .catch((httpException) => {
          this.form.button[ledgerid] = false; this.form.subLoading[ledgerid] = false;
          console.error('exception is:::::::::', httpException)
          this.$alertify.error('Error Occured');
        });
      }
    },

    onUpdate: function(elem, findata) {
      if(elem){
         this.elem = ''; this.AWBAmount = ''; this.findata = []; this.elem = elem; this.findata = findata;

        let finreasonid = this.form.finreason[this.elem]; this.form.subLoading[this.elem] = false;

        if((finreasonid == 125 || finreasonid == 218) && (this.form.radio[this.elem]==null || this.form.radio[this.elem]=="")){

          document.getElementById("finRadio"+this.elem).innerHTML="Radio selection is required.";
          return false;
        }else if((finreasonid == 125 || finreasonid == 218) && (!this.form.RecAmt[this.elem] || this.form.RecAmt[this.elem]==null || this.form.RecAmt[this.elem]==undefined || this.form.RecAmt[this.elem]=="") && this.form.radio[this.elem]=="amount"){

          document.getElementById("finDR"+this.elem).innerHTML=""; document.getElementById("finRadio"+this.elem).innerHTML="";
          document.getElementById("finRec"+this.elem).innerHTML="Recovery Amount is required.";
          this.form.AWBNo[this.elem] = ''; this.form.RecAmt[this.elem] = '';
          return false;
        }else if((finreasonid == 125 || finreasonid == 218) && (!this.form.AWBNo[this.elem] || this.form.AWBNo[this.elem]==null || this.form.AWBNo[this.elem]==undefined || this.form.AWBNo[this.elem]=="") && this.form.radio[this.elem]=="awb"){

          document.getElementById("finRec"+this.elem).innerHTML=""; document.getElementById("finRadio"+this.elem).innerHTML="";
          document.getElementById("finDR"+this.elem).innerHTML="AWB Number is required.";
          this.form.RecAmt[this.elem] = ''; this.form.AWBNo[this.elem] = '';
          return false;
        }else if((this.form.AWBNo[this.elem] || this.form.RecAmt[this.elem]) && (finreasonid == 125 || finreasonid == 218)){

          if(this.form.AWBNo[this.elem] && this.form.radio[this.elem]=="awb"){

            document.getElementById("finDR"+this.elem).innerHTML="";  this.form.RecAmt[this.elem] = '';
          }else if(this.form.RecAmt[this.elem] && this.form.radio[this.elem]=="amount"){

            document.getElementById("finRec"+this.elem).innerHTML=""; this.form.AWBNo[this.elem] = ''; this.AWBAmount = this.form.RecAmt[this.elem];
          }

          this.cardawbno(this.form.AWBNo[this.elem], this.elem, findata, this.form.RecAmt[this.elem]);
          document.getElementById("finRadio"+this.elem).innerHTML="";
        }else{
          this.form.AWBNo[this.elem] = ''; this.AWBAmount = ''; this.form.RecAmt[this.elem] = '';
          document.getElementById("finDR"+this.elem).innerHTML=""; document.getElementById("finRec"+this.elem).innerHTML=""; document.getElementById("finRadio"+this.elem).innerHTML="";
          this.updateSVCFinanceledger(this.elem, findata);
        }
      }else{
        console.log('errors exist', elem); this.form.subLoading[elem] = false;
        return false;
      }
    },

    resetForm() {
      this.zone = ''; this.HubId = this.hubList = []; this.pageno = this.resultCount = 0; this.listFinanceledgerData = []; this.status = 1;
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
      if(this.zone && this.HubId.HubID && this.status) window.scrollBy(0, 1000);
    },

    showReasonAWBNo(ele){
      this.DisputeArr = [];
      this.DisputeArr = ele;
      this.$refs.myReasonModalRef.show();
    },

    showRecExcAWBNo(eletyp, ele, eleawb, financereasonid=null){

      this.DisputeArr = [];

      if(ele>0){
        let AWBArr = {}; AWBArr['awb'] = []

        if(eletyp == 'recovery' && financereasonid!=null){
          AWBArr['Reason'] = "Self Debit/Client Recovery"
        }else if(eletyp == 'recovery' && financereasonid==null){
          AWBArr['Reason'] = "Amount used for Tax Payment/Imprest"
        }else if(eletyp == 'exception'){
          AWBArr['Reason'] = "Exception"
        }

        eleawb = eleawb.split(',');
        if(eleawb.length>0){
          eleawb.forEach(async(item, i) => {
            let obj = {};
            obj[item]=item;
            AWBArr['awb'].push(obj)
          });
        }else{
          let obj = {};
          obj[eleawb]=eleawb;
          AWBArr['awb'].push(obj)
        }
        AWBArr['amount'] = ele

        this.DisputeArr = new Array(AWBArr);
      }

      this.$refs.myRecExcModalRef.show();
    },
  }
}
