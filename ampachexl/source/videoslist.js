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
	name: "VideosList",
	kind: "VFlexBox",
	className: "VideosList listContent",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onOpenWeb: "",
		onPlayVideo: "",
		onBannerMessage: "",
		onNowplayingUpdated: "",
		onPreviousView: "",
		onUpdateCounts: "",
		onUpdateCounts: "",
		onDbRequest: "",
	},
	
	fullResultsList: [],
	resultsList: [],
	
	selectedVideo: {},
	selectedIndex: -1,
	
	videosMouseTimer: "",
	
	components: [
		{kind: "DbService", dbKind: "com.palm.media.video.file:1", onFailure: "dbFailure", components: [
            {name: "dbVideosService", method: "find", onSuccess: "dbVideosSuccess"},                                   
        ]},
		
		{name: "streamVideoService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "launch"},
			
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Videos", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "videosSearchInputWrapper", className: "searchInputWrapper", kind: "Item", layoutKind: "HFlexLayout", components: [
			{name: "videosSearchInput", kind: "Input", autoCapitalize: "lowercase", hint: "Filter", oninput: "videosInput", flex: 1, components: [
				{name: "videosSearchClear", kind: "Image", src: "images/11-x@2x.png", showing: false, className: "searchClear", onclick: "resetVideosSearch"},
				{name: "videosSearchSpinner", kind: "Spinner"},
			]}
		]},
							
		{name: "videosVirtualList", kind: "ScrollerVirtualList", onSetupRow: "setupVideosItem", flex: 1, components: [
			{name: "videosDivider", kind: "Divider"},
			{name: "videosItem", kind: "Item", className: "listItem", layoutKind: "HFlexLayout", align: "center", components: [
				{kind: "VFlexBox", flex: 1, onclick2: "videosClick", onmousedown: "videosMousedown", onmouseup: "videosMouseup", components: [
					{name: "videosTitle", className: "title"},
					{name: "videosResolution", className: "subtitle"},
				]},
				{kind: "VFlexBox", onclick2: "videosClick", onmousedown: "videosMousedown", onmouseup: "videosMouseup", components: [
					{name: "videosSize", className: "count"},
					{name: "videosMime", className: "count"},
				]},
				//name: "videosMoreButton", kind: "Button", caption: "...", onclick: "videosMoreClick"},
				//name: "videosMoreIcon", kind: "Image", src: "images/16-play@2x-light.png", className: "videosMoreIcon", onclick: "videosMoreClick"},
			]},
		]},
		
		{name: "footer", kind: "Toolbar", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{kind: "Spacer"},
			{name: "refreshCommandButton", icon: "images/menu-icon-refresh.png", onclick: "getVideos"},
			{kind: "Spacer"},
			{name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
		]},
		
		{name: "morePopupMenu", kind: "PopupSelect", className: "morePopupMenu", scrim: true, onBeforeOpen2: "beforeMoreOpen", onSelect: "moreSelect", onClose: "moreClosed", components: [
			//
		]},
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
	},
	
	activate: function() {
		if(debug) this.log("activate");
		
		if(this.fullResultsList.length == 0) {
			//this.getVideos();
			this.fullResultsList = AmpacheXL.allVideos.concat([]);
			//this.resetVideosSearch();
			this.$.videosVirtualList.punt();
		}
		
		this.resize();
		
		/*
		if(AmpacheXL.selectedAlbum) {
			this.$.headerSubtitle.setContent(AmpacheXL.selectedAlbum.name);
		} else {
			this.$.headerSubtitle.setContent("All Artists");
		}
		*/
	},
	deactivate: function() {
		if(debug) this.log("deactivate");
	
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.videosVirtualList.resized();
	},
	dataRequestResponse: function(inResponse) {
		if(debug) this.log("dataRequestResponse");
		//if(debug) this.log("dataRequestResponse: "+inResponse);
		
		/*
		<video id="1234">
			<title>Futurama Bender's Big Score</title>
			<mime>video/avi</mime>
			<resolution>720x288</resolution>
			<size>Video Filesize in Bytes</size>
			<url>http://localhost/play/index.php?oid=123908...</url>
		</video>
		*/
		
		this.fullResultsList.length = 0;
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var videosNodes, singleVideoNode, singleVideoChildNode;
		var s = {};
		
		//fix timeout error here - https://developer.palm.com/distribution/viewtopic.php?f=11&t=10561
		videosNodes = xmlobject.getElementsByTagName("video");
		for(var i = 0; i < videosNodes.length; i++) {
			singleVideoNode = videosNodes[i];
			s = {};
			
			s.id = singleVideoNode.getAttributeNode("id").nodeValue;
			
			for(var j = 0; j < singleVideoNode.childNodes.length; j++) {
				singleVideoChildNode = singleVideoNode.childNodes[j];
				
				switch(singleVideoChildNode.nodeName) {
					case "title":
						s.title = singleVideoChildNode.childNodes[0].nodeValue;
						break;
					case "mime":
						s.mime = singleVideoChildNode.childNodes[0].nodeValue;
						break;
					case "resolution":
						s.resolution = singleVideoChildNode.childNodes[0].nodeValue;
						break;
					case "size":
						s.size = singleVideoChildNode.childNodes[0].nodeValue;
						break;
					case "url":
						s.url = singleVideoChildNode.childNodes[0].nodeValue;
						break;
				}
				
			}
		
			s.type = "video";
			
			this.fullResultsList.push(s);
			
			//if(debug) this.log("added video to list. curent length = "+this.fullResultsList.length);
		
		}
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.fullResultsList.sort(sort_by("title", false));
		
		if(this.fullResultsList.length == AmpacheXL.connectResponse.videos) {
			if(debug) this.log("was all videos, now saving");
		
			AmpacheXL.allVideos = this.fullResultsList.concat([]);
			
			//AmpacheXL.prefsCookie.oldVideosAuth = AmpacheXL.connectResponse.auth;
			//window.localStorage.setItem("allVideos", "[]");
			
			try {
				//window.localStorage.setItem("allVideos", enyo.json.stringify(AmpacheXL.allVideos));
			} catch(e) {
				this.error(e);
				//window.localStorage.setItem("allVideos", "[]");
			}
		}
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetVideosSearch();
		
	},
	allVideos: function(inOther) {
		if(debug) this.log("allVideos AmpacheXL.allVideos.length: "+AmpacheXL.allVideos.length+" AmpacheXL.connectResponse.videos: "+AmpacheXL.connectResponse.videos);
		
		this.doUpdateSpinner(true);
		
		this.fullResultsList.length = 0;
		this.resultsList.length = 0;
		
		this.dbSearchProperty = null;
			
		if(AmpacheXL.allVideos.length > 0) {
		
			this.fullResultsList = AmpacheXL.allVideos.concat([]);
			
			this.resetVideosSearch();
			
		} else if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.doUpdateSpinner(true);
			this.$.dbVideosService.call({query:{"from":"com.palm.media.video.file:1"}});
		
		} else {
			this.doUpdateSpinner(true);
			
			this.getVideos();
		}
	},
	
	
	dbVideosSuccess: function(inSender, inResponse) {
        //this.log("dbVideosSuccess, results=" + enyo.json.stringify(inResponse));
        this.log("dbVideosSuccess");
		
		this.fullResultsList.length = 0;
		
		var s = {}, t = {};
		
		for(var i = 0; i < inResponse.results.length; i++) {
			s = inResponse.results[i];
			t = {name: "Unknown", songs: 0};
			
			t.id = s._id;
			//t._kind = s._kind;
			t.title = s.title;
			t.mime = s.mediaType;
			t.resolution = "Unknown";
			t.size = s.size;
			t.url = s.path;
			
			t.type = "video";
			
			
			//if(debug) this.log("adding new item: "+enyo.json.stringify(t));
			
			this.fullResultsList.push(t);
		}
		
		
		this.fullResultsList.sort(sort_by("title", false));
		
		AmpacheXL.connectResponse.videos = this.fullResultsList.length;
		
		AmpacheXL.allVideos = this.fullResultsList.concat([]);
		
		
		//if(debug) this.log("fullResultsList: "+enyo.json.stringify(this.fullResultsList));
		
		this.resetVideosSearch();
		
    },          
    dbFailure: function(inSender, inError, inRequest) {
        this.error(enyo.json.stringify(inError));
    },
	
	
	getVideos: function() {
		if(debug) this.log("getVideos");
		
		this.doUpdateSpinner(true);
		
		if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
		
			this.$.dbVideosService.call({query:{"from":"com.palm.media.video.file:1"}});
			
		} else {
		
			this.doDataRequest("videosList", "videos", "");
			
		}
	},
	resetVideosSearch: function() {
		if(debug) this.log("resetVideosSearch");
		
		this.$.videosSearchInput.setValue("");
		this.$.videosSearchClear.hide();
		this.$.videosSearchSpinner.hide();
		
		this.finishedGettingVideos();
	
	},
	finishedGettingVideos: function() {
		if(debug) this.log("finishedGettingVideos");
		
		this.resultsList.length = 0;
		this.resultsList = this.filterVideos(this.fullResultsList);
		
		if(this.resultsList.length == 1) {
			this.$.headerSubtitle.setContent(this.resultsList.length+" video");
		} else {
			this.$.headerSubtitle.setContent(this.resultsList.length+" videos");
		}
		
		this.$.videosVirtualList.punt();
		
		this.doUpdateSpinner(false);
		
	},
	filterVideos: function(inList) {
		if(debug) this.log("filterVideos with list of length: "+inList.length);
		
		var finalList = [];
		var s = {};
		var filterString = this.$.videosSearchInput.getValue().toUpperCase();
		
		for(var i = 0; i < inList.length; i++) {
			s = inList[i];
		
			if(s.title.toUpperCase().indexOf(filterString) >= 0) {
				finalList.push(s);
			} else if(s.id.toUpperCase().indexOf(filterString) >= 0) {
				finalList.push(s);
			} 
		}	
		
		return finalList;
	},
	setupVideosItem: function(inSender, inIndex) {
		//if(debug) this.log("setupVideosItem: "+inIndex);
		
		var row = this.resultsList[inIndex];
		
		if(row) {
		
			this.setupVideosDivider(inIndex);
			//this.$.videosItem.applyStyle("border-top", "1px solid silver;");
			//this.$.videosItem.applyStyle("border-bottom", "none;");
			
			if(row.title == "") {
				this.$.videosTitle.setContent("[Unknown title - id #"+row.id+"]");
			} else {
				this.$.videosTitle.setContent(row.title);
			}
			this.$.videosResolution.setContent(row.resolution);
			
			this.$.videosSize.setContent(row.size+" B");
			if(row.mime) this.$.videosMime.setContent(row.mime);
			
			return true;
		
		}
	},
	setupVideosDivider: function(inIndex) {
		
		// use group divider at group transition, otherwise use item border for divider
		var group = this.getVideosGroupName(inIndex);
		this.$.videosDivider.setCaption(group);
		this.$.videosDivider.canGenerate = Boolean(group);
		if(Boolean(group)) this.$.videosItem.applyStyle("border-top", "none");
		//this.$.videosItem.applyStyle("border-bottom", "none;");
    },
	getVideosGroupName: function(inIndex) {
		//if(debug) this.log("getVideosGroupName at index: "+inIndex);
		
		var r0 = this.resultsList[inIndex-1];
		var r1 = this.resultsList[inIndex];
		
		var a = r0 && r0.title.substring(0,1);
		var b = r1.title.substring(0,1);
		
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
		
		this.$.videosVirtualList.punt();
	},
	videosInput: function() {
		if(debug) this.log("videosInput: "+this.$.videosSearchInput.getValue());
		
		this.$.videosSearchClear.hide();
		this.$.videosSearchSpinner.show();
		
		enyo.job("videosSearch", enyo.bind(this, "videosSearch"),200);
	},
	videosSearch: function(inSender) {
		if(debug) this.log("videosSearch: "+this.$.videosSearchInput.getValue());
		
		this.$.videosSearchClear.show();
		this.$.videosSearchSpinner.hide();
		
		this.finishedGettingVideos();
		
		//this.$.videosSearchInputWrapper.show();
		this.$.videosVirtualList.resized();
	},
	videosMousedown: function(inSender, inEvent) {
		if(debug) this.log("videosMousedown: "+this.$.videosVirtualList.getScrollTop()) 
		
		this.newClick = true;
		this.listOffset = this.$.videosVirtualList.getScrollTop();
		this.videosMouseTimer = setTimeout(enyo.bind(this, "videosMoreClick", inSender, inEvent), 500);
		
	},
	videosMouseup: function(inSender, inEvent) {
		if(debug) this.log("videosMouseup: "+this.$.videosVirtualList.getScrollTop()) 
		
		clearTimeout(this.videosMouseTimer);
		
		if(this.newClick) this.videosClick(inSender, inEvent);
		
		this.newClick = false;
		
	},
	videosClick: function(inSender, inEvent) {
		if(debug) this.log("videosClick: "+inEvent.rowIndex);
		
		if(Math.abs(this.$.videosVirtualList.getScrollTop() - this.listOffset) > 5) {
		
			if(debug) this.log("change in scroller offset is too large: "+Math.abs(this.$.videosVirtualList.getScrollTop() - this.listOffset));
		
		} else {
			this.selectedIndex = inEvent.rowIndex;
			
			this.videosPlay(this.selectedIndex);
		}
	}, 
	videosPlay: function(inIndex) {
		if(debug) this.log("videosPlay: "+inIndex);
		
		this.selectedVideo = this.resultsList[inIndex];
		this.selectedIndex = inIndex;
		
		if(debug) this.log("videosPlay: "+enyo.json.stringify(this.selectedVideo));
		
		if(window.PalmSystem) {
			this.$.streamVideoService.call({id: "com.palm.app.videoplayer", target: this.selectedVideo.url, params: {target: this.selectedVideo.url}});
		} else {
			window.open(this.selectedVideo.url);
		}
	},
	videosDownload: function(inIndex) {
		if(debug) this.log("videosDownload: "+inIndex);
		
		this.selectedVideo = this.resultsList[inIndex];
		this.selectedIndex = inIndex;
		
		if(debug) this.log("videosDownload: "+enyo.json.stringify(this.selectedVideo));
		
		if(window.PalmSystem) {
			//this.$.streamVideoService.call({id: "com.palm.app.videoplayer", target: this.selectedVideo.url, params: {target: this.selectedVideo.url}});
		} else {
			this.doBannerMessage("Downloading is only support on a webOS device.  Try playing video instead.");
		}
	},
	videosMoreClick: function(inSender, inEvent) {
		if(debug) this.log("videosMoreClick: "+inEvent.rowIndex+" with offset:"+this.$.videosVirtualList.getScrollTop());
		
		this.selectedIndex = inEvent.rowIndex;
		this.selectedVideo = this.resultsList[this.selectedIndex];
		
		this.newClick = false;
		
		if(Math.abs(this.$.videosVirtualList.getScrollTop() - this.listOffset) > 5) {
		
			if(debug) this.log("change in scroller offset is too large: "+Math.abs(this.$.videosVirtualList.getScrollTop() - this.listOffset));
		
		} else {
		
			this.selectedVideo = this.resultsList[inEvent.rowIndex];
			this.selectedIndex = inEvent.rowIndex;
			
			this.$.morePopupMenu.setItems([
				{name: $L("Play"), caption: $L("Play")},
				{name: $L("Download"), caption: $L("Download")},
				
				/*
				{caption: $L("Web"), components: [
					{name: "Google", caption: "Google"},
					{name: "Wikipedia", caption: "Wikipedia"},
				]},
				
				//download
				*/
			]);
								
			this.$.morePopupMenu.openAtEvent(inEvent);
		
		}
		
	},
	moreSelect: function(inSender, inEvent) {
		if(inEvent) {
			if(debug) this.log("moreSelect: "+inEvent.value);
			
			switch(inEvent.value) {
				case "Play":
					this.videosPlay(this.selectedIndex);
					break;
				case "Download":
					AmpacheXL.downloads.push(this.selectedVideo);
					this.doUpdateCounts();
					break;
				default: 
					
					
					break;
			}
		}
	},
	
});

