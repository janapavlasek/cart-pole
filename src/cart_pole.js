/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/**
 * Implementation based on: http://incompleteideas.net/book/code/pole.c
 * Taken from: https://github.com/tensorflow/tfjs-examples
 */

/**
 * Cart-pole system simulator.
 *
 * In the control-theory sense, there are four state variables in this system:
 *
 *   - x: The 1D location of the cart.
 *   - xDot: The velocity of the cart.
 *   - theta: The angle of the pole (in radians). A value of 0 corresponds to
 *     a vertical position.
 *   - thetaDot: The angular velocity of the pole.
 *
 * The system is controlled through a single action:
 *
 *   - leftward or rightward force.
 */
class CartPole {
  /**
   * Constructor of CartPole.
   */
  constructor(dt = 0.02) {
    // Constants that characterize the system.
    this.gravity = 9.8;
    this.massCart = 0.5;  //1.0;
    this.massPole = 0.2;  // 0.1;
    this.totalMass = this.massCart + this.massPole;
    this.cartWidth = 0.2;
    this.cartHeight = 0.1;
    this.length = 0.3;  // 0.5;
    this.poleMoment = 0.006;  // this.massPole * this.length;
    this.friction = 0.1;  // Friction
    this.forceMag = 10.0;
    this.dt = dt;

    // Threshold values, beyond which a simulation will be marked as failed.
    this.xThreshold = 2.4;
    this.thetaThreshold = 12 / 360 * 2 * Math.PI;

    this.setRandomState();
  }

  /**
   * Set the state of the cart-pole system randomly.
   */
  setRandomState() {
    // The control-theory state variables of the cart-pole system.
    // Cart position, meters.
    this.x = Math.random() - 0.5;
    // Cart velocity.
    this.xDot = (Math.random() - 0.5) * 1;
    // Pole angle, radians.
    this.theta = (Math.random() - 0.5) * 2 * (6 / 360 * 2 * Math.PI);
    // Pole angle velocity.
    this.thetaDot =  (Math.random() - 0.5) * 0.5;
  }

  /**
   * Get current state as a tf.Tensor of shape [1, 4].
   */
  getState() {
    return [this.x, this.xDot, this.theta, this.thetaDot];
  }

  derivatives(x, theta, dx, dtheta, action) {
    const denom = this.poleMoment * (this.totalMass) + this.massPole * this.massCart * this.length**2;

    //Parkers code
    const xAcc = - (this.poleMoment + this.massPole * this.length**2) * this.friction * dx / denom +
                 theta * this.gravity * this.massPole**2 * this.length**2 / denom +
                 action * (this.poleMoment + this.massPole * this.length**2) / denom;
    const thetaAcc = this.massPole * this.length * this.friction * dx / denom +
                     theta * this.gravity * this.massPole * this.length * this.totalMass / denom +
                     action * this.massPole * this.length / denom;

    return {
      xDot: dx,
      thetaDot: dtheta,
      xDotDot: xAcc,
      thetaDotDot: thetaAcc
    };
  }

  integrateRK(action) {
    const k1 = this.derivatives(this.x, this.theta, this.xDot, this.thetaDot, action);
    const k2 = this.derivatives(this.x + k1.xDot * this.dt / 2, this.theta + k1.thetaDot * this.dt / 2,
                                this.xDot + k1.xDotDot * this.dt / 2, this.thetaDot + k1.thetaDotDot * this.dt / 2,
                                action);
    const k3 = this.derivatives(this.x + k2.xDot * this.dt / 2, this.theta + k2.thetaDot * this.dt / 2,
                                this.xDot + k2.xDotDot * this.dt / 2, this.thetaDot + k2.thetaDotDot * this.dt / 2,
                                action);
    const k4 = this.derivatives(this.x + k3.xDot * this.dt, this.theta + k3.thetaDot * this.dt,
                                this.xDot + k3.xDotDot * this.dt, this.thetaDot + k3.thetaDotDot * this.dt, action);

    this.x += (k1.xDot + 2 * k2.xDot + 2 * k3.xDot + k4.xDot) * this.dt / 6;
    this.theta += (k1.thetaDot + 2 * k2.thetaDot + 2 * k3.thetaDot + k4.thetaDot) * this.dt / 6;
    this.xDot += (k1.xDotDot + 2 * k2.xDotDot + 2 * k3.xDotDot + k4.xDotDot) * this.dt / 6;
    this.thetaDot += (k1.thetaDotDot + 2 * k2.thetaDotDot + 2 * k3.thetaDotDot + k4.thetaDotDot) * this.dt / 6;
}

  /**
   * Update the cart-pole system using an action.
   * @param {number} action Only the sign of `action` matters.
   *   A value > 0 leads to a rightward force of a fixed magnitude.
   *   A value <= 0 leads to a leftward force of the same fixed magnitude.
   */
  update(action) {
    this.integrateRK(action);

    return this.isDone();
  }

  /**
   * Determine whether this simulation is done.
   *
   * A simulation is done when `x` (position of the cart) goes out of bound
   * or when `theta` (angle of the pole) goes out of bound.
   *
   * @returns {bool} Whether the simulation is done.
   */
  isDone() {
    return this.x < -this.xThreshold || this.x > this.xThreshold ||
        this.theta < -this.thetaThreshold || this.theta > this.thetaThreshold;
  }
}


function renderCartPole(cartPole, canvas) {
    if (!canvas.style.display) {
        canvas.style.display = 'block';
    }
    const X_MIN = -cartPole.xThreshold;
    const X_MAX = cartPole.xThreshold;
    const xRange = X_MAX - X_MIN;
    const scale = canvas.width / xRange;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const halfW = canvas.width / 2;

    // Draw the cart.
    const railY = canvas.height * 0.8;
    const cartW = cartPole.cartWidth * scale;
    const cartH = cartPole.cartHeight * scale;

    const cartX = cartPole.x * scale + halfW;

    context.beginPath();
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.rect(cartX - cartW / 2, railY - cartH / 2, cartW, cartH);
    context.stroke();

    // Draw the wheels under the cart.
    const wheelRadius = cartH / 4;
    for (const offsetX of [-1, 1]) {
        context.beginPath();
        context.lineWidth = 2;
        context.arc(
        cartX - cartW / 4 * offsetX, railY + cartH / 2 + wheelRadius,
        wheelRadius, 0, 2 * Math.PI);
        context.stroke();
    }

    // Draw the pole.
    const angle = cartPole.theta + Math.PI / 2;
    const poleTopX =
    halfW + scale * (cartPole.x + Math.cos(angle) * cartPole.length);
    const poleTopY = railY -
    scale * (cartPole.cartHeight / 2 + Math.sin(angle) * cartPole.length);
    context.beginPath();
    context.strokeStyle = '#ffa500';
    context.lineWidth = 6;
    context.moveTo(cartX, railY - cartH / 2);
    context.lineTo(poleTopX, poleTopY);
    context.stroke();

    // Draw the ground.
    const groundY = railY + cartH / 2 + wheelRadius * 2;
    context.beginPath();
    context.strokeStyle = '#000000';
    context.lineWidth = 1;
    context.moveTo(0, groundY);
    context.lineTo(canvas.width, groundY);
    context.stroke();

    const nDivisions = 40;
    for (let i = 0; i < nDivisions; ++i) {
    const x0 = canvas.width / nDivisions * i;
    const x1 = x0 + canvas.width / nDivisions / 2;
    const y0 = groundY + canvas.width / nDivisions / 2;
    const y1 = groundY;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    }

    // Draw the left and right limits.
    const limitTopY = groundY - canvas.height / 2;
    context.beginPath();
    context.strokeStyle = '#ff0000';
    context.lineWidth = 2;
    context.moveTo(1, groundY);
    context.lineTo(1, limitTopY);
    context.stroke();
    context.beginPath();
    context.moveTo(canvas.width - 1, groundY);
    context.lineTo(canvas.width - 1, limitTopY);
    context.stroke();
}

export { CartPole, renderCartPole };
