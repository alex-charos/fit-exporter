var request = require('request');

module.exports = (function(token){

	var parser = function() {
		this.token = token;
		this.uri = 'https://www.googleapis.com/fitness/v1/users/me/';
	};

	parser.prototype = {
		getEpochTime: function() {
			var origin = 0;
			var today = Math.round(new Date().getTime() * 1000000);
			var time = origin + '-' + today;
			return time;
		},
		setToken: function(token) {
			this.token = token;
		},
		getDataSources: function(cb) {
			request(
		      {
		        url: this.uri + 'dataSources',
		         headers : {
		              "Authorization" : 'Bearer '+this.token
		          }
		      },
		      cb
		  );
		},
		getStreamDetails: function(id, cb) {
			var uri = this.uri + 'dataSources/' + id + '/datasets/' + this.getEpochTime();
			console.log(uri);
			request({
				url: uri ,
				headers : {
				  "Authorization" : 'Bearer '+this.token
				}
			},
			cb)
		}
	}

	return parser;
}());