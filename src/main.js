// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import VeeValidate from 'vee-validate'
import Vuelidate from 'vuelidate'
import VueAlertify from "vue-alertify"
import VCalendar from 'v-calendar'
import 'v-calendar/lib/v-calendar.min.css'
import './fonts/HELR65W.woff'
import './fonts/Roboto-Regular.woff'

Vue.use(VueAlertify)
Vue.use(VeeValidate)
Vue.use(Vuelidate)

Vue.use(BootstrapVue)
Vue.use(VCalendar)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
})
