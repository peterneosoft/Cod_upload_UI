import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'CODRemitanceClose',
  components: {
    Multiselect,
    Paginate,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      fromDate:"",
      toDate:"",
      myStr:"",
      ClientId:"",
      ClientList:[],
      selected: 'DeliveryDate',
      options: [
        { text: 'Delivery Date', value: 'DeliveryDate' },
        { text: 'Transaction Date', value: 'TransactionDate' }
      ],
      value: null,
      optionss: ['list', 'of', 'options'],
      listCODRemitanceData:[],
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: '',
      localhubid: '',
      localhubname: ''
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
    this.GetClientData()
  },

  methods: {
    GetClientData() {
      axios({
        method: 'GET',
        url: apiUrl.api_url + 'external/getclientlist',
        data: {},
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        this.ClientList = result.data.clients.data;
      }, error => {
        console.error(error)
      })
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetCODRemittanceDetailsData();
    },

    GetCODRemittanceDetailsData(event) {

      if(this.fromDate > this.toDate){
         document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
         return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      let cData = [];
      this.ClientId.forEach(function (val) {
        cData.push(val.ClientMasterID);
      });

      this.isLoading = true;
      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'codremittancedetailsmaster?ClientId='+cData+'&offset='+this.pageno+'&limit=10&fromDate='+this.fromDate+'&toDate='+this.toDate+'&search='+this.selected,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          this.listCODRemitanceData = result.data.data;
          this.isLoading = false;
          let totalRows     = result.data.count;
          this.resultCount  = result.data.count;
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
        }else{
          this.listCODRemitanceData=[];
          this.resultCount  = 0;
          this.isLoading = false;
        }
      }, error => {
          console.error(error)
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        this.GetCODRemittanceDetailsData(event);
        //event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.fromDate = this.toDate = ''; this.options=[]; this.resultCount = this.pageno = 0;
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
