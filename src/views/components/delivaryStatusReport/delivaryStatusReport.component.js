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
    name: 'delivaryStatusReport',
    components: {
        Multiselect,
        Paginate,
        VueElementLoading
    },
    props: [],

    data() {
        return {
            fromDate: "",
            toDate: "",
            myStr: "",
            ClientId: [],
            ClientList: [],
            SearchClientIds: [],
            SearchClientAccountIds: [],
            selected: '',
            options: [],
            value: null,
            optionss: ['list', 'of', 'options'],
            listCODRemitanceData: [],
            listCODPaymentData: [],
            resultCountException: 0,
            pageno: 0,
            resultCountDate: 0,
            pagecount: 0,
            isLoading: false,
            DisputeArr: [],
            resultCount: '',
            localhubid: '',
            localhubname: '',
            exportf: false,
            excelLoading: false,
            clientLoading: false,
            ReasonModalShow: false,
            reportlink: '',
            totalSum: 0,
            total: 0,
            isexport: false,
            filename: '',
            ClientAccountList: [],
        }
    },

    computed: {

    },

    mounted() {
        var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
        var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        var userdetail = JSON.parse(plaintext);
        this.localuserid = userdetail.username;

        var date = new Date();
        toDate.max = fromDate.max = date.toLocaleDateString('fr-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        var userToken = window.localStorage.getItem('accessuserToken')
        this.myStr = userToken.replace(/"/g, '');
        this.getCleintWithAccountName();
    },

    methods: {
        format_date(value) {
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY');
            }
        },
        closeModal() {
            this.ReasonModalShow = false;
        },
        /**
         * show awb and amount in popup
         * @param {*} ele
         */
        showReasonAWBNo(ele) {
            this.DisputeArr = [];
            this.DisputeArr = ele;

            this.total = 0;
            this.totalSum = this.DisputeArr.reduce(function(total, item) {
                return total = total + parseInt(item.Amount);
            }, 0);

            this.$refs.myReasonModalRef.show();
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

        /**
         * new client name with account list data
         */

        getCleintWithAccountName() {
            this.clientLoading = true;
            this.ClientAccountList = [];

            this.input = ({
                username: this.localuserid
            })

            axios({
                method: 'POST',
                url: `${apiUrl.api_url}getclientaccountlist`,
                data: this.input,
                headers: {
                    Authorization: `Bearer ${this.myStr}`
                }
            }).then(result => {

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
                    this.ClientAccountList = [{
                        AccountId: '0',
                        AccountName: 'All Client'
                    }].concat(newTempArray);
                } else {
                    this.ClientAccountList = [];
                }

            }, error => {
                this.clientLoading = false;
                console.error(error)
            })
        },

        exportreport() {
            this.excelLoading = true;
            this.isexport = true;
            this.GetCODRemittanceDetailsDataTemp();
            if (this.reportlink) {
                window.open(this.reportlink);
                this.excelLoading = false;
            } else {
                this.excelLoading = false;
            }
        },
        getPaginationData(pageNum) {
            this.pageno = (pageNum - 1) * 10;
            this.isexport = false;
            this.GetCODRemittanceDetailsData();
        },
        GetCODRemittanceDetailsData(event) {
            this.isexport = false;
            this.GetCODRemittanceDetailsDataTemp(event);
        },

        GetCODRemittanceDetailsDataTemp(event) {

            this.$validator.validateAll().then((result) => {

                if (result) {

                    let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    let checkDate = 0;
                    let newDaysdiff = 0;
                    if (this.ClientId.AccountName !== "All Client") {
                        checkDate = 30;
                        newDaysdiff = 30;

                    } else {
                        checkDate = 0;
                        newDaysdiff = 1;
                    }

                    if (diffDays > checkDate) {
                        document.getElementById("fdate").innerHTML = "Difference between From date & To date should not be greater than " + newDaysdiff + " days.";
                        return false;
                    } else if (this.fromDate > this.toDate) {
                        document.getElementById("fdate").innerHTML = "From date should not be greater than To date.";
                        return false;
                    } else {
                        document.getElementById("fdate").innerHTML = "";
                    }


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

                    this.input = ({
                        username: this.localuserid
                    });

                    if (accountData) {
                        this.input.AccountId = accountData
                    }
                    // if (cData) {
                    //     this.input.ClientId = cData
                    // }

                    this.input.isexport = this.isexport;

                    if (this.fromDate) {
                        this.input.DeliveryFromDate = this.fromDate;
                    }

                    if (this.toDate) {
                        this.input.DeliveryToDate = this.toDate;
                    }
                    this.input.offset = this.pageno;
                    this.input.limit = 10;

                    this.isLoading = true;
                    axios({
                            method: 'POST',
                            'url': `${apiUrl.api_url}getDeliveryStatusReport`,
                            'data': this.input,
                            headers: {
                                'Authorization': 'Bearer ' + this.myStr
                            }
                        })
                        .then(result => {

                            this.resultCountDate = 0;

                            if (result.data.code == 200) {

                                if (this.isexport === false) {

                                    this.listCODRemitanceData = [];
                                    this.listCODRemitanceData = result.data.shipmentArr;
                                    this.isLoading = false;

                                    let totalRows = result.data.count;
                                    this.resultCount = result.data.count;
                                    if (totalRows < 10) {
                                        this.pagecount = 1
                                    } else {
                                        this.pagecount = Math.ceil(totalRows / 10)
                                    }
                                    this.exportf = true;
                                }

                                /**
                                 * excel download
                                 * @param  {[type]} this [description]
                                 * @return {[type]}      [description]
                                 */

                                if (this.isexport === true) {

                                    this.isLoading = true;

                                    if (result.data.shipmentArr.length > 0) {
                                        let fetchResult = result.data.shipmentArr;
                                        let newResult = [];
                                        fetchResult.forEach((item, i) => {
                                            let testTemp = {};
                                            testTemp.companyname = item.companyname;
                                            testTemp.parentcompanyname = item.parentcompanyname;
                                            testTemp.Status = item.Status;
                                            testTemp.ShippingID = item.ShippingID;
                                            testTemp.POID = item.POID;
                                            testTemp.ServiceType = item.ServiceType;
                                            testTemp.PaymentType = item.PaymentType;
                                            testTemp.PaymentMode = item.PaymentMode;
                                            testTemp.NetPayment = item.NetPayment;
                                            testTemp.ShippingDate = this.format_date(item.ShippingDate);
                                            testTemp.InScanDate = this.format_date(item.InScanDate);
                                            testTemp.DeliveryDate = this.format_date(item.DeliveryDate);
                                            testTemp.DestinationHubName = item.DestinationHubName;
                                            newResult.push(testTemp);
                                        });
                                        this.filename = 'delivaryStatusReport';
                                        this.getDownloadCsvObject(newResult);
                                    } else {
                                        this.$alertify.error('Sorry..! no record found for excel download.');
                                    }
                                }
                                // this.exportCODRemittanceDetailsData();
                            } else {
                                this.listCODRemitanceData = [];
                                this.resultCount = 0;
                                this.isLoading = false;
                            }
                        }, error => {
                            console.error(error)
                            this.$alertify.error('Error Occured');
                        })
                }
            });
        },

        exportToExcel() {
            this.$validator.validateAll().then((result) => {

                if (result) {

                    let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    let checkDate = 0;
                    let newDaysdiff = 0;
                    if (this.ClientId.AccountName !== "All Client") {
                        checkDate = 30;
                        newDaysdiff = 30;

                    } else {
                        checkDate = 0;
                        newDaysdiff = 1;
                    }

                    if (diffDays > checkDate) {
                        document.getElementById("fdate").innerHTML = "Difference between From date & To date should not be greater than " + newDaysdiff + " days.";
                        return false;
                    } else if (this.fromDate > this.toDate) {
                        document.getElementById("fdate").innerHTML = "From date should not be greater than To date.";
                        return false;
                    } else {
                        document.getElementById("fdate").innerHTML = "";
                    }


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

                    this.input = ({
                        username: this.localuserid
                    });

                    if (accountData) {
                        this.input.AccountId = accountData
                    }


                    if (this.fromDate) {
                        this.input.DeliveryFromDate = this.fromDate;
                    }

                    if (this.toDate) {
                        this.input.DeliveryToDate = this.toDate;
                    }

                    this.isLoading = true;
                    axios({
                            method: 'POST',
                            'url': `${apiUrl.api_url}exportDeliveryStatusReport`,
                            'data': this.input,
                            headers: {
                                'Authorization': 'Bearer ' + this.myStr
                            }
                        })
                        .then(result => {
                            this.isLoading = false;
                            if (result.data.code == 200) {
                                window.open(result.data.data);
                            } else {
                                this.isLoading = false;
                            }
                        }, error => {
                            console.error(error)
                            this.$alertify.error('Error Occured');
                        });
                }
            });
        },
        /**
         * download csv file
         * @param  {[type]} csvData [description]
         * @return {[type]}         [description]
         */
        getDownloadCsvObject(csvData) {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            var today = dd + "" + mm + "" + yyyy;
            var data, filename, link;
            filename = this.filename + today + ".csv";
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
            // link.removeChild(link);
        },
        convertArrayOfObjectsToCSV: function(args) {
            this.isLoading = false;
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
        },


        exportCODRemittanceDetailsData() {
            let cData = [];
            this.reportlink = '';
            if (this.SearchClientIds.length > 0) {
                cData = this.SearchClientIds;
            } else {
                if ($.isArray(this.ClientId) === false) {
                    this.ClientId = new Array(this.ClientId);
                }

                this.ClientId.forEach(function(val) {
                    cData.push(val.AccountId);
                    cData.push(val.ClientId);
                });
            }

            axios({
                    method: 'GET',
                    'url': apiUrl.api_url + 'exportCODRemittanceDetailsReport?AccountId=' + cData + '&fromDate=' + this.fromDate + '&toDate=' + this.toDate + '&search=' + this.selected,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    if (result.data.code == 200) {
                        // this.getDownloadCsvObject(result.data.data);
                        this.exportf = true;
                        this.reportlink = result.data.data;
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

        onSubmit: function(event) {
            this.$validator.validateAll().then(() => {
                this.pageno = 0;
                this.exportf = false;
                this.resultCount = 0;
                this.listCODRemitanceData = [];
                this.pagecount = 1;
                if (this.fromDate && this.toDate) {
                    /**
                     * Delivary date search call
                     */
                    this.GetCODRemittanceDetailsData(event);
                }
            }).catch(() => {
                console.log('errors exist', this.errors)
            });
        },

        resetForm() {

            this.resultCountDate = this.resultCount = this.resultCountException = 0;
            this.fromDate = this.toDate = '';
            this.ClientId = "";
            document.getElementById("fdate").innerHTML = "";
            $("input[value='TransactionDate']").attr("checked", true);
            this.pageno = this.resultCount = this.resultCountException = 0;
            this.listCODRemitanceData = [];
            this.exportf = false;
            this.isexport = false;
            this.$validator.reset();
            this.errors.clear();
        },
    }
}
