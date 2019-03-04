import apiUrl from '../../../constants'
import axios from 'axios'
import {
  Validator
} from 'vee-validate'
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'financeclosure',
  components: {
    Treeselect
  },
  data() {
    return {
      zone:'',
      HubId:'',
      status:'open',
      isLoading: false,
      resultCount: '',
      reason: '',
      pagecount: 0,
      count: 0,
      hubList: [],
      zoneList: [],
      multiple: true,
      clearable: true,
      searchable: true,
      openOnClick: true,
      clearOnSelect: true,
    }
  },

  computed: {

  },

  mounted() {
    this.getZoneData();
  },

  methods: {

    //to get Hub List According to Zone
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
          var data = [];
          result.data.hub.data.forEach(function (hubData) {
            data.push({
              id:hubData.HubID,
              label:hubData.HubName
            });
          });
          this.hubList = data;
        }, error => {
          console.error(error)
        })
    },

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

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        //this.getDesignationData()
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
