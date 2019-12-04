import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'E-MailRemittance',
  components: {
      Paginate,
      VueElementLoading
  },

  data() {
    return {
      localusername: 0,
      resultCount: 0,
      pagecount: 0,
      pageno: 0,
      count: 0,
      isLoading: false,
      listEmailRemittanceData:[],
      ClientArr: [],
		  checkAll: false,
      currentdate: '',
      modalShow:false,
      isSent:false,
      disableButton: true
    }
  },

  computed: {},

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    var userToken         = window.localStorage.getItem('accessuserToken');
    this.myStr            = userToken.replace(/"/g, '');

    var date = new Date();
    this.currentdate = date.toISOString().split("T")[0];

    this.getEmailRemittanceClients();
  },

  methods: {
    setid(name, key){
      return name+key;
    },

    showModal(){
      this.modalShow = true;
    },

    closeModal(elem) {
      this.modalShow = false;

      if(elem===true){
        this.emailRemittance();
      }else{
        return false;
      }
    },

    check() {
      this.checkAll = !this.checkAll;
			this.ClientArr = [];
			if (this.checkAll) {
				for (let i in this.listEmailRemittanceData) {
          this.ClientArr.push(this.listEmailRemittanceData[i].ClientId);
				}
        this.disableButton = false;
			}else{
        this.disableButton = true;
      }
		},

    updateCheck(){
      if(this.listEmailRemittanceData.length == this.ClientArr.length){
         this.checkAll = true;
      }else{
         this.checkAll = false;
      }

      if(this.ClientArr.length>0){
        this.disableButton = false;
      }else{
        this.disableButton = true;
      }
    },

    getEmailRemittanceClients(){
      this.isLoading = true; this.isSent = false;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'emailremittanceclients?CreatedBy='+this.localuserid+'&RemittanceDate='+this.currentdate+'&offset='+this.pageno+'&limit='+20,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.isLoading = false;
            this.isSent = true;
            this.listEmailRemittanceData  = result.data.data;
            this.resultCount  = result.data.count;
            let totalRows     = result.data.count;
            if (totalRows < 20) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 20)
            }
          }else{
            this.listEmailRemittanceData=[];
            this.resultCount  = 0;
            this.isLoading = false;
            this.isSent = false;
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
          this.isSent = false;
        })
    },

    emailRemittance(){
      this.isLoading = true;

      this.input = ({
          RemittanceDate: this.currentdate,
          Clients: this.ClientArr,
          CreatedBy: this.localuserid
      })
      axios({
        method: 'POST',
        'url': apiUrl.api_url + 'SendMailRemittanceReport',
        'data': this.input,
        headers: {
            'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        if (result.data.code == 200) {
          this.$alertify.success(result.data.msg);
          this.ClientArr=[]; this.checkAll = false;
          this.getEmailRemittanceClients();
        } else {
          this.isLoading = false;
          this.$alertify.error(result.data.msg)
        }
      }, error => {
        this.isLoading = false;
        this.$alertify.error('Error Occured');
      })
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 20;
        this.listEmailRemittanceData=[]; this.ClientArr=[];
        this.checkAll = false; this.disableButton = true;
        this.getEmailRemittanceClients();
    }
  }
}
