import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'

export default {
  name: 'svcclosurep2p',
  components: {},
  props: [],

  data() {
    return {
      Deposit_Amount:"",
      SR_Name:"",
      tot_amt:""
    }
  },

  computed: {

  },

  mounted() {
  },

  methods: {
    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
         if(result){
          if((this.tot_amt != '0' && this.tot_amt != this.Deposit_Amount)||!this.tot_amt){
            let error = document.getElementById("d_a");
             error.innerHTML = " 	Enter Denomination details. Amount mismatches";
             error.style.display = "block";
          }else{
            let error = document.getElementById("d_a");
             error.innerHTML = "The Deposit Amount Fields is Required";
             error.style.display = "None";
          }
        }
          // event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    //function is used for calculate notes amount
    notesCount(event){
      if(event.target.id){
        document.getElementById("mo"+event.target.id).value = event.target.id * event.target.value;
        var arr = document.getElementsByName('note_amt');
        this.tot_amt = 0;
        for(var i=0;i<arr.length;i++){
            if(parseInt(arr[i].value))
                this.tot_amt += parseInt(arr[i].value);
        }
        document.getElementById('tot_amt').value = this.tot_amt;
      }
    },
  }
}
