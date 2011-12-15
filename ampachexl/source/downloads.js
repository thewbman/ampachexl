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
	name: "Downloads",
	kind: "VFlexBox",
	className: "Downloads listContent",
	
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
	},
	
	downloading: true,
	activeDownload: false,
	
	downloadsMouseTimer: "",
	
	listOffset: 0, 
	
	components: [
		
		{name: "downloadFileService", kind: "PalmService", service: "palm://com.palm.downloadmanager/", method: "download", subscribe: true, onSuccess: "downloadFileResponse", onFailure: "downloadFileFailure"},
		{name: "download2FileService", kind: "PalmService", service: "palm://com.palm.downloadmanager/", method: "download", subscribe: true, onSuccess: "download2FileResponse", onFailure: "download2FileFailure"},
		
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Downloads", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "downloadsVirtualList", kind: "ScrollerVirtualList", onSetupRow: "setupDownloadsItem", flex: 1, components: [
			{name: "downloadsItem", kind: "Item", className: "listItem", layoutKind: "HFlexLayout", align: "center", components: [
				{name: "downloadsIndex", onclick2: "downloadsClick", onmousedown: "downloadsMousedown", onmouseup: "downloadsMouseup", className: "listIndex"},
				{name: "listArt", kind: "Image", onclick2: "songsClick", onmousedown: "downloadsMousedown", onmouseup: "downloadsMouseup", className: "listArt"},
				{kind: "VFlexBox", flex: 1, onclick2: "downloadsClick", onmousedown: "downloadsMousedown", onmouseup: "downloadsMouseup", components: [
					{name: "downloadsTitle", className: "title"},
					{name: "downloadsArtist", className: "subtitle"},
				]},
				{name: "downloadsAlbumWrapper", onclick2: "downloadsClick", onmousedown: "downloadsMousedown", onmouseup: "downloadsMouseup", kind: "VFlexBox", components: [
					{name: "downloadsAlbum", className: "count"},
					{name: "downloadsTrack", className: "count"},
				]},
				{name: "downloadsMoveUp", kind: "Image", onclick: "downloadsMoveUp", src: "images/07-arrow-north@2x-light.png", className: "downloadsMoveUp"},
				{name: "downloadsMoveUpSpacer", content: "&nbsp;", allowHtml: true},
				{name: "downloadsMoveDown", kind: "Image", onclick: "downloadsMoveDown", src: "images/03-arrow-south@2x-light.png", className: "downloadsMoveDown"},
				{name: "downloadsMoveDownSpacer", content: "&nbsp;", allowHtml: true},
				{name: "downloadsRemove", kind: "Image", onclick: "downloadsRemove", src: "images/11-x@2x-light.png", className: "downloadsRemove"},
			]},
		]},
		
		{name: "downloadsProgressBar", kind: "ProgressBar", animationPosition: false},
		
		{name: "footer", kind: "Toolbar", layoutKind: "HFlexLayout", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{kind: "Spacer"},
			{name: "pauseButton", caption: "Pause", onclick: "pauseClick"},
			{name: "resumeButton", caption: "Resume", onclick: "resumeClick"},
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
		
		this.doUpdateSpinner(false);
		
		this.$.downloadsVirtualList.punt();
		
		this.$.headerSubtitle.setContent(AmpacheXL.downloads.length+" items");
		
		if(this.downloading) {
			this.$.pauseButton.show();
			this.$.resumeButton.hide();
		} else {
			this.$.pauseButton.hide();
			this.$.resumeButton.show();
		}
		
		this.$.footer.render();
		
	},
	deactivate: function() {
		if(debug) this.log("deactivate");
	
	},
	resize: function() {
		if(debug) this.log("resize");
		
		this.$.downloadsVirtualList.resized();
	},
	updateCounts: function() {
		if(debug) this.log("updateCounts");
		
		if((this.activeDownload == false)&&(this.downloading)) {
			this.startDownload();
		}
	},
	
	setupDownloadsItem: function(inSender, inIndex) {
		//if(debug) this.log("setupDownloadsItem: "+inIndex);
		
		var newIndex = inIndex + this.listOffset;
		
		var row = AmpacheXL.downloads[newIndex];
		
		if(row) {
		
			//this.$.downloadsItem.applyStyle("border-top", "1px solid silver;");
			//this.$.downloadsItem.applyStyle("border-bottom", "none;");
			
			this.$.downloadsIndex.setContent(newIndex+1);
			
			if((row.type == "song")&&(AmpacheXL.prefsCookie.artOnLists)) {
				this.$.listArt.setSrc(row.art);
				this.$.listArt.show();
			} else {
				this.$.listArt.hide();
			}
			
			if(row.type == "song") {
				this.$.downloadsTitle.setContent(row.title);
			
				this.$.downloadsArtist.setContent(row.artist);
				
				this.$.downloadsAlbum.setContent(row.album);
				this.$.downloadsTrack.setContent("Track #"+row.track);
			} else {
			
				if(row.title.length > 0) {
					this.$.downloadsTitle.setContent(row.title);
				} else {
					this.$.downloadsTitle.setContent("[Unknown title - id #"+row.id+"]");
				}
				
				this.$.downloadsArtist.setContent(row.resolution);
				
				this.$.downloadsAlbum.setContent(row.size+" B");
				this.$.downloadsTrack.setContent(row.mime);
			}
			
			//this.$.downloadsAlbumWrapper.hide();
			this.$.downloadsMoveUp.show();
			this.$.downloadsMoveUpSpacer.show();
			this.$.downloadsMoveDown.show();
			this.$.downloadsMoveDownSpacer.show();
			this.$.downloadsRemove.show();
			
			if((AmpacheXL.currentDownload.id == row.id)&&(AmpacheXL.currentDownload.type == row.type)) {
				this.$.downloadsItem.addClass("selected");
			} else {
				this.$.downloadsItem.removeClass("selected");
			}
			
			return true;
		
		}
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.listOffset = 0;
		
		this.$.downloadsVirtualList.punt();
	},
	pauseClick: function() {
		if(debug) this.log("pauseClick");
		
		this.downloading = false;
		
		if(this.downloading) {
			this.$.pauseButton.show();
			this.$.resumeButton.hide();
		} else {
			this.$.pauseButton.hide();
			this.$.resumeButton.show();
		}
		
		
		this.$.footer.render();
	},
	resumeClick: function() {
		if(debug) this.log("resumeClick");
		
		this.downloading = true;
		
		this.startDownload();
		
		if(this.downloading) {
			this.$.pauseButton.show();
			this.$.resumeButton.hide();
		} else {
			this.$.pauseButton.hide();
			this.$.resumeButton.show();
		}
		
		this.$.footer.render();
	},
	
	downloadsMousedown: function(inSender, inEvent) {
		if(debug) this.log("downloadsMousedown: "+this.$.downloadsVirtualList.getScrollTop()) 
		
		this.newClick = true;
		this.listScroll = this.$.downloadsVirtualList.getScrollTop();
		this.downloadsMouseTimer = setTimeout(enyo.bind(this, "downloadsMoreClick", inSender, inEvent), 500);
		
	},
	downloadsMouseup: function(inSender, inEvent) {
		if(debug) this.log("downloadsMouseup: "+this.$.downloadsVirtualList.getScrollTop()) 
		
		clearTimeout(this.downloadsMouseTimer);
		
		if(this.newClick) this.downloadsClick(inSender, inEvent);
		
		this.newClick = false;
		
	},
	downloadsClick: function(inSender, inEvent) {
		if(debug) this.log("downloadsClick: "+inEvent.rowIndex);
		
		//
	},	
	downloadsMoreClick: function(inSender, inEvent) {
		if(debug) this.log("downloadsMoreClick: "+inEvent.rowIndex+" with offset:"+this.$.downloadsVirtualList.getScrollTop());
		
		this.newClick = false;
		
		if(Math.abs(this.$.downloadsVirtualList.getScrollTop() - this.listScroll) > 5) {
		
			if(debug) this.log("change in scroller offset is too large: "+Math.abs(this.$.downloadsVirtualList.getScrollTop() - this.listScroll));
		
		} else {
		
			var newIndex = inEvent.rowIndex + this.listOffset;
		
			this.selectedSong = AmpacheXL.downloads[newIndex];
			this.selectedIndex = newIndex;
			this.selectedOffsetIndex = inEvent.rowIndex;
			
			this.$.morePopupMenu.setItems([
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
								
			this.$.morePopupMenu.openAtEvent(inEvent);
		
		}
		
	},
	moreSelect: function(inSender, inEvent) {
		if(inEvent) {
			if(debug) this.log("moreSelect: "+inEvent.value);
			
			switch(inEvent.value) {
				case "Play":
					this.downloadsClick("downloads", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move":
					//
					break;
				case "Move up":
					this.downloadsMoveUp("downloads", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move down":
					this.downloadsMoveDown("downloads", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move to top":
					this.downloadsMoveToTop("downloads", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move to bottom":
					this.downloadsMoveToBottom("downloads", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Move to next":
					this.downloadsMoveToNext("downloads", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Remove":
					//
					break;
				case "Remove single song":
					this.downloadsRemove("downloads", {rowIndex: this.selectedOffsetIndex});
					break;
				case "Remove all above this":
					if(this.selectedIndex <= AmpacheXL.downloadsIndex) {
						AmpacheXL.downloads.splice(0, this.selectedIndex);
						this.finishedMoving();
					} else {
						this.doBannerMessage("You cannot remove the item that is currently downloading", true);
					}
					break;
				case "Remove all below this":
					if(this.selectedIndex >= AmpacheXL.downloadsIndex) {
						AmpacheXL.downloads.length = this.selectedIndex+1;
						this.finishedMoving();
					} else {
						this.doBannerMessage("You cannot remove the song that is currently downloading", true);
					}
					break;
					
				default: 
					
					this.log("unknown more command: "+inEvent.value);
					
					break;
			}
		}
	},
	downloadsMoveUp: function(inSender, inEvent) {
		if(debug) this.log("downloadsMoveUp: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
			
		var row = AmpacheXL.downloads.splice(newIndex, 1)[0];
		AmpacheXL.downloads.splice(newIndex - 1, 0, row);
		
		this.finishedMoving();
		
	},
	downloadsMoveDown: function(inSender, inEvent) {
		if(debug) this.log("downloadsMoveDown: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.downloads.splice(newIndex, 1)[0];
		AmpacheXL.downloads.splice(newIndex + 1, 0, row);
		
		this.finishedMoving();
		
	},
	downloadsMoveToTop: function(inSender, inEvent) {
		if(debug) this.log("downloadsMoveToTop: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.downloads.splice(newIndex, 1)[0];
		AmpacheXL.downloads.splice(0, 0, row);
		
		this.finishedMoving();
		
	},
	downloadsMoveToBottom: function(inSender, inEvent) {
		if(debug) this.log("downloadsMoveToBottom: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.downloads.splice(newIndex, 1)[0];
		AmpacheXL.downloads.push(row);
		
		this.finishedMoving();
		
	},
	downloadsMoveToNext: function(inSender, inEvent) {
		if(debug) this.log("downloadsMoveToNext: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var row = AmpacheXL.downloads.splice(newIndex, 1)[0];
		
		var currentIndex = -1;
		for(var i = 0; i < AmpacheXL.downloads.length; i++) {
		
			s = AmpacheXL.downloads[i];
			if(s.id == AmpacheXL.currentSong.id) currentIndex = i;
		
		}
		AmpacheXL.downloadsIndex = currentIndex;
		
		AmpacheXL.downloads.splice(AmpacheXL.downloadsIndex+1, 0, row);
		
		this.finishedMoving();
		
	},
	downloadsRemove: function(inSender, inEvent) {
		if(debug) this.log("downloadsRemove: "+inEvent.rowIndex);
		
		var newIndex = inEvent.rowIndex + this.listOffset;
		
		var downloadIndex = 0;
		
		for(var i = 0; i < AmpacheXL.downloads.length; i++) {
			if((AmpacheXL.currentDownload.id == AmpacheXL.downloads[i].id)&&(AmpacheXL.currentDownload.type == AmpacheXL.downloads[i].type)) downloadIndex = i;
		}
			
		if(downloadIndex == newIndex) {
			this.doBannerMessage("You cannot remove the item that is currently downloading", true);
		} else {
			var row = AmpacheXL.downloads.splice(newIndex, 1)[0];
		}
		
		this.finishedMoving();
	},
	finishedMoving: function() {
		if(debug) this.log("finishedMoving");
		
		this.doUpdateCounts();
		this.$.headerSubtitle.setContent(AmpacheXL.downloads.length+" items");
		
		this.$.downloadsVirtualList.refresh();
	},
	
	startDownload: function() {
		if(debug) this.log("startDownload");
		
		if((!window.PalmSystem)&&(AmpacheXL.downloads.length > 0)) this.doBannerMessage("Downloading only works on a webOS device");
		
		if((window.PalmSystem)&&(this.activeDownload == false)&&(this.downloading)&&(AmpacheXL.downloads.length > 0)) {
			if(debug) this.log("Downloading using Palm system");
			
			AmpacheXL.currentDownload = AmpacheXL.downloads[0];
			
			this.$.downloadsVirtualList.refresh();
			
			this.activeDownload = true;
			
			var directory = "/media/internal/";
			var filename = "";
			
			if(AmpacheXL.currentDownload.type == "song") {
			
				directory += "music/";
				directory += AmpacheXL.currentDownload.artist+"/";
				directory += AmpacheXL.currentDownload.album+"/";
				
				filename += AmpacheXL.currentDownload.title+".mp3";
				
			} else if(AmpacheXL.currentDownload.type == "video") {
			
				directory += "video/";
					
				if(AmpacheXL.currentDownload.title.length > 0) {
					filename += AmpacheXL.currentDownload.title;
				} else {
					filename += "[Unknown title - id #"+AmpacheXL.currentDownload.id+"]";
				}
				
				filename += "." + AmpacheXL.currentDownload.mime.replace("video/","");
			}
			
			directory = directory.replace(/:/g,"");
			directory = directory.replace(/,/g,"");
			
			filename = filename.replace(/:/g,"");
			filename = filename.replace(/,/g,"");
			
			if(debug) this.log("Starting to download '"+filename+"' to '"+directory+"' from url '"+AmpacheXL.currentDownload.url+"'");
			
			//this.doBannerMessage("Starting download");
			this.$.downloadFileService.call({target: AmpacheXL.currentDownload.url, targetFilename: filename,	targetDir: directory});
		
		} else {
			this.$.downloadsVirtualList.refresh();
		}
	},
	downloadFileResponse: function(inSender, inResponse) {
		if(inResponse.completed) {
			//this.doBannerMessage("Download finished!");
			
			this.activeDownload = false;
			
			
			var downloadIndex = 0;
			
			for(var i = 0; i < AmpacheXL.downloads.length; i++) {
				if((AmpacheXL.currentDownload.id == AmpacheXL.downloads[i].id)&&(AmpacheXL.currentDownload.type == AmpacheXL.downloads[i].type)) downloadIndex = i;
			}
			
			var row = AmpacheXL.downloads.splice(downloadIndex, 1)[0];
			
			this.$.headerSubtitle.setContent(AmpacheXL.downloads.length+" items");
			this.doUpdateCounts();
			this.$.downloadsProgressBar.setPosition(0);
			
			this.startDownload();
			
		} else {
		
			this.activeDownload = true;
			
			if(inResponse.amountReceived && inResponse.amountTotal) {
				var percent = (inResponse.amountReceived / inResponse.amountTotal)*100;
				percent = Math.round(percent);
				if(percent!=NaN) {
					if(this.currProgress != percent) {
						this.currProgress = percent;
						if(debug) this.log("Downloading: " + percent + "%", "");
						this.$.downloadsProgressBar.setPosition(percent);
					}
				}
			}
			
		}
				
	},
	downloadFileFailure: function(inSender, inResponse) {
		if(debug) this.log("downloadFileFailure");
		
		if(AmpacheXL.prefsCookie.retryDownload) {
		
			this.doBannerMessage("Error downloading file, retrying...");
			
			if((window.PalmSystem)&&(this.downloading)&&(AmpacheXL.downloads.length > 0)) {
				if(debug) this.log("Downloading #2 using Palm system");
				
				//AmpacheXL.currentDownload = AmpacheXL.downloads[0];
				
				this.$.downloadsVirtualList.refresh();
				
				this.activeDownload = true;
				
				var directory = "/media/internal/";
				var filename = "";
			
				if(AmpacheXL.currentDownload.type == "song") {
				
					directory += "music/";
					directory += AmpacheXL.currentDownload.artist+"/";
					directory += AmpacheXL.currentDownload.album+"/";
					
					filename = AmpacheXL.currentDownload.title+".mp3";
					
				} else if(AmpacheXL.currentDownload.type == "video") {
				
					directory += "video/";
					
					if(AmpacheXL.currentDownload.title.length > 0) {
						filename += AmpacheXL.currentDownload.title;
					} else {
						filename += "[Unknown title - id #"+AmpacheXL.currentDownload.id+"]";
					}
					
					filename += "." + AmpacheXL.currentDownload.mime.replace("video/","");
				}
				
				directory = directory.replace(/:/g,"");
				directory = directory.replace(/,/g,"");
				
				filename = filename.replace(/:/g,"");
				filename = filename.replace(/,/g,"");
			
				if(debug) this.log("Starting to download '"+filename+"' to '"+directory);
				
				//this.doBannerMessage("Starting download");
				//this.$.download2FileService.call({target: AmpacheXL.currentDownload.url, targetFilename: filename,	targetDir: directory});
			
				setTimeout(enyo.bind(this, "download2Call", AmpacheXL.currentDownload.url, filename, directory),3000);
			
			} else {
				this.$.downloadsVirtualList.refresh();
			}
		
		} else {
			this.doBannerMessage("Error downloading file", true);
		}
	},
	download2Call: function(inTarget, inFilename, inDir) {
		if(debug) this.log("download2Call");
		
		this.$.download2FileService.call({target: inTarget, targetFilename: inFilename,	targetDir: inDir});
	},
	download2FileResponse: function(inSender, inResponse) {
		if(inResponse.completed) {
			//this.doBannerMessage("Download finished!");
			
			this.activeDownload = false;
			
			var downloadIndex = 0;
			
			for(var i = 0; i < AmpacheXL.downloads.length; i++) {
				if((AmpacheXL.currentDownload.id == AmpacheXL.downloads[i].id)&&(AmpacheXL.currentDownload.type == AmpacheXL.downloads[i].type)) downloadIndex = i;
			}
			
			var row = AmpacheXL.downloads.splice(downloadIndex, 1)[0];
			
			this.$.headerSubtitle.setContent(AmpacheXL.downloads.length+" items");
			this.doUpdateCounts();
			this.$.downloadsProgressBar.setPosition(0);
			
			this.startDownload();
			
		} else {
		
			this.activeDownload = true;
			
			if(inResponse.amountReceived && inResponse.amountTotal) {
				var percent = (inResponse.amountReceived / inResponse.amountTotal)*100;
				percent = Math.round(percent);
				if(percent!=NaN) {
					if(this.currProgress != percent) {
						this.currProgress = percent;
						if(debug) this.log("Downloading: " + percent + "%", "");
						this.$.downloadsProgressBar.setPosition(percent);
					}
				}
			}
			
		}
				
	},
	download2FileFailure: function(inSender, inResponse) {
		if(debug) this.log("downloadFileFailure");
		
		this.doBannerMessage("Error downloading file (2nd attempt)", true);
	},
	
});

