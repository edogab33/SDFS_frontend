import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import {Control} from 'ol/control';
import {Fill, Stroke, Style} from 'ol/style';
import {getSnapshot, startSimulation, stopSimulation} from '../api'

export class StartSimulationControl extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  initState
  disabled = true
  simulationId
  timer
  map
  horizonControl
  getSnapshotControl
  constructor(opt_options, horizonControl) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'Inizia simulazione';

    const element = document.createElement('div');
    element.className = 'ol-control ol-control-disabled ctrl-start-simulation';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.element = element
    this.horizonControl = horizonControl
    button.addEventListener('click', this.handleStartSimulation.bind(this), false);
  }

  handleStartSimulation() {
    // send the initial state to the API Service
    var gridLayer = this.map.getLayers().getArray().filter(layer => layer.get('id') == 123)[0]
    
    var gjson = JSON.parse(new GeoJSON().writeFeatures(gridLayer.getSource().getFeatures()))
    gjson.horizon = this.horizonControl.val.innerHTML

    startSimulation(gjson).then(response => {
      console.log("Simulation started:")
      console.log(response)
      this.simulationId = response.data

      const button = document.createElement('button');
      button.innerHTML = 'Ferma simulazione';

      this.element.className = 'ol-control ctrl-stop-simulation';
      this.element.removeChild(this.element.firstChild);
      this.element.appendChild(button)

      button.addEventListener('click', this.stop.bind(this), false);

      this.getSnapshotControl.setSimulationId(this.simulationId)
      this.getSnapshotControl.max = this.horizonControl.val.innerHTML
      this.getSnapshotControl.enableControl()
    })
    .catch(error => {
      console.log(error)
    })
  }

  stop() {
    stopSimulation(this.simulationId).then(response => {
      if (this.timer != undefined) {
        clearTimeout(this.timer)
        this.timer = 0
      }

      const button = document.createElement('button');
      button.innerHTML = 'Inizia simulazione';

      this.element.className = 'ol-control ctrl-start-simulation';
      this.element.removeChild(this.element.firstChild);
      this.element.appendChild(button)

      button.addEventListener('click', this.handleStartSimulation.bind(this), false);
    })
    .catch(error => {
      if (this.timer != 0) {
        clearTimeout(this.timer)
        this.timer = 0
      }

      const button = document.createElement('button');
      button.innerHTML = 'Inizia simulazione';

      this.element.className = 'ol-control ctrl-start-simulation';
      this.element.removeChild(this.element.firstChild);
      this.element.appendChild(button)
      
      console.error(error)
    })
  }

  enableControl() {
    console.log("enable")
    this.disabled = false
    this.element.className = 'ol-control ctrl-start-simulation';
  }

  disableControl() {
    this.disabled = true
    this.element.className = 'ol-control ol-control-disabled ctrl-start-simulation';
  }
}