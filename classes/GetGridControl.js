import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import {Control} from 'ol/control';
import {Fill, Stroke, Style} from 'ol/style';
import {getGrid} from '../api'

export class GetGridControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  x0 = 0
  y0 = 0
  xn = 0
  yn = 0
  map
  disabled = true
  addMarker
  deleteGridController
  
  constructor(opt_options, addMarker, deleteGridController) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'Ottieni griglia';

    const element = document.createElement('div');
    element.className = 'ol-control ol-control-disabled ctrl-get-grid';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.addMarker = addMarker
    this.deleteGridController = deleteGridController

    button.addEventListener('click', this.handleGetGrid.bind(this), false);
  }

  handleGetGrid() {
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

    getGrid(this.x0, this.y0, this.xn, this.yn).then(response => {
      var grid = response.data
      if (grid.features.length == 0) {
        return
      }
      console.log(JSON.stringify(grid))
      let gridjson = new GeoJSON().readFeatures(grid)

      const vectorSource = new VectorSource({
        features: gridjson,
      });
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction
      });
      vectorLayer.set('id', 123)
      this.map.addLayer(vectorLayer)
      
      console.log(grid)

      // Remove grid selection markers
      this.map.un('singleclick', this.addMarker)
      this.map.getLayers().getArray()
        .filter(layer => layer.get('id') == 456)
        .forEach(layer => this.map.removeLayer(layer));

      this.deleteGridController.enableControl()
      this.disableControl()
    }).catch(error => {
      alert(error)
      console.error(error)
    })
  }
  
  enableControl() {
    this.disabled = false
    this.element.className = 'ol-control ctrl-get-grid';
  }

  disableControl() {
    this.disabled = true
    this.element.className = 'ol-control ol-control-disabled ctrl-get-grid';
  }
}
