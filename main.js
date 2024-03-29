import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import proj4 from 'proj4';
import {Fill, Stroke, Style, Text, Circle} from 'ol/style';
import {get as getProjection, getTransform} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import {applyTransform} from 'ol/extent';
import {OSM, Vector as VectorSource} from 'ol/source'
import TileLayer from 'ol/layer/Tile';
import {Vector as VectorLayer} from 'ol/layer';
import {defaults as defaultControls, ScaleLine} from 'ol/control';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Geolocation from 'ol/Geolocation';
import { GetGridControl } from './classes/GetGridControl';
import { UndoControl } from './classes/UndoControl';
import { StartSimulationControl } from './classes/StartSimulationControl'
import { DeleteGridControl } from './classes/DeleteGridControl'
import { HorizonControl } from './classes/HorizonControl'
import { GetSnapshotControl } from './classes/GetSnapshotControl'
import { SnapshottimeControl } from './classes/SnapshottimeControl';

let code = "3035"
let name = "ETRS89-extended / LAEA Europe"
let proj4def = "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
let bbox = [36.452924, 6.944338, 47.320802, 18.348146]
const newProjCode = 'EPSG:' + code;
let tapCount = 0
var _clickCell

/* EVENTS */
const clickCell = function (pixel) {
  let features = map.getFeaturesAtPixel(pixel)

  if (features[0] != undefined) {
    // Never-clicked cells have no style
    if (features[0].getStyle() == null) {
      undoController.stack.push(features[0])
    } else if (features[0].getStyle() != null) {
      if (features[0].getStyle().fill_.color_ == 'rgba(0, 0, 0, 0.1)') {
        // Cell has been clicked, removed from the stack and clicked again
        undoController.stack.push(features[0])
      }
    }

    if (undoController.stack.length > 0) {
      startSimulationController.enableControl()
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
    features[0].setProperties({"fire": 1})
  }
};

const addMarker = function (evt) {
  console.log("coordinates: "+evt.coordinate);
  const pointSource = new VectorSource({
    features: [],
  });

  if (tapCount < 2) {
    const pointLayer = new VectorLayer();
    map.addLayer(pointLayer)
    const fill = new Fill({
      color: 'rgba(255,255,255,0.4)',
    });
    const stroke = new Stroke({
      color: '#3399CC',
      width: 1.25,
    });
    const iconStyle = new Style({
      image: new Circle({
        fill: fill,
        stroke: stroke,
        radius: 5,
      }),
      fill: fill,
      stroke: stroke,
    });
    const iconFeature = new Feature({
      geometry: new Point(evt.coordinate),
      name: 'Point'
    });

    iconFeature.setStyle(iconStyle);
    pointSource.addFeature(iconFeature)
    pointLayer.setSource(pointSource)
    pointLayer.set('id', 456)

    tapCount += 1
    if (tapCount == 1) {
      getGridController.x0 = evt.coordinate[0]
      getGridController.y0 = evt.coordinate[1]
    } else if (tapCount == 2) {
      getGridController.xn = evt.coordinate[0]
      getGridController.yn = evt.coordinate[1]
      getGridController.enableControl()
    }
  } else if (tapCount >= 2) {
    tapCount = 0
    map.getLayers().getArray()
        .filter(layer => layer.get('id') == 456)
        .forEach(layer => map.removeLayer(layer));
    pointSource.clear()   // delete markers
    getGridController.disableControl()
  }
}

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

var scalebar = new ScaleLine({
  units: 'metric',
  bar: true,
  steps: 4,
  minWidth: 140,
});

let horizonController = new HorizonControl()
let getSnapshotController = new GetSnapshotControl()
let snapshottimeController = new SnapshottimeControl("", getSnapshotController)

const map = new Map({
  controls: defaultControls().extend([horizonController, getSnapshotController, snapshottimeController, scalebar]),
  layers: [
    new TileLayer({
      source:new OSM()
    })
  ],
  target: 'map',
  view: new View({
    projection: newProj,
    center: [4559505, 2121005],
    extent: extent,
    zoom: 12,
  }),
});

getSnapshotController.map = map

/* GEOLOCATION */
const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: newProj,
});

geolocation.setTracking(true);

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new Circle({
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

var currZoom = map.getView().getZoom();
console.log(currZoom)
map.on('moveend', function(e) {
  var newZoom = map.getView().getZoom();
  if (currZoom != newZoom) {
    console.log('zoom end, new zoom: ' + newZoom);
    currZoom = newZoom;
  }
});

map.on('click', _clickCell = function (evt) {
  clickCell(evt.pixel)
});
map.on('singleclick', addMarker);

let startSimulationController = new StartSimulationControl("", _clickCell, horizonController, getSnapshotController, snapshottimeController)
let deleteGridController = new DeleteGridControl("", addMarker, _clickCell, startSimulationController)
let getGridController = new GetGridControl("", addMarker, deleteGridController)
let undoController = new UndoControl("", startSimulationController)

deleteGridController.getGridController = getGridController

map.addControl(startSimulationController)
map.addControl(deleteGridController)
map.addControl(getGridController)
map.addControl(undoController)

deleteGridController.map = map
getGridController.map = map
startSimulationController.map = map