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
    }
  },

  computed: {

  },

  mounted() {
  },

  methods: {

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
