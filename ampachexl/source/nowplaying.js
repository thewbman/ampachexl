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
	name: "Nowplaying",
	kind: "VFlexBox",
	className: "Nowplaying listContent",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onOpenWeb: "",
		onPlaySong: "",
		onUpdateCounts: "",
		onBannerMessage: "",
		onQueueNextSong: "",
		onPreviousView: "",
		onStartingPlayback: "",
	},
	
	listMode: "play",
	nowplayingMouseTimer: "",
	
	listOffset: 0, 
	
	components: [
		{name: "streamSongService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "launch"},
		
		{name: "savePopup", kind: "Popup", lazy2: false, onBeforeOpen: "beforeSavePopupOpen", onOpen: "savePopupOpen", showKeyboardWhenOpening: true, scrim: true, components: [
			{content: "Save local playlist", style: "text-align: center; font-size: larger;"},
			{name: "saveInput", kind: "Input", autoCapitalize: "lowercase"},
			{kind: "Button", caption: "Save", onclick:"saveNew"},
		]},
		
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Now Playing", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
							
		{name: "nowplayingVirtualList", kind: "ScrollerVirtualList", onSetupRow: "setupNowplayingItem", flex: 1, components: [
			{name: "nowplayingItem", kind: "Item", className: "listItem", layoutKind: "HFlexLayout", align: "center", components: [
				{name: "nowplayingIndex", onclick2: "nowplayingClick", onmousedown: "nowplayingMousedown", onmouseup: "nowplayingMouseup", className: "listIndex"},
				{name: "listArt", kind: "Image", onclick2: "songsClick", onmousedown: "nowplayingMousedown", onmouseup: "nowplayingMouseup", className: "listArt"},
				{kind: "VFlexBox", flex: 1, onclick2: "nowplayingClick", onmousedown: "nowplayingMousedown", onmouseup: "nowplayingMouseup", components: [
					{name: "nowplayingTitle", className: "title"},
					{name: "nowplayingArtist", className: "subtitle"},
				]},
				{name: "nowplayingAlbumWrapper", onclick2: "nowplayingClick", onmousedown: "nowplayingMousedown", onmouseup: "nowplayingMouseup", kind: "VFlexBox", components: [
					{name: "nowplayingAlbum", className: "count"},
					{name: "nowplayingTrack", className: "count"},
				]},
				{name: "nowplayingMoveUp", kind: "Image", onclick: "nowplayingMoveUp", src: "images/07-arrow-north@2x-light.png", className: "nowplayingMoveUp"},
				{name: "nowplayingMoveUpSpacer", content: "&nbsp;", allowHtml: true},
				{name: "nowplayingMoveDown", kind: "Image", onclick: "nowplayingMoveDown", src: "images/03-arrow-south@2x-light.png", className: "nowplayingMoveDown"},
				{name: "nowplayingMoveDownSpacer", content: "&nbsp;", allowHtml: true},
				{name: "nowplayingRemove", kind: "Image", onclick: "nowplayingRemove", src: "images/11-x@2x-light.png", className: "nowplayingRemove"},
			]},
		]},
		
		{name: "footer", kind: "Toolbar", layoutKind: "HFlexLayout", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{kind: "Spacer"},
			{name: "sortButton", caption: "Sort", onclick: "sortClick"},
			{name: "sortSpacer", kind: "Spacer"},
			{name: "editButton", caption: "Edit", onclick: "editClick"},
			{kind: "Spacer"},
			{name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
			{name: "saveButton", caption: "Save", onclick: "saveClick"},
		]},
		
		{name: "sortPopupMenu", kind: "PopupSelect", className: "sortPopupMenu", onBeforeOpen2: "beforeSortOpen", onSelect: "sortSelect", onClose: "sortClosed", components: [
			{caption: "Shuffle", value: "shuffle"},
			{caption: "Artist", value: "artist"},
			{caption: "Album", value: "album"},
			{caption: "Track", value: "track"},
		]},
		
		{name: "morePopupMenu", kind: "PopupSelect", className: "morePopupMenu", scrim: true, onBeforeOpen2: "beforeMoreOpen", onSelect: "moreSelect", onClose: "moreClosed", components: [
			//
		]},
		
		//name: "savePopupMenu", kind: "PopupSelect", className: "savePopupMenu", scrim: true, onBeforeOpen2: "beforeMoreOpen", onSelect: "saveSelect", onClose: "saveClosed", components: [
			//
		//]},
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
	},
	
	activate: function() {
		if(debug) this.log("activate");
		
		this.doUpdateSpinner(false);
		
		this.listOffset = Math.max(0, AmpacheXL.nowplayingIndex-5);
		this.$.nowplayingVirtualList.punt();
		
		/*
		if(AmpacheXL.nowplaying.length < 15) {
			this.$.nowplayingVirtualList.punt();
		} else {
			this.$.nowplayingVirtualList.refresh();
		}
		*/
		
		this.$.headerSubtitle.setContent(AmpacheXL.nowplaying.length+" items");
		
		this.listMode = "play";
		this.$.sortButton.show();
		this.$.sortSpacer.show();
		this.$.editButton.setCaption("Edit");
		this.$.footer.render();
		
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.nowplayingVirtualList.resized();
	},
	previousTrack: function() {
		if(debug) this.log("previousTrack");
		
		var s = {};
		var currentIndex = -1;
		
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
		
			s = AmpacheXL.nowplaying[i];
			
			if(s.id == AmpacheXL.currentSong.id) currentIndex = i;
		
		}
		
		switch(currentIndex) {
			case -1:
				if(debug) this.log("could not find current song");
				break;
			case 0:
				if(debug) this.log("current song is first in list");
				break;
			default:
				if(debug) this.log("found current song at index: "+currentIndex);
				
				this.doPlaySong(AmpacheXL.nowplaying[currentIndex-1]);
				AmpacheXL.nowplayingIndex = currentIndex-1;
				break;
		}
		
		this.$.nowplayingVirtualList.refresh();
		this.doUpdateCounts();
		
		enyo.job("getNextSong", enyo.bind(this, "getNextSong"), 5000);
		
	},
	nextTrack: function() {
		if(debug) this.log("nextTrack");
		
		var s = {};
		var currentIndex = -1;
		
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
		
			s = AmpacheXL.nowplaying[i];
			
			if(s.id == AmpacheXL.currentSong.id) currentIndex = i;
		
		}
		
		switch(currentIndex) {
			case -1:
				if(debug) this.log("could not find current song");
				break;
			case AmpacheXL.nowplaying.length-1:
				if(debug) this.log("current song is last in list: "+AmpacheXL.prefsCookie.nowPlayingEnd);
				
				var actionArray = AmpacheXL.prefsCookie.nowPlayingEnd.split("[]:[]");
				var playAction = actionArray[0];
				var playOrder = actionArray[1];
		
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
				
				if(playAction == "play") {
				
					var row = AmpacheXL.nowplaying[0];
					
					AmpacheXL.nowplayingIndex = 0;
					AmpacheXL.currentSong = row;
					
					this.doPlaySong(row);
					
					this.$.nowplayingVirtualList.refresh();
					this.doUpdateCounts();
					
				} else {
					//
				}
				
				break;
				
			default:
				if(debug) this.log("found current song at index: "+currentIndex);
				
				this.doPlaySong(AmpacheXL.nowplaying[currentIndex+1]);
				AmpacheXL.nowplayingIndex = currentIndex+1;
				break;
		}
		
		this.$.nowplayingVirtualList.refresh();
		this.doUpdateCounts();
		
		enyo.job("getNextSong", enyo.bind(this, "getNextSong"), 5000);
	},
	nowplayingUpdated: function(inPlayAction) {
		if(debug) this.log("nowplayingUpdated: "+inPlayAction);
		
		//check for bad inputs
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
		
			s = AmpacheXL.nowplaying[i];
			
			if((s)&&(s.id)) {
				//song is OK
			} else {
				AmpacheXL.nowplaying.splice(i, 1);
			}
		}
		
		if(inPlayAction == "play") {
			
			//AmpacheXL.audioPlayer.newPlayList(AmpacheXL.nowplaying, false, 0);
			//AmpacheXL.audioPlayer.play();
			
		} else if(AmpacheXL.currentSong.artist) {
			//are already playing a song, so dont interfere
			
			//Playlist will not add duplicated songs so we can enqueue it all
			//AmpacheXL.audioPlayer.enqueuePlayList(AmpacheXL.nowplaying, false);
			
			//this.$.nowplayingVirtualList.refresh();
			//this.doUpdateCounts();
			
		} else {
			
			//AmpacheXL.audioPlayer.newPlayList(AmpacheXL.nowplaying, false, 0);
			//AmpacheXL.audioPlayer.play();
			
		}
		
		
		//AmpacheXL.nowplaying.length = 0;
		//AmpacheXL.nowplaying = AmpacheXL.audioPlayer.getPlaylist();
		
		this.$.nowplayingVirtualList.refresh();
		this.doUpdateCounts();
		
		enyo.job("getNextSong", enyo.bind(this, "getNextSong"), 5000);
	},
	updatePlaybackStatus: function() {
		if(debug) this.log("updatePlaybackStatus");
		
		var currentIndex = -1;
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
		
			s = AmpacheXL.nowplaying[i];
			if(s.id == AmpacheXL.currentSong.id) currentIndex = i;
		
		}
		AmpacheXL.nowplayingIndex = currentIndex;
		
		this.$.nowplayingVirtualList.refresh();
		this.doUpdateCounts();
		
		enyo.job("getNextSong", enyo.bind(this, "getNextSong"), 5000);
	},
	
	setupNowplayingItem: function(inSender, inIndex) {
		//if(debug) this.log("setupNowplayingItem: "+inIndex);
		
		var newIndex = inIndex + this.listOffset;
		
		var row = AmpacheXL.nowplaying[newIndex];
		
		if(row) {
		
			//this.$.nowplayingItem.applyStyle("border-top", "1px solid silver;");
			//this.$.nowplayingItem.applyStyle("border-bottom", "none;");
			
			this.$.nowplayingIndex.setContent(newIndex+1);
			
			if(AmpacheXL.prefsCookie.artOnLists) {
				this.$.listArt.setSrc(row.art);
				this.$.listArt.show();
			} else {
				this.$.listArt.hide();
			}
			
			this.$.nowplayingTitle.setContent(row.title);
			this.$.nowplayingArtist.setContent(row.artist);
			
			this.$.nowplayingAlbum.setContent(row.album);
			this.$.nowplayingTrack.setContent("Track #"+row.track);
			
			if(this.listMode == "edit") {
				this.$.nowplayingAlbumWrapper.hide();
				this.$.nowplayingMoveUp.show();
				this.$.nowplayingMoveUpSpacer.show();
				this.$.nowplayingMoveDown.show();
				this.$.nowplayingMoveDownSpacer.show();
				this.$.nowplayingRemove.show();
			} else {
				this.$.nowplayingAlbumWrapper.show();
				this.$.nowplayingMoveUp.hide();
				this.$.nowplayingMoveUpSpacer.hide();
				this.$.nowplayingMoveDown.hide();
				this.$.nowplayingMoveDownSpacer.hide();
				this.$.nowplayingRemove.hide();
			} 
			
			if(AmpacheXL.currentSong.id == row.id) {
				this.$.nowplayingItem.addClass("selected");
			} else {
				this.$.nowplayingItem.removeClass("selected");
			}
			
			return true;
		
		}
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.listOffset = 0;
		
		this.$.nowplayingVirtualList.punt();
	},
	sortClick: function(inSender, inEvent) {
		if(debug) this.log("sortClick");
		
		this.$.sortPopupMenu.openAtEvent(inEvent);
	},
	sortSelect: function(inSender, inEvent) {
		if(inEvent) {
			if(debug) this.log("sortSelect: "+inEvent.value);
			
			this.listOffset = 0;
			
			switch(inEvent.value) {
				case "shuffle":
					this.shuffleClick();
					break;
				case "artist":
					AmpacheXL.nowplaying.sort(triple_sort_by("artist", "album", "track", false));
					this.finishedMoving();
					break;
				case "album":
					AmpacheXL.nowplaying.sort(double_sort_by("album", "track", false));
					this.finishedMoving();
					break;
				case "track":
					AmpacheXL.nowplaying.sort(sort_by("track", false));
					this.finishedMoving();
					break;
				default: 
					this.log("unknown sort option: "+inEvent.value);
					break;
			}
		}
		
	},
	shuffleClick: function() {
		if(debug) this.log("shuffleClick");
		
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
		
		this.finishedMoving();
	},
	editClick: function() {
		if(debug) this.log("editClick");
		
		switch(this.listMode) {
			case "play":
				this.listMode = "edit";
				//this.$.sortButton.hide();
				//this.$.sortSpacer.hide();
				this.$.editButton.setCaption("Done");
				this.$.footer.render();
				break;
			case "edit":
				this.listMode = "play";
				//this.$.sortButton.show();
				//this.$.sortSpacer.show();
				this.$.editButton.setCaption("Edit");
				this.$.footer.render();
				break;
		}
		
		this.$.nowplayingVirtualList.refresh();
		
	},
	saveClick: function(inSender, inEvent) {
		if(debug) this.log("saveClick");
		
		//this.$.savePopupMenu.setItems([]);
		//this.$.savePopupMenu.openAtEvent(inEvent);
		
		this.$.savePopup.openAtCenter();
	},
	beforeSavePopupOpen: function() {
		if(debug) this.log("beforeSavePopupOpen");
	
		this.$.saveInput.setValue("");
	},
	savePopupOpen: function() {
		if(debug) this.log("savePopupOpen");
		
		//enyo.keyboard.forceShow(0);
		
		this.$.saveInput.forceFocusEnableKeyboard();
	},
	saveNew: function() {
		if(debug) this.log("saveNew: "+this.$.saveInput.getValue());
		
		enyo.keyboard.setManualMode(false);
		
		this.newId = 1;
		
		for(var i = 0; i < AmpacheXL.localPlaylists.length; i++) {
			this.newId = Math.max(this.newId, AmpacheXL.localPlaylists[i].playlist_id);
		}
		
		this.newId++;
		
		
		/*
		var query = 'INSERT INTO localplaylists (playlist_id, name, items, source, oldAuth) VALUES ('+this.newId+', "'+this.$.saveInput.getValue()+'", '+AmpacheXL.nowplaying.length+', "Local", "'+AmpacheXL.connectResponse.auth+'")';	
		
		if(debug) this.log("query: "+query);
		
		//html5sql.process(query, enyo.bind(this, "insertLocalplaylistsSuccess"), enyo.bind(this, "insertLocalplaylistsFailure"));
		
		html5sql.database.transaction(function(tx) {    
			tx.executeSql(query, 
				[], 
				enyo.bind(this, "insertLocalplaylistsSuccess"), 
				enyo.bind(this, "insertLocalplaylistsFailure") 
			);
		}.bind(this));
		*/
		
		var s = {};
		s.type = "playlist";
		s.playlist_id = this.newId;
		s.name = this.$.saveInput.getValue();	
		s.items = AmpacheXL.nowplaying.length;
		s.source = "Local";
		s.oldAuth = AmpacheXL.connectResponse.auth;
		
		AmpacheXL.localPlaylists.push(s);
		
		this.insertLocalplaylistsSuccess();
		
	},
	nowplayingMousedown: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMousedown: "+this.$.nowplayingVirtualList.getScrollTop()) 
		
		this.newClick = true;
		this.listScroll = this.$.nowplayingVirtualList.getScrollTop();
		this.nowplayingMouseTimer = setTimeout(enyo.bind(this, "nowplayingMoreClick", inSender, inEvent), 500);
		
	},
	nowplayingMouseup: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMouseup: "+this.$.nowplayingVirtualList.getScrollTop()) 
		
		clearTimeout(this.nowplayingMouseTimer);
		
		if(this.newClick) this.nowplayingClick(inSender, inEvent);
		
		this.newClick = false;
		
	},
	nowplayingClick: function(inSender, inEvent) {
		if(debug) this.log("nowplayingClick: "+inEvent.rowIndex);
		
		if(Math.abs(this.$.nowplayingVirtualList.getScrollTop() - this.listScroll) > 5) {
		
			if(debug) this.log("change in scroller offset is too large: "+Math.abs(this.$.nowplayingVirtualList.getScrollTop() - this.listScroll));
		
		} else {
		
			var newIndex = inEvent.rowIndex + this.listOffset;
		
			var row = AmpacheXL.nowplaying[newIndex];
			
			AmpacheXL.nowplayingIndex = newIndex;
			AmpacheXL.currentSong = row;
			AmpacheXL.nextSong = row;
			
			if(debug) this.log("nowplayingClick: "+enyo.json.stringify(row));
			
			this.doStartingPlayback(row);
			
			//this.doPlaySong(row);
			if(AmpacheXL.prefsCookie.playerType == "plugin") {
				AmpacheXL.pluginObj.Open(row.url,0);
			} else {
				AmpacheXL.audioPlayer.playTrack(newIndex);
			}
			
			this.$.nowplayingVirtualList.refresh();
			this.doUpdateCounts();
			
			enyo.job("getNextSong", enyo.bind(this, "getNextSong"), 5000);
		}
	},	
	nowplayingMoreClick: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMoreClick: "+inEvent.rowIndex+" with offset:"+this.$.nowplayingVirtualList.getScrollTop());
		
		this.newClick = false;
		
		if(Math.abs(this.$.nowplayingVirtualList.getScrollTop() - this.listScroll) > 5) {
		
			if(debug) this.log("change in scroller offset is too large: "+Math.abs(this.$.nowplayingVirtualList.getScrollTop() - this.listScroll));
		
		} else {
		
			var newIndex = inEvent.rowIndex + this.listOffset;
		
			this.selectedSong = AmpacheXL.nowplaying[newIndex];
			this.selectedIndex = newIndex;
			this.selectedOffsetIndex = inEvent.rowIndex;
			
			if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
				this.$.morePopupMenu.setItems([
					{caption: "Play"},
					{name: "Album: "+this.selectedSong.album, caption: "Album: "+this.selectedSong.album},
					{name: "Artist: "+this.selectedSong.artist, caption: "Artist: "+this.selectedSong.artist},
					{caption: $L("Move"), components: [
						{caption: "Move up"},
						{caption: "Move down"},
						{caption: "Move to top"},
						{caption: "Move to bottom"},
						{caption: "Move to next"},
					]},
					{caption: $L("Remove"), components: [
						{caption: "Remove single song"},
						{caption: "Remove all above this"},
						{caption: "Remove all below this"},
					]},
					/*
					{caption: $L("Web"), components: [
						{name: "Google", caption: "Google"},
						{name: "Wikipedia", caption: "Wikipedia"},
					]},
					
					//download
					*/
				]);
			} else {
				this.$.morePopupMenu.setItems([
					{caption: "Play"},
					{name: "Album: "+this.selectedSong.album, caption: "Album: "+this.selectedSong.album},
					{name: "Artist: "+this.selectedSong.artist, caption: "Artist: "+this.selectedSong.artist},
					{caption: $L("Move"), components: [
						{caption: "Move up"},
						{caption: "Move down"},
						{caption: "Move to top"},
						{caption: "Move to bottom"},
						{caption: "Move to next"},
					]},
					{caption: $L("Download"), components: [
						{caption: "Download single song"},
						{caption: "Download all"},
					]},
					{name: $L("Stream single song"), caption: $L("Stream single song")},
					{caption: $L("Remove"), components: [
						{caption: "Remove single song"},
						{caption: "Remove all above this"},
						{caption: "Remove all below this"},
					]},
					/*
					{caption: $L("Web"), components: [
						{name: "Google", caption: "Google"},
						{name: "Wikipedia", caption: "Wikipedia"},
					]},
					
					//download
					*/
				]);
			}
								
			this.$.morePopupMenu.openAtEvent(inEvent);
		
		}
		
	},
	moreSelect: function(inSender, inEvent) {
		if(inEvent) {
			if(debug) this.log("moreSelect: "+inEvent.value);
			
			switch(inEvent.value) {
				case "Play":
					this.nowplayingClick("nowplaying", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move":
					//
					break;
				case "Move up":
					this.nowplayingMoveUp("nowplaying", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move down":
					this.nowplayingMoveDown("nowplaying", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move to top":
					this.nowplayingMoveToTop("nowplaying", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move to bottom":
					this.nowplayingMoveToBottom("nowplaying", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move to next":
					this.nowplayingMoveToNext("nowplaying", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Download":
					//
					break;
				case "Download single song":
					AmpacheXL.downloads.push(this.selectedSong);
					this.doUpdateCounts();
					break;
				case "Download all":
					for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
						AmpacheXL.downloads.push(AmpacheXL.nowplaying[i]);
					}
					this.doUpdateCounts();
					break;
				case "Stream single song":
					if(window.PalmSystem) {
						this.$.streamSongService.call({id: "com.palm.app.streamingmusicplayer", target: this.selectedSong.url, params: {target: this.selectedSong.url}});
					} else {
						this.doBannerMessage("Streaming only works on webOS devices");
					}
					break;
				case "Remove":
					//
					break;
				case "Remove single song":
					this.nowplayingRemove("nowplaying", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Remove all above this":
					if(this.selectedIndex <= AmpacheXL.nowplayingIndex) {
						AmpacheXL.nowplaying.splice(0, this.selectedIndex);
						this.finishedMoving();
					} else {
						this.doBannerMessage("You cannot remove the song that is currently playing", true);
					}
					break;
				case "Remove all below this":
					if(this.selectedIndex >= AmpacheXL.nowplayingIndex) {
						AmpacheXL.nowplaying.length = this.selectedIndex+1;
						this.finishedMoving();
					} else {
						this.doBannerMessage("You cannot remove the song that is currently playing", true);
					}
					break;
					
				default: 
					
					if(inEvent.value.substring(0,5) == "Album") {
						if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
							this.doUpdateSpinner(true);
							this.doDbRequest("albumsList", "album", row.album);
							this.doViewSelected("albumsList");
						} else {
							this.doUpdateSpinner(true);
							this.doDataRequest("songsList", "album_songs", "&filter="+this.selectedSong.album_id);
							this.doViewSelected("songsList");
						}
					} else if(inEvent.value.substring(0,6) == "Artist") {
						if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
							this.doUpdateSpinner(true);
							this.doDbRequest("artistList", "artist", row.artist);
							this.doViewSelected("artistList");
						} else {
							this.selectedSong.type = "artist";
							this.selectedSong.songs = "all";
							this.selectedSong.name = this.selectedSong.artist;
							this.selectedSong.id = this.selectedSong.artist_id;
							AmpacheXL.selectedArtist = this.selectedSong;
							this.doUpdateSpinner(true);
							this.doDataRequest("albumsList", "artist_albums", "&filter="+this.selectedSong.artist_id);
							this.doViewSelected("albumsList");
						}
					} else {
						this.log("unknown more command: "+inEvent.value);
					}
					
					break;
			}
		}
	},
	nowplayingMoveUp: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMoveUp: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
			
		var row = AmpacheXL.nowplaying.splice(newIndex, 1)[0];
		AmpacheXL.nowplaying.splice(newIndex - 1, 0, row);
		
		this.finishedMoving();
		
	},
	nowplayingMoveDown: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMoveDown: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.nowplaying.splice(newIndex, 1)[0];
		AmpacheXL.nowplaying.splice(newIndex + 1, 0, row);
		
		this.finishedMoving();
		
	},
	nowplayingMoveToTop: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMoveToTop: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.nowplaying.splice(newIndex, 1)[0];
		AmpacheXL.nowplaying.splice(0, 0, row);
		
		this.finishedMoving();
		
	},
	nowplayingMoveToBottom: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMoveToBottom: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.nowplaying.splice(newIndex, 1)[0];
		AmpacheXL.nowplaying.push(row);
		
		this.finishedMoving();
		
	},
	nowplayingMoveToNext: function(inSender, inEvent) {
		if(debug) this.log("nowplayingMoveToNext: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.nowplaying.splice(newIndex, 1)[0];
		
		var currentIndex = -1;
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
		
			s = AmpacheXL.nowplaying[i];
			if(s.id == AmpacheXL.currentSong.id) currentIndex = i;
		
		}
		AmpacheXL.nowplayingIndex = currentIndex;
		
		AmpacheXL.nowplaying.splice(AmpacheXL.nowplayingIndex+1, 0, row);
		
		this.finishedMoving();
		
	},
	nowplayingRemove: function(inSender, inEvent) {
		if(debug) this.log("nowplayingRemove: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		if(AmpacheXL.nowplayingIndex == newIndex) {
			this.doBannerMessage("You cannot remove the song that is currently playing", true);
		} else {
			var row = AmpacheXL.nowplaying.splice(newIndex, 1)[0];
			AmpacheXL.audioPlayer.playList.removeSong(inEvent.rowIndex);
		}
		
		this.finishedMoving();
	},
	finishedMoving: function() {
		if(debug) this.log("finishedMoving");
		
		var currentIndex = -1;
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
		
			s = AmpacheXL.nowplaying[i];
			if(s.id == AmpacheXL.currentSong.id) currentIndex = i;
		
		}
		AmpacheXL.nowplayingIndex = currentIndex;
		
		this.$.nowplayingVirtualList.refresh();
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			//
		} else {
			AmpacheXL.audioPlayer.reorderPlayList(AmpacheXL.nowplaying, AmpacheXL.currentSong, AmpacheXL.currentSong.id);
		}
		
		this.doUpdateCounts();
		this.$.headerSubtitle.setContent(AmpacheXL.nowplaying.length+" items");
		
		enyo.job("getNextSong", enyo.bind(this, "getNextSong"), 5000);
	},
	getNextSong: function() {
		if(debug) this.log("getNextSong");
		
		var currentIndex = -1;
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
		
			s = AmpacheXL.nowplaying[i];
			if(s.id == AmpacheXL.currentSong.id) currentIndex = i;
		
		}
		AmpacheXL.nowplayingIndex = currentIndex;
		
		var row = AmpacheXL.nowplaying[AmpacheXL.nowplayingIndex+1];
		
		if(row) {
		
			AmpacheXL.nextSong = row;
			
			if(AmpacheXL.prefsCookie.playerType == "plugin") {
				AmpacheXL.pluginObj.SetNext(row.url, 0, 0);
			} else {
			
				//this.doQueueNextSong(row);
			}
		
		} else {
			if(AmpacheXL.prefsCookie.playerType == "plugin") {
				AmpacheXL.pluginObj.SetNoNext(0);
			}
		}
	},
	
	insertLocalplaylistsSuccess: function(transaction, results) {
		//if(debug) this.log("insertLocalplaylistsSuccess: "+enyo.json.stringify(results));
		
		if(debug) this.log("insertLocalplaylistsSuccess: "+this.newId);
		
		this.$.savePopup.close();
		
		this.doUpdateSpinner(true);
		
		var sqlArray = [];
		var s = {};
		
		for(var i = 0; i < AmpacheXL.nowplaying.length; i++) {
			s = {};
			s = AmpacheXL.nowplaying[i];
			
			sqlArray.push('INSERT INTO localplaylist_songs (playlist_id, id, title, artist, artist_id, album, album_id, track, time, oldUrl, oldArt) VALUES ('+this.newId+', '+s.id+', "'+s.title+'", "'+s.artist+'", '+s.artist_id+', "'+s.album+'", '+s.album_id+', '+s.track+', '+s.time+', "'+s.url+'", "'+s.art+'");');
			
		}
		
		//if(debug) this.log("about to do sqlArray: "+enyo.json.stringify(this.sqlArray));
		html5sql.process(sqlArray, enyo.bind(this, "insertLocalplaylistsSongsSuccess"), enyo.bind(this, "insertLocalplaylistsSongsFailure"));
		
	},
	insertLocalplaylistsFailure: function() {
		if(debug) this.log("insertLocalplaylistsFailure");
		
		this.$.savePopup.close();
		
		this.doBannerMessage("Error inserting playlist name into local database", true);
		
	},
	insertLocalplaylistsSongsSuccess: function() {
		if(debug) this.log("insertLocalplaylistsSongsSuccess");
		
		this.doUpdateSpinner(false);
		
		this.doBannerMessage("Finished saving playlist");
		
		/*
		html5sql.database.transaction(function(tx) {    
			tx.executeSql('SELECT * FROM localplaylists', 
				[], 
				enyo.bind(this, "localplaylistsSelectResults"), 
				enyo.bind(this, "localplaylistsSelectFailure") 
			);
		}.bind(this));
		*/
		
		if(debug) this.log("AmpacheXL.localPlaylists: "+enyo.json.stringify(AmpacheXL.localPlaylists));
		
		this.doUpdateCounts();
	},
	insertLocalplaylistsSongsFailure: function() {
		if(debug) this.log("insertLocalplaylistsSongsFailure");
		
		this.doUpdateSpinner(false);
		
		this.doBannerMessage("Error inserting playlist name into local database", true);
		
	},
	localplaylistsSelectResults: function(transaction, results) {
		//if(debug) this.log("localplaylistsSelectResults: "+enyo.json.stringify(results));
		if(debug) this.log("localplaylistsSelectResults");

		var playlists = [];
		
		for(var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
			//if(debug) this.log("row: "+enyo.json.stringify(row));
			
			//(playlist_id INTEGER PRIMARY KEY, name TEXT, items INTEGER, source TEXT, oldAuth TEXT)

			row.type = "playlist";
			
			playlists.push(row);

		}
		
		AmpacheXL.localPlaylists.length = 0;
		AmpacheXL.localPlaylists = playlists;
		
		if(debug) this.log("AmpacheXL.localPlaylists: "+enyo.json.stringify(AmpacheXL.localPlaylists));
		
		this.doUpdateCounts();
		
	},
	localplaylistsSelectFailure: function(inError) {
		if(debug) this.error("localplaylistsSelectFailure: "+inError.message);
		
	},
	
});

