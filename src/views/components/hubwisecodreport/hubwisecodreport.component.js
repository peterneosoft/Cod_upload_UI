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
  name: 'hubwisecodreport',
  components: {Paginate,
  VueElementLoading,
  Multiselect
},
  props: [],

  data() {
    return {
      zoneList:[],
      hubList:[],
      CODLedgerReports:[],
      zone:"",
      HubId:"",
      resultCount:'',
      toDate:"",
      fromDate:"",
      status:"",
      zonename:"",
      hubname:"",
      exportPath:"",
      pageno:0,
      pagecount:0,
      HubWiseCODLedge:false,
      isLoading:false,
      exportf:false
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.getZoneData();
  },

  methods: {
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getHubWiseCODLedgerReports()
    },

    exportHubWiswData(){
      this.input = ({
          hubid: this.HubId.HubID,
          hubname: this.hubname,
          zonename: this.zonename,
          status: this.status,
          fromdate: this.fromDate,
          todate: this.toDate
      })

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'exportHubWiseCODReports',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          this.exportf=true;
          this.exportPath = result.data.data;
        }else{
          this.exportf=false;
        }
      }, error => {
          console.error(error)
      })
    },

    getHubWiseCODLedgerReports(){
      if(this.fromDate > this.toDate){
         document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
         return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      this.HubWiseCODLedge = true ;

      this.input = ({
          hubid: this.HubId.HubID,
          fromdate: this.fromDate,
          todate: this.toDate,
          status: this.status,
          offset:this.pageno,
          limit:10
      })
      this.isLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getHubWiseCODLedgerReports',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.CODLedgerReports = result.data.data.rows;
            this.isLoading    = false;
            let totalRows     = result.data.data.count

            this.resultCount  = result.data.data.count
            if (totalRows < 10) {
                 this.pagecount = 1
             } else {
                 this.pagecount = Math.ceil(totalRows / 10)
             }
             this.exportHubWiswData();
           }else{
             this.CODLedgerReports = [];
             this.isLoading    = false;
             this.resultCount  = 0;
           }
          },
           error => {
          console.error(error)
        })
    },
    //to get All Hub List
    getZoneData() {
      this.input = {}
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.zoneList = result.data.zone.data;
        }, error => {
          console.error(error)
        })
    },
    getHubData() {
      if(this.zone==""){
        return false;
      }
      this.input = ({
          zoneid: this.zone
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.HubId = "";
          this.hubList = result.data.hub.data;
        }, error => {
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.zonename = event.target[0].selectedOptions[0].attributes.title.nodeValue;
          this.hubname = this.HubId.HubName;
          this.exportf=false;
          this.getHubWiseCODLedgerReports()
        }
      //  event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
