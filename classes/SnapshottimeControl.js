import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import {Control} from 'ol/control';
import {Fill, Stroke, Style} from 'ol/style';

export class SnapshottimeControl extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  max = 20
  val
  snapshottime = 0
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement('div');
    element.className = 'ol-control ctrl-snapshottime'

    const button_plus = document.createElement('button')
    button_plus.innerHTML = '+'
    button_plus.id = 'plus'

    const button_minus = document.createElement('button')
    button_minus.innerHTML = '-'
    button_minus.id = 'minus'

    const val = document.createElement('span')
    val.id = 'val_st'
    val.innerHTML = 0

    const label_val = document.createElement('span')
    label_val.innerHTML = 'Snapshot Time: '

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

    this.val = val    // selectable snapshottime
    this.element = element
    button_plus.addEventListener('click', this.incrementMinutes.bind(this), false)
    button_minus.addEventListener('click', this.decrementMinutes.bind(this), false)
  }

  incrementMinutes() {
    if (this.snapshottime < this.max) {
      this.snapshottime += 1
      this.val.innerHTML = this.snapshottime
    }
  }

  decrementMinutes() {
    if (this.snapshottime > 0) {
      this.snapshottime -= 1
      this.val.innerHTML = this.snapshottime
    }
  }

  setMax(max) {
    this.max = max
  }
}