export default {

      api_url: (process.env.NODE_ENV==='production')? location.protocol+'//codmanagementapi.xbees.in/api/': 'http:'+'//localhost:4500/api/',       
     iptracker_url:(process.env.NODE_ENV==='production') ? location.protocol+'//track.xbees.in/api/UserTracker':'https:'+'//stageiptracking.xbees.in/api/UserTracker',
     forgotpwd_url:(process.env.NODE_ENV==='production') ? location.protocol+'//userauthentication.xbees.in/#/forgotpassword':'https:'+'//stageusermanagement.xbees.in/#/forgotpassword'
	}
