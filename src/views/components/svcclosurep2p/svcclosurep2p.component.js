import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import {Validator} from 'vee-validate'
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
      isLoading: false,
      Loading: false,
      resultCount: 0,
      pendingCODAmt: '0.00',
      closingBalance: '0.00',
      yestClosingbalance: '0.00',
      yesterdayCODAmt: '0.00',
      TolatCollection: '0.00',
      p2pAmount: '0.00',
      myStr: '',
      resultdate: '',
      disableButton: false,
      modalShow:false,
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
    this.localhubzoneid   = hubdetail[0].HubZoneId;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var date = new Date();
    DepositDate.max = DeliveryDate.max = date.toISOString().split("T")[0];

    date.setDate(date.getDate() - 1);
    this.DeliveryDate = date.toISOString().split("T")[0];

    await this.GetDenominationData();
    await this.GetShipmentUpdate();
    await this.GetBankData();
    await this.GetReasonList();
    await this.GetSVCledgerData();
  },

  methods: {
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
        if(result.data.rows.length > 0){
          this.yesterdayCODAmt = parseFloat(Math.round(0)).toFixed(2);
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
              this.yesterdayCODAmt = (result.data.shipmentupdate) ? parseFloat(result.data.shipmentupdate).toFixed(2) : '0.00';
            }

            //if(this.yesterdayCODAmt > 0){
              this.GetPendingCODAmt();
            //}
          }, error => {
            console.error(error)
          })
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
        if(result.data.rows.length > 0){
          this.pendingCODAmt = result.data.rows[0].closingbalance;
          this.closingBalance = result.data.rows[0].closingbalance;

          if(result.data.rows[0].totalamtdeposit > result.data.rows[0].p2pamt){
            this.p2pAmount = '0.00';
          }
        }else{
          this.pendingCODAmt = '0.00';
        }
        this.TolatCollection = parseFloat(Math.round((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt)))).toFixed(2);
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

      let d_amt = this.Deposit_Amount.split(".");
      let DepositAmount = parseInt(d_amt[0]);

      let TolatCollection = parseFloat((parseFloat(this.pendingCODAmt)+parseFloat(this.yesterdayCODAmt))).toFixed(2);
      let p2pamt = parseInt(this.p2pAmount);

      if(DepositAmount !== parseInt(this.tot_amt)){
        this.$alertify.error("Denomination details & Deposit Amount is mismatch, Please Check.");

        let error = document.getElementById("d_a");
         error.innerHTML      = "Denomination details & Deposit Amount is mismatch";
         error.style.display  = "block";
         return false;
      }else{
        if(p2pamt > 0){
          DepositAmount = DepositAmount - p2pamt;
        }

        let error = document.getElementById("d_a");
        error.style.display  = "none";

        this.unmatchedAmt = parseFloat(Math.round(parseFloat(TolatCollection)-parseFloat(DepositAmount))).toFixed(2);

        if(DepositAmount < TolatCollection){

          if(this.Reason==''){
            this.showModal(this.unmatchedAmt);
            return false;
          }else{
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

      let OpeningBalance = parseFloat(this.closingBalance);
      let ClosingBalance = parseFloat(parseFloat(OpeningBalance)+parseFloat(this.yesterdayCODAmt)-parseFloat(DepositAmount)).toFixed(2);
      let CODAmount = parseFloat(parseFloat(this.yesterdayCODAmt)+parseFloat(p2pamt)).toFixed(2);

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
          this.uploadFileList=[];
          this.$alertify.success(response.data.msg);
          this.disableButton = false;
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

      if ( /\.(jpe?g|png|gif|bmp|xls|xlsx|pdf|ods)$/i.test(this.selectedFile.name) ){
        var name = this.selectedFile.name;
      }else{
        this.$alertify.error(event.srcElement.placeholder + " Failed! Please Upload Only Valid Format: .png, .jpg, .jpeg, .gif, .bmp, .xls, .xlsx, .pdf, .ods");
        this.disableButton = false;
        return false;
      }

      const fd = new FormData();
      fd.append('file', this.selectedFile, name);
      fd.append('s3bucketKey', 'SVC-'+this.BatchID);

      this.Loading = true;

      axios.post(apiUrl.api_url + 'uploadsvcfile', fd,
      {
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      })
      .then(res => {
        this.getS3bucketFiles();
      }, error => {
        console.error(error)
      });
    },

    getS3bucketFiles(){

      this.input = ({
        BatchID : this.BatchID
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
        this.Loading = false;
        this.uploadFileList = result.data.data;
        this.disableButton = false;
      }, error => {
        console.error(error)
      })
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
      this.Loading = false;
      this.BatchID = Math.floor(Math.random() * (Math.pow(10,5)));
      this.pageno = this.tot_amt = this.unmatchedAmt = 0;
      this.uploadFileList=[];
      this.DepositDate = this.Deposit_Amount = this.DepositType = this.BankMasterId = this.TransactionID = this.DepositSlip = this.Reason = '';
      $('#denomlist input[type="text"]').val(0);
      $('#denomlist input[type="number"]').val('');
      this.$validator.reset();
      this.errors.clear();
      event.target.reset();
      this.GetShipmentUpdate();
      this.GetSVCledgerData();
    },

    showHideImages(index){
      $('#vri'+index).show();
      $('#vrl'+index).hide();
    }
  }
}
