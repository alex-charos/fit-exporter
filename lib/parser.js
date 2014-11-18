module.exports = (function(){

  var parser = function() {

  };

  parser.prototype = {
    getDetails: function(token, cb) {
      request(
          {
            url: 'https://www.googleapis.com/fitness/v1/users/me/dataSources',
             headers : {
                  "Authorization" : 'Bearer '+token
              }
          },
          function (error, res, body) {
            // Use eventEmitter
            cb(body);
          }
      );
    }
  }
  
  return parser; 

}());
