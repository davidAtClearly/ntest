/**
 * @fileOverview handles all url routing for this web server
 * @name index.js
 *
 */



/** imports common functions (these should be replaced with tools) */
var tools = require("../lib/tools");

var request = require('request');
/*
 * GET home page.
 */



module.exports = function(app) {

    /**
     * load the login page
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.all('/', function(req, res) {
        
		var errorMessage = null;
        try {
            errorMessage = req.session.user.errorMessage || null;
            delete req.session.user.errorMessage;
        } catch (ex) {}
        if (errorMessage === null) {
            errorMessage = req.query["errorMessage"] || null;
        }
        res.render('index', {
            errorMessage: errorMessage
        });
    });


    app.all("/dashboard", function(req, res) {
        
        try { /** check if the user is logged in */
            if (!tools.validateRegisteredUser(req, res)) {
                return;
            } else {
                res.render("dashboard", {
                    user: req.session.user
                });
            }
        } catch (ex) {
            res.redirect("/");
        }
    });

    /**
     * login the user
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.post('/user/login', function(req, res) {
      
        try {

            console.log("\n\n");

            //client.doLogin(req.body, function(e) {
            client.doLogin(req, function(e) {

                if (e.success) {

                    //req.session.regenerate(function(){});
                    for (var x in req.session.user) {
                        if (typeof(e.response.users[0][x]) === "undefined") {
                            console.log("adding " + x);
                            e.response.users[0][x] = req.session.user[x];
                        }
                    }

                    req.session.user = e.response.users[0];
                    req.session.user.sessionId = e.meta.session_id;

                    res.redirect('/dashboard/');


                } else {
                    loginFailed = true;
                    res.redirect('/?errorMessage=Your login attempt was unsuccessful. (' + e.message + ")");
                }
            });
        } catch (ex) {
            res.redirect("/?errorMessage=An error occured during the login process. (" + ex + ")");
        }

    });

    /**
     * logout a user
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.all('/user/logout', function(req, res) {
       
        client.doLogoutUser(function() {
            //req.session.user = null;
            req.session.user = null;
            res.redirect('/');
        });
    });





    /**
     * edits the profile of a registered user
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.post('/user/update', function(req, res) {
        
        try {

            /** check if the user is logged in */
            if (!tools.validateRegisteredUser(req, res)) {
                return;
            }


            var params = {};
            params.sessionId = req.session.user.sessionId;
            params.first_name = req.body.first_name;
            params.last_name = req.body.last_name;
            params.email = req.body.email;
            params.custom_fields = {};
            params.custom_fields.isOnMailingList = req.body.isOnMailingList;


            if (req.body.password !== '') {
                //user.password = req.body.password;
                params.password = req.session.user.password = req.body.password;
                params.password_confirmation = params.password;
            }
            tools.log('user ' + JSON.stringify(params));



            client.updateUser(params, function(e) {
                try {


                    console.log("e = " + JSON.stringify(e));
                    if (e.success) {
                        console.log("success"); /** retain previously retrieved items that were stored in req.session.user */
                        for (var x in req.session.user) {
                            if (typeof(e.response.users[0][x]) === "undefined") {
                                tools.log("adding " + x);
                                e.response.users[0][x] = req.session.user[x];
                            }
                        }

                        req.session.user = e.response.users[0];
                        res.render("dashboard", {
                            layout: "registeredUserLayout",
                            user: req.session.user
                        });
                    } else {


                        console.log("failure " + e.message);
                        var error = e.response || null;
                        if (error === null) {
                            error = e.message || "An error occurred while updating your profile . ()";
                        }
                        res.render("dashboard", {
                            user: req.session.user,
                            layout: "registeredUserLayout",
                            errorMessage: error
                        });
                    }
                } catch (exx) {
                    res.redirect("/dashboard?errorMessage=An error occurred while updating your account - " + exx);
                }
            });
        } catch (ex) {
            tools.log(ex.stackTrace || ex);
            res.redirect("/dashboard?errorMessage=An error occured while updating your account - " + ex);

        }

    });




    /**
     * loads the password reset screen
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.get('/user/forgotPasswordPage', function(req, res) {
        
        res.render('forgotPassword', {
            req: req,
            guestCoaxerRemainingTime: -1
        });
    });

    /**
     * attempts to reset the user's password
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.post('/user/forgotPasswordSubmit', function(req, res) {
        
        try {

            client.doResetUserPassword(req.body.email, function(e) {
                if (!e.success) {
                    res.redirect('/?errorMessage=Your password could not be reset.');
                } else {
                    res.redirect('/?errorMessage=A password notification has been sent to the email address provided.');
                }

            })
        } catch (ex) {
            res.redirect("/?errorMessage=An error occured while resetting your password.");
        }
    });




    /**
     *	This function may be deprecated (need to check code)
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.get('/user/accountPage', function(req, res) {
       
        if (typeof(req.session.user) === "undefined" || req.session.user === null) {
            res.redirect("/");
            return;
        }

    });

    /**
     *	This function may be deprecated
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.get('/user/accountUpdate', function(req, res) {
       
        if (typeof(req.session.user) === "undefined" || req.session.user === null) {
            res.redirect("/");
            return;
        }

    });


    /**
     * loads the user registration page
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.get('/user/register', function(req, res) {

        var params = {
            layout: "unregisteredUserLayout",
            pageType: "externalPage"
        };
        if (typeof(req.query["errorMessage"]) !== "undefined") {
            params.errorMessage = req.query["errorMessage"];
        }
        res.render('userRegister', params);
    });

    /**
     * sends a request to register a user
     * @param {object} [req] HttpRequest that holds the user's input
     * @param {object} [res] HttpResponse handles the user's request
     */
    app.post('/user/register', function(req, res) {
        try {
            //grab the request body (parsed form values)
            var formValues = req.body;


            //add additional fields
            var customFields = {
                isOnMailingList: (formValues.isOnMailingList || false)

            };

            //stringify the additional fields
            formValues.custom_fields = JSON.stringify(customFields);


            //try to create a user
            client.createUser(formValues, function(e) {
                try {
                    if (e.success) {
                        //user = e.response.users[0];
                        req.session.user = e.response.users[0];
                        req.session.user.sessionId = e.meta.session_id;
                        //res.redirect("/myList1/");
                        res.redirect("/dashboard/");
                    } else {
                        res.redirect("/?errorMessage=" + e.response);
                    }
                } catch (exx) {
                    res.redirect("/?errorMessage=" + exx);
                }
            });
        } catch (ex) {
            res.redirect("/?errorMessage=" + ex);
        }
    });


	
	
	


}

/**
 * sends a url to be shortened
 * @param {string} [url] the url of string-shortening service and the url to be shortened
 * @param {function} [callback] the function to be executed when a response to the url-shortening request is received
 */

function shortenUrl(url, callback) {
    //return;
    request.get({
        headers: {
            'Content-Type': 'application/json'
        },
        url: "http://api.bit.ly/shorten?version=2.0.1&longUrl=" + url + "&login=sschecht&apiKey=R_2128d421c366f4e4e8696e11abdcc23b"
        //form:JSON.stringify({"longUrl":"http://clearlyinnovative.com/asd/"})
    }, function(error, response, body) {
        console.log('short url body ' + body);
        var resp = JSON.parse(body);

        callback(resp);
    });
}
