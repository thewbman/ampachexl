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
	name: "ArtistsList",
	kind: "VFlexBox",
	className: "ArtistsList listContent",
	
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
		{kind: "DbService", dbKind: "com.palm.media.audio.artist:1", onFailure: "dbFailure", components: [
            {name: "dbArtistsService", method: "find", onSuccess: "dbArtistsSuccess"}                           
        ]},
		
		{name: "allArtistsRequestService", kind: "WebService", handleAs: "txt", onSuccess: "allArtistsRequestResponse", onFailure: "allArtistsRequestFailure"},
		
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Artists", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "artistsSearchInputWrapper", className: "searchInputWrapper", kind: "Item", layoutKind: "HFlexLayout", components: [
			{name: "artistsSearchInput", kind: "Input", hint: "Filter", autoCapitalize: "lowercase", oninput: "artistsInput", flex: 1, components: [
				{name: "artistsSearchClear", kind: "Image", src: "images/11-x@2x.png", showing: false, className: "searchClear", onclick: "resetArtistsSearch"},
				{name: "artistsSearchSpinner", kind: "Spinner"},
			]}
		]},
							
		{name: "artistsVirtualList", kind: "VirtualList", onSetupRow: "setupArtistsItem", flex: 1, components: [
			{name: "artistsDivider", kind: "Divider"},
			{name: "artistsItem", kind: "Item", className: "listItem", layoutKind: "HFlexLayout", align: "center", onclick: "artistsClick", components: [
				{kind: "VFlexBox", flex: 1, components: [
					{name: "artistsTitle", className: "title"},
					{name: "albumsSongCount", className: "subtitle"},
				]},
				{name: "artistsSongCount", className: "count"},
			]},
		]},
		
		{name: "footer", kind: "Toolbar", layoutKind: "HFlexLayout", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{kind: "Spacer"},
			{name: "refreshCommandButton", icon: "images/menu-icon-refresh.png", onclick: "getArtists"},
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
		
		this.activeView = true;
		
		this.resize();
		
		if(this.fullResultsList.length == 0) {
			//this.getArtists();
			this.fullResultsList = AmpacheXL.allArtists.concat([]);
			
			//this.resetArtistsSearch();
			
			this.resultsList.length = 0;
			this.resultsList = this.filterArtists(this.fullResultsList);
			
			this.$.headerSubtitle.setContent(this.resultsList.length+" artists");
			
			this.$.artistsVirtualList.punt();
		}
		
	},
	deactivate: function() {
		if(debug) this.log("deactivate");
		
		this.activeView = false;
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.artistsVirtualList.resized();
	},
	dataRequestResponse: function(inResponse) {
		if(debug) this.log("dataRequestResponse");
		
		/*
		<artist id="12039">
			<name>Metallica</name>
			<albums># of Albums</albums>
			<songs># of Songs</songs>
			<tag id="2481" count="2">Rock & Roll</tag>
			<tag id="2482" count="1">Rock</tag>
			<tag id="2483" count="1">Roll</tag>
			<preciserating>3</preciserating>
			<rating>2.9</rating>
		</artist>
		*/
		
		this.fullResultsList.length = 0;
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var errorNodes, singleErrorNode;
		errorNodes = xmlobject.getElementsByTagName("error");
		for(var i = 0; i < errorNodes.length; i++) {
			singleErrorNode = errorNodes[i];
			
			this.doBannerMessage("Error: "+singleErrorNode.childNodes[0].nodeValue, true);
			
		}
		
		var artistNodes, singleArtistNode, singleArtistChildNode;
		var s = {};
		
		artistsNodes = xmlobject.getElementsByTagName("artist");
		for(var i = 0; i < artistsNodes.length; i++) {
			singleArtistNode = artistsNodes[i];
			s = {};
			
			s.id = singleArtistNode.getAttributeNode("id").nodeValue;
			s.artist_id = singleArtistNode.getAttributeNode("id").nodeValue;
			
			s.name = "[Unknown (Broken)]";
			s.albums = 0;
			s.songs = 0;
				
			for(var j = 0; j < singleArtistNode.childNodes.length; j++) {
				singleArtistChildNode = singleArtistNode.childNodes[j];
				
				switch(singleArtistChildNode.nodeName) {
					case "name":
						if(singleArtistChildNode.childNodes[0]) s.name = singleArtistChildNode.childNodes[0].nodeValue.replace(/"/g,"");
						break;
					case "albums":
						if(singleArtistChildNode.childNodes[0]) s.albums = parseInt(singleArtistChildNode.childNodes[0].nodeValue);
						break;
					case "songs":
						if(singleArtistChildNode.childNodes[0]) s.songs = parseInt(singleArtistChildNode.childNodes[0].nodeValue);
						break;
				}
				
			}
			
			s.type = "artist";
		
			this.fullResultsList.push(s);
			
			this.sqlArray.push('INSERT INTO artists (id, name, albums, songs) VALUES ('+s.id+', "'+s.name+'", '+s.albums+', '+s.songs+');');

		}
		
		this.fullResultsList.sort(sort_by("name", false));
		
		if(this.fullResultsList.length == AmpacheXL.connectResponse.artists) {
			if(debug) this.log("was all artists, now saving");
			
			//if(debug) this.log("about to do sqlArray: "+enyo.json.stringify(this.sqlArray));
			html5sql.process(this.sqlArray, enyo.bind(this, "insertSuccess"), enyo.bind(this, "insertFailure"));
		
			AmpacheXL.allArtists = this.fullResultsList.concat([]);
			
			AmpacheXL.prefsCookie.oldArtistsAuth  = AmpacheXL.connectResponse.auth;
			//window.localStorage.setItem("allArtists", enyo.json.stringify(AmpacheXL.allArtists));
		}
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetArtistsSearch();
		
	},
	allArtists: function() {
		if(debug) this.log("allArtists AmpacheXL.allArtists.length: "+AmpacheXL.allArtists.length+" AmpacheXL.connectResponse.artists: "+AmpacheXL.connectResponse.artists+" AmpacheXL.prefsCookie.oldArtistsCount: "+AmpacheXL.prefsCookie.oldArtistsCount);
		
		this.doUpdateSpinner(true);
		
		this.fullResultsList.length = 0;
		this.resultsList.length = 0;
		
		this.dbSearchProperty = null;
		
		if(AmpacheXL.allArtists.length >= AmpacheXL.connectResponse.artists) {
		
			this.fullResultsList = AmpacheXL.allArtists.concat([]);
			
			this.resetArtistsSearch();
		
		} else if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.doUpdateSpinner(true);
			this.$.dbArtistsService.call({query:{"from":"com.palm.media.audio.artist:1"}});
		
		} else if(AmpacheXL.prefsCookie.oldArtistsCount == AmpacheXL.connectResponse.artists) {
			if(debug) this.log("have correct number of saved artists in DB");
			
			this.doUpdateSpinner(true);
			
			this.resultsList.splice(0,0,{name: "Loading locally saved "+AmpacheXL.connectResponse.artists+" artists", artist: "", album: "", albums: AmpacheXL.connectResponse.artists, songs: 0, url: "", art: ""});
			this.$.artistsVirtualList.punt();
			
			html5sql.database.transaction(function(tx) {    
				tx.executeSql('SELECT * FROM artists', 
					[], 
					enyo.bind(this, "selectResults"), 
					enyo.bind(this, "selectFailure") 
				);
			}.bind(this));
			
		} else {
		
			this.getArtists();
			
		}
	},
	dbRequest: function(inProperty, inParameters) {
		if(debug) this.log("dbRequest: "+inProperty+" "+inParameters);
		
		this.doUpdateSpinner(true);
		
		//this.$.dbArtistsService.call({query:{"from":"com.palm.media.audio.artist:1", "where":[{"prop":inProperty,"op":"=","val":inParameters}]}});
		this.dbSearchProperty = inProperty;
		this.dbSearchValue = inParameters;
		
		if(AmpacheXL.allArtists.length > 0) {
			this.fullResultsList = AmpacheXL.allArtists.concat([]);
			this.dbFilterArtists();
		} else {
			this.$.dbArtistsService.call({query:{"from":"com.palm.media.audio.artist:1"}});
		}
	},
	
	
	dbArtistsSuccess: function(inSender, inResponse) {
        //this.log("dbArtistsSuccess, results=" + enyo.json.stringify(inResponse));
        this.log("dbArtistsSuccess");
		
		this.fullResultsList.length = 0;
		
		var s = {}, t = {};
		
		for(var i = 0; i < inResponse.results.length; i++) {
			s = inResponse.results[i];
			t = {name: "[Unknown (Broken)]", albums: 0, songs: 0};
			
			t.id = s._id;
			//t._kind = s._kind;
			t.name = s.name;
			t.albums = s.total.albums;
			t.songs = s.total.tracks;
			
			t.type = "artist";
			
			
			//if(debug) this.log("adding new artist: "+enyo.json.stringify(t));
			
			this.fullResultsList.push(t);
		}
		
		this.fullResultsList.sort(sort_by("name", false));
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		AmpacheXL.connectResponse.artists = this.fullResultsList.length;
		
		AmpacheXL.allArtists = this.fullResultsList.concat([]);
		
		
		this.dbFilterArtists();
		//this.resetArtistsSearch();
		
    },          
    dbFailure: function(inSender, inError, inRequest) {
        this.error(enyo.json.stringify(inError));
    },
	dbFilterArtists: function() {
		if(debug) this.log("dbFilterArtists");
		
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
		
		} 
		
		this.resetArtistsSearch();
	
	},
	
	
	getArtists: function() {
		if(debug) this.log("getArtists");
		
		this.doUpdateSpinner(true);
		
		if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.$.dbArtistsService.call({query:{"from":"com.palm.media.audio.artist:1"}});
			
		} else {
		
			AmpacheXL.prefsCookie.oldArtistsCount = 0;
			
			html5sql.process("DELETE FROM artists;", enyo.bind(this, "truncateSuccess"), enyo.bind(this, "truncateFailure"));
			this.sqlArray.length = 0;
			
			this.fullResultsList.length = 0;
			this.resultsList.length = 0;
			
			this.$.headerSubtitle.setContent("0 artists");
			this.$.artistsVirtualList.punt();
			
			this.resultsList.push({name: "Attempting to get "+AmpacheXL.connectResponse.artists+" artists", artist: "", album: "", albums: AmpacheXL.connectResponse.artists, songs: 0, track: AmpacheXL.connectResponse.artists, url: "", art: ""});
			this.$.artistsVirtualList.punt();
				
			//this.allSongsOffset = 0;
			this.getSomeArtists(0);
			
		}
	},
	getSomeArtists: function(inOffset) {
		if(debug) this.log("getSomeArtists at offset "+inOffset);
		
		if(AmpacheXL.connectResponse.success) {
		
			var requestUrl = AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].url;
			requestUrl += "/server/xml.server.php?";
			requestUrl += "auth="+AmpacheXL.connectResponse.auth;
			requestUrl += "&action=artists";
			requestUrl += "&offset="+inOffset;
			
			if(AmpacheXL.prefsCookie.limitCount == "all") {
				requestUrl += "&limit="+AmpacheXL.connectResponse.artists;
			} else {
				requestUrl += "&limit="+AmpacheXL.prefsCookie.limitCount;
			}
		
			this.$.allArtistsRequestService.setUrl(requestUrl);
			if(debug) this.log("allArtistsRequestService url: "+this.$.allArtistsRequestService.getUrl());
			this.$.allArtistsRequestService.call();
		
		}
	},
	allArtistsRequestResponse: function(inSender, inResponse) {
		//if(debug) this.log("allArtistsRequestResponse: "+inResponse);
		if(debug) this.log("allArtistsRequestResponse");
		
		/*
		<artist id="12039">
			<name>Metallica</name>
			<albums># of Albums</albums>
			<songs># of Songs</songs>
			<tag id="2481" count="2">Rock & Roll</tag>
			<tag id="2482" count="1">Rock</tag>
			<tag id="2483" count="1">Roll</tag>
			<preciserating>3</preciserating>
			<rating>2.9</rating>
		</artist>
		*/
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var errorNodes, singleErrorNode;
		errorNodes = xmlobject.getElementsByTagName("error");
		for(var i = 0; i < errorNodes.length; i++) {
			singleErrorNode = errorNodes[i];
			
			this.doBannerMessage("Error: "+singleErrorNode.childNodes[0].nodeValue, true);
			
		}
		
		var artistNodes, singleArtistNode, singleArtistChildNode;
		var s = {};
		
		artistsNodes = xmlobject.getElementsByTagName("artist");
		for(var i = 0; i < artistsNodes.length; i++) {
			singleArtistNode = artistsNodes[i];
			s = {};
			
			s.id = singleArtistNode.getAttributeNode("id").nodeValue;
			s.artist_id = singleArtistNode.getAttributeNode("id").nodeValue;
			
			s.name = "[Unknown (Broken)]";
			s.albums = 0;
			s.songs = 0;
				
			for(var j = 0; j < singleArtistNode.childNodes.length; j++) {
				singleArtistChildNode = singleArtistNode.childNodes[j];
				
				switch(singleArtistChildNode.nodeName) {
					case "name":
						if(singleArtistChildNode.childNodes[0]) s.name = singleArtistChildNode.childNodes[0].nodeValue.replace(/"/g,"");
						break;
					case "albums":
						if(singleArtistChildNode.childNodes[0]) s.albums = parseInt(singleArtistChildNode.childNodes[0].nodeValue);
						break;
					case "songs":
						if(singleArtistChildNode.childNodes[0]) s.songs = parseInt(singleArtistChildNode.childNodes[0].nodeValue);
						break;
				}
				
			}
			
			s.type = "artist";
		
			this.fullResultsList.push(s);
			
			this.sqlArray.push('INSERT INTO artists (id, name, albums, songs) VALUES ('+s.id+', "'+s.name+'", '+s.albums+', '+s.songs+');');

		}
		
		this.fullResultsList.sort(sort_by("name", false));
		
		if((this.fullResultsList.length >= AmpacheXL.connectResponse.artists)||(AmpacheXL.prefsCookie.limitCount == "all")) {
			if(debug) this.log("finished getting all artists: "+this.fullResultsList.length);
			
			AmpacheXL.allArtists = this.fullResultsList.concat([]);
			
			AmpacheXL.prefsCookie.oldArtistsAuth  = AmpacheXL.connectResponse.auth;
			
			this.doSavePreferences();
			
			//if(debug) this.log("about to do sqlArray: "+enyo.json.stringify(this.sqlArray));
			html5sql.process(this.sqlArray, enyo.bind(this, "insertSuccess"), enyo.bind(this, "insertFailure"));
		
			this.resetArtistsSearch();
			
		} else {
			if(debug) this.log("got some artists ("+this.fullResultsList.length+") but less than total ("+AmpacheXL.connectResponse.artists+")");
			
			if(this.fullResultsList.length == 1) {
				this.$.headerSubtitle.setContent(this.fullResultsList.length+" artist");
			} else {
				this.$.headerSubtitle.setContent(this.fullResultsList.length+" artists");
			}
			
			//this.resultsList.push({title: "Loaded "+this.fullResultsList.length+" of "+AmpacheXL.connectResponse.artists+" songs", artist: "", album: "", track: this.fullResultsList.length, url: "", art: ""});
			this.resultsList.splice(0,0,{name: "Loaded "+this.fullResultsList.length+" of "+AmpacheXL.connectResponse.artists+" artists", artist: "", album: "", albums: this.fullResultsList.length, songs: 0, url: "", art: ""});
			this.$.artistsVirtualList.punt();
			
			if(this.activeView) this.getSomeArtists(this.fullResultsList.length);
		}
	},
	resetArtistsSearch: function() {
		if(debug) this.log("resetArtistsSearch");
		
		this.dbSearchProperty = null;
		
		this.doUpdateCounts();
		
		this.$.artistsSearchInput.setValue("");
		this.$.artistsSearchClear.hide();
		this.$.artistsSearchSpinner.hide();
		
		this.finishedGettingArtists();
	
	},
	finishedGettingArtists: function() {
		if(debug) this.log("finishedGettingArtists");
		
		this.resultsList.length = 0;
		this.resultsList = this.filterArtists(this.fullResultsList);
		
		this.$.headerSubtitle.setContent(this.resultsList.length+" artists");
		
		this.$.artistsVirtualList.punt();
		
		this.doUpdateSpinner(false);
		
	},
	filterArtists: function(inList) {
		if(debug) this.log("filterArtists with list of length: "+inList.length);
		
		var finalList = [];
		var s = {};
		var filterString = this.$.artistsSearchInput.getValue().toUpperCase();
		
		for(var i = 0; i < inList.length; i++) {
			s = inList[i];
		
			if(s.name.toUpperCase().indexOf(filterString) >= 0) {
				finalList.push(s);
			} 
		}	
		
		return finalList;
	},
	setupArtistsItem: function(inSender, inIndex) {
		//if(debug) this.log("setupArtistsItem: "+inIndex);
		
		var row = this.resultsList[inIndex];
		
		if(row) {
		
			this.setupArtistsDivider(inIndex);
			
			this.$.artistsTitle.setContent(row.name);
			
			if(row.songs == 1) {
				this.$.artistsSongCount.setContent("1 song");
			} else {
				this.$.artistsSongCount.setContent(row.songs+" songs");
			}
			
			if(row.albums == 1) {
				this.$.albumsSongCount.setContent("1 album");
			} else {
				this.$.albumsSongCount.setContent(row.albums+" albums");
			}
			
			return true;
		
		}
	},
	setupArtistsDivider: function(inIndex) {
		
		// use group divider at group transition, otherwise use item border for divider
		var group = this.getArtistsGroupName(inIndex);
		this.$.artistsDivider.setCaption(group);
		this.$.artistsDivider.canGenerate = Boolean(group);
		if(Boolean(group)) this.$.artistsItem.applyStyle("border-top", "none");
		//this.$.artistsItem.applyStyle("border-bottom", "none;");
    },
	getArtistsGroupName: function(inIndex) {
		//if(debug) this.log("getArtistsGroupName at index: "+inIndex);
		
		var r0 = this.resultsList[inIndex-1];
		var r1 = this.resultsList[inIndex];
		
		var a = r0 && r0.name.substring(0,1);
		var b = r1.name.substring(0,1);
		
		if(!enyo.g11n.Char.isLetter(a)) a = "#";
		if(!enyo.g11n.Char.isLetter(b)) b = "#";
		
		if(inIndex == 0) {
			return b;
		} else {
			return a != b ? b : null;
		}
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.$.artistsVirtualList.punt();
	},
	artistsInput: function() {
		if(debug) this.log("artistsInput: "+this.$.artistsSearchInput.getValue());
		
		this.$.artistsSearchClear.hide();
		this.$.artistsSearchSpinner.show();
		
		enyo.job("artistsSearch", enyo.bind(this, "artistsSearch"),200);
	},
	artistsSearch: function(inSender) {
		if(debug) this.log("artistsSearch: "+this.$.artistsSearchInput.getValue());
		
		this.$.artistsSearchClear.show();
		this.$.artistsSearchSpinner.hide();
		
		this.finishedGettingArtists();
		
		//this.$.artistsSearchInputWrapper.show();
		this.$.artistsVirtualList.resized();
	},
	artistsClick: function(inSender, inEvent) {
		if(debug) this.log("artistsClick: "+inEvent.rowIndex);
		
		var row = this.resultsList[inEvent.rowIndex];
		row.artist = row.name;
		
		AmpacheXL.selectedArtist = row;
		
		if(debug) this.log("artistsClick: "+enyo.json.stringify(row));
		
		this.doUpdateSpinner(true);
		
		if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
			this.doUpdateSpinner(true);
			this.doDbRequest("albumsList", "artist", row.name);
			this.doViewSelected("albumsList");
		} else {
			this.doDataRequest("albumsList", "artist_albums", "&filter="+row.id);
			this.doViewSelected("albumsList");
		}	
				
	},
	
	truncateSuccess: function() {
		if(debug) this.log("truncateSuccess");
		
	},
	truncateFailure: function() {
		if(debug) this.error("truncateFailure");
		
	},
	insertSuccess: function() {
		if(debug) this.log("insertSuccess");
		
		AmpacheXL.prefsCookie.oldArtistsCount = this.fullResultsList.length;
		
		this.doSavePreferences();
		
		if(window.PalmSystem) this.doBannerMessage("Finished saving artists");
		
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

			row.type = "artist";
			row.artist_id = row.id;
			
			this.fullResultsList.push(row);

		}
		
		this.fullResultsList.sort(sort_by("name", false));
		
		AmpacheXL.allArtists.length = 0;
		AmpacheXL.allArtists = this.fullResultsList.concat([]);
			
		this.resetArtistsSearch();
		
	},
	selectSuccess: function(results) {
		if(debug) this.log("selectSuccess");
		
	},
	selectFailure: function(inError) {
		if(debug) this.error("selectFailure: "+inError.message);
		
		this.getArtists();
	},
	
});
