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
    name: 'changeshipmentstatus',
    components: {
        Paginate,
        VueElementLoading,
        Multiselect
    },
    props: [],

    data() {
        return {
            shipmentid: '',
            shipmentids: '',
            pageno: 0,
            pagecount: 0,
            resultCount: 0,
            epaymenttype: '',
            epaymenttypes: '',
            epaymentname: '',
            epaymentnames: '',
            epaymenttypes: '',
            digitalAmts: '',
            OEpayType: '',
            NEpayType: '',
            eptype: '',
            epname: '',
            hubid: '',
            shipmentLoading: false,
            submitLoading: false,
            confModalShow: false,
            EpaymentNameList: [],
            shipmentList: [],
            EpaymentHybridList: [],
            cashAmt: '',
            digitalAmt: '',
            NetPayment: '',
            selected: 'changepaymode',
            options: [{
                    text: 'Change Payment Mode',
                    value: 'changepaymode'
                },
                {
                    text: 'Bulk Update',
                    value: 'bulkupdate'
                }
            ],
            allclientwise: 1,
        }
    },

    computed: {

    },

    mounted() {
        var userToken = window.localStorage.getItem('accessuserToken')
        this.myStr = userToken.replace(/"/g, '');

        var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
        var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        var userdetail = JSON.parse(plaintext);
        this.localuserid = userdetail.username;

        this.EpaymentNameList = [
            { 'EpaymentType': 'cash', 'EpaymentName': 'Cash' },
            { 'EpaymentType': 'wallet', 'EpaymentName': 'PayTM' },
            { 'EpaymentType': 'payphi', 'EpaymentName': 'Payphi' },
            { 'EpaymentType': 'card', 'EpaymentName': 'Mosambee' },
            { 'EpaymentType': 'razorpay', 'EpaymentName': 'Razorpay' },
        ];

        this.EpaymentHybridList = [
            { 'EpaymentType': 'wallet', 'EpaymentName': 'Wallet' },
            { 'EpaymentType': 'payphi', 'EpaymentName': 'Payphi' },
            { 'EpaymentType': 'card', 'EpaymentName': 'Card' },
            { 'EpaymentType': 'razorpay', 'EpaymentName': 'Razorpay' },
        ];

    },

    methods: {
        showConfirmationModal(event) {
            this.$refs.myConfModalRef.show()
        },

        changeRadio(ele) {
            this.listCODPaymentData = [];
            this.resultCount = 0;
            this.allclientdata = [];

            $(".labelcls").html('');

            if (this.selected == 'changepaymode') {
                this.allclientwise = 1;
            } else if (this.selected == 'bulkupdate') {
                this.allclientwise = 2;
            }

            this.shipmentList = [];
            this.resultCount = 0;
            this.shipmentid = '';
            this.epaymenttype = '';
            this.epaymentname = '';
            this.epaymenttypes = '';
            this.epaymentnames = '';

        },

        hideConfModal(ele) {
            if (ele == 0) {
                this.$refs.myConfModalRef.hide()
                this.updatePaymentMode();
            } else {
                this.$refs.myConfModalRef.hide();
            }
        },
        closeStatusRoleModal() {
            this.confModalShow = false
        },

        updatePaymentMode(event) {
            this.submitLoading = true;

            this.input = ({
                ShippingID: this.shipmentid,
                lastmodifiedby: this.localuserid,
                EPaymentTypeFrom: this.OEpayType,
                EPaymentType: this.eptype,
                EPaymentName: this.epname,
                hubid: this.hubid,
                CashPayment: this.cashAmt,
                DigitalPayment: this.digitalAmt
            })
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'updatepaymentmode',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then((response) => {
                    if (response.data.errorCode == 0) {
                        this.submitLoading = false;
                        this.$alertify.success(response.data.msg);
                        this.getShipmentReport();
                        this.resetForm();
                    } else if (response.data.errorCode == -1) {
                        this.submitLoading = false;
                        this.$alertify.error(response.data.msg);
                    }
                })
                .catch((httpException) => {
                    this.submitLoading = false;
                    console.error('exception is:::::::::', httpException)
                    this.$alertify.error('Error Occured');
                });
        },
        isNumber: function(evt) {
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
              evt.preventDefault();;
            } else {
              return true;
            }
          },
        //to get shipment data using shipping id
        getShipmentReport() {
            this.pageno = 0;
            if (this.shipmentid.indexOf(',') > -1) {
                this.$alertify.error("Enter only one shipment id at a time, please check.");
                return false;
            }

            if (/"|'| \s*$/g.test(this.shipmentid) == true) {
                this.shipmentid = this.shipmentid.replace(/"|'| \s*$/g, '');
            }
            if (Array.isArray(this.shipmentid) == false) {
                this.shipmentid = new Array(this.shipmentid);
            }

            this.shipmentLoading = this.submitLoading = true;
            axios({
                    method: 'POST',
                    url: apiUrl.api_url + 'getShipmentReport',
                    'data': ({ ShippingID: this.shipmentid }),
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then(result => {
                    this.shipmentList = [];
                    this.NetPayment = '';
                    if (result.data.code == 200) {

                        this.shipmentLoading = this.submitLoading = false;
                        this.shipmentList = result.data.data;
                        this.hubid = this.shipmentList[0].CurrentHubID;
                        this.OEpayType = this.shipmentList[0].EpaymentType;
                        this.NetPayment = this.shipmentList[0].NetPayment;
                        this.resultCount = result.data.count;
                        this.pagecount = 1
                    } else {
                        this.shipmentLoading = this.submitLoading = false;
                        this.resultCount = 0;
                        this.$alertify.error(result.data.msg);
                    }
                }, error => {
                    this.shipmentLoading = this.submitLoading = false;
                    this.NetPayment = '';
                    console.error(error)
                    this.$alertify.error('Error Occured');
                })
        },

        GetEpaymentName() {
            this.epaymentname = this.epaymenttype;
        },
        GetEpaymentNames() {
            this.epaymentnames = this.epaymenttypes;
        },
        bulkShipmentUpdate() {
            this.submitLoading = true;

            let shipmentidsings = this.shipmentids.split(',');

            this.input = ({
                ShippingIDArr: shipmentidsings,
                lastmodifiedby: this.localuserid,
                EPaymentTypeFrom: 'Cash',
                EPaymentType: this.eptypes,
                EPaymentName: this.epnames
            })
            axios({
                    method: 'POST',
                    'url': apiUrl.api_url + 'updatebulkpaymentmode',
                    'data': this.input,
                    headers: {
                        'Authorization': 'Bearer ' + this.myStr
                    }
                })
                .then((response) => {
                    this.submitLoading = false;

                    if (response.data.code == 200) {
                        this.$alertify.success(response.data.message);
                        this.selected = 'bulkupdate';
                        this.epaymenttypes = '';
                        this.epaymentnames = '';
                        this.shipmentids = '';

                        // this.resetForm();
                    }

                    if (response.data.code == 204) {
                        this.$alertify.error(response.data.message);
                    }

                })
                .catch((httpException) => {
                    this.submitLoading = false;
                    console.error('exception is:::::::::', httpException)
                    this.$alertify.error('Error Occured');
                });

        },

        onSubmit: function(event) {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    if (this.allclientwise == 1) {
                        if (this.shipmentid.indexOf(',') > -1) {
                            this.$alertify.error("Enter only one shipment id at a time, please check.");
                            return false;
                        }

                        if (/"|'| \s*$/g.test(this.shipmentid) == true) {
                            this.shipmentid = this.shipmentid.replace(/"|'| \s*$/g, '');
                        }

                        if (Array.isArray(this.shipmentid) == true) {
                            this.shipmentid = this.shipmentid.toString();
                        }
                        this.NEpayType = this.epaymenttype.charAt(0).toUpperCase() + this.epaymenttype.slice(1);
                        this.eptype = event.target[3].selectedOptions[0].text;
                        this.epname = event.target[4].selectedOptions[0].text;

                        if (this.epaymenttype == 'hybrid') {
                            if (parseFloat(Math.round(parseFloat(this.cashAmt) + parseFloat(this.digitalAmt))) != parseFloat(Math.round(this.NetPayment))) {
                                this.$alertify.error('Invalid cash amount, sum of cash & digital amount should be equal to net payment.');
                                return false;
                            }
                        } else {
                            this.cashAmt = '';
                            this.digitalAmt = '';
                        }

                        this.showConfirmationModal(event);

                    } else {

                        this.eptypes = event.target[3].selectedOptions[0].text;
                        this.epnames = event.target[4].selectedOptions[0].text;

                        this.bulkShipmentUpdate();
                    }
                }
            }).catch(() => {
                console.log('errors exist', this.errors)
            });
        },

        resetForm() {
            this.pageno = this.resultCount = 0;
            this.shipmentList = [];
            this.shipmentLoading = false;
            this.epaymenttype = this.epaymentname = '';
            this.OEpayType = this.NEpayType = this.eptype = this.epname = this.hubid = '';
            this.NetPayment = '';
            this.cashAmt = '';
            this.digitalAmt = '';
            this.$validator.reset();
            this.errors.clear();
            this.allclientwise = 1;
            this.selected = 'changepaymode';
        },
        resetFormbulk() {

            this.pageno = this.resultCount = 0;
            this.shipmentList = [];
            this.shipmentLoading = false;
            this.epaymenttype = this.epaymentname = '';
            this.OEpayType = this.NEpayType = this.eptype = this.epname = this.hubid = '';
            this.NetPayment = '';
            this.cashAmt = '';
            this.digitalAmt = '';
            this.$validator.reset();
            this.errors.clear();
            this.allclientwise = 2;
            this.selected = 'bulkupdate';
        }
    }
}