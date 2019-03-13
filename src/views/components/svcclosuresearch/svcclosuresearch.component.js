import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'svcclosuresearch',
  components: {
    Paginate,
    VueElementLoading
  },
  data() {
    return {
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: '',
      toDate: '',
      fromDate: '',
      listSVCledgerData: []
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;
  },

  methods: {
    searchSVCledgerData(){
      this.pageno = 0;
      this.GetSVCledgerData();
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetSVCledgerData()
    },

    GetSVCledgerData() {
      this.input = ({
          offset: this.pageno,
          limit: 10,
          hubid: this.localhubid,
          fromDate: this.fromDate,
          toDate: this.toDate
      })
      this.isLoading = true;

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'svcledgermaster',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '
          }
      })
      .then(result => {
          this.listSVCledgerData = result.data.data.rows;
          this.isLoading    = false;
          let totalRows     = result.data.data.count
          this.resultCount  = result.data.data.count
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
      }, error => {
          console.error(error)
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.searchSVCledgerData();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
