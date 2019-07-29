import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'AutoRemittance',
  components: {
      Paginate,
      VueElementLoading,
      Multiselect
  },

  data() {
    return {
      dMY:'',
      localusername: 0,
      filename: "",
      s3link: "",
      s3autolink:"",
      success: 0,
      failed: 0,
      isLoading: false,
      Loading: false,
      remLoading: false
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

    var userToken         = window.localStorage.getItem('accessuserToken');
    this.myStr            = userToken.replace(/"/g, '');

    var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var t = new Date();
    var d = t.getDate();
    var m = strArray[t.getMonth()];
    var y = t.getFullYear();
    this.dMY = '' + (d <= 9 ? '0' + d : d) + ' ' + m + ', ' + y;
  },

  methods: {

    //function is used for upload files on AWS s3bucket
    onUpload(event){
      this.selectedFile = event.target.files[0];
      if ( /\.(csv)$/i.test(this.selectedFile.name) ){
        var name = event.target.name + "." +this.selectedFile.name.split(".").pop();

        const fd = new FormData();
        fd.append('file', this.selectedFile, name);
        this.isLoading = true;
        axios.post(apiUrl.api_url + 'uploadRemittanceFile', fd,
        {
          headers: {
            'Authorization': 'Bearer ' + this.myStr
          }
        })
        .then(res => {
           if(res.data.errorCode == 0){
             this.isLoading = false;
             this.filename = res.data.filename
           }else{
             this.$alertify.error(".csv File does not Upload ");
           }
        }, error => {
          console.error(error)
        });
      }else{
        this.$alertify.error(event.target.placeholder + " Failed! Please Upload Only Valid Format: .csv");
      }
    },
    uploadFile(){
      this.input = ({
          filename: this.filename,
          username: this.localuserid,
      })
      this.Loading = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'remittanceAutoClosure',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          this.failed = result.data.failed;
          this.success = result.data.success;
          this.s3link = result.data.s3link;
          if(result.data.code == 200){
            this.Loading = false;
            this.$alertify.success(result.data.message);
            this.filename = ""
            this.insertEmailRemittance();
          }

        }, error => {
          console.error(error)
          this.Loading = false;
        })
    },

    realTimeCODRemittance(){
      this.remLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'realtimecodremittance?CreatedBy='+this.localuserid,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.remLoading = false;
            this.s3autolink = result.data.s3link;
            this.$alertify.success(result.data.message);
             if(this.s3autolink){
               window.open(this.s3autolink);
             }
          }else{
            this.remLoading = false;
            this.$alertify.error('Remittance data not found');
          }
        }, error => {
          console.error(error)
          this.remLoading = false;
        })
    },

    onSubmit: function(res) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.uploadFile()
        event.target.reset();
       }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    insertEmailRemittance(){
      this.input = ({
          CreatedBy: this.localuserid
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'insertemailremittance',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
        }
      }, error => {
        console.error(error)
      })
    }
  }
}
