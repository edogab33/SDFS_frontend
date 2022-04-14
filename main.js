import 'ol/ol.css';
import MVT from 'ol/format/MVT';
import Map from 'ol/Map';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import View from 'ol/View';
import proj4 from 'proj4';
import {Fill, Icon, Stroke, Style, Text, Circle as CircleStyle} from 'ol/style';
import {get as getProjection, getTransform} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import {applyTransform} from 'ol/extent';
import {OSM, Vector as VectorSource} from 'ol/source'
import TileLayer from 'ol/layer/Tile';
import {Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import {Control, defaults as defaultControls} from 'ol/control';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Geolocation from 'ol/Geolocation';
import {getGrid} from './api'

const key =
  'pk.eyJ1IjoiZWRvZ2FiIiwiYSI6ImNsMWwxaXA0ajA1bjczY282MG9lZ3o3Z28ifQ.pm-O1XDStv6IxgpCx-rKZA';



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

class UndoControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  stack = []
  constructor(opt_options) {
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

class StartSimulation extends Control {
    /**
   * @param {Object} [opt_options] Control options.
   */
  initState
  disabled = true
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'Inizia simulazione';

    const element = document.createElement('div');
    element.className = 'ol-control ctrl-start-sim ctrl-start-sim-disabled';
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
  }

  enableControl() {
    this.disabled = false
    this.element.className = 'ol-control ctrl-start-sim';
  }

  disableControl() {
    this.disabled = true
    this.element.className = 'ol-control ctrl-start-sim ctrl-start-sim-disabled';
  }
}

// Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
const resolutions = [];
for (let i = 0; i <= 8; ++i) {
  resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}
// Calculation of tile urls for zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
function tileUrlFunction(tileCoord) {
  return (
    'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
    '{z}/{x}/{y}.vector.pbf?access_token=' +
    key
  )
    .replace('{z}', String(tileCoord[0] * 2 - 1))
    .replace('{x}', String(tileCoord[1]))
    .replace('{y}', String(tileCoord[2]))
    .replace(
      '{a-d}',
      'abcd'.substr(((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1)
    );
}

let code = "3035"
let name = "ETRS89-extended / LAEA Europe"
let proj4def = "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
let bbox = [84.17, -35.58, 24.6, 44.83]
const newProjCode = 'EPSG:' + code;

proj4.defs(newProjCode, proj4def);
register(proj4);
const newProj = getProjection(newProjCode);
const fromLonLat = getTransform('EPSG:4326', newProj);

let worldExtent = [bbox[1], bbox[2], bbox[3], bbox[0]];
newProj.setWorldExtent(worldExtent);

// approximate calculation of projection extent,
// checking if the world extent crosses the dateline
if (bbox[1] > bbox[3]) {
  worldExtent = [bbox[1], bbox[2], bbox[3] + 360, bbox[0]];
}
const extent = applyTransform(worldExtent, fromLonLat, undefined, 8);
newProj.setExtent(extent);

let undo = new UndoControl()
let startSim = new StartSimulation()

const map = new Map({
  controls: defaultControls().extend([undo, startSim]),
  layers: [
    new TileLayer({
      source:new OSM()
    })
  ],
  target: 'map',
  view: new View({
    projection: newProj,
    center: [4559505, 2130995],
    extent: extent,
    zoom: 16,
  }),
});

/* GEOLOCATION */
const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: newProj,
});

function el(id) {
  return document.getElementById(id);
}

geolocation.setTracking(true);

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});

/* EVENTS */
var currZoom = map.getView().getZoom();
console.log(currZoom)
map.on('moveend', function(e) {
  var newZoom = map.getView().getZoom();
  if (currZoom != newZoom) {
    console.log('zoom end, new zoom: ' + newZoom);
    currZoom = newZoom;
  }
});

const clickCell = function (pixel) {
  let features = map.getFeaturesAtPixel(pixel)
  // Never-clicked cells have no style
  if (features[0] != undefined) {
    if (features[0].getStyle() == null) {
      undo.stack.push(features[0])
    } else if (features[0].getStyle() != null) {
      if (features[0].getStyle().fill_.color_ == 'rgba(0, 0, 0, 0.1)') {
        // Cell has been clicked, removed from the stack and clicked again
        undo.stack.push(features[0])
      }
    }
    if (startSim.disabled == true) {
      startSim.enableControl()
    }
    features[0].setStyle(new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.3)',
      })
    }))
  }
};

map.on('click', function (evt) {
  clickCell(evt.pixel);
});


/* GET GRID */
class GetGridButton {
  /**
   * @param {Object} [opt_options] Control options.
   */
  x0 = 0
  y0 = 0
  xn = 0
  yn = 0
  disabled = true
  constructor() {
    this.element = document.getElementById('getgrid')
  }

  enableControl() {
    this.disabled = false
    this.element.className = 'ctrl-get-grid';
  }

  disableControl() {
    this.disabled = true
    this.element.className = 'ctrl-get-grid ctrl-get-grid-disabled';
  }
}

var getGridButton = new GetGridButton()

const iconStyle = new Style({
  image: new Icon({
    //anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: '/assets/icon.png',
  }),
});
const pointSource = new VectorSource({
  features: [],
});
const pointLayer = new VectorLayer();
map.addLayer(pointLayer)
let tapCount = 0

map.on('singleclick', function (evt) {
  console.log("coordinates: "+evt.coordinate);
  if (tapCount < 2) {
    const iconFeature = new Feature({
      geometry: new Point(evt.coordinate),
      name: 'Point'
    });

    iconFeature.setStyle(iconStyle);
    pointSource.addFeature(iconFeature)
    pointLayer.setSource(pointSource)

    tapCount += 1
    if (tapCount == 1) {
      getGridButton.x0 = evt.coordinate[0]
      getGridButton.y0 = evt.coordinate[1]
    } else if (tapCount == 2) {
      getGridButton.xn = evt.coordinate[0]
      getGridButton.yn = evt.coordinate[1]
      getGridButton.enableControl()
    }
  } else if (tapCount >= 2) {
    tapCount = 0
    pointSource.clear()   // delete markers
    getGridButton.disableControl()
  }
});

const styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
};

function clickGetGrid() {
  getGrid(getGridButton.x0, getGridButton.y0, getGridButton.xn, getGridButton.yn)
    .then(response => {
      var grid = response.data
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(grid),
      });
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction
      });
      map.addLayer(vectorLayer)
    })
}

getGridButton.element.addEventListener('click', clickGetGrid)