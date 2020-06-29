import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';


export default {
  name: 'srclosure',
  components: {
  VueElementLoading,
  Multiselect},
  props: [],

  data() {
    return {
      Deposit_Amount:"",
      SR_Name:"",
      tot_amt:"",
      PendingCOD:0,
      TotalAmount:0,
      TodaysCOD:0,
      TodaysShipmentCount: 0,
      deliveredCODArr: [],
      DeliveryDate: '',
      assign: 0,
      card: 0,
      cash: 0,
      payphi: 0,
      cod: "",
      ndr: 0,
      prepaid: 0,
      wallet: 0,
      assignArr: [],
      cardArr: [],
      cashArr: [],
      payphiArr: [],
      ndrArr: [],
      prepaidArr: [],
      walletArr: [],
      awbnotype: '',
      awbArr: [],
      Reason:"",
      RemainData:0,
      resultCount:0,
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      Loading: false,
      ledgerLoading: false,
      SRList:[],
      DenominationList:[],
      DenominationArr: [],
      RightSRLedgerList:[],
      SRLedgerList:[],
      ReasonList:[],
      Regionshow:false,
      RightSRLedger:false,
      SRLedgerDetails:false,
      modalShow:false,
      localhubid: 0,
      localusername: '',
      localuserid: 0,
      myStr:"",
      show:false,
      urltoken:"",
      denomLoading: false,
      srLoading: false,
      modalShippingShow:false,
      disableButton: false,
      pendingClosureList:[],
      todayClosureList:[],
      pendingCount:0,
      closureCount:0,
      srtype:'',
      srArr:[],
      modalSRNameShow:false,
      castheftAWBNo: '',
      prevpenbalAWBNo: '',
      srtpsrAmt: '',
      carissAWBNo: '',
      cassnatAWBNo: '',
      selfrecAWBNo: '',
      srabscAWBNo: '',
      paychgAWBNo: '',
      codimprAWBNo: '',
      codnttimAWBNo: '',
      theftstolAWBNo: '',
      wrongdelAWBNo: '',
      nddissAWBNo: '',
      walissAWBNo: '',
      paypissAWBNo: '',
      castheftReason:'',
      prevpenbalReason:'',
      srissReason: '',
      lowdisReason:'',
      carissReason: '',
      cassnatReason: '',
      selfrecReason: '',
      srabscReason: '',
      paychgReason: '',
      codimprReason: '',
      codnttimReason: '',
      theftstolReason: '',
      wrongdelReason: '',
      nddissReason: '',
      walissReason: '',
      paypissReason: '',
      castheft:false,
      prevpenbal:false,
      sriss:false,
      lowdis:false,
      cariss:false,
      codimpr:false,
      selfrec:false,
      srabsc:false,
      cassnat:false,
      paychg:false,
      codnttim:false,
      theftstol:false,
      wrongdel:false,
      nddiss: false,
      waliss: false,
      paypiss: false,
      CardAmount: 0,
      DisputeArr: [],
      expanded:false,
      cardModalShow:false,
      subLoading:false,
      ReasonModalShow:false,
      DenomDetailModalShow:false,
      DenomDetail:[],
      deliveredCashArr:[],
      deliveredPayphiArr:[],
      deliveredWalletArr:[],
      deliveredCardArr:[],
      TodaysCash:0,
      TodaysPayphi:0,
      TodaysWallet:0,
      TodaysCard:0,
      TodaysCashCount:0,
      TodaysPayphiCount:0,
      TodaysWalletCount:0,
      TodaysCardCount:0,
      ExData:0,
      ExmodalShow:false,
      codArr:[],
      userRole:''
    }
  },

  computed: {

  },
  created() {
  this.urltoken = window.localStorage.getItem('accessuserToken');
  },

  mounted() {
    //this.GetDeliveryAgentData();
    this.GetDenominationData();
    this.GetReasonList();
    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;
    this.localhubIsRSC    = hubdetail[0].IsRSC;

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.userid;
    this.localusername    = userdetail.username;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.userRole = window.localStorage.getItem('accessrole');

    this.srStatus();
  },

  methods: {
    showSRNameModal(typ, ele){
      this.srtype = ''; this.srArr = [];
      this.srtype = typ;
      this.srArr = ele;
      this.$refs.SRNameModalRef.show();
    },

    closeSRNameModal() {
        this.modalSRNameShow = false
    },

    showShippingidModal(typ, ele){
      this.awbnotype = ''; this.awbArr = [];
      this.awbnotype = typ;
      this.awbArr = ele;
      this.$refs.shippingModalRef.show();
    },

    closeShippingidModal() {
        this.modalShippingShow = false
    },

    showModal(Balanc){
       this.$refs.myModalRef.show(Balanc)
       this.RemainData = Balanc;
    },

    hideModal() {
       this.$refs.myModalRef.hide()
     },

    closeStatusRoleModal() {
       this.modalShow = false
       this.ExmodalShow = false
       this.cardModalShow = false
       this.ReasonModalShow = false
       this.DenomDetailModalShow = false
    },

    saveSRClosure(event){

       let statusAmount = ""; document.getElementById("d_a").style.display = "none"; this.RemainData = 0;

       let TotalAmt = parseInt(this.TotalAmount);
       let IntDeposit_Amount = parseInt(this.Deposit_Amount);

       if(this.CardAmount > 0){
         IntDeposit_Amount = parseFloat(Math.round(IntDeposit_Amount+parseFloat(this.CardAmount)));
       }

       let Balanc = 0;
       let insertflag= 0;

       if((this.CardAmount > 0) && (IntDeposit_Amount > TotalAmt)){
         this.Regionshow = true;
         this.$alertify.error("Deposit amount including sum of Dispute AWB amount should not be greater than total outstanding COD amount, please check.");
         let error            = document.getElementById("d_a");
         error.innerHTML      = "Deposit amount including sum of Dispute AWB amount should not be greater than total outstanding COD amount, please check.";
         error.style.display  = "block"; return false;
       }else if((this.CardAmount==0) && (IntDeposit_Amount > TotalAmt)){

         insertflag=1;
         this.Regionshow = false;
         statusAmount = "Extra Amount";
         Balanc = TotalAmt - IntDeposit_Amount ;
       }else if(IntDeposit_Amount < TotalAmt){

         Balanc = TotalAmt - IntDeposit_Amount ;
         this.showModal(Balanc)
         this.Regionshow = true
         statusAmount = "Less Amount"

         if(this.lowdis || Balanc<=0){
           insertflag=1;
           this.hideModal()
         }
       }else{
         insertflag=1;
         this.Regionshow = false
         statusAmount = "Equal Amount"
       }

       let NoteCountArr = []; let DenominationIDArr = [];

       if(this.DenominationArr.length > 0){
         this.DenominationArr.forEach(function (denomi) {
           NoteCountArr.push(parseInt(document.getElementById("mo"+denomi).value) / parseInt(denomi));
           DenominationIDArr.push(parseInt(document.getElementById("moi"+denomi).value));
         });
       }

       if(this.lowdis || insertflag == 1){
         this.disableButton = true; this.SRLedgerDetails = true; this.subLoading = true;
         this.input = ({
           srid: this.SR_Name,
           hubid: this.localhubid,
           status: statusAmount,
           creditamount: this.Deposit_Amount,
           debitamount:  parseFloat(Math.round(Balanc)),
           todayscod: this.TodaysCOD,
           reasonid: '',
           islessamountaccept: false,
           username: this.localusername,
           Denomination: this.DenominationArr,
           NoteCount: NoteCountArr,
           DenominationID: DenominationIDArr,
           AWBNo: (this.DisputeArr)?this.DisputeArr:new Array(),
           disputeAmt: (this.CardAmount)?this.CardAmount:0
           })
           axios({
             method: 'POST',
               'url': apiUrl.api_url + 'insertSRLedgerDetails',
               'data': this.input,
               headers: {
                   'Authorization': 'Bearer '+this.myStr
                    }
              })
              .then((response) => {
                this.disableButton = false; this.subLoading = false;
                  if (response.data.code) {
                    this.srStatus();
                    this.$alertify.success(response.data.data);

                    if(Balanc > 0){
                      this.GetSRLedgerDetails();
                      this.getRightSRLedgerDetails();
                      window.scrollBy(0, 1000);
                    }else{
                      this.RightSRLedger = this.SRLedgerDetails = false;
                      this.SR_Name = '';
                    }

                    this.DenominationList.map(data=>{
                      let countVal = document.getElementById(data.Denomination);
                      let amountVal = document.getElementById("mo"+data.Denomination);
                      countVal.value=""
                      amountVal.value=0
                    });
                    this.resetData(event);
                  }
              })
              .catch((httpException) => {
                this.disableButton = false; this.subLoading = false;
                console.error('exception is:::::::::', httpException)
                this.$alertify.error('Error Occured');
              });
       }
    },

    resetData(event){
      this.DenominationList.map(data=>{
        let countVal = document.getElementById(data.Denomination);
        let amountVal = document.getElementById("mo"+data.Denomination);
        countVal.value=""; amountVal.value=0;
      });
      //this.GetDeliveryAgentData();
      this.Regionshow = this.RightSRLedger = this.SRLedgerDetails = false;
      this.assign = this.card = this.cash = this.cod = this.ndr = this.prepaid = this.wallet = this.payphi = 0;
      this.assignArr = this.cardArr = this.cashArr = this.ndrArr = this.prepaidArr = this.walletArr = this.payphiArr = this.awbArr = this.codArr = [];
      this.SR_Name = this.Deposit_Amount = this.Reason = this.tot_amt = this.awbnotype = '';

      this.DisputeArr = this.DenomDetail = []; this.CardAmount = 0;

      this.castheft = this.prevpenbal = this.sriss = this.lowdis = this.cariss = this.codimpr = this.selfrec = this.srabsc = this.cassnat = this.paychg = this.codnttim = this.theftstol = this.wrongdel = this.nddiss = this.waliss = this.paypiss = false;
      this.castheftAWBNo = this.prevpenbalAWBNo = this.srtpsrAmt = this.carissAWBNo = this.codimprAWBNo = this.selfrecAWBNo = this.srabscAWBNo = this.cassnatAWBNo = this.paychgAWBNo = this.codnttimAWBNo = this.theftstolAWBNo = this.wrongdelAWBNo = this.nddissAWBNo = this.walissAWBNo = this.paypissAWBNo = '';
      this.castheftReason = this.prevpenbalReason = this.srissReason = this.lowdisReason = this.carissReason = this.codimprReason = this.selfrecReason = this.srabscReason = this.cassnatReason = this.paychgReason = this.codnttimReason = this.theftstolReason = this.wrongdelReason = this.nddissReason = this.walissReason = this.paypissReason = '';

      this.PendingCOD = this.TodaysCOD = this.TotalAmount = this.TodaysShipmentCount = this.TodaysCash = this.TodaysPayphi = this.TodaysWallet = this.TodaysCard = this.TodaysCashCount = this.TodaysPayphiCount = this.TodaysWalletCount = this.TodaysCardCount = 0;
      this.deliveredCODArr = this.deliveredCashArr = this.deliveredPayphiArr = this.deliveredWalletArr = this.deliveredCardArr = [];
      document.getElementById("d_a").style.display = "none";
      this.$validator.reset(); this.errors.clear(); document.getElementById('srform').reset();
    },

    getRightSRLedgerDetails(){
       this.input = ({
          srid: this.SR_Name
       })
       this.isLoading = true;
       axios({
           method: 'POST',
           url: apiUrl.api_url + 'getRightSRLedgerDetails',
           data: this.input,
           headers: {
              'Authorization': 'Bearer '+this.myStr
           }
         })
         .then(result => {
           if(result.data.code = 200){
             this.isLoading           = false;
             this.PendingCOD          = result.data.PendingCOD
             this.TodaysCOD           = result.data.TodaysCOD
             this.TotalAmount         = result.data.TotalAmount
             this.TodaysShipmentCount = result.data.TodaysShipmentCount
             this.deliveredCODArr     = result.data.TodaysShippingId

             if(result.data.CODDetailsArr.length>0){
               this.deliveredCashArr  = result.data.CODDetailsArr[0].cashArr
               this.deliveredPayphiArr  = result.data.CODDetailsArr[0].payphiArr
               this.deliveredWalletArr  = result.data.CODDetailsArr[0].walletArr
               this.deliveredCardArr    = result.data.CODDetailsArr[0].cardArr

               this.TodaysCash          = result.data.CODDetailsArr[0].cashAmt
               this.TodaysPayphi        = result.data.CODDetailsArr[0].payphiAmt
               this.TodaysWallet        = result.data.CODDetailsArr[0].walletAmt
               this.TodaysCard          = result.data.CODDetailsArr[0].cardAmt

               this.TodaysCashCount = result.data.CODDetailsArr[0].cash
               this.TodaysPayphiCount = result.data.CODDetailsArr[0].payphi
               this.TodaysWalletCount = result.data.CODDetailsArr[0].wallet
               this.TodaysCardCount = result.data.CODDetailsArr[0].card
             }else{
               this.TodaysCash = this.TodaysPayphi = this.TodaysWallet = this.TodaysCard = this.TodaysCashCount = this.TodaysPayphiCount = this.TodaysWalletCount = this.TodaysCardCount = 0;
               this.deliveredCashArr = this.deliveredPayphiArr = this.deliveredWalletArr = this.deliveredCardArr = [];
             }
           }else{
              this.isLoading = false;
              this.PendingCOD = this.TodaysCOD = this.TotalAmount = this.TodaysShipmentCount = this.TodaysCash = this.TodaysPayphi = this.TodaysWallet = this.TodaysCard = this.TodaysCashCount = this.TodaysPayphiCount = this.TodaysWalletCount = this.TodaysCardCount = 0;
              this.deliveredCODArr = this.deliveredCashArr = this.deliveredPayphiArr = this.deliveredWalletArr = this.deliveredCardArr = [];
           }
         }, error => {
           console.error(error)
         })
    },

    srChange(event){
       this.SR_Name = event.target.value
       this.RightSRLedger = true;
       this.SRLedgerDetails = true;
       if(!this.SR_Name){
         return false;
         this.resetData(event);
       }
       this.input = ({
          srid: this.SR_Name,
          hubid: this.localhubid,
          username: this.localusername,
          status: ""
       })
       this.Loading = true;
       axios({
           method: 'POST',
           url: apiUrl.api_url + 'insertSRShipment',
           data: this.input,
           headers: {
             'Authorization': 'Bearer '+this.urltoken
           }
         })
         .then(result => {

           this.getRightSRLedgerDetails()
           this.GetSRLedgerDetails()

            if(result.data.code == 200){
              this.Loading      = false;
              this.assign       = result.data.data.assign
              this.assignArr    = result.data.data.assignArr

              this.card         = result.data.data.card
              this.cardArr      = result.data.data.cardArr

              this.cash         = result.data.data.cash
              this.cashArr      = result.data.data.cashArr

              this.payphi       = result.data.data.payphi
              this.payphiArr    = result.data.data.payphiArr

              this.cod          = result.data.data.cod
              this.codArr    = result.data.data.codArr

              this.ndr          = result.data.data.ndr
              this.ndrArr       = result.data.data.ndrArr

              this.prepaid      = result.data.data.prepaid
              this.prepaidArr   = result.data.data.prepaidArr

              this.wallet       = result.data.data.wallet
              this.walletArr    = result.data.data.walletArr
            }
            if(result.data.code == 204){
              this.assign = this.card = this.cash = this.cod = this.ndr = this.prepaid = this.wallet = this.payphi = 0;
              this.assignArr = this.cardArr = this.cashArr = this.ndrArr = this.prepaidArr = this.walletArr = this.payphiArr = this.awbArr = this.codArr = [];
              this.awbnotype = '';
              this.Loading = false;
            }

         }, error => {
           console.error(error)
         })
    },

    GetReasonList(){
      this.input = ({
        ReasonType:"SR"
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getCODReasons',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          if(result.data.Reasons.code==200){
            if(this.localhubIsRSC == true){
              this.ReasonList = result.data.Reasons.data.filter(item => (item['ReasonsID'] != 251 && item['ReasonsID'] != 126 && item['ReasonsID'] != 185 && item['ReasonsID'] != 122 && item['ReasonsID'] != 74 && item['ReasonsID'] != 75 && item['ReasonsID'] != 323 && item['ReasonsID'] != 66 && item['ReasonsID'] != 128));
            }else{
              this.ReasonList = result.data.Reasons.data.filter(item => (item['ReasonsID'] != 251 && item['ReasonsID'] != 126 && item['ReasonsID'] != 185 && item['ReasonsID'] != 122));
            }
          }else{
            console.log('Error', result.data.Reasons.message);
          }
        }, error => {
          console.error(error)
        })
    },

    GetSRLedgerDetails(){
      this.input = ({
        srid: this.SR_Name,
        hubid:this.localhubid
      })
      this.ledgerLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getSRLedgerDetails',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.ledgerLoading = false;
            this.SRLedgerList = result.data.data
            this.resultCount  = this.SRLedgerList.length;
          }
          if(result.data.code == 204){
            this.ledgerLoading = false;
            this.SRLedgerList = [];
            this.resultCount  = 0;
          }
        }, error => {
          this.ledgerLoading = false;
          console.error(error)
        })
    },

    //to get Denomination List
    GetDenominationData(){
      this.denomLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'getAllDenomination',
          headers: {
            'Authorization': 'Bearer '+this.urltoken
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

    //to get SR List
    GetDeliveryAgentData() {
      this.srLoading = true;
      var hubEncrypt = window.localStorage.getItem('accesshubdata')
      var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
      var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
      var hubArr=JSON.parse(hubtext);

      this.input = ({
          usertype: "3",
          hubid: [hubArr[0].HubID],
          hubname: hubArr[0].HubName
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getdeliveryagents',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          this.srLoading = false;
          this.SRList = result.data.SR
        }, error => {
          this.srLoading = false;
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
          this.DisputeArr = []; this.CardAmount = 0;

          if((this.tot_amt != '0' && this.tot_amt != parseInt(this.Deposit_Amount))||!this.tot_amt){
            let error = document.getElementById("d_a");
             error.innerHTML = "Total denomination & deposit amount should be same, please check.";
             error.style.display = "block";

          }else{
            if(parseInt(this.Deposit_Amount) > parseInt(this.TotalAmount)){
              this.Regionshow = false;

              this.showExModal(parseInt(parseInt(this.Deposit_Amount) - parseInt(this.TotalAmount)));
            }else{
              if(this.castheft || this.prevpenbal || this.sriss || this.lowdis || this.cariss || this.codimpr || this.selfrec || this.srabsc || this.cassnat || this.paychg || this.codnttim || this.theftstol || this.wrongdel || this.nddissReason || this.walissReason || this.paypissReason){
                this.cardawbno(event);
              }else{
                let error = document.getElementById("d_a"); error.style.display = "None";

                this.saveSRClosure(event)
              }
            }
          }
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
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

          if(parseInt(arr[i].value)) this.tot_amt += parseInt(arr[i].value);
        }
        document.getElementById('tot_amt').value = this.tot_amt;
        this.Deposit_Amount = "";
        this.Deposit_Amount = this.tot_amt;
      }
    },

    srStatus() {
      this.srLoading = true;
      this.input = ({
        hubid:[this.localhubid],
        userRole:this.userRole ? this.userRole : '',
        userid:this.localuserid
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
        this.pendingClosureList  = this.todayClosureList = [];
        this.pendingCount  = this.closureCount = 0;

        if(result.data.code == 200){
          this.pendingClosureList = result.data.data.pending;
          this.todayClosureList  = result.data.todayClosure;

          this.pendingCount = result.data.data.pending.length;
          this.closureCount = result.data.todayClosure.length;
        }
        this.srLoading = false;
      }, error => {
        console.error(error)
        this.srLoading = false;
        this.$alertify.error('Error Occured');
      })
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
        if(Reason == 66){
          this.cassnat = true; this.cassnatReason = Reason;
        }else if(Reason == 67){
          this.castheft = true; this.castheftReason = Reason;
        }else if(Reason == 71){
          this.prevpenbal = true; this.prevpenbalReason = Reason;
        }else if(Reason == 72){
          this.lowdis = true; this.lowdisReason = Reason;
        }else if(Reason == 73){
          this.wrongdel = true; this.wrongdelReason = Reason;
        }else if(Reason == 74){
          this.sriss = true; this.srissReason = Reason;
        }else if(Reason == 75){
          this.theftstol = true; this.theftstolReason = Reason;
        }else if(Reason == 76){
          this.codimpr = true; this.codimprReason = Reason;
        }else if(Reason == 68){
          this.cariss = true; this.carissReason = Reason;
        }else if(Reason == 70){
          this.codnttim = true; this.codnttimReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 185) || (process.env.NODE_ENV == 'production' && Reason == 122)){
          this.paychg = true; this.paychgReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 251) || (process.env.NODE_ENV == 'production' && Reason == 126)){
          this.selfrec = true; this.selfrecReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 323) || (process.env.NODE_ENV == 'production' && Reason == 128)){
          this.srabsc = true; this.srabscReason = Reason;
        }else if(Reason == 326){
          this.nddiss = true; this.nddissReason = Reason;
        }else if(Reason == 329){
          this.waliss = true; this.walissReason = Reason;
        }else if(Reason == 330){
          this.paypiss = true; this.paypissReason = Reason;
        }

      }else{
        if(Reason == 66){
          this.cassnat = false; this.cassnatAWBNo = ''; this.cassnatReason = '';
        }else if(Reason == 67){
          this.castheft = false; this.castheftAWBNo = ''; this.castheftReason = '';
        }else if(Reason == 71){
          this.prevpenbal = false; this.prevpenbalAWBNo = ''; this.prevpenbalReason = '';
        }else if(Reason == 72){
          this.lowdis = false; this.lowdisReason = '';
        }else if(Reason == 73){
          this.wrongdel = false; this.wrongdelAWBNo = ''; this.wrongdelReason = '';
        }else if(Reason == 74){
          this.sriss = false; this.srtpsrAmt = ''; this.srissReason = '';
        }else if(Reason == 75){
          this.theftstol = false; this.theftstolAWBNo = ''; this.theftstolReason = '';
        }else if(Reason == 76){
          this.codimpr = false; this.codimprAWBNo = ''; this.codimprReason = '';
        }else if(Reason == 68){
          this.cariss = false; this.carissAWBNo = ''; this.carissReason = '';
        }else if(Reason == 70){
          this.codnttim = false; this.codnttimReason = Reason;
        }else if((process.env.NODE_ENV == 'development' && Reason == 185) || (process.env.NODE_ENV == 'production' && Reason == 122)){
          this.paychg = false; this.paychgAWBNo = ''; this.paychgReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 251) || (process.env.NODE_ENV == 'production' && Reason == 126)){
          this.selfrec = false; this.selfrecAWBNo = ''; this.selfrecReason = '';
        }else if((process.env.NODE_ENV == 'development' && Reason == 323) || (process.env.NODE_ENV == 'production' && Reason == 128)){
          this.srabsc = false; this.srabscAWBNo = ''; this.srabscReason = '';
        }else if(Reason == 326){
          this.nddiss = false; this.nddissAWBNo = ''; this.nddissReason = '';
        }else if(Reason == 329){
          this.waliss = false; this.walissAWBNo = ''; this.walissReason = '';
        }else if(Reason == 330){
          this.paypiss = false; this.paypissAWBNo = ''; this.paypissReason = '';
        }
      }
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

    cardawbno(event){
      this.subLoading = this.disableButton = true;

      let awbArr = []; this.DisputeArr = []; this.CardAmount = 0;

      if(this.carissAWBNo) awbArr.push({ ReasonID:this.carissReason, AWBNo:this.checkAWB(this.carissAWBNo) });

      if(this.cassnatAWBNo) awbArr.push({ ReasonID:this.cassnatReason, AWBNo:this.checkAWB(this.cassnatAWBNo) });

      if(this.castheftAWBNo) awbArr.push({ ReasonID:this.castheftReason, AWBNo:this.checkAWB(this.castheftAWBNo) });

      if(this.paychgAWBNo) awbArr.push({ ReasonID:this.paychgReason, AWBNo:this.checkAWB(this.paychgAWBNo) });

      if(this.prevpenbalAWBNo) awbArr.push({ ReasonID:this.prevpenbalReason, AWBNo:this.checkAWB(this.prevpenbalAWBNo) });

      if(this.srtpsrAmt) awbArr.push({ ReasonID:this.srissReason, AWBNo:[], ReasonAmt:(this.srtpsrAmt)?this.srtpsrAmt:'0' });

      if(this.theftstolAWBNo) awbArr.push({ ReasonID:this.theftstolReason, AWBNo:this.checkAWB(this.theftstolAWBNo) });

      if(this.wrongdelAWBNo) awbArr.push({ ReasonID:this.wrongdelReason, AWBNo:this.checkAWB(this.wrongdelAWBNo) });

      if(this.codnttimAWBNo) awbArr.push({ ReasonID:this.codnttimReason, AWBNo:this.checkAWB(this.codnttimAWBNo) });

      if(this.codimprAWBNo) awbArr.push({ ReasonID:this.codimprReason, AWBNo:this.checkAWB(this.codimprAWBNo) });

      if(this.selfrecAWBNo) awbArr.push({ ReasonID:this.selfrecReason, AWBNo:this.checkAWB(this.selfrecAWBNo) });

      if(this.srabscAWBNo) awbArr.push({ ReasonID:this.srabscReason, AWBNo:this.checkAWB(this.srabscAWBNo) });

      if(this.lowdis) awbArr.push({ ReasonID:this.lowdisReason, AWBNo:[] });

      if(this.nddissAWBNo) awbArr.push({ ReasonID:this.nddissReason, AWBNo:this.checkAWB(this.nddissAWBNo) });

      if(this.walissAWBNo) awbArr.push({ ReasonID:this.walissReason, AWBNo:this.checkAWB(this.walissAWBNo) });

      if(this.paypissAWBNo) awbArr.push({ ReasonID:this.paypissReason, AWBNo:this.checkAWB(this.paypissAWBNo) });

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

    showCardModal(CardAmount){
      this.$refs.myCardModalRef.show(CardAmount)
    },

    hideCardModal(ele) {
      if(ele == 0){
        this.$refs.myCardModalRef.hide()
        this.saveSRClosure(event);
      }else{
        this.$refs.myCardModalRef.hide()
      }
    },

    showReasonAWBNo(ele){
      this.DisputeArr = [];
      this.DisputeArr = ele;
      this.$refs.myReasonModalRef.show();
    },

    showDenomDetail(eleawb){

      this.DenomDetail = [];
      this.DenomDetail = eleawb;

      this.$refs.myDenomDetailModalRef.show();
    },

    showExModal(Balanc){
       this.$refs.myExModalRef.show(Balanc)
       this.ExData = Balanc;
    },

    hideExModal(ele) {
      if(ele == 0){
        this.$refs.myExModalRef.hide()
        this.saveSRClosure(event);
      }else{
        this.$refs.myExModalRef.hide()
      }
    },
  }
}
