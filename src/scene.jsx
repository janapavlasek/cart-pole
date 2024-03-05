import React from "react";
import { Slider, Typography, Grid } from '@mui/material';

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
    };

    this.cartpole = props.cartpole;
    this.dt = this.cartpole.dt;
    this.pid = new PIDController(this.state.kp, this.state.ki, this.state.kd, this.dt);

    this.pid.setSetpoint(0);
    this.interval = null;
  }

  componentDidMount() {
    this.startInterval();
  }

  startInterval() {
    if (this.interval !== null) clearInterval(this.interval);
    console.log("freq", Math.floor(this.dt * 1000))
    this.interval = setInterval(() => { this.step(); }, 50); // Update every 50ms
    this.setState({done: false});
  }

  resetCart() {
    this.cartpole.setRandomState();
    this.pid.reset();

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
        </div></div>
      </div>
    );
  }
}

export default SceneView;
