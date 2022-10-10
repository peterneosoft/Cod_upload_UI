import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import {
    Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import moment from 'moment';
export default {
    name: 'ManualRemittance',
    components: {
        Paginate,
        VueElementLoading,
        Multiselect,
    },

    data() {
        return {
            localusername: 0,
            resultCount: 0,
            pagecount: 0,
            pageno: 0,
            count: 0,
            Search: 0,
            totalSum: 0,
            Client: "",
            recordType: 'tatoverdue',
            clientLoading: false,
            ClientList: [],
            isLoading: false,
            notApproved: 1,
            listPendingRemittanceData: [],
            listPendingRemittanceDataToDate: [],
            listPendingRemittanceDatas: [],
            resultCounts: 0,
            fromDate: '',
            ToDate: '',
            modalShow: false,
            currentdate: '',
            ReasonModalShow: false,
            confModalShow: false,
            DisputeArr: [],
            newformdate: '',
            newtodate: '',
            todatesChanged: '',
            ShipmentCount: '',
            newdata: [],
            FCModal: false,
            total: 0,
            ofd: '',
            fromdates: '',
            todates: '',
            newClientId: '',
            ClientId: "",
            utrno: '',
            updatedData: [],
            ClientAccountList: [],
            AccountId: '',
            IsActive:true,
            data: [],
            form: {
                toDate: [],
                FromDate: [],
                oldFromDate: [],
                oldToDate: []
            },
            selected: 'Initiated',
            overdueFilter: true,
            selected: false,
            options: [{
                    text: 'TAT Remittance',
                    value: false
                },
                {
                    text: 'Overdue Remittance',
                    value: true
                },
                {
                    text: 'Ad Hoc Remittance',
                    value: 'AdHoc'
                },
                {
                    text: 'Payments Approved',
                    value: 'payApproved'
                }
            ],
            isexport: false,
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

        var userToken = window.localStorage.getItem('accessuserToken');
        this.myStr = userToken.replace(/"/g, '');
        this.isLoading = true;
        this.getCleintWithAccountName();
        this.getUpdateInScanData();
        //this.manualCODRemittance();

        var date = new Date();
        this.currentdate = date.toLocaleDateString('fr-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },
    methods: {
        format_date(value) {
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY')
            }
        },
        showModal() {
            this.modalShow = true;
        },
        showConfirmationModal() {
            this.$refs.myConfModalRef.show();
        },
        hideConfModal(ele) {
            this.isLoading = true;
            if (ele == 0) {
                this.$refs.myConfModalRef.hide();
                this.okButtonClicked(this.newformdate, this.newtodate, this.newdata)

            } else {
                this.isLoading = false;
                this.$refs.myConfModalRef.hide();
            }
        },
        deleteRemittance(AccountId,ClientRemitedId,RemitanceDate,shipmentCount){

           try {
            if (confirm('Are you sure you want to reset Remittance?')) { //comfirmation to delete record
                // Save it!
                let authkey = apiUrl.stageauthkey;
                this.input = {
                    "RemittanceId" : ClientRemitedId,
                    "AccountId":AccountId,
                    "RemittanceDate":RemitanceDate,  //transaction date
                    "ShipmentCount":shipmentCount,
                    "username":this.localuserid
                }
                // return false;
                this.isLoading = true;
                axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'remittanceReset',
                    'data': this.input,

                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    },
                }).then(result => {
                        this.isLoading = false;
                        if (result.data.code == 200) {

                            var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
                        var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
                        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                        var userdetail = JSON.parse(plaintext);
                          
                        var paylods={
                          projectname: "COD Management",
                          type: "web",
                          userid: parseInt(userdetail.userid),
                          username: userdetail.username,
                          routeurl: 'updateSVCLedger',
                          meta:{
                            event:'updateSVCLedger',
                            data:{
                              req:'',
                              res:''
                            }
                          }
                        };
              
                        axios.post(process.env.NODE_ENV == 'production' ? 'http://track.xbees.in/api/UserTracker' : 'http://stageiptracking.xbees.in/api/UserTracker',paylods);
              
                        
                            this.$alertify.success(result.data.message);
                            this.payApproved();
                        }else{
                            this.$alertify.error(result.data.message);
                        }
                    },
                    error => {
                        this.isLoading = false;
                        this.$alertify.error(error + " - Something went wrong!");
                    })
            }
        } catch (error) {
            this.isLoading = false;
            this.$alertify.error(error + " - Something went wrong!");
        }
        },
        closeStatusRoleModal() {
            this.confModalShow = false
        },
        closeModal() {
            this.modalShow = false;
            this.ReasonModalShow = false;
            this.FCModal = false;
        },
        setid(name, key) {
            return name + key;
        },
        PopUp(elem) {
            this.FCModal = true;
            this.updatedData = elem;
            this.utrno = elem.UTRNo;
            this.$refs.myClosureModalRef.show();

        },
        onUpdate: function() {
            this.$validator.validateAll().then((result) => {
                if (!result) {
                    document.getElementById("utrnoerr").style.display = "block";
                    document.getElementById("utrnoerr").innerHTML = "UTR number is required.";

                    // this.$alertify.error('Update Error');
                } else {
                    document.getElementById("utrnoerr").style.display = "none";
                    document.getElementById("utrnoerr").innerHTML = "";
                    this.urlSubmitCall();
                }
            }).catch(() => {
                console.log('errors exist', this.errors);
                this.$alertify.error('Error Occured');
            });
        },
        urlSubmitCall() {
            this.input = {};
            this.input = {
                RemittanceId: this.updatedData.clientremittedid,
                UTRNo: this.utrno,
                username: this.localuserid,
            }
            axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'updateremittanceUTR',
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    },
                    data: this.input,
                })
                .then(result => {

                    if (result.data.code === 200) {
                        this.isLoading = false;
                        this.closeModal();
                        this.payApproved();

                    } else {
                        this.listPendingRemittanceDataToDate = [];
                        this.isLoading = false;
                    }
                }, error => {
                    console.error(error)
                    this.isLoading = false;
                    this.$alertify.error('Error Occured');
                })
        },

        onChangeDate(fromDate, toDate, ClientId, AccountId, CompanyName, RemittanceType, index) {
            $(".text-danger").html("");
            this.notApproved = 1;
            if (!toDate || !fromDate) {

                this.$alertify.error('From date & To/ Delivery date should not be empty.');
                return false;
            } else if (fromDate > this.currentdate || toDate > this.currentdate) {

                this.$alertify.error('From date & To/ Delivery date should not be greater than current date.');
                return false;
            } else if (fromDate > toDate) {

                document.getElementById("fdate" + AccountId).innerHTML = "From date should not be greater than To / Delivery date.";
                return false;
            } else if (toDate < fromDate) {

                document.getElementById("tdate" + AccountId).innerHTML = "To / Delivery date should not be less than From date.";
                return false;
            } else if (toDate > this.form.oldToDate[AccountId]) {

                let tdate = new Date(this.form.oldToDate[AccountId]);
                document.getElementById("tdate" + AccountId).innerHTML = "To / Delivery date should not be greater than " + (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();
                return false;
            } else if (fromDate < this.form.oldFromDate[AccountId]) {

                let fdate = new Date(this.form.oldFromDate[AccountId]);
                document.getElementById("fdate" + AccountId).innerHTML = "From date should not be less than " + (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
                return false;
            } else {

                document.getElementById("fdate" + AccountId).innerHTML = "";
                document.getElementById("tdate" + AccountId).innerHTML = "";

                this.isLoading = true;

                this.newtodate = toDate;

                if (this.selected === "AdHoc") {

                    if (this.Client.AccountId == null || this.Client.AccountId == 'undefined') {
                        document.getElementById("clienterr").innerHTML = "Client is required.";
                        return false;
                    }
                    document.getElementById("clienterr").innerHTML = "";
                    this.fromdates = fromDate;
                    this.todates = toDate;
                    this.ClientId = ClientId;
                    this.adhocDateChnage(this.Client.AccountId, this.Client.AccountName);
                } else {

                    // url: apiUrl.api_url + 'manualcodremittance?CreatedBy=' + this.localuserid + '&ClientId=' + ClientId + '&oldFromDate=' + this.form.oldFromDate[ClientId] + '&fromDate=' + fromDate + '&toDate=' + toDate + '&offset=' + this.pageno + '&limit=' + 20,
                    this.input = {
                        ClientId,
                        AccountId,
                        fromDate,
                        toDate,
                        username: this.localuserid,
                        CompanyName,
                        RemittanceType
                    }

                    axios({
                            method: 'POST',
                            url: apiUrl.api_url + 'ondatechangeremittancedata',
                            headers: {
                                'Authorization': 'Bearer ' + this.myStr
                            },
                            data: this.input,
                        })
                        .then(result => {
                            if (result.data.code == 200) {

                                let alldata = [];
                                this.isLoading = false;

                                alldata = result.data.remittanceArr;

                                // this.isexport = false;
                                // this.manualCODRemittance();
                                alldata.forEach((val, key) => {
                                    $(".scrolltb").find("[data-comp='comp" + AccountId + "']").html(val.CompanyName);
                                    $(".scrolltb").find("[data-remi='remi" + AccountId + "']").html(val.RemittanceType);
                                    $(".scrolltb").find("[data-ship='ship" + AccountId + "']").html(val.ShipmentCount);
                                    $(".scrolltb").find("[data-cod='cod" + AccountId + "']").html(val.CODAmount);
                                    $(".scrolltb").find("[data-foregi='foregi" + AccountId + "']").html(val.FreightAmount);
                                    $(".scrolltb").find("[data-excep='excep" + AccountId + "']").html(val.ExceptionAmount);
                                    $(".scrolltb").find("[data-pay='pay" + AccountId + "']").html(val.PayableAmount);
                                    $(".scrolltb").find("[data-fromids='fromids" + AccountId + "']").attr('data-fromdates', val.FromDate);
                                    $(".scrolltb").find("[data-toids='toids" + AccountId + "']").attr('data-dates', val.ToDate);

                                    $(".scrolltb").find("[data-remittbtn='remittbtn" + AccountId + "']").show();
                                    if (val.PayableAmount <= 0) {
                                        $(".scrolltb").find("[data-remittbtn='remittbtn" + AccountId + "']").hide();
                                    }

                                    $("#FromDate" + AccountId).val(val.FromDate);
                                    $("#toDate" + AccountId).val(val.ToDate);

                                    // this.toDate = val.ToDate;
                                    if (val.remittanceArr !== undefined && val.remittanceArr !== 'undefined' && val.remittanceArr.ExceptionAWB !== undefined && val.remittanceArr.ExceptionAWB !== 'undefined') {
                                        this.DisputeArr = val.remittanceArr.ExceptionAWB;
                                    }
                                });


                            } else {
                                this.listPendingRemittanceDataToDate = [];
                                this.isLoading = false;
                            }
                        }, error => {
                            console.error(error)
                            this.isLoading = false;
                            this.$alertify.error('Error Occured');
                        })
                }
            }
        },

        onRemittance(fromDate, toDate, data) {
            this.notApproved = 1;
            if ((!fromDate || !this.form.oldFromDate[data.AccountId]) || (!toDate || !this.form.oldToDate[data.AccountId])) {

                this.$alertify.error('From date & To / Delivery date should not be empty.');
                return false;
            } else if (fromDate != this.form.oldFromDate[data.AccountId]) {

                let fdate = new Date(this.form.oldFromDate[data.AccountId]);
                this.ofd = 'Remittance for client ' + data.CompanyName + ', From date should be: ' + (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
                this.showModal();
                return false;
            } else if (toDate > this.form.oldToDate[data.AccountId]) {

                let tdate = new Date(this.form.oldToDate[data.AccountId]);
                this.ofd = 'Remittance for client ' + data.CompanyName + ', To / Delivery date should be: ' + (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();
                this.showModal();
                return false;
            } else if (data.ShipmentCount == 0) {

                let fdate = new Date(data.FromDate);
                fdate = (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
                let tdate = new Date(data.ToDate);
                tdate = (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();

                this.ofd = 'Remittance COD amount for client ' + data.CompanyName + ' & date from ' + fdate + ' to ' + tdate + ' is 0.00';
                this.showModal();
                return false;
            } else {
                this.newformdate = fromDate;
                this.newtodate = toDate;
                this.newdata = data;
                this.showConfirmationModal();
            }
        },

        okButtonClicked(fromDate, toDate, data) {
            this.isLoading = true;
            this.notApproved = 1;
            if ((!fromDate || !this.form.oldFromDate[data.AccountId]) || (!toDate || !this.form.oldToDate[data.AccountId])) {

                this.$alertify.error('From date & To / Delivery date should not be empty.');
                return false;
            } else if (fromDate != this.form.oldFromDate[data.AccountId]) {

                let fdate = new Date(this.form.oldFromDate[data.AccountId]);
                this.ofd = 'Remittance for client ' + data.CompanyName + ', From date should be: ' + (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
                this.showModal();
                return false;
            } else if (toDate > this.form.oldToDate[data.AccountId]) {

                let tdate = new Date(this.form.oldToDate[data.AccountId]);
                this.ofd = 'Remittance for client ' + data.CompanyName + ', To / Delivery date should be: ' + (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();
                this.showModal();
                return false;
            } else if (data.ShipmentCount == 0) {

                let fdate = new Date(data.FromDate);
                fdate = (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
                let tdate = new Date(data.ToDate);
                tdate = (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();

                this.ofd = 'Remittance COD amount for client ' + data.CompanyName + ' & date from ' + fdate + ' to ' + tdate + ' is 0.00';
                this.showModal();
                return false;
            } else {

                this.closeModal();
                this.recordType = this.selected;
                this.todatesChanged = $(".scrolltb").find("[data-toids='toids" + data.AccountId + "']").attr('data-dates');
                this.ShipmentCount = $(".scrolltb").find("[data-ship='ship" + data.AccountId + "']").text();

                if (this.recordType == 'AdHoc') {

                    this.input = ({
                        FromDate: this.form.oldFromDate[data.AccountId],
                        ToDate: this.todatesChanged,
                        ShipmentCount: this.ShipmentCount,
                        AccountId: data.AccountId,
                        ClientId: data.ClientId,
                        CompanyName: data.CompanyName,
                        CODAmount: data.CODAmount,
                        FreightAmount: data.FreightAmount,
                        ExceptionAmount: data.ExceptionAmount,
                        ExceptionAWB: data.ExceptionAWB,
                        PayableAmount: data.PayableAmount,
                        UTRNo: "",
                        username: this.localuserid,
                        RemittanceType: data.RemittanceType,
                    })
                    axios({
                        method: 'POST',
                        'url': apiUrl.api_url + 'processAdhocRemittance',
                        'data': this.input,
                        headers: {
                            'Authorization': 'Bearer ' + this.myStr
                        }
                    }).then(result => {
                        if (result.data.code == 200) {
                            this.$alertify.success(result.data.message);
                            this.isLoading = false;
                            this.onClientSearch(this.Client.AccountId, this.Client.ClientId, this.Client.AccountName);

                            // this.insertEmailRemittance();
                        } else {
                            this.isLoading = false;
                            this.$alertify.error(result.data.message)
                        }
                    }, error => {
                        console.error(error)
                        this.isLoading = false;
                        this.$alertify.error('Error Occured');
                    })
                } else {
                    this.listPendingRemittanceData = [];
                    this.listPendingRemittanceDatas = [];
                    this.input = ({
                        FromDate: this.form.oldFromDate[data.AccountId],
                        ToDate: this.todatesChanged,
                        ShipmentCount: this.ShipmentCount,
                        CompanyName: data.CompanyName,
                        ClientId: data.ClientId,
                        AccountId: data.AccountId,
                        CODAmount: data.CODAmount,
                        FreightAmount: data.FreightAmount,
                        ExceptionAmount: data.ExceptionAmount,
                        ExceptionAWB: data.ExceptionAWB,
                        PayableAmount: data.PayableAmount,
                        UTRNo: "",
                        username: this.localuserid
                    })
                    axios({
                        method: 'POST',
                        'url': apiUrl.api_url + 'remittanceManualClosure',
                        'data': this.input,
                        headers: {
                            'Authorization': 'Bearer ' + this.myStr
                        }
                    }).then(result => {
                        if (result.data.code == 200) {
                            this.$alertify.success(result.data.message);
                            this.manualCODRemittance();
                            // this.insertEmailReittance();
                        } else {
                            this.manualCODRemittance();
                            this.isLoading = false;
                            this.$alertify.error(result.data.message)
                        }
                    }, error => {
                        console.error(error)
                        this.isLoading = false;
                        this.$alertify.error('Error Occured');
                    })
                }
            }
        },
        onAdHoctance(fromDate, toDate, data) {
            this.notApproved = 1;
            if ((!fromDate || !this.form.oldFromDate[data.AccountId]) || (!toDate || !this.form.oldToDate[data.AccountId])) {

                this.$alertify.error('From date & To / Delivery date should not be empty.');
                return false;
            } else if (fromDate != this.form.oldFromDate[data.AccountId]) {

                let fdate = new Date(this.form.oldFromDate[data.AccountId]);
                this.ofd = 'Remittance for client ' + data.CompanyName + ', From date should be: ' + (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
                this.showModal();
                return false;
            } else if (toDate > this.form.oldToDate[data.AccountId]) {

                let tdate = new Date(this.form.oldToDate[data.AccountId]);
                this.ofd = 'Remittance for client ' + data.CompanyName + ', To / Delivery date should be: ' + (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();
                this.showModal();
                return false;
            } else if (data.ShipmentCount == 0) {

                let fdate = new Date(data.FromDate);
                fdate = (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
                let tdate = new Date(data.ToDate);
                tdate = (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();

                this.ofd = 'Remittance COD amount for client ' + data.CompanyName + ' & date from ' + fdate + ' to ' + tdate + ' is 0.00';
                this.showModal();
                return false;
            } else {
                this.newformdate = fromDate;
                this.newtodate = toDate;
                this.newdata = data;
                this.recordType = 'adhoc';
                this.showConfirmationModal();
            }
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
        getUpdateInScanData() {
            $(".text-danger").html("");

            this.isLoading = true;
            this.input = ({
                username: this.localuserid
            });
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'updateInscanClientData',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    // this.isLoading = false;
                    if (result.data.code == 200) {
                        this.overdueFilter = this.selected;
                        this.isLoading = true;
                        this.manualCODRemittance();

                    }
                }, error => {
                    console.error(error)
                })
        },
        changeRadio() {
            this.listPendingRemittanceData = [];
            this.listPendingRemittanceDatas = [];
            $(".text-danger").html("");
            this.Client = [];
            this.Search = 0;
            this.pageno = 0;
            this.newClientId = '';
            this.AccountId = '';
            this.resultCount = 0;
            this.pagecount = 1;
            this.isLoading = true;
            this.input = ({
                username: this.localuserid
            });
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'updateInscanClientData',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    if (result.data.code == 200) {
                        this.overdueFilter = this.selected;
                        if (this.selected === "AdHoc") {
                            this.notApproved = 1;
                            this.listPendingRemittanceData = [];
                            this.resultCount = 0;
                            this.isLoading = false;
                        } else if (this.selected === "payApproved") {
                            this.listPendingRemittanceData = [];
                            this.listPendingRemittanceDatas = [];
                            this.isLoading = false;
                            this.newClientId = '';
                            this.notApproved = 2;
                            this.payApproved();


                        } else {
                            this.notApproved = 1;
                            this.manualCODRemittance();
                        }
                    }
                }, error => {
                    console.error(error)
                })

        },
        getPaginationDelivaryData(pageNum) {
            this.pageno = (pageNum - 1) * 10;
            this.payApproved();
        },
        payApproved() {
            this.notApproved = 2;
            // this.Client = [];
            // this.Search = 0;
            this.resultCount = 0;
            this.isLoading = true;

            this.input = ({
                username: this.localuserid
            });

            if (this.newClientId) {
                this.input.ClientId = [this.newClientId];
            }

            if (this.AccountId) {
                this.input.AccountId = [this.AccountId];
            }
            this.input.isexport = this.isexport;
            if (this.TransactionFromDate) {
                this.input.TransactionFromDate = this.TransactionFromDate;
            }

            if (this.TransactionToDate) {
                this.input.TransactionToDate = this.TransactionToDate;
            }
            this.input.offset = this.pageno;
            this.input.limit = 10;
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'getRemittedClientData',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    if (result.data.code == 200) {
                        if (this.isexport === false) {
                            this.isLoading = false;
                            this.recordType = 'payApproved';
                            this.notApproved = 2;
                            this.listPendingRemittanceDatas = result.data.remittanceArr;
                            this.resultCounts = result.data.count;
                            let totalRows = result.data.count;
                            if (totalRows < 10) {
                                this.pagecount = 1
                            } else {
                                this.pagecount = Math.ceil(totalRows / 10)
                            }
                        }
                        if (this.isexport === true) {
                            this.isLoading = false;

                            if (result.data.remittanceArr.length > 0) {

                                let fetchResult = result.data.remittanceArr;
                                let newResult = [];
                                fetchResult.forEach((item, i) => {
                                    let testTemp = {};

                                    testTemp.CompanyName = item.CompanyName;
                                    testTemp.RemittanceType = item.RemittanceType;
                                    testTemp.clientremittedid = item.clientremittedid;
                                    testTemp.Cycle = item.Cycle;
                                    testTemp.ShipmentCount = item.ShipmentCount;
                                    testTemp.CODAmount = item.CODAmount;
                                    testTemp.FreightAmount = item.FreightAmount;
                                    testTemp.ExceptionAmount = item.ExceptionAmount;
                                    testTemp.PaidAmount = item.PaidAmount;
                                    testTemp.transactiondate = this.format_date(item.transactiondate);
                                    testTemp.UTRNo = item.UTRNo;
                                    newResult.push(testTemp);
                                });
                                this.getDownloadCsvObject(newResult);
                            } else {
                                this.$alertify.error('Sorry..! no record found for excel download.');
                            }

                            this.isexport = false;
                        }


                    } else if (result.data.code == 204) {
                        this.listPendingRemittanceDatas = [];
                        this.notApproved = 2;
                        this.resultCounts = 0;
                        this.isLoading = false;
                    }
                });


        },
        getPaginationManulaData(pageNum) {
            this.pageno = (pageNum - 1) * 10;
            this.isexport = false;
            this.listPendingRemittanceData = [];
            this.listPendingRemittanceDatas = [];
            this.manualCODRemittance();
        },
        manualCODRemittance() {

            this.notApproved = 1;
            this.isLoading = true;

            // url: apiUrl.api_url + 'manualcodremittance?CreatedBy=' + this.localuserid + '&oldFromDate=' + this.fromDate + '&fromDate=' + this.fromDate + '&toDate=' + this.toDate + '&offset=' + this.pageno + '&limit=' + 20,


            this.input = ({
                username: this.localuserid,
                overdueremittance: this.overdueFilter
            });


            if (this.newClientId) {
                this.input.clientid = this.newClientId;
            }

            if (this.AccountId) {
                this.input.AccountId = this.AccountId;
            }
            this.input.offset = this.pageno;
            this.input.limit = 10;


            axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'getmanualremittancedata',
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    },
                    'data': this.input,
                })
                .then(result => {

                    if (result.data.code == 200) {
                        this.listPendingRemittanceData = [];
                        this.listPendingRemittanceDatas = [];
                        this.isLoading = false;
                        this.recordType = 'tatoverdue';

                        this.listPendingRemittanceData = result.data.remittanceArr;
                        this.resultCount = result.data.count;
                        let totalRows = result.data.count;

                        if (totalRows < 10) {
                            this.pagecount = 1
                        } else {
                            this.pagecount = Math.ceil(totalRows / 10)
                        }
                        this.listPendingRemittanceData.forEach((val, key) => {
                            this.form.toDate[val.AccountId] = val.ToDate;
                            this.form.FromDate[val.AccountId] = val.FromDate;

                            this.form.oldToDate[val.AccountId] = null;
                            this.form.oldFromDate[val.AccountId] = null;

                            if (this.form.oldFromDate[val.AccountId] == null) {
                                this.form.oldFromDate[val.AccountId] = val.FromDate;
                            }
                            if (this.form.oldToDate[val.AccountId] == null) {
                                this.form.oldToDate[val.AccountId] = val.ToDate;
                            }
                            $(".datechecker").find("[data-fromdates='fromdates" + val.AccountId + "']").val(val.FromDate);
                            $(".datechecker").find("[data-todates='toids" + val.AccountId + "']").val(val.ToDate);

                            // $('#FromDate' + val.AccountId).val(val.FromDate);
                            // $('#toDate' + val.AccountId).val(val.ToDate);
                        });

                    } else {
                        this.listPendingRemittanceData = [];
                        this.listPendingRemittanceDatas = [];
                        this.resultCount = 0;
                        this.isLoading = false;
                    }
                }, error => {
                    console.error(error)
                    this.isLoading = false;
                })
        },

        //to get pagination
        getPaginationData(pageNum) {
            this.pageno = (pageNum - 1) * 10
            this.manualCODRemittance()
        },

        insertEmailRemittance() {
            this.input = ({
                CreatedBy: this.localuserid
            })
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'insertemailremittance',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    if (result.data.code == 200) {}
                }, error => {
                    console.error(error)
                })
        },
        /**
         * get cleint with account wise info::-
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

        onClientSearch(AccountId, ClientId, CompanyName) {
            this.fromdates = "";
            this.AccountId = AccountId;
            this.todates = "";
            this.isLoading = true;
            if (!AccountId) {

                this.$alertify.error('Client Name is mandatory.');
                return false;
            } else {

                this.isLoading = true;
                if (this.selected === "AdHoc") {
                    this.input = ({
                        fromDate: this.fromdates,
                        toDate: this.todates,
                        AccountId: AccountId,
                        ClientId: ClientId,
                        ClientName: CompanyName,
                    });

                    axios({
                            method: 'POST',
                            url: apiUrl.api_url + 'adhocCODRemiitance',
                            headers: {
                                'Authorization': 'Bearer ' + this.myStr
                            },
                            'data': this.input,
                        })
                        .then(result => {
                            this.isLoading = false;
                            if (result.data.code == 200) {
                                // this.adhocDate(result.data.remittanceObj.FromDate, result.data.remittanceObj.ToDate, ClientId);
                                let newRemittedArrays = [];
                                this.recordType = 'adhoc';
                                newRemittedArrays = [{
                                    'FromDate': result.data.remittanceObj.FromDate,
                                    'ToDate': result.data.remittanceObj.ToDate,
                                    'CODAmount': result.data.remittanceObj.CODAmount,
                                    'ClientId': result.data.remittanceObj.ClientId,
                                    'AccountId': result.data.remittanceObj.AccountId,
                                    'CompanyName': result.data.remittanceObj.CompanyName,
                                    'ExceptionAWB': result.data.remittanceObj.ExceptionAWB,
                                    'ExceptionAmount': result.data.remittanceObj.ExceptionAmount,
                                    'FreightAmount': result.data.remittanceObj.FreightAmount,
                                    'PayableAmount': result.data.remittanceObj.PayableAmount,
                                    'RemittanceType': result.data.remittanceObj.RemittanceType,
                                    'ShipmentCount': result.data.remittanceObj.ShipmentCount,
                                    'IsActive':result.data.remittanceObj.IsActive
                                }]


                                this.form.toDate[result.data.remittanceObj.AccountId] = result.data.remittanceObj.ToDate;
                                this.form.FromDate[result.data.remittanceObj.AccountId] = result.data.remittanceObj.FromDate;

                                this.form.oldToDate[result.data.remittanceObj.AccountId] = null;
                                this.form.oldFromDate[result.data.remittanceObj.AccountId] = null;

                                if (this.form.oldFromDate[result.data.remittanceObj.AccountId] == null) {
                                    this.form.oldFromDate[result.data.remittanceObj.AccountId] = result.data.remittanceObj.FromDate;
                                }
                                if (this.form.oldToDate[result.data.remittanceObj.AccountId] == null) {
                                    this.form.oldToDate[result.data.remittanceObj.AccountId] = result.data.remittanceObj.ToDate;
                                }

                                $('#FromDate' + result.data.remittanceObj.AccountId).val(result.data.remittanceObj.FromDate);
                                $('#toDate' + result.data.remittanceObj.AccountId).val(result.data.remittanceObj.ToDate);

                                this.listPendingRemittanceData = [];
                                this.listPendingRemittanceData = newRemittedArrays;
                                this.resultCount = newRemittedArrays.length;
                                this.isLoading = false;


                            } else {
                                this.resultCount = 0;
                                this.pageno = 0;
                                this.listPendingRemittanceData = [];
                                this.isLoading = false;
                            }
                        }, error => {
                            console.error(error)
                            this.isLoading = false;
                            this.$alertify.error('Error Occured');
                        });

                } else if (this.selected === false) {
                    this.isLoading = true;
                    this.newClientId = ClientId;
                    this.manualCODRemittance();

                } else if (this.selected === true) {
                    this.isLoading = true;
                    this.newClientId = ClientId;
                    this.manualCODRemittance();
                } else if (this.selected === "payApproved") {
                    this.newClientId = ClientId;
                    this.payApproved();
                }

            }
        },
        adhocDateChnage(AccountId, CompanyName) {
            this.listPendingRemittanceData = [];
            if (!AccountId) {

                this.$alertify.error('Client Name is mandatory.');
                return false;
            } else {

                this.isLoading = true;

                this.input = ({
                    fromDate: this.fromdates,
                    toDate: this.todates,
                    ClientId: this.ClientId,
                    ClientName: CompanyName,
                    AccountId: AccountId
                });

                axios({
                        method: 'POST',
                        url: apiUrl.api_url + 'adhocCODRemiitance',
                        headers: {
                            'Authorization': 'Bearer ' + this.myStr
                        },
                        'data': this.input,
                    })
                    .then(result => {
                        if (result.data.code == 200) {
                            // this.adhocDate(result.data.remittanceObj.FromDate, result.data.remittanceObj.ToDate, ClientId);
                            let newRemittedArrays = [];

                            newRemittedArrays = [{
                                'FromDate': result.data.remittanceObj.FromDate,
                                'ToDate': result.data.remittanceObj.ToDate,
                                'CODAmount': result.data.remittanceObj.CODAmount,
                                'ClientId': result.data.remittanceObj.ClientId,
                                'AccountId': result.data.remittanceObj.AccountId,
                                'CompanyName': result.data.remittanceObj.CompanyName,
                                'ExceptionAWB': result.data.remittanceObj.ExceptionAWB,
                                'ExceptionAmount': result.data.remittanceObj.ExceptionAmount,
                                'FreightAmount': result.data.remittanceObj.FreightAmount,
                                'PayableAmount': result.data.remittanceObj.PayableAmount,
                                'RemittanceType': result.data.remittanceObj.RemittanceType,
                                'ShipmentCount': result.data.remittanceObj.ShipmentCount,
                                'IsActive':result.data.remittanceObj.IsActive
                            }]

                            this.form.toDate[result.data.remittanceObj.AccountId] = result.data.remittanceObj.ToDate;
                            this.form.FromDate[result.data.remittanceObj.AccountId] = result.data.remittanceObj.FromDate;

                            // this.form.oldToDate[result.data.remittanceObj.ClientId] = null;
                            // this.form.oldFromDate[result.data.remittanceObj.ClientId] = null;

                            // if (this.form.oldFromDate[result.data.remittanceObj.ClientId] == null) {
                            //     this.form.oldFromDate[result.data.remittanceObj.ClientId] = result.data.remittanceObj.FromDate;
                            // }
                            // if (this.form.oldToDate[result.data.remittanceObj.ClientId] == null) {
                            //     this.form.oldToDate[result.data.remittanceObj.ClientId] = result.data.remittanceObj.ToDate;
                            // }

                            $('#FromDate' + result.data.remittanceObj.AccountId).val(result.data.remittanceObj.FromDate);
                            $('#toDate' + result.data.remittanceObj.AccountId).val(result.data.remittanceObj.ToDate);
                            this.listPendingRemittanceData = [];
                            this.listPendingRemittanceDatas = [];
                            this.listPendingRemittanceData = newRemittedArrays;
                            this.resultCount = newRemittedArrays.length;
                            this.isLoading = false;

                        } else {
                            this.resultCount = 0;
                            this.pageno = 0;
                            this.listPendingRemittanceData = [];
                            this.isLoading = false;
                        }
                    }, error => {
                        console.error(error)
                        this.isLoading = false;
                        this.$alertify.error('Error Occured');
                    })
            }
        },
        adhocDate(fromDate, toDate, ClientId) {
            this.form.oldToDate[ClientId] = this.form.toDate[ClientId] = [];
            this.form.oldFromDate[ClientId] = this.form.FromDate[ClientId] = [];

            this.listPendingRemittanceData = [];
            this.pagecount = 1;

            if (!toDate || !fromDate) {

                this.$alertify.error('From date & To/ Delivery date should not be empty.');
                this.isLoading = false;
                return false;
            } else {

                axios({
                        method: 'GET',
                        url: apiUrl.api_url + 'manualcodremittance?CreatedBy=' + this.localuserid + '&ClientId=' + ClientId + '&oldFromDate=' + fromDate + '&fromDate=' + fromDate + '&toDate=' + toDate + '&offset=0&limit=' + 20,
                        headers: {
                            'Authorization': 'Bearer ' + this.myStr
                        }
                    })
                    .then(result => {
                        if (result.data.code == 200) {
                            this.form.oldToDate[AccountId] = this.form.ToDate[AccountId] = result.data.data[0].ToDate;
                            this.form.oldFromDate[AccountId] = this.form.FromDate[AccountId] = result.data.data[0].FromDate;
                            this.listPendingRemittanceData = result.data.data;
                            this.resultCount = result.data.data.length;
                            this.isLoading = false;
                        } else {
                            this.isLoading = false;
                        }
                    }, error => {
                        console.error(error)
                        this.isLoading = false;
                        this.$alertify.error('Error Occured');
                    })
            }
        },

        onSearch() {
            this.resultCount = 0;
            this.pagecount = 1;
            this.pageno = 0;
            if (this.Client.AccountId == null || this.Client.AccountId == 'undefined') {
                document.getElementById("clienterr").innerHTML = "Client is required.";
                return false;
            }
            document.getElementById("clienterr").innerHTML = "";
            this.onClientSearch(this.Client.AccountId, this.Client.ClientId, this.Client.AccountName);
        },

        resetSearch() {
            this.Client = [];
            this.pageno = 0;
            this.Search = 0;
            this.resultCount = 0;
            this.pagecount = 1;
            document.getElementById("clienterr").innerHTML = "";
            this.newClientId = '';
            this.isexport = false;
            this.changeRadio();


        },
        exportData(fromdates, ClientId, AccountId, CompanyName) {
            this.isLoading = true;
            if (this.selected === "AdHoc") {
                AccountId = this.Client.AccountId;
            }

            this.todatesChanged = $(".scrolltb").find("[data-toids='toids" + AccountId + "']").attr("data-dates");
            this.input = ({
                FromDate: fromdates,
                ToDate: this.todatesChanged,
                ClientId: ClientId,
                AccountId: AccountId,
                CompanyName: CompanyName,
                username: this.localuserid,
            });

            axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'exportShipmentData',
                    data: this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.isLoading = false;
                    if (result.data.code == 200) {
                        if (result.data.shipmentArr.length > 0) {
                            this.AccountId = AccountId;
                            this.getDownloadCsvObject(result.data.shipmentArr);
                        } else {
                            this.$alertify.error('Sorry..! no record found for excel download.');
                        }
                    }

                }, error => {
                    console.error(error)
                    this.isLoading = false;
                    this.$alertify.error('Error Occured');
                })
        },
        exportDelivaryDate() {
            this.isexport = true;
            this.payApproved();
        },
        getDownloadCsvObject(csvData) {


            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            var today = dd + "" + mm + "" + yyyy;
            var data, filename, link;

            if (this.selected !== "payApproved") {
                let fromdates = $(".scrolltb").find("[data-fromids='fromids" + this.AccountId + "']").attr("data-fromdates");
                let todates = $(".scrolltb").find("[data-toids='toids" + this.AccountId + "']").attr("data-dates");
                let compnames = $(".scrolltb").find("[data-comps='comps" + this.AccountId + "']").attr("data-compname");
                filename = `${compnames}_${this.format_date(fromdates)}_${this.format_date(todates)}.csv`;

            } else {
                filename = 'PaymentApproved.csv';
            }

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
    }
}
