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
      fromDate:'',
      toDate:'',
      currentdate:'',
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
      exportf:false,
      reportlink:'',
      status:'',
      shipmentList:[],
      shipLoading:false,
      modalShipmentShow:false,
      SearchCIds:[]
    }
  },

  computed: {

  },

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    var userToken         = window.localStorage.getItem('accessuserToken');
    this.myStr            = userToken.replace(/"/g, '');

    this.GetClientData();
    this.getLTCRemittanceStatusWise ();

    var date = new Date();
    this.currentdate = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});
  },

  methods: {
    changeRadio(ele){
      this.exportf = false; this.reportlink = ''; this.checkAll = false;
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
      this.isLoading = true; this.listPendingRemittanceData=[]; this.resultCount = 0; let clientIdArr = [];

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
        CreatedBy: this.localuserid
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
          if(result.data.code == 200){
            this.listPendingRemittanceData  = result.data.data;

            this.resultCount  = result.data.count;
            let totalRows     = result.data.count;
            if (totalRows < 20) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 20)
            }
            this.exportf = true;
          }
          this.isLoading = false;
        }, error => {
          console.error(error); this.isLoading = false; this.exportf = false; this.$alertify.error('Error Occured');
        })
    },

    closeStatusRoleModal(){
       this.ModalShow = false;
       this.modalShipmentShow = false;
       $('span[id^="popUpText"]').hide();
    },

    //to get pagination
    getPaginationData(pageNum) {
      this.pageno = (pageNum - 1) * 20
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
      this.ClientArr = []; this.singleArr = []; this.status = ''; this.status = type;

      this.singleArr.push(data);
      this.$refs.myModalRef.show();
    },

    bulkAction(type){
      this.status = '';
      if(this.ClientArr.length>0){
        this.status = type; this.$refs.myModalRef.show();
      }else{
        this.$alertify.error('Error Occured: Please Check Checkboxes Before Perform Any Bulk Action.');
      }
    },

    hideModal(ele) {
      this.$refs.myModalRef.hide();
      if(ele == 0){ this.remittance(); }
    },

    remittance(){
      this.isLoading = true;
      let clientArr = [...new Set([].concat(...this.ClientArr.concat(this.singleArr)))];

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
          this.$alertify.success(result.data.msg); this.exportf = false; this.reportlink = '';
          this.getLTCRemittanceStatusWise();
        } else {
          this.$alertify.error(result.data.msg)
        }
        this.isLoading = false; this.ClientArr = []; this.checkAll = false;
      }, error => {
        this.isLoading = false; this.checkAll = false; this.ClientArr = []; console.log('error',error); this.$alertify.error('Error Occured');
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0; this.resultCount = 0; this.exportf = false; this.reportlink = ''; this.ClientArr = [];
          this.getLTCRemittanceStatusWise();
        }else{
          this.$alertify.error('Error Occured');
        }
      }).catch(() => {
        console.log('errors exist', this.errors); this.$alertify.error('Error Occured');
      });
    },

    resetForm() {
      this.fromDate = this.toDate = ''; this.pageno = 0; this.Client = this.CODLedgerReports = []; this.resultCount = 0;
      this.exportf = this.excelLoading = false; this.reportlink = ''; this.ClientArr = this.shipmentList = []; this.SearchCIds = [];
      this.$validator.reset(); this.errors.clear();
    },

    exportData(){
      if(this.reportlink){
        window.open(this.reportlink);
      }else{

        this.input = ({
          ClientId: this.SearchCIds,
          Status: this.selected,
          CreatedBy: this.localuserid
        });

        this.excelLoading = true;
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
            this.exportf = true; this.reportlink = result.data.data; window.open(result.data.data);
          }else{
            this.exportf = false; this.reportlink = '';
          }
          this.excelLoading = false;
        }, error => {
          this.exportf = this.excelLoading = false; this.reportlink = ''; console.error(error); this.$alertify.error('Error Occured');
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
               console.log('result==', result);
             }, error => {
               console.error(error);this.$alertify.error('Upload Data Error.');
             })
           }else{
             this.$alertify.error("CSV File Upload Error");
           }
           this.excelLoading = false;
        }, error => {
          console.error(error); this.excelLoading = false; this.$alertify.error('File Error Occured');
        });
      }else{
        this.excelLoading = false;
        this.$alertify.error(event.target.placeholder + " Failed! Please Upload Only Valid Format: .csv");
      }
    },

    ltcRemitShipments(fromDate, toDate, clientId) {
      this.shipLoading = true; this.shipmentList = []; this.$refs.ShipmentModalRef.show();

      this.input = ({
        fromDate: fromDate,
        toDate: toDate,
        ClientId: clientId
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
        this.shipLoading = false; console.error(error)
      })
    },
  }
}
