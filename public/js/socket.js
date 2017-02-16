var Monitor = React.createClass({
    getInitialState: function() {
        return {uptime: 0, totalMem: 0, freeMem: 0, cpus: null, drives: null, localTime: null, loaded: false};
    },
    componentWillMount: function() {
        var socket = io.connect()
        socket.on('finalstatus', this._finalStatusReceived);
        socket.on('tmpstatus', this._tempStatusReceived);
    },
    componentDidMount: function() {

    },
    _finalStatusReceived: function(message) {
        this.setState({uptime: message.upTime, totalMem: message.totalMem, localTime: message.localTime})
    },
    connectionEstablished: function() {
        this.setState({loaded: true})
    },
    _tempStatusReceived: function(message) {
    	console.log(message);
        if(!this.state.loaded) {
            this.connectionEstablished();
        }
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

        if(this.state.loaded)
        {


            return (


                <div>
                    <div className="row m-t-2">
                        <div className="col-lg-4">
                            <div className="row">
                                <div className="col-lg-12 col-sm-6">
                                    <div className="panel panel-default bg-gray-dark b-a-0">
                                        <div className="panel-heading"> System Monitoring </div>

                                            <ul className="list-group">
                                                <li className="list-group-item no-bg">
                                                    <h5>CPU</h5>
                                                    {cpu}

                                                </li>
                                            </ul>

                                            <ul className="list-group">
                                                <li className="list-group-item no-bg">
                                                    <h5>Memory</h5>
                                                    <p>GSkill 2 x 8 GB DDR3 @1333 Mhz <i className="fa fa-fw fa-info-circle"></i></p>
                                                    {ram}
                                                </li>
                                            </ul>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="box">
                                <div className="title">System</div>
                                {drives}
                            </div>
                        </div>

                    </div>
                </div>
            );

        }
        else {

            return (<div><Cover /></div>)
        }
    }
});


var Cover = React.createClass({
    getInitialState: function() {
        return {};
    },
    render: function() {
        return(
            <div className="cssload-container">
                <div className="cssload-loading"><i></i><i></i><i></i><i></i></div>
            </div>

        )
    }
})

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
        return {};
    },
    componentDidMount: function() {

    },
    render: function() {

        return (

            <div className="media">
                <div className="media-left">
                    <p className="data-attributes media-object">
                        <span data-peity="{ &quot;fill&quot;: [&quot;#08A5E1&quot;, &quot;#2A88C5&quot;, &quot;#0058A1&quot;],  &quot;innerRadius&quot;: 18, &quot;radius&quot;: 28 }" ></span><svg className="peity" height="56" width="56"><path d="M 28 0 A 28 28 0 0 1 52.24871130596428 14 L 43.588457268119896 19 A 18 18 0 0 0 28 10" fill="#08A5E1"></path><path d="M 52.24871130596428 14 A 28 28 0 0 1 28 56 L 28 46 A 18 18 0 0 0 43.588457268119896 19" fill="#2A88C5"></path><path d="M 28 56 A 28 28 0 0 1 27.999999999999996 0 L 27.999999999999996 10 A 18 18 0 0 0 28 46" fill="#0058A1"></path></svg>
                    </p>
                </div>
                <div className="media-body media-top">
                    <h2 className="media-heading f-w-300 m-b-0 m-t-0">{(this.props.totalMem /1024 / 1024 /1024).toFixed(1)} <small className="text-white">GB</small></h2> Total Memory
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <small><i className="fa fa-fw fa-circle text-cerulean"></i> Allocated</small>
                        <h5 className="m-b-0">5079 MB</h5>
                        <p>31%</p>
                    </div>
                    <div className="col-sm-4">
                        <small><i className="fa fa-fw fa-circle text-curious-blue"></i> In Cache</small>
                        <h5 className="m-b-0">3789 MB</h5>
                        <p>24%</p>
                    </div>
                    <div className="col-sm-4">
                        <small><i className="fa fa-fw fa-circle text-endaveour"></i> Available</small>
                        <h5 className="m-b-0">3591 MB</h5>
                        <p>46%</p>
                    </div>
                </div>
            </div>

        );
    }
});

var Cpu = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentDidMount: function() {



    },
    render: function() {
        return (
            <div>
            {
                this.props.cores.map((cpu, i) => {

                    return (
                        <div className="row" key={i}>
                            <div className="col-sm-6">Core {i + 1} @ <span className="text-white"> {(this.props.cores[i] * 100).toFixed(1)}%</span></div>
                            <div className="col-sm-6">
                                <div className="progress m-t-1  b-r-a-0 h-3">
                                    <div className="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: parseFloat((this.props.cores[i] * 100).toFixed(1))}}>
                                        <span className="sr-only">60% Complete</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )
                })

            }
            </div>

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
