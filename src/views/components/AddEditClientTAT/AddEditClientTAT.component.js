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
      editparams: '',
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
    this.RemittanceDayList = [{
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

    multiple() {
      return true;
    },

    async GetClientBusinessConfigList() {
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
      await this.getAccountDetailsTemp();
    },
    async getAccountDetailsTemp() {
      if (this.AccountName) {
        this.bankDLoading = true;
      }
      this.input = ({
        ClientBusinessAccountId: this.AccountName
      })
      axios({
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
            this.Beneficiary = result.data.data.BeneficiaryName
            this.BankName = result.data.data.ClientBankName
            this.BankAccount = result.data.data.ClientAccountNo
            this.rtgs = result.data.data.ClientBankNeftIFSC
            if (this.editparams == "") {
              this.ContactEmailid = result.data.data.SecondaryEmailid
            } else
            if (this.editparams !== "") {
              this.ContactEmilid = this.editparams;
            }
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
        AccountName: $("#AccountName option:selected").text(),
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'editclientcodremittancedetail',
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
      this.errors.clear();

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
      this.Beneficiary = data.BeneficiaryName;
      this.BankName = data.ClientBankName;
      this.BankAccount = data.ClientAccountNo;
      this.rtgs = data.NEFTNo;
      this.ClientId.ClientMasterID = data.ClientId;
      this.CId = data.ClientId;
      this.Bussinesstype = data.BussinessType;
      this.BType = data.BussinessType;
      this.AccountName = data.AccountId;
      this.ContactEmailid = "";
      await this.GetClientBusinessConfigList();
      await this.GetClientBusinessAccounts();
      this.ContactEmailid = data.CustomerMailId;
      this.editparams = data.CustomerMailId;
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

    onSearch: function(event) {
      if (this.Client.AccountId == null || this.Client.AccountId == 'undefined') {
        document.getElementById("clienterr").innerHTML = "Client is required.";
        return false;
      }
      document.getElementById("clienterr").innerHTML = "";
      this.searchClientCODRemittanceData(event);
    },

    getPaginationData(pageNum) {
      this.pageno = (pageNum - 1) * 10
      this.searchClientCODRemittanceData()
    },

    resetForm(event) {
      this.RemittanceDay = [];
      this.ClientId = this.Bussinesstype = this.AccountName = this.tat = this.type = this.Beneficiary = this.BankName = this.BankAccount = this.rtgs = '';
      this.$validator.reset();
      this.errors.clear();
      this.ClientCODRemmitanceId = "";
      this.searchClientCODRemittanceData(event);
    },

    resetSearch(event) {
      this.Client = '';
      this.$validator.reset();
      this.errors.clear();
      this.ClientCODRemmitanceId = "";
      this.pageno = this.resultCount = 0;
      this.searchClientCODRemittanceData(event);
      document.getElementById("clienterr").innerHTML = "";
    },

    scrollWin() {
      window.scrollBy(0, -1000);
    }
  }
}
