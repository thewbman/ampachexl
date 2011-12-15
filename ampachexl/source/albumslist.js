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
	name: "AlbumsList",
	kind: "VFlexBox",
	className: "AlbumsList listContent",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onOpenWeb: "",
		onBannerMessage: "",
		onPreviousView: "",
		onSavePreferences: "",
		onDbRequest: "",
		onUpdateCounts: "",
	},
	
	activeView: false,
	
	fullResultsList: [],
	resultsList: [],
	
	sqlArray: [],
	
	components: [
		{kind: "DbService", dbKind: "com.palm.media.audio.album:1", onFailure: "dbFailure", components: [
            {name: "dbAlbumsService", method: "find", onSuccess: "dbAlbumsSuccess"}                           
        ]},
		
		{name: "allAlbumsRequestService", kind: "WebService", handleAs: "txt", onSuccess: "allAlbumsRequestResponse", onFailure: "allAlbumsRequestFailure"},
		
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Albums", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "albumsSearchInputWrapper", className: "searchInputWrapper", kind: "Item", layoutKind: "HFlexLayout", components: [
			{name: "albumsSearchInput", kind: "Input", hint: "Filter", autoCapitalize: "lowercase", oninput: "albumsInput", flex: 1, components: [
				{name: "albumsSearchClear", kind: "Image", src: "images/11-x@2x.png", showing: false, className: "searchClear", onclick: "resetAlbumsSearch"},
				{name: "albumsSearchSpinner", kind: "Spinner"},
			]}
		]},
							
		{name: "albumsVirtualList", kind: "VirtualList", onSetupRow: "setupAlbumsItem", flex: 1, components: [
			{name: "albumsDivider", kind: "Divider"},
			{name: "albumsItem", kind: "Item", className: "listItem", layoutKind: "HFlexLayout", align: "center", onclick: "albumsClick", components: [
				{name: "listArt", kind: "Image", className: "listArt"},
				{kind: "VFlexBox", flex: 1, components: [
					{name: "albumsTitle", className: "title"},
					{name: "albumsArtist", className: "subtitle"},
				]},
				{kind: "VFlexBox", flex: 1, components: [
					{name: "albumsYear", className: "count"},
					{name: "albumsSongCount", className: "count"},
				]},
			]},
		]},
		
		{name: "footer", kind: "Toolbar", layoutKind: "HFlexLayout", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
			{kind: "Spacer"},
			{name: "refreshCommandButton", icon: "images/menu-icon-refresh.png", onclick: "getAlbums"},
			{kind: "Spacer"},
			{caption: "Random", onclick: "randomClick"},
			//name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
		]},
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
	},
	
	activate: function(inMode) {
		if(debug) this.log("activate");
		
		this.activeView = true;
		
		this.resize();
		
		this.$.headerTitle.setContent("Albums");
			
		/*	
		if(AmpacheXL.selectedArtist) {
			//this.$.headerTitle.setContent("Albums ["+AmpacheXL.selectedArtist.name+"]");
		} else {
			//this.$.headerTitle.setContent("Albums [All Artists]");
			
			if((this.fullResultsList.length != AmpacheXL.connectResponse.albums)&&(AmpacheXL.allAlbums.length > 0)) {
				this.fullResultsList = AmpacheXL.allAlbums.concat([]);
				
				//this.resetAlbumsSearch();
				this.$.albumsVirtualList.punt();
			}
		}
		*/
		
	},
	deactivate: function() {
		if(debug) this.log("deactivate");
		
		this.activeView = false;
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.albumsVirtualList.resized();
	},
	dataRequestResponse: function(inResponse) {
		if(debug) this.log("dataRequestResponse");
		
		this.sqlArray.length = 0;
		
		/*
		<album id="2910">
				<name>Back in Black</name>
				<artist id="129348">AC/DC</artist>
				<year>1984</year>
				<tracks>12</tracks>
				<disk>1</disk>
				<tag id="2481" count="2">Rock & Roll</tag>
				<tag id="2482" count="1">Rock</tag>
				<tag id="2483" count="1">Roll</tag>
				<art>http://localhost/image.php?id=129348</art>
				<preciserating>3</preciserating>
				<rating>2.9</rating>
		</album>
		*/
		
		this.fullResultsList.length = 0;
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var errorNodes, singleErrorNode;
		errorNodes = xmlobject.getElementsByTagName("error");
		for(var i = 0; i < errorNodes.length; i++) {
			singleErrorNode = errorNodes[i];
			
			this.doBannerMessage("Error: "+singleErrorNode.childNodes[0].nodeValue, true);
			
		}
		
		var albumsNodes, singleAlbumNode, singleAlbumChildNode;
		var s = {};
		
		albumsNodes = xmlobject.getElementsByTagName("album");
		for(var i = 0; i < albumsNodes.length; i++) {
			singleAlbumNode = albumsNodes[i];
			s = {};
			
			s.id = singleAlbumNode.getAttributeNode("id").nodeValue;
			
			s.name = "[Unknown (Broken)]";
			s.artist = "[Unknown (Broken)]";
			s.artist_id = -1;
			s.year = 0;
			s.tracks = 0;
			s.art = "[Unknown (Broken)]";
			
			for(var j = 0; j < singleAlbumNode.childNodes.length; j++) {
				singleAlbumChildNode = singleAlbumNode.childNodes[j];
				
				switch(singleAlbumChildNode.nodeName) {
					case "name":
						if(singleAlbumChildNode.childNodes[0]) s.name = singleAlbumChildNode.childNodes[0].nodeValue.replace(/"/g,"");
						break;
					case "artist":
						if(singleAlbumChildNode.childNodes[0]) s.artist = singleAlbumChildNode.childNodes[0].nodeValue.replace(/"/g,"");
						s.artist_id = singleAlbumChildNode.getAttributeNode("id").nodeValue;
						break;
					case "year":
						if(singleAlbumChildNode.childNodes[0]) s.year = singleAlbumChildNode.childNodes[0].nodeValue;
						break;
					case "tracks":
						if(singleAlbumChildNode.childNodes[0]) s.tracks = singleAlbumChildNode.childNodes[0].nodeValue;
						break;
					case "art":
						if(singleAlbumChildNode.childNodes[0]) s.art = singleAlbumChildNode.childNodes[0].nodeValue;
						break;
				}
				
			}
		
			s.type = "album";
			
			this.fullResultsList.push(s);
			
			this.sqlArray.push('INSERT INTO albums (id, name, artist, artist_id, tracks, year, oldArt) VALUES ('+s.id+', "'+s.name+'", "'+s.artist+'", '+s.artist_id+', '+s.tracks+', "'+s.year+'", "'+s.art+'");');
		
		}
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		switch(AmpacheXL.prefsCookie.albumsSort) {
			case "album":
				this.fullResultsList.sort(sort_by("name", false));
				break;
			case "year":
				this.fullResultsList.sort(double_sort_by("year", "name", false));
				break;
			default:
				this.fullResultsList.sort(sort_by("name", false));
				break;
		}
		
		if(this.fullResultsList.length == AmpacheXL.connectResponse.albums) {
			if(debug) this.log("was all albums, now saving");
			
			//if(debug) this.log("about to do sqlArray: "+enyo.json.stringify(this.sqlArray));
			html5sql.process(this.sqlArray, enyo.bind(this, "insertSuccess"), enyo.bind(this, "insertFailure"));
		
			AmpacheXL.allAlbums = this.fullResultsList.concat([]);
			
			AmpacheXL.prefsCookie.oldAlbumsAuth  = AmpacheXL.connectResponse.auth;
			//window.localStorage.setItem("allAlbums", enyo.json.stringify(AmpacheXL.allAlbums));
		}
		
		this.doSavePreferences();
		
		if(debug) this.log("AmpacheXL.selectedArtist: "+enyo.json.stringify(AmpacheXL.selectedArtist));
		
		if((AmpacheXL.selectedArtist)&&(AmpacheXL.selectedArtist.type == "artist")) {
			this.fullResultsList.splice(0,0,AmpacheXL.selectedArtist);
			this.fullResultsList[0].isArtist = true;
		}
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetAlbumsSearch();
		
	},
	allAlbums: function(inOther) {
		if(debug) this.log("allAlbums AmpacheXL.allAlbums.length: "+AmpacheXL.allAlbums.length+" AmpacheXL.connectResponse.albums: "+AmpacheXL.connectResponse.albums+" AmpacheXL.prefsCookie.oldAlbumsCount: "+AmpacheXL.prefsCookie.oldAlbumsCount);
		
		this.doUpdateSpinner(true);
		
		this.fullResultsList.length = 0;
		this.resultsList.length = 0;
		
		this.dbSearchProperty = null;
			
		if(AmpacheXL.allAlbums.length >= AmpacheXL.connectResponse.albums) {
		
			this.fullResultsList = AmpacheXL.allAlbums.concat([]);
			
			switch(AmpacheXL.prefsCookie.albumsSort) {
				case "album":
					this.fullResultsList.sort(sort_by("name", false));
					break;
				case "year":
					this.fullResultsList.sort(double_sort_by("year", "name", false));
					break;
				default:
					this.fullResultsList.sort(sort_by("name", false));
					break;
			}
			
			this.resetAlbumsSearch();
			
			if(inOther == "random") this.doViewSelected("random");
		
		} else if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.inCommand = inOther;
		
			this.doUpdateSpinner(true);
			this.$.dbAlbumsService.call({query:{"from":"com.palm.media.audio.album:1"}});
		
		} else if(AmpacheXL.prefsCookie.oldAlbumsCount == AmpacheXL.connectResponse.albums) {
			if(debug) this.log("have correct number of saved albums in DB");
			
			if(inOther == "random") this.showRandom = true;
			
			this.doUpdateSpinner(true);
			
			this.resultsList.splice(0,0,{name: "Loading locally saved "+AmpacheXL.connectResponse.albums+" albums", artist: "", album: "", tracks: AmpacheXL.connectResponse.songs, url: "", art: ""});
			this.$.albumsVirtualList.punt();
			
			//this.resultsList.splice(0,0,{title: "Loading locally saved "+AmpacheXL.connectResponse.artists+" songs", artist: "", album: "", track: AmpacheXL.connectResponse.albums, url: "", art: ""});
			//this.$.artistsVirtualList.punt();
			
			html5sql.database.transaction(function(tx) {    
				tx.executeSql('SELECT * FROM albums', 
					[], 
					enyo.bind(this, "selectResults"), 
					enyo.bind(this, "selectFailure") 
				);
			}.bind(this));
			
		} else {
			this.doUpdateSpinner(true);
			
			this.getAlbums();
		}
	},
	dbRequest: function(inProperty, inParameters) {
		if(debug) this.log("dbRequest: "+inProperty+" "+inParameters);
		
		this.doUpdateSpinner(true);
		
		//this.$.dbAlbumsService.call({query:{"from":"com.palm.media.audio.album:1", "where":[{"prop":inProperty,"op":"=","val":inParameters}]}});
		this.dbSearchProperty = inProperty;
		this.dbSearchValue = inParameters;
		
		if(AmpacheXL.allAlbums.length > 0) {
			this.fullResultsList = AmpacheXL.allAlbums.concat([]);
			this.dbFilterAlbums();
		} else {
			this.$.dbAlbumsService.call({query:{"from":"com.palm.media.audio.album:1"}});
		}
	},
	
	
	dbAlbumsSuccess: function(inSender, inResponse) {
        //this.log("dbAlbumsSuccess, results=" + enyo.json.stringify(inResponse));
        this.log("dbAlbumsSuccess");
		
		this.fullResultsList.length = 0;
		
		var s = {}, t = {};
		
		for(var i = 0; i < inResponse.results.length; i++) {
			s = inResponse.results[i];
			t = {name: "[Unknown (Broken)]", artist: "[Unknown (Broken)]", artist_id: -1, year: 0, tracks: 0, art: "images/blank.jpg"};
			
			t.id = s._id;
			//t._kind = s._kind;
			t.name = s.name;
			t.artist = s.artist;
			t.tracks = s.total.tracks;
			t.genre = s.genre;
			
			if(s.thumbnails[0]) t.art = s.thumbnails[0].data.path;
			
			if(!t.art) t.art = "images/blank.jpg";
			
			t.type = "album";
			
			
			//if(debug) this.log("adding new album: "+enyo.json.stringify(t));
			
			this.fullResultsList.push(t);
		}
		
		switch(AmpacheXL.prefsCookie.albumsSort) {
			case "album":
				this.fullResultsList.sort(sort_by("name", false));
				break;
			case "year":
				this.fullResultsList.sort(double_sort_by("year", "name", false));
				break;
			default:
				this.fullResultsList.sort(sort_by("name", false));
				break;
		}
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		AmpacheXL.connectResponse.albums = this.fullResultsList.length;
		
		AmpacheXL.allAlbums = this.fullResultsList.concat([]);
		
		
		this.dbFilterAlbums();
		//this.resetAlbumsSearch();
		
    },          
    dbFailure: function(inSender, inError, inRequest) {
        this.error(enyo.json.stringify(inError));
    },
	dbFilterAlbums: function() {
		if(debug) this.log("dbFilterAlbums");
		
		if(this.dbSearchProperty) {
		
			var s = {};
		
			for(var i = this.fullResultsList.length; i > 0; i--) {
				s = this.fullResultsList[i-1];
				
				if(s[this.dbSearchProperty] == this.dbSearchValue) {
					//matches search - keep
				} else {
					//if(debug) this.log("removing item: "+enyo.json.stringify(s)+" because "+this.dbSearchProperty+" != "+this.dbSearchValue);
					
					this.fullResultsList.splice(i-1, 1);
				}
			}
		
		} else if(this.inCommand == "random") {
			this.doViewSelected("random");
			this.inCommand = null;
		}
		
		
		if(debug) this.log("AmpacheXL.selectedArtist: "+enyo.json.stringify(AmpacheXL.selectedArtist));
		
		if((AmpacheXL.selectedArtist)&&(AmpacheXL.selectedArtist.type == "artist")) {
			this.fullResultsList.splice(0,0,AmpacheXL.selectedArtist);
			this.fullResultsList[0].isArtist = true;
		}
		
		this.resetAlbumsSearch();
	
	},
	
	
	getAlbums: function() {
		if(debug) this.log("getAlbums");
		
		this.doUpdateSpinner(true);
		
		if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.$.dbAlbumsService.call({query:{"from":"com.palm.media.audio.album:1"}});
			
		} else {
			
			AmpacheXL.prefsCookie.oldAlbumsCount = 0;
			
			html5sql.process("DELETE FROM albums;", enyo.bind(this, "truncateSuccess"), enyo.bind(this, "truncateFailure"));
			this.sqlArray.length = 0;
			
			this.fullResultsList.length = 0;
			this.resultsList.length = 0;
			
			this.$.headerSubtitle.setContent("0 albums");
			
			this.$.albumsVirtualList.punt();
			
			this.resultsList.push({name: "Attempting to get "+AmpacheXL.connectResponse.albums+" albums", artist: "", album: "", tracks: AmpacheXL.connectResponse.albums, track: AmpacheXL.connectResponse.albums, url: "", art: ""});
			this.$.albumsVirtualList.punt();
				
			//this.allSongsOffset = 0;
			this.getSomeAlbums(0);
		
		}
	},
	getSomeAlbums: function(inOffset) {
		if(debug) this.log("getSomeAlbums at offset "+inOffset);
		
		if(AmpacheXL.connectResponse.success) {
		
			var requestUrl = AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].url;
			requestUrl += "/server/xml.server.php?";
			requestUrl += "auth="+AmpacheXL.connectResponse.auth;
			requestUrl += "&action=albums";
			requestUrl += "&offset="+inOffset;
			
			if(AmpacheXL.prefsCookie.limitCount == "all") {
				requestUrl += "&limit="+AmpacheXL.connectResponse.albums;
			} else {
				requestUrl += "&limit="+AmpacheXL.prefsCookie.limitCount;
			}
		
			this.$.allAlbumsRequestService.setUrl(requestUrl);
			if(debug) this.log("allAlbumsRequestService url: "+this.$.allAlbumsRequestService.getUrl());
			this.$.allAlbumsRequestService.call();
		
		}
	},
	allAlbumsRequestResponse: function(inSender, inResponse) {
		//if(debug) this.log("allAlbumsRequestResponse: "+inResponse);
		if(debug) this.log("allAlbumsRequestResponse");
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var songsNodes, singleSongNode, singleSongChildNode;
		var s = {};
		
		
		/*
		<album id="2910">
				<name>Back in Black</name>
				<artist id="129348">AC/DC</artist>
				<year>1984</year>
				<tracks>12</tracks>
				<disk>1</disk>
				<tag id="2481" count="2">Rock & Roll</tag>
				<tag id="2482" count="1">Rock</tag>
				<tag id="2483" count="1">Roll</tag>
				<art>http://localhost/image.php?id=129348</art>
				<preciserating>3</preciserating>
				<rating>2.9</rating>
		</album>
		*/
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var errorNodes, singleErrorNode;
		errorNodes = xmlobject.getElementsByTagName("error");
		for(var i = 0; i < errorNodes.length; i++) {
			singleErrorNode = errorNodes[i];
			
			this.doBannerMessage("Error: "+singleErrorNode.childNodes[0].nodeValue, true);
			
		}
		
		var albumsNodes, singleAlbumNode, singleAlbumChildNode;
		var s = {};
		
		albumsNodes = xmlobject.getElementsByTagName("album");
		for(var i = 0; i < albumsNodes.length; i++) {
			singleAlbumNode = albumsNodes[i];
			s = {};
			
			s.id = singleAlbumNode.getAttributeNode("id").nodeValue;
				
			s.name = "[Unknown (Broken)]";
			s.artist = "[Unknown (Broken)]";
			s.artist_id = -1;
			s.year = 0;
			s.tracks = 0;
			s.art = "[Unknown (Broken)]";
			
			for(var j = 0; j < singleAlbumNode.childNodes.length; j++) {
				singleAlbumChildNode = singleAlbumNode.childNodes[j];
				
				switch(singleAlbumChildNode.nodeName) {
					case "name":
						if(singleAlbumChildNode.childNodes[0]) s.name = singleAlbumChildNode.childNodes[0].nodeValue.replace(/"/g,"");
						break;
					case "artist":
						if(singleAlbumChildNode.childNodes[0]) s.artist = singleAlbumChildNode.childNodes[0].nodeValue.replace(/"/g,"");
						s.artist_id = singleAlbumChildNode.getAttributeNode("id").nodeValue;
						break;
					case "year":
						if(singleAlbumChildNode.childNodes[0]) s.year = singleAlbumChildNode.childNodes[0].nodeValue;
						break;
					case "tracks":
						if(singleAlbumChildNode.childNodes[0]) s.tracks = singleAlbumChildNode.childNodes[0].nodeValue;
						break;
					case "art":
						if(singleAlbumChildNode.childNodes[0]) s.art = singleAlbumChildNode.childNodes[0].nodeValue;
						break;
				}
				
			}
		
			s.type = "album";
			
			this.fullResultsList.push(s);
			
			this.sqlArray.push('INSERT INTO albums (id, name, artist, artist_id, tracks, year, oldArt) VALUES ('+s.id+', "'+s.name+'", "'+s.artist+'", '+s.artist_id+', '+s.tracks+', "'+s.year+'", "'+s.art+'");');
		
		}
		
		switch(AmpacheXL.prefsCookie.albumsSort) {
			case "album":
				this.fullResultsList.sort(sort_by("name", false));
				break;
			case "year":
				this.fullResultsList.sort(double_sort_by("year", "name", false));
				break;
			default:
				this.fullResultsList.sort(sort_by("name", false));
				break;
		}
		
		if((this.fullResultsList.length >= AmpacheXL.connectResponse.albums)||(AmpacheXL.prefsCookie.limitCount == "all")) {
			if(debug) this.log("finished getting all albums: "+this.fullResultsList.length);
			
			AmpacheXL.allAlbums = this.fullResultsList.concat([]);
			
			AmpacheXL.prefsCookie.oldAlbumsAuth  = AmpacheXL.connectResponse.auth;
			
			this.doSavePreferences();
			
			//if(debug) this.log("about to do sqlArray: "+enyo.json.stringify(this.sqlArray));
			html5sql.process(this.sqlArray, enyo.bind(this, "insertSuccess"), enyo.bind(this, "insertFailure"));
		
			this.resetAlbumsSearch();
			
		} else {
			if(debug) this.log("got some albums ("+this.fullResultsList.length+") but less than total ("+AmpacheXL.connectResponse.albums+")");
			
			if(this.fullResultsList.length == 1) {
				this.$.headerSubtitle.setContent(this.fullResultsList.length+" album");
			} else {
				this.$.headerSubtitle.setContent(this.fullResultsList.length+" albums");
			}
			
			//this.resultsList.push({title: "Loaded "+this.fullResultsList.length+" of "+AmpacheXL.connectResponse.albums+" songs", artist: "", album: "", track: this.fullResultsList.length, url: "", art: ""});
			this.resultsList.splice(0,0,{name: "Loaded "+this.fullResultsList.length+" of "+AmpacheXL.connectResponse.albums+" albums", artist: "", album: "", tracks: this.fullResultsList.length, url: "", art: ""});
			this.$.albumsVirtualList.punt();
			
			if(this.activeView) this.getSomeAlbums(this.fullResultsList.length);
		}
	},
	resetAlbumsSearch: function() {
		if(debug) this.log("resetAlbumsSearch");
		
		this.dbSearchProperty = null;
		
		this.doUpdateCounts();
		
		this.$.albumsSearchInput.setValue("");
		this.$.albumsSearchClear.hide();
		this.$.albumsSearchSpinner.hide();
		
		this.finishedGettingAlbums();
	
	},
	finishedGettingAlbums: function() {
		if(debug) this.log("finishedGettingAlbums");
		
		this.resultsList.length = 0;
		this.resultsList = this.filterAlbums(this.fullResultsList);
		
		if(this.resultsList.length == 1) {
			this.$.headerSubtitle.setContent(this.resultsList.length+" album");
		} else {
			this.$.headerSubtitle.setContent(this.resultsList.length+" albums");
		}
		
		this.$.albumsVirtualList.punt();
		
		this.doUpdateSpinner(false);
		
	},
	filterAlbums: function(inList) {
		if(debug) this.log("filterAlbums with list of length: "+inList.length);
		
		var finalList = [];
		var s = {};
		var filterString = this.$.albumsSearchInput.getValue().toUpperCase();
		
		for(var i = 0; i < inList.length; i++) {
			s = inList[i];
		
			if(s.name.toUpperCase().indexOf(filterString) >= 0) {
				finalList.push(s);
			} else if(s.type == "artist") {
				//finalList.push(s);
			} else if(s.artist.toUpperCase().indexOf(filterString) >= 0) {
				finalList.push(s);
			} 
		}	
		
		return finalList;
	},
	setupAlbumsItem: function(inSender, inIndex) {
		//if(debug) this.log("setupAlbumsItem: "+inIndex);
		
		var row = this.resultsList[inIndex];
		
		if(row) {
		
			this.setupAlbumsDivider(inIndex);
			/*
			if(AmpacheXL.selectedArtist) {
				this.$.albumsDivider.canGenerate = false;
				//this.$.albumsItem.applyStyle("border-top", "1px solid silver;");
				//this.$.albumsItem.applyStyle("border-bottom", "none;");
			} else {
				this.setupAlbumsDivider(inIndex);
			}
			*/
			
			if(row.isArtist) {
			
				this.$.listArt.hide();
				
				this.$.albumsTitle.setContent("All Albums");	
				this.$.albumsArtist.setContent(row.artist);
				
				if(row.songs == 1) {
					this.$.albumsSongCount.setContent("1 track");
				} else {
					this.$.albumsSongCount.setContent(row.songs+" tracks");
				}

			} else {
			
				if(AmpacheXL.prefsCookie.artOnLists) {
					row.newArt = row.art;
					row.newArt = row.newArt.replace(AmpacheXL.prefsCookie.oldAlbumsAuth, AmpacheXL.connectResponse.auth);
					
					//if(debug) this.log("oldAlbumsAuth: "+AmpacheXL.prefsCookie.oldAlbumsAuth+"   auth: "+AmpacheXL.connectResponse.auth);
					//if(debug) this.log("newArt: "+row.newArt);
			
					this.$.listArt.setSrc(row.newArt);
					this.$.listArt.show();
				} else {
					this.$.listArt.hide();
				}
			
				this.$.albumsTitle.setContent(row.name);
				this.$.albumsArtist.setContent(row.artist);
				this.$.albumsYear.setContent(row.year);
				
				if(row.tracks == 1) {
					this.$.albumsSongCount.setContent("1 track");
				} else {
					this.$.albumsSongCount.setContent(row.tracks+" tracks");
				}
				
			}
			
			
			return true;
		
		}
	},
	setupAlbumsDivider: function(inIndex) {
		
		// use group divider at group transition, otherwise use item border for divider
		var group = this.getAlbumsGroupName(inIndex);
		this.$.albumsDivider.setCaption(group);
		this.$.albumsDivider.canGenerate = Boolean(group);
		if(Boolean(group)) this.$.albumsItem.applyStyle("border-top", "none");
		//this.$.albumsItem.applyStyle("border-bottom", "none;");
    },
	getAlbumsGroupName: function(inIndex) {
		//if(debug) this.log("getAlbumsGroupName at index: "+inIndex);
		
		var r0 = this.resultsList[inIndex-1];
		var r1 = this.resultsList[inIndex];
		
		var a;
		var b;
		
		switch(AmpacheXL.prefsCookie.albumsSort) {
			case "album":
				a = r0 && r0.name.substring(0,1);
				b = r1.name.substring(0,1); 
				if(!enyo.g11n.Char.isLetter(a)) a = "#";
				if(!enyo.g11n.Char.isLetter(b)) b = "#";
				break;
			case "year":
				a = r0 && r0.year;
				b = r1.year;
				break;
			default:
				a = r0 && r0.name.substring(0,1);
				b = r1.name.substring(0,1); 
				if(!enyo.g11n.Char.isLetter(a)) a = "#";
				if(!enyo.g11n.Char.isLetter(b)) b = "#";
				break;
		}
		
		if((inIndex == 0)&&(!this.resultsList[inIndex].isArtist)) {
			return b;
		} else {
			return a != b ? b : null;
		}
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.$.albumsVirtualList.punt();
	},
	albumsInput: function() {
		if(debug) this.log("albumsInput: "+this.$.albumsSearchInput.getValue());
		
		this.$.albumsSearchClear.hide();
		this.$.albumsSearchSpinner.show();
		
		enyo.job("albumsSearch", enyo.bind(this, "albumsSearch"),200);
	},
	albumsSearch: function(inSender) {
		if(debug) this.log("albumsSearch: "+this.$.albumsSearchInput.getValue());
		
		this.$.albumsSearchClear.show();
		this.$.albumsSearchSpinner.hide();
		
		this.finishedGettingAlbums();
		
		//this.$.albumsSearchInputWrapper.show();
		this.$.albumsVirtualList.resized();
	},
	albumsClick: function(inSender, inEvent) {
		if(debug) this.log("albumsClick: "+inEvent.rowIndex);
		
		var row = this.resultsList[inEvent.rowIndex];
		
		AmpacheXL.selectedAlbum = row;
		
		if(debug) this.log("albumsClick: "+enyo.json.stringify(row));
		
		this.doUpdateSpinner(true);
		
		if((AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device")&&(row.isArtist)) {
			this.doDbRequest("songsList", "artist", row.artist);
			this.doViewSelected("songsList");
		} else if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
			this.doDbRequest("songsList", "album", row.name);
			this.doViewSelected("songsList");
		} else if(row.isArtist) {
			this.doDataRequest("songsList", "artist_songs", "&filter="+row.artist_id);
			this.doViewSelected("songsList");
		} else {
			this.doDataRequest("songsList", "album_songs", "&filter="+row.id);
			this.doViewSelected("songsList");
		}		
	},
	randomClick: function() {
		if(debug) this.log("randomClick");
		
		this.doViewSelected("random");
	},
	
	
	truncateSuccess: function() {
		if(debug) this.log("truncateSuccess");
		
	},
	truncateFailure: function() {
		if(debug) this.error("truncateFailure");
		
	},
	insertSuccess: function() {
		if(debug) this.log("insertSuccess");
		
		AmpacheXL.prefsCookie.oldAlbumsCount = this.fullResultsList.length;
		
		this.doSavePreferences();
		
		if(window.PalmSystem) this.doBannerMessage("Finished saving albums");
		
	},
	insertFailure: function(inError) {
		if(debug) this.error("insertFailure: "+inError.message);
		
	},
	selectResults: function(transaction, results) {
		//if(debug) this.log("selectResults: "+enyo.json.stringify(results));
		if(debug) this.log("selectResults");

		for(var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
			//if(debug) this.log("row: "+enyo.json.stringify(row));

			row.type = "album";
			row.art = row.oldArt.replace(AmpacheXL.prefsCookie.oldAlbumsAuth, AmpacheXL.connectResponse.auth);
			
			this.fullResultsList.push(row);

		}
		
		switch(AmpacheXL.prefsCookie.albumsSort) {
			case "album":
				this.fullResultsList.sort(sort_by("name", false));
				break;
			case "year":
				this.fullResultsList.sort(double_sort_by("year", "name", false));
				break;
			default:
				this.fullResultsList.sort(sort_by("name", false));
				break;
		}
		
		AmpacheXL.allAlbums.length = 0;
		AmpacheXL.allAlbums = this.fullResultsList.concat([]);
		
		this.resetAlbumsSearch();
		
		if(this.showRandom) this.doViewSelected("random");;
		
	},
	selectSuccess: function(results) {
		if(debug) this.log("selectSuccess");
		
	},
	selectFailure: function(inError) {
		if(debug) this.error("selectFailure: "+inError.message);
		
		this.getAlbums();
	},
	
});

