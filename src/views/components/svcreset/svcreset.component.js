import apiUrl from '../../../constants'
import axios from 'axios'
import {
    Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';

export default {
    name: 'svcreset',
    components: {
        Paginate,
        VueElementLoading,
        Multiselect
    },
    props: [],

    data() {
        return {
            zoneList: [],
            hubList: [],
            CODLedgerReports: [],
            zone: '',
            HubId: [],
            resultCount: '',
            pageno: 0,
            pagecount: 0,
            isLoading: false,
            zoneLoading: false,
            hubLoading: false,
            ResetmodalShow: false,
            resetDD: '',
            resetType: '',
            role: '',
            localuserid: '',
            myStr: '',
            depamount: '',
            depdate: '',
            depslip: '',
            codamount: '',
            financeclosingamt: '',
            comment: '',
            finreason: '',
            actualrecamt: '',
            FinanceReasonList: [],
            toDate: "",
            fromDate: "",
            FCModal: false,
            createdby: '',
            deposittype: '',
            svcledgerid: '',
            recoveryamt: '',
            statusid: '',
            openingbalance: '',
            batchid: '',
            subLoading: false,
            upTyp: 0,
            radio: 'dps'
        }
    },

    computed: {

    },

    mounted() {
        var userToken = window.localStorage.getItem('accessuserToken')
        this.myStr = userToken.replace(/"/g, '');

        var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
        var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
        var userdetail = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        this.localuserid = userdetail.username;

        this.role = window.localStorage.getItem('accessrole').toLowerCase().replace(/\s/g, '');

        this.getZoneData();
        this.GetReasonList();
    },

    methods: {
        GetReasonList() {
            this.input = ({
                ReasonType: "Finance"
            })
            axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'external/getCODReasons',
                    data: this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.FinanceReasonList = result.data.Reasons.data;
                }, error => {
                    console.error(error)
                })
        },

        getPaginationData(pageNum) {
            this.pageno = (pageNum - 1) * 10
            this.GetSVCledgerData()
        },

        GetSVCledgerData() {
            $('span[id^="vri"]').hide();
            $('span[id^="vrl"]').show();
            this.FCModal = false;

            if (this.fromDate && this.toDate) {
                this.input = ({ offset: this.pageno, limit: 10, hubid: this.HubId.HubID, fromdate: this.fromDate, todate: this.toDate });
            } else {
                this.input = ({ offset: this.pageno, limit: 10, hubid: this.HubId.HubID });
            }
            this.isLoading = true;
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'svcledgermaster',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.isLoading = false;
                    this.upTyp = 0;
                    this.CODLedgerReports = [];
                    this.resultCount = 0;

                    if (result.data.code == 200) {
                        this.CODLedgerReports = result.data.data;
                        this.resultCount = result.data.count;
                        this.resultdate = result.data.date;

                        let totalRows = result.data.count;
                        if (totalRows < 10) {
                            this.pagecount = 1
                        } else {
                            this.pagecount = Math.ceil(totalRows / 10)
                        }
                    }
                }, error => {
                    this.isLoading = false;
                    console.error(error);
                })
        },

        //to get All Zone List
        getZoneData() {
            this.input = {};
            this.zoneLoading = true;
            this.zoneList = [];
            axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'external/getallzones',
                    data: this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.zoneLoading = false;

                    if (this.role == 'financemanager' || this.role == 'admin') {
                        this.zoneList = result.data.zone.data;
                    } else {
                        if (window.localStorage.getItem('accesszone')) {
                            result.data.zone.data.map(item => {
                                let obj = window.localStorage.getItem('accesszone').split(",").find(el => el == item.hubzoneid);
                                if (obj) this.zoneList.push(item);
                            });
                        } else { this.zoneList = result.data.zone.data; }
                    }
                }, error => {
                    this.zoneLoading = false;
                    console.error(error)
                })
        },

        //to get All Zone Wise Hub List
        getHubData() {
            if (this.zone == "") {
                return false;
            }
            this.input = ({
                zoneid: this.zone
            })
            this.hubLoading = true;
            axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'external/getzonehub',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.hubLoading = false;
                    this.HubId = [];
                    this.hubList = [];
                    if (result.data.hub.code == 200) {
                        this.hubList = result.data.hub.data;
                    }
                }, error => {
                    this.hubLoading = false;
                    console.error(error)
                })
        },

        onSubmit: function(event) {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    let diffTime = Math.abs(new Date(this.toDate) - new Date(this.fromDate));
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (this.fromDate > this.toDate) {
                        document.getElementById("fdate").innerHTML = "From date should not be greater than To date.";
                        return false;
                    } else if (diffDays > 30) {
                        document.getElementById("fdate").innerHTML = "Difference between From date & To date should not be greater than 30 days.";
                        return false;
                    } else {
                        this.pageno = 0;
                        this.GetSVCledgerData()
                    }
                }
            }).catch(() => {
                console.log('errors exist', this.errors)
            });
        },

        resetForm() {
            this.zone = "";
            this.hubList = [];
            this.HubId = [];
            this.pageno = 0;
            this.CODLedgerReports = [];
            this.resultCount = 0;
            this.fromDate = this.toDate = '';
            this.$validator.reset();
            this.errors.clear();
        },

        hideResetModal(ele, typ) {
            this.$refs.myResetModalRef.hide();

            if (ele == 0) {
                if (typ == 'reset SVC closure') this.resetSVCledger();
                else if (typ == 'update SVC closure') this.updateLedger();
                else if (typ == 'update SVC closure finance closing amount') this.updateFCLedger();
                else if (typ == 'reset SVC closure deposit slip') this.onDeleteDPS();

            } else {
                if (typ == 'reset SVC closure') { this.ResetmodalShow = false; } else {
                    this.FCModal = true;
                    this.$refs.myClosureModalRef.show();
                }
            }
        },

        closeStatusRoleModal() {
            this.ResetmodalShow = false;
            this.FCModal = false;
        },

        resetSVCledger() {

            this.input = ({
                svcledgerid: this.svcledgerid,
                hubid: this.HubId.HubID,
                openingbalance: this.openingbalance,
                codamount: this.codamount,
                bankdeposit: this.depamount,
                statusid: this.statusid,
                financereasonid: this.financereasonid,
                createdby: this.createdby,
                username: this.localuserid,
                deliverydate: this.resetDD
            });

            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'deleteSVCLedgerEntry',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(response => {
                    if (response.data.code == 200) {
                        this.$alertify.success(response.data.msg);
                        this.GetSVCledgerData()
                        var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
                        var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
                        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                        var userdetail = JSON.parse(plaintext);

                        var paylods={
                          projectname: "COD Management",
                          type: "web",
                          userid: parseInt(userdetail.userid),
                          username: userdetail.username,
                          routeurl: 'deleteSVCLedgerEntry',
                          meta:{
                            event:'deleteSVCLedgerEntry',
                            data:{
                              req:this.input,
                              res:''
                            }
                          }
                        };

                        axios.post(apiUrl.iptracker_url,paylods);
                    } else {
                        this.$alertify.error(response.data.msg)
                    }
                })
                .catch((httpException) => {
                    console.error('exception is:::::::::', httpException);
                    this.$alertify.error('Error Occured');
                });
        },

        updateLedger() {

            this.subLoading = true;
            this.FCModal = true;
            this.$refs.myClosureModalRef.show();

            this.input = ({
                svcledgerid: this.svcledgerid,
                hubid: this.HubId.HubID,
                openingbalance: this.openingbalance,
                codamount: this.codamount,
                bankdeposit: this.depamount,
                bankdepositdate: this.depdate,
                statusid: this.statusid,
                financereasonid: this.finreason ? this.finreason : null,
                financeconfirmamount: this.actualrecamt,
                recoveryamt: this.recoveryamt,
                createdby: this.createdby,
                username: this.localuserid,
                comment: this.comment
            })
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'updateSVCLedger',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(response => {
                    this.subLoading = false;
                    if (response.data.code == 200) {

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
                              req:this.input,
                              res:''
                            }
                          }
                        };

                        axios.post(apiUrl.iptracker_url,paylods);

                        this.FCModal = false;
                        this.comment = "";
                        this.$refs.myClosureModalRef.hide();
                        this.$alertify.success(response.data.msg);
                        this.GetSVCledgerData()
                    } else {
                        this.$alertify.error(response.data.msg);
                    }
                })
                .catch((httpException) => {
                    console.error('exception is:::::::::', httpException);
                    this.subLoading = false;
                    this.$alertify.error('Error Occured');
                });
        },

        //function is used for upload files on AWS s3bucket
        onUpload() {
            this.subLoading = true;

            if (event.target.files.length <= 0) {
                this.subLoading = false;
                return false;
            }

            let selectedFile = event.target.files[0];

            var name = selectedFile.name;
            if (selectedFile.size > 5242880) {
                this.$alertify.error(event.srcElement.placeholder + " Failed! Upload Max File Size Should Not Be Greater Than 5 MB");
                this.subLoading = false;
                return false;
            }

            if (/\.(jpe?g|png|gif|bmp|xls|xlsx|csv|doc|docx|rtf|wks|wps|wpd|excel|xlr|pps|pdf|ods|odt)$/i.test(selectedFile.name)) {
                name = selectedFile.name;
            } else {
                this.$alertify.error(event.srcElement.placeholder + " Failed! Please Upload Only Valid Format: .png, .jpg, .jpeg, .gif, .bmp, .xls, .xlsx, .pdf, .ods, .csv, .doc, .odt, .docx, .rtf, .wks, .wps, .wpd, .excel, .xlr, .pps");
                this.subLoading = false;
                return false;
            }

            const fd = new FormData();
            fd.append('file', selectedFile, name);
            fd.append('s3bucketKey', 'SVC-' + this.batchid);

            if (this.radio == "reason") fd.append('reason', 'Reason');

            axios.post(apiUrl.api_url + 'uploadsvcfile', fd, {
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(res => {
                    this.subLoading = false;
                    if (res.data.errorCode == 0) {
                        this.$alertify.success('Upload successful.');
                        this.FCModal = false;
                        this.$refs.myClosureModalRef.hide();
                        this.GetSVCledgerData();
                    } else {
                        this.$alertify.error('Upload failed, try again.');
                    }
                }, error => {
                    console.error(error);
                    this.subLoading = false;
                });
        },

        // getS3bucketFiles(){
        //
        //   this.input = ({
        //     BatchID : this.batchid,
        //     Reason : '',
        //   });
        //
        //   axios({
        //     method: 'POST',
        //     'url': apiUrl.api_url + 'getfilelist',
        //     'data': this.input,
        //     headers: {
        //       'Authorization': 'Bearer ' + this.myStr
        //     }
        //   })
        //   .then(result => {
        //     this.isLoading = false;
        //     this.uploadFileList = result.data.data;
        //   }, error => {
        //     this.isLoading = false; console.error(error)
        //   })
        // },

        showHideImages(index, elem) {
            if (elem == 'vrrl') {
                $('#vrl' + index).show();
                $('#vri' + index).hide();

                $('#vrri' + index).show();
                $('#vrrl' + index).hide();
            } else {
                $('#vrri' + index).hide();
                $('#vrrl' + index).show();

                $('#vri' + index).show();
                $('#vrl' + index).hide();
            }
        },

        updateFCLedger() {

            this.isLoading = true;
            this.FCModal = true;
            this.$refs.myClosureModalRef.show();

            this.input = ({
                svcledgerid: this.svcledgerid,
                hubid: this.HubId.HubID,
                amount: this.financeclosingamt

            })
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'updateFinanceClosing',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(response => {
                    this.isLoading = false;
                    if (response.data.code == 200) {

                        var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
                        var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
                        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                        var userdetail = JSON.parse(plaintext);

                        var paylods={
                          projectname: "COD Management",
                          type: "web",
                          userid: parseInt(userdetail.userid),
                          username: userdetail.username,
                          routeurl: 'updateFinanceClosing',
                          meta:{
                            event:'updateFinanceClosing',
                            data:{
                              req:this.input,
                              res:''
                            }
                          }
                        };

                        axios.post(apiUrl.iptracker_url,paylods);


                        this.FCModal = false;
                        this.$refs.myClosureModalRef.hide();
                        this.$alertify.success(response.data.msg);
                        this.GetSVCledgerData()
                    } else {
                        this.$alertify.error(response.data.msg);
                    }
                })
                .catch((httpException) => {
                    console.error('exception is:::::::::', httpException);
                    this.isLoading = false;
                    this.$alertify.error('Error Occured');
                });
        },

        //function is used for Delete Deposit Slip from AWS s3bucket
        onDeleteDPS() {
            this.subLoading = true;
            this.FCModal = true;
            this.$refs.myClosureModalRef.show();

            this.input = ({
                svcledgerid: this.svcledgerid,
                BatchID: 'SVC-' + this.batchid,
                username: this.localuserid
            })
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'deleteS3file',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(response => {
                    this.subLoading = false;
                    if (response.data.errorCode == 0) {
                        this.$alertify.success('Reset Deposit Slip Successful.');
                        //this.getS3bucketFiles(this.batchid);
                        this.FCModal = false;
                        this.$refs.myClosureModalRef.hide();
                        this.GetSVCledgerData();
                    } else {
                        this.$alertify.error('Reset Deposit Slip failed, try again.');
                    }
                })
                .catch((httpException) => {
                    console.error('exception is:::::::::', httpException);
                    this.subLoading = false;
                    this.$alertify.error('Error Occured');
                });
        },

        onUpdate: function() {
            if (this.role != 'admin' && this.depdate == '') {
                this.$alertify.error('Bank Deposit date is required.');
                return false;
            }

            if (!this.radio) {
                document.getElementById("cr").innerHTML = "Radio selection is required.";
                return false;
            }
            this.FCModal = false;
            this.$refs.myClosureModalRef.hide();
            this.$refs.myResetModalRef.show();
        },

        getSVCRowData(data) {
            this.$validator.reset();
            this.comment = "";
            this.errors.clear();
            $("#depslip").val('');
            this.FCModal = true;
            this.subLoading = false;
            this.upTyp = 1;
            this.radio = 'dps';
            this.svcledgerid = this.createdby = this.deposittype = this.depamount = this.depdate = this.codamount = this.resetDD = this.resetType = '';
            this.financeclosingamt = this.finreason = this.actualrecamt = this.recoveryamt = this.statusid = this.openingbalance = this.batchid = this.depslip = '';

            this.svcledgerid = data.svcledgerid;
            this.createdby = data.createdby;
            this.deposittype = data.deposittypeid;
            this.depamount = data.bankdeposit;
            this.depdate = data.bankdepositdateymd;
            this.codamount = data.codamount;
            this.financeclosingamt = data.financeclosingamt;
            this.finreason = data.financereasonid;
            this.actualrecamt = data.actualrecamt;
            this.recoveryamt = data.othercharges;
            this.statusid = data.statusid;
            this.openingbalance = data.openingbalance;
            this.resetDD = data.deliverydate;
            this.batchid = data.batchid;

            this.resetType = 'update SVC closure';
        },

        editFC(data) {
            this.$validator.reset();
            this.errors.clear();
            this.FCModal = true;
            this.subLoading = false;
            this.upTyp = 2;
            this.radio = 'dps';
            this.svcledgerid = this.createdby = this.deposittype = this.depamount = this.depdate = this.codamount = this.resetDD = this.resetType = '';
            this.financeclosingamt = this.finreason = this.actualrecamt = this.recoveryamt = this.statusid = this.openingbalance = this.batchid = '';

            this.svcledgerid = data.svcledgerid;
            this.financeclosingamt = data.financeclosingamt;
            this.resetDD = data.deliverydate;

            this.resetType = 'update SVC closure finance closing amount';
        },

        deleteClosure(data) {
            this.resetDD = this.resetType = '';

            this.svcledgerid = data.svcledgerid;
            this.createdby = data.createdby;
            this.depamount = data.bankdeposit;
            this.codamount = data.codamount;
            this.finreason = data.financereasonid;
            this.statusid = data.statusid;
            this.openingbalance = data.openingbalance;
            this.resetDD = data.deliverydate;
            this.comment = "";
            this.resetType = 'reset SVC closure';
            this.$refs.myResetModalRef.show();
        },

        deleteDPS() {
            this.$validator.reset();
            this.errors.clear();
            this.FCModal = false;
            this.$refs.myClosureModalRef.hide();
            this.subLoading = false;
            this.comment = "";
            this.$refs.myResetModalRef.show();
            this.resetType = 'reset SVC closure deposit slip';
        },
    }
}
