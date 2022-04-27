import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import {Control} from 'ol/control';
import {Fill, Stroke, Style} from 'ol/style';
import {getSnapshot} from '../api'

export class GetSnapshotControl extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  simulationId = 'nessuno'
  elapsedminutes
  map
  disabled = true
  max = 20
  constructor(opt_options) {
    const options = opt_options || {};

    let simulationId = 'nessuno'
    const element = document.createElement('div');
    element.className = 'ol-control ol-control-disabled ctrl-get-snapshot'
    element.innerHTML = '<p id="simid">Simulation id: '+simulationId+'</p>'

    const button_plus = document.createElement('button')
    button_plus.innerHTML = '+'
    button_plus.id = 'plus'
    //button_plus.className = 'ol-control'

    const button_minus = document.createElement('button')
    button_minus.innerHTML = '-'
    button_minus.id = 'minus'
    //button_minus.className = 'ol-control'

    const val = document.createElement('span')
    val.id = 'val_em'
    val.innerHTML = 0

    const label_val = document.createElement('span')
    label_val.innerHTML = 'Minuti: '

    const nested_div = document.createElement('div')
    nested_div.className = ''

    nested_div.appendChild(label_val)
    nested_div.appendChild(button_minus)
    nested_div.appendChild(val)
    nested_div.appendChild(button_plus)

    element.appendChild(nested_div)

    const button = document.createElement('button');
    button.innerHTML = 'Scarica snapshot';
    element.appendChild(button)

    super({
      element: element,
      target: options.target,
    });

    this.elapsedminutes = 0
    this.val = val
    this.element = element
    this.simulationId = simulationId
    button.addEventListener('click', this.handleGetSnapshot.bind(this), false)
    button_plus.addEventListener('click', this.incrementMinutes.bind(this), false)
    button_minus.addEventListener('click', this.decrementMinutes.bind(this), false)
  }

  handleGetSnapshot() {
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

    getSnapshot(this.simulationId, this.elapsedminutes).then(response => {
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
      }
    })
    .catch(error => {
      console.log(error)
    })
  }

  incrementMinutes() {
    console.log("inc")
    if (this.elapsedminutes < this.max) {
      this.elapsedminutes += 10
      this.val.innerHTML = this.elapsedminutes
    }
  }

  decrementMinutes() {
    if (this.elapsedminutes > 0) {
      this.elapsedminutes -= 10
      this.val.innerHTML = this.elapsedminutes
    }
  }

  setMax(max) {
    this.elapsedMinutesSlider.max = max
  }

  setSimulationId(simulationId) {
    this.simulationId = simulationId
    document.getElementById('simid').innerHTML = '<p id="simid">Simulation id: '+ this.simulationId +'</p>'

  }

  enableControl() {
    this.disabled = false
    this.element.className = 'ol-control ctrl-get-snapshot';
  }

  disableControl() {
    this.disabled = true
    this.element.className = 'ol-control ol-control-disabled ctrl-get-snapshot';
  }
}