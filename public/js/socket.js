var Monitor = React.createClass({
    getInitialState: function() {
        return {uptime: 0, totalMem: 0, freeMem: 0, cpus: null, drives: null, localTime: null};
    },
    componentWillMount: function() {
        var socket = io.connect()
        socket.on('finalstatus', this._finalStatusReceived);
        socket.on('tmpstatus', this._tempStatusReceived);
    },

    _finalStatusReceived: function(message) {
        this.setState({uptime: message.upTime, totalMem: message.totalMem, localTime: message.localTime})
    },
    _tempStatusReceived: function(message) {
        this.setState({freeMem: message.freeMem, cpus: message.cores, drives: message.disks})
    },
    render: function() {
        var cpu, ram, date, drives;
        if(this.state.cpus != null)
        {
            cpu = <Cpu cores={this.state.cpus}/>;
            ram = <Ram totalMem={this.state.totalMem} freeMem={this.state.freeMem}/>
            date = <TimeDate uptime={this.state.uptime} localTime={this.state.localTime}/>;
            drives = <Drives drives={this.state.drives}/>

        }
        return (
            <div>
                <div className="row">
                    <div className="five columns">
                        <div className="box">
                            {drives}
                        </div>
                    </div>

                    <div className="four columns">
                        <div className="box">
                            {date}
                        </div>
                    </div>
                    <div className="three columns">
                        <div className="box">
                            <div id="ram">
                                {ram}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="five columns">
                        <div className="box">
                            <div id="cpuNode">
                                {cpu}
                            </div>
                        </div>
                    </div>
                    <div className="three columns">
                        <div className="box">

                        </div>
                    </div>
                    <div className="four columns">
                        <div className="box">

                        </div>
                    </div>

                </div>
            </div>
        );
    }
});


var TimeDate = React.createClass({
    getInitialState: function() {
        return {uptime: 0, localTime: new Date()};
    },
    componentDidMount: function() {
        this.setState({uptime: this.props.uptime, localTime: new Date(this.props.localTime)});

        setInterval(() => {
            this.tick();
        }, 1000);
    },
    tick: function() {
        var local = new Date(this.state.localTime);
        local.setSeconds(local.getSeconds() + 1);
        this.setState({
            uptime: this.state.uptime + 1,
            localTime: local
        });
    },
    render: function() {
        var d = new Date(this.state.uptime * 1000);
        console.log(new Date(Date.UTC(this.props.localTime)));

        return (
            <div id="DateBox">
                <div className="title">Uptime</div>
                <div className="time">{d.getDay() + " days"}</div>
                <div className="time">{d.toISOString().substr(11, 8)}</div>
                <div className="title">Local Time</div>
                <div className="time">{new Date(this.state.localTime).toString().substr(16, 8)}</div>
            </div>
        );
    }
});

var Ram = React.createClass({
    getInitialState: function() {
        return {gauge: null};
    },
    componentDidMount: function() {
        var g = new JustGage({
            id: "ram",
            value: 0,
            min: 0,
            max: 100,
            title: "RAM",
            gaugeWidthScale: 0.2,
            relativeGaugeSize: true,
            valueFontColor: "#A9A9A9",
            symbol: "MB"
        });
        this.setState({gauge: g});
    },
    componentWillReceiveProps: function(nextProps) {
        this.state.gauge.refresh(0, Math.floor(nextProps.totalMem / 1024 / 1024));
        this.state.gauge.refresh(Math.floor((nextProps.totalMem - nextProps.freeMem) / 1024 / 1024));
    },
    render: function() {

        return (null);
    }
});

var Cpu = React.createClass({
    getInitialState: function() {
        return {gauges: [], cores: []};
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({cores: nextProps.cores});
        for (var i = 0; i < nextProps.cores.length; i++) {
            this.state.gauges[i].refresh(nextProps.cores[i] * 100);
        }
    },
    componentDidMount: function() {
        var arr = [];
        for(var i = 0; i < this.props.cores.length; i++) {
            var g = new JustGage({
                parentNode: document.getElementById("cpuNode"),
                value: 0,
                min: 0,
                max: 100,
                title: "CPU " + (i + 1),
                gaugeWidthScale: 0.2,
                valueFontColor: "#A9A9A9",
                relativeGaugeSize: true,
                decimals: 2,
                symbol: "%"
            });

            arr[i] = g;
        }
        this.setState({gauges: arr});


    },
    render: function() {
        return (
            null
        );
    }
})

var Drives = React.createClass({
    MBTOGB: function(mb) {
        return (mb / (1024*1024*1024)).toFixed(2);
    },
    render: function() {
        return (
            <div>
            {
                this.props.drives.map((drive, i) => {
                    return (
                        <div key={i}>
                            <span className="left">{this.props.drives[i].drive}</span>
                            <span className="right">{this.MBTOGB(this.props.drives[i].available) + "GB free out of " + this.MBTOGB(this.props.drives[i].total) + " GB"}</span>
                            <meter max="100" value={this.props.drives[i].usedPer}></meter>
                        </div>
                    );
                })
            }
            </div>
        );
    }
});

ReactDOM.render(<Monitor/>, document.getElementById("app"));
