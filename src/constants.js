export default {

		api_url: (process.env.NODE_ENV==='production')? location.protocol+'//codmanagementapi.xbees.in/api/':location.protocol+'//codstageapi.xbees.in/api/',		
		iptracker_url:(process.env.NODE_ENV==='production') ?'http://track.xbees.in/api/UserTracker':'http://stageiptracking.xbees.in/api/UserTracker',
		forgotpwd_url:(process.env.NODE_ENV==='production') ?'http://userauthentication.xbees.in/#/forgotpassword':'http://stageusermanagement.xbees.in/#/forgotpassword'
}
