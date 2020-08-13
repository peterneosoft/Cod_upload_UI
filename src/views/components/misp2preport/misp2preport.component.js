import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'

export default {
  name: 'hubwisecodreport',
  components: {},
  props: [],

  data() {
    return {
      zoneList:[],
      hubList:[],
      zone:"",
      HubId:"",
      toDate:"",
      fromDate:""

    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});
    this.getZoneData();
  },

  methods: {
    //to get All Hub List
    getZoneData() {
      this.input = {}
      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getallzones',
          data: this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          this.zoneList = result.data.zone.data;
        }, error => {
          console.error(error)
        })
    },
    getHubData() {

      if(this.zone==""){
        return false;
      }

      this.input = ({
          zoneid: this.zone
      })

      axios({
          method: 'POST',
          url: apiUrl.api_url + 'external/getzonehub',
          'data': this.input,
          headers: {
            'Authorization': 'Bearer '
          }
        })
        .then(result => {
          this.hubList = result.data.hub.data;
        }, error => {
          console.error(error)
        })
    },

    onSubmit: function() {
      this.$validator.validateAll().then((result) => {
        if(this.toDate>this.fromDate){
        let error = document.getElementById("t_d");
         error.innerHTML = "ToDate must greater than FromDate";
         error.style.display = "block";
      }

        event.target.reset();
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
