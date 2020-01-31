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
      shipmentstatus:1,
      shipmentLoading:false,
      submitLoading:false,
      shipmentList:[],
      confModalShow:false
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
    showConfirmationModal(event){
      this.$refs.myConfModalRef.show()
    },
    hideConfModal(ele) {
      if(ele == 0){
        this.$refs.myConfModalRef.hide()
        this.changeShipmentStatus();
      }else{
        this.$refs.myConfModalRef.hide();
      }
    },
    closeStatusRoleModal() {
      this.confModalShow = false
    },

    changeShipmentStatus(event) {
      this.submitLoading = true;
      this.input = ({
          ShipmentArr: this.shipmentid,
          LastModifiedBy: this.localuserid,
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'updateShipmentStatus',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then((response) => {
        if (response.data.code == 200) {
          this.submitLoading = false;
          this.$alertify.success(response.data.message)
          this.getShipmentReport();
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

    //to get All Zone Wise RSC List
    getShipmentReport() {
      this.pageno = 0;
      if(/\s/g.test(this.shipmentid) == true || this.shipmentid.indexOf(',') > -1){
        this.shipmentid = this.shipmentid.replace(/"|'| |,\s*$/g,'').split(',');
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
            this.resultCount      = result.data.count;

            this.pagecount = 1;
          }else{
            this.shipmentLoading = this.submitLoading = false;
            this.resultCount  = 0
          }
        }, error => {
          this.shipmentLoading = this.submitLoading = false;
          console.error(error)
          this.$alertify.error('Error Occured');
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){

          if(/\s/g.test(this.shipmentid) == true || this.shipmentid.indexOf(',') > -1){
            this.shipmentid = this.shipmentid.replace(/"|'| |,\s*$/g,'').split(',');
          }
          if(Array.isArray(this.shipmentid) == false){
            this.shipmentid = new Array(this.shipmentid);
          }

          this.showConfirmationModal(event);

          this.pageno = 0;
          this.updateShipmentStatus()
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.pageno = this.resultCount = 0; this.shipmentList = []; this.shipmentLoading = false; this.shipmentstatus = 1;
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
