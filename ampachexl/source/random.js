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
	name: "Random",
	kind: "VFlexBox",
	className: "Random",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onOpenWeb: "",
		onPlaySong: "",
		onBannerMessage: "",
		onNowplayingUpdated: "",
		onPreviousView: "",
		onUpdateCounts: "",
		onDbRequest: "",
	},
	
	randomAlbums: [],
	
	carouselIndex: 0,
	
	selectedAlbum: {},
	
	components: [
	
		{name: "randomSelectorPopup", kind: "PopupSelect", onSelect: "selectRandomPopup", components: [
			//
		]},
	
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Random Album", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "randomCarouselBox", kind: "HFlexBox", flex: 1, components: [
			{name: "randomCarousel", kind: "Carousel", flex: 1, className: "randomCarousel", onGetLeft: "getLeft", onGetRight: "getRight", onclick: "selectedCarousel"},
		]},
		
		{name: "footer", kind: "Toolbar", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{kind: "Spacer"},
			{name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
		]},
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
	},
	
	activate: function() {
		if(debug) this.log("activate");
		
		this.resize();
		
		if(AmpacheXL.allAlbums.length == 0) {
		
			if(window.localStorage.getItem("allAlbums")) {
				AmpacheXL.allAlbums = enyo.json.parse(window.localStorage.getItem("allAlbums"));
			} else {
				this.doBannerMessage("You need to load all playlists at least once before using the random feature", true);
			}
		}
		
		this.$.randomCarousel.setCenterView(this.getCarouselView(this.carouselIndex));
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.randomCarousel.render();
	},

	getCarouselView: function(inIndex) {
		var randomIndex = parseInt(Math.floor(Math.random()*AmpacheXL.allAlbums.length));
		if(debug) this.log("getCarouselView with index: "+inIndex+" is random album: "+randomIndex);
	
		this.randomAlbums.push({carouselIndex: inIndex, albumId: randomIndex});
	
		var row = AmpacheXL.allAlbums[randomIndex];
		
		if(row) {
	
			row.newArt = row.art;
			row.newArt = row.newArt.replace(AmpacheXL.prefsCookie.oldAlbumsAuth, AmpacheXL.connectResponse.auth);
	
			if(debug) this.log("oldAlbumsAuth: "+AmpacheXL.prefsCookie.oldAlbumsAuth+"   auth: "+AmpacheXL.connectResponse.auth);
			if(debug) this.log("newArt: "+row.newArt);
	
			if(row.tracks == 1) {
				row.tracksText = "1 track";
			} else {
				row.tracksText = row.tracks+" tracks";
			}
	
			return {kind: "VFlexBox", className: "remoteCarousel", flex: 1, align: "center", pack: "justify", owner2: this, components: [
			
					{kind: "Spacer"},
					{name: "randomSongArt_"+row.id, kind: "Image", src: row.newArt, className: "randomSongArt"},
					
					{kind: "Spacer"},
					{name: "randomSongAlbum_"+row.id, content: "Album: "+row.name, allowHtml: true, className: "randomSongAlbum truncating"},
					{name: "randomSongArtist_"+row.id, content: "Artist: "+row.artist, allowHtml: true, className: "randomSongArtist truncating"},
					{name: "randomSongTracks_"+row.id, content: row.tracksText, allowHtml: true, className: "randomSongTracks truncating"},
				
					{kind: "Spacer"},
				]};
				
		} else {
			return false;
		}
								
	},
	getLeft: function(inSender, inSnap) {
		if(debug) this.log("getLeft: "+inSnap);
		inSnap && this.carouselIndex--;
		//return this.getCarouselView(this.carouselIndex-1);
	},
	getRight: function(inSender, inSnap) {
		if(debug) this.log("getRight: "+inSnap);
		inSnap && this.carouselIndex++;
		return this.getCarouselView(this.carouselIndex+1);
	},
	selectedCarousel: function(inSender, inEvent) {
		if(debug) this.log("selectedCarousel and have index: "+this.carouselIndex);
		
		var newIndex = -1;
		
		for(var i = 0; i < this.randomAlbums.length; i++) {
			if(this.carouselIndex == this.randomAlbums[i].carouselIndex) newIndex = this.randomAlbums[i].albumId;
		}
		
		this.selectedAlbum = AmpacheXL.allAlbums[newIndex];
		
		if(debug) this.log("selectedAlbum: "+enyo.json.stringify(this.selectedAlbum));
		
		this.$.randomSelectorPopup.setItems(["Album: "+this.selectedAlbum.name, "Artist: "+this.selectedAlbum.artist, ]);
		this.$.randomSelectorPopup.openAtEvent(inEvent);
		
	},
	selectRandomPopup: function(inSender, inValue) {
		if(debug) this.log("selectRandomPopup: "+inValue.getValue())
		
		var row = this.selectedAlbum;
		
		switch(inValue.getValue().substring(0,5)) {
			case "Album":
				if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
					this.doUpdateSpinner(true);
					this.doDbRequest("songsList", "album", row.name);
					this.doViewSelected("songsList");
				} else {
					this.doUpdateSpinner(true);
					this.doDataRequest("songsList", "album_songs", "&filter="+row.id);
					this.doViewSelected("songsList");
				}
				break;
			case "Artis":		
				if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
					this.doUpdateSpinner(true);
					this.doDbRequest("albumsList", "artist", row.artist);
					this.doViewSelected("albumsList");
				} else {
					row.type = "artist";
					row.songs = "all";
					row.id = row.artist_id;
					row.name = row.artist;
					AmpacheXL.selectedArtist = row;
					this.doUpdateSpinner(true);
					this.doDataRequest("albumsList", "artist_albums", "&filter="+row.artist_id);
					this.doViewSelected("albumsList");
				}
				break;
		}
		
		
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
	},
	
});


