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
      RightSRLedgerList:[],
      SRLedgerList:[],
      ReasonList:[],
      Regionshow:false,
      RightSRLedger:false,
      SRLedgerDetails:false,
      modalShow:false,
      localhubid: 0,
      localusername: 0,
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
      modalSRNameShow:false
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

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localusername      = userdetail.username;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

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
     },
     saveSRClosure(event){

       let statusAmount = "";

       let TotalAmt = (document.getElementById("Tot_Amt")).textContent;
       let IntTotalAmt = parseInt(TotalAmt)
       let IntDeposit_Amount = parseInt(this.Deposit_Amount)
       let Balanc = 0;
       let insertflag= 0;

       if(IntDeposit_Amount > TotalAmt){
         this.$alertify.error("Deposit amount should not be greater than total amount, please check.");

         let error            = document.getElementById("d_a");
         error.innerHTML      = "Deposit amount should not be greater than total amount, please check.";
         error.style.display  = "block"; return false;
       }

       if(IntTotalAmt > IntDeposit_Amount){
         Balanc = TotalAmt - this.Deposit_Amount ;
         this.showModal(Balanc)
         this.Regionshow = true
         statusAmount = "Less Amount"
         if(this.Reason){
           insertflag=1;
           this.hideModal()
         }
       }else if(IntTotalAmt < IntDeposit_Amount){
         insertflag=1;
         this.Regionshow = false
         statusAmount = "Extra Amount"
       }else{
         insertflag=1;
         this.Regionshow = false
         statusAmount = "Equal Amount"
       }
       if(insertflag){
         this.disableButton = true;
         this.SRLedgerDetails = true;
         this.input = ({
           srid: this.SR_Name,
           hubid: this.localhubid,
           status: statusAmount,
           creditamount: this.Deposit_Amount,
           debitamount: Balanc,
           todayscod: this.TodaysCOD,
           reasonid: this.Reason,
           islessamountaccept: false,
           username: this.localusername
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
                this.disableButton = false;
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
                    this.Regionshow = false,
                    this.Deposit_Amount = "",
                    this.Reason = "",
                    this.tot_amt = ""
                    this.$validator.reset();
                    this.errors.clear();
                    event.target.reset();
                  }
              })
              .catch((httpException) => {
                this.disableButton = false;
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
      this.srStatus();
      this.Regionshow = this.RightSRLedger = this.SRLedgerDetails = false;
      this.assign = this.card = this.cash = this.cod = this.ndr = this.prepaid = this.wallet = this.payphi = 0;
      this.assignArr = this.cardArr = this.cashArr = this.ndrArr = this.prepaidArr = this.walletArr = this.payphiArr = this.awbArr = [];
      this.SR_Name = this.Deposit_Amount = this.Reason = this.tot_amt = this.awbnotype = '';
      this.PendingCOD = this.TodaysCOD = this.TotalAmount = this.TodaysShipmentCount = 0;
      this.deliveredCODArr = [];
      this.$validator.reset();
      this.errors.clear();
      event.target.reset();
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
           }else{
              this.isLoading = false;
              this.PendingCOD = this.TodaysCOD = this.TotalAmount = this.TodaysShipmentCount = 0;
              this.deliveredCODArr = [];
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

              this.ndr          = result.data.data.ndr
              this.ndrArr       = result.data.data.ndrArr

              this.prepaid      = result.data.data.prepaid
              this.prepaidArr   = result.data.data.prepaidArr

              this.wallet       = result.data.data.wallet
              this.walletArr    = result.data.data.walletArr
            }
            if(result.data.code == 204){
              this.assign = this.card = this.cash = this.cod = this.ndr = this.prepaid = this.wallet = this.payphi = 0;
              this.assignArr = this.cardArr = this.cashArr = this.ndrArr = this.prepaidArr = this.walletArr = this.payphiArr = this.awbArr = [];
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
          this.ReasonList = result.data.Reasons.data;
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
          if((this.tot_amt != '0' && this.tot_amt != parseInt(this.Deposit_Amount))||!this.tot_amt){
            let error = document.getElementById("d_a");
             error.innerHTML = "Total denomination & deposit amount should be same, please check.";
             error.style.display = "block";
          }else{
            let error = document.getElementById("d_a");
             error.innerHTML = "Deposit amount is required";
             error.style.display = "None";
             this.saveSRClosure(event)
          }
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    //function is used for calculate notes amount
    notesCount(event){
      if(event.target.id){
        document.getElementById("mo"+event.target.id).value = event.target.id * event.target.value;
        var arr = document.getElementsByName('note_amt');
        this.tot_amt = 0;
        for(var i=0;i<arr.length;i++){
            if(parseInt(arr[i].value))
                this.tot_amt += parseInt(arr[i].value);
        }
        document.getElementById('tot_amt').value = this.tot_amt;
      }
    },

    srStatus() {
      this.srLoading = true;
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
  }
}
