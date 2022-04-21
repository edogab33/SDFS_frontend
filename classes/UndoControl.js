import {Fill, Stroke, Style} from 'ol/style';
import {Control} from 'ol/control';

export class UndoControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  stack = []
  constructor(opt_options, vectLayer) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'Pulisci';

    const element = document.createElement('div');
    element.className = 'ol-control ctrl-undo';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.vectLayer = vectLayer

    button.addEventListener('click', this.handleUndo.bind(this), false);
  }

  handleUndo() {
    if (this.stack.length > 0) {
      console.log(this.stack)
      let feature = this.stack.pop()
      console.log(this.stack)
      feature.setStyle(new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0.1)',
        })
      }))
    }
  }
}
