import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'settings',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  data() {
    return {
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: 0,
      zone:'',
      HubId:'',
      count: 0,
      hubList: [],
      zoneList: [],
      listHubSettingsData: [],
      myStr: '',
      localuserid: 0
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

    this.getZoneData();
    this.GetHubSettingsData();
  },

  methods: {
    multiple(){
      return true;
    },

    //to get All Hub List
    getZoneData() {

      this.input = {}
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.zoneList = result.data.zone.data;
        }, error => {
          console.error(error)
        })
    },

    //to get Hub List According to Zone
    getHubData() {

      if(this.zone==""){
        return false;
      }

      this.input = ({
          zoneid: this.zone
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubList = result.data.hub.data;
        }, error => {
          console.error(error)
        })
    },

    //to get Hub List According to Zone
    GetHubSettingsData() {

      this.input = ({
          offset: this.pageno,
          limit: 10
      })
      this.isLoading = true;

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'gethubsettingsdata',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.listHubSettingsData = result.data;
        }, error => {
          console.error(error)
        })
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetHubSettingsData()
    },

    saveHubSettingsData() {

      let hData = [];
      this.HubId.forEach(function (val) {
          hData.push(val.HubID);
      });

      this.input = ({
          hubid: hData,
          createdby: this.localuserid
      });
      this.isLoading = true;
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'savehubsettings',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
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
          this.saveHubSettingsData();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.zone = this.HubId = '';
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
