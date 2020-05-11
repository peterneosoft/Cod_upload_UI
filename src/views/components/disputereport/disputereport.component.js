import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'disputereport',
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
      DisputeReport:[],
      zone:[],
      zoneIdArr:[],
      HubId:[],
      resultCount:'',
      hubname:"",
      pageno:0,
      pagecount:0,
      isLoading:false,
      excelLoading: false,
      exportf:false,
      disableHub:false,
      zoneLoading:false,
      hubLoading:false,
      SearchHubIds:[],
      reportlink:'',
      tilldate:''
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    tilldate.max = date.toISOString().split("T")[0];

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.getZoneData();
  },

  methods: {
    multiple(){
      return true;
    },

    multipleHub(){
      let key = this.HubId.length-1;
      if(this.HubId.length>0 && this.HubId[key].HubID == 0){
        this.SearchHubIds = [];
        this.HubId = this.HubId[key];

        for (let item of this.hubList) {
          if (item.HubID != 0) {
            this.SearchHubIds.push(item.HubID);
          }
        }
      }

      if(this.HubId.HubID == 0){ return false; }
      else{ this.SearchHubIds = []; return true; }
    },

    addHubData(event) {
      let zData = []; this.zoneIdArr = [];
      this.zone.forEach(function (val) {
        if (val.hubzoneid != '0'){
          zData.push({'hubzoneid':val.hubzoneid, 'hubzonename':val.hubzonename});
        }
      });

      if(zData.length===1){
        this.disableHub = false;
        this.zoneIdArr = zData;
        this.getHubData(zData[0].hubzoneid);
      }else{
        this.hubList = []; this.HubId = [];
        this.disableHub = true;
        this.zoneIdArr = zData;
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getDisputeReport()
    },

    exportCODOutstandingData(){

      let hubArr = []; this.reportlink = '';

      if(this.SearchHubIds.length>0){
        hubArr = this.SearchHubIds;
      }else{
        if($.isArray(this.HubId) === false){
          this.HubId = new Array(this.HubId);
        }

        this.HubId.forEach(function (val) {
          hubArr.push(val.HubID);
        });
      }

      this.input = ({
          hubid: hubArr,
          zoneid: this.zoneIdArr,
          tilldate:this.tilldate
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'exportDisputeReport',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          this.exportf=true;
          this.reportlink = result.data.data;
        }else{
          this.exportf=false; this.reportlink = '';
        }
      }, error => {
        this.exportf=false; this.reportlink = '';
        console.error(error)
        this.$alertify.error('Error Occured');
      })
    },

    exportreport(){
      this.excelLoading = true;
      if(this.reportlink){
        window.open(this.reportlink);
        this.excelLoading = false;
      }else{
        this.excelLoading = false;
      }
    },

    getDisputeReport(){
      this.isLoading = true; this.DisputeReport = []; this.resultCount = 0;

      let hubArr = [];
      if(this.SearchHubIds.length>0){
        hubArr = this.SearchHubIds;
      }else{
        if($.isArray(this.HubId) === false){
          this.HubId = new Array(this.HubId);
        }

        this.HubId.forEach(function (val) {
          hubArr.push(val.HubID);
        });
      }

      this.input = ({
          hubid: hubArr,
          zoneid: this.zoneIdArr,
          tilldate:this.tilldate,
          offset:this.pageno,
          limit:10
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getDisputeReport',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {

          if(result.data.code == 200){

            this.DisputeReport = result.data.data;
            let totalRows = result.data.count
            this.resultCount = result.data.count

            if (totalRows < 10) {
                 this.pagecount = 1
             } else {
                 this.pagecount = Math.ceil(totalRows / 10)
             }
             this.exportCODOutstandingData();
           }
           this.isLoading = false;
          },
           error => {
             this.isLoading = false; console.error(error); this.$alertify.error('Error Occured');
        })
    },

    //to get All Zone List
    getZoneData() {
      this.input = {}
      this.zoneLoading = true;
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
          this.zoneLoading = false;
          console.error(error)
        })
    },

    //to get All Zone Wise Hub List
    getHubData(zoneid) {
      if(zoneid==""){
        return false;
      }
      this.input = ({
          zoneid: zoneid
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
          this.hubLoading = false;
          this.HubId = [];
          this.hubList = [{HubID:'0', HubName:'All Hub', HubCode:'All Hub'}].concat(result.data.hub.data);
        }, error => {
          this.hubLoading = false;
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0; this.exportf = false;
          this.getDisputeReport()
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.tilldate = this.zone = ''; this.hubList = this.HubId = this.DisputeReport = [];
      this.exportf = this.disableHub = false; this.pageno = this.resultCount = 0;
      this.$validator.reset(); this.errors.clear();
    },
  }
}
