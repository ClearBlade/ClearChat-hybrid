
//simple globals
//clearblade object that will be used to call all methods in the SDK
var cb = new ClearBlade();
var email ="";
var firstName = "";
var lastName = "";
var initOptions = {
    systemKey: "e6cf87c60af0e1b982aaaedc979701",
    systemSecret: "E6CF87C60AC0A88DA4A69183B1D301"
}
var groupCollectionID = "d8b288c60a8ad0aa82eaee9ddd06";

var currentGroup = "";
var publicGroups = [];

var currentItem;

//if user is not logged in, show login view
//else load user info and show chat view
var startup = function() {
    calculateMessageHeight();

    var initCallback = function(err, body) {
        if(err) {
            alert(JSON.stringify(body));
        } else {
            if(typeof(Storage) !== "undefined") {
                // Code for localStorage/sessionStorage.
                var ioEmail = localStorage.ioEmail;
                var ioToken = localStorage.ioToken;
                if (typeof ioEmail !== "undefined" && typeof ioToken !== "undefined"){

                    cb.setUser(ioEmail, ioToken);
                    cb.isCurrentUserAuthenticated(function(err, data){
                        _connect();
                        loadUserInfo();
                        showView("chat");
                    });


                } else {
                    showView("login");
                }

            } else {
                // Sorry! No Web Storage support..
                showView("login");
            }
        }

    }

    initOptions.callback = initCallback;
    cb.init(initOptions);

};

var logout = function() {
    if(currentGroup.data && currentGroup.data.item_id) {
        unsubscribe(currentGroup.data.item_id, {});
    }
    setTopic("");
    setTitleCenter("<div class='titleLabel'>IO</div>");
    setTitleLeft("");
    setTitleRight("");

    cb.logoutUser(function(err, data) {
        if(err) {
            localStorage.clear();
            alert("Unable to logout; " + JSON.stringify(data));
        } else {
            localStorage.clear();
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
            var topicValue = currentGroup.data && currentGroup.data.topic ? currentGroup.data.topic : "";
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
                    var groupObj = {
                        name: groupName,
                        collectionID: groupCollectionID
                    }

                    var params = {"group":groupObj};
                    var _cb = function(err, data) {
                        if(err) {
                            alert(JSON.stringify(data));
                        } else {
                            if(data.results.code !== 200) {
                                if(data.results.code === 409) {
                                    alert(JSON.stringify(data));
                                } else {
                                    alert("Error creating group; " + JSON.stringify(data));
                                }
                            } else {
                                var newGroup = cb.Item(data, {collectionID: groupCollectionID});
                                publicGroups.push(newGroup);
                                createGroupList(publicGroups);
                                views.chat.setup(newGroup.data.item_id);
                            }
                        }
                    }
                    cb.Code().execute("ioCreateGroup", params, _cb);
                }else {
                    //we have a current group; user is updating it
                    currentGroup.data.name = groupName;
                    currentGroup.data.topic = topic;
                    currentGroup.save(function(err, data) {
                        if(err) {
                            alert(JSON.stringify(data));
                        } else {
                            createGroupList(publicGroups);
                        }
                    });
                    views.chat.setup(currentGroup.data.item_id);
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

                var topicContent = currentGroup.data.topic && currentGroup.data.topic !== "null" ? "Current Topic - " + currentGroup.data.topic : "No Topic set";
                setTopic(topicContent);

                titleLeftClick = function() {
                    unsubscribe(currentGroup.data.item_id);
                    views.chat.setup(null);
                };
                titleCenterClick = function() {};
                titleRightClick = function() {
                    views.edit.setup();
                };
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

                var messageHistoryCb = function(err, body) {
                    if(err) {
                        alert("Unable to retrieve message history for " + currentGroup.data.name + "; " + JSON.stringify(body));
                    } else {
                        for(var i=body.length-1; i>-1; i--) {
                            onMessageArrived(body[i].message, body[i]["send-date"]);
                        }
                    }
                }

                var _sub = function(data) {
                    _io.messaging.Subscribe("/"+currentGroup.data.item_id, {}, onMessageArrived);
                }

                _io.messaging = cb.Messaging({cleanSession:true}, _sub);

                _io.messaging.getMessageHistory(currentGroup.data.item_id, new Date().getTime(), 25, messageHistoryCb);

            } else {
                //no group selected; show overview
                document.getElementById("groupChat").innerHTML = "";
                setTitleRight("New");
                setTitleLeft("Logout");
                setTitleCenter("IO");
                setTopic("");
                titleLeftClick = function() {
                    logout();
                }
                titleRightClick = function() {
                    views.edit.setup();
                }

                var query = cb.Query({collectionID: groupCollectionID});
                query.setPage(0,0);
                query.fetch(function(err, data){
                    if (err){
                        document.getElementById("groupList").innerHTML = "Failed to retrieve groups";
                    }else{
                        publicGroups = data;
                        createGroupList(publicGroups);
                    }
                });
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
    var _cb = function(err, data){
        if(err) {
            callback(err, data);
        } else {

            localStorage.ioEmail = data.email;
            localStorage.ioToken = data.authToken;

            _connect();
            email = userEmail;
            loadUserInfo();
            showView("chat");
            callback(err, data);
        }

    };

    cb.loginUser(userEmail, userPassword, _cb);
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
//internal object for storing state
var _io = {groupId:"", messaging:{}, connected: false};

//connection function for message broker
var _connect = function() {
    var _cb = function(data){
        _io.connected = true;
    };
    _io.messaging = cb.Messaging({cleanSession:true}, _cb);
};

var unsubscribe = function(groupId){
    _io.messaging.Unsubscribe(groupId, {});
}

var loadUserInfo = function() {
    var callback = function(err, data){
        if (err) {
            alert(JSON.stringify(data));
        }else{
            email =data.email;
            firstName = data.firstname;
            lastName = data.lastname;
        }
    };

    var user = cb.User();
    user.getUser(callback);
};

var showRegister = function() {
    showView("registration");
}

var register = function(userName) {
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

    var registerCallback = function(err, data) {
        if (err) {
            registerButton.disabled=false;
            document.getElementById("registerMessage").innerHTML = data;
        } else{


            login(registerEmail, registerPassword, function(err, data) {
                if(err) {
                    alert(JSON.stringify(data));
                } else {
                    var user = cb.User();
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

    cb.registerUser(registerEmail, registerPassword, registerCallback);

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
        unsubscribe(currentGroup.data.item_id);
    }

    views.chat.setup(groupId);
};

var sendChat = function(e) {
    if (typeof e === 'undefined' || e.charCode==13){
        var textVal = document.getElementById("message").value;
        message = {"topic":currentGroup.data.item_id, "user_id":email, "name":firstName, "type":"text", "payload":textVal};
        _io.messaging.Publish(message.topic, JSON.stringify(message) );
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

var setTopic = function(content) {
    setTitleSection("groupTopic", content);
}

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

