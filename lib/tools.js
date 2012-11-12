/**
 * @fileOverview various functions that are used on the server-side
 * @name processHandler.js
 *
 */

/** counts every property in a dictionary
 * @param {dictionary} [dictionary] the dictionary object being searched
 */

function countAllElements(dictionary) {
    try {

        /** check if the received argument is a valid object */
        if (typeof(dictionary) === "undefined" || dictionary === null) {
            return -1;
        }
        var count = 0;
        for (var x in dictionary) {
            count++;
        }
        return count;
    } catch (ex) {
        console.log("[" + arguments.callee.name + "]> " + ex.message || ex);
        return -1;
    }
}


/** 
 * outputs the content of an object to the console (skips over functions)
 * @param {object} [object] the object to be outputted
 */

function log(object) {
    try {
		
		/** check if the debug setting is on */
        if (require("../conf").cocoafish.showDebug === false) {
            return;
        }

        /** output the string if it's a string */
        if (typeof(object) === "string" || typeof(object) === "number") {
            console.log(object);
			return;
        } else {
			
			/** compose the header for the object summary */
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log("BEGIN GET OBJECT DETAILS");
            console.log("************************");

            for (var x in object) {
                try {
                    console.log(x + " -> " + JSON.stringify(object[x]));
                } catch (ex) {
                    console.log(x + " -> " + typeof(object[x]));
                }
            }
        }
        console.log("**********************");
        console.log("END GET OBJECT DETAILS");
        console.log("vvvvvvvvvvvvvvvvvvvvvv");
    } catch (ex) {

        console.log("**********************");
        console.log("END GET OBJECT DETAILS");
        console.log("vvvvvvvvvvvvvvvvvvvvvv");
    }
}



/**
 *	counts the elements of a dictionary that have a matching property name and value
 * @param {dictionary} [dictionary] the dictionary to search through
 * @param {string} [name] the name of the target property
 * @param {string} [value] the value of the target property
 * @return {number} the amount of properties found in the dictionary; -1 is returned if
 the parameter passed isn't a dictionary
 */

function countMatchingElements(dictionary, propertyName, value) {
    try {
        var count = 0;

        for (var object in dictionary) {
            for (var property in dictionary[object]) {
                if (property == propertyName && dictionary[object][property] == value) {
                    count++;
                }
            }
        }
        //console.log('done searching for ' + propertyName);
        return count;
    } catch (ex) {
        console.log(ex.message);
        return -1;
    }
}


/** 
 * search the array for a value
 * @param {array} [stringArray] an array of strings to search through
 * @param {string} [value] the value to search for
 * @param {boolean} [isCaseSensitive] a boolean used to determine whether or not the values should be evaluated based on case-sensitivity
 * @return {number} the index of the value in the stringArray
 */

function searchStringArray(stringArray, value, isCaseSensitive) {

    for (var x in stringArray) {
        try {
            if (isCaseSensitive === true && (stringArray[x] === value)) {
                return x;
            } else if (isCaseSensitive === false && (stringArray[x].toUpperCase() === value.toUpperCase())) {
                return x;
            }
        } catch (ex) {
            continue;
            try {
                console.log(arguments.callee.name + " error " + ex);
            } catch (exx) {}
        }
    }
    return -1;
}


/** formats a date from YYYY-MM-DD to MM/DD/YYYY
 * @param {string} [dateString] a date of the format YYYY-MM-DD
 * @return {string} a formatted date string
 */

function formatDate(dateString) {
    try {
        if (dateString == null) {
            return "";
        }
        var date = new Date(dateString);
        return ((date.getMonth() + 1) + '/' + date.getDate() + '/' + (date.getYear() + 1900));
    } catch (ex) {
        dateString;
    }
}


/**
 * parses a date object into along form date string
 * @param {object} [dateObj] the date object to be parsed
 * @param {boolean} [userLocalTimeZone] true: the local time zone of the machine this scrip resides on will be used;
 false: a default time zone of 0000 GMT will be utilized
 * return {string} a date of the form YYYY-MM-DDThh-mm-ss+ZZZZ
 */

function formatLongDate(dateObj, useLocalTimeZone) {
    try {
        if (useLocalTimeZone === false) {
            dateObj.setHours(dateObj.getHours() + (dateObj.getTimezoneOffset() / 60));
        }
        var dateString = dateObj.getFullYear() + "-";
        dateString += ((dateObj.getMonth() + 1) > 9 ? (dateObj.getMonth() + 1) : "0" + (dateObj.getMonth() + 1)) + "-";
        dateString += ((dateObj.getDate()) > 9 ? (dateObj.getDate()) : "0" + (dateObj.getDate())) + "T";
        dateString += ((dateObj.getHours()) > 9 ? (dateObj.getHours()) : "0" + (dateObj.getHours())) + ":";
        dateString += ((dateObj.getMinutes()) > 9 ? (dateObj.getMinutes()) : "0" + (dateObj.getMinutes())) + ":";
        dateString += ((dateObj.getSeconds()) > 9 ? (dateObj.getSeconds()) : "0" + (dateObj.getSeconds()));

        /** construct time zone string */
        var timeZoneCount = useLocalTimeZone ? dateObj.getTimezoneOffset() / 60 : 0;
        timeZoneString = (Math.abs(timeZoneCount) < 10) ? "0" + Math.abs(timeZoneCount * 100) : Math.abs(timeZoneCount * 100);
        dateString += (timeZoneCount > 0) ? "-" : "+";
        dateString += timeZoneString;
        if (timeZoneString === "00") {
            dateString += "00";
        }


        return dateString;

    } catch (ex) {
        console.log(arguments.callee.name + " error - " + ex);
        return null;
    }

}

/**
 * compile a dictionary of life paths with incomplete questionnaires
 *
 * @param {object} [currentUserRef] a reference to req.session.user
 * @return {dictionary} a dictionary of life paths and the number of questions that are left unanswered
 */

function compileIncompleteLifePathQuestionnaires(currentUser) {
    if (typeof(currentUser) === "undefined") {
        return null;
    }
    try {

        var incompleteQuestionnaireObjects = {};

        var incompleteLifePathQuestionnaires = {};
        for (var lifePathText in currentUser.helperObject.lifepaths) {
            incompleteLifePathQuestionnaires[lifePathText] = 0;
            incompleteQuestionnaireObjects[lifePathText] = {};
            var questionnaireCompleted = true;

            /** cycle through every demographic question */
            for (var x in currentUser.demographicQuestions) {

                /** if the question pertains to this life path */
                if (searchStringArray(currentUser.demographicQuestions[x].lifepath, lifePathText, false) != -1 &&

                /** and it's not in skipped and (it has a value of "none" or isn't found) */
                searchStringArray(currentUser.custom_fields.skippedQuestions, currentUser.demographicQuestions[x].customId, false) === -1 && (currentUser.custom_fields.questions[0][currentUser.demographicQuestions[x].customId] === "none" || typeof(currentUser.custom_fields.questions[0][currentUser.demographicQuestions[x].customId]) === "undefined")) {


                    incompleteQuestionnaireObjects[lifePathText][currentUser.demographicQuestions[x].customId] = currentUser.demographicQuestions[x];
                    //incompleteLifePathQuestionnaires[lifePathText]++;

                    /** mark the demographic questionnaire as incomplete */
                    questionnaireCompleted = false;
                }
            }

            for (var x in incompleteQuestionnaireObjects[lifePathText]) {
                incompleteLifePathQuestionnaires[lifePathText]++;
            }

            /** if all of the questions for the life path have been answered, remove from the dictionary */
            if (questionnaireCompleted === true) {
                delete incompleteLifePathQuestionnaires[lifePathText];
                delete incompleteQuestionnaireObjects[lifePathText];
            }
        }
        console.log("incomplete lifepath questionnaires: " + JSON.stringify(incompleteLifePathQuestionnaires));
        return incompleteLifePathQuestionnaires;
    } catch (ex) {
        console.log(arguments.callee.name + " -> " + (ex.stackTrace || ex));
        return null;
    }
}

/**
 * returns the current date expressed in milliseconds
 * @param {object} dateObj an date to use for the calculation (optional)
 * @return {integer} the number of milliseconds for this current day or -1 if the Date object is no supported
 */

function getCurrentTimeInMillis(dateObj) {
    try {
        var t = dateObj || new Date();
        return ((t.getHours() * 3600000) + (t.getMinutes() * 60000) + (t.getSeconds() * 1000) + (t.getMilliseconds()));
    } catch (ex) {
        return -1;
    }
}


/**
 * checks if the user's browser is google chrome
 * @return {boolean} true: this browser is google chrome; false the browser isn't google chrome
 */

function isChrome(req) {
    try {

        if (req.headers["user-agent"].toUpperCase()
            .indexOf("CHROME") != -1 || req.headers["user-agent"].toUpperCase()
            .indexOf("SAFARI") != -1) {
            return true;
        } else {
            return false;

        }
    } catch (ex) {
        console.log("isChrome() error - ");
        console.log(ex.stackTrace || ex);
        return false
    }
}

/**
 * formats the exception to be returned as an ACS call back object
 * @param {object} [ex] an exception thrown by javascript
 */

function formatCallbackError(ex) {
    console.log("%s - received error - %s", arguments.callee.name, (typeof(ex) !== "undefined" ? (ex.stackTrace || ex) : "An unexpected error has occured."));
    if (typeof(ex) === "undefined") {
        return {
            success: false,
            message: "An unexpected error has occured."
        };
    } else {
        return {
            success: false,
            message: ex.message || ex
        };
    }
}

/**
 * validates the registered user's login credentials and pulls any available ACS content from the
 * local cache stored in GLOBAL.userCache
 * @param {object} [req] the HttpRequest containing the user's profile information
 * @param {object} [req] the HttpResponse pertaining to this user's page request
 */

function validateRegisteredUser(req, res) {
    try {
        if (typeof(req.session.user) === "undefined" || req.session.user === null) {
            res.redirect("/");
            return false;
        } 
		
		/** check if the user is a CMS admin */
        if (req.session.user.role == "admin") {
            res.redirect("/?errorMessage=You cannot access this system with an administrative account.");
            return false;
        }
        return true;

    } catch (ex) {
        console.log(ex.stackTrace || ex);
        res.redirect("/?errorMessage=An error occured while validating your user profile.");
        return false;

    }
}

/**
 * validates the registered user's login credentials for an AJAX request
 * @param {object} [req] the HttpRequest containing the user's profile information
 * @param {object} [req] the HttpResponse pertaining to this user's page request
 */

function validateRegisteredUserAJAX(req) {
    try {
        if (typeof(req.session.user) === "undefined" || req.session.user === null) {
            return false;
        } /** check if the user is a CMS admin */
        if (req.session.user.role == "admin") {
            return false;
        }

        /** check the GLOBAL cache and port any data from it into the user's session */
        getCache(req);

        return true;

    } catch (ex) {
        console.log(ex.stackTrace || ex);
        return false;
    }
}


/**
 * checks the global cache and ports any data pertaining to the user into the user's session object
 * @param {object} [req] the HttpRequest object holding the user's session information
 */

function getCache(req) {
    try {
        console.log("global cache before " + GLOBAL.userCache[req.session.user.id]);
        if (typeof(GLOBAL.userCache[req.session.user.id].user) !== "undefined") {
            req.session.user = GLOBAL.userCache[req.session.user.id].user;
            delete GLOBAL.userCache[req.session.user.id].user;
        }
    } catch (ex) {
        console.log("[" + arguments.callee.name + "] -> " + (ex.stackTrace || ex));
    }

    try {
        if (typeof(GLOBAL.userCache[req.session.user.id].contentItems) !== "undefined" && GLOBAL.userCache[req.session.user.id].cachingContentItems === false) {
            req.session.user.contentItems = GLOBAL.userCache[req.session.user.id].contentItems;
            delete GLOBAL.userCache[req.session.user.id].contentItems;
            delete GLOBAL.userCache[req.session.user.id].cachingContentItems;
        }
    } catch (ex) {
        console.log("[" + arguments.callee.name + "] -> " + (ex.stackTrace || ex));
    }
    try {

        console.log("global cache after " + GLOBAL.userCache[req.session.user.id]);
        for (var x in GLOBAL.userCache[req.session.user.id]) {
            //console.log(x);
        }

    } catch (ex) {
        console.log(ex.stackTrace || ex);
    }

}

/**
 * push the AJAX changes made to the user's profile to the GLOBAL cache
 * @param {object} [user] the user's session (req.session.user)
 */

function cacheUserProfile(user) {
    try {

        if (typeof(GLOBAL.userCache[user.id]) === "undefined") {
            GLOBAL.userCache[user.id] = {};
        }
        GLOBAL.userCache[user.id].user = user;
        console.log("user profile cached");

    } catch (ex) {
        console.log(ex.stackTrace || ex);
    }
}


/**
 * searches through a dictionary of content items and returns the content item with the matching custom id if it exists
 * @param {dictionary} [contentItems] a dictionary of content items being searched through
 * @param {string} [customId] the custom Id of the content item being searched for
 * @return {object} the content item with the matching custom id; returns null if an exception is thrown or the content item doesn't exist
 */

function searchContentItemsByCustomId(contentItems, customId) {
    try {

        /** validate the parameters */
        if (typeof(contentItems) === "undefined" || typeof(customId) === "undefined") {
            return null;
        }


        /** loop through the content items array and return the content item with the matching custom id if it's found */
        for (var x in contentItems) {
            if (contentItems[x].customId === customId) return contentItems[x];
        }

        /** return null of nothing is found */
        return null;


    } catch (ex) {
        console.log(arguments.callee.name + " error - " + (ex.stackTrace || ex));
        return null;
    }
}


/**
 * returns the latest date found in an array or dictionary
 * @param {object} [list] an array or dictionary of objects that contain a date object as a properties
 * @param {string} [dateName] the name of the date property
 * @return [object] the latest date object that could be found in the list
 */

function findLatestDate(list, dateName) {
    var counter = 0;
    var latestDate = null;
    try {

        for (var x in list) {
            counter++;
            if (counter == 1) {
                latestDate = new Date(list[x][dateName]);
            } else { /** if the next date in the list is later than the previous captured date, grab it */
                if (latestDate < new Date(list[x][dateName])) {
                    latestDate = date2;
                }
            }
        }
        return latestDate;
    } catch (ex) {
        return latestDate;
    }
}

/** converts an array into a dictionary
 * each element of the array must contain a property matching the indexName string. this property will serve as the
 * new property for each element in the new dictionary
 * @param {array} [array] an array of objects, each containing a property matching the indexName string
 * @param {string} indexName the name of the property used to index every element being added to the new dictionary
 * @return [object]
 */

function convertArrayIntoDIctionary(array, indexName) {

    try {
        var dictionary = {};


    } catch (ex) {
        return null;
    }
}

/** export the functions */
exports.countAllElements = countAllElements;
exports.countMatchingElements = countMatchingElements;
exports.searchStringArray = searchStringArray;
exports.formatDate = formatDate;
exports.formatLongDate = formatLongDate;
exports.compileIncompleteLifePathQuestionnaires = compileIncompleteLifePathQuestionnaires;
exports.log = log;
exports.getCurrentTimeInMillis = getCurrentTimeInMillis;
exports.isChrome = isChrome;
exports.formatCallbackError = formatCallbackError;
exports.validateRegisteredUser = validateRegisteredUser;
exports.validateRegisteredUserAJAX = validateRegisteredUserAJAX;
exports.cacheUserProfile = cacheUserProfile;
exports.searchContentItemsByCustomId = searchContentItemsByCustomId;
exports.findLatestDate = findLatestDate;
