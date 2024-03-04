// import math from 'mathjs';

class PIDController {
    constructor(kp, ki, kd, dt = 0.02) {
      this.kp = kp;  // Proportional gain
      this.ki = ki;  // Integral gain
      this.kd = kd;  // Derivative gain
      this.dt = dt;

      this.setpoint = 0;   // Desired value

      this.integral = 0;   // Integral sum
      this.lastError = 0;  // Last error value

      this.output = 0;     // Output value
    }

    initialize() {
      // Reset integral and derivative terms
      this.integral = 0;
      this.lastError = 0;
    }

    update(currentValue) {
      // Compute error between setpoint and current value
      const error = this.setpoint - currentValue;

      // Proportional term
      const P = this.kp * error;

      // Integral term - add error to integral history
      this.integral += error * this.dt;
      const I = this.ki * this.integral;

      // Derivative term - difference between current error and last error
      const D = this.kd * (error - this.lastError);

      // Compute the controller's output
      this.output = P + I + D;

      // Remember current error for next derivative calculation
      this.lastError = error;

      return this.output;
    }

    // Method to set the desired setpoint
    setSetpoint(value) {
      this.setpoint = value;
      this.integral = 0; // Reset integral term for new setpoint
    }

    // Method to get the current controller output
    getOutput() {
      return this.output;
    }

    // Reset method to clear integral and derivative states, optionally set new PID gains
    reset(kp = this.kp, ki = this.ki, kd = this.kd) {
        this.kp = kp;  // Proportional gain
        this.ki = ki;  // Integral gain
        this.kd = kd;  // Derivative gain

        this.integral = 0;   // Reset integral sum
        this.lastError = 0;  // Reset last error value
        this.output = 0;     // Reset output value
    }
}


export { PIDController };
