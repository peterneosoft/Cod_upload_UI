import apiUrl from '../../../constants'
import axios from 'axios'
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';

export default {
  name: 'svcclosuresearch',
  components: {
    Paginate,
    VueElementLoading
  },
  data() {
    return {
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: '',
      toDate: '',
      fromDate: '',
      listSVCledgerData: []
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];
  },

  methods: {
    searchSVCledgerData(){
      this.pageno = 0;
      this.GetSVCledgerData();
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetSVCledgerData()
    },

    GetSVCledgerData() {
      this.input = ({
          offset: this.pageno,
          limit: 10,
          fromDate: this.fromDate,
          toDate: this.toDate
      })
      this.isLoading = true;

      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'svcledgermaster',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '
          }
      })
      .then(result => {
          this.listSVCledgerData = result.data.rows;
          this.isLoading    = false;
          let totalRows     = result.data.count
          this.resultCount  = result.data.count
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
      }, error => {
          console.error(error)
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.searchSVCledgerData();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    }
  }
}
