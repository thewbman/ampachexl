/*
 *   AmapcheXL - A webOS app for Ampache written in the enyo framework and designed for use on a tablet. 
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
	},
	
	movingSlider: false,
	startPlayingTimer: "",
	
	components: [
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
				{name: "songSlider", kind: "Slider", className: "songSlider", showing: false, position: 0, flex: 1, onChanging: "songSliderChanging", onChange: "songSliderChange", animationPosition: false},
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
		AmpacheXL.currentAudioObjectName = "sound3";
		AmpacheXL.nextAudioObjectName = "sound2";
		
		this.$[AmpacheXL.currentAudioObjectName].audio.pause();
		this.$[AmpacheXL.currentAudioObjectName].setSrc("media/empty.mp3");
		
		this.$[AmpacheXL.nextAudioObjectName].audio.pause();
		this.$[AmpacheXL.nextAudioObjectName].setSrc("media/empty.mp3");
		
		this.$.sound1.audio.addEventListener("playing", enyo.bind(this, "playingEvent1"), false);
		this.$.sound1.audio.addEventListener("pause", enyo.bind(this, "pauseEvent1"), false);
		this.$.sound1.audio.addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent1"), false);
		this.$.sound1.audio.addEventListener("ended", enyo.bind(this, "endedEvent1"), false);
		this.$.sound1.audio.addEventListener("error", enyo.bind(this, "errorEvent1"), false);
		
		this.$.sound2.audio.addEventListener("playing", enyo.bind(this, "playingEvent2"), false);
		this.$.sound2.audio.addEventListener("pause", enyo.bind(this, "pauseEvent2"), false);
		this.$.sound2.audio.addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent2"), false);
		this.$.sound2.audio.addEventListener("ended", enyo.bind(this, "endedEvent2"), false);
		this.$.sound2.audio.addEventListener("error", enyo.bind(this, "errorEvent2"), false);
		*/
		
		/*		
		this.$[AmpacheXL.currentAudioObjectName].play();
		*/
		
		
		AmpacheXL.currentAudioObjectIndex = 1;
		AmpacheXL.nextAudioObjectIndex = 0;
		AmpacheXL.audioObjects = [];
		
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex] = new Audio();
		AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex] = new Audio();
		
		//AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].setAttribute("x-palm-media-audio-class", "media");
		//AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].setAttribute("x-palm-media-audio-class", "media");
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].autoplay = false;
		AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].autoplay = false;
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("playing", enyo.bind(this, "playingEvent"), false);
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("pause", enyo.bind(this, "pauseEvent"), false);
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("ended", enyo.bind(this, "endedEvent"), false);
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("error", enyo.bind(this, "errorEvent"), false);
		
	},
	
	playSong: function(inSongObject) {
		if(debug) this.log("playSong: "+enyo.json.stringify(inSongObject));
		
		clearTimeout(this.startPlayingTimer);
		
		AmpacheXL.currentSong = inSongObject;
		
		this.$.songSlider.show();
		this.$.previous.show();
		this.$.play.hide();
		this.$.pause.show();
		this.$.next.show();
		
		this.$.songArt.addClass("playbackSongArt");
		this.$.songArt.setSrc(inSongObject.art);
		
		this.$.songArtist.setContent(inSongObject.artist);
		this.$.songTitle.setContent(inSongObject.title);
		this.$.songAlbum.setContent(inSongObject.album);
		
		this.render();
		
		if((window.PalmSystem)&&(AmpacheXL.prefsCookie.bannerOnPlayback)) this.doBannerMessage(inSongObject.artist+": "+inSongObject.title);
		
		if(inSongObject.url == AmpacheXL.nextSong.url) {
			
			if(debug) this.log("Already have next song queued, so switch names from "+AmpacheXL.currentAudioObjectName+" to "+AmpacheXL.nextAudioObjectName);
			/*
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("playing", enyo.bind(this, "playingEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("ended", enyo.bind(this, "endedEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			this.$[AmpacheXL.currentAudioObjectName].audio.pause();
			this.$[AmpacheXL.currentAudioObjectName].setSrc("media/empty.mp3");
			
			var newName = AmpacheXL.currentAudioObjectName;
			AmpacheXL.currentAudioObjectName = AmpacheXL.nextAudioObjectName;
			AmpacheXL.nextAudioObjectName = newName;
			
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("playing", enyo.bind(this, "playingEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("ended", enyo.bind(this, "endedEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			if(AmpacheXL.connected) this.$.play.show();
			this.$.pause.hide();
			
			this.startPlayingTimer = setTimeout(enyo.bind(this, "playingFailed"), 8000);
			this.$[AmpacheXL.currentAudioObjectName].play();
			*/
			
			if(debug) this.log("Already have next song queued, so switch indexes from "+AmpacheXL.currentAudioObjectIndex+" to "+AmpacheXL.nextAudioObjectIndex);
			
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("playing", enyo.bind(this, "playingEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("ended", enyo.bind(this, "endedEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].removeEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].pause();
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].src = "";
			
			var newIndex = AmpacheXL.currentAudioObjectIndex
			AmpacheXL.currentAudioObjectIndex = AmpacheXL.nextAudioObjectIndex;
			AmpacheXL.nextAudioObjectIndex = newIndex;
			
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("playing", enyo.bind(this, "playingEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("ended", enyo.bind(this, "endedEvent"), false);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].addEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			if(AmpacheXL.connected) this.$.play.show();
			this.$.pause.hide();
			
			this.startPlayingTimer = setTimeout(enyo.bind(this, "playingFailed"), 8000);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].play();
			
		} else {
		
			if(debug) this.log("Don't have song queued, using existing name at "+AmpacheXL.currentAudioObjectName);
			/*
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("playing", enyo.bind(this, "playingEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("ended", enyo.bind(this, "endedEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.removeEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			//remove previous song
			this.$[AmpacheXL.currentAudioObjectName].audio.pause();
			this.$[AmpacheXL.currentAudioObjectName].setSrc("media/empty.mp3");
			
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("playing", enyo.bind(this, "playingEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("pause", enyo.bind(this, "pauseEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("timeupdate", enyo.bind(this, "timeupdateEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("ended", enyo.bind(this, "endedEvent"), false);
			this.$[AmpacheXL.currentAudioObjectName].audio.addEventListener("error", enyo.bind(this, "errorEvent"), false);
			
			this.$[AmpacheXL.currentAudioObjectName].setSrc(inSongObject.url);
			this.startPlayingTimer = setTimeout(enyo.bind(this, "playingFailed"), 8000);
			this.$[AmpacheXL.currentAudioObjectName].play();
			*/
			
			if(debug) this.log("Don't have song queued, using existing index at "+AmpacheXL.currentAudioObjectIndex);
			
			//remove previous song
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].pause();
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].src = "";
			
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].src = inSongObject.url;
			this.startPlayingTimer = setTimeout(enyo.bind(this, "playingFailed"), 8000);
			AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].play();
			
		}
		
	},
	queueNextSong: function(inSongObject) {
		if(debug) this.log("queueNextSong for index "+AmpacheXL.nextAudioObjectIndex+": "+enyo.json.stringify(inSongObject));
		
		if(inSongObject.url == AmpacheXL.nextSong.url) {
		
			/*if(debug) this.log("we have already queued this song at name: "+AmpacheXL.nextAudioObjectName);*/
			if(debug) this.log("we have already queued this song at index: "+AmpacheXL.nextAudioObjectIndex);
			
		} else if(true) {
		
			/*if(debug) this.log("is a new song - queue it up at previous name: "+AmpacheXL.nextAudioObjectName);*/
			if(debug) this.log("is a new song - queue it up at previous index: "+AmpacheXL.nextAudioObjectIndex);
			
			AmpacheXL.nextSong = inSongObject;
			
			//AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].setAttribute("x-palm-media-audio-class", "media");
			//AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].autoplay = false;
			/*
			this.$[AmpacheXL.nextAudioObjectName].setSrc(inSongObject.url);
			*/
			
			AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].src = inSongObject.url;
			
		} else {
		
			if(debug) this.log("is a new song - queue it up at index: "+AmpacheXL.audioObjects.length+" and removing old at "+AmpacheXL.nextAudioObjectIndex);
			
			AmpacheXL.audioObjects.splice(AmpacheXL.nextAudioObjectIndex,1);

			if(AmpacheXL.currentAudioObjectIndex > AmpacheXL.nextAudioObjectIndex) {
				AmpacheXL.currentAudioObjectIndex--;
			}
			
			AmpacheXL.nextSong = inSongObject;
			
			AmpacheXL.nextAudioObjectIndex = AmpacheXL.audioObjects.length;
			AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex] = new Audio();
			
			//AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].setAttribute("x-palm-media-audio-class", "media");
			AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].autoplay = false;
			
			//AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].pause();
			//AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].src = "";
			AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].src = inSongObject.url;
		}
		
		
	},
	disconnect: function() {
		if(debug) this.log("disconnect");
		/*
		this.$[AmpacheXL.currentAudioObjectName].audio.pause();
		this.$[AmpacheXL.currentAudioObjectName].setSrc("media/empty.mp3");
		
		this.$[AmpacheXL.nextAudioObjectName].audio.pause();
		this.$[AmpacheXL.nextAudioObjectName].setSrc("media/empty.mp3");
		*/
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].pause();
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].src = "";
		
		AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].pause();
		AmpacheXL.audioObjects[AmpacheXL.nextAudioObjectIndex].src = "";
		
		
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
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime = newTime;
		
	},
	pauseClick: function() {
		if(debug) this.log("pauseClick");
		
		clearTimeout(this.startPlayingTimer);
		/*
		this.$[AmpacheXL.currentAudioObjectName].audio.pause();
		*/
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].pause();
		
	},
	playClick: function() {
		if(debug) this.log("playClick");
		
		clearTimeout(this.startPlayingTimer);
		
		/*
		this.$[AmpacheXL.currentAudioObjectName].play();
		*/
		
		AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].play();
		
	},
	previousClick: function() {
		if(debug) this.log("previousClick");
		
		clearTimeout(this.startPlayingTimer);
		
		this.doPreviousTrack();
	},
	nextClick: function() {
		if(debug) this.log("nextClick");
		
		clearTimeout(this.startPlayingTimer);
		
		this.doNextTrack();
	},
	
	playingEvent: function() {
		if(debug) this.log("playingEvent");
		
		clearTimeout(this.startPlayingTimer);
		
		this.$.play.hide();
		if(AmpacheXL.connected) this.$.pause.show();
		
		AmpacheXL.currentSong.status = "playing";
		setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
		
		//this.$.totalTime.setContent(floatToTime(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].duration));
		this.$.totalTime.setContent(floatToTime(AmpacheXL.currentSong.time));
	},
	timeupdateEvent: function() {
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
		
		
		if(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime > 1) clearTimeout(this.startPlayingTimer);
		
		//var progress = parseInt(100 * (AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime/AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].duration));
		var progress = parseInt(100 * (AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime/AmpacheXL.currentSong.time));
		
		if((!this.movingSlider)&&(AmpacheXL.connected))  {
			this.$.songSlider.setPosition(progress);
			this.$.progressTime.setContent(floatToTime(AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime));
		}
		
	},
	pauseEvent: function() {
		//if(debug) this.log("pauseEvent: "+this.$[AmpacheXL.currentAudioObjectName].audio.currentTime);
		if(debug) this.log("pauseEvent: "+AmpacheXL.audioObjects[AmpacheXL.currentAudioObjectIndex].currentTime);
		
		if(AmpacheXL.connected) this.$.play.show();
		this.$.pause.hide();
		
		AmpacheXL.currentSong.status = "paused";
		setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
	},
	endedEvent: function() {
		if(debug) this.log("endedEvent");
		
		if(AmpacheXL.connected) this.$.play.show();
		this.$.pause.hide();
		
		AmpacheXL.currentSong.status = "stopped";
		setTimeout(enyo.bind(this, "doUpdatePlaybackStatus", 10));
		
		this.doNextTrack();
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

	
	playingEvent1: function() {
		if(debug) this.log("playingEvent1");
	},
	pauseEvent1: function() {
		if(debug) this.log("pauseEvent1");
	},
	timeupdateEvent1: function() {
		if(debug) this.log("timeupdateEvent1");
	},
	endedEvent1: function() {
		if(debug) this.log("endedEvent1");
	},
	errorEvent1: function() {
		if(debug) this.log("errorEvent1");
	},
	
	playingEvent2: function() {
		if(debug) this.log("playingEvent2");
	},
	pauseEvent2: function() {
		if(debug) this.log("pauseEvent2");
	},
	timeupdateEvent2: function() {
		if(debug) this.log("timeupdateEvent2");
	},
	endedEvent2: function() {
		if(debug) this.log("endedEvent2");
	},
	errorEvent2: function() {
		if(debug) this.log("errorEvent2");
	},
	
	
	
});
	
