import React, { Component } from 'react'
import MSG from '../proto/messages'
import api from './api'
import {WSPlayer, StreamType} from './rtsp-player/player.js'

class RTSPPlayer extends Component {
  constructor(props) {
    super(props)
    this.url = props.url
    this.playerRef = React.createRef()
  }

  componentDidMount() {
    this.player = new WSPlayer(this.playerRef.current, {url: this.url, type: StreamType.RTSP})
  }

  componentWillUnmount() {
    this.player.stop()
    this.player.destroy()
  }

  render() {
    return <div ref={this.playerRef} style={{width: '100px', height: '100px'}}>
    </div>
  }
}

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      profile: props.profile,
      showVideo: false
    }
  }

  render() {
    return <div>
      {this.state.profile &&
        <div>
          Name: {this.state.profile.name}
          {this.state.profile.stream &&
            <div>
              <button onClick={() => this.setState({ showVideo: !this.state.showVideo })}>
                {this.state.showVideo ? 'Hide Video' : 'Show Video'}
              </button>
              {this.state.showVideo &&
                <RTSPPlayer url={this.state.profile.stream.uri}/>
              }
            </div>
          }
        </div>
      }
    </div>
  }
}

class Device extends Component {
  constructor(props) {
    super(props)
    this.state = {
      config: null,
      showVideo: []
    }
  }

  onApiOnvifDeviceConfig(data) {
    if (data.id == this.props.device.id)
      this.setState({ config: data })
  }

  componentDidMount() {
    api.on(this, MSG.ONVIF_DEVICE_CONFIG)
  }

  componentWillUnmount() {
    api.off(this)
  }

  onClickConfig() {
    api.send(MSG.ONVIF_DEVICE_CONFIG, { ...this.props.device, login: null, password: null })
  }

  render() {
    return <div>
      <div>
        {this.props.device.host}:{this.props.device.port}
        <button onClick={() => this.onClickConfig()}>Load</button>
      </div>
      {this.state.config &&
        <div>
          {this.state.config.device &&
            <div>
              <div>Make: {this.state.config.device.manufacturer}</div>
              <div>Model: {this.state.config.device.model}</div>
            </div>
          }
          {this.state.config.profiles &&
            <div>
              Profiles:
              <div>
                {this.state.config.profiles.map(profile =>
                  <Profile key={profile.name} profile={profile} />
                )}
              </div>
            </div>
          }
        </div>
      }
    </div>
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      state: 'connecting',
      devices: []
    }
  }

  onApiHello(data) {
    this.setState({ state: data })
  }

  onApiOnvifDiscovery(data) {
    let devices = []
    for (const net of data)
      devices = devices.concat(net.devices || [])
    devices = devices.map(el => ({ ...el, id: `${el.host}:${el.port}` }))
    devices = devices.filter((el, i, self) => self.findIndex(val => el.id == val.id) == i)
    this.setState({ devices: devices })
  }

  componentDidMount() {
    api.on(this, MSG.HELLO, MSG.ONVIF_DISCOVERY)
    api.connect()
    api.send(MSG.HELLO, 'aaafgaaaaaaa')
  }

  componentWillUnmount() {
    api.send(MSG.BYE, 'wwwww')
    api.disconnect()
    api.off(this)
  }

  onClickDiscovery() {
    api.send(MSG.ONVIF_DISCOVERY)
  }

  render() {
    return (
      <div>
        <div>{this.state.state}</div>
        <button onClick={() => this.onClickDiscovery()}>Discovery</button>
        <div>
          {this.state.devices.map(device => <Device key={device.id} device={device} />)}
        </div>
      </div>
    )
  }
}

export default App
