import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'bankholiday',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  data() {
    return {
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: 0,
      count: 0,
      myStr: '',
      localuserid: 0,
      AddEditBankHoliday:0,
      hollidayDate:'',
      occasion:'',
      listBankHolidayData: []
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

    this.getBankHollidayData();
  },

  methods: {

    //to get Bank Holiday List According to Year
    getBankHollidayData() {

      this.input = ({
          offset: this.pageno,
          limit: 10
      })
      this.isLoading = true;

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'gethubsettingsdata',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.listBankHolidayData  = result.data.data;

            this.isLoading            = false;
            let totalRows             = result.data.count;
            this.resultCount          = result.data.count;

            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }else{
            this.resultCount  = 0;
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
        })
    },

    getBankHolidayRowData(data) {
      this.$validator.reset();
      this.errors.clear();

      this.occasion = this.hollidayDate = "";

      this.occasion      = data.occasion;
      this.hollidayDate  = this.hollidayDate;
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getBankHollidayData();
    },

    saveBankHollidayData() {

      this.input = ({
          hubid: hData,
          createdby: this.localuserid
      });
      this.isLoading = true;
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'savehubsettings',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(response => {
        if (response.data.errorCode == 0) {
          this.$alertify.success(response.data.msg);
          this.resetForm(event);
        } else if (response.data.errorCode == -1) {
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException)
      });
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.saveBankHollidayData();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.occasion = this.hollidayDate = "";
      this.$validator.reset();
      this.errors.clear();
      this.GetHubSettingsData();
    },
  }
}
