import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import CryptoJS from 'crypto-js'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'bankfiletoclosebulkaccount',
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
      datacsv : [],
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

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
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
        axios.post(apiUrl.api_url + 'uploadFile', fd,
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
      this.input = ({
          filename: this.filename,
          username: this.localusername,
      })
      this.isLoading = this.disbutton = true;
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'financeBulkClosure',
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
          this.datacsv = result.data.s3link;

          if(result.data.code == 200){
            this.$alertify.success(result.data.message);
            this.filename = ""
            var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
            var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
            var plaintext = bytes.toString(CryptoJS.enc.Utf8);
            var userdetail = JSON.parse(plaintext);

            var paylods={
              projectname: "COD Management",
              type: "web",
              userid: parseInt(userdetail.userid),
              username: userdetail.username,
              routeurl: 'financeBulkClosure',
              meta:{
                event:'financeBulkClosure',
                data:{
                  req:this.input,
                  res:''
                }
              }
            };

            axios.post(apiUrl.iptracker_url,paylods);
          }

        }, error => {
          console.error(error)
          this.isLoading = this.disbutton = false;
          this.$alertify.error('Error Occured');
        })
    },

    failureClick(){
      this.isLoading = this.disbutton = true;
      const filename = 'failure_data.csv'
      this.downloadCSV(filename);
      this.isLoading = this.disbutton = false;
    },

    downloadCSV(filename) {
      if (this.datacsv.length === 0) {
        console.error('No data available to download');
        return;
      }

      const csvContent = this.generateCSV(this.datacsv);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    generateCSV(data) {
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];

      data.forEach((row) => {
        const values = headers.map(header => row[header]);
        csvRows.push(values.join(','));
      });

      return csvRows.join('\n');
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
          console.error(error)
          this.downLoading = false;
          this.$alertify.error('Error Occured');
        })
    },

    onSubmit: function(res) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.uploadFile()
          event.target.reset();
       }
      }).catch(() => {
        console.log(this.errors)
        this.$alertify.error('Error Occured');
      });
    },

    resetData(event){
      this.paymentfile = '';
      this.disbutton = false;
      this.$validator.reset();
      this.errors.clear();
    },
  }
}
