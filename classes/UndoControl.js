import {Fill, Stroke, Style} from 'ol/style';
import {Control} from 'ol/control';

export class UndoControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  stack = []
  startSimulationController = 0
  constructor(opt_options, startSimulationController) {
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
    this.startSimulationController = startSimulationController

    button.addEventListener('click', this.handleUndo.bind(this), false);
  }

  handleUndo() {
    if (this.stack.length > 0) {
      console.log(this.stack)
      let feature = this.stack.pop()
      console.log(this.stack)
      if (this.stack.length > 0) {
        this.startSimulationController.enableControl()
      } else {
        this.startSimulationController.disableControl()
      }
      feature.setStyle(new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0.1)',
        })
      }))
    } else {
      this.startSimulationController.disableControl()
    }
  }
}
