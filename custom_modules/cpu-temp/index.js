
var exec = require('child_process').exec;
var os        = require('os');


function getCpuTemp(callback) {

    switch (os.type()) {
        case 'Windows_NT':
            exec('custom_modules/cpu-temp/WindowsCPU.exe', function(err, data) {
                 callback(JSON.parse(data));
             });
            break;
        case 'Linux':
            exec("custom_modules/cpu-temp/sensors | grep -iE 'core.*°' | awk '{print int($3)}'", function(error, stdout, stderr) {
              console.log(stdout);
                var cpus = stdout.split("\n");
                var arr = [];
                for (var i = 0; i < cpus.length - 1; i++) {
                  if(cpus[i] != "\n")
                    arr[i] = cpus[i];
                }
                callback(JSON.stringify(arr));
            });

            break;
        default:
            callback(null);

    }

}
module.exports = {getCpuTemp: getCpuTemp}
