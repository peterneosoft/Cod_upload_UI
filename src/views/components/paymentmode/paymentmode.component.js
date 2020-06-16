import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import CryptoJS from 'crypto-js';

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
      pageno:0,
      pagecount:0,
      resultCount:0,
      epaymenttype:'',
      epaymentname:'',
      OEpayType:'',
      NEpayType:'',
      eptype:'',
      epname:'',
      hubid:'',
      shipmentLoading:false,
      submitLoading:false,
      confModalShow:false,
      EpaymentNameList:[],
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

    this.EpaymentNameList = [
      {'EpaymentType':'cash', 'EpaymentName':'Cash'},
      {'EpaymentType':'wallet', 'EpaymentName':'PayTM'},
      {'EpaymentType':'payphi', 'EpaymentName':'Payphi'},
      {'EpaymentType':'card', 'EpaymentName':'Mosambee'},
      {'EpaymentType':'razorpay', 'EpaymentName':'Razorpay'},
    ];
  },

  methods: {
    showConfirmationModal(event){
      this.$refs.myConfModalRef.show()
    },
    hideConfModal(ele) {
      if(ele == 0){
        this.$refs.myConfModalRef.hide()
        this.updatePaymentMode();
      }else{
        this.$refs.myConfModalRef.hide();
      }
    },
    closeStatusRoleModal() {
      this.confModalShow = false
    },

    updatePaymentMode(event) {
      this.submitLoading = true;

      this.input = ({
          ShippingID: this.shipmentid,
          lastmodifiedby: this.localuserid,
          EPaymentTypeFrom:this.OEpayType,
          EPaymentType: this.eptype,
          EPaymentName: this.epname,
          hubid: this.hubid
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'updatepaymentmode',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then((response) => {
        if (response.data.errorCode == 0) {
          this.submitLoading = false;
          this.$alertify.success(response.data.msg);
          this.getShipmentReport();
          this.resetForm();
        } else if (response.data.errorCode == -1) {
          this.submitLoading = false;
          this.$alertify.error(response.data.msg);
        }
      })
      .catch((httpException) => {
          this.submitLoading = false;
          console.error('exception is:::::::::', httpException)
          this.$alertify.error('Error Occured');
      });
    },

    //to get shipment data using shipping id
    getShipmentReport() {
      this.pageno = 0;
      if(this.shipmentid.indexOf(',') > -1){
        this.$alertify.error("Enter only one shipment id at a time, please check.");
        return false;
      }

      if(/"|'| \s*$/g.test(this.shipmentid) == true){
        this.shipmentid = this.shipmentid.replace(/"|'| \s*$/g,'');
      }
      if(Array.isArray(this.shipmentid) == false){
        this.shipmentid = new Array(this.shipmentid);
      }

      this.shipmentLoading = this.submitLoading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'getShipmentReport',
          'data': ({ ShippingID: this.shipmentid }),
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.shipmentList = [];
          if(result.data.code == 200){

            this.shipmentLoading  = this.submitLoading = false;
            this.shipmentList     = result.data.data;
            this.hubid            = this.shipmentList[0].CurrentHubID;
            this.OEpayType        = this.shipmentList[0].EpaymentType;
            this.resultCount      = result.data.count;
            this.pagecount        = 1
          }else{
            this.shipmentLoading = this.submitLoading = false;
            this.resultCount  = 0
            this.$alertify.error(result.data.msg);
          }
        }, error => {
          this.shipmentLoading = this.submitLoading = false;
          console.error(error)
          this.$alertify.error('Error Occured');
        })
    },

    GetEpaymentName() {
      this.epaymentname = this.epaymenttype;
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){

          if(this.shipmentid.indexOf(',') > -1){
            this.$alertify.error("Enter only one shipment id at a time, please check.");
            return false;
          }

          if(/"|'| \s*$/g.test(this.shipmentid) == true){
            this.shipmentid = this.shipmentid.replace(/"|'| \s*$/g,'');
          }

          if(Array.isArray(this.shipmentid) == true){
            this.shipmentid = this.shipmentid.toString();
          }
          this.NEpayType    = this.epaymenttype.charAt(0).toUpperCase() + this.epaymenttype.slice(1);
          this.eptype = event.target[1].selectedOptions[0].text;
          this.epname = event.target[2].selectedOptions[0].text;

          this.showConfirmationModal(event);
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.pageno = this.resultCount = 0; this.shipmentList = []; this.shipmentLoading = false; this.epaymenttype = this.epaymentname = '';
      this.OEpayType = this.NEpayType = this.eptype = this.epname = this.hubid = '';
      this.$validator.reset(); this.errors.clear();
    },
  }
}
