import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';


export default {
  name: 'AddEditClientTAT',
  components: {
    Multiselect
  },
  props: [],

  data() {
    return {
      ClientList:[],
      ClientBusinessList:[],
      ClientAccountsList:[],
      AccountsDeatilsList:[],
      ClientId:"",
      Bussinesstype:"",
      Client:"",
      tat:"",
      type:"",
      Beneficiary:"",
      BankName:"",
      BankAccount:"",
      rtgs:"",
      AccountName:"",
      BeneficiaryName:"",
      BankName:"",
      myStr:"",
      BankAccount:"",
      AddEditClientTAT:true,
      RemittanceDay:[],
      RemittanceDayList: []
    }
  },

  computed: {

  },

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.userid;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
    this.GetClientData();

    this.RemittanceDayList = [
      {day:"Daily"},
      {day:"Sunday"},
      {day:"Monday"},
      {day:"Tuesday"},
      {day:"Wednesday"},
      {day:"Thursday"},
      {day:"Friday"},
      {day:"Saturday"}
    ];
  },

  methods: {
    handleSelect(event) {
      if (event.day == 'Daily') {
        for (let item of this.RemittanceDayList) {
          if (item.day != 'Daily' && this.RemittanceDay.includes(item) === false) {
            this.RemittanceDay.push(item);
          }
        }
      }
    },

    multiple(){
      return true;
    },

    GetClientBusinessConfigList(){
      if(this.ClientId.ClientMasterID == ""){
        return false;
      }
      this.input = ({
        clientid: this.ClientId.ClientMasterID
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/GetClientBusinessConfigList',
          data: this.input,
          headers: {
             'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.AccountName = '';
          this.Bussinesstype = '';
          this.ClientBusinessList = result.data.client.data;
        }, error => {
          console.error(error)
        })
    },

    GetClientBusinessAccounts(){
       if(this.Bussinesstype == ""){
         return false;
       }
      this.input = ({
        clientid: this.ClientId.ClientMasterID,
        businessid:parseInt(this.Bussinesstype)
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/GetClientBusinessAccountsList',
          data: this.input,
          headers: {
             'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
           this.ClientAccountsList = result.data.Accounts.data;
        }, error => {
          console.error(error)
        })
    },

    getAccountDetails(){
      this.input = ({
        ClientBusinessAccountId: this.AccountName
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getAccountDetails',
          data: this.input,
          headers: {
             'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code==200){
            this.Beneficiary = result.data.data.BeneficiaryName
            this.BankName =  result.data.data.ClientBankName
            this.BankAccount = result.data.data.ClientAccountNo
            this.rtgs = result.data.data.ClientBankNeftIFSC
          }
        }, error => {
          console.error(error)
        })
    },

    GetClientData() {
      axios({
        method: 'GET',
        url: apiUrl.api_url + 'external/getclientlist',
        data: {},
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        this.ClientList = result.data.clients.data;
      }, error => {
        console.error(error)
      })
    },

    saveClientCODRemittanceData(event) {

      let dData = [];
      this.RemittanceDay.forEach(function (val) {
        if(val.day!='Daily'){
          dData.push(val.day);
        }
      });

      this.input = ({
          ClientId: this.ClientId.ClientMasterID,
          RemittanceType: this.type,
          RemittanceDay: dData.join(),
          TAT: this.tat,
          Cycle: "",
          CustomerMailId: "",
          IsActive: true,
          HoldingAmount: 0,
          CreatedBy: this.localuserid
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'saveclientcodremittancedetail',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then((response) => {
        if (response.data.errorCode == 0) {
          this.$alertify.success(response.data.msg);
          this.resetForm(event);
        } else if (response.data.errorCode == -1) {
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException)
      });
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.saveClientCODRemittanceData(event);
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    onSearch: function(event) {
      this.$validator.validateAll().then((result) => {
        console.log('resultsssss==', result);
        if(result){

        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },
  }
}
