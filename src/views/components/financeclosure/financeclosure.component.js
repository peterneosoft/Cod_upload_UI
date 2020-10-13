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
      status:0,
      isLoading: false,
      resultCount: 0,
      pagecount: 0,
      pageno: 0,
      count: 0,
      AWBAmount: 0,
      AWBArr: '',
      hubList: [],
      zoneList: [],
      listFinanceledgerData: [],
      FinanceReasonList: [],
      financereason: '',
      financeconfirmdate: '',
      financeconfirmamount: '',
      AWBNo: [],
      radio:'awb',
      RecAmt: '',
      financecomment:'',
      hubid: 0,
      deliverydate: '',
      formatdeldate: '',
      bankid: 0,
      resultfdate: '',
      allZoneLoading: false,
      hubLoading: false,
      modalShow:false,
      cardModalShow:false,
      DisputeArr:[],
      ReasonModalShow:false,
      RecExcModalShow:false,
      commentModalShow:false,
      cType:'',
      DepositType: '',
      RSCLoading:false,
      RSCList:[],
      RSCName:[],
      SearchRSCIds:[],
      disableRSC:false,
      exportf:false,
      reportlink:'',
      SearchHIds:[],
      toDate:"",
      fromDate:"",
      role:'',
      subLoading: false,
      FCModal: false,
      comment:'',
      ConfmodalShow:false
    }
  },

  computed: {

  },

  created() {
    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
  },

  mounted() {
    var date = new Date();
    financeconfirmdate.max = toDate.max = fromDate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    this.role             = window.localStorage.getItem('accessrole').toLowerCase().replace(/\s/g,'');

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

    multipleRSC(){
      let key = this.RSCName.length-1;
      if(this.RSCName.length>0 && this.RSCName[key].HubID == 0){
        this.SearchRSCIds = [];
        this.RSCName = this.RSCName[key];

        for (let item of this.RSCList) {
          if (item.HubID != 0) {
            this.SearchRSCIds.push(item.HubID);
          }
        }
      }

      if(this.RSCName.HubID == 0){ return false; }
      else{ this.SearchRSCIds = []; return true; }
    },

    setid(name, key){
      return name+key;
    },

    //to get All Zone List
    getZoneData() {
      this.input = {}; this.zoneList = []; this.allZoneLoading = true;
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

          if(this.role=='financemanager' || this.role=='admin'){
            this.zoneList = [{hubzoneid:'0', hubzonename:'All Zone', hubzonecode:'All Zone'}].concat(result.data.zone.data);
          }else{
            if(window.localStorage.getItem('accesszone')){
              result.data.zone.data.map(item => {
                let obj = window.localStorage.getItem('accesszone').split(",").find(el => el == item.hubzoneid);
                if(obj) this.zoneList.push(item);
              });
            }else{ this.zoneList = result.data.zone.data; }
          }
        }, error => {
          this.allZoneLoading = false; this.HubId = this.hubList = []; console.error(error);
        })
    },

    addHubData() {
      let zData = this.zoneIdArr = this.hubList = this.RSCList = this.HubId = this.RSCName = [];
      if(this.zone==""){
        return false;
      }else{
        this.getHubData();
        if(this.zone>0){
          this.disableRSC=false;
          this.getRSCData();
        }else{
          this.disableRSC=true;
        }
      }
    },

    //to get Hub List According to Zone
    getHubData() {
      this.hubLoading = true;

      if(this.zone==0){
        axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallhubs',
          'data': {},
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        }).then(result => {
          this.hubLoading = false;
          if(result.data.hub.code==200) this.hubList = result.data.hub.data;
        }, error => {
          this.hubLoading = false; console.error(error);
        });
      }else{
        this.input = ({
            zoneid: this.zone
        })

        axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonesvc',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        }).then(result => {
          this.hubLoading = false;
          if(result.data.hub.code==200) this.hubList = [{HubID:'0', HubName:'All Hub', HubCode:'All Hub'}].concat(result.data.hub.data);
        }, error => {
          this.hubLoading = false; console.error(error);
        });
      }
    },

    //to get All Zone Wise RSC List
    getRSCData() {
      this.RSCLoading = true;

      this.input = ({
          zoneid: this.zone
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'external/getzonersc',
        'data': this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      })
      .then(result => {
        this.RSCLoading = false;
        if(result.data.rsc.code == 200) this.RSCList = [{HubID:'0', HubName:'All RSC', HubCode:'All RSC'}].concat(result.data.rsc.data);
      }, error => {
        this.RSCLoading = false; console.error(error)
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

      let hubArr = []; let RSCArr = []; this.FCModal = false;

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

      if(this.SearchRSCIds.length>0){
        RSCArr = this.SearchRSCIds;
      }else{
        if($.isArray(this.RSCName) === false){
          this.RSCName = new Array(this.RSCName);
        }

        this.RSCName.forEach(function (val) {
          RSCArr.push(val.HubID);
        });
      }

      let hubIdArr = [...new Set([].concat(...hubArr.concat(RSCArr)))];
      this.SearchHIds = hubIdArr;

      if(hubArr.length<=0 && RSCArr.length<=0){
        document.getElementById("hubrsc").innerHTML="One selection is required either Hub and RSC."; return false;
      }
      document.getElementById("hubrsc").innerHTML="";

      this.input = ({
          offset: this.pageno,
          limit: 10,
          hubid: this.SearchHIds,
          statusid: this.status,
          deposittype: this.DepositType,
          fromdate: this.fromDate,
          todate: this.toDate
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

          this.exportf      = true;

          let totalRows     = result.data.count;
          this.resultCount  = result.data.count;
          this.resultfdate  = result.data.fdate;
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
        }else{
          this.listFinanceledgerData = []; this.resultCount = 0; this.exportf = false;
        }
        this.isLoading = false;
      }, error => {
        this.exportf = false; console.error(error); this.$alertify.error('Error Occured');
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
          let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if(this.fromDate > this.toDate){
            document.getElementById("fdate").innerHTML="From date should not be greater than To date."; return false;
          }
          else{
            this.HubID = this.HubId.HubID; this.pageno = this.pagecount = 0; this.exportf = false; this.reportlink = ''; document.getElementById("fdate").innerHTML="";
            this.GetFinanceledgerData(event);
          }
        }else{
          this.$alertify.error('Error Occured');
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    showCardModal(){
      this.FCModal = false; this.$refs.myClosureModalRef.hide();
      this.$refs.myCardModalRef.show()
    },

    hideCardModal(ele) {
      if(ele == 0){
        this.cardModalShow = false; this.$refs.myCardModalRef.hide()
        this.$refs.myConfModalRef.show();
      }else{
        this.cardModalShow = false; this.$refs.myCardModalRef.hide(); this.FCModal = true; this.$refs.myClosureModalRef.show();
      }
    },

    hideConfModal(ele) {
      this.subLoading = true;
      if(ele == 2){
        this.FCModal = false; this.$refs.myClosureModalRef.hide();
        this.$refs.myConfModalRef.show();
      }else if(ele == 0){
        this.$refs.myConfModalRef.hide(); this.FCModal = true; this.$refs.myClosureModalRef.show();
        this.updateSVCFinanceledger();
      }else{
        this.$refs.myConfModalRef.hide(); this.subLoading = false;
        this.FCModal = true; this.$refs.myClosureModalRef.show();
      }
    },

    closeStatusRoleModal() {
      this.modalShow        = false;
      this.cardModalShow    = false;
      this.ReasonModalShow  = false;
      this.RecExcModalShow  = false;
      this.commentModalShow = false;
      this.ConfmodalShow    = false;
      $("#FCform").trigger("reset");
      this.FCModal = false;
    },

    cardawbno(){
      let awbArr = []; this.AWBAmount = 0; this.DisputeArr = [];

      if(this.AWBNo){
        this.AWBNo = this.checkAWB(this.AWBNo);
        awbArr.push({ ReasonID:this.financereason, AWBNo:this.checkAWB(this.AWBNo) });
      }else{
        awbArr.push({ ReasonID:this.finanacereason, AWBNo:[], ReasonAmt:(this.RecAmt)?this.RecAmt:'0' });
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
        this.subLoading = false;
        if (awbres.data.code == 200) {
          if(awbres.data.invalidAwb.length>0){
            this.$alertify.error("Some of AWB numbers are invalid, please check: "+awbres.data.invalidAwb.join(', ')); return false;
          }else{
            this.AWBAmount = awbres.data.total;
            this.DisputeArr = awbres.data.result;
            this.showCardModal();
          }
        } else{
          this.$alertify.error("AWB numbers are invalid, please check."); return false;
        }
      })
      .catch((httpException) => {
         this.subLoading = false; this.$alertify.error('Error occured'); return false;
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

    updateSVCFinanceledger() {

      this.input = ({
          svcledgerid: this.svcledgerid,
          financereasonid: this.financereason,
          financeconfirmdate: this.financeconfirmdate,
          confirmamount: this.financeconfirmamount,
          AWBNo: (this.AWBNo)? this.AWBNo : new Array(),
          recoveryamount: (this.RecAmt)?this.RecAmt:0,
          hubid: this.hubid,
          username: this.localuserid,
          deliverydate: this.deliverydate,
          formatdeldate: this.formatdeldate,
          bankid: this.bankid,
          comment: this.financecomment
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
          this.FCModal = false; this.$refs.myClosureModalRef.hide(); this.$alertify.success(response.data.message);
          this.GetFinanceledgerData();

        } else {
          this.$alertify.error(response.data.message)
        }
        this.subLoading = false;
      })
      .catch((httpException) => {
        this.subLoading = false; console.error('exception is:::::::::', httpException); this.$alertify.error('Error Occured');
      });
    },

    onUpdate: function() {
      document.getElementById("fr").innerHTML=""; document.getElementById("fcd").innerHTML=""; document.getElementById("fca").innerHTML="";

      if(this.financereason && this.financeconfirmdate && this.financeconfirmamount){

        if(this.financereason == 125 || this.financereason == 218){
          if(!this.radio){
            document.getElementById("cr").innerHTML="Radio selection is required."; return false;
          }else if(!this.RecAmt && this.radio=="amount"){
            document.getElementById("ramt").innerHTML="Recovery Amount is required."; return false;
          }else if(!this.AWBNo.length && this.radio=="awb"){
            document.getElementById("rawb").innerHTML="AWB Number is required."; return false;
          }else{
            document.getElementById("cr").innerHTML=""; document.getElementById("ramt").innerHTML=""; document.getElementById("rawb").innerHTML="";
            if(this.radio=="amount"){ this.AWBNo = []; }else{ this.RecAmt = ''; }

            this.FCModal = true; this.$refs.myClosureModalRef.show(); this.subLoading = true;
            this.cardawbno();
          }
        }else{
          this.FCModal = true; this.$refs.myClosureModalRef.show();
          this.hideConfModal(2);
        }
      }else{
        if(!this.financereason){ document.getElementById("fr").innerHTML="Finance reason is required."; return false; }
        if(!this.financeconfirmdate){ document.getElementById("fcd").innerHTML="Amount received date is required."; return false; }
        if(!this.financeconfirmamount){ document.getElementById("fca").innerHTML="Received amount is required."; return false; }
      }
    },

    resetForm() {
      this.zone = this.DepositType = ''; this.HubId = this.hubList = this.RSCList = []; this.RSCName = []; this.pageno = this.resultCount = 0;
      this.listFinanceledgerData = this.SearchHIds = []; this.status = 1; this.exportf = false; this.fromDate = this.toDate = '';
      this.$validator.reset(); this.errors.clear();
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

    showComment(ele, type){
      this.comment = []; this.cType = ''; this.comment = ele;
      if(type=='c') this.cType = 'Finance Comment'; else this.cType = 'Transaction Id';
      this.$refs.myCommentModalRef.show();
    },

    exportfinanceledgermaster(){
      let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if(diffDays > 30){
        this.$alertify.error('For export report, date range should not be greater than 30 days');
        document.getElementById("fdate").innerHTML="For export report, date range should not be greater than 30 days."; return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      if(this.reportlink){
        window.open(this.reportlink);
      }else{
        this.exportf = false;

        this.input = ({
          hubid: this.SearchHIds,
          statusid: this.status,
          deposittype: this.DepositType,
          fromdate: this.fromDate,
          todate: this.toDate
        })

        axios({
            method: 'POST',
            'url': apiUrl.api_url + 'exportfinanceledgermaster',
            'data': this.input,
            headers: {
                'Authorization': 'Bearer '+this.myStr
            }
        })
        .then(result => {
          if(result.data.code == 200){
            this.exportf = true; this.reportlink = result.data.data; window.open(this.reportlink);
          }else{
            this.exportf = false; this.reportlink = '';
          }
        }, error => {
          this.exportf = false; this.reportlink = ''; console.error(error); this.$alertify.error('Error Occured');
        })
      }
    },

    getSVCRowData(data) {
      this.$validator.reset(); this.errors.clear();
      this.svcledgerid = this.hubid = this.deliverydate = this.formatdeldate = this.bankid = this.financereason = '';
      this.financeconfirmdate = this.financeconfirmamount = this.RecAmt = this.financecomment = '';
      this.AWBNo = []; this.FCModal = true;
      this.svcledgerid    = data.svcledgerid;
      this.hubid          = data.hubid,
      this.deliverydate   = data.deliverydate,
      this.formatdeldate  = data.formatdeldate,
      this.bankid         = data.bankid
    },
  }
}
