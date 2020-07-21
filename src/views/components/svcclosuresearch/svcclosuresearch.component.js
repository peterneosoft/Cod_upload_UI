import apiUrl from '../../../constants'
import axios from 'axios'
import CryptoJS from 'crypto-js';
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
      listSearchSVCledgerData: [],
      DisputeArr: [],
      myStr: '',
      localhubid: '',
      localhubname: '',
      awbnotype:'',
      awbnumber:'',
      ReasonModalShow:false,
      RecExcModalShow:false,
      commentModalShow:false,
      comment:'',
      cType:''
    }
  },

  computed: {

  },

  mounted() {
    var date = new Date();
    toDate.max = fromDate.max = date.toISOString().split("T")[0];

    var hubdetailEncrypt  = window.localStorage.getItem('accesshubdata')
    var bytes             = CryptoJS.AES.decrypt(hubdetailEncrypt.toString(), 'Key');
    var plaintext         = bytes.toString(CryptoJS.enc.Utf8);
    var hubdetail         = JSON.parse(plaintext);
    this.localhubid       = hubdetail[0].HubID;
    this.localhubname     = hubdetail[0].HubName;

    var userToken = window.localStorage.getItem('accessuserToken')
    this.myStr = userToken.replace(/"/g, '');
  },

  methods: {

    //to get pagination
    getPaginationData(pageNum) {
        this.pageno = (pageNum - 1) * 10
        this.GetSearchSVCledgerData()
    },

    GetSearchSVCledgerData() {

      if(this.fromDate > this.toDate){
         document.getElementById("fdate").innerHTML="From date should not be greater than To date.";
         return false;
      }else{
        document.getElementById("fdate").innerHTML="";
      }

      $('span[id^="vri"]').hide();
      $('span[id^="vrl"]').show();

      this.input = ({
          offset: this.pageno,
          limit: 10,
          hubid: this.localhubid,
          fromDate: this.fromDate,
          toDate: this.toDate
      })
      this.isLoading = true;
      axios({
          method: 'POST',
          'url': apiUrl.api_url + 'svcledgersearchmaster',
          'data': this.input,
          headers: {
              'Authorization': 'Bearer '+this.myStr
          }
      })
      .then(result => {
        if(result.data.code == 200){
          this.listSearchSVCledgerData = result.data.data;
          this.isLoading = false;
          let totalRows     = result.data.count;
          this.resultCount  = result.data.count;
          if (totalRows < 10) {
              this.pagecount = 1
          } else {
              this.pagecount = Math.ceil(totalRows / 10)
          }
        }else{
          this.listSearchSVCledgerData=[];
          this.resultCount  = 0;
          this.isLoading = false;
        }
      }, error => {
          console.error(error)
          this.$alertify.error('Error Occured');
      })
    },

    onSubmit: function(event) {
      this.$validator.validateAll().then((result) => {
        if(result){
          this.pageno = 0;
          this.GetSearchSVCledgerData();
        }
      }).catch(() => {
        console.log('errors exist', this.errors)
      });
    },

    resetForm() {
      this.fromDate = this.toDate = ''; this.listSearchSVCledgerData=[]; this.resultCount = this.pageno = 0;
      document.getElementById("fdate").innerHTML="";
      this.$validator.reset();
      this.errors.clear();
    },

    showHideImages(index, elem){
      if(elem=='vrrl'){
        $('#vrl'+index).show();
        $('#vri'+index).hide();

        $('#vrri'+index).show();
        $('#vrrl'+index).hide();
      }else{
        $('#vrri'+index).hide();
        $('#vrrl'+index).show();

        $('#vri'+index).show();
        $('#vrl'+index).hide();
      }
    },

    closeStatusRoleModal() {
      this.ReasonModalShow = false
      this.RecExcModalShow = false
      this.commentModalShow = false
    },

    showReasonAWBNo(ele){
      this.DisputeArr = [];
      this.DisputeArr = ele;
      this.$refs.myReasonModalRef.show();
    },

    showRecExcAWBNo(eletyp, ele, eleawb, financereasonid=null){

      this.DisputeArr = [];

      if(ele>0){
        let AWBArr = {}; AWBArr['awb'] = []

        if(eletyp == 'recovery' && financereasonid!=null){
          AWBArr['Reason'] = "Self Debit/Client Recovery"
        }else if(eletyp == 'recovery' && financereasonid==null){
          AWBArr['Reason'] = "Amount used for Tax Payment/Imprest"
        }else if(eletyp == 'exception'){
          AWBArr['Reason'] = "Exception"
        }

        eleawb = eleawb.split(',');
        if(eleawb.length>0){
          eleawb.forEach(async(item, i) => {
            let obj = {};
            obj[item]=item;
            AWBArr['awb'].push(obj)
          });
        }else{
          let obj = {};
          obj[eleawb]=eleawb;
          AWBArr['awb'].push(obj)
        }
        AWBArr['amount'] = ele

        this.DisputeArr = new Array(AWBArr);
      }

      this.$refs.myRecExcModalRef.show();
    },

    showComment(ele, type){
      this.comment = []; this.cType = ''; this.comment = ele;
      if(type=='c') this.cType = 'Finance Comment'; else this.cType = 'Transaction Id';
      this.$refs.myCommentModalRef.show();
    },
  }
}
