import React from "react";
import { Slider, Typography, Grid } from '@mui/material';

import {PIDController} from './control';

/*******************
 *   WHOLE PAGE
 *******************/

const DEFAULTS = {
  KP: 20,
  KI: 0,
  KD: 10,
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
      kp: 20,       // Proportional gain
      ki: 0,        // Integral gain
      kd: 10,       // Derivative gain
    };

    this.cartpole = props.cartpole;
    this.pid = new PIDController(this.state.kp, this.state.ki, this.state.kd);
    // this.lqr = new CartPoleLQRController();

    this.pid.setSetpoint(0);
    this.interval = null;
  }

  componentDidMount() {
    this.startInterval();
  }

  startInterval() {
    if (this.interval !== null) clearInterval(this.interval);
    this.interval = setInterval(() => { this.step(); }, 100); // Update every 100ms
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
        </div>
        <div className="centered">
        <div className="slider-wrapper">
          <GainSlider label={"Kp"} value={this.state.kp} max={50}
                      onChange={(_, v) => this.updateGains(v, this.state.ki, this.state.kd)} />

          <GainSlider label={"Ki"} value={this.state.ki} max={10}
                      onChange={(_, v) => this.updateGains(this.state.kp, v, this.state.kd)} />

          <GainSlider label={"Kd"} value={this.state.kd} max={20}
                      onChange={(_, v) => this.updateGains(this.state.kp, this.state.ki, v)} />
        </div></div>
      </div>
    );
  }
}

export default SceneView;
