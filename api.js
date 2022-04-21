import axios from "axios";

const BASE_URL = 'http://localhost:4000'

export function getGrid(x0,y0,xn,yn) {
    return axios.get(BASE_URL+'/grid/'+x0+'/'+y0+'/'+xn+'/'+yn)
}

export function startSimulation(initialState) {
    console.log(initialState)
    return axios.post(BASE_URL+'/start', initialState)
}

export function getSnapshot(simulationId) {
    console.log(typeof simulationId)
    var path = '/snapshot/'+parseInt(simulationId)
    console.log(path)
    return axios.get(BASE_URL+path)
}