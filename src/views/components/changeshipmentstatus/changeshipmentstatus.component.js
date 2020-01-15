import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'changeshipmentstatus',
  components: {
    Paginate,
    VueElementLoading,
    Multiselect
  },
  props: [],

  data() {
    return {
      shipmentid:'',
      shipmentstatus:1,
      pageno:0,
      pagecount:0,
      isLoading:false,
      submitLoading:false,
      shipmentList:[]
    }
  },

  computed: {

  },

  mounted() {
    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;
  },

  methods: {
    changeShipmentStatus(event) {
      this.submitLoading = true;
      this.input = ({
          ShippingID: this.shipmentid,
          CurrentHubID: this.CurrentHubID,
          LastModifiedBy: this.localuserid,
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'changeShipmentStatus',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then((response) => {
        if (response.data.errorCode == 0) {
          this.submitLoading = false;
          this.AddEditClientTAT=0;
          this.$alertify.success(response.data.msg);
          this.resetForm(event);
        } else if (response.data.errorCode == -1) {
          this.submitLoading = false;
          this.$alertify.error(response.data.msg)
        }
      })
      .catch((httpException) => {
          this.submitLoading = false;
          console.error('exception is:::::::::', httpException)
          this.$alertify.error('Error Occured');
      });
    },

    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.getCODOutstandingReport()
    },

    //to get All Zone Wise RSC List
    getRSCData(zoneid) {
      if(zoneid==""){
        return false;
      }
      this.input = ({
          zoneid: zoneid
      })
      this.RSCLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonersc',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.RSCLoading = false;
          this.RSCName=[];
          this.RSCList = [{HubID:'0', HubName:'All RSC', HubCode:'All RSC'}].concat(result.data.rsc.data);
        }, error => {
          this.RSCLoading = false;
          console.error(error)
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0; this.exportf = false;
          this.getCODOutstandingReport()
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.zone=""; this.hubList=[]; this.HubId=[]; this.RSCList = []; this.RSCName = []; this.pageno = 0;
      this.CODOutstandingReport = []; this.exportf = false; this.disableHub = false; this.resultCount = 0;
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
