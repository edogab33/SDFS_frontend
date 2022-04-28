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
  simulationHorizon
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
    this.simulationHorizon = gjson.horizon

    startSimulation(gjson).then(response => {
      console.log("Simulation started:")
      console.log(response)
      this.simulationId = response.data

      this.getSnapshotControl.setSimulationId(this.simulationId)

      const button = document.createElement('button');
      button.innerHTML = 'Ferma simulazione';

      this.element.className = 'ol-control ctrl-stop-simulation';
      this.element.removeChild(this.element.firstChild);
      this.element.appendChild(button)

      button.addEventListener('click', this.stop.bind(this), false);

      this.timer = setTimeout(()=>{this.refresh(0)}, 2000)
    })
    .catch(error => {
      console.log(error)
    })
  }

  refresh(elapsedminutes) {
    var styles = new Style({
      stroke: new Stroke({color: 'blue', width: 1}),
      fill: new Fill()
    });
    var styleFunction = function(feature) {
      var fire = feature.get('fire');
      var color = ''
      if (fire == 0) {
        color = 'rgba(0, 0, 0, 0.1)'
      } else if (fire == 1) {
        color = 'rgba(255, 0, 0, 0.3)'
      } else {
        color = 'rgba(255, 255, 0, 0.3)'
      }
      styles.getFill().setColor(color);
      return styles;
    };
    getSnapshot(this.simulationId, elapsedminutes).then(response => {
      var grid = response.data
      console.log("New grid from snapshot:")
      console.log(grid)
      if (grid.features.length > 0) {
        // Update the grid only if there are updates
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(grid),
        });
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: styleFunction
        });
        vectorLayer.set('id', 123)
        // Remove old grid
        this.map.getLayers().getArray()
          .filter(layer => layer.get('id') == 123)
          .forEach(layer => this.map.removeLayer(layer));
        this.map.addLayer(vectorLayer)
        elapsedminutes += 10
      }

      if (elapsedminutes >= this.simulationHorizon) {
        // Simulation has terminated
        this.stop()
        return
      }
      this.timer = setTimeout(()=>{this.refresh(elapsedminutes)}, 2000);
    })
    .catch(error => {
      console.log(error)
    })
  }

  stop() {
    this.getSnapshotControl.max = this.simulationHorizon
    this.getSnapshotControl.enableControl()

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
    this.disabled = false
    this.element.className = 'ol-control ctrl-start-simulation';
  }

  disableControl() {
    this.disabled = true
    this.element.className = 'ol-control ol-control-disabled ctrl-start-simulation';
  }
}