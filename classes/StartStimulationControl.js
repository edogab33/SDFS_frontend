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
    element.className = 'ol-control ctrl-start-simulation ctrl-start-simulation-disabled';
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
    this.disableControl()

    var gridLayer = this.map.getLayers().getArray().filter(layer => layer.get('id') == 123)[0]
    console.log(gridLayer)
    var gjson = JSON.parse(new GeoJSON().writeFeatures(gridLayer.getSource().getFeatures()))
    startSimulation(gjson).then(response => {
      console.log(response)
      this.simulationId = response.data
      setTimeout(5000)
      this.refresh()
    })
    .catch(error => {
      console.log(error)
    })
  }

  refresh() {
    console.log(this.simulationId)

    const styles = {
      'Polygon': new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0.1)',
        }),
      }),
    };

    const styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };

    getSnapshot(this.simulationId).then(response => {
      console.log(response)
      var grid = response.data
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(grid),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction
      });

      console.log(this.map.getLayers())

      //this.map.getLayers().getArray()
      //  .filter(layer => layer.get('name') === 'Marker')
      //  .forEach(layer => map.removeLayer(layer));

      this.map.addLayer(vectorLayer)
    })
    this.timer = setTimeout(this.refresh, 5000);
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
    this.element.className = 'ol-control ctrl-start-simulation ctrl-start-simulation-disabled';
  }
}