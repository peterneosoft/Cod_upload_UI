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
  name: 'srreset',
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
        codamount: []
      },
      SR_Name:'',
      toDate:'',
      fromDate:'',
      SRList:[],
      SRLedgerList:[],
      srLoading:false,
      agentLoading:false,
      agentList:[],
      Agent_Name:'',
      SRArr:[],
      searchview:'',
      selected: 'sr',
      options: [
        { text: 'SR Closure Search', value: 'sr' },
        { text: 'Agent Closure Search', value: 'agent' }
      ]
    }
  },

  computed: {

  },

  mounted() {
    var date              = new Date();
    toDate.max            = fromDate.max = date.toISOString().split("T")[0];

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
    addHubData() {
      if(this.HubId.HubID){
        this.GetDeliveryAgentData();
        this.GetAgentData();
      }
    },

    //to get SR List
    GetDeliveryAgentData(){
      this.srLoading = true;

       this.input = ({
           hubid: [this.HubId.HubID]
       })

       axios({
           method: 'POST',
           url: apiUrl.api_url + 'external/GetdeliveryAgentsFromHubId',
           data: this.input,
           headers: {
             'Authorization': 'Bearer '+this.myStr
           }
         })
         .then(result => {
           this.srLoading = false;
           if(result.data.code == 200){
             this.SRList = result.data.data;
           }else{
              this.$alertify.error("SR not found")
           }
         }, error => {
           this.srLoading = false;
           console.error(error)
         })
    },

    //to get Agent List
    GetAgentData(){
      this.agentLoading = true;

      this.input = ({
        hubid: this.HubId.HubID
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getAgentList',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      })
      .then(result => {
        if(result.data.code == 200){
          this.agentList = result.data.AgentList;
        }else{
          this.$alertify.error("Agent list not found")
        }
        this.agentLoading = false;
      }, error => {
        this.agentLoading = false; console.error(error)
      })
    },

    GetAgentSRData(){
      if(this.Agent_Name){
        this.srLoading = true; this.SRArr = this.SRList = []; this.SR_Name = '';
         this.input = ({
             id: this.Agent_Name.id,
             hubid: this.HubId.HubID
         })

         axios({
           method: 'POST',
           url: apiUrl.api_url + 'getSRAgentList',
           data: this.input,
           headers: {
             'Authorization': 'Bearer '+this.myStr
           }
         })
         .then(result => {
           if(result.data.code == 200){
             this.SRList = result.data.SRAgentList;
             this.SRArr = result.data.sridArr;
           }else{
              this.$alertify.error("SR not found for selected agent.")
           }
           this.srLoading = false;
         }, error => {
           this.srLoading = false; console.error(error)
         })
       }
    },

    changeRadio(ele){
      this.SRArr = this.SRList = []; this.SR_Name = '';
      if(ele == 'sr'){
        this.GetDeliveryAgentData();
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getMonthlySRLedgerDetails()
    },

    getMonthlySRLedgerDetails(){
      if(this.fromDate > this.toDate){
         document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
         return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      this.SRLedgerList = [];
      this.isLoading = true; this.srLedger = true;
      this.input = ({
        srid: this.SR_Name.srid ? [this.SR_Name.srid]: this.SRArr,
        hubid:this.HubId.HubID,
        fromdate:this.fromDate,
        todate:this.toDate,
        offset:this.pageno,
        limit:10
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getMonthlySRLedgerDetails',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.SRLedgerList = result.data.data.rows;
            let totalRows     = result.data.data.count
            this.resultCount  = result.data.data.count

            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }else{
            this.resultCount = 0;
          }
          this.isLoading = false;
        }, error => {
          this.isLoading = false; console.error(error); this.$alertify.error('Error Occured');
        })
    },

    GetSVCledgerData() {
      $('span[id^="cau"]').hide(); $('span[id^="bdu"]').hide(); $('span[id^="dps"]').hide(); $('span[id^="up"]').hide();
      $('span[id^="cax"]').show(); $('span[id^="bdx"]').show(); $('span[id^="ed"]').show(); $('span[id^="vri"]').hide(); $('span[id^="vrl"]').show();
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
            this.form.depamount[svc.svcledgerid]  = svc.bankdeposit;
            this.form.codamount[svc.svcledgerid]  = svc.codamount;
            this.form.finamount[svc.svcledgerid]  = svc.actualrecamt ? svc.actualrecamt : 0;
            this.form.depslip[svc.svcledgerid]    = svc.batchid;
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
        if(this.SR_Name===null) this.SR_Name = '';

        if(this.selected){
          if(((this.selected=='agent' && this.Agent_Name) || (this.selected=='sr' && this.SR_Name)) && (this.HubId.HubID && this.fromDate && this.toDate)){
            this.pageno = 0; document.getElementById("opt").innerHTML="";
            this.getMonthlySRLedgerDetails();
          }
        }else{
          document.getElementById("opt").innerHTML="Please choose atleast one search option ( SR Closure OR Agent Closure )."; return false;
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
      this.resetdata = []; this.resetdata = data; this.resetDD = ''; this.resetDD = data.deliverydate; this.resetType = 'reset';
      this.$refs.myResetModalRef.show();
    },

    hideResetModal(ele, typ) {
      this.$refs.myResetModalRef.hide();
      if(ele == 0 && typ == 'reset'){
        this.resetSVCledger(this.resetdata);
      }else if(ele == 0 && typ == 'update'){
        this.updateLedger(this.resetdata);
      }
    },

    showUpdateModal(data){
      this.resetdata = []; this.resetdata = data; this.resetDD = ''; this.resetDD = data.deliverydate; this.resetType = 'update';
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
        document.getElementById("depamt"+data.svcledgerid).innerHTML="Bank deposited amount is required."; return false;
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

    editLedger(index){
      $('#cax'+index).hide(); $('#bdx'+index).hide(); $('#ed'+index).hide(); $('#vrl'+index).hide(); $('#vri'+index).hide(); $('#vrrl'+index).hide(); $('#vrri'+index).hide();
      $('#cau'+index).show(); $('#bdu'+index).show(); $('#dps'+index).show(); $('#up'+index).show();
    },
  }
}
