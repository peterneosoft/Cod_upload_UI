import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'

export default {
  name: 'svcdepositexception',
  components: {},

  data() {
    return {
      HubId:'',
      hubList: [],
    }
  },

  computed: {

  },

  mounted() {
    this.getHubData();
  },

  methods: {
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
