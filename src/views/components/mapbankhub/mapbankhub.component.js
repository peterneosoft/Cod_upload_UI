import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'

export default {
  name: 'mapbankhub',
  components: {},

  data() {
    return {
      BankName:'',
      CodeName:'',
      HubId:'',
      hubList: [],
      BankList: [],
    }
  },

  computed: {

  },

  mounted() {
    this.getHubData();
    this.GetBankData();
  },

  methods: {
    //function is used for get Bank List
    GetBankData() {
      this.input = {}

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getBankList',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          this.BankList = result.data.result.data;
        }, error => {
          console.error(error)
        })
    },

    //to get All Hub List
    getHubData() {
      this.input = {}

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallhubs',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          this.hubList = result.data.hub.data;
        }, error => {
          console.error(error)
        })
    },

    onSubmit: function(result) {
      this.$validator.validateAll().then((result) => {
        console.log('form is valid',result)
        event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
