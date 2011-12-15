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
	name: "PlaylistsList",
	kind: "VFlexBox",
	className: "PlaylistsList listContent",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onOpenWeb: "",
		onBannerMessage: "",
		onPreviousView: "",
		onUpdateCounts: "",
		onLocalplaylistSongs: "",
	},
	
	activeView: false,
	
	fullResultsList: [],
	resultsList: [],
	
	components: [
	
		{kind: "DbService", dbKind: "com.palm.media.audio.playlist.object:1", onFailure: "dbFailure", components: [
            {name: "dbPlaylistsService", method: "find", onSuccess: "dbPlaylistsSuccess"}                           
        ]},
		
		{name: "confirmDeletePopup", kind: "Popup", lazy: true, scrim: true, onBeforeOpen: "beforeConfirmDeleteOpen", components: [
			{name: "confirmDeletePopupText", style: "text-align: center;"},
			{kind: "Button", caption: "Yes", className: "enyo-button-negative", onclick:"confirmDeleteClick"},
			{kind: "Button", caption: "Cancel", onclick:"cancelConfirmDeleteClick"},
		]},
		
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Playlists", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "playlistsSearchInputWrapper", className: "searchInputWrapper", kind: "Item", layoutKind: "HFlexLayout", components: [
			{name: "playlistsSearchInput", kind: "Input", hint: "Filter", autoCapitalize: "lowercase", oninput: "playlistsInput", flex: 1, components: [
				{name: "playlistsSearchClear", kind: "Image", src: "images/11-x@2x.png", showing: false, className: "searchClear", onclick: "resetPlaylistsSearch"},
				{name: "playlistsSearchSpinner", kind: "Spinner"},
			]}
		]},
							
		{name: "playlistsVirtualList", kind: "VirtualList", onSetupRow: "setupPlaylistsItem", flex: 1, components: [
			{name: "playlistsDivider", kind: "Divider"},
			{name: "playlistsItem", kind: "Item", className: "listItem", layoutKind: "HFlexLayout", align: "center", components: [
				{kind: "VFlexBox", flex: 1, onclick: "playlistsClick", components: [
					{name: "playlistsTitle", className: "title"},
					{name: "playlistsSongCount", className: "subtitle"},
				]},
				{name: "playlistsRemove", kind: "Image", onclick: "playlistsRemove", src: "images/11-x@2x-light.png", className: "playlistsRemove"},
			]},
			
		]},
		
		{name: "footer", kind: "Toolbar", layoutKind: "HFlexLayout", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
			{kind: "Spacer"},
			{name: "refreshCommandButton", icon: "images/menu-icon-refresh.png", onclick: "getPlaylists"},
			{kind: "Spacer"},
			{caption: "New", onclick: "newClick"},
		]},
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
	},
	
	activate: function() {
		if(debug) this.log("activate");
		
		this.activeView = true;
		
		this.resize();
		
		if(this.fullResultsList.length == 0) {
			//this.getPlaylists();
		}
		
	},
	deactivate: function() {
		if(debug) this.log("deactivate");
		
		this.activeView = false;
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.playlistsVirtualList.resized();
	},
	dataRequestResponse: function(inResponse) {
		if(debug) this.log("dataRequestResponse");
		
		/*
		<playlist id="1234">
			<name>The Good Stuff</name>
			<owner>Karl Vollmer</owner>
			<items>50</items>
			<tag id="2481" count="2">Rock & Roll</tag>
			<tag id="2482" count="2">Rock</tag>
			<tag id="2483" count="1">Roll</tag>
			<type>Public</type>
		</playlist>
		*/
		
		this.fullResultsList.length = 0;
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var errorNodes, singleErrorNode;
		errorNodes = xmlobject.getElementsByTagName("error");
		for(var i = 0; i < errorNodes.length; i++) {
			singleErrorNode = errorNodes[i];
			
			this.doBannerMessage("Error: "+singleErrorNode.childNodes[0].nodeValue, true);
			
		}
		
		var playlistsNodes, singlePlaylistNode, singlePlaylistChildNode;
		var s = {};
		
		playlistsNodes = xmlobject.getElementsByTagName("playlist");
		for(var i = 0; i < playlistsNodes.length; i++) {
			singlePlaylistNode = playlistsNodes[i];
			s = {};
			
			s.id = singlePlaylistNode.getAttributeNode("id").nodeValue;
			
			for(var j = 0; j < singlePlaylistNode.childNodes.length; j++) {
				singlePlaylistChildNode = singlePlaylistNode.childNodes[j];
				
				switch(singlePlaylistChildNode.nodeName) {
					case "name":
						s.name = singlePlaylistChildNode.childNodes[0].nodeValue;
						break;
					case "owner":
						s.owner = singlePlaylistChildNode.childNodes[0].nodeValue;
						break;
					case "items":
						s.items = singlePlaylistChildNode.childNodes[0].nodeValue;
						break;
					case "type":
						//s.type = singlePlaylistChildNode.childNodes[0].nodeValue;
						break;
				}
				
			}
		
			s.type = "playlist";
			s.source = "Server";
			
			this.fullResultsList.push(s);
		
		}
		
		if(this.fullResultsList.length == AmpacheXL.connectResponse.playlists) {
			AmpacheXL.allPlaylists = this.fullResultsList.concat([]);
		}
		
		this.fullResultsList.length = 0;
		this.fullResultsList = AmpacheXL.allPlaylists.concat(AmpacheXL.localPlaylists);
		
		this.fullResultsList.sort(double_sort_by("source", "name", false));
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetPlaylistsSearch();
		
	},
	allPlaylists: function() {
		if(debug) this.log("allArtists AmpacheXL.allPlaylists.length: "+AmpacheXL.allPlaylists.length+" AmpacheXL.connectResponse.playlists: "+AmpacheXL.connectResponse.playlists);
		
		this.fullResultsList.length = 0;
		this.resultsList.length = 0;
		
		if(AmpacheXL.allPlaylists.length > 0) {
		
			this.fullResultsList = AmpacheXL.allPlaylists.concat(AmpacheXL.localPlaylists);
		
			this.fullResultsList.sort(double_sort_by("source", "name", false));
		
			this.resetPlaylistsSearch();
			
			this.doUpdateCounts();
			
		} else if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			//this doesnt work - wrong kind name?
			this.doUpdateSpinner(true);
			this.$.dbPlaylistsService.call({query:{"from":"com.palm.media.audio.playlist.object:1"}});
		
		} else {
			this.getPlaylists();
		}
	},
	updateList: function() {
		if(debug) this.log("updateList");
		
		this.fullResultsList.length = 0;
		this.resultsList.length = 0;
		
		this.fullResultsList = AmpacheXL.allPlaylists.concat(AmpacheXL.localPlaylists);
		
		this.fullResultsList.sort(double_sort_by("source", "name", false));
		
		this.resetPlaylistsSearch();
			
	},
	
	
	dbPlaylistsSuccess: function(inSender, inResponse) {
        this.log("dbPlaylistsSuccess, results=" + enyo.json.stringify(inResponse));
        //this.log("dbPlaylistsSuccess");
		
		AmpacheXL.allPlaylists.length = 0;
		
		var s = {}, t = {};
		
		for(var i = 0; i < inResponse.results.length; i++) {
			s = inResponse.results[i];
			t = {name: "Unknown", songs: 0};
			
			t.id = s._id;
			//t._kind = s._kind;
			t.name = s.name;
			t.artists = 0;
			t.albums = s.total.albums;
			t.songs = s.total.tracks;
			
			t.type = "playlist";
			s.source = "Device";
			
			//if(debug) this.log("adding new tag: "+enyo.json.stringify(t));
			
			AmpacheXL.allPlaylists.push(t);
		}
		
		this.fullResultsList = AmpacheXL.allPlaylists.concat(AmpacheXL.localPlaylists);
		
		this.fullResultsList.sort(double_sort_by("source", "name", false));
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetPlaylistsSearch();
			
		this.doUpdateCounts();
		
    },          
    dbFailure: function(inSender, inError, inRequest) {
        this.error(enyo.json.stringify(inError));
    },
	
	
	getPlaylists: function() {
		if(debug) this.log("getPlaylists");
		
		this.doUpdateSpinner(true);
		this.doDataRequest("playlistsList", "playlists", "");
	},
	resetPlaylistsSearch: function() {
		if(debug) this.log("resetPlaylistsSearch");
		
		this.$.playlistsSearchInput.setValue("");
		this.$.playlistsSearchClear.hide();
		this.$.playlistsSearchSpinner.hide();
		
		this.finishedGettingPlaylists();
	
	},
	finishedGettingPlaylists: function() {
		if(debug) this.log("finishedGettingPlaylists");
		
		this.doUpdateCounts();
		
		this.resultsList.length = 0;
		this.resultsList = this.filterPlaylists(this.fullResultsList);
		
		this.$.headerSubtitle.setContent(this.resultsList.length+" playlists");
		
		this.$.playlistsVirtualList.punt();
		
		this.doUpdateSpinner(false);
		
	},
	filterPlaylists: function(inList) {
		if(debug) this.log("filterPlaylists with list of length: "+inList.length);
		
		var finalList = [];
		var s = {};
		var filterString = this.$.playlistsSearchInput.getValue().toUpperCase();
		
		for(var i = 0; i < inList.length; i++) {
			s = inList[i];
		
			if(s.name.toUpperCase().indexOf(filterString) >= 0) {
				finalList.push(s);
			} 
		}	
		
		return finalList;
	},
	setupPlaylistsItem: function(inSender, inIndex) {
		//if(debug) this.log("setupPlaylistsItem: "+inIndex);
		
		var row = this.resultsList[inIndex];
		
		if(row) {
		
			this.setupPlaylistsDivider(inIndex);
			//this.$.playlistsItem.applyStyle("border-top", "1px solid silver;");
			//this.$.playlistsItem.applyStyle("border-bottom", "none;");
			
			this.$.playlistsTitle.setContent(row.name);
			
			if(row.items == 1) {
				this.$.playlistsSongCount.setContent("1 items");
			} else {
				this.$.playlistsSongCount.setContent(row.items+" items");
			}
			
			if(row.source == "Local") {
				this.$.playlistsRemove.show();
			} else {
				this.$.playlistsRemove.hide();
			}
			
			return true;
		
		}
	},
	setupPlaylistsDivider: function(inIndex) {
		
		// use group divider at group transition, otherwise use item border for divider
		var group = this.getPlaylistsGroupName(inIndex);
		this.$.playlistsDivider.setCaption(group);
		this.$.playlistsDivider.canGenerate = Boolean(group);
		if(Boolean(group)) this.$.playlistsItem.applyStyle("border-top", "none");
		//this.$.playlistsItem.applyStyle("border-bottom", "none;");
    },
	getPlaylistsGroupName: function(inIndex) {
		//if(debug) this.log("getPlaylistsGroupName at index: "+inIndex);
		
		var r0 = this.resultsList[inIndex-1];
		var r1 = this.resultsList[inIndex];
		
		var a = r0 && r0.source;
		var b = r1.source;
		
		if(inIndex == 0) {
			return b;
		} else {
			return a != b ? b : null;
		}
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.$.playlistsVirtualList.punt();
	},
	newClick: function() {
		if(debug) this.log("newClick");
		
		this.doBannerMessage("To create a new playlist create one from the Now Playing list", true);
	},
	playlistsInput: function() {
		if(debug) this.log("playlistsInput: "+this.$.playlistsSearchInput.getValue());
		
		this.$.playlistsSearchClear.hide();
		this.$.playlistsSearchSpinner.show();
		
		enyo.job("playlistsSearch", enyo.bind(this, "playlistsSearch"),200);
	},
	playlistsSearch: function(inSender) {
		if(debug) this.log("playlistsSearch: "+this.$.playlistsSearchInput.getValue());
		
		this.$.playlistsSearchClear.show();
		this.$.playlistsSearchSpinner.hide();
		
		this.finishedGettingPlaylists();
		
		//this.$.playlistsSearchInputWrapper.show();
		this.$.playlistsVirtualList.resized();
	},
	playlistsClick: function(inSender, inEvent) {
		if(debug) this.log("playlistsClick: "+inEvent.rowIndex);
		
		var row = this.resultsList[inEvent.rowIndex];
		
		AmpacheXL.selectedPlaylist = row;
		AmpacheXL.selectedAlbum = row;
		
		if(debug) this.log("playlistsClick: "+enyo.json.stringify(row));
		
		if(row.source == "Server") {
		
			this.doUpdateSpinner(true);
			this.doDataRequest("songsList", "playlist_songs", "&filter="+row.id);
			this.doViewSelected("songsList");
			
		} else if(row.source == "Local"){
			this.doUpdateSpinner(true);
			this.doLocalplaylistSongs(row.playlist_id, row.oldAuth);
			this.doViewSelected("songsList");
			
			/*
			this.localPlaylistId = row.playlist_id;
			this.localPlaylistAuth = row.oldAuth;
			
			html5sql.database.transaction(function(tx) {    
				tx.executeSql('SELECT * FROM localplaylist_songs WHERE playlist_id = ?', 
					[this.localPlaylistId], 
					enyo.bind(this, "selectLocalplaylistSongsResults"), 
					enyo.bind(this, "selectLocalplaylistSongsFailures") 
				);
			}.bind(this));
			*/
		}	
		
	},
	playlistsRemove: function(inSender, inEvent) {
		if(debug) this.log("playlistsRemove: "+this.resultsList[inEvent.rowIndex].playlist_id);
		
		this.localPlaylistIndex = inEvent.rowIndex;
		this.localPlaylistId = this.resultsList[inEvent.rowIndex].playlist_id;
		this.localPlaylist = this.resultsList[inEvent.rowIndex];
		
		this.$.confirmDeletePopup.openAtCenter();
		
	},
	beforeConfirmDeleteOpen: function() {
		if(debug) this.log("beforeConfirmDeleteOpen");
		
		this.$.confirmDeletePopupText.setContent('Are you sure you want to delete to local playlist "'+this.localPlaylist.name+'"?');
	},
	confirmDeleteClick: function() {
		if(debug) this.log("confirmDeleteClick");
		
		//html5sql.process("DELETE FROM localplaylists WHERE playlist_id = "+this.localPlaylistId+"; DELETE FROM localplaylist_songs WHERE playlist_id = "+this.localPlaylistId, enyo.bind(this, "deletePlaylistSuccess"), enyo.bind(this, "deletePlaylistFailure"));
		
		AmpacheXL.localPlaylists.splice(this.localPlaylistIndex, 1)[0];
		html5sql.process("DELETE FROM localplaylist_songs WHERE playlist_id = "+this.localPlaylistId, enyo.bind(this, "deletePlaylistSuccess"), enyo.bind(this, "deletePlaylistFailure"));
		
		this.$.confirmDeletePopup.close();
		
	},
	cancelConfirmDeleteClick: function() {
		if(debug) this.log("cancelConfirmDeleteClick");
		
		this.$.confirmDeletePopup.close();
	},
	selectLocalplaylistSongsResults: function(transaction, results) {
		//if(debug) this.log("selectLocalplaylistSongsResults");
		if(debug) this.log("selectLocalplaylistSongsResults: "+enyo.json.stringify(results.rows.item));
		
		var playlistSongs = [];
		
		for(var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
			//if(debug) this.log("row: "+enyo.json.stringify(row));

			row.type = "song";
			row.art = row.oldArt.replace(this.localPlaylistAuth, AmpacheXL.connectResponse.auth);
			row.url = row.oldUrl.replace(this.localPlaylistAuth, AmpacheXL.connectResponse.auth);
			
			playlistSongs.push(row);

		}
		
		if(debug) this.log("playlistSongs: "+enyo.json.stringify(playlistSongs));
		
		this.doUpdateSpinner(false);
	},
	selectLocalplaylistSongsFailures: function() {
		if(debug) this.log("selectLocalplaylistSongsFailures");
		
		this.doUpdateSpinner(false);
		
		this.doBannerMessage("Error getting local playlist songs", true);
	},
	deletePlaylistSuccess: function() {
		if(debug) this.log("deletePlaylistSuccess");
		
		this.doBannerMessage("Successfully deleted playlist");
		
		/*
		html5sql.database.transaction(function(tx) {    
			tx.executeSql('SELECT * FROM localplaylists', 
				[], 
				enyo.bind(this, "localplaylistsSelectResults"), 
				enyo.bind(this, "localplaylistsSelectFailure") 
			);
		}.bind(this));
		*/
		
		this.doUpdateCounts();
		
		this.fullResultsList.length = 0;
		this.fullResultsList = AmpacheXL.allPlaylists.concat(AmpacheXL.localPlaylists);
		
		this.fullResultsList.sort(double_sort_by("source", "name", false));
		
		this.resetPlaylistsSearch();
	},
	deletePlaylistFailure: function() {
		if(debug) this.log("deletePlaylistFailure");
		
		this.doBannerMessage("Error deleting playlist", true);
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
		
		//if(debug) this.log("AmpacheXL.localPlaylists: "+enyo.json.stringify(AmpacheXL.localPlaylists));
		
		this.doUpdateCounts();
		
		this.fullResultsList.length = 0;
		this.fullResultsList = AmpacheXL.allPlaylists.concat(AmpacheXL.localPlaylists);
		
		this.fullResultsList.sort(double_sort_by("source", "name", false));
		
		this.resetPlaylistsSearch();
		
	},
	localplaylistsSelectFailure: function(inError) {
		if(debug) this.error("localplaylistsSelectFailure: "+inError.message);
		
	},
	
});

