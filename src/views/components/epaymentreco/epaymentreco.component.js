import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import CryptoJS from 'crypto-js'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'epaymentreco',
  components: {
    VueElementLoading
  },
  props: [],

  data() {
    return {
      localusername: 0,
      filename: "",
      paymentfile: "",
      s3link: "",
      success: 0,
      failed: 0,
      isLoading: false,
      Loading: false,
      downLoading:false,
      disbutton:false,
      myStr:"",
      epaymenttype:'',
      fromDate:'',
      toDate:'',
      misLoading:false,
      resultCount:0,
      exportf:false,
      excelLoading:false,
      listClientCODRemittanceData:[]
    }
  },

  computed: {

  },

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localusername    = userdetail.username;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];
  },

  methods: {

    //function is used for upload files on AWS s3bucket
    onUpload(event){
      this.selectedFile = event.target.files[0];
      if ( /\.(csv)$/i.test(this.selectedFile.name) ){
        var name = event.target.name + "." +this.selectedFile.name.split(".").pop();

        const fd = new FormData();
        fd.append('file', this.selectedFile, name);
        this.isLoading = this.disbutton = true;
        axios.post(apiUrl.api_url + 'uploadEPaymentRecoFile', fd,
        {
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(res => {
          this.isLoading = this.disbutton = false;
          if(res.data.errorCode == 0){
             this.filename = res.data.filename
           }else{
             this.$alertify.error(".csv File Upload Error");
           }
        }, error => {
          console.error(error)
          this.isLoading = this.disbutton = false;
          this.$alertify.error('Error Occured');
        });
      }else{
        this.isLoading = this.disbutton = false;
        this.$alertify.error(event.target.placeholder + " Failed! Please Upload Only Valid Format: .csv");
      }
    },

    uploadFile(){
      this.selectedFile = event.target;
      console.log(this.selectedFile);
      if ( /\.(csv)$/i.test(this.selectedFile.name) ){
        var name = event.target.name + "." +this.selectedFile.name.split(".").pop();
      }

      this.input = ({
          filename: name,
          username: this.localusername,
      })
      this.isLoading = this.disbutton = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'ePaymentReco',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.isLoading = this.disbutton = false;
          this.failed = result.data.failed;
          this.success = result.data.success;
          this.s3link = result.data.s3link;

          if(result.data.code == 200){
            this.filename = "";
            this.$alertify.success(result.data.message);
          }
        }, error => {
          this.isLoading = this.disbutton = false;
          console.error(error); this.$alertify.error('Error Occured');
        })
    },

    downloadsamplecsv(){
      this.downLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'downloadsamplecsv?filename=sample&createdby='+this.localusername,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
             if(result.data.s3link){
               window.open(result.data.s3link);
             }
          }
          this.downLoading = false;
        }, error => {
          this.downLoading = false;
          console.error(error); this.$alertify.error('Error Occured');
        })
    },

    onSubmit: function(res) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.uploadFile()
          event.target.reset();
       }
      }).catch(() => {
        console.log(this.errors); this.$alertify.error('Error Occured');
      });
    },

    resetData(event){
      this.paymentfile = this.epaymenttype = this.fromDate = this.toDate = ''; this.disbutton = false; this.resultCount = 0;
      this.$validator.reset(); this.errors.clear();
    },
  }
}
