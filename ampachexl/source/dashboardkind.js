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
	name: "Dashboardkind",
	kind: "HFlexBox",
	align: "center",
	className: "Dashboardkind",
	
	events: {
	},
	
	fullResultsList: [],
	resultsList: [],
	
	components: [
		{kind: "ApplicationEvents", onWindowParamsChange: "windowParamsChangeHandler"},
		
		{name: "dashboardArt", kind: "Image", className: "dashboardArt", onclick: "dashboardClick"},
		
		{kind: "VFlexBox", flex: 1, onclick: "dashboardClick", components: [
			{name: "dashboardTitle", content: "Title", className: "dashboardTitle"},
			{name: "dashboardSubtitle", content: "Subtitle", className: "dashboardSubtitle"},
		]},
		
		{name: "dashboardPrevious", kind: "Image", src: "images/05-arrow-west@2x-light.png", className: "dashboardPrevious", onclick: "dashboardPrevious"},
		{name: "dashboardPlay", showing: false, kind: "Image", src: "images/16-play@2x-light.png", className: "dashboardPlayPause", onclick: "dashboardPlay"},
		{name: "dashboardPause", kind: "Image", src: "images/17-pause@2x-light.png", className: "dashboardPlayPause", onclick: "dashboardPause"},
		{name: "dashboardNext", kind: "Image", src: "images/01-arrow-east@2x-light.png", className: "dashboardNext", onclick: "dashboardNext"},
		
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
		
	},
	
	windowParamsChangeHandler: function() {
		if(debug) this.log("windowParamsChangeHandler: "+enyo.json.stringify(enyo.windowParams))
		
		if(enyo.windowParams.art) this.$.dashboardArt.setSrc(enyo.windowParams.art);
		if(enyo.windowParams.title) this.$.dashboardTitle.setContent(enyo.windowParams.title);
		if(enyo.windowParams.artist) this.$.dashboardSubtitle.setContent(enyo.windowParams.artist);
		
		switch(enyo.windowParams.status) {
			case "playing":
				this.$.dashboardPlay.hide();
				this.$.dashboardPause.show();
				break;
			case "paused":
				this.$.dashboardPlay.show();
				this.$.dashboardPause.hide();
				break;
			case "stopped":
				this.$.dashboardPlay.show();
				this.$.dashboardPause.hide();
				break;
		}
		
	},
	
	dashboardClick: function() {
		if(debug) this.log("dashboardClick");
		
		enyo.windows.activateWindow(enyo.windows.getRootWindow(), {});
	},
	dashboardPrevious: function() {
		if(debug) this.log("dashboardPrevious");
		
		enyo.windows.setWindowParams(enyo.windows.getRootWindow(), {playAction: "previous"});
	},
	dashboardPlay: function() {
		if(debug) this.log("dashboardPlay");
		
		enyo.windows.setWindowParams(enyo.windows.getRootWindow(), {playAction: "play"});
	},
	dashboardPause: function() {
		if(debug) this.log("dashboardPause");
		
		enyo.windows.setWindowParams(enyo.windows.getRootWindow(), {playAction: "pause"});
	},
	dashboardNext: function() {
		if(debug) this.log("dashboardNext");
		
		enyo.windows.setWindowParams(enyo.windows.getRootWindow(), {playAction: "next"});
	},
	
});

