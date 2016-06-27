var express   = require('express');
var app       = express();
var socketio  = require('socket.io');
var path      = require('path')
var os        = require('os');
var njds      = require('./custom_modules/nodejs-disks');
var spawn     = require('child_process').spawn;
var exec      = require('child_process').exec;
var async     = require("async");


app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(3000, function(){
    console.log('listening on *:3000');
});
var io        = require('socket.io').listen(server);

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

io.sockets.on('connection', function (socket) {
    socket.on('command', function(msg){
        console.log('message: ' + msg);
    });

    buildFinalObject(function(data) {
        socket.emit('finalstatus', data);
    });
    var interval = setInterval(function(){
        buildTempObject(function(data) {
            socket.emit('tmpstatus', data);
        });

    }, 1000);

    socket.on('disconnect', function(){
        console.log('user disconnected');
        clearInterval(interval);
    });
});


function buildFinalObject(cb) {
  console.log(os.uptime());
    var cStatus = {
        upTime: os.uptime(),
        localTime: new Date(),
        totalMem: os.totalmem(),
        cpuCount: os.cpus().length
    }

    cb(cStatus);
}

function buildTempObject(cb) {

    async.series({
        disks: function(callback){
            getDisks(function(data) {
                callback(null, data);
            });
        },
        freeMem: function(callback){
            getMemoryUsage(function(data) {
                callback(null, data);
            });
        },
        cores: function(callback) {
            callback(null, os.cpus());
        }
    },
    function(err, results) {
        cb(results)
    });


}

//https://www.npmjs.com/package/nodejs-disks
function getDisks(cb) {
    njds.drives(
        function (err, drives) {
            njds.drivesDetail(
                drives,
                function (err, data) {
                    cb(data)
                }
            );
        }
    )

}

function getMemoryUsage(callback) {

  switch (os.platform().toLowerCase()) {
      case'darwin':
          break;
      case'win32':
          var cmd = "wmic OS get FreePhysicalMemory /Value";
          var child = exec(
              cmd,
              function (err, stdout, stderr) {
                  var freeRam = stdout.split("=");
                  callback(freeRam[1] / 1024);
              }
          );
          break;
      case'linux':

        var prc = spawn('free',  ['-m']);

        prc.stdout.setEncoding('utf8');
        prc.stdout.on('data', function (data) {
            var str = data.toString()
            var lines = str.split(/\n/g);
            for(var i = 0; i < lines.length; i++) {
                lines[i] = lines[i].split(/\s+/);
            }
            callback(lines[2][3]);
        });
      default:

  }




}
