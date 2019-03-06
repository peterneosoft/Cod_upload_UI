import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'

export default {
  name: 'svcclosurep2p',
  components: {},
  data() {
    return {
      DepositDate: '',
      DeliveryDate: '',
      Deposit_Amount: '',
      DepositType: '',
      BankName: '',
      TransactionID: '',
      DepositSlip: '',
      Reason: '',
      unmatchedAmt: 0,
      tot_amt: 0,
      BankList: [],
      pageno: 0,
      localuserid: 0,
      DenominationList:[]
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
    this.localhubid       = hubdetail.HubId;

    DeliveryDate.max      = new Date().toISOString().split("T")[0];
    DepositDate.max       = new Date().toISOString().split("T")[0];

    this.pageno           = 0;

    this.GetBankData();
  },

  methods: {

    GetBankData() {
      this.input = {}

      axios({
      method: 'POST',
      url: apiUrl.api_url + 'external/getBankList',
      data: this.input,
      headers: {
        'Authorization': 'Bearer '  }
        }).then(result => {
          this.DenominationList = result.data.data;
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
    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
          if((this.tot_amt != '0' && this.tot_amt != this.Deposit_Amount)||!this.tot_amt){
            let error = document.getElementById("d_a");
             error.innerHTML = " 	Enter Denomination details. Amount mismatches";
             error.style.display = "block";
          }else{
            let error = document.getElementById("d_a");
             error.innerHTML = "The Deposit_Amount Field is Required";
             error.style.display = "None";
          }
        }
        })

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

    saveSvcClosure(event) {

      let d_amt = this.Deposit_Amount.split(".");
      if(parseInt(d_amt[0]) !== parseInt(this.tot_amt)){

        let error = document.getElementById("d_a");
         error.innerHTML      = "Denomination details & Deposit Amount is mismatch";
         error.style.display  = "block";
         return false;
      }else{
        let pend_tot_amt = parseInt(document.getElementById("pend_tot_amt").innerHTML);

        if(parseInt(d_amt[0]) < pend_tot_amt){
          this.unmatchedAmt = pend_tot_amt-parseInt(d_amt[0]);
          return false;
        }
      }

      this.input = ({
          DepositDate: this.DepositDate,
          DeliveryDate: this.DeliveryDate,
          Deposit_Amount: this.Deposit_Amount,
          DepositType: this.DepositType,
          BankName: this.BankName,
          TransactionID: this.TransactionID,
          ReasonID: this.ReasonID,
          CreatedBy: this.localuserid,
          HubId: this.localhubid
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
              this.adddesignationmodal = false;
              event.target.reset();
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
          if((this.tot_amt != '0' && this.tot_amt != this.Deposit_Amount)||!this.tot_amt){
            let error = document.getElementById("d_a");
             error.innerHTML = "Enter Denomination details OR Amount mismatches";
             error.style.display = "block";
          }else{
            this.saveSvcClosure();
          }
        }
          // event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
