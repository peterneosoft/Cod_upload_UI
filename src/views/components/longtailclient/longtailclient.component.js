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

export default {
  name: 'longtailclient',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },

  data() {
    return {
      resultCount: 0,
      pagecount: 0,
      pageno: 0,
      Client: [],
      SearchClientIds: [],
      clientLoading: false,
      ClientList: [],
      isLoading: false,
      listPendingRemittanceData: [],
      //remDate:'',
      fromDate: '',
      toDate: '',
      selected: 'Initiated',
      options: [{
          text: 'Remittance Cycle',
          value: 'Initiated'
        },
        {
          text: 'Payments On Hold',
          value: 'Hold'
        },
        {
          text: 'Payments Approved',
          value: 'Done'
        }
      ],
      checkAll: false,
      ClientArr: [],
      singleArr: [],
      ModalShow: false,
      excelLoading: false,
      reportlink: '',
      status: '',
      exceptionList: [],
      shipmentList: [],
      shipLoading: false,
      modalShipmentShow: false,
      FCModal: false,
      SearchCIds: [],
      holdremark: '',
      comment: '',
      commentModalShow: false,
      bulkResp: [],
      isFirefox: false,
      delvLoading: false,
      delvcycle: [],
      SearchDelvcycleIds: [],
      DelvCycleList: [],
      SearchDIds: [],
      utrno: ''
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    //remDate.max = ;
    fromDate.max = toDate.max = date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail = JSON.parse(plaintext);
    this.localuserid = userdetail.username;

    var userToken = window.localStorage.getItem('accessuserToken');
    this.myStr = userToken.replace(/"/g, '');

    // Firefox 1.0+
    this.isFirefox = typeof InstallTrigger !== 'undefined';

    this.GetClientData();
    this.getLTCRemittanceStatusWise();
  },

  methods: {
    changeRadio(ele) {
      document.getElementById('ltcform').reset();
      document.getElementById("fdate").innerHTML = "";
      this.checkAll = false;
      this.reportlink = ''; //this.remDate = '';
      this.fromDate = this.toDate = '';
      this.SearchClientIds = [];
      this.Client = [];
      this.bulkResp = [];
      this.getLTCRemittanceStatusWise();
    },

    multipleC() {
      let key = this.Client.length - 1;
      if (this.Client.length > 0 && this.Client[key].ClientId == 0) {
        this.SearchClientIds = [];
        this.Client = this.Client[key];

        for (let item of this.ClientList) {
          if (item.ClientId != 0) {
            this.SearchClientIds.push(item.ClientId);
          }
        }
      }

      if (this.Client.ClientId == 0) {
        return false;
      } else {
        this.SearchClientIds = [];
        return true;
      }
    },

    multipleD() {
      let key = this.delvcycle.length - 1;
      if (this.delvcycle.length > 0 && this.delvcycle[key].fromDate == 0) {
        this.SearchDelvcycleIds = [];
        this.delvcycle = this.delvcycle[key];

        for (let item of this.DelvCycleList) {
          if (item.fromDate != 0) {
            this.SearchDelvcycleIds.push(item.fromDate);
          }
        }
      }

      if (this.delvcycle.fromDate == 0) {
        return false;
      } else {
        this.SearchDelvcycleIds = [];
        return true;
      }
    },

    GetClientData() {
      this.clientLoading = true;
      this.ClientList = [];
      this.DelvCycleList = [];
      this.delvLoading = true;
      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getLTCClientList',
        data: ({
          username: this.localuserid
        }),
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      }).then(result => {
        if (result.data.code == 200) {
          this.ClientList = [{
            ClientId: '0',
            CompanyName: 'All Client'
          }].concat(result.data.data);
          this.DelvCycleList = [{
            fromDate: '0',
            cycle: 'All Cycle'
          }].concat(result.data.remitcycle);
        }
        this.clientLoading = false;
        this.delvLoading = false;
      }, error => {
        this.clientLoading = false;
        this.delvLoading = false;
        console.error(error)
      })
    },

    getLTCRemittanceStatusWise() {
      this.isLoading = true;
      this.listPendingRemittanceData = [];
      let clientIdArr = [];
      this.bulkResp = [];
      let delvCycleArr = [];

      if (this.SearchClientIds.length > 0) {
        clientIdArr = this.SearchClientIds;
      } else {
        if ($.isArray(this.Client) === false) {
          this.Client = new Array(this.Client);
        }

        this.Client.forEach(function(val) {
          clientIdArr.push(val.ClientId);
        });
      }
      this.SearchCIds = clientIdArr;

      if (this.SearchDelvcycleIds.length > 0) {
        delvCycleArr = this.SearchDelvcycleIds;
      } else {
        if ($.isArray(this.delvcycle) === false) {
          this.delvcycle = new Array(this.delvcycle);
        }

        this.delvcycle.forEach(function(val) {
          delvCycleArr.push(val.fromDate);
        });
      }
      this.SearchDIds = delvCycleArr;

      this.input = ({
        ClientId: this.SearchCIds,
        Status: this.selected,
        CreatedBy: this.localuserid,
        //fromDate: this.fromDate?this.fromDate:this.remDate?this.remDate:'',
        fromDate: this.fromDate ? this.fromDate : '',
        toDate: this.toDate ? this.toDate : '',
        offset: this.pageno,
        limit: 10,
        remitcycle: this.SearchDIds
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getLTCRemittanceStatusWise',
          data: this.input,
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          this.resultCount = 0;
          if (result.data.code == 200) {
            this.listPendingRemittanceData = result.data.data;
            this.resultCount = result.data.count;

            let totalRows = result.data.count;
            if (totalRows < 10) {
              this.pagecount = 1
            } else {
              this.pagecount = Math.ceil(totalRows / 10)
            }
          }
          this.isLoading = false;
        }, error => {
          console.error(error);
          this.isLoading = false;
          this.$alertify.error('Error Occured');
        })
    },

    closeStatusRoleModal() {
      $('span[id^="popUpText"]').hide();
      this.utrno = '';
      this.holdremark = '';
      this.ModalShow = false;
      this.modalShipmentShow = false;
      this.FCModal = false;
      this.commentModalShow = false;
    },

    //to get pagination
    getPaginationData(pageNum) {
      this.pageno = (pageNum - 1) * 10
      this.getLTCRemittanceStatusWise();
    },

    check() {
      this.checkAll = !this.checkAll;
      this.ClientArr = [];
      this.singleArr = [];
      if (this.checkAll) {
        for (let i in this.listPendingRemittanceData) {
          this.ClientArr.push(this.listPendingRemittanceData[i]);
        }
      }
    },

    updateCheck() {
      if (this.listPendingRemittanceData.length == this.ClientArr.length) {
        this.checkAll = true;
      } else {
        this.checkAll = false;
      }
    },

    PopUp(elem) {
      $('span[id^="popUpText"]').hide();
      this.checkAll = false;
      $("#popUpText" + elem).fadeIn();
    },

    action(type, data) {
      $('span[id^="popUpText"]').hide();
      document.getElementById("utrHolderr").style.display = "none";
      this.ClientArr = [];
      this.singleArr = [];
      this.status = '';
      this.status = type;

      this.singleArr.push(data);
      if (type == 'Hold' || type == 'UTR') {
        this.FCModal = true;
        this.$refs.myClosureModalRef.show();
      } else {
        this.$refs.myModalRef.show();
      }
    },

    bulkAction(type) {
      this.status = '';
      this.holdremark = '';
      if (this.ClientArr.length > 0) {
        this.status = type;

        if (type == 'Hold') {
          this.FCModal = true;
          this.$refs.myClosureModalRef.show();
        } else {
          this.$refs.myModalRef.show();
        }
      } else {
        this.$alertify.error('Error: Please Check Checkboxes Before Perform Any Bulk Action.');
      }
    },

    hideModal(ele) {
      document.getElementById("utrHolderr").style.display = "none";
      this.$refs.myModalRef.hide();
      if (ele == 0) {
        this.remittance();
      } else {
        this.holdremark = '';
        this.utrno = '';
      }
    },

    remittance() {
      this.isLoading = true;
      let clientArr = '';
      clientArr = [...new Set([].concat(...this.ClientArr.concat(this.singleArr)))];

      if (this.status == 'Hold') {
        clientArr.map(item => {
          item.Remark = this.holdremark;
        });
      }

      let url = 'ltcremittanceManualClosure';
      if (this.status == 'UTR') {
        url = 'updateUTR';
        this.input = ({
          RemittanceId: this.singleArr[0].RemittanceId,
          UTRNo: this.utrno,
          username: this.localuserid
        });
      } else {
        this.input = ({
          remittanceArray: clientArr,
          Status: this.status,
          CreatedBy: this.localuserid
        });
      }

      axios({
        method: 'POST',
        'url': apiUrl.api_url + url,
        'data': this.input,
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      }).then(result => {
        if (result.data.code == 200) {
          this.$alertify.success(result.data.msg);
          this.reportlink = '';
          this.getLTCRemittanceStatusWise();
        } else {
          this.$alertify.error(result.data.msg)
        }
        this.isLoading = false;
        this.ClientArr = [];
        this.singleArr = [];
        this.checkAll = false;
        this.holdremark = '';
        this.utrno = '';
      }, error => {
        this.isLoading = false;
        this.checkAll = false;
        this.ClientArr = [];
        this.singleArr = [];
        this.holdremark = '';
        this.utrno = '';
        this.$alertify.error('Remittance Error');
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        this.resultCount = 0;
        this.pagecount = 1;
        if ((this.fromDate && this.toDate) && (this.fromDate > this.toDate)) {
          document.getElementById("fdate").innerHTML = "LHS date should not be greater than RHS date.";
          return false;
        } else if ((this.fromDate && !this.toDate) || (!this.fromDate && this.toDate)) {
          document.getElementById("fdate").innerHTML = "Please select date range instead of single date.";
          return false;
        } else {
          this.pageno = 0;
          this.reportlink = '';
          this.ClientArr = [];
          document.getElementById("fdate").innerHTML = "";
          this.bulkResp = [];
          this.getLTCRemittanceStatusWise();
        }
      }).catch(() => {
        console.log('errors exist', this.errors);
        this.$alertify.error('Error Occured');
      });
    },

    resetForm() {
      //this.remDate = '';
      this.resultCount = 0;
      this.pagecount = 1;
      this.fromDate = this.toDate = '';
      this.pageno = 0;
      this.Client = this.CODLedgerReports = [];
      this.resultCount = 0;
      this.bulkResp = [];
      this.delvcycle = [];
      this.excelLoading = false;
      this.ClientArr = this.exceptionList = this.shipmentList = [];
      this.SearchCIds = [];
      this.SearchDIds = [];
      this.holdremark = '';
      this.utrno = '';
      this.$validator.reset();
      this.errors.clear();
    },

    exportData() {
      if (this.reportlink) {
        window.open(this.reportlink);
      } else {
        this.excelLoading = true;
        let api = '';

        if (this.selected == 'Done') {
          this.input = ({
            ClientId: this.SearchCIds,
            fromDate: this.fromDate ? this.fromDate : '',
            toDate: this.toDate ? this.toDate : '',
            remitcycle: this.SearchDIds
          });

          api = 'exportApprovedRemittance ';
        } else {
          this.input = ({
            CreatedBy: this.localuserid
          });

          api = 'exportBulkLTCRemittance';
        }

        axios({
            method: 'POST',
            url: apiUrl.api_url + api,
            data: this.input,
            headers: {
              'Authorization': 'Bearer ' + this.myStr
            }
          })
          .then(result => {
            if (result.data.code == 200) {
              this.reportlink = result.data.data;
              window.open(this.reportlink);
            } else {
              this.reportlink = '';
              this.$alertify.error(this.selected == 'Done' ? 'Approved Remittance File Not Available.' : 'File Not Available For Bulk Remittance.');
            }
            this.excelLoading = false;
          }, error => {
            this.reportlink = '';
            this.excelLoading = false;
            console.error(error);
            this.$alertify.error(this.selected == 'Done' ? 'Approved Remittance File Error.' : 'Bulk Remittance File Error.');
          })
      }
    },

    onUpload(event) {
      let selectedFile = event.target.files[0];
      if (/\.(csv)$/i.test(selectedFile.name)) {
        var name = event.target.name + "." + selectedFile.name.split(".").pop();

        const fd = new FormData();
        fd.append('file', selectedFile, name);
        this.excelLoading = true;
        axios.post(apiUrl.api_url + 'uploadLTCRemittanceFile', fd, {
            headers: {
              'Authorization': 'Bearer ' + this.myStr
            }
          })
          .then(res => {
            if (res.data.errorCode == 0 && res.data.filename) {
              this.isLoading = true;
              this.bulkResp = [];
              this.input = ({
                filename: res.data.filename,
                username: this.localuserid
              })
              axios({
                  method: 'POST',
                  url: apiUrl.api_url + 'bulkLTCRemittance',
                  data: this.input,
                  headers: {
                    'Authorization': 'Bearer ' + this.myStr
                  }
                })
                .then(result => {
                  this.reportlink = '';
                  if (result.data.code == 200) {
                    this.$alertify.success(result.data.message);
                    this.bulkResp.push({
                      'success': result.data.success ? result.data.success : 0,
                      'failed': result.data.failed ? result.data.failed : 0,
                      's3link': result.data.s3link ? result.data.s3link : ''
                    });
                  } else {
                    this.$alertify.error(result.data.message);
                  }
                }, error => {
                  console.error(error);
                  this.$alertify.error('Bulk Remittance Error.');
                });
              this.isLoading = false;
            } else {
              this.$alertify.error(res.data.msg);
            }
            this.excelLoading = false;
          }, error => {
            console.error(error);
            this.excelLoading = false;
            this.$alertify.error('File Upload Error');
          });
      } else {
        this.excelLoading = false;
        this.$alertify.error(event.target.placeholder + " Failed! Please Upload Only Valid Format: .csv");
      }
    },

    ltcRemitShipments(fromDate, toDate, clientId) {
      this.shipLoading = true;
      this.exceptionList = this.shipmentList = [];
      this.$refs.ShipmentModalRef.show();

      this.input = ({
        fromDate: fromDate,
        toDate: toDate,
        ClientId: clientId,
        Status: this.selected
      })
      axios({
        method: 'POST',
        url: apiUrl.api_url + 'getltcremitshipments',
        data: this.input,
        headers: {
          'Authorization': 'Bearer ' + this.myStr
        }
      }).then(result => {
        if (result.data.code == 200) {
          this.shipmentList = result.data.Shipments;
        }
        this.shipLoading = false;
      }, error => {
        this.shipLoading = false;
        console.error(error);
        this.$alertify.error('Shipment Error');
      })
    },

    exShipments(arr) {
      this.exceptionList = this.shipmentList = [];
      this.$refs.ShipmentModalRef.show();
      this.exceptionList = arr;
    },

    onUpdate: function() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          if (this.status != 'Hold') {
            this.holdremark = '';
          }
          if (this.status != 'UTR') {
            this.utrno = '';
          }
          this.$refs.myClosureModalRef.hide();
          this.$refs.myModalRef.show();
        } else {
          if (this.status == 'UTR' || this.status == 'Hold') {
            document.getElementById("utrHolderr").style.display = "block";
          }
          this.$alertify.error('Update Error');
        }
      }).catch(() => {
        console.log('errors exist', this.errors);
        this.$alertify.error('Error Occured');
      });
    },

    showComment(ele) {
      this.comment = [];
      this.comment = ele;
      this.$refs.myCommentModalRef.show();
    },

    addDelvCycle() {
      this.input = ({
        fromDate: this.fromDate,
        toDate: this.toDate
      })
      this.delvLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getdeliverycycle',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(result => {
          this.delvLoading = false;
          this.RSCName = [];
          this.RSCList = [];
          if (result.data.rsc.code == 200) {
            this.RSCList = [{
              HubID: '0',
              HubName: 'All RSC',
              HubCode: 'All RSC'
            }].concat(result.data.rsc.data);
          }
        }, error => {
          this.RSCLoading = false;
          console.error(error)
        })
    },
  }
}
