import decimalToSexagesimal from 'geolib/es/decimalToSexagesimal'
import './mouse-position.css'
import Mgl from 'mapbox-gl'

function defaultLabelFormat ({ lng, lat }) {
  return `Lng: ${lng}, Lat: ${lat}`
}

export default class MousePositionControl {
  constructor (options = {}) {
    this.format = options.format || 'dd'
    this.digits = options.digits || 5
    this.trackCenter = options.trackCenter || false
    this.labelFormat = options.labelFormat || defaultLabelFormat
    this.coord = new Mgl.LngLat(0, 0)
  }

  insertControl () {
    this.container = document.createElement('div')
    this.container.classList.add('mapboxgl-ctrl')
    this.container.classList.add('mapboxgl-ctrl-mouse-position')
    this.panel = document.createElement('div')
    if (this.trackCenter) this.onMouseMove()
    else this.panel.innerHTML = this.labelFormat({ lng: '', lat: '', lngLat: null, map: this.map })
    this.container.appendChild(this.panel)
  }

  setFormat (format) {
    this.format = format
    if (this.trackCenter) return this.onMouseMove()
    this.onMouseMove({
      lngLat: new Mgl.LngLat(this.coord.lng, this.coord.lat)
    })
  }

  onMouseMove (evt) {
    let lng, lat
    if (this.trackCenter) {
      this.coord = this.map.getCenter().wrap()
    } else {
      this.coord = evt.lngLat.wrap()
    }
    if (this.format === 'dms') {
      lng = decimalToSexagesimal(this.coord.lng) + ' ' + (this.coord.lng < 0 ? 'W' : 'E')
      lat = decimalToSexagesimal(this.coord.lat) + ' ' + (this.coord.lat < 0 ? 'S' : 'N')
    } else {
      lng = (this.coord.lng < 0 ? '-' : '') + Math.abs(this.coord.lng).toFixed(this.digits)
      lat = (this.coord.lat < 0 ? '-' : '') + Math.abs(this.coord.lat).toFixed(this.digits)
    }
    this.panel.innerHTML = this.labelFormat({ lng, lat, lngLat: this.coord, map: this.map })
  }

  onAdd (map) {
    this.map = map
    this.insertControl()
    if (this.trackCenter) {
      this.map.on('move', this.onMouseMove.bind(this))
    } else {
      this.map.on('mousemove', this.onMouseMove.bind(this))
    }
    return this.container
  }

  onRemove () {
    if (this.trackCenter) {
      this.map.off('move', this.onMouseMove.bind(this))
    } else {
      this.map.off('mousemove', this.onMouseMove.bind(this))
    }
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }
}
