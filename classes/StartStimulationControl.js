import 'ol/ol.css';
import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import {Control} from 'ol/control';
import {Fill, Stroke, Style} from 'ol/style';
import {getSnapshot, startSimulation} from '../api'

export class StartSimulationControl extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  initState
  disabled = true
  simulationId
  timer
  map
  constructor(opt_options) {
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

    button.addEventListener('click', this.handleStartSimulation.bind(this), false);
  }

  handleStartSimulation() {
    // send the initial state to the API Service

    // TODO: Transform the start simulation button into a stop simulation one
    var gridLayer = this.map.getLayers().getArray().filter(layer => layer.get('id') == 123)[0]
    console.log(gridLayer)
    var gjson = JSON.parse(new GeoJSON().writeFeatures(gridLayer.getSource().getFeatures()))
    startSimulation(gjson).then(response => {
      console.log(response)
      this.simulationId = response.data

      const button = document.createElement('button');
      button.innerHTML = 'Ferma simulazione';

      this.element.className = 'ol-control ctrl-stop-simulation';
      this.element.removeChild(this.element.firstChild);
      console.log(this.element)
      this.element.appendChild(button)

      setTimeout(()=>{this.refresh()}, 5000)
    })
    .catch(error => {
      console.log(error)
    })
  }

  refresh() {
    console.log(this.simulationId)

    var styles = new Style({
      stroke: new Stroke({color: 'blue', width: 1}),
      fill: new Fill()
    });

    var styleFunction = function(feature) {
      var fire = feature.get('fire');
      var color = fire == 1 ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
      styles.getFill().setColor(color);
      return styles;
    };

    getSnapshot(this.simulationId).then(response => {
      var grid = response.data
      console.log(grid)
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(grid),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction
      });
      vectorLayer.set('id', 123)

      console.log(this.map.getLayers())

      // Remove old grid
      this.map.getLayers().getArray()
        .filter(layer => layer.get('id') == 123)
        .forEach(layer => this.map.removeLayer(layer));

      this.map.addLayer(vectorLayer)
      this.timer = setTimeout(()=>{this.refresh()}, 5000);
    })
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = 0
    }
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