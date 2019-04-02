import apiUrl from '../../../constants'
import axios from 'axios'
import {Validator} from 'vee-validate'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';

export default {
  name: 'CODRemitanceClose',
  components: {Multiselect},
  props: [],

  data() {
    return {
      fromDate:"",
      myStr:"",
      ClientId:"",
      ClientList:[],
      selected: 'DeliveryDate',
        options: [
          { text: 'Delivery Date', value: 'DeliveryDate' },
          { text: 'Transaction Date', value: 'TransactionDate' }
        ],
        value: null,
       optionss: ['list', 'of', 'options']
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
