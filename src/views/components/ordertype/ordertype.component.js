import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import CryptoJS from 'crypto-js';

export default {
  name: 'ordertype',
  components: {
    Paginate,
    VueElementLoading
  },
  props: [],

  data() {
    return {
      shipmentid:'',
      pageno:0,
      pagecount:0,
      resultCount:0,
      netpayment:'',
      ordertype:'',
      status:'',
      OOrderType:'',
      NOrderType:'',
      hubid:'',
      shipmentLoading:false,
      submitLoading:false,
      confModalShow:false,
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
    showConfirmationModal(event){
      this.$refs.myConfModalRef.show()
    },
    hideConfModal(ele) {
      if(ele == 0){
        this.$refs.myConfModalRef.hide()
        this.updateOrderType();
      }else{
        this.$refs.myConfModalRef.hide();
      }
    },
    closeStatusRoleModal() {
      this.confModalShow = false
    },

    updateOrderType(event) {
      this.submitLoading = true;

      this.input = ({
          ShippingID: this.shipmentid,
          OrderTypeFrom:this.OOrderType,
          OrderTypeTo: this.ordertype,
          NetPayment: (this.netpayment != '' ? this.netpayment : 0),
          Status: this.status,
          username: this.localuserid
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'updateOrderType',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then((response) => {

        if (response.data.code == 200) {

          this.$alertify.success(response.data.msg);
          this.getShipmentReport();
          this.resetForm();
        }else{

          this.$alertify.error(response.data.msg);
        }
        this.submitLoading = false;
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
            this.status           = this.shipmentList[0].Status;
            this.OOrderType       = this.shipmentList[0].OrderType;
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
          this.NOrderType   = this.ordertype;
          this.showConfirmationModal(event);
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.pageno = this.resultCount = 0; this.shipmentList = []; this.shipmentLoading = false;
      this.ordertype = this.status = this.OOrderType = this.NOrderType = this.hubid = this.netpayment = '';
      this.$validator.reset(); this.errors.clear();
    },

    changeNetPaym(){
      if(this.ordertype!='COD') this.netpayment = '';
    }
  }
}
