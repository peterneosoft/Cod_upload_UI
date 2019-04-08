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
      HubId:[],
      count: 0,
      hubList: [],
      zoneList: [],
      listHubSettingsData: [],
      myStr: '',
      localuserid: 0,
      hubarr:[],
      hubnamearr:[],
      harr:'',
      editHubSetting: false,
      disableButton: true
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
          if(result.data.code == 200){
            this.listHubSettingsData  = result.data.data;
            this.hubnamearr           = result.data.data[0].hubnamearr;
            this.harr                 = result.data.data[0].harr;
            this.hubarr               = result.data.data[0].hubnamearr;
            this.isLoading            = false;
            let totalRows             = result.data.count;
            this.resultCount          = result.data.count;
            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }else{
            this.disableButton = false;
            this.resultCount  = 0;
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
        })
    },

    removeHubData(data, index) {
      if(data.HubID){
        let obj = this.hubnamearr.find(el => el.HubID === data.HubID);
        this.hubnamearr.splice(index, 1);
        this.HubId = this.hubnamearr;
      }
    },

    addHubData(event) {
      this.editHubSetting = true,
      this.hubarr = this.HubId;

      let hData = [];
      this.HubId.forEach(function (val) {
          hData.push({'HubID':val.HubID, 'HubName':val.HubName});
      });
      this.hubnamearr = [...new Set([...this.hubarr, ...hData])];

      let arr = this.hubnamearr;
      let arrResult = [];
      let n = arr.length;
      for (i = 0, n; i < n; i++) {
        var item = arr[i];
        arrResult[ item.HubID + " - " + item.HubName ] = item; // create associative array
      }

      var i = 0;
      var nonDuplicatedArray = [];
      for(var item in arrResult) {
        nonDuplicatedArray[i++] = arrResult[item]; // copy the objects that are now unique
      }
      this.hubnamearr = nonDuplicatedArray;
    },

    getHubSettingRowData(data) {
      this.$validator.reset();
      this.errors.clear();

      this.settingid  = data.settingid;
      this.HubID      = data.hubid;
      this.HubId      = this.hubnamearr;

      this.disableButton = false;
      this.getZoneData();
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetHubSettingsData();
    },

    saveHubSettingsData() {

      let hData = [];
      this.HubId.forEach(function (val) {
          hData.push(val.HubID);
      });

      this.disableButton = false;

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
      .then(response => {
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
      this.editHubSetting = false;
      this.disableButton = true;
      this.GetHubSettingsData();
    },
  }
}
