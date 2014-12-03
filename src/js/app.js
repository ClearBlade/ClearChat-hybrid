
//simple globals
//clearblade object that will be used to call all methods in the SDK
var email ="";
var firstName = "";
var lastName = "";
var groupCollectionID = YOUR_COLLECTION_ID;

var currentGroup = "";
var publicGroups = [];

var currentItem;

var startup = function() {
  showView("login");
  calculateMessageHeight();
};

var logout = function() {
  if(currentGroup.data && currentGroup.data.item_id) {
  }

  setTitleCenter("<div class='titleLabel'>IO</div>");
  setTitleLeft("");
  setTitleRight("");

  cb.logoutUser(function(err, data) {
    if(err) {
      alert("Unable to logout; " + JSON.stringify(data));
    } else {
      showView("login");
    }
  });
}

var views = {
  login: {
    setup: function() {
      setTitleLeft("");
      setTitleCenter("<div class='titleLabel'>IO</div>");
      setTitleRight("");

    }
  },
  registration: {
    setup: function() {
      setTitleLeft("Back");
      setTitleCenter("<div class='titleLabel'>IO</div>");
      setTitleRight("");
      titleLeftClick = function() {
        showView("login");
      };
      titleCenterClick = function() {};
    }

  },
  edit: {
    setup: function() {
      setTitleLeft("Cancel");
      setTitleRight("Done");

      var groupNameValue = currentGroup.data && currentGroup.data.name ? currentGroup.data.name : "";
      setTitleCenter("<input class='halfInput' type='text' id='groupNameField' placeholder='Group Name' value='"+groupNameValue+"'/>");


      titleLeftClick = function() {
        views.chat.setup(currentGroup.data.item_id);
      }
      titleRightClick = function() {
        var groupName = document.getElementById("groupNameField").value;

        if (groupName === "") {
          return;
        }

        if (typeof currentGroup.data == 'undefined' || typeof currentGroup.data.item_id == 'undefined') {
          //no group is selected; user is creating a new group
          createGroup(groupName);
        }else {
          //we have a current group; user is updating it
          saveGroup(groupName);
        }
      }
    }
  },
  chat: {
    setup: function(groupID) {
      if(groupID) {
        //we have selected a group
        currentGroup = getGroupById(groupID);

        document.getElementById("groupChat").innerHTML = "";
        setTitleLeft("Back");
        setTitleCenter("<div class='titleLabel'>IO - "+currentGroup.data.name+"</div>");
        setTitleRight("Edit");

        titleLeftClick = function() {
          views.chat.setup(null);
        };
        titleCenterClick = function() {};
        titleRightClick = function() {
          views.edit.setup();
        };

        subscribe(currentGroup.data.item_id);

        getMessageHistory(currentGroup.data.item_id);

      } else {
        //no group selected; show overview
        document.getElementById("groupChat").innerHTML = "";
        setTitleRight("New");
        setTitleLeft("Logout");
        setTitleCenter("IO");
        titleLeftClick = function() {
          logout();
        }
        titleRightClick = function() {
          views.edit.setup();
        }

        fetchGroups();

        subscribe(currentGroup.data.item_id);

      }

    }
  }
}

var showView = function(viewToShow) {
  for(var view in views) {
    if(view === viewToShow) {
      document.getElementById(viewToShow).className = "";
      views[view].setup();
    } else {
      document.getElementById(view).className = "hiddenView";
    }
  }
}

var login = function(userEmail, userPassword, callback) {

}

var register = function() {

}

var createGroup = function(name) {

}

var saveGroup = function(name) {

}

var fetchGroups = function() {

}

var loginEvent = function(e){
  if (typeof e === 'undefined' || e.charCode==13){
    document.getElementById("loginError").innerHTML="";
    var loginButton = document.getElementById("loginButton");
    loginButton.disabled=true;

    userEmail = document.getElementById("userEmail").value;
    userPassword = document.getElementById("userPassword").value;

    login(userEmail, userPassword, function(err, data) {
      if(err) {
        document.getElementById("loginError").innerHTML=data;
      } else {
        showView("chat");
      }
    });

  }

};

//object that will hold clearblade messaging object
var messaging = {};

//connection function for message broker
var _connect = function() {

};

var subscribe = function(groupId) {

}

var unsubscribe = function(groupId){

}

var onMessageArrived=function(message, sendDate) {
  if(typeof message === "string") {
    message = JSON.parse(message);
  }

  var messageDiv = document.createElement("div");
  var messageSpan = document.createElement("span");
  messageDiv.appendChild(messageSpan);
  messageDiv.className="messageBox";
  var nameDiv = document.createElement("span");
  nameDiv.className="messageName"
  nameDiv.appendChild(document.createTextNode(message.name));
  var messageContentDiv = document.createElement("span");
  messageContentDiv.className="messageContent";
  if (message.type=="text"){
    messageContentDiv.appendChild(document.createTextNode(message.payload));
  } else if (message.type=="img"){

    messageContentDiv.innerHTML='<img src="' + message.payload +'">';
  }

  var currentTime = sendDate !== undefined ? new Date(sendDate*1000) : new Date();
  var messageTimeDiv = document.createElement("span");
  messageTimeDiv.className="messageTime";
  messageTimeDiv.appendChild(document.createTextNode(currentTime.getHours()+":"+currentTime.getMinutes()))

  if (message.user_id == email){
    messageSpan.appendChild(messageContentDiv);
    messageSpan.appendChild(messageTimeDiv);
    messageSpan.appendChild(nameDiv);
    messageDiv.style.textAlign="right";
  } else {
    messageSpan.appendChild(nameDiv);
    messageSpan.appendChild(messageContentDiv);
    messageSpan.appendChild(messageTimeDiv);
    messageDiv.style.textAlign="left";
  }

  var groupChatDiv = document.getElementById("groupChat");
  groupChatDiv.appendChild(messageDiv);
  groupChatDiv.scrollTop = groupChatDiv.scrollHeight;
};


var getMessageHistory = function(groupId) {

}

var loadUserInfo = function() {

};

var refreshGroups = true;

var createGroupList = function(groups) {

  if(groups.length > 0) {
    document.getElementById("chatGroupsListParent").innerHTML = "";
    document.getElementById("noGroups").className = "hiddenView";
    for (var i = 0; i <groups.length; i++){
      document.getElementById("chatGroupsListParent").innerHTML += "<li class=\"groupitem\" onclick='selectGroup(&quot;"+groups[i].data.item_id+"&quot;)'>"+groups[i].data.name+"</li>";
    }
  } else {
    //show No Groups message
    document.getElementById("noGroups").className = "";
  }
}

var getGroupById = function(searchId){
  for (var i =0 ; i < publicGroups.length; i++){
    if (publicGroups[i].data.item_id == searchId){
      return publicGroups[i];
    }
  }
  return {};
};

var selectGroup = function(groupId){
  if (currentGroup.data && currentGroup.data.item_id){
    //we are changing topics within the chat view, unsub from the current chat
  }

  views.chat.setup(groupId);
};

var sendChat = function(e) {
  if (typeof e === 'undefined' || e.charCode==13){
    var textVal = document.getElementById("message").value;
    message = {"topic":currentGroup.data.item_id, "user_id":email, "name":firstName, "type":"text", "payload":textVal};
    messaging.Publish(message.topic, JSON.stringify(message) );
    document.getElementById("message").value="";
  }
};

var sendBin = function(e){
  var textVal = document.getElementById("message").value;
  message = {"topic":currentGroup.data.item_id, "user_id":email, "name":firstName, "type":"img", "payload":store};
  ioSend(message);
  document.getElementById("message").value="";
  toggleChatType();
}

var chatType = "text";
var toggleChatType = function(e) {
  if (chatType==="text"){
    chatType = "bin";
  }else{
    chatType ="text";
  }
  document.getElementById("groupMessageText").classList.toggle('hiddenView');
  document.getElementById("groupMessageBin").classList.toggle('hiddenView');
};

window.onload=function()
{
  var y = document.getElementById("getimage");
  y.addEventListener('change', loadimage, false);
};

var store;
function imageHandler(e2)
{
  store = e2.target.result;
  document.getElementById("sendBinButton").disabled = false;
};

function loadimage(e1)
{
  document.getElementById("sendBinButton").disabled = true;
  var filename = e1.target.files[0];
  var fr = new FileReader();
  fr.onload = imageHandler;
  fr.readAsDataURL(filename);
};

var setTitleSection = function(section, content){
  document.getElementById(section).innerHTML= content;
  if (content===""){
    document.getElementById(section).style.display = "none";
  } else {
    document.getElementById(section).style.display = "inline";
  }
};

var setTitleLeft = function(content){
  setTitleSection("titleLeft", content);
};

var titleLeftClick = function() {};

var setTitleCenter = function(content){
  setTitleSection("titleCenter", content);
};

var titleCenterClick = function() {};

var setTitleRight = function(content){
  setTitleSection("titleRight", content);
};

var titleRightClick = function() {};

var calculateMessageHeight = function() {
  var messageHeight = window.innerHeight - 115;
  document.getElementById("groupChat").style.height= ""+ messageHeight+"px";
}

window.addEventListener('resize', function(event){
  calculateMessageHeight();
  var chatGroupListDiv = document.getElementById("chatGroupList");
  if (window.innerWidth>500){
    chatGroupListDiv.style.display="inline";
    var groupList = document.getElementById("publicGroupList")
  }else{
    chatGroupListDiv.style.display="none";
  }
});

