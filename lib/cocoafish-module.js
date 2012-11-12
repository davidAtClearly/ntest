/**
 * @fileOverview handles all url routing for this web server
 * @name cocoafish-module.js
 *
 */

/** Set the keys on ./conf.js */
var request = require('request');
var conf = require('../conf');
var queryString = require("querystring");
var https = require("https");

var tools = require("./tools");

/**
 * Public client interface
 * @param {dictionary} [options] the configuration properties for this web service
 * @configure
 */

function Client(options) {
    this.COCOAFISH_APPLICATION_KEY = options.applicationkey;
    this.CURRENT_USER = null;
    //this.ENDPOINT = "https://api.cocoafish.com/v1/";
    this.ENDPOINT = "https://api.cloud.appcelerator.com/v1/";
    console.log(JSON.stringify(this));
};

/** attempts to create a new user account
 * @param {dictionary} [_args] the user's login credentials
 * @param {function} [_callback] the callback function for this api call
 */

Client.prototype.createUser = function(args, callback) {
    try {

        var that = this;
        this.args = args;

        var logoutArgs = {
            "baseUrl": "users/logout.json",
            "httpMethod": "GET"
        };


        /** logout any existing account for this client if an old session is still active */
        that.APICall(logoutArgs, function createUserCallback1(e) {
            try {
                console.log(arguments.callee.name + " that.args = " + that.args);
                var createUserArgs = {
                    "baseUrl": "users/create.json",
                    "httpMethod": "POST",
                    "params": that.args
                };

                tools.log(createUserArgs);

                that.APICall(createUserArgs, function createUserCallback(d) {
                    if (d.success === true) {
                        that.CURRENT_USER = d.response.users[0];
                    }
                    callback(d);
                });
            } catch (ex) {
                callback(tools.formatCallbackError(ex));
            }
        });
    } catch (ex) {
        callback(tools.formatCallbackError(ex));
    }
}

/** logs a user into the system
 * @param {object} [req] the HttpRequest object for this user
 * @param {function} [_callback] the callback function for this api call
 */
//Client.prototype.doLogin = function(_args, _callback) {
Client.prototype.doLogin = function(req, _callback) {

    try {
        var that = this;

        var args = {
            "baseUrl": "users/login.json",
            "httpMethod": "POST",
            //"params": _args
            "params": req.body,
        };
        console.log("req.body()");



        that.APICall(args, function doLoginCallback(_d) {
            //console.log('[' + arguments.callee.name + '] here???')
            if (_d.success) {
                //console.log('[' + arguments.callee.name + ']dlc ' + JSON.stringify(_d.response.users[0]))
                //that.CURRENT_USER = _d.response.users[0];
                req.session.user = _d.response.users[0];
            }
            _callback(_d);
        });
		
    } catch (ex) {
        _callback(tools.formatCallbackError(ex));
    }
};

/** logs a user into the system
 * @param {function} [_callback] the callback function for this api call
 * @param {object} [sessionId] the user's session id
 *
 */
Client.prototype.showMe = function(sessionId, callback) {
    try{
	var that = this;

    var args = {
        "_session_id": sessionId,
        "baseUrl": "users/show/me.json",
        "httpMethod": "GET",
        "params": {}
    };
    that.APICall(args, callback);
}catch(ex){
	callback(tools.formatCallbackError(ex));
}
}


/** 
 * send an email to update a user password/
 * @param {dictionary} [_args] the user's login credentials
 * @param {function} [_callback] the callback function for this api call
 */

Client.prototype.doResetUserPassword = function(_email, _callback) {
    var that = this;
    var args = {
        "httpMethod": "GET",
        "baseUrl": "users/request_reset_password.json",
        "params": {
            "email": _email
        }
    };
    that.APICall(args, function doResetUserPasswordCallback(_d) {

        if (_d.success === true) {

        }
        _callback(_d);

    });
}

/** 
 * logs a user out of the system
 * @param {function} [_callback] the callback function for this api call
 */

Client.prototype.doLogoutUser = function(_callback) {
    var that = this;
    var args = {
        "baseUrl": "users/logout.json",
        "httpMethod": "GET"
    };
    that.APICall(args, _callback);
}

/** 
 * logs a user out of the system
 * @param {boolean} [keep_photo] a boolean that determines whether a filed should deleted
 * @param {function} [_callback] the callback function for this api call
 */

Client.prototype.doDeleteUser = function(keep_photo, callback) {
    var that = this;
    var args = {
        "httpMethod": "GET",
        "baseUrl": "users/delete.json",
        "params": {
            "keep_photo": keep_photo || false
        }
    };
    that.APICall(args, callback);
}


/**
 *  return the helper object containing the content item questions
 */
Client.prototype.getContentItemQuestions = function(callback) {
    var that = this;
    var args = {
        "baseUrl": "objects/helpers/query.json",
        "httpMethod": "GET",
        params: {
            "where": '{"name":"questions"}'
        }
    };
    that.APICall(args, function getContentItemsQuestionsCallback(e) {
        callback(e)
    });
};




/**
 *  return the question objects pertaining to a specific life path
 *  @param lifePath the life path name to serve as a question filter
 *  @param callback the function to be executed when the http response is received
 *
 */
Client.prototype.getLifePathQuestions = function(lifePath, callback) {
    var that = this;
    var args = {
        "baseUrl": "objects/question/query.json",
        "httpMethod": "GET",
        params: {
            "where": '{"lifepath":"' + lifePath + '"}'
        }
    };
    that.APICall(args, function(e) {
        callback(e)
    });
}







/**
 * updates the user's account with every field passed to it
 * @param {dictionary} [args] all of the fields that should be updated for the user' account
 * @param {function} [callback] the callback function that should be called after the ACS response is received
 */
Client.prototype.updateUser = function(args, callback) {
    try {
        var that = this;

        var updatableParams = {};
        params = {
            "httpMethod": "PUT",
            "_session_id": args.sessionId,
            "baseUrl": "users/update.json",
            "params": {}
        };

        if (typeof(args.custom_fields) !== "undefined") {

            for (var index in args.custom_fields) {
                updatableParams[index] = args.custom_fields[index];
            }
            params["params"]["custom_fields"] = JSON.stringify(updatableParams);
        }



        delete args.custom_fields;
        delete args.sessionId;
        for (var x in args) {

            /** add all of the proper fields */

            if (typeof(x) === "string") {
                params["params"][x] = args[x];
            } else {
                params["params"][x] = JSON.stringify(args[x]);
            }

        }
        console.log("updatableParams = " + JSON.stringify(params) + "\n\n\n\n\n");


        that.APICall(params, callback);
    } catch (ex) {
        callback({
            success: false,
            message: ex
        });

    }
};




Client.prototype.doRefreshUser = function(id, callback) {
    console.log('[' + arguments.callee.name + '] refreshing user ')
    var that = this;
    var params = {
        "httpMethod": "PUT",
        "baseUrl": "users/update.json",
        "params": {
            "user_id": id
        }
    }
    console.log('[' + arguments.callee.name + '] params???? ' + JSON.stringify(params));
    that.APICall(params, callback);
}




/**
 * This method sends http requests to ACS for editing and retrieving data
 * @param {object} [args] the arguments used to the configure the http request
 * @param {function} [callback] the function called after ACS returns a response
 */
Client.prototype.APICall = function(args, callback) {
    var that = this;

    var url = null,
        options = null,
        data = null,
        body = "",
        paramMap = null,
        httpsClient = null;


    if (args.httpMethod == 'POST') {
        url = that.ENDPOINT + args.baseUrl + "?key=" + that.COCOAFISH_APPLICATION_KEY;
        console.log("sdfa");
        console.log('[' + arguments.callee.name + '] Opening: ' + url);
        console.log("[" + arguments.callee.name + "] Params in API call: " + JSON.stringify(args.params));

        paramMap = args.params || {};
        for (var a in paramMap) {
            body += encodeURIComponent(a) + '=' + (paramMap[a] ? encodeURIComponent(paramMap[a]) : "") + '&';
        }

        /** builds and tests an https client */
        data = queryString.stringify(args.params);
        //data = JSON.stringify(args.params);
        options = {
            host: 'api.cloud.appcelerator.com',
            //that.ENDPOINT,
            port: 443,
            //form: args.params,
            path: '/v1/' + args.baseUrl + '?key=' + that.COCOAFISH_APPLICATION_KEY,
            method: args.httpMethod,
            headers: {
                'Content-Length': data.length
            }
        }; /** append the ACS session_id ot if it exists */
        if (typeof(args._session_id) != "undefined") {
            options.path += "&_session_id=" + args._session_id;
        }



    } else {
        data = "x";

        body = that.ENDPOINT + args.baseUrl + "?key=" + that.COCOAFISH_APPLICATION_KEY + "&";
        console.log('[' + arguments.callee.name + '] [' + arguments.callee.name + '] Opening: ' + args.baseUrl);
        console.log("[" + arguments.callee.name + "] Params in API call: " + JSON.stringify(args.params));
        paramMap = args.params || {};
        for (var a in paramMap) {
            body += encodeURIComponent(a) + '=' + (paramMap[a] ? encodeURIComponent(paramMap[a]) : "") + '&';
        }

        options = {
            host: 'api.cloud.appcelerator.com',
            //that.ENDPOINT,
            port: 443,
            //path: args.basUrl + '?key=' + that.COCOAFISH_APPLICATION_KEY,
            path: body,

            method: args.httpMethod,
            headers: {
                "Content-Length": data.length
            }
        }; /** add the ACS session_id if it exists */
        if (typeof(args._session_id) != "undefined") {
            options.path += '&_session_id=' + args._session_id;
        }




/*
        var body = that.ENDPOINT + args.baseUrl + "?key=" + that.COCOAFISH_APPLICATION_KEY + "&";
        console.log('[' + arguments.callee.name + '] [' + arguments.callee.name + '] Opening: ' + args.baseUrl);
        console.log("[" + arguments.callee.name + "] Params in API call: " + JSON.stringify(args.params));

        var paramMap = args.params || {};


        for (var a in paramMap) {
            body += encodeURIComponent(a) + '=' + (paramMap[a] ? encodeURIComponent(paramMap[a]) : "") + '&';
        }
        request.get({
            url: body
        }, function(error, response, body) {
            //console.log('[' + arguments.callee.name + '] [' + arguments.callee.name + '] ' + body);
            var resp = JSON.parse(body);
            if (resp.meta.status == 'fail') {
                //console.log('[' + arguments.callee.name + '] [' + arguments.callee.name + '] Error: ' + resp.meta.message);
                callback({
                    success: false,
                    response: 'Error: ' + resp.meta.message
                })
            } else {
				console.log("Response meta: " + JSON.stringify(resp.meta));
                callback({
                    success: true,
                    response: JSON.parse(body).response,
                    meta: JSON.parse(body).meta
                });
            }
        });
		*/

    }


    options.agent = false;
    httpsClient = {};
    httpsClient.ended = false;
    httpsClient.responseData = "";
    httpsClient.dataCounter = 0;

    httpsClient.request = https.request(options, function(res) {
        res.setEncoding("utf8");
        /** 
         * collect the data returned with this event and store it in the responseData string
         * (this event can fire multiple times)
         */
        res.on('data', function(data) {
            console.log("received data packet " + (++httpsClient.dataCounter));
            httpsClient.responseData += data;
        });

        /** let the user know the connection stopped abruptly */
        res.on('close', function() { /** if the connection ended abruptly, let the user know */
            if (httpsClient.ended === false) {
                console.log("https.request closed");
                callback({
                    success: false,
                    response: "Error - The connection ended before the request could be fulfilled."
                });
            }
        });

        /** return the result to the user */
        res.on('end', function() {
            httpsClient.ended = true;
            console.log("request ended");
            try {
                console.log("data = " + httpsClient.responseData);
                var parsedData = JSON.parse(httpsClient.responseData);
                //tools.log(parsedData);
                console.log(data);
                console.log("INITIATING CALLBACK!!!!!!");

                /** if the */
                if (parsedData.meta.status == "fail") {
                    console.log("failed request V ");
                    tools.log(options);

                    callback({
                        success: false,
                        response: 'Response Error - ' + parsedData.meta.message
                    });
                } else {
                    parsedData.success = true;
                    callback(parsedData);
                }

            } catch (ex) {
                callback({
                    success: false,
                    response: 'Local Error - ' + ex
                });
            }
        });
    });

    /** ensure that a string is always returned with the data event */
    //httpsClient.setEncoding("utf8");
    console.log("INFO TO SEND ");
    tools.log(httpsClient.request);

    httpsClient.request.write(data);
    httpsClient.request.end();

    return;

}


//
// EMAIL
//
/** ---------------------------------------------------------------------------
 *
 *
 * --------------------------------------------------------------------------- */
Client.prototype.doSendEmails = function(args, callback) {
    var that = this;
    var params = {
        "httpMethod": "POST",
        "baseUrl": "custom_mailer/email_from_template.json",
        "params": {
            "template": args.template,
            "recipients": args.recipients,
            "from": args.from || null,
            "dynamic fields": args.dynamic_fields ? JSON.stringify(args.dynamic_fields) : null
        }
    };

    that.APICall(params, callback);
}




Client.prototype.postActivity = function(req, type, id, callback) {
    var that = this;

    var fields = {
        userId: req.session.user.id,
        userEmail: req.session.user.email,
        actType: type,
        actDate: new Date(),
        actValues: id
    };

    var args = {
        "_session_id": req.session.user.sessionId,
        "baseUrl": "objects/activityLog/create.json",
        "httpMethod": "POST",
        "params": {
            "fields": JSON.stringify(fields)
        }
    };

    that.APICall(args, callback)
}


/**
 * Create Global "extend" method
 * @param {object} [obj] the object to be extended
 * @param {object} [extObj] the source object used for extension
 */
var extend = function(obj, extObj) {
        if (arguments.length > 2) {
            for (var a = 1; a < arguments.length; a++) {
                extend(obj, arguments[a]);
            }
        } else {
            for (var i in extObj) {
                obj[i] = extObj[i];
            }
        }
        return obj;
    };




exports.Client = Client;
