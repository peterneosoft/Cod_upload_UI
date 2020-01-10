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
      pageno: 1,
      pagecount: 1,
      isLoading: false,
      resultCount: 0,
      myStr: '',
      localuserid: 0,
      AddEditBankHoliday:0,
      holidayDate:'',
      holidayid:'',
      holidayname:'',
      BankHolidayId:'',
      HolidayMasterName:'',
      status:1,
      year:'',
      listBankHolidayData: [],
      listholidayData: [],
      holyLoading: false
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

    this.getHolidayList();
    this.getBankHolidayData();
  },

  methods: {

    getHolidayList() {
      this.holyLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'external/getbankholidaylist',
          data: {},
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.holyLoading = false;
          this.listholidayData  = result.data.holiday.data;
          this.listholidayData.push({
            Description:'Second and Fourth Saturday',
            HolidayMasterId:'-1',
            HolidayName:'Non Working Saturday',
          });
        }, error => {
          this.holyLoading = false;
          console.error(error)
        })
    },

    //to get Bank Holiday List According to Current Year
    getBankHolidayData() {
      this.isLoading = true;

      axios({
          method: 'GET',
          url: apiUrl.api_url + 'external/getbankholidaysaveddata',
          'data': {},
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.listBankHolidayData  = result.data.holidayList;
            this.sundayDates          = result.data.sundayDates.join(', ');
            this.saturdayDates        = result.data.saturdayDates;
            this.year                 = '( Year - '+result.data.year+' )';

            this.isLoading            = false;
            this.resultCount          = result.data.count;
          }else{
            this.resultCount  = 0;
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
        })
    },

    getBankHolidayRowData(data) {

      this.holidayid = ""; this.holidayDate = "";
      this.$validator.reset();
      this.errors.clear();

      this.holidayid          = data.HolidayMasterId;
      this.HolidayMasterName  = data.HolidayMasterName;
      this.BankHolidayId      = data.BankHolidayId;
      this.holidayDate        = data.HolidayDate;
      this.CreatedBy          = data.CreatedBy;
      this.status             = data.IsActive;

      $('#holidayDate').val(data.HolidayDate);
    },

    saveBankHolidayData(event) {

      this.input = ({
          holidayDate: this.holidayDate,
          holidayid: String(this.holidayid),
          holidayname: this.holidayname,
          status: String(this.status),
          createdby: this.localuserid
      });

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'external/addbankholiday',
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
          this.$alertify.error('Error Occured');
      });
    },

    updateBankHolidayData(event) {

      this.input = ({
          bankholidayid: String(this.BankHolidayId),
          holidayDate: this.holidayDate,
          holidayid: String(this.holidayid),
          holidayname: this.holidayname,
          status: String(this.status),
          createdby: this.localuserid,
          lastmodifiedby: this.localuserid,
      });

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'external/updatebankholiday',
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
          this.$alertify.error('Error Occured');
      });
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          if(this.BankHolidayId){
            this.holidayname = event.target[0].selectedOptions[0].attributes.title.nodeValue;
            this.updateBankHolidayData(event);
          }else{
            this.holidayname = event.target[0].selectedOptions[0].attributes.title.nodeValue;
            this.saveBankHolidayData(event);
          }
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.holidayid = ""; this.holidayDate = ""; this.status=1; this.BankHolidayId='';
      document.getElementById('holidayDate').value="";
      this.$validator.reset();
      this.errors.clear();
      this.getBankHolidayData();
    },

    scrollWin() {
      window.scrollBy(0, -1000);
    }
  }
}
