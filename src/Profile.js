import React, { Component } from 'react';
import { Spinner, Checkmark } from './utils';
import './App.css';
import isEmpty from 'lodash';

class Profile extends Component {
  constructor(){
    super()
    this.state = {expanded: false, booster: -2, analysis: []}
  }
  componentWillReceiveProps(nextProps ){
    this.checkBooster()
  }
  toggleExpanded(){
    this.setState({expanded: !this.state.expanded})
  }
  getClass(booster){
    if (booster === -1) {
      return 'profile-unknown'
    } else if (booster === -2) {
      return 'profile-loading'
    } else {
      return 'profile-booster-' + booster
    }
  }
  checkBooster(){
    const winrate = this.props.player.winrate
    if (!winrate) { return }
    if (winrate && winrate.length === 0) { // make sure there's data to check
      this.setState({booster: -1})
      return
    }

    const analysis = {
      totalWrDifference: 0,
      unrankedOnly: false,
      boostedOnServer: 0
    }
    const analysisText = []

    // get score for boosted on server
    const boostedOnServer = winrate.map( (server) => {
      let boosterChance = 0;
      if (server.stats.ranked.winrate > 0.55) {
        // candidate boosting server
        if (server.stats.unranked.games <= 3) {
          boosterChance = 1
          analysisText.push('high ranked winrate with few unranked games')
        }
        if (server.stats.unranked.games > 3 && server.stats.unranked.winrate < 0.5) {
          boosterChance = 2
          analysisText.push('low unranked winrate with few ranked games')
          if (server.stats.ranked.winrate > 0.6 && server.stats.unranked.winrate < 0.4) {
            boosterChance = 3
            analysisText.push('high difference between ranked and unranked winrate on the same server')
          }
        }
      }
      return boosterChance
    })
    const maxBoostedOnServer = Math.min.apply(Math, boostedOnServer)
    analysis.boostedOnServer = maxBoostedOnServer

    // get biggest total difference between wr on servers
    const total_stats = winrate.map( (server) => {
      return Number((server.stats.ranked.winrate + server.stats.unranked.winrate) / 2) // total ranked/unranked winrate
    })
    const min_total = Math.min.apply(Math, total_stats)
    const max_total = Math.max.apply(Math, total_stats)
    analysis.totalWrDifference = max_total-min_total

    // test if the player plays unranked/ranked on different servers
    const ranked_v_unranked = winrate.map( (server) => {
      if ((server.stats.ranked.games + server.stats.unranked.games) === 0) { return }
      return Math.abs(server.stats.ranked.games / (server.stats.ranked.games + server.stats.unranked.games)) // % of ranked games
    })
    const max = Math.max.apply(Math, ranked_v_unranked)
    const min = Math.max.apply(Math, ranked_v_unranked)
    if (max > 0.9 && min < 0.1) {
      analysis.unrankedOnly = true
    }
    let totalScore = 0
    if (analysis.totalWrDifference > 0.2) {
      totalScore = totalScore + 2

      analysisText.push('large winrate difference between servers (' + String(analysis.totalWrDifference).slice(0,4) +')')
    } else if (analysis.totalWrDifference > 0.1) {
      totalScore = totalScore + 1

      analysisText.push('small winrate difference between servers (' + String(analysis.totalWrDifference).slice(0,4) +')')
    }
    if (analysis.unrankedOnly) {
      totalScore = totalScore + 1

      analysisText.push('played unranked on multiple servers but ranked on only one')
    }
    totalScore = Number(totalScore) + Number(analysis.boostedOnServer)

    this.setState({analysis: analysisText})
    this.setState({booster: totalScore})
  }
  render(){
    const { player } = this.props
    return(
        <div className={`profile ${this.getClass(this.state.booster)}`} >
          <div className='profile-name'>
            {player.name} { player.winrate ? <Checkmark /> : <Spinner />}

            {this.state.analysis.length > 0 && <a href='#' onClick={this.toggleExpanded.bind(this)}>...</a>}
          </div>

          {/* Analysis text */}
          { this.state.expanded && player.winrate.length > 0 && <div className='profile-details'>
            <ul>
              { this.state.analysis.map( (text) => (
                <li key={this.state.analysis.indexOf(text)}>{text}</li>
              ))}
            </ul>
          </div> }
        </div>
    )
  }
}



export default Profile
