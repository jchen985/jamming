import React, { Component } from 'react';
import './App.css';
import PlayList from '../PlayList/PlayList';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Spotify from '../../util/Spotify';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      searchResults: [],
      playListName: 'My playlist',
      playListTracks: []
    }

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlayListName = this.updatePlayListName.bind(this);
    this.savePlayList = this.savePlayList.bind(this);
    this.search = this.search.bind(this);
  }


  // add song
  addTrack(track){  // adds a song to the playlistTracks state.
    let tracks = this.state.playListTracks;
    tracks.push(track);
    this.setState({playListTracks: tracks});
  }


  // remove song
  removeTrack(track){  // remove a song to the playListTracks state.
    let tracks = this.state.playListTracks;
    tracks = tracks.filter(savedTrack => savedTrack.id !== track.id); // leave the wanted ones in the playList
    this.setState({playListTracks: tracks});
  }


  // change playList name
  updatePlayListName(name){
    this.setState({playListName: name});
  }

  // save generated playList to Spotify account
  savePlayList(){
    let trackUris = this.state.playListTracks.map(track => track.uri);
    Spotify.savePlayList(this.state.playListName, trackUris);
    this.setState({playListName: 'New PlayList', playListTracks: []});
  }

  //  to search a Song
  search(term){
    Spotify.search(term).then(results => {
      this.setState({searchResults: results})
    });
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults}
                           onAdd={this.addTrack}/>
            <PlayList playListName={this.state.playListName}
                      playListTracks={this.state.playListTracks}
                      onRemove={this.removeTrack}
                      onNameChange={this.updatePlayListName}
                      onSave={this.savePlayList}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
