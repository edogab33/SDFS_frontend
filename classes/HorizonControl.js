import {Control} from 'ol/control';

export class HorizonControl extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  horizonSlider
  val
  horizon = 200
  max = 20000
  step = 50

  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement('div');
    element.className = 'ol-control ctrl-horizon'

    const button_plus = document.createElement('button')
    button_plus.innerHTML = '+'
    button_plus.id = 'plus'

    const button_minus = document.createElement('button')
    button_minus.innerHTML = '-'
    button_minus.id = 'minus'

    const val = document.createElement('span')
    val.id = 'val_h'

    const label_val = document.createElement('span')
    label_val.innerHTML = 'Horizon: '

    const nested_div = document.createElement('div')
    nested_div.className = ''

    nested_div.appendChild(label_val)
    nested_div.appendChild(button_minus)
    nested_div.appendChild(val)
    nested_div.appendChild(button_plus)
    element.appendChild(nested_div)

    super({
      element: element,
      target: options.target,
    });
    this.val = val
    this.element = element

    this.val.innerHTML = this.horizon

    button_plus.addEventListener('click', this.incrementMinutes.bind(this), false)
    button_minus.addEventListener('click', this.decrementMinutes.bind(this), false)
  }

  incrementMinutes() {
    if (this.horizon < this.max) {
      this.horizon += this.step
      this.val.innerHTML = this.horizon
    }
  }

  decrementMinutes() {
    if (this.horizon > 50) {
      this.horizon -= this.step
      this.val.innerHTML = this.horizon
    }
  }
}