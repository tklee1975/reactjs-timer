//
//  A simple timer app using ReactJS
//
//  Author:   kencoder
//  Twitter:  https://twitter.com/kenlakoo
//  Facebook: https://www.facebook.com/kencoder.hk.9
//

//
// Constant
//
const TIMER_STATE_NOT_START = 0;
const TIMER_STATE_RUNNING = 1;

const MILLIS_IN_SECOND = 1000;
const MILLIS_IN_MINUTE = MILLIS_IN_SECOND * 60;
const MILLIS_IN_HOUR = MILLIS_IN_MINUTE * 60;


//
//  Common Utility
//
function padRightZero(input) {
  var len = ("" + input).length;

  // console.log("input=" + input + " len=" + len);
  if(len == 1) {
    return "0" + input
  } else {
    return "" + input;
  }
}

function modifyValue(input, max) {
  var finalValue;

  if(input < 0) {
      finalValue = 0;
  } else if(input >= max) {
      finalValue = max;
  } else {
      finalValue = input
  }
  return finalValue;
}

function formatTimeMillis(timeMillis) {
  var remain = timeMillis;
  var hh = Math.floor(remain / MILLIS_IN_HOUR);
  remain -= hh * MILLIS_IN_HOUR;
  var hour = padRightZero(hh);

  var mm = Math.floor(remain / MILLIS_IN_MINUTE);
  remain -= mm * MILLIS_IN_MINUTE;
  var min = padRightZero(mm);

  var ss = Math.floor(remain / MILLIS_IN_SECOND);
  var sec = padRightZero(ss);

  return hour + ":" + min + ":" + sec;
}

///
/// Timer Display
///
var TimerDisplay = React.createClass({
  getInitialState: function() {
    return {
      timerState: TIMER_STATE_NOT_START,
      displayTime: this.props.displayTime                 // in time millis
    };
  },

  testMe: function() {
    console.log("TimerDisplay:testMe!!");
  },


  setDisplayTime: function(newTime) {
    this.setState(
       { displayTime: newTime }
    );
  },

  render: function() {
    console.log("TimerDisplay: render is called");
    var displayStr = formatTimeMillis(this.state.displayTime);

    var textColor = this.state.timerState == TIMER_STATE_RUNNING ? "#00f" : "#aaa";

    var style = {
      color: textColor,
    }

    return <div className="TimerDisplay" style={style}>
    {displayStr}
    </div>
  }
});


/// Timer Input
var TimerInput = React.createClass({
  getInitialState: function() {
    return {
      hour: 0,			//
      minute: 5,
      second: 0,
      timerState: TIMER_STATE_NOT_START,
    };
  },

  getTimerDuration: function() {
    var partHour = parseInt(this.refs.hour.value);
    var partMinute = parseInt(this.refs.min.value);
    var partSecond = parseInt(this.refs.sec.value);

    // console.log("InputBox: onStartClicked. h=" + partHour + " m=" + partMinute
    //                + " s=" + partSecond);

    var totalMillis = partSecond * MILLIS_IN_SECOND
                      + partMinute * MILLIS_IN_MINUTE
                      + partHour * MILLIS_IN_HOUR;

    return totalMillis;
  },



  onHourChanged: function() {
    console.log("onHourChanged!");
    this.refs.hour.value = modifyValue(this.refs.hour.value, 24);
    this.props.onChanged(this.getTimerDuration());
  },

  onMinuteChanged: function() {
    console.log("onMinuteChanged!");
    this.refs.min.value = modifyValue(this.refs.min.value, 59);
    this.props.onChanged(this.getTimerDuration());
  },

  onSecondChanged: function() {
    console.log("onSecondChanged!");
    this.refs.sec.value = modifyValue(this.refs.sec.value, 59);
    this.props.onChanged(this.getTimerDuration());
  },

  render: function() {
    var disableFlag = this.state.timerState == TIMER_STATE_RUNNING;

    var style = {
      "display" : disableFlag ? "none" : "block"
    };

    return (
      <div className="TimerInput" style={style}>
        <input type="tel" autoComplete="off" ref="hour"
            defaultValue={this.state.hour} disabled={disableFlag} placeholder="h"
            onChange={this.onHourChanged} />

        <input type="tel" autoComplete="off" ref="min"
            defaultValue={this.state.minute} disabled={disableFlag} placeholder="m"
            onChange={this.onMinuteChanged} />

        <input type="tel" autoComplete="off" ref="sec"
            defaultValue={this.state.second} disabled={disableFlag} placeholder="s"
            onChange={this.onSecondChanged} />
      </div>
    );
  }
});


/// Timer Button

var TimerButton = React.createClass({
  getInitialState: function() {
    return {
      timerState: TIMER_STATE_NOT_START,
    };
  },

  buttonClicked: function() {
    console.log("buttonClicked!");

    if(this.state.timerState == TIMER_STATE_RUNNING) {
      // button = STOP
      this.props.onStop();
    } else {
      // button = START
      this.props.onStart();
    }
  },

  render: function() {
    console.log("TimerButton: render is called");
    var buttonName = this.state.timerState == TIMER_STATE_RUNNING ? "STOP" : "START";

    var style = {
      "margin-left" : "auto",
      "margin-right" : "auto",
    };

    return (<center>
      <button className="TimerButton" onClick={this.buttonClicked}>{buttonName}</button>
      </center>);
  }
});


//
//  The Main Timer Component
//

var TimerComponent = React.createClass({
  getInitialState: function() {
    return {
      timerState: TIMER_STATE_NOT_START,
      timerDuration: 5 * MILLIS_IN_MINUTE,
      remainTime: 0,
      isFirstTick: true,    //  Mark where it is the first tick or not
    };
  },

  changeState: function(newState) {
    if(this.state.timerState == newState) {
      return;
    }

    var newState = {  timerState: newState };
    this.setState(newState);

    this.refs.timerDisplay.setState(newState);
    this.refs.timerButton.setState(newState);
    this.refs.timerInput.setState(newState);
  },

  componentDidMount: function() {
    // initialization
    var defaultTime = this.refs.timerInput.getTimerDuration();

    this.refs.timerDisplay.setDisplayTime(defaultTime);

    this.changeState(TIMER_STATE_NOT_START);

    // Start timer
    setInterval(this.tick, MILLIS_IN_SECOND);
    console.log("componentDidMount: ended");
  },

  isRunning: function() {
    return this.state.timerState == TIMER_STATE_RUNNING;
  },

  endTimer: function() {
    this.changeState(TIMER_STATE_NOT_START);
  },

  tick: function() {
		// console.log("tick is called");
		if(this.isRunning() == false) {
      return;
    }



    var displayTime;

    console.log("isFirstTick: " + this.state.isFirstTick);

    if(this.state.isFirstTick) {
      // Display time is the timerDuration
      displayTime = this.state.timerDuration;

      this.setState({ isFirstTick: false});

    } else {
      // Display time is the last remain
      var newRemain = this.state.remainTime - MILLIS_IN_SECOND;
      if(newRemain < 0) {
        newRemain = 0;
      }

      if(newRemain == 0) {
        this.endTimer();
      }

      this.setState({remainTime: newRemain});
      displayTime = newRemain;
    }

    this.refs.timerDisplay.setDisplayTime(displayTime);

	},

  handleTimerStart: function() {
    console.log("start the timer!");


    this.setState({
      remainTime: this.state.timerDuration,
      isFirstTick: true
    });

    this.refs.timerDisplay.setDisplayTime(this.state.timerDuration);

    this.changeState(TIMER_STATE_RUNNING);
  },

  handleTimerStop : function() {
    console.log("stop the timer!");
    this.changeState(TIMER_STATE_NOT_START);
  },

  handleDurationChange: function(newValue) {
    console.log("newDuration=" + newValue);
    this.setState({timerDuration: newValue});
    this.refs.timerDisplay.setDisplayTime(newValue);
  },

  render: function() {
    var display = <TimerDisplay ref="timerDisplay" displayTime="1233" />;
    var button = <TimerButton ref="timerButton"
                          onStart={this.handleTimerStart}
                          onStop={this.handleTimerStop} />;
    var input = <TimerInput ref="timerInput" onChanged={this.handleDurationChange}/>;

    console.log("render: refs=" + this.refs.timerDisplay);

    return <div className="TimerComponent">
    {display}
    {input}
    {button}


    </div>
  }
});



// -------------------------
//
// Rendering
//
// -------------------------
// ReactDOM.render(<TimerTest/>, document.getElementById('TimerTest'));
ReactDOM.render(<TimerComponent/>, document.getElementById('TimerComponent'));
