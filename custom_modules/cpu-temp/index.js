
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
            exec("custom_modules/cpu-temp/sensors -u", function(error, stdout, stderr) {
                var cpus = stdout.split("\n\n");
                var arr = [];
                for (var i = 0; i < cpus.length - 1; i++) {
			var rows = cpus[i].split("\n");
			var obj = {};
			var count = 0;
			obj.name = rows[0]
			obj.temp = [];
			for(var j=1; j<rows.length; j++){
				if(rows[j].includes("_input")){
					obj.temp[count++] = rows[j].split(": ")[1];
				}
			}
			if(obj.temp.length > 0)
				arr[i] = obj;
                }
                callback(JSON.stringify(arr));
            });

            break;
        default:
            callback(null);

    }

}
module.exports = {getCpuTemp: getCpuTemp}
