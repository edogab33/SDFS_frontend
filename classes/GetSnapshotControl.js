import {Control} from 'ol/control';

export class GetSnapshotControl extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  horizon
  simulationId
  elapsedminutes
  min = 10
  max = 2000
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'Invia';

    const horizonSlider = document.createElement('slider')

    const elapsedminutesSlider = document.createElement('slider')
    elapsedminutesSlider.className = 'slider'

    const element = document.createElement('div');
    element.className = 'ol-box';

    element.innerHTML = '<p>Horizon:</p> <input type="range" min="'+10+'" max="'+2000+'" value="50" class="slider" id="horizon">'
    element.innerHTML = '<p>Elapsed Minutes:</p> <input type="range" min="'+10+'" max="'+2000+'" value="50" class="slider" id="elapsedminutes">'

    element.appendChild(horizonSlider)
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.element = element

    //button.addEventListener('click', this.handleStartSimulation.bind(this), false);
  }
}