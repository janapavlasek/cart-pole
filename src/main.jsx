import React from 'react'
import ReactDOM from 'react-dom'
import SceneView from './scene'
import {CartPole, renderCartPole} from './cart_pole'

const cartpole = new CartPole();
const cartPoleCanvas = document.getElementById('cart-pole-canvas');

function animate() {
  requestAnimationFrame(animate); // request next iteration of animation loop
  // cartpole.update(0);
  renderCartPole(cartpole, cartPoleCanvas);
}

ReactDOM.render(
  <React.StrictMode>
    <SceneView cartpole={cartpole} />
  </React.StrictMode>,
  document.getElementById('app-root')
)

animate();  // simulation animation loop
