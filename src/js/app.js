//simple globals
//clearblade object that will be used to call all methods in the SDK
var clearblade = new ClearBlade();
var messaging;

var userInfo = {
    email : "",
    firstName : "",
    lastName : ""
};

var initOptions = {
    systemKey: "ca9eb0c70a86a2ffdd9eddedb4b501",
    systemSecret: "CA9EB0C70AB0B9B597C3C2A6E0BE01",
    email:"",
    password:""
};

clearblade.init(initOptions);

var registerEmail;
var registerPassword;
var registerFirst;
var registerLast;

//Begin - login logic
var loginEvent = function(e){
    if (typeof e === 'undefined' || e.charCode==13){
        document.getElementById("loginError").innerHTML="";
        var loginButton = document.getElementById("loginButton");
        loginButton.disabled=true;

        userInfo.email = document.getElementById("userEmail").value;
        userPassword = document.getElementById("userPassword").value;

        login(userInfo.email, userPassword, function(err, data) {
            if(err) {
                document.getElementById("loginError").innerHTML=data;
            } else {
                showView("chat");
            }
        });

    }

};

var login = function(userEmail, userPassword, callback) {
    var loginCallback = function(err, data){
        if(err) {
            callback(err, data);
        } else {
            messaging = clearblade.Messaging({cleanSession:true}, function() {});
            loadUserInfo();
            showView("chat");
            callback(err, data);
        }

    };
    initOptions.email = userEmail;
    initOptions.password = userPassword;
    initOptions.callback = loginCallback;
    clearblade.init(initOptions);
};

var loadUserInfo = function() {
    var callback = function(err, data){
        if (err) {
            alert(JSON.stringify(data));
        }else{
            userInfo.email = data.email;
            userInfo.firstName = data.firstname;
            userInfo.lastName = data.lastname;
        }
    };
    clearblade.User().getUser(callback);
};
//End - Login logic

//Begin - Register logic
var registerEvent = function(e) {
    if (typeof e === 'undefined' || e.charCode==13){
        var registerButton = document.getElementById("registerButton");
        registerButton.disabled=true;

        //first add the user to the System
        registerEmail = document.getElementById("registerEmail").value;
        registerPassword = document.getElementById("registerPass1").value;
        registerConfirm = document.getElementById("registerPass2").value;
        registerFirst = document.getElementById("registerFirst").value;
        registerLast = document.getElementById("registerLast").value;
        if (registerPassword != registerConfirm) {
            document.getElementById("registerMessage").innerHTML = "passwords do not match";
            registerButton.disabled = false;
            return;
        }
        if (registerEmail === "" || registerPassword ==="" || registerFirst ==="" || registerLast===""){
            document.getElementById("registerMessage").innerHTML = "all field are required";
            registerButton.disabled = false;
            return;
        }
        register(registerEmail, registerPassword);
    }
};

var register = function(userEmail, userPassword) {
    clearblade.registerUser(userEmail, userPassword, registerCallback);

};
//End - Register logic

var registerCallback = function(err, data) {
    if (err) {
        registerButton.disabled=false;
        document.getElementById("registerMessage").innerHTML = data;
    } else{


        login(registerEmail, registerPassword, function(err, data) {
            if(err) {
                alert(JSON.stringify(data));
            } else {
                var user = clearblade.User();
                user.setUser({"firstname":registerFirst,"lastname":registerLast}, function(err, data){
                    if(err) {
                        alert("Unable to save user info; " + JSON.stringify(data));
                    } else {
                        _connect();
                        email = registerEmail;
                        loadUserInfo();
                        showView("chat");
                        registerButton.disabled=false;
                    }
                });
            }

        });

    }

};

var views = {
    login: {
        setup: function() {
            setTitleSection("titleLeft","");
            setTitleSection("titleCenter","ClearChat");
            setTitleSection("titleRight","");

        }
    },
    register: {
        setup: function() {
            setTitleSection("titleLeft","Back");
            setTitleSection("titleCenter","ClearChat");
            setTitleRight("");
            titleLeftClick = function() {
                showView("login");
            };
            titleCenterClick = function() {};
        }

    }
};


//UI helper functions for building and rendering on a mobile style device
var showView = function(viewToShow) {
    for(var view in views) {
        if(view === viewToShow) {
            document.getElementById(viewToShow).className = "";
            views[view].setup();
        } else {
            document.getElementById(view).className = "hiddenView";
        }
    }
};
//Populate the header bar on the mobile view
var setTitleSection = function(section, content){
    document.getElementById(section).innerHTML= content;
    if (content===""){
        document.getElementById(section).style.display = "none";
    } else {
        document.getElementById(section).style.display = "inline";
    }
};



