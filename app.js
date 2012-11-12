/**
 * @fileOverview serves as the bootstrap for the node.js web service
 * @name app.js
 *
 */

 /** pull in dependencies */
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , conf = require('./conf')
  , cocoafish = require('./lib/cocoafish-module');


var MemStore = express.session.MemoryStore;
 
 /** create a server instance */
var app = module.exports = express.createServer();

/** create global variables for all clients */
GLOBAL.user = {}
GLOBAL.client = new cocoafish.Client({
    applicationkey: conf.cocoafish.key
})




//will delete this line when I can confirm it won't break the ported code
GLOBAL.userPortalURL = conf.cocoafish.url;

GLOBAL.url = conf.cocoafish.url;
/** Configuration */
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'I accidentally the server.'}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});
/*
app.dynamicHelpers({
    session: function (req, res) {
        return req.session;
    }
});
*/
/** Routes */
require('./routes/index')(app);





var port = process.env.PORT || 4000
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});



