import {Control} from 'ol/control';

export class HorizonControl extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  min = 10
  max = 2000
  horizonSlider
  val
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement('div');
    element.className = 'ol-control ctrl-horizon'
    element.innerHTML = 'Horizon: <input type="range" min="'+10+'" max="'+2000+'" value="50" class="slider" id="horizon">'

    const val = document.createElement('span')
    val.id = 'val'
    element.appendChild(val)

    super({
      element: element,
      target: options.target,
    });
    this.val = val
    this.element = element
    //button.addEventListener('click', this.handleStartSimulation.bind(this), false);
  }

  activateSlider() {
    this.horizonSlider = document.getElementById('horizon')

    this.val.innerHTML = this.horizonSlider.value

    this.horizonSlider.oninput = function() {
      document.getElementById('val').innerHTML = document.getElementById('horizon').value
    }
  }
}