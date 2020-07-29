import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';

export default {
  name: 'svcreset',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  props: [],

  data() {
    return {
      zoneList:[],
      hubList:[],
      CODLedgerReports:[],
      zone:[],
      HubId:[],
      resultCount:'',
      hubname:"",
      pageno:0,
      pagecount:0,
      isLoading:false,
      zoneLoading:false,
      hubLoading:false,
      ResetmodalShow:false,
      upLoading:false,
      resetdata:[],
      resetDD:[],
      resetType:'',
      role:'',
      localuserid:'',
      myStr:'',
      form: {
        depamount:[],
        depslip:[],
        finamount: [],
        codamount: [],
        financeclosingamt: []
      }
    }
  },

  computed: {

  },

  mounted() {
    var userToken         = window.localStorage.getItem('accessuserToken')
    this.myStr            = userToken.replace(/"/g, '');

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var userdetail        = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    this.localuserid      = userdetail.username;

    this.role             = window.localStorage.getItem('accessrole').toLowerCase();

    this.getZoneData();
  },

  methods: {

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetSVCledgerData()
    },

    GetSVCledgerData() {
      $('span[id^="cau"]').hide(); $('span[id^="bdu"]').hide(); $('span[id^="fcu"]').hide(); $('span[id^="dps"]').hide(); $('span[id^="up"]').hide();  $('span[id^="FCup"]').hide();
      $('span[id^="cax"]').show(); $('span[id^="bdx"]').show(); $('span[id^="fcx"]').show(); $('span[id^="ed"]').show(); $('span[id^="FCed"]').show(); $('span[id^="vri"]').hide(); $('span[id^="vrl"]').show();
      this.input = ({
          offset: this.pageno,
          limit: 10,
          hubid: this.HubId.HubID
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
          this.isLoading = false;

          this.CODLedgerReports = result.data.data;
          this.resultCount  = result.data.count;
          this.resultdate  = result.data.date;

          let totalRows     = result.data.count;
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }

          let ledger = result.data.data;
          ledger.forEach((svc,key)=>{
            this.form.depamount[svc.svcledgerid]         = svc.bankdeposit;
            this.form.codamount[svc.svcledgerid]         = svc.codamount;
            this.form.finamount[svc.svcledgerid]         = svc.actualrecamt ? svc.actualrecamt : 0;
            this.form.depslip[svc.svcledgerid]           = svc.batchid;
            this.form.financeclosingamt[svc.svcledgerid] = svc.financeclosingamt;
          });
        }else{
          this.resultCount  = 0;
          this.isLoading = false;
        }
      }, error => {
          console.error(error)
      })
    },

    //to get All Zone List
    getZoneData() {
      this.input = {}; this.zoneLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.zoneLoading = false;
          this.zoneList = result.data.zone.data;
        }, error => {
          this.zoneLoading = false; console.error(error)
        })
    },

    //to get All Zone Wise Hub List
    getHubData() {
      if(this.zone.hubzoneid==""){
        return false;
      }
      this.input = ({
          zoneid: this.zone.hubzoneid
      })
      this.hubLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubLoading = false; this.HubId = []; this.hubList = [];
          if(result.data.hub.code == 200){
            this.hubList = result.data.hub.data;
          }
        }, error => {
          this.hubLoading = false; console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0;
          this.GetSVCledgerData()
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.zone=""; this.hubList=[]; this.HubId=[]; this.pageno = 0; this.CODLedgerReports = []; this.resultCount = 0;
      this.$validator.reset(); this.errors.clear();
    },

    showResetModal(data){
      this.resetdata = []; this.resetdata = data; this.resetDD = ''; this.resetDD = data.deliverydate; this.resetType = 'reset SVC closure';
      this.$refs.myResetModalRef.show();
    },

    hideResetModal(ele, typ) {
      this.$refs.myResetModalRef.hide();
      if(ele == 0 && typ == 'reset SVC closure'){
        this.resetSVCledger(this.resetdata);
      }else if(ele == 0 && typ == 'update SVC closure'){
        this.updateLedger(this.resetdata);
      }else if(ele == 0 && typ == 'update SVC closure finance closing amount'){
        this.updateFCLedger(this.resetdata);
      }
    },

    showUpdateModal(data){
      this.resetdata = []; this.resetdata = data; this.resetDD = ''; this.resetDD = data.deliverydate; this.resetType = 'update SVC closure';
      this.$refs.myResetModalRef.show();
    },

    closeStatusRoleModal() {
      this.ResetmodalShow = false
    },

    resetSVCledger(data){
      this.upLoading = true;
      this.input = ({
        svcledgerid:      data.svcledgerid,
        hubid:            this.HubId.HubID,
        openingbalance:   data.openingbalance,
        codamount:        data.codamount,
        bankdeposit:      data.bankdeposit,
        statusid:         data.statusid,
        financereasonid:  data.financereasonid,
        createdby:        data.createdby,
        username:         this.localuserid
      });

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'deleteSVCLedgerEntry',
        'data': this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      })
      .then(response => {
        this.upLoading = false;
        if (response.data.code == 200) {
          this.$alertify.success(response.data.msg);
          this.GetSVCledgerData()
        } else {
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException); this.upLoading = false; this.$alertify.error('Error Occured');
      });
    },

    updateLedger(data){

      this.upLoading = true;

      if(this.form.depamount[data.svcledgerid]<=0){
        document.getElementById("depamt"+data.svcledgerid).innerHTML="Bank deposited amount is required."; this.upLoading = false; return false;
      }else{
        document.getElementById("depamt"+data.svcledgerid).innerHTML="";
      }

      this.input = ({
        svcledgerid:      data.svcledgerid,
        hubid:            this.HubId.HubID,
        openingbalance:   data.openingbalance,
        codamount:        this.form.codamount[data.svcledgerid],
        bankdeposit:      this.form.depamount[data.svcledgerid],
        statusid:         data.statusid,
        financereasonid:  data.financereasonid,
        createdby:        data.createdby,
        username:         this.localuserid
      })
      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'updateSVCLedger',
        'data': this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      })
      .then(response => {
        this.upLoading = false;
        if (response.data.code == 200) {
          this.$alertify.success(response.data.msg);
          this.GetSVCledgerData()
        } else {
          this.$alertify.error(response.data.msg);
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException); this.upLoading = false; this.$alertify.error('Error Occured');
      });
    },

    setLedgid(name, key){
      return name+key;
    },

    //function is used for upload files on AWS s3bucket
    onUpload(data){
      this.upLoading = true;

      if(event.target.files.length<=0){
        this.upLoading = false; return false;
      }

      let selectedFile = event.target.files[0];

      var name = selectedFile.name;
      if(selectedFile.size>5242880){
        this.$alertify.error(event.srcElement.placeholder + " Failed! Upload Max File Size Should Not Be Greater Than 5 MB");
        this.upLoading = false; return false;
      }

      if ( /\.(jpe?g|png|gif|bmp|xls|xlsx|csv|doc|docx|rtf|wks|wps|wpd|excel|xlr|pps|pdf|ods|odt)$/i.test(selectedFile.name) ){
        name = selectedFile.name;
      }else{
        this.$alertify.error(event.srcElement.placeholder + " Failed! Please Upload Only Valid Format: .png, .jpg, .jpeg, .gif, .bmp, .xls, .xlsx, .pdf, .ods, .csv, .doc, .odt, .docx, .rtf, .wks, .wps, .wpd, .excel, .xlr, .pps");
        this.upLoading = false; return false;
      }

      const fd = new FormData();
      fd.append('file', selectedFile, name);
      fd.append('s3bucketKey', 'SVC-'+data.batchid);

      axios.post(apiUrl.api_url + 'uploadsvcfile', fd,
      {
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      })
      .then(res => {
        if(res.data.errorCode==0){
          this.$alertify.success('Upload successful.');
          this.getS3bucketFiles(data);
        }else{
          this.$alertify.error('Upload failed, try again.');
        }
      }, error => {
        console.error(error)
      });
    },

    getS3bucketFiles(data){

      this.input = ({
        BatchID : data.batchid,
        Reason : '',
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
        this.upLoading = false;
        if(Reason){
          this.reasonFileList = result.data.data;
        }else{
          this.uploadFileList = result.data.data;
        }
      }, error => {
        this.upLoading = false; console.error(error)
      })
    },

    editLedger(index){
      $('#cax'+index).hide(); $('#bdx'+index).hide(); $('#ed'+index).hide(); $('#vrl'+index).hide(); $('#vri'+index).hide(); $('#vrrl'+index).hide(); $('#vrri'+index).hide();
      $('#cau'+index).show(); $('#bdu'+index).show(); $('#dps'+index).show(); $('#up'+index).show();
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

    editFC(index){
      $('#fcx'+index).hide(); $('#FCed'+index).hide(); $('#fcu'+index).show(); $('#FCup'+index).show();
    },

    showFCUpdateModal(data){
      this.resetdata = []; this.resetdata = data; this.resetDD = ''; this.resetDD = data.deliverydate; this.resetType = 'update SVC closure finance closing amount';
      this.$refs.myResetModalRef.show();
    },

    updateFCLedger(data){

      this.upLoading = true;

      if(this.form.financeclosingamt[data.svcledgerid]<=0){
        document.getElementById("fcamt"+data.svcledgerid).innerHTML="Finance closing amount is required."; this.upLoading = false; return false;
      }else{
        document.getElementById("fcamt"+data.svcledgerid).innerHTML="";
      }

      this.input = ({
        svcledgerid:data.svcledgerid,
        hubid:      this.HubId.HubID,
        amount:     this.form.financeclosingamt[data.svcledgerid]
      })
      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'updateFinanceClosing',
        'data': this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      })
      .then(response => {
        this.upLoading = false;
        if (response.data.code == 200) {
          this.$alertify.success(response.data.msg);
          this.GetSVCledgerData()
        } else {
          this.$alertify.error(response.data.msg);
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException); this.upLoading = false; this.$alertify.error('Error Occured');
      });
    },
  }
}
