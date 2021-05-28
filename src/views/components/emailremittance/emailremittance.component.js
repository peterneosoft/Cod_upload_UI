import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import moment from 'moment';

export default {
  name: 'E-MailRemittance',
  components: {
    Paginate,
    VueElementLoading
  },

  data() {
    return {
      localusername: 0,
      resultCount: 0,
      pagecount: 0,
      pageno: 0,
      count: 0,
      isLoading: false,
      listEmailRemittanceData: [],
      ClientArr: [],
      checkAll: false,
      currentdate: '',
      modalShow: false,
      isSent: false,
      disableButton: true,
      fromDate: '',
      toDate: '',
      options: [],
      selected: '',
      newCheckRecord: []
    }
  },

  computed: {},

  mounted() {
    this.checkAll = false;
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail = JSON.parse(plaintext);
    this.localuserid = userdetail.username;
    var userToken = window.localStorage.getItem('accessuserToken');
    this.myStr = userToken.replace(/"/g, '');

    var date = new Date();
    this.currentdate = date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    //this.getEmailRemittanceClients();
  },

  methods: {
    format_date(value) {
      if (value) {
        return moment(String(value)).format('DD/MM/YYYY')
      }
    },

    setid(name, key) {
      return name + key;
    },

    showModal() {

      this.modalShow = true;


    },

    closeModal(elem) {
      this.modalShow = false;

      if (elem === true) {

        if (this.newCheckRecord.length === 0) {
          this.$alertify.error('Select at least one checkbox.');
        } else {
          this.emailRemittance();
        }

      } else {
        return false;
      }
    },
    checks() {

      this.ClientArr = [];
      if ($("#checkall").prop('checked') == true) {
        // if (this.checkAll) {
        for (let i in this.listEmailRemittanceData) {
          this.ClientArr.push(this.listEmailRemittanceData[i].clientremittedid);
        }
        this.disableButton = false;
      } else {
        this.disableButton = true;
      }
    },
    check() {

      // this.checkAll = !this.checkAll;
      this.ClientArr = [];
      this.newCheckRecord = [];
      // if (this.checkAll) {
      if ($("#checkall").prop('checked') == true) {
        this.checkAll = true;
        for (let i in this.listEmailRemittanceData) {

          this.ClientArr.push(this.listEmailRemittanceData[i].clientremittedid);

          let tempArray = {};

          tempArray = {
            AccountId: this.listEmailRemittanceData[i].AccountId,
            ClientId: this.listEmailRemittanceData[i].ClientId,
            CompanyName: this.listEmailRemittanceData[i].CompanyName,
            RemittanceDate: this.listEmailRemittanceData[i].transactiondate,
            Cycle: this.listEmailRemittanceData[i].Cycle,
            UTRNo: this.listEmailRemittanceData[i].UTRNo,
            RemittanceAmount: this.listEmailRemittanceData[i].PaidAmount,
            EmailId: this.listEmailRemittanceData[i].EmailId,
            filepath: this.listEmailRemittanceData[i].filepath,
          }

          this.newCheckRecord.push(tempArray);

        }

        this.disableButton = false;
      } else {
        this.checkAll = false;
        this.newCheckRecord = [];
        this.disableButton = true;
      }
    },
    updateCheck(data) {

      if (this.listEmailRemittanceData.length == this.ClientArr.length) {
        this.checkAll = true;
      } else {
        this.checkAll = false;
      }

      if (this.ClientArr.length > 0) {
        let tempArray = {};

        if (this.checkAll == false) {
          if ($("#ClientId" + data.clientremittedid).prop('checked') == true) {

            tempArray = {
              AccountId: data.AccountId,
              ClientId: data.ClientId,
              CompanyName: data.CompanyName,
              RemittanceDate: data.transactiondate,
              Cycle: data.Cycle,
              UTRNo: data.UTRNo,
              RemittanceAmount: data.PaidAmount,
              EmailId: data.EmailId,
              filepath: data.filepath,
            }
            this.newCheckRecord.push(tempArray);
          }

          if ($("#ClientId" + data.clientremittedid).prop('checked') == false) {
            this.deleteRow(this.newCheckRecord, data.clientremittedid);
          }

        }
        this.disableButton = false;

      } else {
        this.newCheckRecord = [];
        this.disableButton = true;
      }
    },
    deleteRow(items, match) {
      let arr = [];
      this.newCheckRecord = [];

      for (var i = 0; i < items.length; i++) {
        if (items[i]['ClientId'] !== match) {

          let tempArray = {
            AccountId: items[i]['AccountId'],
            ClientId: items[i]['ClientId'],
            CompanyName: items[i]['CompanyName'],
            RemittanceDate: items[i]['transactiondate'],
            Cycle: items[i]['Cycle'],
            UTRNo: items[i]['UTRNo'],
            RemittanceAmount: items[i]['PaidAmount'],
            EmailId: items[i]['EmailId'],
            filepath: items[i]['filepath'],
          }
          this.newCheckRecord.push(tempArray);
        }
      }
      return 1;
    },
    getEmailRemittanceClients() {
      this.isLoading = true;
      this.isSent = false;
      //url: apiUrl.api_url + 'emailremittanceclients?CreatedBy='+this.localuserid+'&RemittanceDate='+this.currentdate+'&offset='+this.pageno+'&limit='+20,
      //emailremittanceclients

      this.input = ({
        username: this.localuserid
      });

      if (this.fromDate) {
        this.input.TransactionFromDate = this.fromDate;
      }
      if (this.toDate) {
        this.input.TransactionToDate = this.toDate;
      }

      this.input.offset = this.pageno;
      this.input.limit = 10;

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'emailremittanceclients',
          data: this.input,
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          if (result.data.code == 200) {
            this.isLoading = false;
            this.isSent = true;
            this.listEmailRemittanceData = result.data.data;
            this.resultCount = result.data.count;
            let totalRows = result.data.count;
            if (totalRows < 20) {
              this.pagecount = 1
            } else {
              this.pagecount = Math.ceil(totalRows / 20)
            }
          } else {
            this.listEmailRemittanceData = [];
            this.resultCount = 0;
            this.isLoading = false;
            this.isSent = false;
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
          this.isSent = false;
        })
    },

    emailRemittance() {
      this.isLoading = true;

      this.newCheckRecord;
      this.input = ({
        emailArray: this.newCheckRecord,
        username: this.localuserid
      });

      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'SendMailRemittanceReport',
        'data': this.input,
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      }).then(result => {

        if (result.data.code == 200) {

          this.$alertify.success(result.data.msg);
          this.ClientArr = [];
          this.checkAll = false;
          this.getEmailRemittanceClients();
        } else {

          this.isLoading = false;
          this.$alertify.error(result.data.msg)
        }
      }, error => {
        this.isLoading = false;
        this.$alertify.error('Error Occured');
      })
    },

    //to get pagination
    getPaginationData(pageNum) {
      this.pageno = (pageNum - 1) * 20;
      this.listEmailRemittanceData = [];
      this.ClientArr = [];
      this.checkAll = false;
      this.disableButton = true;
      this.getEmailRemittanceClients();
    },
    onSubmit: function(event) {
      this.checkAll = false;
      this.listEmailRemittanceData = this.newCheckRecord = [];
      this.ClientArr = [];
      this.resultCount = 0;
      this.pagecount = 1;
      this.disableButton = true;
      $('.checkedChild').removeAttr('checked');
      this.$validator.validateAll().then(() => {
        this.pageno = 0;
        this.exportf = false;
        if (this.fromDate && this.toDate) {
          this.getEmailRemittanceClients(event);
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },
    resetForm() {
      this.resultCount = 0;
      this.pagecount = 1;
      this.fromDate = this.toDate = '';
      this.ClientId = "";
      this.pageno = this.resultCount = 0;
      this.listEmailRemittanceData = [];
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
