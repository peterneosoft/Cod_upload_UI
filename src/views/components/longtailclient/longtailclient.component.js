import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'longtailclient',
  components: {
      Paginate,
      VueElementLoading,
      Multiselect
  },

  data() {
    return {
      resultCount:0,
      pagecount:0,
      pageno:0,
      Client:[],
      SearchClientIds:[],
      clientLoading:false,
      ClientList:[],
      isLoading:false,
      listPendingRemittanceData:[],
      //remDate:'',
      fromDate:'',
      toDate:'',
      selected:'Initiated',
      options:[
        { text: 'Remittance Cycle', value: 'Initiated' },
        { text: 'Payments On Hold', value: 'Hold' },
        { text: 'Payments Approved', value: 'Done' }
      ],
      checkAll:false,
      ClientArr:[],
      singleArr:[],
      ModalShow:false,
      excelLoading:false,
      reportlink:'',
      status:'',
      exceptionList:[],
      shipmentList:[],
      shipLoading:false,
      modalShipmentShow:false,
      FCModal:false,
      SearchCIds:[],
      holdremark:'',
      comment:'',
      commentModalShow:false
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    //remDate.max = ;
    fromDate.max = toDate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    var userToken         = window.localStorage.getItem('accessuserToken');
    this.myStr            = userToken.replace(/"/g, '');

    this.GetClientData();
    this.getLTCRemittanceStatusWise();
    this.exportData();
  },

  methods: {
    changeRadio(ele){
      document.getElementById('ltcform').reset(); document.getElementById("fdate").innerHTML="";
      this.checkAll = false; //this.remDate = '';
      this.fromDate = this.toDate = ''; this.SearchClientIds=[]; this.Client=[];
      this.getLTCRemittanceStatusWise();
    },

    multipleC(){
      let key = this.Client.length-1;
      if(this.Client.length>0 && this.Client[key].ClientId == 0){
        this.SearchClientIds = [];
        this.Client = this.Client[key];

        for (let item of this.ClientList) {
          if (item.ClientId != 0) {
            this.SearchClientIds.push(item.ClientId);
          }
        }
      }

      if(this.Client.ClientId == 0){ return false; }
      else{ this.SearchClientIds = []; return true; }
    },

    GetClientData() {
      this.clientLoading = true; this.ClientList = [];
      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getLTCClientList',
        data: ({ username: this.localuserid }),
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        if(result.data.code == 200){
          this.ClientList = [{ClientId:'0', CompanyName:'All Client'}].concat(result.data.data);
        }
        this.clientLoading = false;
      }, error => {
        this.clientLoading = false; console.error(error)
      })
    },

    getLTCRemittanceStatusWise (){
      this.isLoading = true; this.listPendingRemittanceData=[]; let clientIdArr = [];

      if(this.SearchClientIds.length>0){
        clientIdArr = this.SearchClientIds;
      }else{
        if($.isArray(this.Client) === false){
          this.Client = new Array(this.Client);
        }

        this.Client.forEach(function (val) {
          clientIdArr.push(val.ClientId);
        });
      }
      this.SearchCIds = clientIdArr;

      this.input = ({
        ClientId: this.SearchCIds,
        Status: this.selected,
        CreatedBy: this.localuserid,
        //fromDate: this.fromDate?this.fromDate:this.remDate?this.remDate:'',
        fromDate: this.fromDate?this.fromDate:'',
        toDate: this.toDate,
        offset:this.pageno,
        limit:10
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getLTCRemittanceStatusWise',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
           this.resultCount = 0;
          if(result.data.code == 200){
            this.listPendingRemittanceData  = result.data.data;
            this.resultCount  = result.data.count;

            let totalRows     = result.data.count;
            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }
          this.isLoading = false;
        }, error => {
          console.error(error); this.isLoading = false; this.$alertify.error('Error Occured');
        })
    },

    closeStatusRoleModal(){
       this.ModalShow = false;
       this.modalShipmentShow = false;
       this.FCModal = false;
       this.commentModalShow = false;
       $('span[id^="popUpText"]').hide();
    },

    //to get pagination
    getPaginationData(pageNum) {
      this.pageno = (pageNum - 1) * 10
      this.getLTCRemittanceStatusWise();
    },

    check() {
      this.checkAll = !this.checkAll; this.ClientArr = []; this.singleArr = [];
			if (this.checkAll) {
				for (let i in this.listPendingRemittanceData) {
          this.ClientArr.push(this.listPendingRemittanceData[i]);
				}
			}
		},

    updateCheck(){
      if(this.listPendingRemittanceData.length == this.ClientArr.length){
         this.checkAll = true;
      }else{
         this.checkAll = false;
      }
    },

    PopUp(elem){
      $('span[id^="popUpText"]').hide(); this.checkAll = false;
      $("#popUpText"+elem).fadeIn();
    },

    action(type, data){
      $('span[id^="popUpText"]').hide();
      this.ClientArr = []; this.singleArr = []; this.status = ''; this.status = type; this.holdremark = '';

      this.singleArr.push(data);
      if(type=='Hold'){
        this.$refs.myClosureModalRef.show();
      }else{
        this.$refs.myModalRef.show();
      }
    },

    bulkAction(type){
      this.status = ''; this.holdremark = '';
      if(this.ClientArr.length>0){
        this.status = type;

        if(type=='Hold'){
          this.$refs.myClosureModalRef.show();
        }else{
          this.$refs.myModalRef.show();
        }
      }else{
        this.$alertify.error('Error: Please Check Checkboxes Before Perform Any Bulk Action.');
      }
    },

    hideModal(ele) {
      this.$refs.myModalRef.hide();
      if(ele == 0){ this.remittance(); }
    },

    remittance(){
      this.isLoading = true; let clientArr = '';
      clientArr = [...new Set([].concat(...this.ClientArr.concat(this.singleArr)))];

      if(this.status=='Hold'){
        clientArr.map(item => { item.Remark = this.holdremark; });
      }

      this.input = ({
        remittanceArray: clientArr,
        Status: this.status,
        CreatedBy: this.localuserid
      })
      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'ltcremittanceManualClosure',
        'data': this.input,
        headers: {
            'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        if (result.data.code == 200) {
          this.$alertify.success(result.data.msg); this.reportlink = '';
          this.getLTCRemittanceStatusWise();
          this.exportData();
        } else {
          this.$alertify.error(result.data.msg)
        }
        this.isLoading = false;  this.ClientArr = []; this.singleArr = []; this.checkAll = false;
      }, error => {
        this.isLoading = false; this.checkAll = false;  this.ClientArr = []; this.singleArr = [];
        console.log('error',error); this.$alertify.error('Remittance Error');
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        if((this.fromDate && this.toDate) && (this.fromDate > this.toDate)){
          document.getElementById("fdate").innerHTML="LHS date should not be greater than RHS date."; return false;
        }else if((this.fromDate && !this.toDate) || (!this.fromDate && this.toDate)){
          document.getElementById("fdate").innerHTML="Please select date range instead of single date."; return false;
        }else{
          this.pageno = 0; this.reportlink = ''; this.ClientArr = []; document.getElementById("fdate").innerHTML="";
          this.getLTCRemittanceStatusWise();
        }
      }).catch(() => {
        console.log('errors exist', this.errors); this.$alertify.error('Error Occured');
      });
    },

    resetForm() {
      //this.remDate = '';
      this.fromDate = this.toDate = ''; this.pageno = 0; this.Client = this.CODLedgerReports = []; this.resultCount = 0;
      this.excelLoading = false; this.ClientArr = this.exceptionList = this.shipmentList = []; this.SearchCIds = []; this.holdremark = '';
      this.$validator.reset(); this.errors.clear();
    },

    exportData(){
      if(this.reportlink){
        window.open(this.reportlink);
      }else{

        this.input = ({
          CreatedBy: this.localuserid
        })
        axios({
          method: 'POST',
          url: apiUrl.api_url + 'exportBulkLTCRemittance',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.reportlink = result.data.data;
          }else{
            this.reportlink = ''; this.$alertify.error('File Not Available For Bulk Remittance.');
          }
        }, error => {
          this.reportlink = ''; console.error(error); this.$alertify.error('Bulk Remittance File Error');
        })
      }
    },

    onUpload(event){
      let selectedFile = event.target.files[0];
      if ( /\.(csv)$/i.test(selectedFile.name) ){
        var name = event.target.name + "." +selectedFile.name.split(".").pop();

        const fd = new FormData();
        fd.append('file', selectedFile, name);
        this.excelLoading = true;
        axios.post(apiUrl.api_url + 'uploadLTCRemittanceFile', fd,
        {
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(res => {
          if(res.data.errorCode == 0 && res.data.filename){
             this.isLoading = true;
             this.input = ({
               filename: res.data.filename,
               username: this.localuserid
             })
             axios({
               method: 'POST',
               url: apiUrl.api_url + 'bulkLTCRemittance',
               data: this.input,
               headers: {
                 'Authorization': 'Bearer '+this.myStr
               }
             })
             .then(result => {
               if(result.data.code==200){
                 this.reportlink = ''; this.$alertify.success(result.data.msg);
                 this.getLTCRemittanceStatusWise();
                 this.exportData();
               }else{
                 this.$alertify.error('Bulk Remittance Failed.');
               }
             }, error => {
               console.error(error);this.$alertify.error('Bulk Remittance Error.');
             });
             this.isLoading = false;
           }else{
             this.$alertify.error("CSV File Upload Error");
           }
           this.excelLoading = false;
        }, error => {
          console.error(error); this.excelLoading = false; this.$alertify.error('File Upload Error');
        });
      }else{
        this.excelLoading = false;
        this.$alertify.error(event.target.placeholder + " Failed! Please Upload Only Valid Format: .csv");
      }
    },

    ltcRemitShipments(fromDate, toDate, clientId) {
      this.shipLoading = true; this.exceptionList = this.shipmentList = []; this.$refs.ShipmentModalRef.show();

      this.input = ({
        fromDate: fromDate,
        toDate: toDate,
        ClientId: clientId,
        Status: this.selected
      })
      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getltcremitshipments',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        if(result.data.code == 200){
          this.shipmentList = result.data.Shipments;
        }
        this.shipLoading = false;
      }, error => {
        this.shipLoading = false; console.error(error); this.$alertify.error('Shipment Error');
      })
    },

    exShipments(arr) {
      this.exceptionList = this.shipmentList = []; this.$refs.ShipmentModalRef.show(); this.exceptionList = arr;
    },

    onUpdate: function() {
      this.$validator.validateAll().then((result) => {
        if(result){
          if(this.status!='Hold'){ this.holdremark = ''; }
          this.FCModal = false; this.$refs.myClosureModalRef.hide(); this.$refs.myModalRef.show();
        }else{
          this.$alertify.error('Update Error');
        }
      }).catch(() => {
        console.log('errors exist', this.errors); this.$alertify.error('Error Occured');
      });
    },

    showComment(ele){
      this.comment = []; this.comment = ele; this.$refs.myCommentModalRef.show();
    },
  }
}
