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
            ClientId: [],
            // ClientIdnew: '',
            ClientList: [],
            listCODPaymentData: [],
            SearchClientIds: [],
            SearchClientAccountIds : [],
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
            // ClientAccountListGenerateReport: [],
            allclientwise: 1,
            selected: 'allclient',
            options: [{
                    text: 'All Client',
                    value: 'allclient'
                },
                {
                    text: 'Client Wise',
                    value: 'clientwise'
                },
                {
                    text: 'Generate Report',
                    value: 'paymentcsv'
                }
            ],
            allclientdata: [],
            message: '',
        }
    },

    computed: {

    },

    mounted() {
        var date = new Date();

        // this.getCleintWithAccountNameForGenerateReport();
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
        changeRadio(ele) {
            this.listCODPaymentData = [];
            this.resultCount = 0;
            this.allclientdata = [];
            this.exportf = false;
            $(".labelcls").html('');
            if (this.selected == 'allclient') {
                $(".labelcls").html('Transaction From Date');
                this.allclientwise = 1;
                this.listCODPaymentData = [];
            } else if (this.selected == 'clientwise') {
                $(".labelcls").html('Transaction From Date');
                this.allclientwise = 2;
            } else if (this.selected == 'paymentcsv') {
                $(".labelcls").html('Remittance Date*');
                this.allclientwise = 3;
            }
        },
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

        multiple() {
            let key = this.ClientId.length - 1;

            if (this.ClientId.length > 0 && this.ClientId[key].AccountId == 0) {

                this.SearchClientIds = [];
                this.SearchClientAccountIds = [];
                this.ClientId = this.ClientId[key];

                // for (let item of this.ClientAccountList) {

                //     if (item.AccountId != 0) {
                //         this.SearchClientAccountIds.push(item.AccountId);
                //         this.SearchClientIds.push(item.ClientId);
                //     }
                // }

            }

            if (this.ClientId.AccountId == 0) {
                return false;
            } else {
                this.SearchClientIds = [];
                return true;
            }
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
            this.allclientdata = [];
            this.listCODPaymentData = [];
            console.log("clientids",this.ClientId);
            this.message = '';

            let cData = [];
            let accountData = [];

            if (this.SearchClientIds.length > 0) {
                cData = this.SearchClientIds;
                accountData = this.SearchClientAccountIds;
            } else {

                if (this.ClientId.AccountName !== "All Client") {

                    if ($.isArray(this.ClientId) === false) {
                        this.ClientId = new Array(this.ClientId);
                    }
                    this.ClientId.forEach(function(val) {
                        accountData.push(val.AccountId);
                        cData.push(val.ClientId);
                    });
                }

            }
            // console.log("")
            if (this.selected == 'paymentcsv') {

                this.input = ({
                    username: this.createdby
                });
                if (this.fromDate) {
                    this.input.RemittanceDate = this.fromDate;
                   
                    this.input.excludeAccountIds = accountData;
                    // this.input.excludeAccountIds = this.ClientAccountList.AccountId
                }

                axios({
                        method: 'POST',
                        'url': apiUrl.api_url + 'exportcodpaymentcsv',
                        data: this.input,
                        headers: {
                            'Authorization': 'Bearer ' + this.myStr
                        }
                    })
                    .then(result => {
                        $(".text-danger").html("");

                        if (result.data.code == 200) {
                            this.message = result.data.message;
                            this.isLoading = false;

                        } else {
                            this.message = result.data.message;
                            this.listCODPaymentData = [];
                            this.resultCount = 0;
                            this.isLoading = false;
                        }

                    }, error => {
                        console.error(error)
                        this.$alertify.error('Error Occured');
                    });


            } else if (this.selected == 'allclient') {

                this.input = ({
                    username: this.createdby
                });
                if (this.fromDate) {
                    this.input.TranscationFromDate = this.fromDate;
                }
                if (this.toDate) {
                    this.input.TranscationToDate = this.toDate;
                }
                this.input.offset = this.pageno;
                this.input.limit = 10;

                axios({
                        method: 'POST',
                        'url': apiUrl.api_url + 'getdailypaymentreport',
                        data: this.input,
                        headers: {
                            'Authorization': 'Bearer ' + this.myStr
                        }
                    })
                    .then(result => {
                        $(".text-danger").html("");
                        if (result.data.code == 200) {
                            this.allclientdata = result.data.dailysummary;
                            this.isLoading = false;

                            let totalRows = result.data.dailysummary.length;
                            this.resultCount = result.data.dailysummary.length;
                            if (totalRows < 10) {
                                this.pagecount = 1
                            } else {
                                this.pagecount = Math.ceil(totalRows / 10)
                            }
                            this.exportf = true;
                        } else {
                            this.listCODPaymentData = [];
                            this.resultCount = 0;
                            this.isLoading = false;
                        }
                    }, error => {
                        console.error(error)
                        this.$alertify.error('Error Occured');
                    });

            } else {
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
                    });
            }
        },

        exportCODPaymentData() {
            this.reportlink = '';
            if (this.selected == 'allclient') {

            } else {
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
                    });
            }
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
            this.$validator.validateAll().then((result) => {
                if (result) {
                    let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    this.resultCount = 0;
                    this.pagecount = 1;
                    this.pageno = 0;
                    this.exportf = false;
                    if (this.fromDate > this.toDate && this.selected !== 'paymentcsv') {
                        document.getElementById("fdate").innerHTML = "From date should not be greater than To date.";
                        return false;
                    } else if (diffDays > 30 && this.selected !== 'paymentcsv') {
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
            this.allclientwise = 1;
            this.selected = 'allclient';
            this.pageno = this.resultCount = 0;
            this.listCODPaymentData = [];
            this.fromDate = this.toDate = '';
            this.exportf = false;
            this.$validator.reset();
            this.errors.clear();

        },
    }
}
