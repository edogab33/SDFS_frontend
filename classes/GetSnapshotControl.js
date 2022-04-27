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
  elapsedMinutesSlider
  simulationId
  elapsedminutes
  min = 10
  max = 2000
  map
  disabled = true
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement('div');
    element.className = 'ol-control ol-control-disabled ctrl-get-snapshot'
    element.innerHTML = 'Snapshot: <input type="range" min="'+0+'" max="'+2000+'" step="10" value="0" class="slider" id="elapsedminutes">'

    const val = document.createElement('span')
    val.id = 'val_em'
    element.appendChild(val)

    const button = document.createElement('button');
    button.innerHTML = 'Scarica snapshot';
    element.appendChild(button)

    super({
      element: element,
      target: options.target,
    });

    this.elapsedminutes = val
    this.element = element
    button.addEventListener('click', this.handleGetSnapshot.bind(this), false);
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

    getSnapshot(this.simulationId, this.elapsedminutes.innerHTML).then(response => {
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

  activateSlider() {
    this.elapsedMinutesSlider = document.getElementById('elapsedminutes')

    this.elapsedminutes.innerHTML = this.elapsedMinutesSlider.value

    this.elapsedMinutesSlider.oninput = function() {
      document.getElementById('val_em').innerHTML = document.getElementById('elapsedminutes').value
    }
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