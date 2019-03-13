import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate'

export default {
  name: 'srclosure',
  components: {},
  props: [],

  data() {
    return {
      Deposit_Amount:"",
      SR_Name:"",
      tot_amt:"",
      PendingCOD:"",
      TotalAmount:"",
      TodaysCOD:"",
      DeliveryDate: '',
      assign: '',
      card: '',
      cash: '',
      cod: '',
      ndr: '',
      prepaid: '',
      wallet: '',
      Reason:null,
      RemainData:"",
      resultCount:"",
      pageno: 0,
      pagecount: 0,
      SRList:[],
      DenominationList:[],
      RightSRLedgerList:[],
      SRLedgerList:[],
      ReasonList:[],
      Regionshow:false,
      RightSRLedger:false,
      SRLedgerDetails:false,
      localhubid: 0,
      localusername: 0,
      StaticUserToken: "sKB3uGF0qvklWhTLOgsIXDRJc",
      myStr:""
    }
  },

  computed: {

  },
  created() {
  this.GetDeliveryAgentData();
  this.GetDenominationData();
  this.GetReasonList();
  },

  mounted() {
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
  },

  methods: {
    showModal(Balanc){
       this.$refs.myModalRef.show(Balanc)
      this.RemainData = Balanc;
    },
    hideModal() {
       this.$refs.myModalRef.hide()
     },
     P2PEntry(){
       window.open ("http://p2pstage.xbees.in/fastbees/#/codSRDayClosure?xbhubid="+this.localhubid+"&codclosedby="+this.localusername+"&token="+this.StaticUserToken,"myWindow","menubar=1,resizable=1,width=600,height=260,top=200,left=400,");

     },
     saveSRClosure(){
       let statusAmount
       let TotalAmt = (document.getElementById("Tot_Amt")).textContent;
       let IntTotalAmt = parseInt(TotalAmt)
       let IntDeposit_Amount = parseInt(this.Deposit_Amount)
       let Balanc = 0;
       let insertflag= 0;
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
         this.SRLedgerDetails = true;
         this.input = ({
           srid: this.SR_Name,
           hubid: this.localhubid,
           status: statusAmount,
           creditamount: this.Deposit_Amount,
           debitamount: Balanc,
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
                  if (response.data.code) {
                      this.$alertify.success(response.data.data);
                       this.GetSRLedgerDetails();

                    }
              })
              .catch((httpException) => {
                  console.error('exception is:::::::::', httpException)
              });
       }

     },

     resetData(){
      this.DenominationList.map(data=>{
        let countVal = document.getElementById(data.Denomination);
        let amountVal = document.getElementById("mo"+data.Denomination);
        countVal.value=""
        amountVal.value=""
      });
      this.Regionshow = false,
      this.RightSRLedger = false,
      this.SRLedgerDetails = false,
      this.SR_Name = "",
      this.Deposit_Amount = "",
      this.Reason = "",
      this.tot_amt = ""
     },
     //to get pagination
     // getPaginationData(pageNum) {
     //     this.pageno = (pageNum - 1) * 10

     // },

     getRightSRLedgerDetails(){
       this.input = ({
          srid: this.SR_Name
       })
       axios({
           method: 'POST',
           url: apiUrl.api_url + 'getRightSRLedgerDetails',
           data: this.input,
           headers: {
              'Authorization': 'Bearer '+this.myStr
           }
         })
         .then(result => {
           this.PendingCOD = result.data.PendingCOD
           this.TodaysCOD = result.data.TodaysCOD
           this.TotalAmount = result.data.TotalAmount
         }, error => {
           console.error(error)
         })
     },
     srChange(event){
       this.SR_Name = event.target.value
       this.RightSRLedger = true;
       this.SRLedgerDetails = true;
       this.input = ({
          srid: this.SR_Name,
          hubid: this.localhubid,
          username: this.localusername,
          status: ""
       })
       axios({
           method: 'POST',
           url: apiUrl.api_url + 'insertSRShipment',
           data: this.input,
           headers: {
              'Authorization': 'Bearer '+this.myStr
           }
         })
         .then(result => {
            this.assign = result.data.data.assign
            this.card = result.data.data.card
            this.cash = result.data.data.cash
            this.cod = result.data.data.cod
            this.ndr = result.data.data.ndr
            this.prepaid = result.data.data.prepaid
            this.wallet = result.data.data.wallet
            this.getRightSRLedgerDetails()
            this.GetSRLedgerDetails()
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
             'Authorization': 'Bearer '+this.myStr
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
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getSRLedgerDetails',
          data: this.input,
          headers: {
             'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
          this.SRLedgerList = result.data.data
          }
        }, error => {
          console.error(error)
        })
    },
      //to get Denomination List
    GetDenominationData(){
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'getAllDenomination',
          headers: {
             'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.DenominationList = result.data.data;
        }, error => {
          console.error(error)
        })

    },
    //to get SR List
    GetDeliveryAgentData() {

      var hubEncrypt = window.localStorage.getItem('accesshubdata')
      var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
      var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
      var hubArr=JSON.parse(hubtext);

      this.input = ({
          usertype: "3",
          hubid: [hubArr[0].HubID],
          hubname: hubArr[0].HubName,
          appkey: '$#@COD&&Mang&*^%$$'
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getdeliveryagents',
          data: this.input,
          headers: {
             'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.SRList = result.data.SR
        }, error => {
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
          if((this.tot_amt != '0' && this.tot_amt != this.Deposit_Amount)||!this.tot_amt){
            let error = document.getElementById("d_a");
             error.innerHTML = " 	Enter Denomination details. Amount mismatches";
             error.style.display = "block";
          }else{
            let error = document.getElementById("d_a");
             error.innerHTML = "The Deposit Amount Fields is Required";
             error.style.display = "None";

             this.saveSRClosure()

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
  }
}
