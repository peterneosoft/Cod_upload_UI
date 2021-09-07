import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import {Validator} from 'vee-validate'
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
      DepositDate: '',
      DeliveryDate: '',
      Deposit_Amount: '',
      DepositType: '',
      BankMasterId: '',
      TransactionID: '',
      DepositSlip: '',
      ReasonSlip: '',
      Reason: '',
      unmatchedAmt: 0,
      CODAmount: 0,
      tot_amt: 0,
      BankList: [],
      pageno: 0,
      pagecount: 0,
      localuserid: 0,
      localhubid: 0,
      localhubname: '',
      localhubzoneid: 0,
      DenominationList: [],
      StatusID: 0,
      FinanceConfirmAmount: 0,
      financeoutstanding:0,
      BatchID : '',
      DenominationArr: [],
      listSVCledgerData: [],
      ShipmentUpdateList: [],
      ReasonList: [],
      uploadFileList: [],
      reasonFileList: [],
      ReasonAmount: '',
      lowdisReason:'',
      carissAWBNo: '',
      cassnatAWBNo: '',
      paychgAWBNo: '',
      vendrecAWBNo: '',
      casstolAWBNo: '',
      theftstolAWBNo: '',
      wrongdelAWBNo: '',
      srabscAWBNo: '',
      nddissAWBNo: '',
      walissAWBNo: '',
      razissAWBNo: '',
      habridpiAWBNo: '',
      habridpiAMT: '',
      paypissAWBNo: '',
      srtpsrAmt: '',
      srtptsvcAmt: '',
      carissReason: '',
      cassnatReason: '',
      paychgReason: '',
      vendrecReason: '',
      casstolReason: '',
      theftstolReason: '',
      wrongdelReason: '',
      srabscReason: '',
      srtpsrReason: '',
      srtptsvcReason: '',
      nddissReason: '',
      walissReason: '',
      razissReason: '',
      habridpiReason: '',
      paypissReason: '',
      CardAmount: 0,
      DisputeArr: [],
      cardM: 1,
      isLoading: false,
      bankLoading: false,
      DepositLoading: false,
      ReasonLoading: false,
      resultCount: 0,
      pendingCODAmt: 0,
      closingBalance: 0,
      yestClosingbalance: 0,
      yesterdayCODAmt: 0,
      TolatCollection: 0,
      p2pAmount: 0,
      myStr: '',
      resultdate: '',
      disableButton: false,
      modalShow:false,
      cardModalShow:false,
      ReasonModalShow:false,
      RecExcModalShow:false,
      penAmtLoading: false,
      denomLoading: false,
      exceptionLoading: false,
      exception:[],
      exceptionList:[],
      exceptionArr:[],
      exceptionAmount:0,
      lowdis:false,
      amoimp:false,
      vendrec:false,
      cassnat:false,
      cariss:false,
      paychg:false,
      casstol:false,
      theftstol:false,
      wrongdel:false,
      srabsc:false,
      srtpsr:false,
      srtptsvc:false,
      nddiss: false,
      waliss: false,
      raziss: false,
      habridpi: false,
      paypiss: false,
      modalAWBNoShow:false,
      awbnotype:'',
      awbnumber:'',
      expanded:false,
      subLoading:false,
      ExData:0,
      ExmodalShow:false,
      financeclosingamt:0,
      commentModalShow:false,
      comment:'',
      cType:'',
      ConfmodalShow:false,
      hideCM:1,
      role:'',
      todDate:'',
      resetdata:'',
      resetDD:'',
      ResetmodalShow:false,
      localhubIsRSC:false,
      RSCOwnerList:[],
      rscLoading:false,
      RSCOwner:'',
      isFnF:false
    }
  },

  computed: {

  },
  created() {

  },
  async mounted() {
    this.role             = window.localStorage.getItem('accessrole').toLowerCase();

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;
    this.localhubname     = hubdetail[0].HubName;
    this.localhubzoneid   = hubdetail[0].HubZoneId;
    this.localhubIsRSC    = hubdetail[0].IsRSC;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var date = new Date();
    DepositDate.max = DeliveryDate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    date.setDate(date.getDate() - 1);
    this.DeliveryDate = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    date.setDate(date.getDate() - 5);
    DepositDate.min = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    this.BatchID = this.localhubid+''+Math.floor(Math.random() * (Math.pow(10,5)));

    this.todDate = new Date().toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    await this.GetDenominationData();
    await this.GetSVCExceptionData();
    await this.GetReasonList();
    await this.GetSVCledgerData();
    await this.GetShipmentUpdate();
    if(this.localhubIsRSC) await this.getRSCOwnerData();
  },

  methods: {
    multiple(){
      return true;
    },
    showModal(Balanc){
      this.$refs.myModalRef.show(Balanc);
      this.RemainData = Balanc;
    },
    hideModal() {
      this.$refs.myModalRef.hide()
    },
    showCardModal(CardAmount){
      this.$refs.myCardModalRef.show(CardAmount)
    },
    hideCardModal(ele) {
      this.$refs.myCardModalRef.hide();
      if(ele == 0) this.saveSvcClosure();
    },
    showConfModal(){
      this.$refs.myConfModalRef.show();
    },
    hideConfModal(ele) {
      this.$refs.myConfModalRef.hide();
      if(ele == 0){
        this.hideCM = 0;
        this.saveSvcClosure();
      }else{
        this.unmatchedAmt = parseInt(parseInt(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))))-parseInt(Math.round(parseFloat(this.Deposit_Amount))));
      }
    },
    closeStatusRoleModal() {
      this.modalShow = false
      this.cardModalShow = false
      this.ReasonModalShow = false
      this.RecExcModalShow = false
      this.ExmodalShow = false
      this.commentModalShow = false
      this.ConfmodalShow = false
      this.ResetmodalShow = false
    },

    GetShipmentUpdate() {

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'svcactualcodamt',
        'data': {
            hubid: this.localhubid,
            status: 'Delivered'
        },
        headers: {
            'Authorization': 'Bearer '+this.myStr
        }
      })
      .then(result => {
        this.penAmtLoading = true;
        if(result.data.rows.length > 0){
          this.yesterdayCODAmt = parseFloat(Math.round(0));
          this.GetPendingCODAmt();
        }else{

          axios({
            method: 'POST',
            url: apiUrl.api_url + 'external/getShipmentUpdate',
            data: {
                hubid: this.localhubid,
                status: 'Delivered'
            },
            headers: {
              'Authorization': 'Bearer '+this.myStr
            }
          }).then(result => {
            var data = []; let yDayCODAmt = 0;
            if(result.data.code==200){
              this.yesterdayCODAmt = (result.data.shipmentupdate) ? parseFloat(Math.round(result.data.shipmentupdate)) : 0;
            }
            this.GetPendingCODAmt();

          }, error => {
            this.penAmtLoading = false; console.error(error);
          })
        }
      }, error => {
          this.penAmtLoading = false;
          console.error(error);
      })
    },

    GetPendingCODAmt() {
      this.financeclosingamt = 0;
      this.financeoutstanding = 0;
      this.input = ({
          hubid: this.localhubid
      })

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'svcpendcodamt',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.rows.length > 0){
          this.pendingCODAmt = parseFloat(Math.round(result.data.rows[0].closingbalance));
          this.closingBalance = result.data.rows[0].closingbalance;
          this.financeclosingamt = result.data.rows[0].financeclosingamt;
          this.financeoutstanding = parseInt(result.data.rows[0].financeclosingamt);
          if(result.data.rows[0].totalamtdeposit > result.data.rows[0].p2pamt){
            this.p2pAmount = 0;
          }
        }else{
          this.pendingCODAmt = 0;
        }
        this.TolatCollection = parseFloat(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))));
        this.penAmtLoading = false; this.disableButton = false;
      }, error => {
        this.penAmtLoading = false; console.error(error);
      })
    },

    GetBankData() {
      this.bankLoading = true; this.disableButton = true;
      this.BankList = []; this.BankMasterId = '';
      if(this.DepositType=='' || this.DepositType==null){
        return false;
      }

      let DepositType = '';
      if(this.DepositType==1){
        DepositType = 'SelfDeposit';
      }else if(this.DepositType==2){
        DepositType = 'CashPickup';
      }else{
        DepositType = 'IMPS';
      }

      this.input = ({
        DepositType: DepositType
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getdeposittypebank',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(async result => {
        if(result.data.result.code==200){
          this.bankLoading = false;
          this.BankList = result.data.result.data;

          await this.GetSVCExceptionData();
          await this.GetShipmentUpdate();
        }else {
          this.bankLoading = false;
          this.BankList=[];
        }
      }, error => {
        this.bankLoading = false;
        console.error(error)
      })
    },

    GetDenominationData(){
      this.denomLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'getAllDenomination',
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.denomLoading = false;
          this.DenominationList = result.data.data;
        }, error => {
          this.denomLoading = false;
          console.error(error)
        })

    },

    GetSVCledgerData() {
        $('span[id^="vri"]').hide();
        $('span[id^="vrl"]').show();

        if(this.RSCOwner){
          this.input = ({
            offset: this.pageno,
            limit: 10,
            hubid: this.localhubid,
            fromdate: this.RSCOwner.EffectiveFromDate,
            todate: this.RSCOwner.EffectiveToDate
          })
        }else{
          this.input = ({
            offset: this.pageno,
            limit: 10,
            hubid: this.localhubid
          })
        }
        this.isLoading = true;
        axios({
            method: 'POST',
            'url': apiUrl.api_url + 'svcledgermaster',
            'data': this.input,
            headers: {
                'Authorization': 'Bearer '+this.myStr
            }
        })
        .then(result => {
          if(result.data.code == 200){
            this.listSVCledgerData = result.data.data;

            let totalRows     = result.data.count;
            this.resultCount  = result.data.count;
            this.resultdate  = result.data.date;
            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }else{
            this.resultCount  = 0; this.listSVCledgerData = [];
          }
          this.isLoading = false;
        }, error => {
            this.isLoading = false; console.error(error);
        })
    },

    GetReasonList(){
      this.input = ({
        ReasonType:"SVC"
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
          if(result.data.Reasons.code==200){
            if(this.localhubIsRSC == true){
              this.ReasonList = result.data.Reasons.data.filter(item => (item['ReasonsID'] != 186 && item['ReasonsID'] != 123 && item['ReasonsID'] != 65 &&
              item['ReasonsID'] != 82 && item['ReasonsID'] != 324 && item['ReasonsID'] != 325 && item['ReasonsID'] != 129 && item['ReasonsID'] != 130 && item['ReasonsID'] != 77));
            }else{
              this.ReasonList = result.data.Reasons.data.filter(item => (item['ReasonsID'] != 186 && item['ReasonsID'] != 123));
            }
          }else{
            console.log('Error', result.data.Reasons.message);
          }
        }, error => {
          console.error(error)
        })
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetSVCledgerData()
    },

    //function is used for calculate notes amount
    notesCount(event){
      if(event.target.id){

        let Denomination = event.target.id;
        let NoteCount = event.target.value;

        document.getElementById("mo"+event.target.id).value = Denomination * NoteCount;
        var arr = document.getElementsByName('note_amt');
        this.tot_amt=0;

        for(var i=0;i<arr.length;i++){

          if(this.DenominationArr.indexOf(Denomination) === -1) {
            this.DenominationArr.push(Denomination);
          }

          if(parseInt(arr[i].value)){
            this.tot_amt += parseInt(arr[i].value);
          }
        }
        document.getElementById('tot_amt').value = this.tot_amt;

        if(!this.isFnF) this.Deposit_Amount = this.tot_amt;
      }
    },

    cardawbno(event){
      let awbArr = []; this.DisputeArr = []; this.CardAmount = 0; this.subLoading = this.disableButton = true;

      if(this.carissAWBNo) awbArr.push({ ReasonID:this.carissReason, AWBNo:this.checkAWB(this.carissAWBNo) });

      if(this.cassnatAWBNo) awbArr.push({ ReasonID:this.cassnatReason, AWBNo:this.checkAWB(this.cassnatAWBNo) });

      if(this.paychgAWBNo) awbArr.push({ ReasonID:this.paychgReason, AWBNo:this.checkAWB(this.paychgAWBNo) });

      if(this.vendrecAWBNo) awbArr.push({ ReasonID:this.vendrecReason, AWBNo:this.checkAWB(this.vendrecAWBNo) });

      if(this.casstolAWBNo) awbArr.push({ ReasonID:this.casstolReason, AWBNo:this.checkAWB(this.casstolAWBNo) });

      if(this.theftstolAWBNo) awbArr.push({ ReasonID:this.theftstolReason, AWBNo:this.checkAWB(this.theftstolAWBNo) });

      if(this.wrongdelAWBNo) awbArr.push({ ReasonID:this.wrongdelReason, AWBNo:this.checkAWB(this.wrongdelAWBNo) });

      if(this.srabscAWBNo) awbArr.push({ ReasonID:this.srabscReason, AWBNo:this.checkAWB(this.srabscAWBNo) });

      if(this.srtpsrAmt) awbArr.push({ ReasonID:this.srtpsrReason, AWBNo:[], ReasonAmt:(this.srtpsrAmt)?this.srtpsrAmt:'0' });

      if(this.srtptsvcAmt) awbArr.push({ ReasonID:this.srtptsvcReason, AWBNo:[], ReasonAmt:(this.srtptsvcAmt)?this.srtptsvcAmt:'0' });

      if(this.lowdis) awbArr.push({ ReasonID:this.lowdisReason, AWBNo:[] });

      if(this.amoimp) awbArr.push({ ReasonID:this.amoimpReason, AWBNo:[], ReasonAmt:(this.ReasonAmount)?this.ReasonAmount:'0' });

      if(this.nddissAWBNo) awbArr.push({ ReasonID:this.nddissReason, AWBNo:this.checkAWB(this.nddissAWBNo) });

      if(this.walissAWBNo) awbArr.push({ ReasonID:this.walissReason, AWBNo:this.checkAWB(this.walissAWBNo) });

      if(this.paypissAWBNo) awbArr.push({ ReasonID:this.paypissReason, AWBNo:this.checkAWB(this.paypissAWBNo) });

      if(this.razissAWBNo) awbArr.push({ ReasonID:this.razissReason, AWBNo:this.checkAWB(this.razissAWBNo) });

      if(this.habridpiAWBNo) awbArr.push({ ReasonID:this.habridpiReason, AWBNo:this.checkAWB(this.habridpiAWBNo), ReasonAmt:this.habridpiAMT });

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'getAWBNo',
        'data': ({'DisputeArr': awbArr}),
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      })
      .then((awbres) => {
        this.subLoading = this.disableButton = false;

        if (awbres.data.code == 200) {
          if(awbres.data.invalidAwb.length>0){
            this.$alertify.error("Some of AWB numbers are invalid, please check: "+awbres.data.invalidAwb.join(', ')); return false;
          }else{
            this.CardAmount = awbres.data.total;
            this.DisputeArr = awbres.data.result;
            this.showCardModal(this.CardAmount);
          }
        } else{
          this.$alertify.error("AWB numbers are invalid, please check."); return false;
        }
      })
      .catch((httpException) => {
        this.subLoading = this.disableButton = false;
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

    saveSvcClosure() {

      let DepositAmount = parseInt(this.Deposit_Amount);
      let DepositReasonExcepAmount = ''; this.unmatchedAmt = 0;
      DepositReasonExcepAmount = parseFloat(Math.round(DepositAmount));

      if(this.RSCOwner && this.isFnF){

        if(this.hideCM==1){
          this.showConfModal(); return false;
        }

        this.disableButton = true; this.subLoading = true;
        this.input = ({
            DepositDate:      this.DepositDate,
            BankDeposit:      DepositReasonExcepAmount,
            CreatedBy:        this.localuserid,
            HubId:            this.localhubid,
            BatchID:          this.BatchID,
            EffectiveToDate:  this.RSCOwner.EffectiveToDate
        })

        axios({
            method: 'POST',
            'url': apiUrl.api_url + 'RSCFnFClosure',
            'data': this.input,
            headers: {
                'Authorization': 'Bearer '+this.myStr
            }
        })
        .then((response) => {
          this.hideCM = 1;

          if (response.data.errorCode == 0) {
            this.$alertify.success(response.data.msg);
            this.disableButton = false; this.subLoading = false;
            window.scrollBy(0, 1000); this.resetForm();
          } else if (response.data.errorCode == -1) {
            this.$alertify.error(response.data.msg)
          }
        }).catch((httpException) => {
          this.hideCM = 1; this.disableButton = false; this.subLoading = false;
          this.$alertify.error('Error occured')
        });

      }else{

        if(this.CardAmount > 0){ //65
          //DepositReasonExcepAmount = parseFloat(Math.round(DepositAmount+parseFloat((this.ReasonAmount)?this.ReasonAmount:'0')+parseFloat(this.CardAmount)));
          DepositReasonExcepAmount = parseFloat(Math.round(DepositAmount+parseFloat(this.CardAmount)));
        }

        //let TolatCollection = parseFloat(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount)-parseFloat(this.CardAmount))));
        let TolatCollection = parseFloat(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))));

        let p2pamt = parseInt(this.p2pAmount);
        if(DepositAmount !== parseInt(this.tot_amt)){
          this.$alertify.error("Denomination details & Deposit amount should be same, please check.");

          let error = document.getElementById("d_a");
           error.innerHTML      = "Denomination details & Deposit amount should be same, please check.";
           error.style.display  = "block";
           return false;
        }else{
          if(p2pamt > 0){
            DepositAmount = DepositAmount - p2pamt;
          }

          document.getElementById("d_a").style.display = "none";

          this.unmatchedAmt = parseFloat(Math.round(parseFloat(TolatCollection)-parseFloat(DepositReasonExcepAmount)));

          let ClosingBalance = 0;

          if(this.unmatchedAmt > 0 && this.unmatchedAmt <= 5){
            this.unmatchedAmt = 0;
          }else{
            if((DepositReasonExcepAmount < TolatCollection) && (this.unmatchedAmt>0)){

              if(!this.lowdis){

                this.showModal(this.unmatchedAmt);
                return false;
              }else{

                if((this.CardAmount>0) && !this.lowdis && (this.unmatchedAmt>0)){ //65
                  this.$alertify.error("Total outstanding COD amount and deposit amount including sum of dispute amount is should be same, please check.");
                  return false;
                }else{
                  if(!this.amoimp){ this.reasonFileList=[]; }
                  this.hideModal();
                }
              }
            }else if((this.CardAmount > 0) && (DepositReasonExcepAmount > TolatCollection)){
              if(parseInt(DepositReasonExcepAmount - TolatCollection) > 5){
                this.unmatchedAmt = parseFloat(Math.round(parseFloat(TolatCollection)-parseFloat(this.Deposit_Amount)));
                this.$alertify.error("Deposit amount including sum of dispute amount should not be greater than total outstanding COD amount and extra amount should not more than 5 Rs.");

                let error            = document.getElementById("d_a");
                error.innerHTML      = "Deposit amount including sum of dispute amount should not be greater than total outstanding COD amount and extra amount should not more than 5 Rs.";
                error.style.display  = "block"; return false;
              }
            }
          }

          ClosingBalance = parseFloat(Math.round(parseFloat(TolatCollection)-parseFloat(DepositAmount)));

          let NoteCountArr = []; let DenominationIDArr = [];
          if(this.DenominationArr.length > 0){
            this.DenominationArr.forEach(function (denomi) {
              NoteCountArr.push(parseInt(document.getElementById("mo"+denomi).value) / parseInt(denomi));
              DenominationIDArr.push(parseInt(document.getElementById("moi"+denomi).value));
            });
          }

          let OpeningBalance = parseFloat(this.closingBalance);
          let CODAmount = parseFloat(Math.round(parseFloat(this.yesterdayCODAmt)+parseFloat(p2pamt)));
          if(this.hideCM==1){
            this.showConfModal(); return false;
          }
          if(this.lowdis || this.unmatchedAmt<=0){
            this.disableButton = true; this.subLoading = true;
            this.input = ({
                DepositDate: this.DepositDate,
                DeliveryDate: this.DeliveryDate,
                Deposit_Amount: DepositAmount,
                DepositType: this.DepositType,
                BankID: this.BankMasterId,
                BankDeposit: DepositAmount,
                TransactionID: this.TransactionID,
                ReasonID: (this.amoimpReason)?this.amoimpReason:null,
                ReasonAmount: 0,
                AWBNo: (this.DisputeArr)?this.DisputeArr:new Array(),
                CardAmount: (this.CardAmount)?this.CardAmount:0,
                CreatedBy: this.localuserid,
                HubId: this.localhubid,
                HubZoneId: this.localhubzoneid,
                DifferenceAmount: 0,
                TolatCollection: TolatCollection,
                StatusID: 1,
                OpeningBalance: OpeningBalance,
                ClosingBalance: (ClosingBalance)?ClosingBalance:0,
                FinanceConfirmAmount: 0,
                CODAmount: CODAmount,
                IsActive: true,
                BatchID: this.BatchID,
                p2pamt: p2pamt,
                totalAmtdeposit: DepositAmount + p2pamt,
                Denomination: this.DenominationArr,
                NoteCount: NoteCountArr,
                DenominationID: DenominationIDArr,
                exceptionId: this.exceptionArr,
                exceptionAmount: this.exceptionAmount,
                hubIsRSC: this.localhubIsRSC,
                financeclosingamt: parseInt(this.financeclosingamt)
            })

            axios({
                method: 'POST',
                'url': apiUrl.api_url + 'submitSVCClosure',
                'data': this.input,
                headers: {
                    'Authorization': 'Bearer '+this.myStr
                }
            })
            .then((response) => {
              this.hideCM = 1;
              if (response.data.errorCode == 0) {
                this.$alertify.success(response.data.msg);
                this.disableButton = false; this.subLoading = false;
                window.scrollBy(0, 1000); this.resetForm();
              } else if (response.data.errorCode == -1) {
                this.$alertify.error(response.data.msg)
              }
            })
            .catch((httpException) => {
              this.hideCM = 1; this.disableButton = false; this.subLoading = false;
              this.$alertify.error('Error occured')
            });
          }else{
            this.hideCM = 1; this.$alertify.error('Error occured')
          }
        }
      }
    },

    //function is used for upload files on AWS s3bucket
    onUpload(event){
      this.disableButton = true;

      if(event.target.files.length<=0){
        this.disableButton = false; return false;
      }

      this.selectedFile = event.target.files[0];

      var name = this.selectedFile.name;
      if(this.selectedFile.size>5242880){
        this.$alertify.error(event.srcElement.placeholder + " Failed! Upload Max File Size Should Not Be Greater Than 5 MB");
        this.disableButton = false; this.DepositSlip = ''; return false;
      }

      if ( /\.(jpe?g|png|gif|bmp|xls|xlsx|csv|doc|docx|rtf|wks|wps|wpd|excel|xlr|pps|pdf|ods|odt)$/i.test(this.selectedFile.name) ){
        name = this.selectedFile.name;
      }else{
        this.$alertify.error(event.srcElement.placeholder + " Failed! Please Upload Only Valid Format: .png, .jpg, .jpeg, .gif, .bmp, .xls, .xlsx, .pdf, .ods, .csv, .doc, .odt, .docx, .rtf, .wks, .wps, .wpd, .excel, .xlr, .pps");
        this.disableButton = false;
        this.DepositSlip = this.selectedFile = '';
        return false;
      }

      const fd = new FormData();
      fd.append('file', this.selectedFile, name);
      fd.append('s3bucketKey', 'SVC-'+this.BatchID);

      if(event.target.id=="ReasonSlip"){
        fd.append('reason', 'Reason');
        this.ReasonLoading = true;
      }else{
        this.DepositLoading = true;
      }

      axios.post(apiUrl.api_url + 'uploadsvcfile', fd,
      {
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      })
      .then(res => {
        if(event.target.id=="ReasonSlip"){
          this.getS3bucketFiles('Reason');
        }else{
          this.getS3bucketFiles();
        }
      }, error => {
        this.ReasonLoading = false; this.DepositLoading = false; this.disableButton = false;
        console.error(error)
      });
    },

    getS3bucketFiles(Reason=null){

      this.input = ({
        BatchID : this.BatchID,
        Reason : Reason,
      });

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'getfilelist',
        'data': this.input,
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      })
      .then(result => {
        this.disableButton = false;
        if(Reason){
          this.ReasonLoading = false;
          this.reasonFileList = result.data.data;

          let error = document.getElementById("rss");
          error.innerHTML      = "";
          error.style.display  = "none";
        }else{
          this.DepositLoading = false;
          this.uploadFileList = result.data.data;

          let error = document.getElementById("dps");
          error.innerHTML      = "";
          error.style.display  = "none";
        }
      }, error => {
        this.disableButton = false; this.ReasonLoading = false; this.DepositLoading = false;
        console.error(error)
      })
    },

    GetSVCExceptionData() {
      if( !this.localhubname ){
        this.$alertify.error("Hub Name does not exist.");
        return false;
      }
      this.exceptionLoading = true;

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'getSVCException',
          'data': {
            hubname: this.localhubname,
            hubid: this.localhubid
          },
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if (result.data.code == 200) {
          this.exceptionLoading = false;
          this.exceptionList = result.data.data;
          this.exception = result.data.data;

          var obj = 0; this.exceptionArr = [];
          for(var i=0; i < this.exceptionList.length; i++) {
             obj += parseFloat(this.exceptionList[i].NetPayment);
             this.exceptionArr.push(this.exception[i].ShippingID);
          }
          this.exceptionAmount = parseFloat(Math.round(obj));
        }else {
          this.exceptionAmount = 0;
          this.exceptionLoading = false;
        }
      }, error => {
          this.exceptionLoading = false;
          console.error(error);
      })
    },

    addExceptionData(event) {
      var obj = 0; this.exceptionArr = [];
      for(var i=0; i < this.exception.length; i++) {
         obj += parseFloat(this.exception[i].NetPayment);
         this.exceptionArr.push(this.exception[i].ShippingID);
      }
      this.exceptionAmount = parseFloat(Math.round(obj));
      this.TolatCollection = parseFloat(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))));
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(!this.isFnF) document.getElementById("d_a").style.display = "none";

        this.DisputeArr = []; this.CardAmount = 0;

         if(this.amoimp && this.reasonFileList.length<=0){
           let error = document.getElementById("rss"); error.innerHTML = "Reason slip used for tax payment/ imprest is required Or please check file extension.";
           error.style.display  = "block"; return false;
         }

         if(this.uploadFileList.length<=0){
           let error = document.getElementById("dps"); error.innerHTML = "Deposit slip is required Or please check file extension.";
           error.style.display  = "block"; return false;
         }

         if(result){

           if(((this.tot_amt != 0 && this.tot_amt != parseInt(this.Deposit_Amount))||!this.tot_amt) && !this.isFnF){

              let error = document.getElementById("d_a");
              error.innerHTML = "Total denomination & deposit amount should be same, please check.";
              error.style.display = "block";
          }else{
            this.unmatchedAmt = parseInt(parseInt(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))))-parseInt(Math.round(parseFloat(this.Deposit_Amount))));

            //78,152,186
            if(parseInt(Math.round(parseFloat(this.Deposit_Amount))) > parseInt(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))))){
              this.unmatchedAmt = 0;
              this.showExModal(parseInt(parseInt(Math.round(parseFloat(this.Deposit_Amount))) - parseInt(Math.round(parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount)))));
            }else{
              if(this.amoimp || this.cariss || this.paychg || this.cassnat || this.casstol || this.theftstol || this.vendrec || this.wrongdel || this.srabsc || this.srtpsr || this.srtptsvc || this.lowdis || this.nddissReason || this.walissReason || this.razissReason || this.paypissReason || this.habridpiReason){
                this.cardawbno(event);
              }else{
                this.saveSvcClosure();
              }
            }
          }
        }else{
          console.log('validation errors exist')
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.DepositLoading = false; this.ReasonLoading = false; this.disableButton = false; this.subLoading = false;
      this.BatchID = this.localhubid+''+Math.floor(Math.random() * (Math.pow(10,5)));
      this.pageno = this.tot_amt = this.unmatchedAmt = this.CardAmount = 0;
      this.uploadFileList = []; this.reasonFileList = []; this.BankList = []; this.exception = []; this.exceptionList = []; this.exceptionArr = [];
      this.DepositDate = this.Deposit_Amount = this.DepositType = this.BankMasterId = this.TransactionID = this.DepositSlip = this.ReasonSlip = this.Reason = '';
      this.DisputeArr = []; this.RSCOwner = '';
      this.amoimp = this.vendrec = this.cassnat = this.cariss = this.paychg = this.casstol = this.theftstol = this.wrongdel = this.srabsc = this.srtpsr = this.srtptsvc = this.lowdis = this.nddiss = this.waliss = this.raziss = this.paypiss = this.habridpi = false;
      this.ReasonAmount = this.vendrecAWBNo = this.cassnatAWBNo = this.carissAWBNo = this.paychgAWBNo = this.casstolAWBNo = this.theftstolAWBNo = this.wrongdelAWBNo = this.srabscAWBNo = this.srtpsrAmt = this.srtptsvcAmt = this.nddissAWBNo = this.walissAWBNo = this.razissAWBNo = this.paypissAWBNo = this.habridpiAWBNo = this.habridpiAMT = '';
      this.amoimpReason = this.vendrecReason = this.cassnatReason = this.carissReason = this.paychgReason = this.casstolReason = this.theftstolReason = this.wrongdelReason = this.srabscReason = this.srtpsrReason = this.srtptsvcReason = this.lowdisReason = this.nddissReason = this.walissReason = this.razissReason = this.paypissReason = this.habridpiReason = '';
      $('#denomlist input[type="text"]').val(0); $('#denomlist input[type="number"]').val('');
      document.getElementById("d_a").style.display = "none";
      this.GetSVCExceptionData();
      this.GetShipmentUpdate();
      this.GetSVCledgerData();
      this.$validator.reset(); this.errors.clear(); document.getElementById('svcform').reset();
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

    changeDepType(){ //change deposit Amount
     this.unmatchedAmt = this.CardAmount = 0; this.Reason = ''; this.ReasonAmount = ''; this.DisputeArr = []; this.reasonFileList = [];
     this.amoimp = this.vendrec = this.lowdis = this.cassnat = this.cariss = this.paychg = this.casstol = this.theftstol = this.wrongdel = this.srabsc = this.srtpsr = this.srtptsvc = this.nddiss = this.waliss = this.raziss = this.paypiss = false;
     this.ReasonAmount = this.vendrecAWBNo = this.cassnatAWBNo = this.carissAWBNo = this.paychgAWBNo = this.casstolAWBNo = this.theftstolAWBNo = this.wrongdelAWBNo = this.srabscAWBNo = this.srtpsrAmt = this.srtptsvcAmt = this.nddissAWBNo = this.walissAWBNo = this.razissAWBNo = this.paypissAWBNo = this.habridpiAWBNo = this.habridpiAMT = '';

      $('input[name="reason"]').each(function() {
  			this.checked = false;
  		});
    },

    showCheckboxes(){
      var checkboxes = document.getElementById("checkboxes");
      if (!this.expanded) {
        checkboxes.style.display = "block";
        this.expanded = true;
      } else {
        checkboxes.style.display = "none";
        this.expanded = false;
      }
    },

    setid(key){
      return key;
    },

    showHideReasonField(Reason){
      if(($('#'+Reason).prop("checked") == true) && Reason){
        if(Reason == 65){
          this.amoimp = true; this.amoimpReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 119) || (process.env.NODE_ENV == 'production' && Reason == 98)){
          this.vendrec = true; this.vendrecReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 77) || (process.env.NODE_ENV == 'production' && Reason == 77)){
          this.cassnat = true; this.cassnatReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 78) || (process.env.NODE_ENV == 'production' && Reason == 78)){
          this.cariss = true; this.carissReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 186) || (process.env.NODE_ENV == 'production' && Reason == 123)){
          this.paychg = true; this.paychgReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 69) || (process.env.NODE_ENV == 'production' && Reason == 69)){
          this.casstol = true; this.casstolReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 82) || (process.env.NODE_ENV == 'production' && Reason == 82)){
          this.theftstol = true; this.theftstolReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 284) || (process.env.NODE_ENV == 'production' && Reason == 127)){
          this.wrongdel = true; this.wrongdelReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 80) || (process.env.NODE_ENV == 'production' && Reason == 80)){
          this.lowdis = true; this.lowdisReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 324) || (process.env.NODE_ENV == 'production' && Reason == 129)){
          this.srabsc = true; this.srabscReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 325) || (process.env.NODE_ENV == 'production' && Reason == 130)){
          this.srtpsr = true; this.srtpsrReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 363) || (process.env.NODE_ENV == 'production' && Reason == 165)){
          this.srtptsvc = true; this.srtptsvcReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 152) || (process.env.NODE_ENV == 'production' && Reason == 121)){
          this.nddiss = true; this.nddissReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 327) || (process.env.NODE_ENV == 'production' && Reason == 134)){
          this.waliss = true; this.walissReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 328) || (process.env.NODE_ENV == 'production' && Reason == 135)){
          this.paypiss = true; this.paypissReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 365) || (process.env.NODE_ENV == 'production' && Reason == 167)){
          this.raziss = true; this.razissReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 369) || (process.env.NODE_ENV == 'production' && Reason == 171)){
          this.habridpi = true; this.habridpiReason = Reason;
        }
      }else{
        if(Reason == 65){
          this.amoimp = false; this.ReasonAmount = ''; this.reasonFileList = []; this.amoimpReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 119) || (process.env.NODE_ENV == 'production' && Reason == 98)){
          this.vendrec = false; this.vendrecAWBNo = ''; this.vendrecReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 77) || (process.env.NODE_ENV == 'production' && Reason == 77)){
          this.cassnat = false; this.cassnatAWBNo = ''; this.cassnatReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 78) || (process.env.NODE_ENV == 'production' && Reason == 78)){
          this.cariss = false; this.carissAWBNo = ''; this.carissReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 186) || (process.env.NODE_ENV == 'production' && Reason == 123)){
          this.paychg = false; this.paychgAWBNo = ''; this.paychgReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 69) || (process.env.NODE_ENV == 'production' && Reason == 69)){
          this.casstol = false; this.casstolAWBNo = ''; this.casstolReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 82) || (process.env.NODE_ENV == 'production' && Reason == 82)){
          this.theftstol = false; this.theftstolAWBNo = ''; this.theftstolReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 284) || (process.env.NODE_ENV == 'production' && Reason == 127)){
          this.wrongdel = false; this.wrongdelAWBNo = ''; this.wrongdelReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 80) || (process.env.NODE_ENV == 'production' && Reason == 80)){
          this.lowdis = false; this.lowdisReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 324) || (process.env.NODE_ENV == 'production' && Reason == 129)){
          this.srabsc = false; this.srabscAWBNo = ''; this.srabscReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 325) || (process.env.NODE_ENV == 'production' && Reason == 130)){
          this.srtpsr = false; this.srtpsrAmt = ''; this.srtpsrReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 363) || (process.env.NODE_ENV == 'production' && Reason == 165)){
          this.srtptsvc = false; this.srtptsvcAmt = ''; this.srtptsvcReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 152) || (process.env.NODE_ENV == 'production' && Reason == 121)){
          this.nddiss = false; this.nddissAWBNo = ''; this.nddissReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 327) || (process.env.NODE_ENV == 'production' && Reason == 134)){
          this.waliss = false; this.walissAWBNo = ''; this.walissReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 328) || (process.env.NODE_ENV == 'production' && Reason == 135)){
          this.paypiss = false; this.paypissAWBNo = ''; this.paypissReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 365) || (process.env.NODE_ENV == 'production' && Reason == 167)){
          this.raziss = false; this.razissAWBNo = ''; this.razissReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 369) || (process.env.NODE_ENV == 'production' && Reason == 171)){
          this.habridpi = false; this.habridpiAWBNo = ''; this.habridpiAMT = ''; this.habridpiReason = '';
        }
      }
    },

    showReasonAWBNo(ele){
      this.DisputeArr = [];
      this.DisputeArr = ele;
      this.$refs.myReasonModalRef.show();
    },

    showRecExcAWBNo(eletyp, ele, eleawb){

      this.DisputeArr = [];

      if(ele>0){
        let AWBArr = {}; AWBArr['awb'] = []

        AWBArr['Reason'] = "Exception"

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

    showExModal(Balanc){
       this.$refs.myExModalRef.show(Balanc)
       this.ExData = Balanc;
    },

    hideExModal(ele) {
      if(ele == 0){
        this.$refs.myExModalRef.hide()
        this.saveSvcClosure();
      }else{
        this.$refs.myExModalRef.hide()
      }
    },

    showComment(ele, type){
      this.comment = []; this.cType = ''; this.comment = ele;
      if(type=='c') this.cType = 'Finance Comment'; else this.cType = 'Transaction Id';
      this.$refs.myCommentModalRef.show();
    },

    showResetModal(data){
      this.resetdata = []; this.resetdata = data; this.resetDD = ''; this.resetDD = data.deliverydate; this.resetType = 'reset SVC closure';
      this.$refs.myResetModalRef.show();
    },

    hideResetModal(ele) {
      this.$refs.myResetModalRef.hide();
      if(ele == 0){
        this.resetSVCledger(this.resetdata);
      }
    },

    resetSVCledger(data){
      this.isLoading = true;
      this.input = ({
        svcledgerid:      data.svcledgerid,
        hubid:            this.localhubid,
        openingbalance:   data.openingbalance,
        codamount:        data.codamount,
        bankdeposit:      data.bankdeposit,
        statusid:         data.statusid,
        financereasonid:  data.financereasonid,
        createdby:        data.createdby,
        username:         this.localuserid,
        deliverydate:     this.resetDD
      });

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'deleteSVCLedgerEntry',
        'data': this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      })
      .then(async response => {
        this.isLoading = false;
        if (response.data.code == 200) {
          this.$alertify.success(response.data.msg);
          await this.GetSVCledgerData();
          await this.GetShipmentUpdate();
        } else {
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException); this.isLoading = false; this.$alertify.error('Error Occured');
      });
    },

    //to get RSC Wise RSC Owner List
    getRSCOwnerData() {
      this.rscLoading = true; this.RSCOwnerList = [];

      this.input = ({ hubid: this.localhubid });
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getHubRSCOwnerDetails',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.rscLoading = false;

          if(result.data.code == 200){
            this.RSCOwnerList = result.data.RSCOwnerArr;
          }
        }, error => {
          this.rscLoading = false; console.error(error);
        })
    },

    setRSCOwner(){

      this.GetSVCledgerData();

      if(this.RSCOwner && (this.RSCOwner.EffectiveToDate < this.DeliveryDate)){

	this.isFnF = true;

        this.closingBalance = this.TolatCollection = this.pendingCODAmt = this.yesterdayCODAmt = this.exceptionAmount = 0;
        this.penAmtLoading = true; this.disableButton = true;
        this.financeoutstanding = 0;
        this.input = ({
          EffectiveToDate: this.RSCOwner.EffectiveToDate,
          hubid: this.localhubid
        })

        axios({
            method: 'POST',
            'url': apiUrl.api_url + 'rscvendorpendingamt',
            'data': this.input,
            headers: {
                'Authorization': 'Bearer '+this.myStr
            }
        })
        .then(result => {
          if(result.data.code == 200){
            this.TolatCollection = this.pendingCODAmt = parseFloat(Math.round(result.data.data.closingbalance));
            this.BatchID         = (result.data.data.batchid != 0 && result.data.data.batchid != null) ? result.data.data.batchid : this.BatchID;
            this.financeoutstanding = parseInt(Math.round(result.data.data.financeclosingamt))
          }

          this.penAmtLoading = false; this.disableButton = false;
        }, error => {
          this.penAmtLoading = false; console.error(error);
        })
      }else{ this.isFnF = false; this.GetShipmentUpdate(); }
    }
  }
}
