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
      isLoading: false,
      resultCount: '',
      pendingCODAmt: '0.00',
      yesterdayCODAmt: '0.00',
      TolatCollection:'0.00'
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

    var date = new Date();
    DeliveryDate.max      = date.toISOString().split("T")[0];
    DepositDate.max       = date.toISOString().split("T")[0];

    date.setDate(date.getDate() - 1);
    this.DeliveryDate = date.toISOString().split("T")[0];

    this.GetShipmentUpdate();
    this.GetBankData();
    this.GetSVCledgerData();
    this.GetPendingCODAmt();
  },

  methods: {
    GetShipmentUpdate() {

      this.input = ({
          hubid: this.localhubid,
          status: 'Shipped' //Delivered
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'external/getShipmentUpdate',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '
        }
      }).then(result => {
          //this.ShipmentUpdateList = result.data.shipmentupdate.Result;

          var data = []; let yDayCODAmt = 0;
          result.data.shipmentupdate.Result.forEach(function (ShipmentUpdateData) {
            if(ShipmentUpdateData.PaymentType==='cash' && ShipmentUpdateData.OrderType==='COD'){
              yDayCODAmt += parseInt(ShipmentUpdateData.CollectibleAmount);
            }
          });
          data.push({
            yesterdayCODAmt:yDayCODAmt
          });
          this.ShipmentUpdateList = data;
          //console.log('ShipmentUpdateList===', this.ShipmentUpdateList);
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
              'Authorization': 'Bearer '
          }
      })
      .then(result => {
          this.TolatCollection = parseFloat(Math.round((parseInt(result.data.rows[0].closingbalance)+parseInt(this.yesterdayCODAmt)) * 100) / 100).toFixed(2);
          this.pendingCODAmt = result.data.rows[0].closingbalance;
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
        'Authorization': 'Bearer '  }
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
            'Authorization': 'Bearer '
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
                'Authorization': 'Bearer '
            }
        })
        .then(result => {
            this.listSVCledgerData = result.data.rows;
            this.isLoading    = false;
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

        if((DepositAmount < TolatCollection) && this.Reason==''){
          this.$alertify.error("Remaining Amount is Rs."+this.unmatchedAmt);
          return false;
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
          BankDeposit: this.BankMasterId,
          TransactionID: this.TransactionID,
          ReasonID: this.Reason,
          CreatedBy: this.localuserid,
          HubId: this.localhubid,
          DifferenceAmount: this.unmatchedAmt,
          TolatCollection: TolatCollection,
          StatusID: (this.StatusID != '') ? this.StatusID : 0,
          OpeningBalance: OpeningBalance,
          ClosingBalance: ClosingBalance + CODAmount,
          FinanceConfirmAmount: (this.FinanceConfirmAmount != '') ? this.FinanceConfirmAmount : 0,
          CODAmount: CODAmount,
          IsActive: true,
          BatchID: (this.BatchID != '') ? this.BatchID : 0,
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
              'Authorization': 'Bearer '
          }
      })
      .then((response) => {
          if (response.data.errorCode == 0) {
              this.$alertify.success(response.data.msg);
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
            this.saveSvcClosure();

            event.target.reset();
          }
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
