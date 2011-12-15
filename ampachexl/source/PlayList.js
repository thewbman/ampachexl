/*
    Copyright (c) Ampache Mobile
    All rights reserved.

    This file is part of Ampache Mobile.

    Ampache Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ampache Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ampache Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/

var RepeatModeType = {
    "no_repeat": 0,
    "repeat_forever": 1,
    "repeat_song": 2
};

PlayList = Class.create({

    songs: null,
    //Array of songs in the order they were added to the class
    //playback: null,
    //Array of indexes into the songs array, this array stores the playback order.
    current: 0,
    //Index into the playback array

    repeat: 0,
    shuffle: false,

    initialize: function(songsList, shuffle, repeat, startIndex) {
        this.songs = new Array();
        this.shuffle = shuffle;
        this.repeat = repeat;

       
        for (var i = 0; i < songsList.length; i++) {
            this.songs[i] = songsList[i];
            this.songs[i].index = i + 1;
            this.songs[i].i = i;
        }

         //this.playback = this.getSequentialIntArray();
        this.current = startIndex;
        this.songs[this.current].plIcon = "images/player/play.png";


        if (this.shuffle === true) {
            this.songs[this.current].plIcon = "images/player/blank.png";
            //if shuffled is on, then user couldnt have selected a track, so 
            this.current = Math.floor(Math.random() * this.songs.length);
            this.shuffleOn();
            this.songs[this.current].plIcon = "images/player/play.png";
        }
        
        

    },

    enqueueSongs: function(songsList, shuffleMode) {
        if (this.songs) {
            //Combine lists

            offset = this.songs.length;
            for (var i = 0; i < songsList.length; i++) {

                //this.songs[i + offset] = songsList[i].clone();
                this.songs[i + offset] = songsList[i];
                this.songs[i + offset].index = i + offset + 1;
                this.songs[i + offset].i = i + offset;
            }

            //this.playback = this.getSequentialIntArray();

            if (shuffleMode || this.shuffle === true) {
                this.shuffleOn();
            }

            /*Mojo.Controller.getAppController().showBanner(songsList.length + " songs added to playlist", {
                source: 'notification'
            });
			*/
        }

    },
	
	reorderPlayList: function(songsList, currentId, shuffleMode) {
        if (this.songs) {
            
			var newSongs = [];

            var offset = 0;
            for (var i = 0; i < songsList.length; i++) {

                //newSongs[i + offset] = songsList[i].clone();
                newSongs[i + offset] = songsList[i];
                newSongs[i + offset].index = i + offset + 1;
                newSongs[i + offset].i = i + offset;
				
				if(songsList[i].id == currentId) this.current = i;
            }

            //this.playback = this.getSequentialIntArray();

            if (shuffleMode || this.shuffle === true) {
                this.shuffleOn();
            }

            /*Mojo.Controller.getAppController().showBanner(songsList.length + " songs added to playlist", {
                source: 'notification'
            });
			*/
			
			this.songs.length = 0;
			this.songs = newSongs.concat([]);
        }

    },

    removeSong: function(index) {
        
        var playlist = this.songs;
        playlist.splice(index, 1);

        for (var i = 0; i < playlist.length; i++) {
            playlist[i].index = i + 1;
            playlist[i].i = i;
        }
        //this.songs = playlist;
        //this.playback = this.getSequentialIntArray();

        if (index < this.current) {
            this.current--;
        }

        
        
        
        //if (this.shuffle === true) {
        //    this.shuffleOn();
        //}

        //this.NowPlayingUpdateSongInfo(this.currentPlayingTrack);
        //if(current === true)
        //{
        //    AmpacheMobile.audioPlayer.player = null;
        //    AmpacheMobile.audioPlayer.moveToPlayer(this.getCurrentSong());
        //    AmpacheMobile.audioPlayer.UIInvalidateSong(this.getCurrentSong());
        //}
        //AmpacheMobile.audioPlayer.bufferNextSong(this.getCurrentSong());
    },

    /********************************************/
    /**
    *  Function to be called in response to a reorder list mojo event.
    *
    *  \param mojo reorder list event
    *  \return 
    ***********************************************/
    reorder: function(event) {
        //var item = this.songs[event.fromIndex];
        var newCurrent = -1;
        this.songs.splice(event.toIndex, 0, this.songs.splice(event.fromIndex, 1)[0]);
        if (event.fromIndex === this.current) {
            newCurrent = event.toIndex;
        }
        
        
        if (event.fromIndex < event.toIndex) { //Dragging down list
            if ((event.fromIndex < this.current) && (event.toIndex >= this.current)) {
                this.current--;
            }

        } else { //Dragging up list
            if ((event.fromIndex > this.current) && (event.toIndex <= this.current)) {
                this.current++;
            }
        }

        for (var i = 0; i < this.songs.length; i++) {
            this.songs[i].index = i + 1;
        }

        if(newCurrent!== -1)
        {
            this.current = newCurrent;
        }

        //this.playback = this.getSequentialIntArray();
        //if(this.shuffle===true)
        //{
        //    this.shuffleOn();
        //}

        //this.NowPlayingUpdateSongInfo(this.currentPlayingTrack);
        //_updateBuffering();

    },

    shuffleOn: function() {

        //AmpacheMobile.webos.playSystemSound("shuffling_01");
        //Save the current song for the top of the list
        var currentSong = this.songs.splice(this.current, 1)[0];
        
        var to;
        var from;
        
        //Shuffle (the bigger the multiplier the more shuffle)
        for(var i =0; i<(this.songs.length*2);i++)
        {
            to = Math.floor(Math.random() * this.songs.length);
            from = Math.floor(Math.random() * this.songs.length);
            
            this.songs.splice(to, 0, this.songs.splice(from, 1)[0]);
        }
        
        this.songs.sort(this.randBool);
        
        //Put the current song on the top of the list
        this.songs.unshift(currentSong);
        
        //Reindex
        for(var j =0; j<this.songs.length;j++)
        {
            this.songs[j].index = j + 1;
        }
       
        
        this.current = 0;
        this.shuffle = true;

    },

    
    

    shuffleOff: function() {
        var song = this.songs[this.current];
        this.songs.sort(this.orderAdded);
        for (var i = 0; i < this.songs.length; i++) {
            this.songs[i].index = i + 1;
        }
        this.current = song.i;

        this.shuffle = false;
    },

    randBool: function() {
        return (Math.round(Math.random()) - 0.5);
    },

    orderAdded: function(a, b) {
        return a.i - b.i;
    },
    
    orderIndex: function(a, b) {
        return a.index - b.index;
    },

    /********************************************/
    /**
    *  Build an array of sequential intergers starting a 0
    *
    *  \return array of size songs array
    ***********************************************/
    getSequentialIntArray: function() {
        //Inititialize an array to randomize;
        var newList = [];
        for (var i = 0; i < this.songs.length; i++) {
            newList[i] = i;
        }
        return newList;
    },

    /********************************************/
    /**
    *  Returns the song object this.current is pointing to.
    *  
    *  \return null if there is no current song, song object if there is a current
    ***********************************************/
    getCurrentSong: function() {
        var song = null;
        if (this.current != null) {
            song = this.songs[this.current];
        }
        return song;
    },


    /********************************************/
    /**
    *  Checks if a given track is within the currently playing window
    *  
    *  \return True if
    ***********************************************/
    isInCurrentWindow:function(song,size)
    { 
        var window = this.getCurrentWindow(size);
        var isIn = false;
        for(var i =0; (i<window.length) && (isIn===false);i++)
        {
            if(song.index===window[i])
            {
                isIn=true;
            }
        }
        return isIn;
    },
    
    getCurrentWindow:function(size)
    {
        var winSize = size-1;
        var window = new Array();
        var song = this.getCurrentSong();
        window.push(song.index);
        while(winSize !== 0)
        {
            song = this.peekNextSong(song);
            if(song!==null)
            {
                window.push(song.index);
                winSize--;
            }
            else
            {
                winSize =0;
            }
        }
        return window;
    },


    /********************************************/
    /**
    *  Determines if we are pointing to the end of a playlist
    *  
    *  \return true if we are at the end
    ************************************************/
    atPlaylistEnd: function() {
        return ((this.current + 1) === this.songs.length) ? true: false;
    },

    /********************************************/
    /**
    *  Moves the current song pointer to the next based on current position and repeat mode.
    *
    *  \return true if has occured
    ***********************************************/
    moveCurrentToNext: function() {

         this.songs[this.current].plIcon = "images/player/blank.png";

        var moved = true;

        switch (this.repeat) {
        case RepeatModeType.repeat_song:
        case RepeatModeType.no_repeat:
            if ((this.current + 1) < this.songs.length) {
                this.current = this.current + 1;
            } else {
                moved = false;
            }
            break;
        case RepeatModeType.repeat_forever:
            this.current = (this.current + 1) % this.songs.length;
            break;
        }

        this.songs[this.current].plIcon = "images/player/play.png";

        return moved;
    },

    moveToSong: function(index) {
        this.songs[this.current].plIcon = "images/player/blank.png";
        var moved = false;
        if ((index >= 0) && (index < this.songs.length)) {
            this.current = index;
            moved = true;
        }
        this.songs[this.current].plIcon = "images/player/play.png";
        return moved;
    },

    /********************************************/
    /**
    *  Moves the current song pointer to the previous based on current position and repeat mode.
    *
    *  \return true if has occured
    ***********************************************/
    moveCurrentToPrevious: function() {

        var moved = true;
        this.songs[this.current].plIcon = "images/player/blank.png";
         
        
        switch (this.repeat) {
        case RepeatModeType.repeat_song:
        case RepeatModeType.no_repeat:
            if (this.current !== 0) {
            this.current = this.current - 1;
        } else {
                moved = false;
            }
            break;
        case RepeatModeType.repeat_forever:
            if(this.current === 0)
            {
                this.current = this.songs.length-1;
            }
            else
            {
                this.current = (this.current - 1) % this.songs.length;
            }
            break;
        }
        
        

        
        this.songs[this.current].plIcon = "images/player/play.png";
        
        return moved;
    },

    /********************************************/
    /**
    *  Given a song this will find the next song in the playback array
    *
    *  \returns Returns song is there is next song, null if not
    ***********************************************/
    peekNextSong: function(song) {
        if(song!==null)
        {
            searchIndex = song.index;
            nextSong = null;
    
			//console.log("peekNextSong song.title: "+song.title);
			//console.log("peekNextSong song: "+enyo.json.stringify(song));
			//console.log("this.repeat: "+this.repeat);
			//console.log("peekNextSong this.songs: "+enyo.json.stringify(this.songs));
			//console.log("peekNextSong this.songs.length: "+this.songs.length);
    
            switch (this.repeat) {
				case RepeatModeType.repeat_song:
				case RepeatModeType.no_repeat:
					if (searchIndex != this.songs.length) {
						return this.songs[searchIndex];
					} else {
						return null;
					}
					
					break;
				case RepeatModeType.repeat_forever:
					return this.songs[searchIndex % this.songs.length];
					break;
            }
        }

        
        return null;
    },

    /********************************************/
    /**
    *  Given a song this will find the song it will find the offset
    *
    *  \returns Returns song is there is next song, null if not
    ***********************************************/
    peekSongAheadOffset: function(song, offset) {

        for (var i = 0; i < offset && song !== null; i++) {
            song = this.peekNextSong(song);
        }
        return song;
    }

});