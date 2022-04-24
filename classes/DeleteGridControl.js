import {Control} from 'ol/control';

export class DeleteGridControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  map
  addMarker
  constructor(opt_options, addMarker) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'Cancella griglia';

    const element = document.createElement('div');
    element.className = 'ol-control ol-control-disabled ctrl-delete-grid';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.addMarker = addMarker

    button.addEventListener('click', this.handleDeleteGrid.bind(this), false);
  }

  handleDeleteGrid() {
    this.map.getLayers().getArray()
      .filter(layer => layer.get('id') == 123)
      .forEach(layer => this.map.removeLayer(layer));

    this.map.on('singleclick', this.addMarker)
    this.disableControl()
  }
  
  enableControl() {
    this.disabled = false
    this.element.className = 'ol-control ctrl-delete-grid';
  }

  disableControl() {
    this.disabled = true
    this.element.className = 'ol-control ol-control-disabled ctrl-delete-grid';
  }
}
