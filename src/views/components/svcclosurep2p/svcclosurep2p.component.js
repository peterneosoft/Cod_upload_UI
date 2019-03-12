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
      DepositDate: '',
      DeliveryDate: '',
      Deposit_Amount: '',
      DepositType: '',
      BankMasterId: '',
      TransactionID: '',
      DepositSlip: '',
      Reason: '',
      unmatchedAmt: 0,
      CODAmount: 0,
      tot_amt: 0,
      BankList: [],
      pageno: 0,
      pagecount: 0,
      localuserid: 0,
      localhubid: 0,
      DenominationList: [],
      StatusID: 0,
      FinanceConfirmAmount: 0,
      BatchID: 0,
      DenominationArr: [],
      listSVCledgerData: [],
      ShipmentUpdateList: [],
      ReasonList: [],
      isLoading: false,
      resultCount: '',
      pendingCODAmt: '0.00',
      yesterdayCODAmt: '0.00',
      TolatCollection:'0.00',
      myStr: ''
    }
  },

  computed: {

  },
  created() {
    this.GetDenominationData();
  },
  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.userid;

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;

    var userToken = window.localStorage.getItem('userToken')
    this.myStr = userToken.replace(/"/g, '');

    var date = new Date();
    DepositDate.max = DeliveryDate.max = date.toISOString().split("T")[0];

    date.setDate(date.getDate() - 1);
    this.DeliveryDate = date.toISOString().split("T")[0];

    this.GetShipmentUpdate();
    this.GetBankData();
    this.GetReasonList();
    this.GetSVCledgerData();
  },

  methods: {
    GetShipmentUpdate() {

      this.input = ({
          hubid: this.localhubid,
          status: 'Delivered'
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'external/getShipmentUpdate',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {

          var data = []; let yDayCODAmt = 0;
          result.data.shipmentupdate.Result.forEach(function (ShipmentUpdateData) {
            if((ShipmentUpdateData.PaymentMode.PaymentType==='cash' || ShipmentUpdateData.PaymentMode.PaymentType==='CASH' || ShipmentUpdateData.PaymentMode.PaymentType==='Cash')
             || (ShipmentUpdateData.OrderType==='COD' || ShipmentUpdateData.OrderType==='Cod' || ShipmentUpdateData.OrderType==='cod')){ //&&
              yDayCODAmt += parseInt(ShipmentUpdateData.CollectibleAmount);
            }
          });
          this.yesterdayCODAmt = parseFloat(Math.round(yDayCODAmt)).toFixed(2);
          if(this.yesterdayCODAmt > 0){
            this.GetPendingCODAmt();
          }
        }, error => {
          console.error(error)
      })
    },

    GetPendingCODAmt() {

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
        this.pendingCODAmt = result.data.rows[0].closingbalance;
        this.TolatCollection = parseFloat(Math.round((parseInt(this.pendingCODAmt)+parseInt(this.yesterdayCODAmt)) * 100) / 100).toFixed(2);
      }, error => {
          console.error(error)
      })
    },

    GetBankData() {
      this.input = {}

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'external/getBankList',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        this.BankList = result.data.result.data;
      }, error => {
        console.error(error)
      })
    },

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

    GetSVCledgerData() {

        this.input = ({
            offset: this.pageno,
            limit: 10
        })
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
            this.listSVCledgerData = result.data.rows;
            this.isLoading = false;
            let totalRows     = result.data.count
            this.resultCount  = result.data.count
            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
        }, error => {
            console.error(error)
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
          this.ReasonList = result.data.Reasons.data;
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
      }
    },

    saveSvcClosure(event) {

      let d_amt = this.Deposit_Amount.split(".");
      let DepositAmount = parseInt(d_amt[0]);

      let TolatCollection = parseInt(document.getElementById("TolatCollection").innerHTML);

      if(DepositAmount !== parseInt(this.tot_amt)){
        this.$alertify.error("Denomination details & Deposit Amount is mismatch, Please Check.");

        let error = document.getElementById("d_a");
         error.innerHTML      = "Denomination details & Deposit Amount is mismatch";
         error.style.display  = "block";
         return false;
      }else{
        let error = document.getElementById("d_a");
        error.style.display  = "none";

        this.unmatchedAmt = TolatCollection-DepositAmount;

        if(DepositAmount < TolatCollection){
          if(this.Reason==''){
            this.$alertify.error("Remaining Amount is Rs."+this.unmatchedAmt);
            return false;
          }
        }
      }

      let NoteCountArr = []; let DenominationIDArr = [];
      this.DenominationArr.forEach(function (denomi) {
        NoteCountArr.push(parseInt(document.getElementById("mo"+denomi).value) / parseInt(denomi));
        DenominationIDArr.push(parseInt(document.getElementById("moi"+denomi).value));
      });

      let ClosingBalance = parseInt(document.getElementById("ClosingBalance").innerHTML);
      let CODAmount = parseInt(document.getElementById("CODAmount").innerHTML);
      let p2pamt = parseInt(document.getElementById("p2pamt").innerHTML);
      let OpeningBalance = ClosingBalance;

      this.input = ({
          DepositDate: this.DepositDate,
          DeliveryDate: this.DeliveryDate,
          Deposit_Amount: DepositAmount,
          DepositType: this.DepositType,
          BankID: this.BankMasterId,
          BankDeposit: DepositAmount,
          TransactionID: this.TransactionID,
          ReasonID: (this.Reason)?this.Reason:null,
          CreatedBy: this.localuserid,
          HubId: this.localhubid,
          DifferenceAmount: this.unmatchedAmt,
          TolatCollection: TolatCollection,
          StatusID: (this.StatusID != '') ? this.StatusID : 1,
          OpeningBalance: OpeningBalance,
          ClosingBalance: ClosingBalance + CODAmount,
          FinanceConfirmAmount: (this.FinanceConfirmAmount != '') ? this.FinanceConfirmAmount : 0,
          CODAmount: CODAmount,
          IsActive: true,
          BatchID: (this.BatchID != '') ? this.BatchID : Math.floor(Math.random() * (Math.pow(10,5))),
          p2pamt: p2pamt,
          totalAmtdeposit: DepositAmount + p2pamt,
          Denomination: this.DenominationArr,
          NoteCount: NoteCountArr,
          DenominationID: DenominationIDArr
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
        if (response.data.errorCode == 0) {
          this.$alertify.success(response.data.msg);
          this.resetForm(event);
        } else if (response.data.errorCode == -1) {
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException)
      });
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
           document.getElementById("d_a").style.display = "none";
           if((this.tot_amt != '0' && this.tot_amt != this.Deposit_Amount)||!this.tot_amt){
              let error = document.getElementById("d_a");
              error.innerHTML = "Deposit Amount & Denomination details mismatches";
              error.style.display = "block";
          }else{
            document.getElementById("d_a").style.display = "none";
            this.saveSvcClosure(event);
          }
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm(event) {
      this.pageno = this.tot_amt = 0;
      this.DepositDate = this.Deposit_Amount = this.DepositType = this.BankMasterId = this.TransactionID = this.DepositSlip = this.Reason = '';
      $('#denomlist input[type="text"]').val(0);
      $('#denomlist input[type="number"]').val('');
      this.$validator.reset();
      this.errors.clear();
      event.target.reset();
      this.GetShipmentUpdate();
      this.GetSVCledgerData();
    },
  }
}
