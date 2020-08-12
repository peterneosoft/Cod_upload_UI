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
      tilldate:'',
      SearchZoneIds:[]
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

    exportDisputeData(zData, hubArr){

      this.reportlink = '';

      this.input = ({
          hubid: hubArr,
          zoneid: zData,
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
          this.reportlink = result.data.data; this.exportf=true;
        }else{
          this.reportlink = ''; this.exportf=false;
        }
      }, error => {
        this.exportf=false; this.reportlink = '';
        console.error(error); this.$alertify.error('Error Occured');
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

      this.input = ({
          hubid: hubArr,
          zoneid: zData,
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
             this.exportDisputeData(zData, hubArr);
           }else{
             this.DisputeReport = []; this.resultCount = 0;
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
          this.zoneList = [{hubzoneid:'0', hubzonename:'All Zone', hubzonecode:'All Zone'}].concat(result.data.zone.data);
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
