function ioCreateGroup(req, resp){

  var groupCollectionID = "d8b288c60a8ad0aa82eaee9ddd06";

  var createStatus = function(code, msg, body) {
    if(body !== undefined) {
      if(typeof body === "object") {
        msg = msg + "; " + JSON.stringify(body);
      } else {
        msg = msg + "; " + body;
      }
    }
    return {
      "code": code,
      "message": msg
    };
  };

  var createCb = function(err, body) {
    if(err) {
      resp.error(createStatus(500, "Unable to create group", body));
    } else {
      resp.success(createStatus(200, body));
    }
  }

  //initialize ClearBlade object
  var initOptions = {
    systemKey: req.systemKey,
    systemSecret: req.systemSecret,
    useUser: {
      email: req.user,
      authToken: req.userToken
    }
  }

  ClearBlade.init(initOptions);

  var query = ClearBlade.Query({collection:req.params.group.collectionID});
  query.equalTo("name", req.params.group.name);
  query.fetch(function(err, body) {
    if(err) {
      resp.error(createStatus(500, "Unable to fetch", body));
    } else {
      //group already exists
      if(body.TOTAL > 0) {
        resp.success(createStatus(409, body.DATA[0]));
      } else {

        var col = ClearBlade.Collection(groupCollectionID);

        //row to be inserted into collection
        var groupObj = {
          name: req.params.group.name,
          topic: req.params.group.topic
        }

        col.create(groupObj, createCb);
      }
    }
  });

}