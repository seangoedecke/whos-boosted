import React, { Component } from 'react';
import Profile from './Profile';
import './App.css';

const FRIENDS_ENDPOINT = "http://sgoedecke.pythonanywhere.com/api/v1/friends/names?steamid=" // ?steamid=1234
const WINRATES_ENDPOINT = "http://sgoedecke.pythonanywhere.com/api/v1/server_winrates?steamid=" // ?steamid=88713814

class WhosBoosted extends Component {
  constructor() {
    super();
    this.state = {
      steamid: 0,
      friends: [],
      loading: false,
      errors: ''
    }
  }
  fetchFriends() {
    return fetch(FRIENDS_ENDPOINT + this.state.steamid).then( (response) => (
      response.json().then( (json) => {
        const friends = {}
        json.forEach( (friend) => {
          friends[friend.id] = { name: friend.name, id: friend.id }
        })
        this.setState({friends})
        return friends
      })
    ))
  }
  fetchWinrates(steamid) {
    return fetch(WINRATES_ENDPOINT + steamid).then((response) => (
      response.json()
    ))
  }
  searchFriendsWinrates() {
    if (this.state.steamid.length !== 17) {
      this.setState({errors: "This isn't a valid Steam ID. Try going to your Steam profile and copying the number in the URL."})
      return
    }

    this.setState({loading: true})

    this.fetchFriends().then( (friends) => {
      console.log("finished fetching friends", friends)
      Object.keys(friends).forEach( (friendId) => {
        console.log("getting winrates for", friends[friendId].name)
        this.fetchWinrates(friendId).then((winrate) => {
          console.log(winrate)
          const friends = this.state.friends
          friends[friendId].winrate = winrate
          this.setState({friends})
        })
      })
      this.setState({loading: false})
    }
    ).catch( (err) => {
      this.setState({errors: err})
    })

  }
  setSteamId(event) {
    this.setState({steamid: event.target.value})
    this.setState({errors: null})
  }
  render() {
    return (
      <div className="App">
        <div>
          <input onChange={this.setSteamId.bind(this)} />
          <button disabled={this.state.loading} onClick={this.searchFriendsWinrates.bind(this)}>Search</button>
          { this.state.errors && <div>{this.state.errors}</div> }
        </div>
        <div>
          { this.state.loading && <div>LOADING...</div> }
          { Object.keys(this.state.friends).map( (playerId) => (
            <Profile key={playerId} player={this.state.friends[playerId]} />
          ))}
        </div>
      </div>
    );
  }
}

export default WhosBoosted;
