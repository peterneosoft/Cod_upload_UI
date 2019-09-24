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
      Search:0,
      Client:"",
      clientLoading:false,
      ClientList:[],
      isLoading: false,
      listPendingRemittanceData:[],
      listPendingRemittanceDataToDate:[],
      fromDate:'',
      toDate:'',
      modalShow:false,
      currentdate:'',
      ofd:'',
      form: {
          toDate: [],
          FromDate: [],
          oldFromDate: [],
          oldToDate: []
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

    this.GetClientData();
    this.manualCODRemittance();

    var date = new Date();
    this.currentdate = date.toISOString().split("T")[0];
  },

  methods: {
    showModal(){
      this.modalShow = true;
    },
    closeModal() {
      this.modalShow = false
    },
    setid(name, key){
      return name+key;
    },

    onChangeDate(fromDate, toDate, ClientId){

      if(!toDate || !fromDate){

        this.$alertify.error('From date & To/ Delivery date should not be empty.');
        return false;
      }else if(fromDate > this.currentdate || toDate > this.currentdate){

        this.$alertify.error('From date & To/ Delivery date should not be greater than current date.');
        return false;
      }else if(fromDate > toDate){

        document.getElementById("fdate"+ClientId).innerHTML="From date should not be greater than To / Delivery date.";
        return false;
      }else if(toDate < fromDate){

        document.getElementById("tdate"+ClientId).innerHTML="To / Delivery date should not be less than From date.";
        return false;
      }else if(toDate > this.form.oldToDate[ClientId]){

        let tdate = new Date(this.form.oldToDate[ClientId]);
        document.getElementById("tdate"+ClientId).innerHTML="To / Delivery date should not be greater than "+(tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();
        return false;
      }else if(fromDate < this.form.oldFromDate[ClientId]){

        let fdate = new Date(this.form.oldFromDate[ClientId]);
        document.getElementById("fdate"+ClientId).innerHTML="From date should not be less than "+(fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
        return false;
      }else{

        document.getElementById("fdate"+ClientId).innerHTML="";
        document.getElementById("tdate"+ClientId).innerHTML="";

        this.isLoading = true;
        axios({
          method: 'GET',
          url: apiUrl.api_url + 'manualcodremittance?CreatedBy='+this.localuserid+'&ClientId='+ClientId+'&oldFromDate='+this.form.oldFromDate[ClientId]+'&fromDate='+fromDate+'&toDate='+toDate+'&offset='+this.pageno+'&limit='+20,
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
                item.FromDate         = obj.FromDate;
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
              this.form.FromDate[val.ClientId] = val.FromDate;
            });
          }else{
            this.listPendingRemittanceDataToDate=[];
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
        })
      }
    },

    onRemittance(fromDate, toDate, data){

      if((!fromDate || !this.form.oldFromDate[data.ClientId]) || (!toDate || !this.form.oldToDate[data.ClientId])){

        this.$alertify.error('From date & To / Delivery date should not be empty.'); return false;
      }else if(fromDate != this.form.oldFromDate[data.ClientId]){

        let fdate = new Date(this.form.oldFromDate[data.ClientId]);
        this.ofd = 'Remittance for client '+data.CompanyName+', From date should be: '+(fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
        this.showModal(); return false;
      }else if(toDate > this.form.oldToDate[data.ClientId]){

        let tdate = new Date(this.form.oldToDate[data.ClientId]);
        this.ofd = 'Remittance for client '+data.CompanyName+', To / Delivery date should be: '+(tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();
        this.showModal(); return false;
      }else if(data.ShipmentCount==0){

        let fdate = new Date(data.FromDate);
        fdate = (fdate.getDate() <= 9 ? '0' + fdate.getDate() : fdate.getDate()) + "/" + ((fdate.getMonth() + 1) <= 9 ? '0' + (fdate.getMonth() + 1) : (fdate.getMonth() + 1)) + "/" + fdate.getFullYear();
        let tdate = new Date(data.ToDate);
        tdate = (tdate.getDate() <= 9 ? '0' + tdate.getDate() : tdate.getDate()) + "/" + ((tdate.getMonth() + 1) <= 9 ? '0' + (tdate.getMonth() + 1) : (tdate.getMonth() + 1)) + "/" + tdate.getFullYear();

        this.ofd = 'Remittance COD amount for client '+data.CompanyName+' & date from '+fdate+' to '+tdate+' is 0.00';
        this.showModal(); return false;
      }else{

        this.closeModal();

        this.input = ({
            FromDate: this.form.oldFromDate[data.ClientId],
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
            this.insertEmailRemittance();
          } else {
            this.isLoading = false;
            this.$alertify.error(result.data.msg)
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
        })
      }
    },

    manualCODRemittance(){
      this.isLoading = true;
      axios({
          method: 'GET',
          url: apiUrl.api_url + 'manualcodremittance?CreatedBy='+this.localuserid+'&oldFromDate='+this.fromDate+'&fromDate='+this.fromDate+'&toDate='+this.toDate+'&offset='+this.pageno+'&limit='+20,
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
              this.form.FromDate[val.ClientId] = val.FromDate;

              this.form.oldToDate[val.ClientId] = null; this.form.oldFromDate[val.ClientId] = null;

              if(this.form.oldFromDate[val.ClientId]==null){
                this.form.oldFromDate[val.ClientId] = val.FromDate;
              }
              if(this.form.oldToDate[val.ClientId]==null){
                this.form.oldToDate[val.ClientId] = val.ToDate;
              }

              $('#FromDate'+val.ClientId).val(val.FromDate);
              $('#toDate'+val.ClientId).val(val.ToDate);
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
    },

    insertEmailRemittance(){
      this.input = ({
          CreatedBy: this.localuserid
      })
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'insertemailremittance',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
        }
      }, error => {
        console.error(error)
      })
    },

    GetClientData() {
      this.clientLoading = true;
      axios({
        method: 'GET',
        url: apiUrl.api_url + 'external/getclientlist',
        data: {},
        headers: {
          'Authorization': 'Bearer '+this.myStr
        }
      }).then(result => {
        this.clientLoading = false;
        this.ClientList = result.data.clients.data;
      }, error => {
        this.clientLoading = false;
        console.error(error)
      })
    },

    onClientSearch(ClientId, CompanyName){

      if(!ClientId){

        this.$alertify.error('Client Name is mandatory.');
        return false;
      }else{

        this.isLoading = true;
        axios({
          method: 'GET',
          url: apiUrl.api_url + 'adhocCODRemiitance?ClientId='+ClientId+'&ClientName='+CompanyName,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {

          if(result.data.code == 200){

            this.adhocDate(result.data.data.FromDate, result.data.data.ToDate, ClientId);
          }else{
            this.resultCount = 0; this.pageno = 0;
            this.listPendingRemittanceData=[];
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
        })
      }
    },

    adhocDate(fromDate, toDate, ClientId){

      this.form.oldToDate[ClientId] = this.form.toDate[ClientId] = [];
      this.form.oldFromDate[ClientId] = this.form.FromDate[ClientId] = [];

      this.listPendingRemittanceData=[]; this.pagecount = 1;

      if(!toDate || !fromDate){

        this.$alertify.error('From date & To/ Delivery date should not be empty.');
        this.isLoading = false;
        return false;
      }else{

        axios({
          method: 'GET',
          url: apiUrl.api_url + 'manualcodremittance?CreatedBy='+this.localuserid+'&ClientId='+ClientId+'&oldFromDate='+fromDate+'&fromDate='+fromDate+'&toDate='+toDate+'&offset=0&limit='+20,
          headers: {
            'Authorization': 'Bearer '+this.myStr
          }
        })
        .then(result => {
          if(result.data.code == 200){
            this.form.oldToDate[ClientId]   = this.form.toDate[ClientId] = result.data.data[0].ToDate;
            this.form.oldFromDate[ClientId] = this.form.FromDate[ClientId] = result.data.data[0].FromDate;
            this.listPendingRemittanceData  = result.data.data;
            this.resultCount                = result.data.data.length;
            this.isLoading = false;
          }else{
            this.isLoading = false;
          }
        }, error => {
          console.error(error)
          this.isLoading = false;
        })
      }
    },

    onSearch() {
      if(this.Client.ClientMasterID==null || this.Client.ClientMasterID=='undefined'){
        document.getElementById("clienterr").innerHTML="Please select Client";
        return false;
      }
      document.getElementById("clienterr").innerHTML=""; this.Search = 0;
      this.onClientSearch(this.Client.ClientMasterID, this.Client.CompanyName);
    },

    resetSearch() {
      this.Client=[]; this.pageno = this.resultCount = 0; this.Search = 0;
      this.manualCODRemittance();
      document.getElementById("clienterr").innerHTML="";
    }
  }
}
