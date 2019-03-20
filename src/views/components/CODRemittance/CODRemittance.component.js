import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'mapbankhub',
  components: {
      Paginate,
      VueElementLoading,
      Multiselect
  },

  data() {
    return {
      pageno: 0,
      pagecount: 0,
      isLoading: false,
      resultCount: '',
      ClientId: '',
      ClientList: [],
      RemittanceDay: '',
      RemittanceDayList: [],
      listCODRemittanceData: [],
      calcModal: false,
    }
  },

  computed: {

  },

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.userid;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');

    this.GetClientData();

    this.RemittanceDayList = [
      {day:"Sunday"},
      {day:"Monday"},
      {day:"Tuesday"},
      {day:"Wednesday"},
      {day:"Thursday"},
      {day:"Friday"},
      {day:"Saturday"}
    ]
  },

  methods: {
    setid(name, key){
      return name+key;
    },

    multiple(){
      return true;
    },
    GetClientData() {

      axios({
        method: 'GET',
        url: apiUrl.api_url + 'external/getclientlist',
        data: {},
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        this.ClientList = result.data.clients.data;
      }, error => {
        console.error(error)
      })
    },

    searchCODRemittanceData(event){
      let cData = [];
      this.ClientId.forEach(function (val) {
        cData.push(val.ClientMasterID);
      });

      let dData = [];
      this.RemittanceDay.forEach(function (val) {
        dData.push(val.day);
      });

      this.input = ({
          offset: this.pageno,
          limit: 10,
          RemittanceDay: dData,
          ClientId: cData
      })
      this.isLoading = true;

      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'codremittancemaster?RemittanceDay='+dData+'&ClientId='+cData+'&offset='+this.pageno+'&limit=10',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){

          const clientsArray = this.ClientList;

          if(clientsArray.length>0){
            result.data.data.rows.map(item => {
              if(item.ClientId){
                  let obj = clientsArray.find(el => el.ClientMasterID === item.ClientId);
                  item.Company = obj.CompanyName;
              }
            });
          }

          this.listCODRemittanceData = result.data.data.rows;
          this.isLoading = false;
          let totalRows     = result.data.data.count;
          this.resultCount  = result.data.data.count;
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
          //this.resetForm(event);
        }else{
          this.listCODRemittanceData = [];
          this.resultCount  = 0;
          this.isLoading = false;
        }
      }, error => {
          console.error(error)
      })
    },

    exportCODRemittanceData(){
      let cData = [];
      this.ClientId.forEach(function (val) {
        cData.push(val.ClientMasterID);
      });

      let dData = [];
      this.RemittanceDay.forEach(function (val) {
        dData.push(val.day);
      });

      this.input = ({
          RemittanceDay: dData,
          ClientId: cData
      })

      axios({
          method: 'GET',
          'url': apiUrl.api_url + 'exportcodremittance?RemittanceDay='+dData+'&ClientId='+cData,
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          //this.listCODRemittanceData = result.data.data.rows;
        }else{
        }
      }, error => {
          console.error(error)
      })
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.searchCODRemittanceData()
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
           this.searchCODRemittanceData(event);
         }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm(event) {
      this.pageno = 0;
      this.RemittanceDay = this.ClientId = '';
      this.$validator.reset();
      this.errors.clear();
      event.target.reset();
    },

    checkAll(form) {
      var myForm = document.forms[form];
      let toggle = document.getElementById("checkAll").value;

      for( var i=1; i < myForm.length; i++ ) {
        if(toggle == 'on'){ document.getElementById("checkItem"+i).checked = true; }else{ document.getElementById("checkItem"+i).checked = false; }
        //console.log('checkItem'+i, document.getElementById("checkItem"+i).value);
      }
      if(toggle=='on'){ document.getElementById("checkAll").value = 'off'; }else{ document.getElementById("checkAll").value = 'on'; }
    },

    calc() {
      this.calcModal = true;
      let RemittanceId = [];
      $.each($("input[name='item']:checked"), function(){
        RemittanceId.push($(this).val());
      });

      //alert("RemittanceDetailsId are: " + RemittanceId.join(", "));
    },

    closeCalcModal() {
        this.calcModal = false,
        this.$validator.reset();
        this.errors.clear();
    },
  }
}
