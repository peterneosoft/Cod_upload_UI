import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'srpendinglimit',
  components: {
    Paginate,
    VueElementLoading
  },
  data() {
    return {
      myStr: '',
      count: 0,
      pageno: 0,
      pagecount: 0,
      resultCount: 0,
      localuserid: 0,
      isLoading: false,
      srpendinglimit:'',
      srPendingLimit: [],
      disableButton: true
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

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.getSRPendingLimitData();
  },

  methods: {
    //to get SR Pending Limit
    getSRPendingLimitData() {
      this.isLoading = true;

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'SRPendingLimit',
          'data': {},
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.srPendingLimit = result.data.Pendinglimit;

            this.isLoading      = false;
            this.resultCount    = 1;
            this.pagecount      = 1;

          }else{
            this.disableButton  = false;
            this.resultCount    = 0;
            this.isLoading      = false;
          }
        }, error => {
          console.error(error)
        })
    },

    getSRPendingRowData(data) {
      this.$validator.reset();
      this.errors.clear();

      this.srpendinglimit = '';
      this.srpendinglimit = data;
      this.disableButton  = false;
    },

    saveSRPendingLimitData() {

      this.disableButton  = true;

      this.input = ({
          PendingLimit: this.srpendinglimit
      });

      this.isLoading = true;

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'SRPendingLimit',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(response => {

        if (response.data.code == 200) {
          this.$alertify.success(response.data.msg);
          this.resetForm();

        } else {
          this.disableButton  = false;
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
        this.disableButton  = false;
        console.error('exception is:::::::::', httpException)
        this.$alertify.error('Error Occured');
      });
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.saveSRPendingLimitData();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.$validator.reset();
      this.errors.clear();

      this.srpendinglimit = '';
      this.disableButton  = true;

      this.getSRPendingLimitData();
    },
  }
}
