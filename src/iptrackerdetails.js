import axios from 'axios'
import apiUrl from './constants'

async function checkUserIP(userdata, eventname,path,request,response) {
  let input = {
    "projectname": "COD Management",
    "type": "web",
    "userid": userdata.userid ? userdata.userid : 0,
    "username": userdata.email,
    "olduserid": userdata.OldDeliveryUserOrUserId ? userdata.OldDeliveryUserOrUserId : 0,
    "routeurl":path,
    "meta":{
      "event":eventname,
      // "data":payload ? payload :{}
      "data":{
        "req":request,
        "res":response
      }
    }
  }

 axios({
      method: 'POST',
      'url': apiUrl.iptracker_url  + 'UserTracker_v1',
      'data': input
    })
    .then(async result => {
      if (result.data.code == 401) {
        window.localStorage.clear();
        window.location.reload();
      }
    }, error => {
      // this.$alertify.success("Unable to track IP Address");
      console.error('exception is:::::::::', error)
        window.localStorage.clear();
        window.location.reload();
    });
}

async function checkUserIPV2(userdata, eventname,path) {
  let input = {
    "projectname": "COD Management",
    "type": "web",
    "userid": userdata.userid ? userdata.userid : 0,
    "username": userdata.email,
    "olduserid": userdata.OldDeliveryUserOrUserId ? userdata.OldDeliveryUserOrUserId : 0,
    "routeurl":path,
    "meta":{
      "event":eventname,
      // "data":payload ? payload :{}
      "data":{}
    }
  }

 await axios({
      method: 'POST',
      'url': apiUrl.iptracker_url  + 'UserTracker_v2',
      'data': input
    })
    .then(result => {
      if (result.data.code == 401) {
        window.location.href='/';
      }
    }, error => {
      window.location.href='/';
      // this.$alertify.success("Unable to track IP Address");
      console.error('exception is:::::::::', error)
    });
}
export default {
  checkUserIP,
  checkUserIPV2
}
