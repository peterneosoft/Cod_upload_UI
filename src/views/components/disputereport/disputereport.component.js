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
      exportf:false,
      disableHub:false,
      zoneLoading:false,
      hubLoading:false,
      SearchHubIds:[],
      reportlink:'',
      tilldate:'',
      SearchZoneIds:[],
      SearchZIds:[],
      SearchHIds:[]
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    tilldate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.getZoneData();
  },

  methods: {
    multiple(){
      let key = this.zone.length-1;
      if(this.zone.length>0 && this.zone[key].hubzoneid == 0){
        this.SearchZoneIds = [];
        this.zone = this.zone[key];

        for (let item of this.zoneList) {
          if (item.hubzoneid != 0) {
            this.SearchZoneIds.push(item);
          }
        }
      }

      if(this.zone.hubzoneid == 0){ return false; }
      else{ this.SearchZoneIds = []; return true; }
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

    addHubData() {
      let zData = this.zoneIdArr = [];  this.hubList = []; this.HubId = []; this.RSCList = []; this.RSCName = []; this.disableHub = false;
      if($.isArray(this.zone) === false){
        this.zone = new Array(this.zone);
      }

      this.zone.forEach(function (val) {
        zData.push({'hubzoneid':val.hubzoneid, 'hubzonename':val.hubzonename});
      });

      this.zoneIdArr = zData;

      if(zData.length===1 && zData[0].hubzoneid > 0){
        this.getHubData(zData[0].hubzoneid);
      }else{
        this.disableHub = true;
      }
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getDisputeReport()
    },

    exportDisputeData(){
      if(this.reportlink){
        window.open(this.reportlink);
      }else{
        this.exportf = false;
        this.input = ({
          hubid: this.SearchHIds,
          zoneid: this.SearchZIds,
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
            this.exportf = true; this.reportlink = result.data.data; window.open(this.reportlink);
          }else{
            this.exportf = false; this.reportlink = '';
          }
        }, error => {
          this.exportf = false; this.reportlink = ''; console.error(error); this.$alertify.error('Error Occured');
        })
      }
    },

    getDisputeReport(){
      this.isLoading = true;

      let zData = [];
      if(this.SearchZoneIds.length>0){
        zData = this.SearchZoneIds;
      }else{

        this.zone.forEach(function (val) {
          zData.push(val);
        });
      }

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

      this.SearchZIds = zData; this.SearchHIds = hubArr;

      this.input = ({
        hubid: this.SearchHIds,
        zoneid: this.SearchZIds,
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

            this.DisputeReport  = result.data.data;
            let totalRows       = result.data.count
            this.resultCount    = result.data.count
            this.exportf        = true;
            if (totalRows < 10) {
                 this.pagecount = 1
             } else {
                 this.pagecount = Math.ceil(totalRows / 10)
             }
           }else{
              this.exportf      = false; this.DisputeReport = []; this.resultCount = 0;
           }
           this.isLoading       = false;
          },
           error => {
             this.DisputeReport = []; this.isLoading = false; this.exportf = false; console.error(error); this.$alertify.error('Error Occured');
        })
    },

    //to get All Zone List
    getZoneData() {
      this.input = {}; this.zoneLoading = true; this.zoneList = [];
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

          if(this.role=='financemanager' || this.role=='admin'){
            this.zoneList = [{hubzoneid:'0', hubzonename:'All Zone', hubzonecode:'All Zone'}].concat(result.data.zone.data);
          }else{
            if(window.localStorage.getItem('accesszone')){
              result.data.zone.data.map(item => {
                let obj = window.localStorage.getItem('accesszone').split(",").find(el => el == item.hubzoneid);
                if(obj) this.zoneList.push(item);
              });
            }else{ this.zoneList = result.data.zone.data; }
          }
        }, error => {
          this.zoneLoading = false; console.error(error);
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
          url: apiUrl.api_url + 'external/getzonesvc',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubLoading = false; this.HubId = []; this.hubList = [];
          if(result.data.hub.code == 200){
            this.hubList = [{HubID:'0', HubName:'All Hub', HubCode:'All Hub'}].concat(result.data.hub.data);
          }
        }, error => {
          this.hubLoading = false; console.error(error);
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0; this.exportf = false;
          this.reportlink = ''; this.getDisputeReport()
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.tilldate = this.zone = ''; this.hubList = this.HubId = this.DisputeReport = this.SearchZIds = this.SearchHIds = [];
      this.exportf = this.disableHub = false; this.pageno = this.resultCount = 0; this.reportlink = '';
      this.$validator.reset(); this.errors.clear();
    },
  }
}
