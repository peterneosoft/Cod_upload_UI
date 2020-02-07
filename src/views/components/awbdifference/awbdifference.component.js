import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate';
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'srclosuresearch',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  props: [],

  data() {
    return {
      resultSUCount:0,
      resultDBCount:0,
      resultDiffCount:0,
      SUList:[],
      DBList:[],
      DiffList:[],
      zoneList:[],
      hubList:[],
      HubId:'',
      zone:'',
      deliverydate:'',
      closuredate:'',
      localhubid:0,
      isLoading:false,
      allZoneLoading:false,
      hubLoading:false,
      pageno: 0,
      pagecount: 0,
      urltoken:'',
      ShowHideFilter:0
    }
  },
  computed: {

  },

  mounted() {
    var date = new Date();
    deliverydate.max = date.toISOString().split("T")[0];

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;

    this.urltoken = window.localStorage.getItem('accessuserToken');

    this.getZoneData();
    this.awbDifference();
  },

  methods: {
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
    },

    //to get All Zone List
    getZoneData() {
      this.allZoneLoading = true;
      this.input = {}; this.zoneList = [];
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          this.allZoneLoading = false;
          if(result.data.zone.data.length > 0) this.zoneList = result.data.zone.data;
        }, error => {
          this.allZoneLoading = false; this.HubId = this.hubList = [];
          console.error(error)
        })
    },

    //to get Hub List According to Zone
    getHubData() {
      if(this.zone==""){
        return false;
      }

      this.HubId = ''; this.hubList = [];

      this.hubLoading = true;
      this.input = ({
          zoneid: this.zone
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.urltoken
          }
        })
        .then(result => {
          this.hubLoading = false;
          if(result.data.hub.data.length > 0) this.hubList = result.data.hub.data;
        }, error => {
          this.hubLoading = false;
          console.error(error)
        })
    },

    //to get difference between db and shipment update
    awbDifference() {
      this.isLoading = true;

      this.input = ({
        hubid:this.HubId ? this.HubId.HubID : this.localhubid,
        date:this.deliverydate,
        status:'Delivered',
      })

      axios({
        method: 'POST',
        url: apiUrl.api_url + 'checkAWBdifference',
        data: this.input,
        headers: {
          'Authorization': 'Bearer '+this.urltoken
        }
      })
      .then(result => {
        this.closuredate = result.data.date;
        this.SUList = this.DBList  = this.DiffList = [];
        this.resultSUCount = this.resultDBCount = this.resultDiffCount = 0;

        if(result.data.code == 200){
          this.SUList = result.data.SUdata;
          this.DBList  = result.data.DBdata;
          this.DiffList  = result.data.DiffData;

          this.resultSUCount = (this.SUList.TotalCnt>0)?1:0;
          this.resultDBCount = (this.DBList.DBTotalCODCnt>0)?1:0;
          this.resultDiffCount = (this.DiffList.TotalCODdiffCnt > 0)?1:0;

          this.pagecount = 1; this.pageno = 0;
          this.isLoading = false;
        }
      }, error => {
        this.isLoading = false;
        console.error(error)
        this.$alertify.error('Error Occured');
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
           this.awbDifference();
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
        this.$alertify.error('Error Occured');
      });
    },

    resetForm() {
      this.deliverydate = this.HubId = this.zone = '';
      this.resultSUCount = this.resultDBCount = this.resultDiffCount = 0; this.pageno = this.pagecount = 1;
      this.SUList = this.DBList  = this.hubList = this.DiffList = [];
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
