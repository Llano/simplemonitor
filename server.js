var express   = require('express');
var app       = express();
var socketio  = require('socket.io');
var path      = require('path')
var os        = require('os');
var njds      = require('./custom_modules/nodejs-disks');
var spawn     = require('child_process').spawn, child;
var async     = require("async");

getTemp();

app.use(express.static(path.join(__dirname, 'public')));

var port = 3000;
var server = app.listen(port, function(){
    console.log('listening on *:'+port);
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
    var cStatus = {
        name: os.hostname(),
        upTime: os.uptime(),
        localTime: new Date(),
        totalMem: os.totalmem(),
        cpuCount: os.cpus().length
    }

    cb(cStatus);
}

var cpus = os.cpus();
function buildTempObject(cb) {

    async.series({
        disks: function(callback){
            getDisks(function(data) {
                callback(null, data);
            });
        },
        freeMem: function(callback){
            callback(null, os.freemem());
        },
        cores: function(call) {
            var data = [];
            async.forEachOf(os.cpus(), function(item, index, callback) {
                calculateCpuUsage(item, cpus[index], function(perc) {
                    data.push(perc);
                    callback();
                });
            },
            function(err) {
                cpus = os.cpus();
                call(null, data);
            });
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

function calculateCpuUsage(cpu, cpuold, callback) {
    var user = cpu.times.user;;
    var nice = cpu.times.nice;
    var sys = cpu.times.sys;
    var idle = cpu.times.idle;
    var irq = cpu.times.irq;

    var total = user + nice + sys + idle + irq;

    //old

    var user2 = cpuold.times.user;;
    var nice2 = cpuold.times.nice;
    var sys2 = cpuold.times.sys;
    var idle2 = cpuold.times.idle;
    var irq2 = cpuold.times.irq;

    var total2 = user2 + nice2 + sys2 + idle2 + irq2;

    var idle3 	= idle2 - idle;
    var total3 	= total2 - total;
    var perc	= 1 - (idle3 / total3);

    callback(perc);

}
function getTemp() {
    console.log("heh");
    child = spawn("powershell.exe",["-Command", "Start-Process powershell -Verb runAs", "-File", "C:\\Users\\llano\\Documents\\temp.ps1"]);
    child.stdout.on("data",function(data){
        console.log("Powershell Data: " + data);
    });

    child.stderr.on("data",function(data){
    console.log("Powershell Errors: " + data);
    });
    child.on("exit",function(){
        console.log("Powershell Script finished");
    });
    child.stdin.end();
}
