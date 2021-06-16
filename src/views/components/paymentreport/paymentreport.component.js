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

export default {
    name: 'paymentreport',
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
            reportlink: '',
            ClientAccountList: [],
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

        this.GetClientData();
        this.getCleintWithAccountName();
    },

    methods: {
        getCleintWithAccountName() {
            this.clientLoading = true;
            this.ClientAccountList = [];

            this.input = ({
                username: this.createdby
            })

            axios({
                method: 'POST',
                url: `${apiUrl.api_url}getclientaccountlist`,
                data: this.input,
                headers: {
                    Authorization: `Bearer ${this.myStr}`
                }
            }).then(result => {
                this.isLoading = false;
                this.clientLoading = false;

                if (result.data.code == 200) {
                    let clientAccountList = result.data.clientArr;

                    let newTempArray = [];
                    clientAccountList.forEach((list, k) => {
                        let temp = {};
                        if (list.AccountName && list.AccountName !== undefined && list.AccountName !== "undefined") {
                            temp.AccountId = list.AccountId;
                            temp.ClientId = list.ClientId;
                            temp.AccountName = list.AccountName;
                            newTempArray.push(temp);
                        }
                    });

                    this.ClientAccountList = newTempArray;
                } else {
                    this.ClientAccountList = [];
                }
            }, error => {
                this.clientLoading = false;
                console.error(error)
            })
        },
        GetClientData() {
            this.clientLoading = true;
            axios({
                method: 'GET',
                url: apiUrl.api_url + 'external/getclientlist',
                data: {},
                headers: {
                    'Authorization': 'Bearer ' + this.myStr
                }
            }).then(result => {
                this.clientLoading = false;
                this.ClientList = result.data.clients.data;
            }, error => {
                this.clientLoading = false;
                console.error(error)
            })
        },

        getPaginationData(pageNum) {
            this.pageno = (pageNum - 1) * 10
            this.GetCODPaymentData();
        },

        GetCODPaymentData(event) {
            $(".text-danger").html("");
            this.isLoading = true;

            axios({
                    method: 'GET',
                    'url': apiUrl.api_url + 'codpaymentdetailsmaster?ClientId=' + this.ClientId.ClientId + '&AccountId=' + this.ClientId.AccountId + '&Company=' + this.ClientId.AccountName + '&offset=' + this.pageno + '&limit=10&fromDate=' + this.fromDate + '&toDate=' + this.toDate + '&createdby=' + this.createdby,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    $(".text-danger").html("");
                    if (result.data.code == 200) {
                        this.listCODPaymentData = result.data.data;
                        this.isLoading = false;

                        let totalRows = result.data.count;
                        this.resultCount = result.data.count;
                        if (totalRows < 10) {
                            this.pagecount = 1
                        } else {
                            this.pagecount = Math.ceil(totalRows / 10)
                        }
                        // this.exportCODPaymentData();
                        this.exportf = true;
                    } else {
                        this.listCODPaymentData = [];
                        this.resultCount = 0;
                        this.isLoading = false;
                    }
                }, error => {
                    console.error(error)
                    this.$alertify.error('Error Occured');
                })
        },

        exportCODPaymentData() {
            this.reportlink = '';

            axios({
                    method: 'GET',
                    'url': apiUrl.api_url + 'exportcodpaymentreport?ClientId=' + this.ClientId.ClientId + '&AccountId=' + this.ClientId.AccountId + '&Company=' + this.ClientId.AccountName + '&fromDate=' + this.fromDate + '&toDate=' + this.toDate + '&createdby=' + this.createdby,
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
            $(".text-danger").html("");
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
            $(".text-danger").html("");
            this.$validator.validateAll().then((result) => {
                if (result) {
                    let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    this.resultCount = 0;
                    this.pagecount = 1;
                    this.pageno = 0;
                    this.exportf = false;
                    if (this.fromDate > this.toDate) {
                        document.getElementById("fdate").innerHTML = "From date should not be greater than To date.";
                        return false;
                    } else if (diffDays > 30) {
                        document.getElementById("fdate").innerHTML = "Difference between From date & To date should not be greater than 30 days.";
                        return false;
                    } else {
                        this.GetCODPaymentData(event);
                    }
                }
            }).catch(() => {
                console.log('errors exist', this.errors)
            });
        },

        resetForm() {
            $(".text-danger").html("");
            this.ClientId = "";
            this.pagecount = 1;
            this.pageno = this.resultCount = 0;
            this.listCODPaymentData = [];
            this.fromDate = this.toDate = '';
            this.exportf = false;
            this.$validator.reset();
            this.errors.clear();
        },
    }
}
