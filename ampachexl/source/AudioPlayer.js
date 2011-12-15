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

var STALL_RETRY_TIME = "20000";

var PLAYBACK_TIMERTICK = 300;
//var TCP_TIMEOUT = 120 * 1000; //in secs
var AudioType = {
    "pool": 0,
    "player": 1,
    "buffer": 2
};

AudioPlayer = Class.create({

    playList: null,

    hasPlayList: false,

    player: null,
    audioBuffers: null,
    bufferPool: null,

    displayBanners: false,
	
	mediaAudioClass: true,

    //buffer:null,
    streamingEvents: ["play", "playing", "pause", "error", "ended", "canplay", "emptied", "load", "loadstart", "waiting", "progress", "canplaythrough"],
	// "timeupdate", 
	
    //seeked seeking, "durationchange" "canplaythrough", "abort",  
    //bufferingEvents : ["abort", "error", "ended", "emptied", "load", "loadstart",
    //                   "waiting", "progress", "durationchange", "x-palm-disconnect"],
    initialize: function() {

        //this.blankSong = new SongModel(0, "", "", 0, "", 0, 0, 0, "", 0, "", "");
        //this.blankSong.index = 0;
        //Create 2 audio objects to toggle between streaming and buffering
        //this.audioBuffers = [];
        this.audioBuffers = [];//new Array();
        this.bufferPool = [];//new Array();
        this.numBuffers = 0;
    },

	setMediaAudioClass: function(inMediaAudioClass) {
		this.mediaAudioClass = inMediaAudioClass;
	},
    setNumBuffers: function(numBuffers) {
        this.stop();
        var buffDiff = numBuffers - this.numBuffers;

        var audioObj = null;
        if (buffDiff > 0) {
            for (var i = 0; i < buffDiff; i++) {
                audioObj = this.createAudioObj(i);
                audioObj.ampacheType = AudioType.pool;
                this.addStreamingListeners(audioObj);
                this.bufferPool.push(audioObj);
            }
        } else if (buffDiff < 0) {
            for (var j = 0; j < ( - 1 * buffDiff); j++) {
                this.bufferPool.pop(audioObj);
            }
        }
        this.numBuffers = numBuffers;
        
        this.tcpTimeout = (AmpacheXL.ApacheTimeout-10) *1000;
    },

    createAudioObj: function(index) {

        var audioObj = new Audio();
        audioObj.hasAmpacheStreamEvents = false;
        audioObj.hasAmpacheBufferEvents = false;
        audioObj.fullyBuffered = false;
        //audioObj.startedBuffering = false;
        //audioObj.amtBuffered = null;
        audioObj.tcpActivity = 0;
        audioObj.name = "Buffer " + index;
        //audioObj.song = this.blankSong;
        this.setAudioToBuffer(audioObj);

        if(this.mediaAudioClass) audioObj.setAttribute("x-palm-media-audio-class", "media");

        audioObj.isSong = function(song) {
            return (audioObj.song === song) ? true: false;
        };

        return audioObj;
    },

    sortBuffers: function(a, b) {

        return a.song.index - b.song.index;
    },

    getAudioBuffer: function(songIndex) {
        for (var i = 0; i < this.audioBuffers.length; i++) {
            if (this.audioBuffers[i].song.index === songIndex) {
                return this.audioBuffers[i];

            }
        }
        return null;
    },

    findActiveBuffer: function() {
        for (var i = 0; i < this.audioBuffers.length; i++) {
            //if((this.audioBuffers[i].fullyBuffered === false) && (this.audioBuffers[i].startedBuffering===true))
            if (this.audioBuffers[i].fullyBuffered === false) {
                return this.audioBuffers[i];
            }
        }
        return null;
    },

    getBufferedSong: function(song) {
        for (var i = 0; i < this.audioBuffers.length; i++) {
            //if((this.audioBuffers[i].isSong(song) === true) && (this.audioBuffers[i].startedBuffering===true))
            //if((this.audioBuffers[i].isSong(song) === true) && (this.audioBuffers[i].networkState===this.audioBuffers[i].NETWORK_LOADING))
            if (this.audioBuffers[i].isSong(song) === true) {
                return this.audioBuffers[i];
            }

        }
        return null;
    },

    recoverStalledBuffers: function() {
        this.bufferMutex = true;
        var recoveredBuffs = false;
        //var tempArray = new Array();
        for (var i = 0; i < this.audioBuffers.length; i++) {
            if ((this.audioBuffers[i].fullyBuffered === false) && (this.audioBuffers[i] !== this.player)) {
                this.putThisBufferIntoPool(this.popThisBuffer(this.audioBuffers[i]));
                i = -1;
                recoveredBuffs = true;
            }

        }
        
        this.bufferMutex = false;
        return recoveredBuffs;
    },

    rebufferSong: function(audioObj) {
        audioObj.src = "media/empty.mp3";
        audioObj.load();
        audioObj.autoplay = false;

        audioObj.src = audioObj.song.url;
        audioObj.fullyBuffered = false;
        audioObj.song.amtBuffered = 0;
        audioObj.load();
        audioObj.autoplay = true;

        this.UIInvalidateSong(audioObj.song);
    },

    recoverFromAudioServiceFailure: function(message) {
        //AmpacheMobile.webos.playSystemSound("error_01");
        
        this.player.stallTime = this.player.currentTime;
        
        this.timePercentage = 0;
        this.player.fullyBuffered = false;
        this.recoverBufferMemory();
        this.rebufferSong(this.player);
        this.player.autoplay = false;
        
        
        
        //Mojo.Controller.getAppController().playSoundNotification("error_01", "", 1);
        
        /*Mojo.Controller.getAppController().showBanner(message, {
            source: 'notification'
        });
		*/
		this.mainHandler.doBannerMessage(message);
        
        this.UIStopPlaybackTimer();
        
    },

    recoverBufferMemory: function() {
        this.bufferMutex = true;
        //var tempArray = new Array();
        var i =0;
        while (i < this.audioBuffers.length) {

            if (this.audioBuffers[i] != this.player) {
                //Mojo.Controller.getAppController().showBanner("Recovering " + this.audioBuffers[i].song.title, 
                //    source: 'notification'
                //);
                this.putThisBufferIntoPool(this.popThisBuffer(this.audioBuffers[i]));
                i = 0;
            } else {
                i++;
            }
			
        }

        this.bufferMutex = false;
    },

    popThisBuffer: function(buffer) {
        this.bufferMutex = true;
        for (var i = 0; i < this.audioBuffers.length; i++) {
            if (this.audioBuffers[i] === buffer) {
                this.audioBuffers.splice(i, 1);
                this.audioBuffers.sort(this.sortBuffers);
                this.bufferMutex = false;
                return buffer;
            }
        }
        this.bufferMutex = false;
        return null;
    },

    putThisBufferIntoPool: function(buffer) {
        if (buffer !== null) {
            buffer.ampacheType = AudioType.pool;
            buffer.src = "media/empty.mp3";
            buffer.song.plIcon = "images/player/blank.png";
            buffer.load();
            buffer.autoplay = false;
            buffer.fullyBuffered = false;
            buffer.song.amtBuffered = 0;
            this.UIInvalidateSong(buffer.song);
            buffer.song = null;
            this.bufferPool.push(buffer);
        }
    },

    loadSongIntoPlayer: function(player, song, autoplay) {
        player.ampacheType = AudioType.player;
        //player.pause();
        //player.empty();
        player.song.plIcon = "images/player/blank.png";

        player.song.amtBuffered = 0;
        this.UIInvalidateSong(player.song);
        player.src = song.url;
        player.song = song;
        player.fullyBuffered = false;
        //player.startedBuffering=false;
        player.song.amtBuffered = 0;
        player.song.plIcon = "images/player/play.png";
        this.UIInvalidateSong(player.song);
        player.load();
        player.audioplay = autoplay;
        this.UIShowSpinner(true);
        return player;
    },

    isWindowFilled:function() {
        var i = 0;
        var retVal = true;
        var window = this.playList.getCurrentWindow(this.numBuffers);
        if(this.audioBuffers.length!==window.length)
        {
            return false;
        }
        
        while ((i < this.audioBuffers.length)&& (retVal === true)) {
            if(this.playList.isInCurrentWindow(this.audioBuffers[i].song, this.numBuffers) ===true)
            {
                if(this.audioBuffers[i].fullyBuffered ===false)
                {
                    retVal = false;
                }
            }
            else
            {
                retVal = false;
            }
            i++;
        }
        return retVal;
    },

    removeBuffersOutsideWindow: function() {
        this.bufferMutex = true;
        var i = 0;

        while (i < this.audioBuffers.length) {

            if (this.playList.isInCurrentWindow(this.audioBuffers[i].song, this.numBuffers) === false) {
                //Mojo.Controller.getAppController().showBanner("Recovering " + this.audioBuffers[i].song.title, 
                //    source: 'notification'
                //);
                this.putThisBufferIntoPool(this.popThisBuffer(this.audioBuffers[i]));
                i = 0;
            } else {
                i++;
            }
        }
        this.bufferMutex = false;
    },

    findOneBufferOutsideWindow: function() {
        this.bufferMutex = true;
        
        for(var i = 0;(i<this.audioBuffers.length);i++) {

            if (this.playList.isInCurrentWindow(this.audioBuffers[i].song, this.numBuffers) === false) {
                this.bufferMutex = false;
                return this.popThisBuffer(this.audioBuffers[i]);
            }
        }
        this.bufferMutex = false;
        return null;
    },

    bufferMutex: false,
    waitForBufferMutex: function() {
        if (this.bufferMutex === true) {
            Mojo.Controller.errorDialog("Buffer Mutex: " + this.bufferMutex);
			this.mainHandler.doBannerMessage("Buffer Mutex: " + this.bufferMutex);
        }
        while (this.bufferMutex === true) {

		}

    },


    reloadPlaylist:function() {
        this.stop();
        this.playList.current = 0;
        var player = this.bufferPool.pop();
        player.song = this.playList.songs[0];
        
        player.ampacheType = AudioType.player;
        player.song.amtBuffered = 0;
        player.src = player.song.url;
        
        player.fullyBuffered = false;
        //player.startedBuffering=false;
        player.song.amtBuffered = 0;
        player.load();
        player.autoplay = false;
        player.song.plIcon = "images/player/play.png";
        this.UIInvalidateSong(player.song);
        
        this.audioBuffers.push(player);
        this.player=player;
    
    },


    moveToPlayer: function(song, autoplay) {
	
		var player = null;
        //var playerIndex =0;
        var reverse = false;

        var autoPlay = true;
        if(autoplay)
        {
            autoPlay = autoplay;
        }
        
        this.ticksUnchanged = 0;
        
        

        this.stopBufferRecovery();

        //this.waitForBufferMutex();
        this.bufferMutex = true;

        
        
        
        //Cleanup old player
        if (this.player) {
            if(this.player.song)
            {
                var direction = song.index - this.player.song.index;
                if (direction < 0) {
                    reverse = true;
                }
            }
            this.setAudioToBuffer(this.player);
            if(this.player.stallTime){
                this.player.stallTime = null;
            }
        }

        //first check if we've already buffered the song
        player = this.getBufferedSong(song);

        if (player === null) { //Song no currently in a buffer
            //Check if there is another active buffer we can use
            player = this.findActiveBuffer();

            //If no active buffer, next check the buffer pool for a free buffer
            if ((player === null) && (this.bufferPool.length !== 0)) {
                player = this.bufferPool.pop();
                player.song = song;
                this.audioBuffers.push(player);
            }

            //Player Requires load
            if (player !== null) {
                player = this.loadSongIntoPlayer(player, song, autoPlay);
            }
        } else {
            //Song already buffered
            var timeSinceTCP = this.getCurrentMsSecs() - player.tcpActivity;
            if ((timeSinceTCP > this.tcpTimeout) && (player.fullyBuffered === false)) { //Socket Timed Out
                this.rebufferSong(player);
            } else {
                if(player.song.amtBuffered === 0)
                {
                    player.autoplay = true;
                }
                else
                {
                    player.play();
                }
            }


        }

        //at this point no active, pooled or buffered
        if (player === null) {
            this.audioBuffers.sort(this.sortBuffers);
            if (reverse === true) {
                this.audioBuffers.reverse();
            }
            player = this.audioBuffers.shift();
            this.audioBuffers.push(player);
            player = this.loadSongIntoPlayer(player, song, autoPlay);
        }

        this.audioBuffers.sort(this.sortBuffers);
        this.player = player;
        this.setAudioToPlayer(this.player);
        this.UIInvalidateSong(this.player.song);

		/*
        if(((AmpacheMobile.focus === false) || this.UIHandler===null) && (AmpacheMobile.webos.displayOff === false) && (this.displayBanners===true) && (AmpacheMobile.dashBoardDisplayed===false))
        {
            Mojo.Controller.getAppController().showBanner(this.player.song.title + ": " + this.player.song.artist, {
                    source: 'notification'
                });
        }
		*/


        this.startBufferRecovery();
        this.bufferNextSong(this.player.song);
        //this.removeBuffersOutsideWindow();
        //this.UIInvalidateSong(player.song);
        //redraw UI to reflect changes
        //for(var i=0; i<oldTracks.length; i++) 
        //{
        //    this.UIInvalidateSong(oldTracks[i]);            
        //}
        //redraw UI to reflect changes
        //for(var i=0; i<this.audioBuffers.length; i++) 
        //{
        //    this.UIInvalidateSong(this.audioBuffers[i]);   
        //}
        this.UIUpdateSongInfo(this.player.song);
        this.bufferMutex = false;
    },

    bufferNextSong: function(lastSongLoaded) {
		//console.log("bufferNextSong: "+enyo.json.stringify(lastSongLoaded));
        //Check if the song is alreay in an object
        //this.waitForBufferMutex();
        this.bufferMutex = true;

        var song = this.playList.peekNextSong(lastSongLoaded);
        var index = 0;
		
		//console.log("bufferNextSong song: "+enyo.json.stringify(song));
        
		//buffering new seems to pause current when using media audio class
        if ((false)&&(song !== null)&&((this.player.fullyBuffered === true)||(this.player.song.amtBuffered >= 100))) {
            //console.log("trying to buffer next song: "+enyo.json.stringify(song));
			
            var buffered = false;
            var buffer = null;
            //Is Song Already Buffered
            buffer = this.getBufferedSong(song);

            if (buffer !== null) {
                //console.log("already buffered; buffer !== null");
				
				buffered = true;

                //Check if we have enough data to seek
                if (buffer.readyState > buffer.HAVE_NOTHING) {
                    //buffer.currentTime = 0;
                } else { //Attempt to reload the buffer if we have no data
                    buffer.fullyBuffered = false;
                    //buffer.startedBuffering = false;
                    buffer.song.amtBuffered = 0;
                    this.UISetBufferWait(song, true);
                    buffer.load();
                    buffer.autoplay = false;
                }

            }

            if (buffered === false) {
                //console.log("buffered === false");
				
                if (this.bufferPool.length !== 0) {
					console.log("this.bufferPool.length !== 0");
                    buffer = this.bufferPool.pop();
                    buffer.song = song;
                    this.audioBuffers.push(buffer);
                    this.setAudioToBuffer(buffer);
                    buffer.song.amtBuffered = 0;
                    this.UIInvalidateSong(buffer.song);
                    buffer.src = song.url;
                    buffer.song = song;
                    buffer.fullyBuffered = false;
                    //buffer.startedBuffering = false;
                    buffer.song.amtBuffered = 0;
                    //this.UIInvalidateSong(buffer.song);
                    this.UISetBufferWait(song, true);
                    buffer.load();
                    buffer.autoplay = false;
                    buffered = true;
                    this.audioBuffers.sort(this.sortBuffers);
                } else {
                    //this.audioBuffers.sort(this.sortBuffers);
                    buffer = this.findOneBufferOutsideWindow();
                    
                    //if (this.audioBuffers[0] !== this.player)  //If the top buffer is not the the player take it and use it to buffer up the next song
                    //    buffer = this.audioBuffers.shift();
                    // else 
                    //    var bottomSong = this.playList.peekSongAheadOffset(this.player.song, this.audioBuffers.length - 1);
                    //    if (song.index <= bottomSong.index) {
                    //        buffer = this.audioBuffers.pop();
                    //    
                    //

                    if (buffer !== null) { //if this is set we have decided that we are going to buffer the next song
                        //if (buffer.song) this.UIInvalidateSong(buffer.song);
                        //
                        //buffer.pause();
                        //
                        buffer.song.amtBuffered = 0;
                        this.UIInvalidateSong(buffer.song);
                        buffer.src = song.url;
                        buffer.song = song;
                        buffer.fullyBuffered = false;
                        //buffer.startedBuffering = false;
                        buffer.song.amtBuffered = 0;
                        //this.UIInvalidateSong(buffer.song);
                        this.UISetBufferWait(song, true);
                        buffer.load();
                        buffer.autoplay = false;

                        this.audioBuffers.push(buffer);
                        this.audioBuffers.sort(this.sortBuffers);

                    }
                }

            } else {
                if ((buffer.fullyBuffered === true) && this.isWindowFilled()===false) {
                    this.bufferMutex = false;
                    this.bufferNextSong(song);
                }
            }
			
        } 
        this.bufferMutex = false;
    },

    recoverFromSleep: function() {
        var onString = "";
        //var emptied = (this.audioBuffers.length!==0);
        for (var i = 0; i < this.audioBuffers.length; i++) {
            onString += "<BR>Buffer: " + i;
            onString += "<BR>readyState:" + this.audioBuffers[i].readyState;
            onString += "<BR>networkState:" + this.audioBuffers[i].networkState;
            onString += "<BR>Connected:" + this.audioBuffers[i].mojo.connected;

            //if(this.audioBuffers[i].readyState !== this.audioBuffers[i].HAVE_NOTHING)
            //
            //    //emptied = false;
            //
        }
        return onString;

        //if(emptied === true)
        //{
        //     //Capture Old buffers
        //    var oldTracks = []
        //    for(var i=0; i<this.audioBuffers.length; i++) 
        //    {
        //        oldTracks[i] = this.audioBuffers[i].song;
        //    }
        //    this.stop();
        //     //redraw UI to reflect changes
        //    for(var i=0; i<oldTracks.length; i++) 
        //    {
        //        this.UIInvalidateSong(oldTracks[i]);            
        //    }
        //    this.moveToPlayer(this.playList.getCurrentSong());
        //}
        //return emptied;
    },

    addStreamingListeners: function(audioObj) {
        var eventHandler = this.handleAudioEvents.bindAsEventListener(this);
        for (var i = 0; i < this.streamingEvents.length; i++) {

            audioObj.addEventListener(this.streamingEvents[i], eventHandler);
        }
        audioObj.hasAmpacheStreamEvents = true;
    },

    setAudioToPlayer: function(audioObj) {
		audioObj.ampacheType = AudioType.player;
        audioObj.autoplay = true;
        if (audioObj.readyState > audioObj.HAVE_NOTHING) {
            this._seek(0);
        }
    },

    setAudioToBuffer: function(audioObj) {
        audioObj.ampacheType = AudioType.buffer;
        audioObj.autoplay = false;

        //audioObj.pause();
    },

    /***********************************************************************/
    /*
    * Playlist Functions
    *
    ***************************************************************************/
    newPlayList: function(newPlayList, _shuffleOn, _startIndex) {

        this.displayBanners = false;
        this.stop();
        this.player = null;
        this.playList = new PlayList(newPlayList, _shuffleOn, 0, _startIndex);
        //Setup Player for new playlist
        this.moveToPlayer(this.playList.getCurrentSong());
        this.hasPlayList = true;
    },

    enqueuePlayList: function(newPlayList, _shuffleOn) {
        if (this.playList) {
            this.playList.enqueueSongs(newPlayList, _shuffleOn);
            this.bufferNextSong(this.player.song);
        }
    },

    reorderPlayList: function(newPlayList, currentSong, currentId, _shuffleOn) {
        if (this.playList) {
            this.playList.reorderPlayList(newPlayList, currentId, _shuffleOn);
            this.bufferNextSong(currentSong);
        }
    },
	
	getPlaylist: function() {
		if((this.playList)&&(this.playList.songs)) {
			return this.playList.songs;
		} else {
			return [];
		}
	},


    removeSong:function(index) {
        var current = false;
        var current = false;
        if(index === this.playList.current)
        {
            current = true;
            this.next(false);
        }
        
        
        var buffer = this.getBufferedSong(this.playList.songs[index]);
        if(buffer !== null)
        {
            this.putThisBufferIntoPool(this.popThisBuffer(buffer));
        }

        
        this.playList.removeSong(index);
        this.bufferNextSong(this.player.song);
        this.UIInvalidateSong(this.playList.songs[index]);
    },

    /********************************************/
    /**
    *  Function to be called in response to a reorder list mojo event.
    *
    *  \param mojo reorder list event
    *  \return 
    ***********************************************/
    reorder: function(event) {
        this.playList.reorder(event);
        //this.removeBuffersOutsideWindow();
        //this.bufferNextSong(this.player.song);
    },

    /***********************************************************************/
    /*
    * External Playback controls
    *
    ***************************************************************************/
    play: function() {
		if (this.bufferMutex === false) {
            var timeSinceTCP = this.getCurrentMsSecs() - this.player.tcpActivity;
            if ((this.player.fullyBuffered === false) && (timeSinceTCP > this.tcpTimeout)) { //Socket Timed Out
				// Mojo.Controller.getAppController().showBanner("Buffer Timeout, Restarting", {
                //    source: 'notification'
                //});
                this.rebufferSong(this.player);
            } else {
                this.player.play();
            }

        }
    },

    stop: function() {
        var buffer;
        this.UIStopPlaybackTimer();
        this.stopBufferRecovery();
        while (this.audioBuffers.length !== 0) {
            buffer = this.audioBuffers.pop();
            this.putThisBufferIntoPool(buffer);
        }
        this.player = null;
        
    },

    pause: function() {
        if ((this.bufferMutex === false) && this.player) {
            this.player.pause();
            this.UIStopPlaybackTimer();
        }
    },

    next: function(clicked) {
        if (this.bufferMutex === false) {
            this.stopBufferRecovery();
            this.ampachePaused = this.player.paused;
            this.ticksUnchanged = 0;

            //this.UISetPointer(this.playList.getCurrentSong(), false);
            if (this.player && this.playList.moveCurrentToNext() === true) {

                //this.UISetPointer(this.playList.getCurrentSong(), true);
                if(!this.play_change_interval){
                    this.pause();
                    this._seek(0);
                    this.player.ampacheType = AudioType.buffer;
                    this.timePercentage = 0;
                    this.UIUpdatePlaybackTime();
                }
                this.UIUpdateSongInfo(this.playList.getCurrentSong());
                
                if (clicked) {
                    this.kill_play_change_interval();
                    this.play_change_interval = setInterval(this.do_play.bind(this), 200);
                } else {
                    this.do_play();
                }

            } else { //playlist complete
                this.playListFinished = true;
                
                if(clicked === false)
                {
                   //this.reloadPlaylist();
                    
                    //this.moveToPlayer(this.playList.getCurrentSong(), false);
                    this.pause();
                    this.stopBufferRecovery();
                    this.seek(0);
                    this.UIUpdatePlaybackTime();
                }
            }

        }
    },

    previous: function(clicked) {
        if (this.bufferMutex === false) {
            this.stopBufferRecovery();
            this.ampachePaused = this.player.paused;
            this.ticksUnchanged = 0;

            if (this.player && this.playList.moveCurrentToPrevious() === true) {
                
                if(!this.play_change_interval){
                    this.pause();
                    this._seek(0);
                    this.player.ampacheType = AudioType.buffer;
                    
                    this.timePercentage = 0;
                    this.UIUpdatePlaybackTime();
                }
                this.UIUpdateSongInfo(this.playList.getCurrentSong());
               
               
                if (clicked) {
                    this.kill_play_change_interval();
                    this.play_change_interval = setInterval(this.do_play.bind(this), 200);
                } else {
                    this.do_play();
                }

            }
        }
    },


    playTrack: function(index) {
        if (this.bufferMutex === false) {
            
            var current = this.playList.current;
            if (this.playList.moveToSong(index) === true) {
                
                if((current === this.playList.current) && (this.timePercentage !== 0) && (this.player.paused===true))
                {
                    this.play();
                }
                else
                {
                
                    if(this.player && !this.play_change_interval){
                        this.pause();
                        this._seek(0);
                        this.player.ampacheType = AudioType.buffer;
                        this.timePercentage = 0;
                        this.ticksUnchanged = 0;
                        this.UIUpdatePlaybackTime();
                    }
                    
                    
                    this.UIUpdateSongInfo(this.playList.getCurrentSong());
                    
                    
                    this.kill_play_change_interval();
                    this.play_change_interval = setInterval(this.do_play.bind(this), 200);
                }
            }
        }
    },


    do_play: function() {
        
        this.kill_play_change_interval();
        this.timePercentage = 0;
        
        var nextSong = this.playList.getCurrentSong();
        this.moveToPlayer(nextSong);
        
        //If the current song is already fully buffered then buffer the next
        this.bufferNextSong(this.player.song);
        
    },

    play_change_interval: null,

    kill_play_change_interval: function() {
        if (this.play_change_interval) {
            clearInterval(this.play_change_interval);
            this.play_change_interval = null;
        }
    },



    //Buffer Recovery Worker
    runBufferRecoveryWorker: function() {
        this.stopBufferRecovery();
        this.removeBuffersOutsideWindow();
        this.bufferNextSong(this.player.song);
        for (var i = 0; i < this.audioBuffers.length; i++) {

            var player = this.audioBuffers[i];
            if (player !== this.player) {
                var timeSinceTCP = this.getCurrentMsSecs() - player.tcpActivity;
                if ((timeSinceTCP > this.tcpTimeout) && (player.fullyBuffered === false)) { //Socket Timed Out
                    //Mojo.Controller.getAppController().showBanner("Buffer Timeout, Restarting", {
                    //    source: 'notification'
                    //});
                    player.src = "media/empty.mp3";
                    player.load();
                    player.autoplay = false;

                    player.src = player.song.url;
                    player.fullyBuffered = false;
                    player.song.amtBuffered = 0;
                    player.load();
                    player.autoplay = false;

                    this.UIInvalidateSong(player.song);
                }
            }
        }
        this.startBufferRecovery();
    },

    stopBufferRecovery: function() {
        if (this.buffer_recovery_interval) {
            clearInterval(this.buffer_recovery_interval);
            this.buffer_recovery_interval = null;
        }
    },

    startBufferRecovery: function() {
        if (!this.buffer_recovery_interval) {
            this.buffer_recovery_interval = setInterval(this.runBufferRecoveryWorker.bind(this), 10000);
        }
    },

    seek: function(seekTime) {
        if (this.player && (seekTime < this.player.duration)) {
            if (seekTime >= 0) {
                this._seek(seekTime);
            } else {
                this._seek(0);
            }
        } else {
            this._seek(this.player.duration - 1);
        }
    },

    jump: function(seconds) {
        this.seek(this.player.currentTime + seconds);
    },

    seekPercentage: function(percent) {
        var secs = this.player.currentTime;
        var duration = this.player.duration;
        if ((duration) && (duration !== 0)) {
            var secs = Math.round(percent * duration);
        }

        this.seek(secs);

    },

    /***********************************************************************/
    /*
    * Internal Playback controls and user feedback
    *
    ***************************************************************************/
    _seek: function(seekTime) {
        if (this.player && (this.player.readyState > this.player.HAVE_NOTHING)) {
            var timeDiff = seekTime - this.player.currentTime;
            if (timeDiff < 0) { //Make difference positive
                timeDiff = timeDiff * -1;
            }

            if (timeDiff > 1) { //only seek if the diff is greater than 1 secs
                this.player.currentTime = seekTime;

                if (this.player.paused) {
                    this.UIUpdatePlaybackTime();
                }
            }
        }
    },

    logAudioEvent: function(source, event) {
        console.log(source + " AudioEvent: " + event.type+", Player " + event.currentTarget.name+", Song: " + event.currentTarget.song.title);
    },

    handleAudioEvents: function(event) {
        if (event.currentTarget.ampacheType === AudioType.buffer) {
            this.handleBufferEvents(event);
        } else if (event.currentTarget.ampacheType === AudioType.player) {
            this.handlePlayerEvents(event);
        } else {
            this.UIPrintDebug(event, false);
        }
    },

    getCurrentMsSecs: function() {
        var time = new Date();
        return time.getTime();
    },

    handleBufferEvents: function(event) {
        //console.log("------> AudioPlayer.prototype.handleBufferEvents AudioEvent:", event.type);
        //this.logAudioEvent("handleBufferEvents", event);
        event.stop();
        event.stopPropagation();

        switch (event.type) {
        case "error":
            //Received error buffer is no longer valid throw it away and resort the available buffer stack
            this.recoverStalledBuffers();
            //Mojo.Controller.errorDialog("Buffering Error");
            //this.mainHandler.doBannerMessage("Buffering Error");

            break;
        case "loadstart":
            //event.currentTarget.startedBuffering = true;
            event.currentTarget.tcpActivity = this.getCurrentMsSecs();
            break;

        case "load":
            event.currentTarget.tcpActivity = this.getCurrentMsSecs();
            this.bufferingFinished(event.currentTarget);
            this.UISetBufferWait(event.currentTarget.song, false);
            this.bufferNextSong(event.currentTarget.song);

            break;
        case "progress":
            event.currentTarget.tcpActivity = this.getCurrentMsSecs();
            
           
            //Downloading a song above the current in the list so lets pop that off
            //if (event.currentTarget.song.index < this.player.song.index) {
            if(this.playList.isInCurrentWindow(event.currentTarget.song, this.numBuffers) ===false)
            {
                this.putThisBufferIntoPool(this.popThisBuffer(event.currentTarget));
            }
            else
            {
                this.updateBuffering(event.currentTarget);
                if (event.currentTarget.song.amtBuffered !== 0) {
                    this.UISetBufferWait(event.currentTarget.song, false);
                }
            }
            break;

        case "emptied":
            event.currentTarget.fullyBuffered = false;
            //event.currentTarget.startedBuffering = false;
            this.updateBuffering(event.currentTarget);
            break;
        case "error":
            var errorString = this.streamErrorCodeLookup(event);
            this.UIDisplayError(errorString, event.currentTarget.song);
            break;

        }
        this.UIPrintDebug(event, false);
        //console.log("<------ AudioPlayer.prototype.handleBufferEvents AudioEvent:", event.type);
    },

    handlePlayerEvents: function(event) {
        //console.log("------> AudioPlayer.prototype.handleAudioEvents AudioEvent:", event.type);
        //this.logAudioEvent("handleAudioEvents", event);

        event.stop();
        event.stopPropagation();

        switch (event.type) {

        case "load":
            event.currentTarget.tcpActivity = this.getCurrentMsSecs();
            this.UIShowSpinner(false);
            this.bufferingFinished(event.currentTarget);
            this.bufferNextSong(this.player.song);
            break;
        case "loadstart":
            event.currentTarget.tcpActivity = this.getCurrentMsSecs();
            this.UIShowSpinner(true);
            //event.currentTarget.startedBuffering = true;
            break;
        case "progress":
            event.currentTarget.tcpActivity = this.getCurrentMsSecs();

            if (event.currentTarget.fullyBuffered === true) {
                event.currentTarget.fullyBuffered = false;
                event.currentTarget.song.amtBuffered = 0;
                this.recoverBufferMemory();
                this.ticksUnchanged = 0;
                /*Mojo.Controller.getAppController().showBanner("Buffers Lost, Recovering", {
                    source: 'notification'
                });
				*/
				this.mainHandler.doBannerMessage("Buffers Lost, Recovering");
            } 
            

            this.updateBuffering(event.currentTarget);
            if (event.currentTarget.song.amtBuffered !== 0) {
                this.UIShowSpinner(false);
            }
            break;
        case "ended":
			this.playbackHandler.endedEvent(this.player.song);
			
            this.UIShowSpinner(false);
            this.UIStopPlaybackTimer();
            if (this.playList.repeat === RepeatModeType.repeat_song) {
                this.playTrack(this.playList.current);
            } else {
                this.next(false);
            }

            break;
            //case "durationchange":
            //   this.UIUpdatePlaybackTime();
            //   break;
        case "canplaythrough":
            if(this.player.stallTime)
            {
                this.player.currentTime = this.player.stallTime;
                this.player.stallTime = null;
                this.player.play();
            }
            break;
        
        
        case "timeupdate":
			//use UIUpdatePlaybackTime instead
            this.ticksUnchanged = 0;
			if (this.playbackHandler) this.playbackHandler.timeupdateEvent(this.player.currentTime);
            break;
        case "playing":
            this.ticksUnchanged = 0;
			this.player.song.time = this.player.duration;
			this.playbackHandler.playingEvent(this.player.song);
            this.UIStartPlaybackTimer();
            break;
        case "play":
            if (event.currentTarget.song.amtBuffered !== 0) {
                this.UIShowPause();
            }
            //this.UIUpdatePlaybackTime();
            //this.UIStartPlaybackTimer();
            break;
        case "pause":
            this.UIShowPlay();
            this.UIStopPlaybackTimer();
			this.playbackHandler.pauseEvent();
            break;
        case "waiting":
        case "stalled":
            this.UIShowSpinner(true);
			console.log("------> AudioPlayer.prototype.handleAudioEvents AudioEvent:", event.type);
            break;
        case "emptied":
            event.currentTarget.fullyBuffered = false;
            //event.currentTarget.startedBuffering = false;
            this.updateBuffering(event.currentTarget);
            break;
        case "error":
			console.log("------> AudioPlayer.prototype.handleAudioEvents AudioEvent:", event.type);
            var errorString = this.streamErrorCodeLookup(event);
            this.UIDisplayError(errorString, event.currentTarget.song);
            
            this.putThisBufferIntoPool(this.popThisBuffer(this.player));
            this.player = null;
            
            break;
        }
        this.UIPrintDebug(event, true);
    },

    MEDIA_ERR_SRC_NOT_SUPPORTED: 4,

    streamErrorCodeLookup: function(event) {

        //refrence: http://dev.w3.org/html5/spc/Overview.html#dom-mediaerror-media_err_network
        // http://developer.palm.com/index.php?option=com_content&view=article&id=1539
        var error = event.currentTarget.error;
        var errorString = "Unknown Error";

        if (error.code === error.MEDIA_ERR_ABORTED) {
            errorString = "The audio stream was aborted by WebOS. Most often this happens when you do not have a fast enough connection to support an audio stream.";
            errorString += this.moreErrorInfo("MEDIA_ERR_ABORTED", event);
        } else if (error.code === error.MEDIA_ERR_NETWORK) {
            errorString = "A network error has occured. The network cannot support an audio stream at this time.";
            errorString += this.moreErrorInfo("MEDIA_ERR_NETWORK", event);
        } else if (error.code === error.MEDIA_ERR_DECODE) {
            errorString = "An error has occurred while attempting to play the file. The file is either corrupt or an unsupported format (ex: m4p, ogg, flac).  Transcoding may be required to play this file.";
            errorString += this.moreErrorInfo("MEDIA_ERR_DECODE", event);
        } else if (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED) {

            errorString = "The file is not suitable for streaming";
            errorString += this.moreErrorInfo("MEDIA_ERR_SRC_NOT_SUPPORTED", event);
        } else {
            errorString = "ErrorCode: " + errorCode;
            errorString += this.moreErrorInfo("", event);
        }

        return errorString;
    },

    moreErrorInfo: function(type, event) {
        var player = event.currentTarget;
        var moreInfo = "<br><br><font style='{font-size:smaller;}'><b>Debug Info:</b>";
        if (type) {
            moreInfo += "<br>Error Type: " + type;
        }

        if (player.mojo) {
            var errorClass = player.mojo.getErrorClass();
            var errorCode = player.mojo.getErrorCode();
            //var errorValue = player.mojo.getErrorValue();
            //var errorDetails = player.mojo.getErrorValue;
            //console.log("Error Details: %j", errorDetails);
            //var errorClassString = "Unknown: (0x" + errorClass.toString(16).toUpperCase() + ")";
            var errorCodeString = "Unknown: (0x" + errorCode.toString(16).toUpperCase() + ")";
            //switch (errorClass) {
            //case 0x50501:
            //    errorClassString = "DecodeError(0x50501)";
            //    break;
            //case 0x50502:
            //    errorClassString = "NetworkError(0x50502)";
            //    break;
            //}
            switch (Number(errorCode)) {
            case 1:
                errorCodeString = "DecodeErrorFileNotFound(1)";
                break;
            case 2:
                errorCodeString = "DecodeErrorBadParam(2)";
                break;
            case 3:
                errorCodeString = "DecodeErrorPipeline(3)";
                break;
            case 4:
                errorCodeString = "DecodeErrorUnsupported(4)";
                break;
            case 5:
                errorCodeString = "DecodeErrorNoMemory(5)";
                break;
            case 6:
                errorCodeString = "NetworkErrorHttp(6)";
                break;
            case 7:
                errorCodeString = "NetworkErrorRtsp(7)";
                break;
            case 8:
                errorCodeString = "NetworkErrorMobi(8)";
                break;
            case 9:
                errorCodeString = "NetworkErrorOther(9)";
                break;
            case 12:
                errorCodeString = "NetworkErrorPowerDown(12)";
                break;
            }
            //moreInfo += "<br>Class: " + errorClassString;
            //moreInfo += "<br>Code: " + errorCodeString;
            //moreInfo += "<br>Value: 0x" + errorValue;//.toString(16).toUpperCase();
        }
        moreInfo += "<br>Mime: " + player.song.mime;
        moreInfo += "<br>Song Link: <a href=" + player.song.url + ">Stream Link</a></font>";
        return moreInfo;
    },

    UIDisplayError: function(message, song) {

        this.errorSong = song;
        this.streamingError(message, null);

    },

    onStreamingErrorDismiss: function(value) {
        console.log("--> onErrorDialogDismiss value: " + value);
        switch (value) {
        case "retry":
            break;
        case "palm-attempt":
            /*
			var controller = Mojo.Controller.getAppController().getFocusedStageController().topScene();
            controller.serviceRequest('palm://com.palm.applicationManager', {
                method: 'open',
                parameters: {
                    target: this.errorSong.url
                }
                
                 onSuccess: function(status){
                 $('area-to-update').update(Object.toJSON(status));
                 },
                 onFailure: function(status){
                 $('area-to-update').update(Object.toJSON(status));
                 },
                 onComplete: function(){
                 this.getButton = myassistant.controller.get('LaunchAudioButton');
                 this.getButton.mojo.deactivate();
                 }
            });
			*/
            break;
        }
        this.errorSong = null;
        console.log("<-- onErrorDialogDismiss");
    },

    streamingError: function(errorText, song) {
        //this.errorSong = song;
        this.mainHandler.doBannerMessage("Stream error: "+errorText, true);
		/*
		var controller = Mojo.Controller.getAppController().getFocusedStageController().topScene();
        controller.showAlertDialog({
            onChoose: this.onStreamingErrorDismiss.bind(this),
            title: $L("Streaming Error"),
            message: errorText,
            choices: [{
                label: 'OK',
                value: "retry",
                type: 'primary'
            }
            {
             label: 'Let Palm Try',
             value: "palm-attempt",
             type: 'secondary'
             
             }
            ],
            allowHTMLMessage: true
        });
		*/
    },

    bufferingFinished: function(audioObj) {
        audioObj.fullyBuffered = true;

        var startPercentage = (this.player.buffered.start(0) / this.player.duration);
        var endPercentage = 1;
        var primary = (this.player === audioObj);

        audioObj.song.amtBuffered = endPercentage * 100;
        this.UIPrintBuffered(startPercentage, endPercentage, audioObj.song.index - 1, primary);
        if (this.debug) {
            var percentage = (Math.round(endPercentage * 10000) / 100);
            //this.NowPlayingStreamDebug("Download Complete");
        }

    },
    
    
    
    getBufferInfo:function()
    {
        var info = "";
        
        //info += "Active Buffers: " + this.audioBuffers.length + "<br>";
        
        var totalSize=0;
        var totalSecs=0;
        for(var i = 0; i<this.audioBuffers.length;i++)
        {
            if(i!==0)
            {
                info += "<br>";    
            }
            
            
            
            
            info += "<b>"+this.audioBuffers[i].song.title + "</b><hr>";
            
            var pctg =  parseInt(this.audioBuffers[i].song.amtBuffered,10)/100;
            
            var secs = 0;
            if (!this.audioBuffers[i].duration) {
                secs =  parseInt(this.audioBuffers[i].song.time,10)*pctg;
            } else {
                secs = this.audioBuffers[i].buffered.end(0);
            }
            
            var size =  parseInt(this.audioBuffers[i].song.size,10)*pctg;   
            
            var bitrate = Math.floor(((size/1024)/secs)*8);
            
            info += Math.floor((size/1051648)*100)/100 + "MB @ (" + bitrate + "kbps)<br>";
            
            
            
            totalSize += size;
            totalSecs += secs;
        }
        
        info += "<br><b>Totals</b><hr>";
        info += "Memory Used: " + Math.floor((totalSize/1051648)*100)/100 + "MB<br>";
        
        var bitrate = Math.floor(((totalSize/1024)/totalSecs)*8);
        info += "Average Bitrate: " + bitrate + "kbps<br>";
        
        return info;
    },
    

    UIStartPlaybackTimer: function() {
        if (!this.timeInterval) {
            this.timeInterval = setInterval(this.UIUpdatePlaybackTime.bind(this), PLAYBACK_TIMERTICK);
            
            //Mojo.Controller.getAppController().showBanner("Started Timer", {
            //        source: 'notification'
            //});
        }
    },

    UIStopPlaybackTimer: function() {
        if ((this.timeInterval)) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
            
            //Mojo.Controller.getAppController().showBanner("Stopped Timer", {
            //        source: 'notification'
            //});
        }
    },

    //timeIndex:0,
    ticksUnchanged: 0,
    lastTickValue: 0,

    UIUpdatePlaybackTime: function() {

        // if the song has started buffering give it 30 seconds to make progress playing back
        // if it hasn't then give it 60 seconds
        if ( ((this.ticksUnchanged > 30) && (this.player.song.amtBuffered !==0)) ||
            (this.ticksUnchanged > 60)
        ) 
        {
            this.UIStopPlaybackTimer();
           
            this.recoverFromAudioServiceFailure("webOS Audio Stall, Recovering");

            this.lastTickValue = 0;
            this.ticksUnchanged = 0;
        } else if (this.player) {

            if(this.player.paused)
            {
                this.UIStopPlaybackTimer();
                
            }
            var duration = 0;
            var currentTime = 0;
			//var end = 0;
			
			//end = this.player.buffered.end(0);

            if (this.player.readyState !== this.player.HAVE_NOTHING) {
                currentTime = Number(this.player.currentTime);
            }

            if (this.player.duration) {

                duration = Number(this.player.duration);
            } 
			
            if ((duration === 0)&&(this.player.song)) {
                duration = Number(this.player.song.time);
            }

            this.timePercentage = (currentTime / duration) * 100;
			
			//this.player.amtBuffered = (end/duration) * 100;
			
            if(this.StallDetection===true)
            {
                
                
                
                if (this.timePercentage === this.lastTickValue) {
                    if(this.timeInterval!==null)
                    {
                    
                        this.ticksUnchanged++;
                    
                        
                        //if(this.ticksUnchanged>15){
                        //    var onOff = (this.timeInterval!==null) ? "On" : "Off";
                        //
                        //    Mojo.Controller.getAppController().showBanner(onOff + " Ticks: " + this.ticksUnchanged, {
                        //        source: 'notification'
                        //    });
                        //}
                    }
                
                } else {
                this.lastTickValue = this.timePercentage;
                    this.ticksUnchanged = 0;
                }
            }

            if (this.UIHandler) {
                this.UIHandler.updateTime(currentTime, duration, this.timePercentage, this.player.song.index - 1);
            }
			
            if (this.playbackHandler) {
                this.playbackHandler.updateTime(currentTime, duration, this.timePercentage, this.player.song.amtBuffered, this.player.song.index - 1);
            }
        }
    },

    UIPrintBuffered: function(start, end, index, primary) {
        if (this.UIHandler) {

            this.UIHandler.updateBuffering(start, end, index, primary);
        }
			
        if (this.playbackHandler) {
            //this.playbackHandler.updateBuffering(start, end, index, primary);
        }
    },

   
    updateBuffering: function(audioObj) {
        //console.log("--> AudioPlayer.prototype._updateBuffering")
        var start = 0;
        var end = 0;
        var duration = 0;

        if (!audioObj.duration) {
            duration = Number(audioObj.song.time);
        } else {
            duration = audioObj.duration;
            start = audioObj.buffered.start(0);
            end = audioObj.buffered.end(0);
        }

        var startPercentage = start / duration;
        var endPercentage = end / duration;

        var primary = (this.player === audioObj);

        audioObj.song.amtBuffered = endPercentage * 100;
		
        this.UIPrintBuffered(startPercentage, endPercentage, audioObj.song.index - 1, primary);


    },

    UIUpdateSongInfo: function(song) {
        if (this.UIHandler) {
            this.UIHandler.DisplaySongInfo(song, song.index - 1);
        }
    },

    UIInvalidateSong: function(song) {
        if (this.UIHandler) {
            if (song) {
                this.UIHandler.InvalidateSong(song, song.index - 1);
            } else {
                console.log("Missing Song");
            }
        }
    },

    UIShowSpinner: function(_spinnerOn) {
        if (this.UIHandler) {
            if (_spinnerOn === true) {
                this.UIHandler.showSpinner();
            } else if (_spinnerOn === false) {
                this.UIHandler.hideSpinner();
            } else {}
        }
    },

    UIShowPause: function() {
        if (this.UIHandler) {
            this.UIHandler.hideSpinner();
            this.UIHandler.showPauseButton();
        }
    },

    UIShowPlay: function() {
        if (this.UIHandler) {
            this.UIHandler.hideSpinner();
            this.UIHandler.showPlayButton();
        }
    },
    //UISetPointer: function(song, state) {
    //    if (this.UIHandler) {
    //        this.UIHandler.SetSongPointer(song.index-1, state);
    //    }
    //},
    UISetBufferWait: function(song, state) {
        node = this.UIGetSongNode(song);
        if(node)
        {
            if (state === true) {
                song.plIcon = "images/icons/loading.png";
            } else {
                if ((song.index - 1) !== this.playList.current) {
                    song.plIcon = "images/player/blank.png";
                } else {
                    song.plIcon = "images/player/play.png";
                }
            }
            if (node) {
                node.getElementsByClassName("npListIcon")[0].src = song.plIcon;
            }
        }
    },

    UIGetSongNode: function(song) {
        if (this.UIHandler && this.listIsShowing === true) {
            return this.UIHandler.GetSongNode(song);
        }
        return null;
    },

    UIPrintDebug: function(event, isPlayer) {
        if (this.UIHandler && this.debug) {
            this.UIHandler.printDebug(event, isPlayer);
        }
    },


    FocusRegained:function()
    {
        if(this.timePercentage !== 0 && this.player.paused===true)
        {
            var controller = Mojo.Controller.getAppController().getFocusedStageController().topScene();

                controller.showAlertDialog({
                    onChoose: this.FocusRegainedAnswer.bind(this),
                    title: $L("Resume Playback?"),
                    allowHTMLMessage: true,
                    message: "Playback was paused, would you like to resume?",
                    choices: [{
                        label: $L('Resume'),
                        value: 'resume',
                        type: 'affirmative'
                    },
                    {
                        label: $L('Cancel'),
                        value: '',
                        type: 'primary'
                    }]
                });
        }
    
    },

    FocusRegainedAnswer:function(answer)
    {
        if(answer === "resume")
        {
            this.play();
        }
        
        
    },


    setPlaybackHandler: function(playbackHandler) {
        this.playbackHandler = playbackHandler;

    },
	
	setMainHandler: function(mainHandler) {
		this.mainHandler = mainHandler;
	},

    setNowPlaying: function(UIHandler) {
        this.UIHandler = UIHandler;
        
        this.ticksUnchanged = 0;

        if (this.player && this.player.song) {
            this.UIUpdateSongInfo(this.player.song);
        }
        if (this.player.paused === false) {
            this.UIStartPlaybackTimer();
        }
        
        this.displayBanners = true;

    },

    clearNowPlaying: function() {
        this.UIStopPlaybackTimer();
        this.UIHandler = null;
    },

    cleanup: function() {
        this.clearNowPlaying();
        this.stop();
        this.player = null;
        while (this.audioBuffers.length !== 0) {
            this.audioBuffers.pop();
        }
        while (this.bufferPool.length !== 0) {
            this.bufferPool.pop();
        }
        this.playList = null;
        this.hasPlayList = false;
    },
});