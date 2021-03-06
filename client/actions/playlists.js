module.exports = {

  onNewPlaylist: (state, actions, title) => {
    console.log('apples');
    state.socket.emit('newPlaylist', { title }, (res) => {
      console.log('response' + JSON.stringify(res));
      actions.addPlaylist({
        playlistid: res.playlistid,
        title: res.title
      });
      actions.addKey({
        playlistid: res.playlistid,
        key: res.key
      });
      actions.router.go('/playlist/' + res.playlistid);
      actions.hideModals();
    });
  },

  addPlaylist: (state, actions, pl) => {
    console.log('adding' + JSON.stringify(pl));
    var newPlaylists = [pl].concat(state.playlists);
    console.log('saving ' + JSON.stringify(newPlaylists));
    localStorage.setItem('playlists', JSON.stringify(newPlaylists));
    return {
      playlists: newPlaylists
    }
  },

  fetchPlaylist: (state, actions, id) => {
    console.log('fetching');
    state.socket.emit('getPlaylist', { id }, data => {
      console.log('fetched ' + id, data);
      actions.possiblyUpdateCurrent(data);
    });
  },

  getPlaylist: (state, actions, id) => {
    // load quick result from cache if Cachepages plugin
    if (state.playlistCache && state.playlistCache[id]) {
      console.log('found in cache ', state.playlistCache[id])
      actions.setCurrentPlaylist(state.playlistCache[id], true);  // dont resave to cache
    } else {
      // debugger;
      console.log('nope not found', state.playlistCache, id, state.playlistCache[id], state.playlistCache['SynVC6k7Z']);
      console.log(Object.keys(state.playlistCache), Object.keys(state.playlistCache).indexOf(id));
    }
    actions.fetchPlaylist(id);
  },


  getLocalPlaylists: (state, actions) => {
    var localPlaylists = localStorage.getItem('playlists');
    localPlaylists = JSON.parse(localPlaylists);
    if (localPlaylists) {
      var playlistIds = localPlaylists.map(pl => pl.playlistid);
      actions.connectToPlaylistRooms(playlistIds);
      return {
        playlists: localPlaylists
      };
    }
  },


  deleteSavedPlaylist: (state, actions, pl) => {
    console.log('removing pl', pl);
    var currentPlaylists = state.playlists;

    var newPlaylists = (pl.playlistid) ? state.playlists.filter(playlist => {
      return playlist.playlistid !== pl.playlistid
    }) : state.playlists.filter(playlist => {
      return playlist.fetchid !== pl.fetchid
    });

    localStorage.setItem('playlists', JSON.stringify(newPlaylists));

    if (pl.fetchid) {
      // actions.router.go('/home');
      actions.fetchComplete();
    }
    return {
      playlists: newPlaylists
    };
  }


};
