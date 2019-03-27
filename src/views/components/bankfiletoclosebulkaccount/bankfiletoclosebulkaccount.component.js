import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import CryptoJS from 'crypto-js'

export default {
  name: 'bankfiletoclosebulkaccount',
  components: {},
  props: [],

  data() {
    return {
      localusername: 0,
      filename: "",
      paymentfile: "",
      s3link: "",
      success: 0,
      failed: 0
    }
  },

  computed: {

  },

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localusername      = userdetail.username;


  },

  methods: {

    //function is used for upload files on AWS s3bucket
    onUpload(event){
      this.selectedFile = event.target.files[0];

      if ( /\.(csv)$/i.test(this.selectedFile.name) ){
        var name = event.target.name + "." +this.selectedFile.name.split(".").pop();


        var userToken = window.localStorage.getItem('accessuserToken')
        var myStr = userToken.replace(/"/g, '');

        const fd = new FormData();
        fd.append('file', this.selectedFile, name);

        axios.post(apiUrl.api_url + 'uploadFile', fd,
        {
          headers: {
            'Authorization': 'Bearer ' + myStr
          }
        })
        .then(res => {

           if(res.data.errorCode == 0){
             this.filename = res.data.filename
           }else{
             this.$alertify.error(".csv File does not Upload ");
           }
           console.log("this.filename",this.filename);
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
          username: this.localusername,
      })
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'financeBulkClosure',
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
            this.$alertify.success(result.data.message);
          }

        }, error => {
          console.error(error)
        })
    },
    onSubmit: function(res) {
      this.$validator.validateAll().then((result) => {
        if(result){

        event.target.reset();
       }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
