import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import { Validator } from 'vee-validate'
import Paginate from 'vuejs-paginate'
import VueElementLoading from 'vue-element-loading';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'ManualRemittance',
  components: {
      Paginate,
      VueElementLoading,
      Multiselect
  },

  data() {
    return {
      localusername: 0,
      resultCount: 0,
      pagecount: 0,
      pageno: 0,
      count: 0,
      isLoading: false,
      listPendingRemittanceData:[],
      listPendingRemittanceDataToDate:[],
      fromDate:'',
      toDate:'',
      form: {
          toDate: []
      }
    }
  },

  computed: {

  },

  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes             = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail        = JSON.parse(plaintext);
    this.localuserid      = userdetail.username;

    var userToken         = window.localStorage.getItem('accessuserToken');
    this.myStr            = userToken.replace(/"/g, '');

    this.manualCODRemittance();
  },

  methods: {
    setid(name, key){
      return name+key;
    },

    onChangeDate(fromDate, toDate, ClientId){
      if(!toDate){
        return false;
      }

      if(fromDate > toDate){
         document.getElementById("fdate"+ClientId).innerHTML="To / Delivery date should not be less than From date.";
         return false;
      }else{
        document.getElementById("fdate"+ClientId).innerHTML="";
      }

      this.isLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'manualcodremittance?CreatedBy='+this.localuserid+'&ClientId='+ClientId+'&fromDate='+fromDate+'&toDate='+toDate+'&offset='+this.pageno+'&limit='+20,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.isLoading = false;
            this.listPendingRemittanceDataToDate  = result.data.data;

            let alldata = this.listPendingRemittanceData;
            let todatedata = this.listPendingRemittanceDataToDate;

            alldata.map(item => {
              let obj = todatedata.find(el => el.ClientId === item.ClientId);
              if(obj){
                item.ToDate           = obj.ToDate;
                item.DeliveryDate     = obj.DeliveryDate;
                item.ShipmentCount    = obj.ShipmentCount;
                item.CODAmount        = obj.CODAmount;
                item.FreightAmount    = obj.FreightAmount;
                item.PaidAmount       = obj.PaidAmount;
                item.BalanceAmount    = obj.BalanceAmount;
                item.HoldAmount       = obj.HoldAmount;
                item.TotalOustanding  = obj.TotalOustanding;
                item.ExceptionAmount  = obj.ExceptionAmount;
                item.ExceptionCount   = obj.ExceptionCount;
              }
            });

            this.listPendingRemittanceData = alldata;

            alldata.forEach((val,key)=>{
              this.form.toDate[val.ClientId] = val.ToDate;
            });
          }else{
            this.listPendingRemittanceDataToDate=[];
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
        })
    },

    onRemittance(data){
      this.input = ({
          FromDate: data.FromDate,
          ToDate: data.ToDate,
          ShipmentCount: data.ShipmentCount,
          ClientId: data.ClientId,
          CODAmount: data.CODAmount,
          PaidAmount: data.PaidAmount,
          BalanceAmount: data.BalanceAmount,
          HoldAmount: data.HoldAmount,
          TotalOustanding: data.TotalOustanding,
          ExceptionAmount: data.ExceptionAmount,
          ExceptionCount: data.ExceptionCount,
          TotalRevenue: data.TotalRevenue,
          FreightAmount: data.FreightAmount,
          CreatedBy: this.localuserid
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'remittanceManualClosure',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      }).then(result => {
        if (result.data.code == 200) {
          this.$alertify.success(result.data.msg);
          this.manualCODRemittance();
        } else {
          this.$alertify.error(result.data.msg)
        }
      }, error => {
        console.error(error)
        this.Loading = false;
      })
    },

    manualCODRemittance(){
      this.isLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'manualcodremittance?CreatedBy='+this.localuserid+'&fromDate='+this.fromDate+'&toDate='+this.toDate+'&offset='+this.pageno+'&limit='+20,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.isLoading = false;
            this.listPendingRemittanceData  = result.data.data;
            this.resultCount  = result.data.count;
            let totalRows     = result.data.count;
            if (totalRows < 20) {
                this.pagecount = 1
            } else {
                this.pagecount = Math.ceil(totalRows / 20)
            }
            result.data.data.forEach((val,key)=>{
              this.form.toDate[val.ClientId] = val.ToDate;
            });
          }else{
            this.listPendingRemittanceData=[];
            this.resultCount  = 0;
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
        })
    },

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 20
        this.manualCODRemittance()
    }
  }
}
