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
      listSearchSVCledgerData: [],
      myStr: '',
      localhubid: '',
      localhubname: ''
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
    this.localhubname     = hubdetail[0].HubName;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
  },

  methods: {
    searchSVCledgerData(){
      this.pageno = 0;
      this.GetSearchSVCledgerData();
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetSVCledgerData()
    },

    GetSearchSVCledgerData() {

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
          'url': apiUrl.api_url + 'svcledgersearchmaster',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          var data = [];
          result.data.data.rows.forEach(function (searchData) {

            let date = new Date(searchData.bankdepositdate);

            if(searchData.DepositType==1){ searchData.DepositType = 'Bank Deposit'; }
            else if(searchData.DepositType==2){ searchData.DepositType = 'CMS Deposit'; }
            else{ searchData.DepositType = 'NEFT/ Other Deposit'; }

            if(searchData.statusid==1){ searchData.statusid = 'Open'; }
            else if(searchData.statusid==6){ searchData.statusid = 'Close'; }
            else { searchData.statusid = ' '; }

            data.push({
              depositdate: date.toISOString().slice(0,10),
              openingbalance: searchData.openingbalance,
              codamount: searchData.codamount,
              bankdeposit: searchData.bankdeposit,
              actualrecamt: searchData.bankdeposit,
              discrepancyamt: searchData.codamount-searchData.bankdeposit,
              balanceoutstanding: searchData.differenceamount,
              status: searchData.statusid,
              deposittype: searchData.DepositType,
              bank: searchData.Bank,
              reason: searchData.Reason,
              finreason: searchData.finReason,
            });
          });

          this.listSearchSVCledgerData = data;
          this.isLoading = false;
          let totalRows     = result.data.data.count;
          this.resultCount  = result.data.data.count;
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

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.GetSearchSVCledgerData();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
