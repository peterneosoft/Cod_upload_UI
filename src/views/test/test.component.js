import apiUrl from '../../constants'
import axios from 'axios'
import Paginate from 'vuejs-paginate'
import { required, minLength, between } from 'vuelidate/lib/validators'

export default {
  name:'test',
  data () {
    return {
      model: {
        name: '',
        email: '',
        bio: '',
        gender: '',
        frameworks: [],
        subscribe: false,
        languages: [],
        happy:'',
        coupon: ''
      }
    }
  },
  created: function() {
    VeeValidate.Validator.extend('verify_coupon', {
      getMessage: (field) => `The ${field} is not a valid coupon.`,
      validate: (value) => new Promise(resolve => {
        const validCoupons = ['SUMMER2017', 'WINTER2017', 'FALL2017'];
        resolve({
            valid: value && (validCoupons.indexOf(value.toUpperCase()) > -1)
          });
      })
    });
  },
  methods: {
    onSubmit: function() {
      this.$validator.validateAll().then(() => {
          console.log('form is valid', this.model)
      }).catch(() => {
          console.log('errors exist', this.errors)
      });
    }
  }

}