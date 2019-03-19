import apiUrl from '../../../constants'
import axios from 'axios'


import {
  Validator
} from 'vee-validate'

export default {
  name: 'CODRemitanceClose',
  components: {},
  props: [],

  data() {
    return {
      fromDate:"",
      selected: 'DeliveryDate',
        options: [
          { text: 'Delivery Date', value: 'DeliveryDate' },
          { text: 'Transaction Date', value: 'TransactionDate' }
        ],
        value: null,
       optionss: ['list', 'of', 'options']
    }
  },

  computed: {

  },

  mounted() {
  },

  methods: {

    //function is used for calculate notes amount
    // notesCount(event){
    //
    //   if(event.srcElement.value){
    //     document.getElementById("mo"+event.srcElement.id).value = event.srcElement.id * event.srcElement.value;
    //
    //     var arr = document.getElementsByName('note_amt');
    //     var tot=0;
    //     for(var i=0;i<arr.length;i++){
    //         if(parseInt(arr[i].value))
    //             tot += parseInt(arr[i].value);
    //     }
    //     document.getElementById('tot_amt').value = tot;
    //   }
    // },
    //
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
