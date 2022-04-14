import axios from "axios";

const BASE_URL = 'http://localhost:4000'

export function getGrid(x0,y0,xn,yn) {
    return axios.get(BASE_URL+'/grid/'+x0+'/'+y0+'/'+xn+'/'+yn)
}

export function startSimulation() {

}