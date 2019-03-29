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
      ClientId:"",
      Client:"",
      RemittanceDay:"",
      BeneficiaryName:"",
      BankName:"",
      myStr:"",
      BankAccount:"",
      TAT:""
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
