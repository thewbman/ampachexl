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
	name: "TagsList",
	kind: "VFlexBox",
	className: "TagsList listContent",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onOpenWeb: "",
		onBannerMessage: "",
		onPreviousView: "",
		onDbRequest: "",
		onUpdateCounts: "",
	},
	
	activeView: false,
	
	fullResultsList: [],
	resultsList: [],
	
	selectedTag: {},
	
	components: [
		
		{kind: "DbService", dbKind: "com.palm.media.audio.genre:1", onFailure: "dbFailure", components: [
            {name: "dbTagsService", method: "find", onSuccess: "dbTagsSuccess"}                           
        ]},
		
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Tags", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "tagsSearchInputWrapper", className: "searchInputWrapper", kind: "Item", layoutKind: "HFlexLayout", components: [
			{name: "tagsSearchInput", kind: "Input", hint: "Filter", autoCapitalize: "lowercase", oninput: "tagsInput", flex: 1, components: [
				{name: "tagsSearchClear", kind: "Image", src: "images/11-x@2x.png", showing: false, className: "searchClear", onclick: "resetTagsSearch"},
				{name: "tagsSearchSpinner", kind: "Spinner"},
			]}
		]},
							
		{name: "tagsVirtualList", kind: "VirtualList", onSetupRow: "setupTagsItem", flex: 1, components: [
			{name: "tagsDivider", kind: "Divider"},
			{name: "tagsItem", kind: "Item", className: "listItem", layoutKind: "HFlexLayout", align: "center", onclick: "tagsClick", components: [
				{kind: "VFlexBox", flex: 1, components: [
					{name: "tagsTitle", className: "title"},
					{name: "tagsCounts", className: "subtitle"},
				]},
				//name: "tagsSongCount", className: "count"},
			]},
		]},
		
		{name: "footer", kind: "Toolbar", layoutKind: "HFlexLayout", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{kind: "Spacer"},
			{name: "refreshCommandButton", icon: "images/menu-icon-refresh.png", onclick: "getTags"},
			{kind: "Spacer"},
			{name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
		]},
		
		{name: "typePopupMenu", kind: "PopupSelect", className: "typePopupMenu", scrim: true, onBeforeOpen2: "beforeTypeOpen", onSelect: "typeSelect", onClose: "typeClosed", components: [
			//
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
		
		this.$.headerTitle.setContent("Genres");
		
	},
	deactivate: function() {
		if(debug) this.log("deactivate");
		
		this.activeView = false;
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.tagsVirtualList.resized();
	},
	dataRequestResponse: function(inResponse) {
		if(debug) this.log("dataRequestResponse");
		
		/*
		<tag id="2481">
			<name>Rock & Roll</name>
			<tags>84</tags>
			<artists>29</artists>
			<songs>239</songs>
			<video>13</video>
			<playlist>2</playlist>
			<stream>6</stream>
		</tag>
		*/
		
		this.fullResultsList.length = 0;
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var errorNodes, singleErrorNode;
		errorNodes = xmlobject.getElementsByTagName("error");
		for(var i = 0; i < errorNodes.length; i++) {
			singleErrorNode = errorNodes[i];
			
			this.doBannerMessage("Error: "+singleErrorNode.childNodes[0].nodeValue, true);
			
		}
		
		var tagsNodes, singleTagNode, singleTagChildNode;
		var s = {};
		
		tagsNodes = xmlobject.getElementsByTagName("tag");
		for(var i = 0; i < tagsNodes.length; i++) {
			singleTagNode = tagsNodes[i];
			s = {};
			
			s.id = singleTagNode.getAttributeNode("id").nodeValue;
			
			for(var j = 0; j < singleTagNode.childNodes.length; j++) {
				singleTagChildNode = singleTagNode.childNodes[j];
				
				switch(singleTagChildNode.nodeName) {
					case "name":
						s.name = singleTagChildNode.childNodes[0].nodeValue;
						break;
					case "tags":
						s.tags = singleTagChildNode.childNodes[0].nodeValue;
						break;
					case "artists":
						s.artists = singleTagChildNode.childNodes[0].nodeValue;
						break;
					case "albums":
						s.albums = singleTagChildNode.childNodes[0].nodeValue;
						break;
					case "songs":
						s.songs = singleTagChildNode.childNodes[0].nodeValue;
						break;
					case "playlists":
						s.playlists = singleTagChildNode.childNodes[0].nodeValue;
						break;
					case "videos":
						s.videos = singleTagChildNode.childNodes[0].nodeValue;
						break;
					case "stream":
						s.stream = singleTagChildNode.childNodes[0].nodeValue;
						break;
				}
				
			}
		
			s.type = "tag";
			
			this.fullResultsList.push(s);
		
		}
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.fullResultsList.sort(sort_by("name", false));
		
		AmpacheXL.allTags = this.fullResultsList.concat([]);
		
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetTagsSearch();
		
	},
	allTags: function(inOther) {
		if(debug) this.log("allTags AmpacheXL.allTags.length: "+AmpacheXL.allTags.length+" AmpacheXL.connectResponse.tags: "+AmpacheXL.connectResponse.tags);
		
		this.doUpdateSpinner(true);
		
		this.fullResultsList.length = 0;
		this.resultsList.length = 0;
		
		this.dbSearchProperty = null;
			
		if(AmpacheXL.allTags.length > 0) {
		
			this.fullResultsList = AmpacheXL.allTags.concat([]);
			
			this.resetTagsSearch();
			
		} else if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.doUpdateSpinner(true);
			this.$.dbTagsService.call({query:{"from":"com.palm.media.audio.genre:1"}});
		
		} else {
			this.doUpdateSpinner(true);
			
			this.getTags();
		}
	},
	
	dbTagsSuccess: function(inSender, inResponse) {
        //this.log("dbTagsSuccess, results=" + enyo.json.stringify(inResponse));
        this.log("dbTagsSuccess");
		
		this.fullResultsList.length = 0;
		
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
			
			t.type = "tag";
			
			//if(debug) this.log("adding new tag: "+enyo.json.stringify(t));
			
			this.fullResultsList.push(t);
		}
		
		this.fullResultsList.sort(sort_by("name", false));
		
		AmpacheXL.connectResponse.tags = this.fullResultsList.length;
		
		AmpacheXL.allTags = this.fullResultsList.concat([]);
		
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetTagsSearch();
		
    },          
    dbFailure: function(inSender, inError, inRequest) {
        this.error(enyo.json.stringify(inError));
    },
	
	getTags: function() {
		if(debug) this.log("getTags");
		
		this.doUpdateSpinner(true);
		
		if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.$.dbTagsService.call({query:{"from":"com.palm.media.audio.genre:1"}});
			
		} else {
		
			this.doDataRequest("tagsList", "tags", "");
			
		}
	},
	resetTagsSearch: function() {
		if(debug) this.log("resetTagsSearch");
		
		this.doUpdateCounts();
		
		this.$.tagsSearchInput.setValue("");
		this.$.tagsSearchClear.hide();
		this.$.tagsSearchSpinner.hide();
		
		this.finishedGettingTags();
	
	},
	finishedGettingTags: function() {
		if(debug) this.log("finishedGettingTags");
		
		this.resultsList.length = 0;
		this.resultsList = this.filterTags(this.fullResultsList);
		
		if(this.resultsList.length == 1) {
			this.$.headerSubtitle.setContent(this.resultsList.length+" tag");
		} else {
			this.$.headerSubtitle.setContent(this.resultsList.length+" tags");
		}
		
		this.$.tagsVirtualList.punt();
		
		this.doUpdateSpinner(false);
		
	},
	filterTags: function(inList) {
		if(debug) this.log("filterTags with list of length: "+inList.length);
		
		var finalList = [];
		var s = {};
		var filterString = this.$.tagsSearchInput.getValue().toUpperCase();
		
		for(var i = 0; i < inList.length; i++) {
			s = inList[i];
		
			if(s.name.toUpperCase().indexOf(filterString) >= 0) {
				finalList.push(s);
			} 
		}	
		
		return finalList;
	},
	setupTagsItem: function(inSender, inIndex) {
		//if(debug) this.log("setupTagsItem: "+inIndex);
		
		var row = this.resultsList[inIndex];
		
		if(row) {
		
			this.setupTagsDivider(inIndex);
			
			this.$.tagsTitle.setContent(row.name);
			
			row.allCounts = "";
			
			if(row.artists == 0) {
				//
			} else if(row.artists == 1) {
				row.allCounts += "1 artist, ";
			} else {
				row.allCounts += row.artists+" artists, ";
			}
			
			if(row.albums == 0) {
				//
			} else if(row.albums == 1) {
				row.allCounts += "1 album, ";
			} else {
				row.allCounts += row.albums+" albums, ";
			}
			
			if(row.songs == 0) {
				//
			} else if(row.songs == 1) {
				row.allCounts += "1 song, ";
			} else {
				row.allCounts += row.songs+" songs, ";
			}
			/*
			if(row.playlists == 0) {
				//
			} else if(row.playlists == 1) {
				row.allCounts += "1 playlist, ";
			} else {
				row.allCounts += row.playlists+" playlists, ";
			}
			
			if(row.videos == 0) {
				//
			} else if(row.videos == 1) {
				row.allCounts += "1 video, ";
			} else {
				row.allCounts += row.videos+" videos, ";
			}
			*/
			
			row.allCounts = row.allCounts.substring(0,row.allCounts.length-2)
			
			this.$.tagsCounts.setContent(row.allCounts);
			
			return true;
		
		}
	},
	setupTagsDivider: function(inIndex) {
		
		// use group divider at group transition, otherwise use item border for divider
		var group = this.getTagsGroupName(inIndex);
		this.$.tagsDivider.setCaption(group);
		this.$.tagsDivider.canGenerate = Boolean(group);
		if(Boolean(group)) this.$.tagsItem.applyStyle("border-top", "none");
		//this.$.songsItem.tagsItem("border-bottom", "none;");
    },
	getTagsGroupName: function(inIndex) {
		//if(debug) this.log("getTagsGroupName at index: "+inIndex);
		
		var r0 = this.resultsList[inIndex-1];
		var r1 = this.resultsList[inIndex];
		
		var a = r0 && r0.name.substring(0,1);
		var b = r1.name.substring(0,1);
		
		if(!enyo.g11n.Char.isLetter(a)) a = "#";
		if(!enyo.g11n.Char.isLetter(b)) b = "#";
		
		if((inIndex == 0)&&(!this.resultsList[inIndex].isArtist)) {
			return b;
		} else {
			return a != b ? b : null;
		}
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.$.tagsVirtualList.punt();
	},
	tagsInput: function() {
		if(debug) this.log("tagsInput: "+this.$.tagsSearchInput.getValue());
		
		this.$.tagsSearchClear.hide();
		this.$.tagsSearchSpinner.show();
		
		enyo.job("tagsSearch", enyo.bind(this, "tagsSearch"),200);
	},
	tagsSearch: function(inSender) {
		if(debug) this.log("tagsSearch: "+this.$.tagsSearchInput.getValue());
		
		this.$.tagsSearchClear.show();
		this.$.tagsSearchSpinner.hide();
		
		this.finishedGettingTags();
		
		//this.$.tagsSearchInputWrapper.show();
		this.$.tagsVirtualList.resized();
	},
	tagsClick: function(inSender, inEvent) {
		if(debug) this.log("tagsClick: "+inEvent.rowIndex);
		
		var row = this.resultsList[inEvent.rowIndex];
		
		this.selectedTag = row;
		
		//if(debug) this.log("tagsClick: "+enyo.json.stringify(row));
		
		var types = [];
		
		types = row.allCounts.split(",");
		
		this.$.typePopupMenu.setItems(types);
		this.$.typePopupMenu.openAtEvent(inEvent);
		
	},
	typeSelect: function(inSender, inEvent) {
		if(inEvent) {
			if(debug) this.log("moreSelect: "+inEvent.value);
			
			if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
				if(inEvent.value.indexOf("artist") >= 0) {
					this.doUpdateSpinner(true);
					this.doDbRequest("artistsList", "genre", this.selectedTag.name);
					this.doViewSelected("artistsList");
				} else if(inEvent.value.indexOf("album") >= 0) {
					this.doUpdateSpinner(true);
					this.doDbRequest("albumsList", "genre", this.selectedTag.name);
					this.doViewSelected("albumsList");
				} else if(inEvent.value.indexOf("song") >= 0) {
					this.doUpdateSpinner(true);
					this.doDbRequest("songsList", "genre", this.selectedTag.name);
					this.doViewSelected("songsList");
				} 
			} else {
				if(inEvent.value.indexOf("artist") >= 0) {
					this.doUpdateSpinner(true);
					this.doDataRequest("artistsList", "tag_artists", "&filter="+this.selectedTag.id);
					this.doViewSelected("artistsList");
				} else if(inEvent.value.indexOf("album") >= 0) {
					this.doUpdateSpinner(true);
					this.doDataRequest("albumsList", "tag_albums", "&filter="+this.selectedTag.id);
					this.doViewSelected("albumsList");
				} else if(inEvent.value.indexOf("song") >= 0) {
					this.doUpdateSpinner(true);
					this.doDataRequest("songsList", "tag_songs", "&filter="+this.selectedTag.id);
					this.doViewSelected("songsList");
				} 
			}
		
		}
	},
	
});

