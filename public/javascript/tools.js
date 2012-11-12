/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * validates the user registration form
 */

function validateRegistrationForm(form) {

    //check if any fiedls are blank or contain default values
    if ((form.first_name.value !== '') && (form.last_name.value !== '') && (form.email.value !== '') && (form.email.value.search(' ') === -1)) {

    } else {

        alert('Please complete all fields.');
        return;
    }

    //check if the passwords match
    if (form.password.value === form.password_confirmation.value) {

    } else {
        alert('Passwords do not match!');
        form.password.value = "";
        form.password_confirmation.value = "";
        return;
    }

    //check if the password field contains spaces
    var searchResult = form.password.value.search(' ');
    if (searchResult !== -1) {
        alert('Password cannot contain spaces!');
        return;
    }

    //make sure the password field satisfies the minimum length requirement
    if ((0 < form.password.value.length) && (form.password.value.length < 4)) {
        alert('Password must be at least 4 characters!');
        return;
    }


    //make sure the provided email is well-formed (ex: aaa@bbb.ccc)
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(form.email.value) === false) {
        alert('Please enter a valid email address.');
        return;
    }

    form.submit();
    showLoadingMessage({
        "message": "Sending registration. Please wait..."
    });
};


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
 *  Checks if the provided email address is well-formed
 *  @param emailId = the id of the email control to validate
 */

function validateEmailAddress(emailId) {

    try {
        //make sure the email address field exists
        if (document.getElementById(emailId) == "undefined") {
            alert("Your email field could not be found.");
            return false;
        }
        //make sure the provided email is well-formed (ex: aaa@bbb.ccc)
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(document.getElementById(emailId)
            .value) === false) {
            alert('Please enter a valid email address.');
            return false;
        }
        return true;
    } catch (ex) {
        alert("An error occured while validating your email address.\n (" + ex + ")");
        return false;
    }
}



/**
 *  validates the requested changed for the user's profile
 */

function validateProfile(form) {

    //check if any fiedls are blank or contain default values
    if ((form.first_name.value !== '') && (form.last_name.value !== '') && (form.email.value !== '') &&

    (form.email.value.search(' ') === -1)) {

    } else {

        alert('Please complete all fields.');
        return false;
    }

    //check if the passwords match
    if (form.password.value === form.password_confirmation.value) {

    } else {
        alert('Passwords do not match!');
        form.password.value = "";
        form.password_confirmation.value = "";
        return false;
    }


    //check if the password field contains spaces
    var searchResult = form.password.value.search(' ');
    if (searchResult !== -1) {
        alert('Password cannot contain spaces!');
        return false;
    }

    //if the user chooses to update the password, make sure the password field satisfies the minimum length requirement
    if (form.password.value.length > 0 && ((1 <= form.password.value.length) && (form.password.value.length < 4))) {
        alert('Password must be at least 4 characters!');
        return false;
    }


    //make sure the provide email is well-formed (ex: aaa@bbb.ccc)
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(form.email.value) === false) {
        alert('Please enter a valid email address.');
        return false;
    }

   
    form.submit();
    showLoadingMessage({
        "message": "Updating profile. Please wait..."
    });


};

/**
 * scans for the AddThis email modal box and populates the appropriate fields with user's selectd content item.
 *
 */

function EmailModalScanner() {

    this.scanner = null;
    this.scanner = null;
    this.from = null;
    this.message = null;

    this.$ = function() {
        return document.getElementById(id);
    };

    this.startScan = function(from, title, text) {
        this.from = from;
        this.message = title + "\n" + text;
        this.scanner = setInterval("emailModalScanner.scan()", 100);
    };

    this.stopScan = function() {
        clearInterval(this.scanner);
    };

    this.scan = function() {
        if (document.getElementById("at_from") !== null && document.getElementById("at_msg") !== null) {

            document.getElementById("at_from")
                .value = this.from;
            document.getElementById("at_msg")
                .innerHTML = this.message;
            this.stopScan();
        }

    };


    this.stripHTML = function(html) {

        if (typeof html == "string") {
            return html.replace(/(<([^>]+)>)/ig, "");
        } else {
            return "";
        }
    };

};


var tools = {};
tools.$ = function(id) {
    return document.getElementById(id);
};
var explain = function() {
    alert("Coming Soon.");
};

//used to remove favorited content selected by the user in the favorites page
var Favorites = function() {
    this.removalList = "";
    this.checkBoxes = [];
    this.$ = function(id) {
        return document.getElementById(id);
    };
    this.$t = function(name) {
        return document.getElementsByTagName(name);
    };

    //creates a string of favorites  ids for deletion
    this.compileRemovalList = function() {
        this.removalList = "{";
        for (var x = 0, len = this.checkBoxes.length; x < len; x++) {
            if (this.checkBoxes[x].checked) {
                this.removalList += '"' + this.checkBoxes[x].value + '" : "" ,';
            }

        }

        if (this.removalList.length > 1) this.removalList = this.removalList.substr(0, this.removalList.length - 1) + "}";
        else {
            this.removalList = "";
        }

    };

    //
    this.deleteFavorites = function() {

        this.compileRemovalList();

        if (this.removalList.length > 0) {

            if (confirm("Are you sure you want to delete the selected items from your favorites list?")) {
                window.location = "/favorites/removeMany/" + this.removalList;
                showLoadingMessage();
            }
        } else {
            alert("You must select at least one item to delete.")
        }
    };


    //constructor        
    this.init = function() {
        var elements = this.$t('input');
        for (var x = 0, len = elements.length; x < len; x++) {
            if (elements[x].type == "checkbox") this.checkBoxes.push(elements[x]);
        }
    };

};




/*
 * a timer that encourages the guest to register in order to take advantage of the
 * wizard feature (this timer is meant to be coded internally because it contains
 *
 * revision plan: make the timer persistent by passing the current value of the timer from page to page
 *
 */
var GuestCoaxer = function(remainingTime) {

    this.time = 300000;

    this.remainingTime = remainingTime || this.time; //in millis
    this.isOn = this.remainingTime < 0 ? false : true;

    this.coaxer = null;
    this.reset = function() {
        clearTimeout(this.coaxer);
        this.remainingTime = this.time;
    };

    //decreases the remaining time by one second
    this.countDown = function() {
        if (this.remainingTime - 1000 > 0) {
            this.remainingTime -= 1000;
        } else {
            this.remainingTime = 0;
        }

    };

    //start timer
    this.start = function() {
        if (!this.isOn) {
            return;
        }
        clearTimeout(this.coaxer);
        this.reset();
        this.cycle();

    };

    //decreases the remaining time at one-second intervals. this cycle will repeat until the time expires
    this.cycle = function() {
        if (!this.isOn) {
            return;
        }
        this.coaxer = setTimeout('guestCoaxer.countDown();if(guestCoaxer.remainingTime > 0){guestCoaxer.cycle()}else' + '{TINY_BOX.box.show({url:"/guestUserMessage", width:948,animate:true,closejs:function (){guestCoaxer.start()}})}', 1000);
    }

    /*
    this.cycle = function (time) {
        this.time = time || <%-guestCoaxerRemainingTime || 5000%>;
        this.coaxer = setTimeout('if(guestCoaxer.isOn){TINY_BOX.box.show({url:"/guestUserMessage", animate:true,closejs:function (){guestCoaxer.start()}})}',this.time);
    };
    */

    //stores the remaining time in the passed input field
    this.storeRemainingTime = function(timeObj) {
        timeObj.value = this.remainingTime;
    }

    //appends the remaining time to the passed anchor tag
    this.appendRemainingTime = function(timeTag) {
        return timeTag.title + "&guestCoaxerRemainingTime=" + this.remainingTime;
    }
};


//show/hide tag
var toggleVisibility = function(id) {
    if (typeof(document.getElementById(id)) != "undefined") {
        //if the element is visible, hide it
        if (document.getElementById(id)
            .style.display == "block") {
            document.getElementById(id)
                .style.display = "none";
            //if the element is hidden, show it
        } else {
            document.getElementById(id)
                .style.display = "block";
        }
    }
}


/**
 * validates the passed questionnaire
 *
 * @param {object} [form] html form element
 * @param {number} [dsfadsf]
 * @return {boolean} returns whether or not all of the form's questions have been answered
 */

    function validateQuestionnaire(form, totalQuestions) {
        //validate the passed arguments
        if (typeof(form) === "undefined" || typeof(totalQuestions) === "undefined") {
            alert("The required parameters are missing.")
            return false;
        }
        try {
            //check if any questions have a default value
            for (var x = 1; x <= totalQuestions; x++) {
                if (document.getElementById("question" + x + "ID")
                    .selectedIndex == 0) {
                    alert("Question " + x + " hasn't been answered.");
                    return false;
                }
            }
            return true;
        } catch (ex) {
            alert(ex);
            return false;
        }

    }

var checkListItemManager = {};

/**
 * adds and removes a check list item from the user's account
 * @param {object} [checkListItemBox] the check box designated to a check list item
 * @param {object} [selectedQuestion] the check box designated to a check list item
 * @param {object} [selectedLifePath] the check box designated to a check list item
 */
checkListItemManager.editCheckListItem = function(checkListItemBox, selectedQuestion, selectedLifePath) {
    try { 
		/** simulates server activity to discourage the user from repeatedly clicking the checkbox (changed to a legitimate wait time 10/12) */
        showLoadingMessage({
            "doNotWait": true,
            //"duration": (Math.random() * 2000) + 1000
        });
        $.get("/ajax/editCheckListItem/?checkListItem=" + checkListItemBox.value + "&selectedQuestion=" + selectedQuestion + "&selectedLifePath=" + selectedLifePath + "&add=" + checkListItemBox.checked, function(response) {
			
			var resp = JSON.parse(response);
			try{
				if(resp.success){
				hideLoadingMessage();
			}else{
				alert(resp.meta.message);
				hideLoadingMessage();
			}
			}catch(ex){

				alert("An error occurred while changing your checklist item settings. \n("+
				ex.toString()+")");
				hideLoadingMessage();
				checkListItemBox.check = !checkListItemBox.checked;
			}
			
        });

    } catch (ex) {
        alert("An error has occured: " + ex);
        hideLoadingMessage();
        checkListItemBox.check = !checkListItemBox.checked;
    }
};

/**
 * manages the completion of the user's demographic questionnaires
 *
 */

function DecisionEngine(selectedLifePath, questionCount) {
    var root = this;
    this.questionCount = questionCount || 0;
    this.questionIndex = 1;
    this.selectedLifePath = selectedLifePath || "";

    /**
     * mark the current question as skipped
     */
    this.skipQuestion = function() { /** mark this question to be skipped */
        var customId = document.getElementById("question" + root.questionIndex + "ID")
            .value;
        document.getElementById(customId)
            .value = "skip";


        if (root.questionIndex + 1 <= root.questionCount) { /** hide this question */
            document.getElementById(root.selectedLifePath + "_" + root.questionIndex)
                .style.display = "none";


            /** show the next question */
            root.questionIndex++;
            document.getElementById(root.selectedLifePath + "_" + root.questionIndex)
                .style.display = "table-row";
        } else {
            document.getElementById("life_path_questionnaire")
                .submit();
            showLoadingMessage();
        }

    };

    /**
     * save the current question's answer
     */
    this.saveAnswer = function() {

        /** mark this question to be saved */
        if (root.questionIndex + 1 <= root.questionCount) { /** hide this question */
            document.getElementById(root.selectedLifePath + "_" + root.questionIndex)
                .style.display = "none";


            /** show the next question */
            root.questionIndex++;
            document.getElementById(root.selectedLifePath + "_" + root.questionIndex)
                .style.display = "table-row";
        } else {

            document.getElementById("life_path_questionnaire")
                .submit();
            showLoadingMessage();
        }

    };

}



/** 
 * shows a message explaining the checklist item's check box
 * @param {boolean} [wasCheckBoxExplained]
 */

function explainCheckBox(checkBoxExplained) {

    if (checkBoxExplained !== true && global.checkBoxExplained !== true && global.shownforThisRequest !== true) {
        if (this.messageShown == true) {
            return;
        }
        global.shownforThisRequest = true;
        this.messageShown = true;
        TINY_BOX.box.show({
            url: "/ajax/showCheckListItemExplanation",
            width: 942,
            animate: true

        });
        /**
        TINY_MESSAGE.box.show({
            html: "<div align='center'>" + "<p>You can use the check boxes to mark off the adjacent check list item!</p>" + "<input type='button' value='Okay' onclick='TINY_MESSAGE.box.hide()' />&nbsp;<input type='button' value='Do not show this message again' onclick='global.confirmCheckBoxExplanation();' /><br />&nbsp;</div>",
            animate: true,
            close: false,
            mask: false,
            boxid: 'confirm',
            top: -14,

        });
		*/
    }
}

/**
 * stores this user's id in a global cache so the check list item explanation isn't shown again
 */

function confirmCheckBoxExplanation() {
    global.checkBoxExplained = true;
    //TINY_MESSAGE.box.hide();
    TINY_BOX.box.hide();
    this.messageShown = false;
    $.get("/ajax/hideCheckBoxExplanation", function(response) {});
}


/**
 * ReplaceAll by Fagner Brack (MIT Licensed)
 * Replaces all occurrences of a substring in a string
 * @param {string} [token] the token to search for
 * @param {string} [newToken] the replacement token
 * @param {boolean} [ignoreCase] a boolean value that determines the case sensitivity of the target token
 * @return {string} the trimmed string
 */
String.prototype.replaceAll = function(token, newToken, ignoreCase) {
    try {
        var str, i = -1,
            _token;
        if ((str = this.toString()) && typeof token === "string") {
            _token = ignoreCase === true ? token.toLowerCase() : undefined;
            while ((i = (
            _token !== undefined ? str.toLowerCase()
                .indexOf(
            _token,
            i >= 0 ? i + newToken.length : 0) : str.indexOf(
            token,
            i >= 0 ? i + newToken.length : 0))) !== -1) {
                str = str.substring(0, i)
                    .concat(newToken)
                    .concat(str.substring(i + token.length));
            }
        }
        return str;
    } catch (ex) {
        return null;
    }
};



/**
 * validates the email form before being sent
 * @param {object} [form] a reference to the html form element in the page
 * @return {boolean} true: validation succeeded; false: validation failed
 */

function validateEmailForm(form) {
    try {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;


        /** validate subject */
        if (form.subject.value.length === 0) {
            alert("The subject cannot be blank.");
            return false;
        }
        if (form.subject.value.replaceAll(' ', '', false)
            .length === 0) {
            alert("Your subject cannot be composed of whitespace.");
            return false;
        }

        /** validate recipient's email address */
        if (form.recipient.value.length === 0) {
            alert("The recipient's email address cannot be blank.");
            return false;
        }
        if (reg.test(form.recipient.value) === false) {
            alert('Please enter a valid email address for the recipient.');
            return false;
        }

        /** validate the message content */
        if (form.message.textContent.length === 0) {
            alert("Your message cannot be blank.");
            return false;
        }
        if (form.message.textContent.replaceAll(" ", "", false)
            .length === 0) {
            alert("Your message cannot consist of whitespace.");
            return false;
        }

        return true;
    } catch (ex) {
        alert("An error occurred while validating your email form. (" + ex + ")");
        return false;

    }
}




/**
 * checks if the user's browser is google chrome
 * @return {boolean} true: this browser is google chrome; false the browser isn't google chrome
 */

function isChrome() {
    try {
        alert(navigator.userAgent);
        if (navigator.userAgent.toUpperCase()
            .indexOf("CHROME") != -1) {
            return true;
        } else {
            return false;

        }
    } catch (ex) {
        return false
    }
}

/** 
Adds the activity loggers to the content-sharing icons. 
These event listeners need to be added after the page is loaded due to the time it
takes the external AddThis script to render the links
*/
function logContentSharing(contentItemId) {

    try {
        setTimeout(function() {
            $("#fbSharingIcon")
                .click(

            function() {

                $.get("/ajax/activityLog/fbShared/" + contentItemId, function(result) { /** do nothing for callback */
                });
            });
            $("#twitterSharingIcon")
                .click(

            function() {

                $.get("/ajax/activityLog/twitterShared/" + contentItemId, function(result) { /** do nothing for callback */
                });
            });
            $("#emailSharingIcon")
                .click(

            function() {

                $.get("/ajax/activityLog/emailShared/" + contentItemId, function(result) { /** do nothing for callback */
                });
            });
        }, 1000);
    } catch (ex) {}
}




