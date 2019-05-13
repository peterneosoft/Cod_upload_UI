import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'mapbankhub',
  components: {
      Paginate,
      VueElementLoading,
      Multiselect
  },

  data() {
    return {
      exportPath:'',
      exportFileTitle:'',
      localusername: 0,
      filename: "",
      paymentfile: "",
      s3link: "",
      success: 0,
      failed: 0,
      isLoading: false,
      Loading: false
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

    var today = new Date().toISOString().slice(0, 10);

    this.exportPath       = 'https://usermanegement.s3.ap-south-1.amazonaws.com/CODRemittance/codrem-'+today+'.csv';
    this.exportFileTitle  = 'Click here to download current day COD Remittance file';
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
          }

        }, error => {
          console.error(error)
          this.Loading = false;
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
    }
  }
}
