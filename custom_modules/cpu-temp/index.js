
var exec = require('child_process').execFile;
var os        = require('os');


function getCpuTemp(callback) {

    switch (os.type()) {
        case 'Windows_NT':
            exec('custom_modules/cpu-temp/WindowsCPU.exe', function(err, data) {
                 callback(JSON.parse(data));
             });
            break;
        default:
            callback(null);

    }

}
module.exports = {getCpuTemp: getCpuTemp}
