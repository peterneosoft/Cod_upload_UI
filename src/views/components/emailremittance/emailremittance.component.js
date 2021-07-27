import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import {
    Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import Multiselect from 'vue-multiselect'
import VueElementLoading from 'vue-element-loading';
import moment from 'moment';

export default {
    name: 'E-MailRemittance',
    components: {
        Multiselect,
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
            newCheckRecord: [],
            ClientAccountList: [],
            ClientId: [],
            ClientList: [],
            SearchClientIds: [],
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
        this.getCleintWithAccountName();
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
                    if (this.listEmailRemittanceData[i].filepath) {
                        tempArray = {
                            AccountId: this.listEmailRemittanceData[i].AccountId,
                            ClientId: this.listEmailRemittanceData[i].ClientId,
                            CompanyName: this.listEmailRemittanceData[i].CompanyName,
                            RemittanceDate: this.listEmailRemittanceData[i].transactiondate,
                            Cycle: (this.listEmailRemittanceData[i].Cycle ? this.listEmailRemittanceData[i].Cycle : ''),
                            UTRNo: (this.listEmailRemittanceData[i].UTRNo ? this.listEmailRemittanceData[i].UTRNo : ''),
                            RemittanceAmount: (this.listEmailRemittanceData[i].PaidAmount ? this.listEmailRemittanceData[i].PaidAmount : ''),
                            EmailId: (this.listEmailRemittanceData[i].EmailId ? this.listEmailRemittanceData[i].EmailId : ''),
                            filepath: (this.listEmailRemittanceData[i].filepath ? this.listEmailRemittanceData[i].filepath : ''),
                        }

                        this.newCheckRecord.push(tempArray);
                    }

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
                        if (data.filepath) {
                            tempArray = {
                                AccountId: data.AccountId,
                                ClientId: data.ClientId,
                                CompanyName: data.CompanyName,
                                RemittanceDate: data.transactiondate,
                                Cycle: (data.Cycle ? data.Cycle : ''),
                                UTRNo: (data.UTRNo ? data.UTRNo : ''),
                                RemittanceAmount: (data.PaidAmount ? data.PaidAmount : ''),
                                EmailId: (data.EmailId ? data.EmailId : ''),
                                filepath: (data.filepath ? data.filepath : ''),
                            }
                            this.newCheckRecord.push(tempArray);
                        }
                    }

                    if ($("#ClientId" + data.clientremittedid).prop('checked') == false) {
                        this.deleteRow(this.newCheckRecord, data.clientremittedid);
                    }

                }
                this.disableButton = false;

                let isSelected = [];

                $("input.checkedChild").each(function(index, element) {
                    if ($(this).is(":checked")) {
                        isSelected.push("true");
                    } else {
                        isSelected.push("false");
                    }
                });

                if ($.inArray("true", isSelected) < 0) {
                    this.disableButton = true;
                }

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
                    if (items[i]['filepath']) {
                        let tempArray = {
                            AccountId: items[i]['AccountId'],
                            ClientId: items[i]['ClientId'],
                            CompanyName: items[i]['CompanyName'],
                            RemittanceDate: items[i]['RemittanceDate'],
                            Cycle: (items[i]['Cycle'] ? items[i]['Cycle'] : ''),
                            UTRNo: (items[i]['UTRNo'] ? items[i]['UTRNo'] : ''),
                            RemittanceAmount: (items[i]['RemittanceAmount'] ? items[i]['RemittanceAmount'] : ''),
                            EmailId: (items[i]['EmailId'] ? items[i]['EmailId'] : ''),
                            filepath: (items[i]['filepath'] ? items[i]['filepath'] : '')
                        }

                        this.newCheckRecord.push(tempArray);
                    }
                }
            }

            return 1;
        },
        getEmailRemittanceClients() {
            this.isLoading = true;
            this.isSent = false;

            if ($.isArray(this.ClientId) === false) {
                this.ClientId = new Array(this.ClientId);
            }
            let accountData = [];
            if (this.SearchClientIds.length > 0) {
                accountData = this.SearchClientAccountIds;
            } else {
                this.ClientId.forEach(function(val) {
                    accountData.push(val.AccountId);
                });
            }

            this.input = ({
                username: this.localuserid
            });

            if (this.fromDate) {
                this.input.TransactionFromDate = this.fromDate;
            }
            if (this.toDate) {
                this.input.TransactionToDate = this.toDate;
            }
            if (accountData) {
                this.input.AccountId = accountData
            }
            this.input.offset = this.pageno;
            this.input.limit = 50;

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
                        if (totalRows < 50) {
                            this.pagecount = 1
                        } else {
                            this.pagecount = Math.ceil(totalRows / 50)
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
            this.disableButton = true;
            this.isLoading = true;
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
            this.pageno = (pageNum - 1) * 10;
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
            this.ClientId = [];
            this.pageno = this.resultCount = 0;
            this.listEmailRemittanceData = [];
            this.$validator.reset();
            this.errors.clear();
        },
        multiple() {
            let key = this.ClientId.length - 1;

            if (this.ClientId.length > 0 && this.ClientId[key].AccountId == 0) {

                this.SearchClientIds = [];
                this.SearchClientAccountIds = [];
                this.ClientId = this.ClientId[key];

                for (let item of this.ClientAccountList) {

                    if (item.AccountId != 0) {
                        this.SearchClientAccountIds.push(item.AccountId);
                        this.SearchClientIds.push(item.ClientId);
                    }
                }

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
            this.isLoading = true;
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

                this.isLoading = false;
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
                this.isLoading = false;
                console.error(error)
            })
        },
    }
}
