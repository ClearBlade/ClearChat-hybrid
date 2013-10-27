//simple globals
var username ="";
var currentGroup = "";
var messaging = {};

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
	showView("groups", "login");
	userName = document.getElementById("userName").value;
	getGroups();
};

var getGroups= function(){
	var collection = new ClearBlade.Collection("525bf8e48ab3a3212a06bd83");
	document.getElementById("groupList").innerHTML = "Loading Groups";;
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

var joinGroup = function(groupName){
	messaging = new ClearBlade.Messaging({});
	var options ={
		onSuccess:messageReceived,
		onFailure:messageFailure
	};
	messaging.Subscribe(groupName, options);
	showView("chat", "groups");
};

var messageReceived = function(var1, var2, var3){
	alert("var1: "+var1);
	alert("var2: "+var2);
	alert("var3: "+var3);
}

var messageFailure= function(var1, var2, var3){
	alert("Failure var1: "+var1);
	alert("Failure var2: "+var2);
	alert("failure var3: "+var3);
}

var sendChat = function() {
	var message = document.getElementById("message").value;
	messaging.Publish(currentGroup, message );
};

//simple helpers
var showView = function(newView, oldView){
	document.getElementById(newView).classList.toggle('hiddenView');
	if(typeof oldView != 'undefined') {
		document.getElementById(oldView).classList.toggle('hiddenView');
	}
};





