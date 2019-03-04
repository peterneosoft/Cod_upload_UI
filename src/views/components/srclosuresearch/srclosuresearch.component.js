import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import CryptoJS from 'crypto-js'

export default {
  name: 'srclosuresearch',
  components: {},
  props: [],

  data() {
    return {
      SR_Name:'',
      SRList:[],
    }
  },

  computed: {

  },

  mounted() {
    this.GetDeliveryAgentData();
  },

  methods: {
    //to get SR List
    GetDeliveryAgentData() {

      var hubEncrypt = window.localStorage.getItem('accesshubdata')
      var hubbytes  = CryptoJS.AES.decrypt(hubEncrypt.toString(), 'Key');
      var hubtext = hubbytes.toString(CryptoJS.enc.Utf8);
      var hubArr=JSON.parse(hubtext);

      this.input = ({
          usertype: "3",
          hubid: [hubArr[0].HubID],
          hubname: hubArr[0].HubName,
          appkey: '$#@COD&&Mang&*^%$$'
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getdeliveryagents',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          this.SRList = result.data.SR;
        }, error => {
          console.error(error)
        })
    },

    //function is used for calculate notes amount
    notesCount(event){

      if(event.srcElement.value){
        document.getElementById("mo"+event.srcElement.id).value = event.srcElement.id * event.srcElement.value;

        var arr = document.getElementsByName('note_amt');
        var tot=0;
        for(var i=0;i<arr.length;i++){
            if(parseInt(arr[i].value))
                tot += parseInt(arr[i].value);
        }
        document.getElementById('tot_amt').value = tot;
      }
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then(() => {
        console.log('form is valid', this.model)
        event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
