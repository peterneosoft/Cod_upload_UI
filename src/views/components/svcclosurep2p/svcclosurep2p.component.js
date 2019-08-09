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
      BatchID : Math.floor(Math.random() * (Math.pow(10,5))),
      DenominationArr: [],
      listSVCledgerData: [],
      ShipmentUpdateList: [],
      ReasonList: [],
      uploadFileList: [],
      reasonFileList: [],
      ReasonAmount: '',
      AWBNo: null,
      CardAmount: '',
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
      penAmtLoading: false,
      denomLoading: false,
      exceptionLoading: false,
      exception:[],
      exceptionList:[],
      exceptionArr:[],
      exceptionAmount:0
    }
  },

  computed: {

  },
  created() {

  },
  async mounted() {
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
    this.localhubname       = hubdetail[0].HubName;
    this.localhubzoneid   = hubdetail[0].HubZoneId;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var date = new Date();
    DepositDate.max = DeliveryDate.max = date.toISOString().split("T")[0];

    date.setDate(date.getDate() - 1);
    this.DeliveryDate = date.toISOString().split("T")[0];

    await this.GetDenominationData();
    await this.GetShipmentUpdate();
    //await this.GetBankData();
    await this.GetReasonList();
    await this.GetSVCledgerData();
    await this.GetSVCExceptionData();
  },

  methods: {
    multiple(){
      return true;
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
            console.error(error)
          })
        }
      }, error => {
          this.penAmtLoading = false;
          console.error(error);
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
        if(result.data.rows.length > 0){
          this.pendingCODAmt = parseFloat(Math.round(result.data.rows[0].closingbalance));
          this.closingBalance = result.data.rows[0].closingbalance;

          if(result.data.rows[0].totalamtdeposit > result.data.rows[0].p2pamt){
            this.p2pAmount = 0;
          }
          this.penAmtLoading = false;
        }else{
          this.pendingCODAmt = 0;
          this.penAmtLoading = false;
        }
        this.TolatCollection = parseFloat(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))));
      }, error => {
        this.penAmtLoading = false;
        console.error(error);
      })
    },

    GetBankData() {
      this.bankLoading = true;
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
        DepositType = 'NEFT';
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
      }).then(result => {
        if(result.data.result.code==200){
          this.bankLoading = false;
          this.BankList = result.data.result.data;
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

        this.input = ({
            offset: this.pageno,
            limit: 10,
            hubid: this.localhubid
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
          if(result.data.code == 200){
            this.listSVCledgerData = result.data.data;
            this.isLoading = false;
            let totalRows     = result.data.count;
            this.resultCount  = result.data.count;
            this.resultdate  = result.data.date;
            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }else{
            this.resultCount  = 0;
            this.isLoading = false;
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
      let DepositAmount = parseInt(this.Deposit_Amount);
      let DepositReasonExcepAmount = parseFloat(Math.round(DepositAmount+parseFloat((this.ReasonAmount)?this.ReasonAmount:0)+parseFloat((this.CardAmount)?this.CardAmount:0)+parseFloat(this.exceptionAmount)));

      let TolatCollection = parseFloat(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)-parseFloat(this.exceptionAmount))));

      let p2pamt = parseInt(this.p2pAmount);
      if(DepositAmount !== parseInt(this.tot_amt)){
        this.$alertify.error("Denomination details & Deposit amount is should be same, please check.");

        let error = document.getElementById("d_a");
         error.innerHTML      = "Denomination details & Deposit amount is should be same, please check.";
         error.style.display  = "block";
         return false;
      }else{
        if(p2pamt > 0){
          DepositAmount = DepositAmount - p2pamt;
        }

        let error = document.getElementById("d_a");
        error.style.display  = "none";

        this.unmatchedAmt = parseFloat(Math.round(parseFloat(TolatCollection)-parseFloat(DepositReasonExcepAmount)));

        if((DepositReasonExcepAmount < TolatCollection) && (this.unmatchedAmt!='0.00') && (this.unmatchedAmt!=0)){
          if(this.Reason==''){
            this.showModal(this.unmatchedAmt);
            return false;
          }else{
            if((this.Reason==65) && (this.ReasonAmount) && (this.ReasonAmount>0)){
              this.$alertify.error("Total pending amount and deposit amount including other charges is should be same, please check.");
              return false;
            }else{
              this.ReasonAmount=0;
            }
            this.hideModal();
          }
        }
      }

      let NoteCountArr = []; let DenominationIDArr = [];
      if(this.DenominationArr.length > 0){
        this.DenominationArr.forEach(function (denomi) {
          NoteCountArr.push(parseInt(document.getElementById("mo"+denomi).value) / parseInt(denomi));
          DenominationIDArr.push(parseInt(document.getElementById("moi"+denomi).value));
        });
      }

      if(DepositReasonExcepAmount > TolatCollection){
        this.$alertify.error("Deposit amount including other charges should not be greater than total pending amount, please check.");

        let error            = document.getElementById("d_a");
        error.innerHTML      = "Deposit amount including other charges should not be greater than total pending amount, please check.";
        error.style.display  = "block"; return false;
      }

      let OpeningBalance = parseFloat(this.closingBalance);
      let ClosingBalance = parseFloat(Math.round(parseFloat(TolatCollection)-parseFloat(DepositReasonExcepAmount)));
      let CODAmount = parseFloat(Math.round(parseFloat(this.yesterdayCODAmt)+parseFloat(p2pamt)));

      if(this.AWBNo){
        this.AWBNo = this.AWBNo.split(',');
      }

      this.disableButton = true;
      this.input = ({
          DepositDate: this.DepositDate,
          DeliveryDate: this.DeliveryDate,
          Deposit_Amount: DepositAmount,
          DepositType: this.DepositType,
          BankID: this.BankMasterId,
          BankDeposit: DepositAmount,
          TransactionID: this.TransactionID,
          ReasonID: (this.Reason)?this.Reason:null,
          ReasonAmount: (this.ReasonAmount)?this.ReasonAmount:null,
          AWBNo: this.AWBNo,
          CardAmount: (this.CardAmount)?this.CardAmount:null,
          CreatedBy: this.localuserid,
          HubId: this.localhubid,
          HubZoneId: this.localhubzoneid,
          DifferenceAmount: 0,
          TolatCollection: TolatCollection,
          StatusID: 1,
          OpeningBalance: OpeningBalance,
          ClosingBalance: ClosingBalance,
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
          exceptionAmount: this.exceptionAmount
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
          this.disableButton = false;
          window.scrollBy(0, 1000);
          this.resetForm(event);
        } else if (response.data.errorCode == -1) {
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException)
      });
    },

    //function is used for upload files on AWS s3bucket
    onUpload(event){
      this.disableButton = true;
      this.selectedFile = event.target.files[0];

      var name = '';
      if ( /\.(jpe?g|png|gif|bmp|xls|xlsx|pdf|ods)$/i.test(this.selectedFile.name) ){
        name = this.selectedFile.name;
      }else{
        this.$alertify.error(event.srcElement.placeholder + " Failed! Please Upload Only Valid Format: .png, .jpg, .jpeg, .gif, .bmp, .xls, .xlsx, .pdf, .ods");
        this.disableButton = false;
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

        if(Reason){
          this.ReasonLoading = false;
          this.reasonFileList = result.data.data;
        }else{
          this.DepositLoading = false;
          this.uploadFileList = result.data.data;
        }
        this.disableButton = false;
      }, error => {
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
         document.getElementById("d_a").style.display = "none";
         if(result){
           if((this.tot_amt != 0 && this.tot_amt != parseInt(this.Deposit_Amount))||!this.tot_amt){
              let error = document.getElementById("d_a");
              error.innerHTML = "Total denomination & deposit amount is should be same, please check.";
              error.style.display = "block";
          }else{
            this.saveSvcClosure(event);
          }
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm(event) {
      this.DepositLoading = false; this.ReasonLoading = false;
      this.BatchID = Math.floor(Math.random() * (Math.pow(10,5)));
      this.pageno = this.tot_amt = this.unmatchedAmt = 0;
      this.uploadFileList=[]; this.reasonFileList=[]; this.BankList = [];
      this.DepositDate = this.Deposit_Amount = this.DepositType = this.BankMasterId = this.TransactionID = '';
      this.DepositSlip = this.ReasonSlip = this.Reason = this.ReasonAmount = this.CardAmount = ''; this.AWBNo = null; this.exception = []; this.exceptionList=[];
      $('#denomlist input[type="text"]').val(0); $('#denomlist input[type="number"]').val('');
      document.getElementById("d_a").style.display = "none";
      this.GetShipmentUpdate();
      this.GetSVCledgerData();
      this.GetSVCExceptionData();
      this.$validator.reset(); this.errors.clear(); event.target.reset();
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

    showAWBNo(index){
      var popup = document.getElementById("awb"+index);
      popup.classList.toggle("show");
    }
  }
}
