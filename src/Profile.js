import React, { Component } from 'react';
import './App.css';
import isEmpty from 'lodash';

class Profile extends Component {
  constructor(){
    super()
    this.state = {expanded: false, booster: -1}
  }
  toggleExpanded(){
    this.setState({expanded: !this.state.expanded})
  }
  getClass(){
    if (this.state.booster === -1) {
      return 'profile-unknown'
    } else if (this.state.booster < 0.15 ){
      return 'profile-not-booster'
    } else {
      return 'profile-booster'
    }
  }
  checkBooster(){
    const winrate = this.props.player.winrate
    if (!winrate) {
      this.setState({booster: -1})
      return
    }
    if (winrate.length === 1) {
      this.setState({booster: 0})
      return
    }
    console.log(winrate)
    const stats = winrate.map( (server) => {
      Number((server.stats.ranked.winrate + server.stats.unranked.winrate) / 2)
    })

    const min = Math.min.apply(Math, stats)
    const max = Math.max.apply(Math, stats)

    this.setState({booster: max-min})


  }
  render(){
    this.checkBooster()
    const { player } = this.props
    return(
      <div className={this.getClass.bind(this)} onClick={this.toggleExpanded.bind(this)}>
        {player.name} --> { player.winrate ? 'loaded!' : 'loading'}
        { this.state.expanded && player.winrate && <div>
          { player.winrate.map( (server) => (
            isEmpty(server.stats.ranked.winrate) ? null : <span><b>{server.server}:</b> {server.stats.ranked.winrate}</span>
          ))}
        </div> }
      </div>
    )
  }
}

export default Profile
