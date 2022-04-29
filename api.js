import axios from "axios";

const BASE_URL = 'http://mpm-tlc.ns0.it:4000'
//const BASE_URL = 'http://localhost:4000'

export function getGrid(x0,y0,xn,yn) {
    return axios.get(BASE_URL+'/grid/'+x0+'/'+y0+'/'+xn+'/'+yn)
}

export function startSimulation(initialState) {
    return axios.post(BASE_URL+'/start', initialState)
}

export function stopSimulation(simulationId) {
    var path = '/stop'
    return axios.post(BASE_URL+path, {"simulationId": simulationId})
}

export function getSnapshot(simulationId, elapsedminutes, snapshottime) {
    var path = '/snapshot/'+parseInt(simulationId)+'/'+parseInt(elapsedminutes)+'/'+parseInt(snapshottime)
    console.log(path)
    return axios.get(BASE_URL+path)
}