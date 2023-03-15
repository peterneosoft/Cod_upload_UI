export default {

		api_url: (process.env.NODE_ENV==='production')? location.protocol+'//codmanagementapi.xbees.in/api/':location.protocol+'//codstageapi.xbees.in/api/',		
		iptracker_url:(process.env.NODE_ENV==='production') ? location.protocol+'//track.xbees.in/api/UserTracker':location.protocol+'//stageiptracking.xbees.in/api/UserTracker',
		forgotpwd_url:(process.env.NODE_ENV==='production') ? location.protocol+'//userauthentication.xbees.in/#/forgotpassword':location.protocol+'//stageusermanagement.xbees.in/#/forgotpassword'
}
