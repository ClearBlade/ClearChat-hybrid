//simple globals
var userName ="";
var currentGroup = "";
var messaging = {};

var currentView;
var previousView;

//simple functions
var startup = function() {
	//setup the ClearBlade connection
	var initOptions = {
            appKey: "525542228ab3a3212a06bd81",
            appSecret: "MNDDJ0POOIC98VTS9ZQZQ5JBQB0FKI"
    };
    ClearBlade.init(initOptions);

    showView("login");
};

var login = function(){
	
	var loginButton = document.getElementById("loginButton");
	loginButton.disabled=true;

	userName = document.getElementById("userName").value;

	var col = new ClearBlade.Collection("525542308ab3a3212a06bd82");
	var query = new ClearBlade.Query();
	query.equalTo('username', userName);
	var callback = function(err, data){
		if (typeof data === 'object'){
			//alert ("Welcome back "+userName);
			document.getElementById("welcomeMessage").innerHTML="Welcome back "+userName+".  Start chatting now!";
		}else{
			col.create({'username':userName},function(err, data){
				//alert("Thanks for joining us "+userName);
				document.getElementById("welcomeMessage").innerHTML="Thanks for joining us "+userName+".  Start chatting now!";
			});
		}
		loginButton.disabled = false;
		showView("groups", "login");
		getGroups();
	}
	col.fetch(query, callback);

};

var getGroups= function(){
	var collection = new ClearBlade.Collection("525bf8e48ab3a3212a06bd83");
	document.getElementById("groupList").innerHTML = "Loading Groups";
	collection.fetch (function (err, data) {
        if (err) {
            throw new Error (data);
        } else {
            var groupList = document.getElementById("groupList");
            var liString="";
            for (var i = 0; i <data.length; i++){
				var item =  data[i];

				liString = liString + "<li onclick='joinGroup(&quot;"+item.data.groupName+"&quot;)'>"+item.data.groupName+"</li>";
            }
          document.getElementById("groupList").innerHTML = liString;
        }
	});
	
};

var createGroup = function() {
	var val = document.getElementById("newGroupName").value;
	var col = new ClearBlade.Collection("525bf8e48ab3a3212a06bd83");
	var callback = function(err, data){
		joinGroup(val);
	};

	col.create({'groupName':val},callback);
}
var chatString="";
var joinGroup = function(groupName){
	currentGroup = groupName;
	document.getElementById("sendButton").disabled = true;
	document.getElementById("groupChat").innerHTML = "";
	chatString="";
	var onMessageArrived=function(message) {
	  chatString = chatString + "<br>" +message;
	  document.getElementById("groupChat").innerHTML = chatString;
	};	

	var onConnect = function(data) {
	  // Once a connection has been made, make a subscription and send a message.
	  messaging.Subscribe("/"+currentGroup, {}, onMessageArrived);
	  document.getElementById("sendButton").disabled = false;
	};
	
	messaging = new ClearBlade.Messaging({}, onConnect);
	showView("chat", "groups");
};

var sendChat = function(e) {
	if (typeof e === 'undefined' || e.charCode==13){
		var message = document.getElementById("message").value;
		message = "<bold>"+userName+"</bold>" +": "+message;
		messaging.Publish(currentGroup, message );
		document.getElementById("message").value="";
	}
};

//simple helpers
var showView = function(newView, oldView){
	document.getElementById(newView).classList.toggle('hiddenView');
	if(typeof oldView != 'undefined') {
		document.getElementById(oldView).classList.toggle('hiddenView');
	}
	previousView = oldView;
	currentView = newView;
};

var goBack = function() {
	if (currentView=="chat"){
		showView("groups", "chat");
	}else if (currentView=="groups"){
		showView("login", "groups");
	}
}





