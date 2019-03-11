import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'

export default {
  name: 'bankfiletoclosebulkaccount',
  components: {},
  props: [],

  data() {
    return {
      DepositType:""
    }
  },

  computed: {

  },

  mounted() {
  },

  methods: {

    onSubmit: function(res) {
      this.$validator.validateAll().then((result) => {
        console.log('form is valid', result)
        event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
