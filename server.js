var express = require("express"),
    http = require("http"),
    // import the mongoose library
    mongoose = require("mongoose"),
    Socket_Io = require("socket.io"),
    app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [String]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);
var server = http.createServer(app);
var io = new Socket_Io(server);
server.listen(3000);
console.log("listening on port : 3000");
io.on('connection', function(socket) {
    socket.on('send_new_todo', function(msg) {
        //console.log("Message description server side :"+msg.description);
        //console.log("Message tags server side :"+msg.tags);
        var newToDo = new ToDo({
            "description": msg.description,
            "tags": msg.tags
        });
        newToDo.save(function(err, result) {
            if (err !== null) {
                // the element did not get saved!
                console.log(err);
                //res.send("ERROR");
            } else {
                console.log(result);
                // our client expects *all* of the todo items to be returned, so we'll do
                // an additional request to maintain compatibility
                ToDo.find({}, function(err, result) {
                    if (err !== null) {
                        // the element did not get saved!
                        //res.send("ERROR");
                    }
                    io.emit('send_new_todo', result);
                    //res.json(result);
                });
            }
        });
    });
});
app.get("/todos.json", function(req, res) {
    ToDo.find({}, function(err, toDos) {
        res.json(toDos);
    });
});

app.post("/todos", function(req, res) {
    console.log(req.body);
    var newToDo = new ToDo({
        "description": req.body.description,
        "tags": req.body.tags
    });
    newToDo.save(function(err, result) {
        if (err !== null) {
            // the element did not get saved!
            console.log(err);
            res.send("ERROR");
        } else {
            // our client expects *all* of the todo items to be returned, so we'll do
            // an additional request to maintain compatibility
            ToDo.find({}, function(err, result) {
                if (err !== null) {
                    // the element did not get saved!
                    res.send("ERROR");
                }
                res.json(result);
            });
        }
    });
});
