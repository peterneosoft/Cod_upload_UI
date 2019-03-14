import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'

export default {
  name: 'bankfiletoclosebulkaccount',
  components: {},
  props: [],

  data() {
    return {
      DepositType:""
    }
  },

  computed: {

  },

  mounted() {
  },

  methods: {

    //function is used for upload files on AWS s3bucket
    onUpload(event){

      this.selectedFile = event.target.files[0];

      if ( /\.(csv)$/i.test(this.selectedFile.name) ){
        var name = event.srcElement.name + "." +this.selectedFile.name.split(".").pop();

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
           console.log(res);
        }, error => {
          console.error(error)
        });
      }else{
        this.$alertify.error(event.srcElement.placeholder + " Failed! Please Upload Only Valid Format: .csv");
      }
    },

    onSubmit: function(res) {
      this.$validator.validateAll().then((result) => {
        console.log('form is valid', result)
        event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
