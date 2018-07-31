const clientId = 'ad62e72b217142f1853eebf6144dc502';
const redirectUri = 'http://localhost:3000/';

let accessToken;

const Spotify = {
  getAccessToken(){
    if (accessToken){   // client access token is already set
      return accessToken;
    }
    // client token not set, but has a uri
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expireMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expireMatch) {  // does the uri match access token value and expire time value?
      accessToken = accessTokenMatch[1];
      const expire = Number(expireMatch[1]);
      window.setTimeout(() => accessToken = '', expire * 1000);
      window.history.pushState('Access Token', null, '/'); // This clears the parameters, allowing us to grab a new access token when it expires.
      return accessToken;
    } else {  // does not have the two values... then... the client does not have an Uri
      const accessUri = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUri;  // redirect the window to the new uri
    }
  },

  search(term){
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {headers: headers}).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse.tracks) {  // the track on Spotify API is a JSON object, if it is empty, then return empty response
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({  // retreive items in the JSON object
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  savePlayList(name, trackUris) {
    if (!name || !trackUris.length) {  // if the new playList does not have a name or no songs in it, then do nothing
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;


    // get the user id first
    // then use user id in the next endpoint to POST a new playList with a new
    // then use the playlist id to POST all the uris of the tracks to add into the playlist
    return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: name})
      }).then(response => response.json()
      ).then(jsonResponse => {
        const playlistId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({uris: trackUris})
        });
      });
    });
  }
}

export default Spotify;
