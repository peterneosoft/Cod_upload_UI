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
      settingid:'',
      zone:'',
      hubzone:'',
      HubId:[],
      count: 0,
      hubList: [],
      zoneList: [],
      listHubSettingsData: [],
      myStr: '',
      localuserid: 0,
      hubarr:[],
      hubnamearr:[],
      hubidname:[],
      hubName:'',
      values:'',
      editHubSetting: false,
      subLoading: false,
      disableZone: false,
      zoneLoading: false,
      hubLoading: false
    }
  },

  computed: {

  },

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.getZoneData();
    this.GetHubSettingsData();
  },

  methods: {
    handleSelect(event) {
      if (event.HubID == '0') {
        for (let item of this.hubList) {
          if (item.HubID != '0' && this.HubId.some(obj => obj.HubID === item.HubID) === false) {
            this.HubId.push(item);
          }
        }
      }
    },

    multiple(){
      return true;
    },

    //to get All Hub List
    getZoneData() {
      this.zoneLoading=true;
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
          this.zoneLoading=false;
          this.zoneList = result.data.zone.data;
        }, error => {
          this.zoneLoading=false;
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
      this.hubLoading=true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.hubLoading=false;
          this.hubList = [{'HubCode':'All Hub', 'HubID':"0", 'HubName':'All Hub'}];
          for (let item of result.data.hub.data) {
            this.hubList.push(item);
          }
        }, error => {
          this.hubLoading=false;
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

            this.isLoading            = false;
            let totalRows             = result.data.count;
            this.resultCount          = result.data.count;

            if (totalRows < 10) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 10)
            }
          }else{
            this.resultCount  = 0; this.isLoading = false;
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
        if (val.HubID != '0'){
          hData.push({'HubID':val.HubID, 'HubCode': val.HubCode, 'HubName':val.HubName});
        }
      });
      this.hubnamearr = [...new Set([...this.hubarr, ...hData])];

      let arr = this.hubnamearr;
      let arrResult = [];
      let n = arr.length;
      for (i = 0, n; i < n; i++) {
        var item = arr[i];
        if (item.HubID != '0'){
          arrResult[ item.HubID + " - " + item.HubName ] = item; // create associative array
        }
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

      this.disableZone = true;

      this.hubList        = [];
      this.HubId          = [];

      this.settingid      = data.settingid;
      this.zone           = data.zoneid;
      this.hubnamearr     = data.hubnamearr;
      this.hubarr         = data.hubnamearr;
      this.HubId          = data.hubnamearr;
      this.getHubData();
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

      this.subLoading = this.isLoading = true;

      this.input = ({
          settingid: this.settingid,
          zoneid: this.zone,
          hubid: hData,
          createdby: this.localuserid
      });
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'savehubsettings',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(response => {
        this.subLoading = this.isLoading = false;
        if (response.data.errorCode == 0) {
          this.$alertify.success(response.data.msg); this.resetForm(event);
        } else if (response.data.errorCode == -1) {
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          console.error('exception is:::::::::', httpException); this.$alertify.error('Error Occured');
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
      this.zone = this.settingid = ''; this.HubId = []; this.hubList = this.listHubSettingsData = [];
      this.$validator.reset(); this.errors.clear();
      this.editHubSetting = this.disableZone = false;
      this.GetHubSettingsData();
    },
  }
}
