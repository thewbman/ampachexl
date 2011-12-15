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
	name: "LeftMenuKind",
	className: "LeftMenuKind",
	kind: "VFlexBox",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onBannerMessage: "",
		onOpenAppMenu: "",
		onAllItems: "",
	},
		
	
	components: [
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Ampache XL", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "leftMenuScroller", kind: "Scroller", flex: 1, components: [
			{name: "nowplayingItem", showing: false, kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "nowplayingItemIcon", kind: "Image", src: "images/194-note-2.png", className: "menuIcon"},
				{name: "nowplayingItemTitle", content: "Now Playing", flex: 1},
				{name: "nowplayingItemCount"},
			]},
			
			{name: "downloadsItem", showing: false, kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "downloadsItemIcon", kind: "Image", src: "images/57-download.png", className: "menuIcon"},
				{name: "downloadsItemTitle", content: "Downloads", flex: 1},
				{name: "downloadsItemCount"},
			]},
			
			{name: "searchItem", showing: false, kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "searchItemIcon", kind: "Image", src: "images/06-magnify.png", className: "menuIcon"},
				{name: "searchItemTitle", content: "Search", flex: 1},
				//name: "searchItemCount"},
			]},
			
			{name: "randomItem", showing: false, kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "randomItemIcon", kind: "Image", src: "images/05-shuffle.png", className: "menuIcon"},
				{name: "randomItemTitle", content: "Random Album", flex: 1},
				//name: "randomItemCount"},
			]},
			
			{name: "songsItem", showing: true, kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "songsItemIcon", kind: "Image", src: "images/65-note.png", className: "menuIcon"},
				{name: "songsItemTitle", content: "Songs", flex: 1},
				{name: "songsItemCount"},
			]},
			{name: "albumsItem", kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "albumsItemIcon", kind: "Image", src: "images/159-voicemail.png", className: "menuIcon"},
				{name: "albumsItemTitle", content: "Albums", flex: 1},
				{name: "albumsItemCount"},
			]},
			{name: "artistsItem", kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "artistsItemIcon", kind: "Image", src: "images/112-group.png", className: "menuIcon"},
				{name: "artistsItemTitle", content: "Artists", flex: 1},
				{name: "artistsItemCount"},
			]},
			{name: "tagsItem", kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "tagsItemIcon", kind: "Image", src: "images/104-index-cards.png", className: "menuIcon"},
				{name: "tagsItemTitle", content: "Genres", flex: 1},
				{name: "tagsItemCount"},
			]},
			{name: "playlistsItem", showing: false, kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "playlistsItemIcon", kind: "Image", src: "images/179-notepad.png", className: "menuIcon"},
				{name: "playlistsItemTitle", content: "Playlists", flex: 1},
				{name: "playlistsItemCount"},
			]},
			{name: "videosItem", showing: true, kind: "Item", className: "menuItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{name: "videosItemIcon", kind: "Image", src: "images/46-movie-2.png", className: "menuIcon"},
				{name: "videosItemTitle", content: "Videos", flex: 1},
				{name: "videosItemCount"},
			]},
		
		]},		
		
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
		
		this.render();
		
		this.$.header.setContent("Ampache XL");
		
	},
	
	updateCounts: function() {
		if(debug) this.log("updateCounts");
		
		if(AmpacheXL.connected) {
			this.$.headerSubtitle.setContent(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].name);
		} else {
			this.$.headerSubtitle.setContent("");
		}
		
		if(AmpacheXL.nowplaying.length == 0) {
			this.$.nowplayingItemCount.setContent("");
			this.$.nowplayingItem.hide();
		} else {
			this.$.nowplayingItemCount.setContent((AmpacheXL.nowplayingIndex+1)+"/"+AmpacheXL.nowplaying.length);
			this.$.nowplayingItem.show();
		}	
		
		if(AmpacheXL.downloads.length == 0) {
			this.$.downloadsItemCount.setContent("");
			this.$.downloadsItem.hide();
		} else {
			this.$.downloadsItemCount.setContent(AmpacheXL.downloads.length);
			this.$.downloadsItem.show();
		}	
		
		if(AmpacheXL.connectResponse) {
			this.$.songsItemCount.setContent(AmpacheXL.connectResponse.songs);
			this.$.albumsItemCount.setContent(AmpacheXL.connectResponse.albums);
			this.$.artistsItemCount.setContent(AmpacheXL.connectResponse.artists);
			if(AmpacheXL.connectResponse.tags) this.$.tagsItemCount.setContent(AmpacheXL.connectResponse.tags);
			
			if(AmpacheXL.connectResponse.playlists == "") {
				this.$.playlistsItemCount.setContent("");
			} else if(AmpacheXL.connectResponse.playlists == null) {
				this.$.playlistsItemCount.setContent(AmpacheXL.localPlaylists.length);
			} else {
				this.$.playlistsItemCount.setContent(AmpacheXL.localPlaylists.length+"+"+AmpacheXL.connectResponse.playlists);
			}
			
			this.$.videosItemCount.setContent(AmpacheXL.connectResponse.videos);
			
			if(parseInt(AmpacheXL.connectResponse.videos) == 0) {
				this.$.videosItem.hide();
			} else {
				this.$.videosItem.show();
			}
		}
		
		if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
			this.$.searchItem.hide();
			this.$.playlistsItem.hide();
		} else {
			this.$.searchItem.show();
			this.$.playlistsItem.show();
		}
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.doOpenAppMenu();
	},
	itemClick: function(inSender) {
		if(debug) this.log("itemClick: "+inSender.getName());
		
		if(AmpacheXL.connected) {
		
		switch(inSender.getName()) {
			case "nowplayingItem":
				this.doViewSelected("nowplaying");
				break;
				
			case "downloadsItem":
				this.doViewSelected("downloads");
				break;
				
			case "searchItem":
				this.doViewSelected("searchSelector");
				break;
				
			case "randomItem":
				this.doViewSelected("random");
				break;
				
			case "artistsItem":
				this.doAllItems("artistsList");
				this.doViewSelected("artistsList");
				break;
			case "albumsItem":
				AmpacheXL.selectedArtist = null;
				this.doAllItems("albumsList");
				this.doViewSelected("albumsList");
				break;
			case "playlistsItem":
				this.doAllItems("playlistsList");
				this.doViewSelected("playlistsList");
				break;
			case "songsItem":
				AmpacheXL.selectedAlbum = null;
				this.doAllItems("songsList");
				this.doViewSelected("songsList");
				break;
			case "tagsItem":
				/*
				if(AmpacheXL.allTags.length == 0) {
					this.doUpdateSpinner(true);
					this.doDataRequest("tagsList", "tags", "");
				}
				*/
				this.doAllItems("tagsList");
				this.doViewSelected("tagsList");
				break;
				
			case "videosItem":
				/*if(AmpacheXL.allVideos.length == 0) {
					this.doUpdateSpinner(true);
					this.doDataRequest("videosList", "videos", "");
				}*/
				this.doAllItems("videosList");
				this.doViewSelected("videosList");
				break;
		};
		
		} else {
			this.doBannerMessage("You must connect to a host first", true);
		}
	},

});
	

//asdf