module.exports = (function(token){

	var config = function() {
	
	};
	config.oath = {
		clientId : "xxxxxxxxxx",
		clientSecret : 'xxxxxxxxx',
		redirectUrl : "xxxxxxxx"

	};

	config.mongo = {
		db : "db",
  		collection : "test",
  		host : "localhost",
  		port : 2521,
  		username: "username",
  		password: "password"

	};

 

	return config;
}());

