var socket = io();
var uptimeElement = document.getElementById("uptime");
var maxRam = 0;
var cpuGuages = [];
var cpus = [];
var disks = [];
var meterElements = [];


var ramGauge = new JustGage({
    id: "ram",
    value: 0,
    min: 0,
    max: 100,
    title: "RAM usage",
    gaugeWidthScale: 0.2,
    valueFontColor: "#A9A9A9",
    relativeGaugeSize: true,
    symbol: " Mb"
});


socket.on('finalstatus', function(msg){
    startTick(msg);
    setMaxRamValue(Math.floor(msg.totalMem / 1024 / 1024));
    var cpusElement = document.getElementById('cpus');
    for(i = 0; i < msg.cpuCount; i++) {
        var element = document.createElement('div');
        element.setAttribute("id", "cpu" + i);
        cpusElement.appendChild(element);
        cpuGuages.push(
            new JustGage({
                id: "cpu" + i,
                value: 0,
                min: 0,
                max: 100,
                title: "Cpu #" + (i + 1),
                gaugeWidthScale: 0.2,
                valueFontColor: "#A9A9A9",
                relativeGaugeSize: true,
                decimals: 2,
                symbol: "%"
            })

        );
    }




});

socket.on('tmpstatus', function(msg){
    handleTempData(msg);
});


function handleTempData(msg) {
    setRamValue(maxRam - Math.floor(msg.freeMem));
    if(cpus.length > 0) {
        for(i = 0; i < msg.cores.length; i++) {
            cpuGuages[i].refresh((calculateCpuUsage(msg.cores[i], cpus[i]) * 100).toFixed(2));
        }
    }
    for(j = 0; j < msg.disks.length; j++) {
        if(!diskExist(msg.disks[j], disks)) {
            disks.push(msg.disks[j]);
            var element = $('<span>' + msg.disks[j].drive + ' (' + msg.disks[j].mountpoint + ')' + '</span><meter id="disk' + j + '" max="100"></meter>');
            $('#harddrives').append(element);
            meterElements.push(element);

        }
        else {
            //meterElements[i].val(msg.disks[i].usedPer);
            meterElements[j].animate({value: msg.disks[j].usedPer}, 'slow');
        }


    }
    for(k = 0; k < disks.length; k++) {
      if(!diskExist(disks[k], msg.disks)) {
          meterElements[k].remove();
          meterElements.splice(k, 1);
          disks.splice(k, 1);

      }
    }


    cpus = msg.cores;
}




function startTick(msg) {
    var uptime = new Date(msg.upTime * 1000);
    var numdays = Math.floor((uptime / 86400) / 1000);
    var localtime = new Date(msg.localTime);
    setInterval(function() {
        $('#uptime').html(numdays + " days <br>" + uptime.getHours() + " hours <br>"
        + uptime.getMinutes() + " minutes <br>" + uptime.getSeconds() + " seconds");
        $('#localtime').html(localtime);
        uptime.setSeconds(uptime.getSeconds() + 1);
        localtime.setSeconds(localtime.getSeconds() + 1);

    }, 1000)

}

function setRamValue(value) {
    ramGauge.refresh(value);

}

function setMaxRamValue(max) {
    ramGauge.refresh(0, max);
    maxRam = max;

}

function calculateCpuUsage(cpu, cpuold) {
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

    return perc;

}

//Checks if disk exist in array
function diskExist(drive, array) {
    var found = false;
    for(i = 0; i < array.length; i++) {
        if(drive.drive === array[i].drive) {
            found = true;
        }
    }

    return found;
}
