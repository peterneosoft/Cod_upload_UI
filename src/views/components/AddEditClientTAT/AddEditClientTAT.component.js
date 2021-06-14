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
    name: 'AddEditClientTAT',
    components: {
        Paginate,
        Multiselect,
        VueElementLoading
    },
    data() {
        return {
            ClientList: [],
            ClientBusinessList: [],
            ClientAccountsList: [],
            AccountsDeatilsList: [],
            ClientId: "",
            ClientIds: "",
            Bussinesstype: "",
            Client: "",
            tat: "",
            type: "",
            cycle: "",
            emailid: "",
            Beneficiary: "",
            BankName: "",
            BankAccount: "",
            rtgs: "",
            ContactEmailid: "",
            AccountName: "",
            BeneficiaryName: "",
            BankName: "",
            myStr: "",
            BankAccount: "",
            AddEditClientTAT: 0,
            RemittanceDay: [],
            RemittanceDayList: [],
            pageno: 0,
            pagecount: 0,
            isLoading: false,
            resultCount: 0,
            listClientCODRemittanceData: [],
            submitLoading: false,
            clientLoading: false,
            businessLoading: false,
            accountLoading: false,
            bankDLoading: false,
            ClientAccountList: [],
            updateModal: false,
            editparams: '',
            editsection: 2,
            editRecord: 1,
            clientname: '',
            bussinessname: ',',
            accountname: '',
            ContactEmailidedit: '',
            rtgsedit: '',
            BankAccountedit: '',
            BankNameedit: '',
            Beneficiaryedit: '',
            ContactEmailidedit: '',
            tatedit: '',
            RemittanceDayedit: [],
            RemittanceDayListedit: [],
            typeedit: '',
            addformshow: 1,
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


        var userToken = window.localStorage.getItem('accessuserToken')
        this.myStr = userToken.replace(/"/g, '');
        this.GetClientData();
        this.searchClientCODRemittanceData();
        this.getCleintWithAccountName();
        this.RemittanceDayList = this.RemittanceDayListedit = [{
                day: "Daily"
            },
            {
                day: "Sunday"
            },
            {
                day: "Monday"
            },
            {
                day: "Tuesday"
            },
            {
                day: "Wednesday"
            },
            {
                day: "Thursday"
            },
            {
                day: "Friday"
            },
            {
                day: "Saturday"
            }
        ];
    },

    methods: {

        handleSelect(event) {
            if (event.day == 'Daily') {
                for (let item of this.RemittanceDayList) {
                    if (item.day != 'Daily' && this.RemittanceDay.some(obj => obj.day === item.day) === false) {
                        this.RemittanceDay.push(item);
                    }
                }
            }
        },
        handleSelectedit(event) {
            if (event.day == 'Daily') {
                for (let item of this.RemittanceDayListedit) {
                    if (item.day != 'Daily' && this.RemittanceDayedit.some(obj => obj.day === item.day) === false) {
                        this.RemittanceDayedit.push(item);
                    }
                }
            }
        },
        async getSVCRowData(data) {
            this.addformshow = 2;
            this.updateModal = true;
            this.$validator.reset();
            this.editsection = 1;
            this.errors.clear();
            this.editparams = '';

            this.Beneficiary = this.BankName = this.BankAccount = this.rtgs = '';

            let clientarr = [];
            if (data.ClientId != "") {
                clientarr.push({
                    "ClientMasterId": data.ClientId,
                    "CompanyName": data.CompanyName
                });
            }

            let dayarr = [];
            if (data.RemittanceDay.length >= 1) {
                data.RemittanceDay.forEach((d) => {
                    if (d != "") {
                        dayarr.push({
                            "day": d
                        });
                    }
                });
            }

            this.ClientCODRemmitanceId = data.ClientCODRemmitanceId;
            this.ClientIds = clientarr;
            this.RemittanceDayedit = dayarr;
            this.typeedit = data.RemittanceType;
            this.tatedit = data.tatno;

            this.ClientIds.ClientMasterID = data.ClientId;

            this.CId = data.ClientId;
            this.Bussinesstype = data.BussinessType;
            // await this.GetClientBusinessConfigList();
            //await this.GetClientBusinessAccounts();
            this.editRecord = 2;
            this.BType = data.BussinessType;
            this.AccountName = data.AccountId;
            this.ContactEmailidedit = "";
            this.ContactEmailidedit = data.CustomerMailId;
            // this.editparams = data.CustomerMailId;
            this.clientname = data.CompanyName;
            this.accountname = data.AccountName;
            this.BankAccountedit = data.ClientAccountNo ? data.ClientAccountNo : '';
            this.Beneficiaryedit = data.BeneficiaryName ? data.BeneficiaryName : '';
            this.BankNameedit = data.ClientBankName ? data.ClientBankName : '';
            this.rtgsedit = data.NEFTNo ? data.NEFTNo : '';
        },
        closeStatusRoleModal() {
            this.addformshow = 1;
            this.updateModal = false;
            this.editRecord = 1;
            this.addformshow = 1;
        },
        multiple() {
            return true;
        },

        async GetClientBusinessConfigList() {
            this.editparams = '';
            this.BankName = '';
            this.BankAccountNo = '';
            this.rtgs = '';
            this.Beneficiary = '';
            this.ContactEmailid = this.BankAccount = '';

            if (this.ClientId.ClientMasterID != this.CId) {
                this.Bussinesstype = this.AccountName = this.Beneficiary = this.BankName = this.BankAccount = this.rtgs = '';
            }

            if (this.ClientId.ClientMasterID == "") {
                return false;
            }
            this.businessLoading = true;
            this.input = ({
                clientid: this.ClientId.ClientMasterID
            })
            await axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'external/GetClientBusinessConfigList',
                    data: this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.businessLoading = false;
                    this.ClientBusinessList = result.data.client.data;
                }, error => {
                    this.businessLoading = false;
                    console.error(error)
                })
        },

        async GetClientBusinessAccounts() {
            if (this.Bussinesstype != this.BType) {
                this.AccountName = this.Beneficiary = this.BankName = this.BankAccount = this.rtgs = '';
            }

            if (this.Bussinesstype == "") {
                return false;
            }
            this.accountLoading = true;
            this.input = ({
                clientid: this.ClientId.ClientMasterID,
                businessid: parseInt(this.Bussinesstype)
            })
            await axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'external/GetClientBusinessAccountsList',
                    data: this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.accountLoading = false;
                    this.ClientAccountsList = result.data.Accounts.data;
                }, error => {
                    this.accountLoading = false;
                    console.error(error)
                })
        },
        async getAccountDetails() {
            this.editparams = "";
            this.editsection = 2;
            await this.getAccountDetailsTemp();
        },
        async getAccountDetailsTemp() {


            if (this.AccountName) {
                this.bankDLoading = true;
            }
            this.input = ({
                ClientBusinessAccountId: this.AccountName
            })
            await axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'external/getAccountDetails',
                    data: this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    if (result.data.code == 200) {
                        this.bankDLoading = false;
                        if (this.editparams == '') {
                            this.ContactEmailid = result.data.data.SecondaryEmailid;
                        } else {
                            this.ContactEmailid = this.editparams;
                        }
                        if (this.editRecord == 1) {
                            this.Beneficiary = result.data.data.BeneficiaryName;
                            this.BankName = result.data.data.ClientBankName;
                            this.BankAccount = result.data.data.ClientAccountNo;
                            this.rtgs = result.data.data.ClientBankNeftIFSC;
                        }
                    }
                    if (result.data.code == 204) {
                        this.Beneficiary = this.Beneficiary;
                        this.BankName = this.BankName;
                        this.BankAccount = this.BankAccount;
                        this.rtgs = this.rtgs;
                    }
                }, error => {
                    this.bankDLoading = false;
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
        saveClientCODRemittanceData(event) {

            let dData = [];
            this.RemittanceDay.forEach(function(val) {
                if (val.day != 'Daily') {
                    dData.push(val.day);
                }
            });
            this.submitLoading = true;

            if (this.ContactEmailid == null) {
                this.ContactEmailid = "";
            }

            this.input = ({
                ClientId: this.ClientId.ClientMasterID,
                RemittanceType: this.type,
                RemittanceDay: dData,
                TAT: this.tat,
                IsActive: true,
                HoldingAmount: 0,
                BussinessType: this.Bussinesstype,
                AccountId: this.AccountName,
                ContactEmailid: this.ContactEmailid,
                CreatedBy: this.localuserid,
                BeneficiaryName: this.Beneficiary,
                BankName: this.BankName,
                BankAccountNo: this.BankAccount,
                BankIFSC: this.rtgs,
                AccountName: $("#AccountName option:selected").text(),
            })
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'saveclientcodremittancedetail',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then((response) => {
                    if (response.data.errorCode == 0) {
                        this.submitLoading = false;
                        this.AddEditClientTAT = 0;
                        this.$alertify.success(response.data.msg);
                        this.resetForm(event);
                    } else if (response.data.errorCode == -1) {
                        this.submitLoading = false;
                        this.$alertify.error(response.data.msg)
                    }
                })
                .catch((httpException) => {
                    this.submitLoading = false;
                    console.error('exception is:::::::::', httpException)
                    this.$alertify.error('Error Occured');
                });
        },

        editClientCODRemittanceData(event) {

            let dData = [];
            this.RemittanceDay.forEach(function(val) {
                if (val.day != 'Daily') {
                    dData.push(val.day);
                }
            });
            this.submitLoading = true;

            if (this.ContactEmailid == null) {
                this.ContactEmailid = "";
            }

            if (this.editRecord == 2) {
                this.RemittanceDayedit.forEach(function(val) {
                    if (val.day != 'Daily') {
                        dData.push(val.day);
                    }
                });
                this.input = ({
                    ClientCODRemmitanceId: this.ClientCODRemmitanceId,
                    ClientId: this.ClientIds.ClientMasterID,
                    RemittanceType: this.typeedit,
                    RemittanceDay: dData,
                    TAT: this.tatedit,
                    IsActive: true,
                    HoldingAmount: 0,
                    BussinessType: this.Bussinesstype,
                    AccountId: this.AccountName,
                    ContactEmailid: this.ContactEmailidedit,
                    LastModifiedBy: this.localuserid,
                    BeneficiaryName: this.Beneficiaryedit,
                    BankName: this.BankNameedit,
                    BankAccountNo: this.BankAccountedit,
                    BankIFSC: this.rtgsedit,
                    AccountName: this.accountname,
                });
            } else {
                this.input = ({
                    ClientCODRemmitanceId: this.ClientCODRemmitanceId,
                    ClientId: this.ClientId.ClientMasterID,
                    RemittanceType: this.type,
                    RemittanceDay: dData,
                    TAT: this.tat,
                    IsActive: true,
                    HoldingAmount: 0,
                    BussinessType: this.Bussinesstype,
                    AccountId: this.AccountName,
                    ContactEmailid: this.ContactEmailid,
                    LastModifiedBy: this.localuserid,
                    BeneficiaryName: this.Beneficiary,
                    BankName: this.BankName,
                    BankAccountNo: this.BankAccount,
                    BankIFSC: this.rtgs,
                    AccountName: $("#AccountName option:selected").text(),
                });
            }


            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'editclientcodremittancedetail',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then((response) => {
                    this.resetForm(event);
                    this.addformshow = 1;
                    if (response.data.errorCode == 0) {

                        this.$alertify.success(response.data.msg);

                        if (this.editRecord == 2) {
                            this.updateModal = false;

                        }
                        this.submitLoading = false;
                        this.AddEditClientTAT = 0;
                        this.searchClientCODRemittanceData(event);
                    } else if (response.data.errorCode == -1) {
                        this.submitLoading = false;
                        this.$alertify.error(response.data.msg)
                    }
                })
                .catch((httpException) => {
                    this.submitLoading = false;
                    console.error('exception is:::::::::', httpException)
                    this.$alertify.error('Error Occured');
                });
        },

        searchClientCODRemittanceData(event) {
            this.isLoading = true;
            this.AddEditClientTAT = false;

            let clientid = this.Client.ClientId ? this.Client.ClientId : 0;
            let AccountId = this.Client.AccountId ? this.Client.AccountId : 0;
            axios({
                    method: 'GET',
                    'url': apiUrl.api_url + 'clientcodremittancemaster?ClientId=' + clientid + '&AccountId=' + AccountId + '&offset=' + this.pageno + '&limit=10',
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    if (result.data.code == 200) {
                        this.listClientCODRemittanceData = result.data.data;
                        this.isLoading = false;
                        let totalRows = result.data.count;
                        this.resultCount = result.data.count;

                        if (totalRows < 10) {
                            this.pagecount = 1
                        } else {
                            this.pagecount = Math.ceil(totalRows / 10)
                        }
                    } else {
                        this.listClientCODRemittanceData = [];
                        this.resultCount = 0;
                        this.isLoading = false;
                    }
                }, error => {
                    console.error(error)
                    this.$alertify.error('Error Occured');
                })
        },

        async getClientCODRemittanceRowData(data) {
            this.$validator.reset();
            this.editsection = 1;
            this.errors.clear();
            this.editparams = '';

            this.Beneficiary = this.BankName = this.BankAccount = this.rtgs = '';

            let clientarr = [];
            if (data.ClientId != "") {
                clientarr.push({
                    "ClientMasterId": data.ClientId,
                    "CompanyName": data.CompanyName
                });
            }

            let dayarr = [];
            data.RemittanceDay.forEach((d) => {
                if (d != "") {
                    dayarr.push({
                        "day": d
                    });
                }
            });

            this.ClientCODRemmitanceId = data.ClientCODRemmitanceId;
            this.ClientId = clientarr;
            this.RemittanceDay = dayarr;
            this.type = data.RemittanceType;
            this.tat = data.tatno;

            this.ClientId.ClientMasterID = data.ClientId;

            this.CId = data.ClientId;
            this.Bussinesstype = data.BussinessType;
            await this.GetClientBusinessConfigList();
            await this.GetClientBusinessAccounts();
            this.BType = data.BussinessType;
            this.AccountName = data.AccountId;
            this.ContactEmailid = "";
            this.ContactEmailid = data.CustomerMailId;
            this.editparams = data.CustomerMailId;

            this.BankAccount = data.ClientAccountNo ? data.ClientAccountNo : '';
            this.Beneficiary = data.BeneficiaryName ? data.BeneficiaryName : '';
            this.BankName = data.ClientBankName ? data.ClientBankName : '';
            this.rtgs = data.NEFTNo ? data.NEFTNo : '';

        },
        onSubmit: function(event) {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    if (this.ClientCODRemmitanceId != undefined && this.ClientCODRemmitanceId != "") {
                        this.editClientCODRemittanceData(event);
                    } else {
                        this.saveClientCODRemittanceData(event);
                    }
                }
            }).catch(() => {
                console.log('errors exist', this.errors)
            });
        },
        onUpdate: function(event) {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    this.editClientCODRemittanceData(event);
                }
            }).catch(() => {
                console.log('errors exist', this.errors)
            });
        },
        onSearch: function(event) {
            this.editsection = 2;
            this.editparams = '';
            this.BankName = '';
            this.BankAccountNo = '';
            this.rtgs = '';
            this.isLoading = true;
            this.AddEditClientTAT = false;
            this.pageno = 0;

            let clientid = this.Client.ClientId ? this.Client.ClientId : 0;
            let AccountId = this.Client.AccountId ? this.Client.AccountId : 0;
            document.getElementById("clienterr").innerHTML = "";
            if (clientid == null || AccountId == 'undefined' || clientid == 0 || AccountId == 0) {

                this.isLoading = false;
                $("#clienterr").html("Client is required.");
                return false;
            } else {
                this.searchClientCODRemittanceData(event);
            }
        },

        getPaginationData(pageNum) {
            this.pageno = (pageNum - 1) * 10
            this.searchClientCODRemittanceData()
        },

        resetForm(event) {
            this.RemittanceDay = this.RemittanceDayedity = [];
            this.editsection = 2;
            this.ClientId = this.Bussinesstype = this.AccountName = this.tat = this.type = this.Beneficiary = this.BankName = this.BankAccount = this.rtgs = '';
            this.$validator.reset();
            this.tatedit = this.typeedit = this.Beneficiaryedit = this.BankNameedit = this.BankAccountedit = this.rtgsedit = '';
            this.clientname = this.accountname = this.typeedit = this.ContactEmailidedit = '';
            this.RemittanceDayListedit = [];
            this.errors.clear();
            this.editparams = '';
            this.BankAccountNo = '';
            this.ClientCODRemmitanceId = "";
            console.log('bank name', this.BankName);
        },

        resetSearch(event) {
            this.editsection = 2;
            this.Client = '';
            this.RemittanceDayedity = [];
            this.$validator.reset();
            this.errors.clear();
            this.ClientCODRemmitanceId = "";
            this.pageno = this.resultCount = 0;
            this.editparams = '';
            this.BankName = '';
            this.BankAccountNo = '';
            this.tatedit = this.typeedit = this.Beneficiaryedit = this.BankNameedit = this.BankAccountedit = this.rtgsedit = '';
            this.clientname = this.accountname = this.typeedit = this.ContactEmailidedit = '';
            this.rtgs = '';
            this.searchClientCODRemittanceData(event);
            document.getElementById("clienterr").innerHTML = "";
        },

        scrollWin() {
            window.scrollBy(0, -1000);
        }
    }
}
