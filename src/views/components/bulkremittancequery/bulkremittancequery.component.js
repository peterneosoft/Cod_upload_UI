import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import moment from 'moment';

export default {
  name: 'bulkremittancequery',
  components: {
    Multiselect,
    Paginate,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      myStr: '',
      fromDate: '',
      toDate: '',
      ClientId: '',
      ClientList: [],
      listCODPaymentData: [],
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: '',
      createdby: '',
      exportf: false,
      excelLoading: false,
      clientLoading: false,
      submitLoading: false,
      reportlink: '',
      shipmentid: '',
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();


    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail = JSON.parse(plaintext);
    this.createdby = userdetail.username;
  },

  methods: {
    format_date(value) {
      if (value) {
        return moment(String(value)).format('DD/MM/YYYY');
      }
    },

    getPaginationData(pageNum) {
      this.pageno = (pageNum - 1) * 10
      this.GetCODPaymentData();
    },

    GetCODPaymentData(event) {

      this.isLoading = true;

      this.pageno = 0;

      if (/\s/g.test(this.shipmentid) == true || this.shipmentid.indexOf(',') > -1) {
        this.shipmentid = this.shipmentid.replace(/"|'| |,\s*$/g, '').split(',');
      }

      if (Array.isArray(this.shipmentid) == false) {
        this.shipmentid = new Array(this.shipmentid);
      }

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'get-bulk-remittance-query',
          'data': ({
            ShippingID: this.shipmentid
          }),
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          this.isLoading = false;

          if (result.data.code == 200) {
            this.listCODPaymentData = result.data.shipmentArr;
            this.isLoading = false;

            let totalRows = result.data.shipmentArr.length;
            this.resultCount = result.data.shipmentArr.length;

            if (totalRows < 10) {
              this.pagecount = 1;
            } else {
              this.pagecount = Math.ceil(totalRows / 10);
            }

            this.exportf = false;
          } else {
            this.listCODPaymentData = [];
            this.resultCount = 0;
            this.isLoading = false;
          }
        }, error => {
          console.error(error);
          this.$alertify.error('Error Occured');
        })
    },

    exportCODPaymentData() {
      this.reportlink = '';

      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'exportcodpaymentreport?ClientId=' + this.ClientId.ClientMasterID + '&Company=' + this.ClientId.CompanyName + '&fromDate=' + this.fromDate + '&toDate=' + this.toDate + '&createdby=' + this.createdby,
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          if (result.data.code == 200) {
            // this.getDownloadCsvObject(result.data.data);
            this.exportf = true;
            this.reportlink = result.data.data;
            this.exportreport();
          } else {
            this.exportf = false;
            this.reportlink = '';
          }
        }, error => {
          this.exportf = false;
          this.reportlink = '';
          console.error(error)
        })
    },

    exportreport() {
      this.excelLoading = true;
      if (this.reportlink) {
        window.open(this.reportlink);
        this.excelLoading = false;
      } else {
        this.excelLoading = false;
      }
    },

    /** getDownloadCsvObject(csvData) {
      var today   = new Date();
      var dd      = today.getDate();
      var mm      = today.getMonth() + 1;
      var yyyy    = today.getFullYear();
      var today   = dd + "" + mm + "" + yyyy;
      var data, filename, link;
      filename = "CODPaymentReport_" + today + ".csv";
      var csv = this.convertArrayOfObjectsToCSV({
        data: csvData
      });
      if (csv == null) return;
      filename = filename || "export.csv";
      if (!csv.match(/^data:text\/csv/i)) {
        csv = "data:text/csv;charset=utf-8," + csv;
      }
      data = encodeURI(csv);
      link = document.createElement("a");
      link.setAttribute("href", data);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.removeChild(link);
    },

    convertArrayOfObjectsToCSV: function(args) {
      var result, ctr, keys, columnDelimiter, lineDelimiter, data;
      data = args.data || null;
      if (data == null || !data.length) {
        return null;
      }
      columnDelimiter = args.columnDelimiter || ",";
      lineDelimiter = args.lineDelimiter || "\n";
      keys = Object.keys(data[0]).slice(0);
      result = "";
      result += keys.join(columnDelimiter);
      result += lineDelimiter;
      data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
          if (ctr > 0) result += columnDelimiter;
          if (item[key] != null) {
            result += '"' + item[key] + '"';
          }
          ctr++;
        });
        result += lineDelimiter;
      });
      this.excelLoading = false;
      return result;
    }, **/

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if (result) {

          if (/\s/g.test(this.shipmentid) == true || this.shipmentid.indexOf(',') > -1) {
            this.shipmentid = this.shipmentid.replace(/"|'| |,\s*$/g, '').split(',');
          }
          if (Array.isArray(this.shipmentid) == false) {
            this.shipmentid = new Array(this.shipmentid);
          }

          this.GetCODPaymentData(event);
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.ClientId = "";
      this.pageno = this.resultCount = 0;
      this.listCODPaymentData = [];
      this.fromDate = this.toDate = '';
      this.exportf = false;
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
