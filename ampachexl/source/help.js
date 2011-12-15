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
	name: "Help",
	kind: "VFlexBox",
	className: "Help",
	
	events: {
		onViewSelected: "",
		onDataRequest: "",
		onUpdateSpinner: "",
		onOpenWeb: "",
		onPlaySong: "",
		onBannerMessage: "",
		onNowplayingUpdated: "",
		onPreviousView: "",
	},
	
	components: [
		{name: "getFaqsService", kind: "WebService", handleAs: "txt", onSuccess: "getFaqsResponse", onFailure: "getFaqsFailure"},
		{name: "getChangelogService", kind: "WebService", handleAs: "txt", onSuccess: "getChangelogResponse", onFailure: "getChangelogFailure"},
		
		{name: "header", kind: "Toolbar", layoutKind: "VFlexLayout", onclick: "headerClick", components: [
			{name: "headerTitle", kind: "Control", content: "Help", className: "headerTitle"},
			{name: "headerSubtitle", kind: "Control", className: "headerSubtitle"},
		]},
		
		{name: "helpScroller", kind: "Scroller", autoHorizontal: false, horizontal: false, autoVertical: true, flex: 1, components: [
		
			{name: "faqsDrawer", kind: "DividerDrawer", caption: "FAQs", open: true, animate: false, components: [
				{name: "faqsContent", allowHtml: true, className: "smallerFont helpContent"},
			]},
			
			{name: "tipsDrawer", showing: false, kind: "DividerDrawer", caption: "Tips", open: false, animate: false, components: [
				{name: "tipsContent", allowHtml: true, className: "smallerFont helpContent"},
			]},
			
			{name: "changelogDrawer", kind: "DividerDrawer", caption: "Changelog", open: true, animate: false, components: [
				{name: "changelogContent", allowHtml: true, className: "smallerFont helpContent"},
			]},
			
			{name: "supportDrawer", showing: false, kind: "DividerDrawer", caption: "Support", open: false, animate: false, components: [
				{name: "supportContent", allowHtml: true, className: "smallerFont helpContent"},
			]},
			
		]},
		
		{name: "footer", kind: "Toolbar", components: [
			{name: "backCommandIcon", kind: "Control", className: "backCommandIcon", onclick: "doPreviousView"},
			{kind: "Spacer"},
			//caption: "Go Back", onclick: "backClick"},
			{kind: "Spacer"},
			{name: "backCommandIconSpacer", kind: "Control", className: "backCommandIconSpacer"},
		]},
		
	],
	
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
		
		this.render();
		
		//this.activate("tablet");
	},
	
	//Externally called functions
	activate: function(inViewMode) {
		if(debug) this.log("activate");
		
		var appInfo = enyo.fetchAppInfo();
		
		this.$.headerSubtitle.setContent(appInfo.title+" - "+appInfo.version);
		
		//this.revealTop();
		
		setTimeout(enyo.bind(this,"getFaqs"),50);
		setTimeout(enyo.bind(this,"getChangelog"),50);
		
		//if(debug) this.error("checkIfPluginInit(): "+objwAMP.checkIfPluginInit());
		
		
	},
	resize: function() {
		if(debug) this.log("resize");
		
	},
	
	headerClick: function() {
		if(debug) this.log("headerClick");
		
		this.revealTop();
		
	},
	revealTop: function() {
		if(debug) this.log("revealTop");
		
		this.$.helpScroller.scrollIntoView(0,0);
		
	},
	backClick: function() {
		if(debug) this.log("backClick");
		
		this.doPreviousView();
	},
	
	
	getFaqs: function() {
	
		this.$.getFaqsService.setUrl("./faqs.html");
		this.$.getFaqsService.call();
	
	},
	getFaqsResponse: function(inSender, inResponse) {
		//if(debug) this.log("getFaqsResponse: "+inResponse);
		if(debug) this.log("getFaqsResponse");
		
		this.$.faqsContent.setContent(inResponse);
		
	},
	getFaqsFailure: function(inSender, inResponse) {
		this.error("getFaqsFailure");
		
		this.$.faqsContent.setContent("Error getting FAQS");
		
	},
	getTips: function() {
	
		this.$.getTipsService.setUrl("./tips.html");
		this.$.getTipsService.call();
	
	},
	getTipsResponse: function(inSender, inResponse) {
		//if(debug) this.log("getTipsResponse: "+inResponse);
		if(debug) this.log("getTipsResponse");
		
		this.$.tipsContent.setContent(inResponse);
		
	},
	getTipsFailure: function(inSender, inResponse) {
		this.error("getTipsFailure");
		
		this.$.tipsContent.setContent("Error getting tips");
		
	},
	getChangelog: function() {
	
		this.$.getChangelogService.setUrl("./changelog.html");
		this.$.getChangelogService.call();
	
	},
	getChangelogResponse: function(inSender, inResponse) {
		//if(debug) this.log("getChangelogResponse: "+inResponse);
		if(debug) this.log("getChangelogResponse");
		
		this.$.changelogContent.setContent(inResponse);
		
	},
	getChangelogFailure: function(inSender, inResponse) {
		this.error("getChangelogFailure");
		
		this.$.changelogContent.setContent("Error getting changelog");
		
	},
	getSupport: function() {
	
		this.$.getSupportService.setUrl("./support.html");
		this.$.getSupportService.call();
	
	},
	getSupportResponse: function(inSender, inResponse) {
		//if(debug) this.log("getSupportResponse: "+inResponse);
		if(debug) this.log("getSupportResponse");
		
		this.$.supportContent.setContent(inResponse);
		
	},
	getSupportFailure: function(inSender, inResponse) {
		this.error("getSupportFailure");
		
		this.$.supportContent.setContent("Error getting support");
		
	},
	
	
});