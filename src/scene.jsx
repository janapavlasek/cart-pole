import React from "react";
import { Slider, Typography, Grid } from '@mui/material';
import Plot from 'react-plotly.js';

import {PIDController} from './control';

/*******************
 *   WHOLE PAGE
 *******************/

const DEFAULTS = {
  KP: 20,
  KI: 1,
  KD: 15,
}


function GainSlider(props) {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={2}>
        <Typography>
          {props.label}
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <Slider
          value={props.value}
          onChange={props.onChange}
          aria-labelledby={props.label + "-slider"}
          min={0}
          max={props.max}
          step={0.01}
          valueLabelDisplay="auto"
        />
      </Grid>
    </Grid>
  );
}

class SceneView extends React.Component {
  constructor(props) {
    super(props);

    // React state.
    this.state = {
      done: false,
      kp: DEFAULTS.KP,        // Proportional gain
      ki: DEFAULTS.KI,        // Integral gain
      kd: DEFAULTS.KD,        // Derivative gain
      timeHistory: [],
      xHistory: [],
      thetaHistory: [],
      plotWidth: 600,
    };

    this.cartpole = props.cartpole;
    this.dt = this.cartpole.dt;
    this.pid = new PIDController(this.state.kp, this.state.ki, this.state.kd, this.dt);

    this.pid.setSetpoint(0);
    this.interval = null;
    this.plotContainerRef = React.createRef(); // Create a ref for the plot container
  }

  componentDidMount() {
    this.startInterval();

    this.handleResize();

    // Add resize event listener
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    if (this.interval !== null) clearInterval(this.interval);

    // Remove resize event listener
    window.removeEventListener('resize', this.handleResize);
  }

  startInterval() {
    if (this.interval !== null) clearInterval(this.interval);
    this.interval = setInterval(() => { this.step(); }, 50); // Update every 50ms
    this.setState({done: false});
  }

  handleResize = () => {
    // Update the state with the new width
    if (this.plotContainerRef.current) {
      this.setState({
        plotWidth: this.plotContainerRef.current.offsetWidth
      });
    }
  }

  resetCart() {
    this.cartpole.setRandomState();
    this.pid.reset();

    // Update histories for plotting
    this.setState(prevState => ({
      timeHistory: [],
      xHistory: [],
      thetaHistory: [],
    }));

    if (this.state.done) this.startInterval();
  }

  updateGains(kp, ki, kd) {
    this.pid.reset(kp, ki, kd);
    this.setState({kp: kp, ki: ki, kd: kd});
  }

  step() {
    let state = this.cartpole.getState();

    const controlSignal = this.pid.update(state[2]);

    const done = this.cartpole.update(controlSignal);
    if (done) {
      console.log("FAIL!");
      clearInterval(this.interval);
      this.setState({done: true});
    }
    else {
      // Update histories for plotting
      this.setState(prevState => ({
        timeHistory: [...prevState.timeHistory, prevState.timeHistory.length * this.dt],
        xHistory: [...prevState.xHistory, state[0]],
        thetaHistory: [...prevState.thetaHistory, state[2]],
      }));
    }
  }

  bump() {
    const mag = 2;
    if (Math.random() < 0.5) this.cartpole.update(mag);
    else this.cartpole.update(-mag);
  }

  /*****************************
   *  COMPONENT EVENT HANDLERS
   *****************************/

  render() {

    const { timeHistory, xHistory, thetaHistory, plotWidth } = this.state;
    // console.log(this.refContainer.current.offsetWidth)

    // Data for the Plot
    const data = [
      {
        x: timeHistory,
        y: xHistory,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'X Position',
        marker: { color: '#156EB2' },
      },
      {
        x: timeHistory,
        y: thetaHistory,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Theta Angle',
        marker: { color: '#B2156E' },
      }
    ];

    const layout = {
      width: plotWidth,
      height: 250,
      xaxis: {
        title: 'Time (seconds)',
      },
      yaxis: {
        title: 'Value',
      },
      margin: {
        l: 50,
        r: 50,
        b: 50,
        t: 50,
        pad: 4
      }
    };

    return (
      <div>
        <div className="row">
          <button className="button" onClick={(e) => this.resetCart(e)}>
            Reset Cart
          </button>
          <button className="button" onClick={(e) => this.updateGains(DEFAULTS.KP, DEFAULTS.KI, DEFAULTS.KD)}>
            Reset Gains
          </button>
          <button className="button" onClick={(e) => this.bump()}>
            Bump
          </button>
        </div>
        <div className="centered">
          <div className="slider-wrapper">
            <GainSlider label={"Kp"} value={this.state.kp} max={50}
                        onChange={(_, v) => this.updateGains(v, this.state.ki, this.state.kd)} />

            <GainSlider label={"Ki"} value={this.state.ki} max={50}
                        onChange={(_, v) => this.updateGains(this.state.kp, v, this.state.kd)} />

            <GainSlider label={"Kd"} value={this.state.kd} max={50}
                        onChange={(_, v) => this.updateGains(this.state.kp, this.state.ki, v)} />
          </div>
        </div>

        <div className="centered" ref={this.plotContainerRef}>
          <Plot
            data={data}
            layout={layout}
          />
        </div>
      </div>
    );
  }
}

export default SceneView;
