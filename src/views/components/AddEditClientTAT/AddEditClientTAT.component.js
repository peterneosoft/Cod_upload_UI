import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';


export default {
  name: 'mapbankhub',
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
      TAT:"",
      bank:"",
      Beneficiary:"",
      BankName:"",
      RemittanceDay:"",
      BankAccount:"",
      RTGS:"",
      AccountName:"",
      BeneficiaryName:"",
      BankName:"",
      myStr:"",
      BankAccount:"",
      AddEditClientTAT:false
    }
  },

  computed: {

  },

  mounted() {
    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
    this.GetClientData()
  },

  methods: {
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
            this.Beneficiary = result.data.data.BeneficiaryName
            this.BankName =  result.data.data.ClientBankName
            this.BankAccount = result.data.data.ClientAccountNo
            this.RTGS = result.data.data.ClientBankNeftIFSC
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
    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        console.log('form is valid', this.model)
        event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
