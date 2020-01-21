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
          LastModifiedBy: this.localuserid,
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'deliveredtoinscan',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then((response) => {
        if (response.data.errorCode == 0) {
          this.submitLoading = false;
          this.resetForm();
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
        this.getShipmentReport()
    },

    //to get All Zone Wise RSC List
    getShipmentReport() {
      if(/\s/g.test(this.shipmentid) == true || this.shipmentid.indexOf(',') > -1){
        this.shipmentid = this.shipmentid.replace(/ /g,'').split(',');
      }
      if(Array.isArray(this.shipmentid) == false){
        this.shipmentid = new Array(this.shipmentid);
      }
      console.log('this.shipmentid==', this.shipmentid);

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
          this.shipmentLoading = this.submitLoading = false;
          this.shipmentList = result.data;
        }, error => {
          this.shipmentLoading = this.submitLoading = false;
          console.error(error)
          this.$alertify.error('Error Occured');
        })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0;
          this.getShipmentReport()
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
