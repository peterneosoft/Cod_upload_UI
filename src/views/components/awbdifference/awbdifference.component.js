import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import CryptoJS from 'crypto-js'
import Paginate from 'vuejs-paginate';
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'srclosuresearch',
  components: {
    Paginate,
    VueElementLoading
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
      deliverydate:'',
      closuredate:'',
      localhubid:0,
      isLoading:false,
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

    this.awbDifference();
  },

  methods: {
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
    },

    //to get difference between db and shipment update
    awbDifference() {
      this.isLoading = true;

      this.input = ({
        hubid:this.localhubid,
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
      this.deliverydate = ''; this.resultSUCount = this.resultDBCount = this.resultDiffCount = 0; this.pageno = this.pagecount = 1;
      this.SUList = this.DBList  = this.DiffList = [];
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
