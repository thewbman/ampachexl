/*
 *   AmpacheXL - A webOS app for Ampache written in the enyo framework and designed for use on a tablet. 
 *   http://code.google.com/p/ampachexl/
 *   Copyright (C) 2011  Wes Brown
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this program; if not, write to the Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


enyo.kind({
	name: "Playback",
	className: "Playback",
	kind: "Control",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onPreviousTrack: "",
		onNextTrack: "",
		onBannerMessage: "",
		onUpdatePlaybackStatus: "",
		onCloseStartingPlayback: "",
	},
	
	movingSlider: false,
	startPlayingTimer: "",
	pluginPlayingInterval: "",
	
	components: [
	
			{name: "lastfmUpdateService", kind: "WebService", handleAs: "txt", method: "POST", onSuccess: "lastfmUpdateResponse", onFailure: "lastfmUpdateFailure"},
			{name: "lastfmScrobbleService", kind: "WebService", handleAs: "txt", method: "POST", onSuccess: "lastfmScrobbleResponse", onFailure: "lastfmScrobbleFailure"},
			
			{name: "lastfmArtService", kind: "WebService", handleAs: "txt", onSuccess: "lastfmArtResponse", onFailure: "lastfmArtFailure"},
		
			{name: "startActivity", kind : "PalmService", service : "palm://com.palm.power/com/palm/power", method : "activityStart", onSuccess : "startActivitySuccess", onFailure : "startActivityFailure", subscribe : true },
		 
			/*
			{name: "sound1", kind: "Sound", src: "media/empty.mp3", audioClass: "media"},
			{name: "sound2", kind: "Sound", src: "media/empty.mp3", audioClass: "media"},
			{name: "sound3", kind: "Sound", src: "media/empty.mp3", audioClass: "media"},
			*/
			{name: "songArt", kind: "Image"},
			
			{name: "songArtist", content: "&nbsp;", allowHtml: true, className: "playbackSongArtist truncating"},
			{name: "songTitle", content: "&nbsp;", allowHtml: true, className: "playbackSongTitle truncating"},
			{name: "songAlbum", content: "&nbsp;", allowHtml: true, className: "playbackSongAlbum truncating"},
			
			{name: "songTimeWrapper", kind: "HFlexBox", className: "songTimeWrapper", align: "center", pack: "center", components: [
				{name: "progressTime", className: "playbackTime"},
				{name: "songSlider", kind: "ProgressSlider", className: "songSlider", showing: false, position: 0, barPosition: 0, flex: 1, onChanging: "songSliderChanging", onChange: "songSliderChange", animationPosition: false},
				{name: "totalTime", className: "playbackTime"},
			]},
			
			
		{name: "footer", kind: "Toolbar", components: [
			{kind: "Spacer"},
			{name: "previous", caption: "<<", showing: false, allowHtml: true, onclick: "previousClick"},
			{kind: "Spacer"},
			{name: "play", caption: "Play", showing: false, onclick: "playClick"},
			{name: "pause", caption: "Pause", showing: false, onclick: "pauseClick"},
			{kind: "Spacer"},
			{name: "next", caption: ">>", showing: false, allowHtml: true, onclick: "nextClick"},
			{kind: "Spacer"},
		]},
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
		
		//this.render();
		
		
		
		/*		
		this.$[AmpacheXL.currentAudioObjectName].play();
		*/
		
		/*
		AmpacheXL.audioPlayer = new AudioPlayer(this);
		AmpacheXL.audioPlayer.setNumBuffers(AmpacheXL.numBuffers);
		AmpacheXL.audioPlayer.setPlaybackHandler(this);
		*/
		
		/*
		AmpacheXL.currentAudioObjectIndex = 1;
		AmpacheXL.nextAudioObjectIndex = 0;
		AmpacheXL.audioObjects = [];
		*/
		
	},
	
	playSong: function(inSong) {
		if(debug) this.log("playSong: "+enyo.json.stringify(inSong));
		
	},
	queueNextSong: function(inSong) {
		if(debug) this.log("queueNextSong for index "+AmpacheXL.nextAudioObjectIndex+": "+enyo.json.stringify(inSong));
		
	},
	disconnect: function() {
		if(debug) this.log("disconnect");
		/*
		this.$[AmpacheXL.currentAudioObjectName].audio.pause();
		this.$[AmpacheXL.currentAudioObjectName].setSrc("media/empty.mp3");
		
		this.$[AmpacheXL.nextAudioObjectName].audio.pause();
		this.$[AmpacheXL.nextAudioObjectName].setSrc("media/empty.mp3");
		*/
		/*
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].pause();
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].src = "";
		
		AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].pause();
		AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].src = "";
		*/
		
		this.$.songSlider.hide();
		this.$.previous.hide();
		this.$.play.hide();
		this.$.pause.hide();
		this.$.next.hide();
		
		this.$.songArt.removeClass("playbackSongArt");
		this.$.songArt.setSrc("");
		
		this.$.songTitle.setContent("");
		this.$.songArtist.setContent("");
		this.$.songAlbum.setContent("");
		
		this.$.progressTime.setContent("");
		this.$.totalTime.setContent("");
		
		//this.playingFailed();
		
		this.render();
	},
	
	songSliderChanging: function(inSender, inEvent) {
		if(debug) this.log("songSliderChanging: "+this.$.songSlider.getPosition());
		
		this.movingSlider = true;
		
		var newTime = parseInt(this.$.songSlider.getPosition()*AmpacheXL.currentSong.time/100);
		
		this.$.progressTime.setContent(floatToTime(newTime));
		
	},
	songSliderChange: function(inSender, inEvent) {
		if(debug) this.log("songSliderChange: "+this.$.songSlider.getPosition());
		
		this.movingSlider = false;
		
		var newTime = parseInt(this.$.songSlider.getPosition()*AmpacheXL.currentSong.time/100);
		/*
		this.$[AmpacheXL.currentAudioObjectName].audio.currentTime = newTime;
		*/
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			AmpacheXL.pluginObj.Seek(newTime, 0);
		} else {
			AmpacheXL.audioPlayer.seek(newTime);
		}
		
		//AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime = newTime;
		
	},
	pauseClick: function() {
		if(debug) this.log("pauseClick");
		
		AmpacheXL.currentSong.status = "paused";
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			AmpacheXL.pluginObj.Pause(0);
			this.$.songSlider.show();
			this.$.previous.show();
			this.$.play.show();
			this.$.pause.hide();
			this.$.next.show();
			setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
			clearInterval(this.pluginPlayingInterval);
		} else {
			AmpacheXL.audioPlayer.pause();
		}
		
		//clearTimeout(this.startPlayingTimer);
		/*
		this.$[AmpacheXL.currentAudioObjectName].audio.pause();
		*/
		
		//AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].pause();
		
	},
	playClick: function() {
		if(debug) this.log("playClick");
		
		AmpacheXL.currentSong.status = "playing";
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			AmpacheXL.pluginObj.Play(0);
			this.$.songSlider.show();
			this.$.previous.show();
			this.$.play.hide();
			this.$.pause.show();
			this.$.next.show();
			setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
			this.pluginPlayingInterval = setInterval(enyo.bind(this, "pluginPlayingRequest"), 1000);
		} else {
			AmpacheXL.audioPlayer.play();
		}
		
		//clearTimeout(this.startPlayingTimer);
		
		/*
		this.$[AmpacheXL.currentAudioObjectName].play();
		*/
		
		//AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].play();
		
	},
	previousClick: function() {
		if(debug) this.log("previousClick");
		
		/*
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			//
		} else {
			AmpacheXL.audioPlayer.previous();
		}
		*/
		
		//clearTimeout(this.startPlayingTimer);
		
		this.doPreviousTrack();
	},
	nextClick: function() {
		if(debug) this.log("nextClick");
		
		/*
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			//
		} else {
			AmpacheXL.audioPlayer.next();
		}
		*/
		
		//clearTimeout(this.startPlayingTimer);
		
		this.doNextTrack();
	},
	
	updateTime: function(currentTime, duration, timePercentage, amtBuffered, songIndex) {
		//if(debug) this.log("updateTime: "+currentTime+", "+duration+", "+timePercentage+", "+amtBuffered+", "+songIndex);
		
		if((!this.movingSlider)&&(AmpacheXL.connected))  {
			this.$.songSlider.setPosition(timePercentage);
			this.$.songSlider.setBarPosition(amtBuffered);
			this.$.progressTime.setContent(floatToTime(currentTime));
			AmpacheXL.currentSong.time = duration;
		}
		
	},
	updateBuffering: function(start, end, index, primary) {
		if(debug) this.log("updateBuffering: "+start+", "+end+", "+index+", "+primary);
		
		if(primary) this.$.songSlider.setBarPosition(end*100);
	},
	playingEvent: function(inSong) {
		if(debug) this.log("playingEvent: "+enyo.json.stringify(inSong));
		
		this.doCloseStartingPlayback();
		
		if(inSong) AmpacheXL.currentSong = inSong;
		
		this.$.songSlider.show();
		this.$.previous.show();
		this.$.play.hide();
		this.$.pause.show();
		this.$.next.show();
		
		this.$.songArt.addClass("playbackSongArt");
		this.$.songArt.setSrc(inSong.art);
		
		this.$.songArtist.setContent(inSong.artist);
		this.$.songTitle.setContent(inSong.title);
		this.$.songAlbum.setContent(inSong.album);
		
		this.$.songSlider.setBarPosition(inSong.amtBuffered);
		
		this.render();
		
		if((window.PalmSystem)&&(AmpacheXL.prefsCookie.bannerOnPlayback)) this.doBannerMessage(inSong.artist+": "+inSong.title);
		
		clearTimeout(this.startPlayingTimer);
		
		this.$.play.hide();
		if(AmpacheXL.connected) this.$.pause.show();
		
		AmpacheXL.currentSong.status = "playing";
		setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
		
		//this.$.totalTime.setContent(floatToTime(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].duration));
		this.$.totalTime.setContent(floatToTime(AmpacheXL.currentSong.time));
		
		this.lastFMplaying();
	},
	timeupdateEvent: function(inCurrentTime) {
		if(debug) this.log("timeupdateEvent: "+inCurrentTime);
		//if(debug) this.log("timeupdateEvent: "+this.$[AmpacheXL.currentAudioObjectName].audio.currentTime);
		//if(debug) this.log("timeupdateEvent: "+AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime);
		
		/*
		if(this.$[AmpacheXL.currentAudioObjectName].audio.currentTime > 1) clearTimeout(this.startPlayingTimer);
		
		//var progress = parseInt(100 * (AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime/AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].duration));
		var progress = parseInt(100 * (this.$[AmpacheXL.currentAudioObjectName].audio.currentTime/AmpacheXL.currentSong.time));
		
		if((!this.movingSlider)&&(AmpacheXL.connected)&&(this.$[AmpacheXL.currentAudioObjectName].audio.currentTime > 1))  {
			this.$.songSlider.setPosition(progress);
			this.$.progressTime.setContent(floatToTime(this.$[AmpacheXL.currentAudioObjectName].audio.currentTime));
		}
		*/
		
		
		//if(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime > 1) clearTimeout(this.startPlayingTimer);
		
		var progress = parseInt(100 * (inCurrentTime/AmpacheXL.currentSong.time));
		
		if((!this.movingSlider)&&(AmpacheXL.connected))  {
			this.$.songSlider.setPosition(progress);
			this.$.progressTime.setContent(floatToTime(inCurrentTime));
		}
		
	},
	pauseEvent: function() {
		//if(debug) this.log("pauseEvent: "+this.$[AmpacheXL.currentAudioObjectName].audio.currentTime);
		//if(debug) this.log("pauseEvent: "+AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime);
		if(debug) this.log("pauseEvent");
		
		if(AmpacheXL.connected) this.$.play.show();
		this.$.pause.hide();
		
		AmpacheXL.currentSong.status = "paused";
		setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
	},
	endedEvent: function(inSong) {
		if(debug) this.log("endedEvent");
		
		if(AmpacheXL.connected) this.$.play.show();
		this.$.pause.hide();
		
		AmpacheXL.currentSong.status = "stopped";
		setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
		
		//if(AmpacheXL.audioPlayer.playList.atPlaylistEnd()) {
		if(AmpacheXL.nowplayingIndex == (AmpacheXL.nowplaying.length-1)) {
		
			var actionArray = AmpacheXL.prefsCookie.nowPlayingEnd.split("[]:[]");
			var playAction = actionArray[0];
			var playOrder = actionArray[1];
						
			if(playAction == "play") {
				switch(playOrder) {
					case "shuffled":
						var newSongs = [], s = {};
			
						var originalList = AmpacheXL.nowplaying.concat([]);
						
						do {
						
							var randomSong = Math.floor(Math.random()*originalList.length);
								
							s = originalList.splice(randomSong, 1)[0];
							newSongs.push(s);
							
							//if(debug) this.log("splicing random song at index "+randomSong+": "+enyo.json.stringify(s));
							
						} while(originalList.length > 0);
						
						AmpacheXL.nowplaying.length = 0;
						AmpacheXL.nowplaying = newSongs;
				
						break;
					default: 
						//keep list as is
						break;
				}
				
				var row = AmpacheXL.nowplaying[0];
				
				AmpacheXL.nowplayingIndex = 0;
				AmpacheXL.currentSong = row;
				
				AmpacheXL.audioPlayer.reorderPlayList(AmpacheXL.nowplaying, AmpacheXL.currentSong, AmpacheXL.currentSong.id);
				AmpacheXL.audioPlayer.playTrack(0);
				
			} else {
				//
			} 
		
		}
		
		//this.doNextTrack();
		
		this.lastFMended(inSong);
		
	},
	errorEvent: function() {
		if(debug) this.log("errorEvent");
		
		clearTimeout(this.startPlayingTimer);
		/*
		if(this.$[AmpacheXL.currentAudioObjectName].audio.error) {
			this.error(this.$[AmpacheXL.currentAudioObjectName].audio.error);
		
			this.playingFailed();
			
		} else {
			if(debug) this.log("errorEvent but no .audio.error");
		}
		*/
		
		
		if(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].error) {
			this.error(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].error);
		
			this.playingFailed();
			
		}
		
		//if(AmpacheXL.connected) this.doBannerMessage("Error playing file '"+AmpacheXL.currentSong.title+"'");
		//this.doNextTrack();
	},
	progressEvent: function() {
		//if(debug) this.log("progressEvent");
		
		var endBuf = AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].buffered.end(0);
		var soFar = parseInt(((endBuf / AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].duration) * 100));
		
		if(debug) this.log("progressEvent endBuf: "+endBuf+" and soFar:"+soFar+"%");
	},
	
	pluginStartSong: function(path, artist, title, iTrack) {
		if(debug) this.log("pluginStartSong: "+path+" "+artist+" "+title+" "+iTrack);
		
		if(AmpacheXL.currentSong.url != AmpacheXL.nextSong.url) this.lastFMended(AmpacheXL.currentSong);
		
		AmpacheXL.currentSong = AmpacheXL.nextSong;
		
		this.$.songSlider.setBarPosition(100);
		
		this.$.songSlider.show();
		this.$.previous.show();
		this.$.play.hide();
		this.$.pause.show();
		this.$.next.show();
		
		this.$.songArt.addClass("playbackSongArt");
		this.$.songArt.setSrc(AmpacheXL.currentSong.art);
		
		this.$.songArtist.setContent(AmpacheXL.currentSong.artist);
		this.$.songTitle.setContent(AmpacheXL.currentSong.title);
		this.$.songAlbum.setContent(AmpacheXL.currentSong.album);
		
		//this.$.songSlider.setBarPosition(AmpacheXL.currentSong.amtBuffered);
		
		this.render();
		
		if((window.PalmSystem)&&(AmpacheXL.prefsCookie.bannerOnPlayback)) this.doBannerMessage(AmpacheXL.currentSong.artist+": "+AmpacheXL.currentSong.title);
		
		clearTimeout(this.startPlayingTimer);
		
		this.$.play.hide();
		if(AmpacheXL.connected) this.$.pause.show();
		
		AmpacheXL.currentSong.status = "playing";
		setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
		
		//this.$.totalTime.setContent(floatToTime(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].duration));
		this.$.totalTime.setContent(floatToTime(AmpacheXL.currentSong.time));
		
		this.pluginPlayingInterval = setInterval(enyo.bind(this, "pluginPlayingRequest"), 1000);
		setInterval(enyo.bind(this, "keepPowerAlive"),30000);
		
		setTimeout(enyo.bind(this, "lastFMplaying", 5));
	},
	pluginPlayingRequest: function() {
		//if(debug) this.log("pluginPlayingRequest");
		
		var objState = {EndTime: 0, CurTime: 0};
		
		try {
			objState.EndTime = Number(AmpacheXL.pluginObj.GetEndTime(0));
			objState.CurTime = Number(AmpacheXL.pluginObj.GetCurTime(0));
		} catch(e) {
			if(debug) this.log(e);
			clearInterval(this.pluginPlayingInterval);
			this.doBannerMessage("The plugin has crashed.  You will need to close and reopen the app.  If this is happening a lot you may want to use a different playback method in the preferences.", true);
			clearInterval(this.pluginPlayingInterval);
		}

		if(objState.EndTime > 0) AmpacheXL.currentSong.time = objState.EndTime;
		
		var progress = parseInt(100 * (objState.CurTime/AmpacheXL.currentSong.time));
		
		if((!this.movingSlider)&&(AmpacheXL.connected))  {
			this.$.songSlider.setPosition(progress);
			this.$.progressTime.setContent(floatToTime(objState.CurTime));
			this.$.totalTime.setContent(floatToTime(AmpacheXL.currentSong.time));
		}
		
	},
	keepPowerAlive: function() {
		this.$.startActivity.call({"id": "com.thewbman.ampachexl-1", "duration_ms":900000});
	},
	
    startActivitySuccess: function(inSender, inResponse) {
        if(debug) this.log("Start activity success, results=" + enyo.json.stringify(inResponse));
    },          
    startActivityFailure: function(inSender, inError, inRequest) {
       this.log(enyo.json.stringify(inError));
    },
	
	lastFMended: function(inSong) {
		if(debug) this.log("lastFMended");
		
		if((AmpacheXL.prefsCookie.lastFM)&&(AmpacheXL.prefsCookie.lastFMkey)) {
			//lastfm track.scrobble	
			var url = "http://ws.audioscrobbler.com/2.0/";
			var secret = "ab3e2bdb8a9c8faced63b61fae1f842c";
			
			var params = {};
			params.api_key = "5b3c5775a14bc5dd0182b8b2965b62ac";
			params.method = "track.scrobble";
			params.timestamp = getAmpacheTime();
			params.track = inSong.title;
			params.artist = inSong.artist;
			params.sk = AmpacheXL.prefsCookie.lastFMkey;
			
			params.api_sig = MD5_hexhash("api_key"+params.api_key+"artist"+params.artist+"method"+params.method+"sk"+params.sk+"timestamp"+params.timestamp+"track"+params.track+secret);
			
			this.$.lastfmScrobbleService.setUrl(url);
			if(debug) this.log("lastfmScrobbleService url: "+this.$.lastfmScrobbleService.getUrl()+enyo.json.stringify(params));
			this.$.lastfmScrobbleService.call(params);
		}
		
	},
	lastFMplaying: function() {
		if(debug) this.log("lastFMplaying");
		
		if((AmpacheXL.prefsCookie.lastFM)&&(AmpacheXL.prefsCookie.lastFMkey)) {
			//lastfm track.updateNowPlaying
			var url = "http://ws.audioscrobbler.com/2.0/";
			var secret = "ab3e2bdb8a9c8faced63b61fae1f842c";
			
			var params = {};
			params.api_key = "5b3c5775a14bc5dd0182b8b2965b62ac";
			params.method = "track.updateNowPlaying";
			params.track = AmpacheXL.currentSong.title;
			params.artist = AmpacheXL.currentSong.artist;
			params.sk = AmpacheXL.prefsCookie.lastFMkey;
			
			params.api_sig = MD5_hexhash("api_key"+params.api_key+"artist"+params.artist+"method"+params.method+"sk"+params.sk+"track"+params.track+secret);
			
			this.$.lastfmUpdateService.setUrl(url);
			if(debug) this.log("lastfmUpdateService url: "+this.$.lastfmUpdateService.getUrl()+enyo.json.stringify(params));
			this.$.lastfmUpdateService.call(params);
		}
		
		if(AmpacheXL.prefsCookie.webArt) {
			var url = "http://ws.audioscrobbler.com/2.0/";
			
			var params = {};
			params.api_key = "5b3c5775a14bc5dd0182b8b2965b62ac";
			params.method = "track.getInfo";
			params.track = AmpacheXL.currentSong.title;
			params.artist = AmpacheXL.currentSong.artist;
		
			this.$.lastfmArtService.setUrl(url);
			if(debug) this.log("lastfmArtService url: "+this.$.lastfmArtService.getUrl()+enyo.json.stringify(params));
			this.$.lastfmArtService.call(params);
		}
	},
	
	queueProgressEvent: function() {
		//if(debug) this.log("queueProgressEvent");
		
		var endBuf = AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].buffered.end(0);
		var soFar = parseInt(((endBuf / AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].duration) * 100));
		
		if(debug) this.log("queueProgressEvent endBuf: "+endBuf+" and soFar:"+soFar+"%");
	},
	
	playingFailed: function() {
		//if(debug) this.log("playingFailed at currentAudioObjectName: "+AmpacheXL.currentAudioObjectName);
		if(debug) this.log("playingFailed at currentAudioObjectIndex: "+AmpacheXL.currentAudioObjectIndex);
		
		clearTimeout(this.startPlayingTimer);
		
		/*
		this.$[AmpacheXL.currentAudioObjectName].audio.pause();
		this.$[AmpacheXL.currentAudioObjectName].setSrc("media/empty.mp3");
		*/
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].pause();
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].src = "";
		
		if((AmpacheXL.connected)&&(AmpacheXL.currentSong.url)) {
		
			this.doBannerMessage("Error playing file '"+AmpacheXL.currentSong.title+"'");
			AmpacheXL.currentSong.title = "ERROR: *** "+AmpacheXL.currentSong.title+" ***";
			//AmpacheXL.currentSong.url = null;
			
			/*
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("playing", enyo.bind(this, "playingEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("ended", enyo.bind(this, "endedEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			//switch to sound3?
			
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("playing", enyo.bind(this, "playingEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("ended", enyo.bind(this, "endedEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("error", enyo.bind(this, "errorEvent"), false);
			*/
			
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("playing", enyo.bind(this, "playingEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("ended", enyo.bind(this, "endedEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			
			AmpacheXL.currentAudioObjectIndex = AmpacheXL.audioObjects.length;
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex] = new Audio();
			
			//AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].setAttribute("x-palm-media-audio-class", "media");
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].autoplay = false;
			
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("playing", enyo.bind(this, "playingEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("ended", enyo.bind(this, "endedEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			
			if(AmpacheXL.connected) this.$.play.show();
			this.$.pause.hide();
			
			setTimeout(enyo.bind(this, "doNextTrack"),1000);
		}
	},

	
	
	lastfmUpdateResponse: function(inSender, inResponse) {
		//if(debug) this.log("lastfmUpdateResponse");
		if(debug) this.log("lastfmUpdateResponse: "+inResponse);
		
	},
	lastfmUpdateFailure: function(inSender, inResponse) {
		if(debug) this.log("lastfmUpdateFailure");
	},
	lastfmScrobbleResponse: function(inSender, inResponse) {
		//if(debug) this.log("lastfmScrobbleResponse");
		if(debug) this.log("lastfmScrobbleResponse: "+inResponse);
		
	},
	lastfmScrobbleFailure: function(inSender, inResponse) {
		if(debug) this.log("lastfmScrobbleFailure");
	},
	
	lastfmArtResponse: function(inSender, inResponse) {
		if(debug) this.log("lastfmArtResponse");
		//if(debug) this.log("lastfmArtResponse: "+inResponse);
		
		var imagesList = [];
		
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var imagesNodes, singleImageNode, singleTagChildNode;
		var s = {};
		
		imagesNodes = xmlobject.getElementsByTagName("image");
		for(var i = 0; i < imagesNodes.length; i++) {
			singleImageNode = imagesNodes[i];
			s = {};
			
			s.size = singleImageNode.getAttributeNode("size").nodeValue;
			s.url = singleImageNode.childNodes[0].nodeValue;
			
			imagesList.push(s);
		
		}
		
		if(debug) this.log("imagesList: "+enyo.json.stringify(imagesList));
	
		if(imagesList.length > 0) {
		
			var artUrl = imagesList[0].url;
			
			for(var i = 0; i < imagesList.length; i++) {
				if(imagesList[i].size == "extralarge") artUrl = imagesList[i].url;
			}
			
			this.$.songArt.setSrc(artUrl);
			AmpacheXL.currentSong.art = artUrl;
			
			this.doUpdatePlaybackStatus();
		
		}
		
	
	},
	lastfmArtFailure: function() {
		if(debug) this.log("lastfmArtFailure");
	},
	
});
	
