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


var AmpacheXL = {};

var debug = true;

AmpacheXL.prefsCookieString = enyo.getCookie("AmpacheXL-prefs");
AmpacheXL.prefsCookie;

AmpacheXL.connected = false;

AmpacheXL.connectResponse = {};

AmpacheXL.localPlaylists = [];

AmpacheXL.nowplaying = [];

AmpacheXL.downloads = [];

AmpacheXL.allSongs = [];
AmpacheXL.allAlbums = [];
AmpacheXL.allArtists = [];
AmpacheXL.allTags = [];
AmpacheXL.allPlaylists = [];
AmpacheXL.allVideos = [];

AmpacheXL.currentSong = {};
AmpacheXL.nextSong = {};
AmpacheXL.currentDownload = {};

AmpacheXL.numBuffers = 2;
AmpacheXL.ApacheTimeout = 300;

AmpacheXL.windowActivated = true;

enyo.kind({
	name: "AmpacheXL.main",
	kind: "VFlexBox",
	className: "AmpacheXL",
	
	viewMode: "tablet",
	
	currentRightPane: "hosts",
	
	dataRequestView: "",
	bannerMessageId: "",
	
	components: [
	
		{kind: "ApplicationEvents", onLoad: "appLoaded", onUnload: "appUnloaded", onError: "appError", onWindowActivated: "windowActivated", onWindowDeactivated: "windowDeactivated", onBack: "backHandler", onWindowParamsChange: "windowParamsChangeHandler"},
		
		{name: "mediaPermissionsService", kind : "PalmService", service : "palm://com.palm.mediapermissions", method : "request", onSuccess : "mediaPermissionsSuccess", onFailure : "mediaPermissionsFailure", subscribe : true },
		
		{name: "lockVolumeKeysService", kind: "PalmService", service: "palm://com.palm.audio/media", method: "lockVolumeKeys", subscribe: true, foregroundApp: true, onSuccess: "lockVolumeKeysResponse", onFailure: "lockVolumeKeysFailure"},
		
		{name: "keyService", kind: "PalmService", service: "palm://com.palm.keys/media", method: "status", subscribe: true, onSuccess: "keyServiceResponse", onFailure: "keyServiceFailure" },
		{name: "headsetService", kind: "PalmService", service: "palm://com.palm.keys/headset", method: "status", subscribe: true, onSuccess: "headsetServiceResponse", onFailure: "headsetServiceFailure" },
		
		{name: "ampacheConnectService", kind: "WebService", handleAs: "txt", onSuccess: "ampacheConnectResponse", onFailure: "ampacheConnectFailure"},
		{name: "dataRequestService", kind: "WebService", handleAs: "txt", onSuccess: "dataRequestResponse", onFailure: "dataRequestFailure"},
		{name: "pingService", kind: "WebService", handleAs: "xml", onSuccess: "ampachePingResponse", onFailure: "ampachePingFailure"},
		{name: "lastfmConnectService", kind: "WebService", handleAs: "txt", method: "POST", onSuccess: "lastfmConnectResponse", onFailure: "lastfmConnectFailure"},
				
		{kind: "AppMenu", components: [
			{caption: "About", onclick: "openAbout"},
			{caption: "Disconnect", onclick: "disconnect"},
			{caption: "Preferences", onclick: "openPreferences"},
			{caption: "Help", components: [
				{caption: "Help", onclick: "openHelp"},
				{caption: "Forums (on Precentral)", onclick: "openForums"},
				{caption: "Open Ampache in browser", onclick: "openBrowser"},
				{caption: "Leave review", onclick: "openCatalog"},
				{caption: "Email Developer", onclick: "emailDeveloper"},
			]},
		]},
		
		{name: "aboutPopup", kind: "Popup", scrim: true, components: [
			{content: "Ampache XL - "+enyo.fetchAppInfo().version, style: "text-align: center; font-size: larger;"},
			{content: "<hr />", allowHtml: true},
			{name: "aboutPopupText", content: "AmpacheXL is an app for Ampache written for use on a webOS tablet.", style: "text-align: center; font-size: smaller;"},
			{content: "<hr />", allowHtml: true},
			{content: 'Audio playback powered by <a href="http://developer.palm.com/appredirect/?packageid=com.epikwarlord.audiophilehdpro">AudiophileHD</a>', style: "text-align: center; font-size: smaller;"},
			{content: "<hr />", allowHtml: true},
			{content: '<a href="http://code.google.com/p/ampachexl/">App homepage</a>', allowHtml: true, style: "text-align: center; font-size: smaller;"},
			{content: "<hr />", allowHtml: true},
			{content: '<a href="http://ampache.org/">Ampache homepage</a>', allowHtml: true, style: "text-align: center; font-size: smaller;"},
			{content: "<hr />", allowHtml: true},
			{kind: "Button", caption: "OK", onclick:"closeAboutPopup"},
			{kind: "Button", caption: "Help", onclick:"openHelp"}
		]},
		
		{name: "bannerMessagePopup", kind: "Popup", scrim: true, onBeforeOpen: "beforeBannerMessageOpen", components: [
			{name: "bannerMessagePopupText", allowHtml: true, style: "text-align: center;"},
			{kind: "Button", caption: "OK", onclick:"closeBannerMessagePopup"}
		]},
		
		{name: "startPlayingPopup", kind: "Popup", scrim: true, onclick: "scrimClick", layoutKind: "VFlexLayout", align: "center", pack: "center", lazy: false, components: [
			{name: "startPlayingText", content: "Starting playback, please wait", allowHtml: true, style: "text-align: center;"},
			{name: "startPlayingTitle", allowHtml: true, style: "text-align: center;"},
			{name: "startPlayingArtist", allowHtml: true, style: "text-align: center;"},
		]},
		
		{name: "spinnerScrim", kind: "Scrim", onclick: "scrimClick", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
			{name: "scrimSpinner", kind: "SpinnerLarge"},
		]},
		
		{name: "preferencesPopup", kind: "Popup", className: "preferencesPopup", layoutKind: "VFlexLayout", height: "100%", width: "700px", scrim: true, onBeforeOpen: "beforePreferencesOpen", components: [
			{name: "preferencesHeader", style: "text-align: center;"},
			{content: "<hr/>", allowHtml: true},
			
			{kind: "Scroller", flex: 1, components: [
			
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Automatically connect to last server&nbsp;&nbsp;&nbsp;", allowHtml: true, flex: 1},
					{name: "autoLogin", kind: "ToggleButton", onChange: "autoLoginToggle"},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{name: "startingPane", kind: "ListSelector", label: "Starting view after login", onChange: "startingPaneSelect", flex: 1, items: [
						{caption: "None", value: "nowplaying"},
						{caption: "Songs", value: "songsList"},
						{caption: "Albums", value: "albumsList"},
						{caption: "Random Album", value: "random"},
						{caption: "Artists", value: "artistsList"},
						{caption: "Genres", value: "tagsList"},
						{caption: "Playlists", value: "playlistsList"},
						{caption: "Videos", value: "videosList"},
					]},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{name: "limitCount", kind: "ListSelector", label: "Data request limit", onChange: "limitCountSelect", flex: 1, items: [
						{caption: "100", value: 100},
						{caption: "300", value: 300},
						{caption: "1000", value: 1000},
						{caption: "3000", value: 3000},
						{caption: "All", value: "all"},
					]},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{name: "defaultAction", kind: "ListSelector", label: "Default Action", onChange: "defaultActionSelect", flex: 1, items: [
						{caption: "Play all", value: "play[]:[]all[]:[]straight"},
						{caption: "Play all, shuffled", value: "play[]:[]all[]:[]shuffled"},
						{caption: "Play single song", value: "play[]:[]single[]:[]straight"},
						{caption: "Queue all", value: "queue[]:[]all[]:[]straight"},
						{caption: "Queue all, shuffled", value: "queue[]:[]all[]:[]shuffled"},
						{caption: "Queue single song", value: "queue[]:[]single[]:[]straight"},
					]},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{name: "nowPlayingEnd", kind: "ListSelector", label: "When playback ends", onChange: "nowPlayingEndSelect", flex: 1, items: [
						{caption: "Stop", value: "stop[]:[]straight"},
						{caption: "Play again", value: "play[]:[]straight"},
						{caption: "Play again, shuffled", value: "play[]:[]shuffled"},
					]},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{name: "playerType", kind: "ListSelector", label: "Player type", onChange: "playerTypeSelect", flex: 1, items: [
						{caption: "Plugin", value: "plugin"},
						{caption: "HTML5 audio, media", value: "mediaClass"},
						{caption: "HTML5 audio, basic", value: "basic"},
					]},
				]},
				/*
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Set media audio class (good for BT, but pauses at other sounds)", flex: 1},
					{name: "mediaAudioClass", kind: "ToggleButton", onChange: "mediaAudioClassToggle"},
				]},
				*/
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Retry on failed download", flex: 1},
					{name: "retryDownload", kind: "ToggleButton", onChange: "retryDownloadToggle"},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Dashboard playback controls", flex: 1},
					{name: "dashboardPlayer", kind: "ToggleButton", onChange: "dashboardPlayerToggle"},
				]},
				{kind: "Item", showing: true, align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{name: "theme", kind: "ListSelector", label: "Theme", onChange: "themeSelect", flex: 1, items: [
						{caption: "Dark", value: "dark"},
						{caption: "Light", value: "light"},
					]},
				]},
				{kind: "Item", showing: true, align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{name: "albumsSort", kind: "ListSelector", label: "Albums sort", onChange: "albumsSortSelect", flex: 1, items: [
						{caption: "Album name", value: "album"},
						{caption: "Year", value: "year"},
					]},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Get album art from web (last.fm)", flex: 1},
					{name: "webArt", kind: "ToggleButton", onChange: "webArtToggle"},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Show album art on lists", flex: 1},
					{name: "artOnLists", kind: "ToggleButton", onChange: "artOnListsToggle"},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Banner message on each track", flex: 1},
					{name: "bannerOnPlayback", kind: "ToggleButton", onChange: "bannerOnPlaybackToggle"},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Last.fm", flex: 1},
					{name: "lastFM", kind: "ToggleButton", onChange: "lastFMToggle"},
				]},
				{name: "lastFMusernameItem", showing: false, kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Last.fm username&nbsp;&nbsp;"},
					{name: "lastFMusername", kind: "Input", flex: 1, autoCapitalize: "lowercase"},
				]},
				{name: "lastFMpasswordItem", showing: false, kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Last.fm password&nbsp;&nbsp;&nbsp;", allowHtml: true},
					{name: "lastFMpassword", kind: "PasswordInput", flex: 1},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Usage statitistics with Metrix", flex: 1},
					{name: "allowMetrix", kind: "ToggleButton", onChange: "allowMetrixToggle"},
				]},
				{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: "Debug mode", flex: 1},
					{name: "debug", kind: "ToggleButton", onChange: "debugToggle"},
				]},
			
			]},
			
			{kind: "Button", caption: "Save", onclick:"saveNewPreferences"},
		]},
		
		{name: "searchPopup", kind: "Popup", scrim: true, onBeforeOpen: "beforeSearchOpen", onOpen: "searchOpen", showKeyboardWhenOpening: true, components: [
			{name: "searchHeader", content: "Search", style: "text-align: center;"},
			{name: "searchInput", kind: "Input", autoCapitalize: "lowercase"},
			{name: "songsSearch", caption: "Songs", kind: "Button", className: "searchButton", onclick: "searchClick"},
			{name: "albumsSearch", caption: "Albums", kind: "Button", className: "searchButton", onclick: "searchClick"},
			{name: "artistsSearch", caption: "Artists", kind: "Button", className: "searchButton", onclick: "searchClick"},
			{name: "tagsSearch", caption: "Genres", kind: "Button", className: "searchButton", onclick: "searchClick"},
			{name: "playlistsSearch", caption: "Playlists", kind: "Button", className: "searchButton", onclick: "searchClick"},
			{name: "allSearch", caption: "All of the above", kind: "Button", className: "searchButton", onclick: "searchClick"},
		]},
		
		{name: "mainPane", kind2: "HFlexBox", kind: "SlidingPane", flex: 1, onSelectView: "mainPaneViewSelected", components: [
			{name: "leftMenu", kind: "SlidingView", className: "leftMenu", width: "300px", layoutKind2: "VFlexLayout", components: [
				{kind: "VFlexBox", height: "100%", width: "300px", components: [
					{name: "leftMenuKind", kind: "LeftMenuKind", flex: 1, onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onOpenAppMenu: "openAppMenu", onAllItems: "allItems"},
					
					{name: "pluginHolder", kind: "Control", height: "0px", className2: "pluginHolder"},
					
					{name: "playback", kind: "Playback", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onPreviousTrack: "previousTrack", onNextTrack: "nextTrack", onBannerMessage: "bannerMessage", onUpdatePlaybackStatus: "updatePlaybackStatus", onCloseStartingPlayback: "closeStartingPlayback"},
				]},
			]},
			
			{name: "rightContent", className: "rightContent", kind: "Pane", flex: 1, onSelectView: "rightContentViewSelected", onCreateView: "rightContentViewCreated", transitionKind: "enyo.transitions.Simple", components: [	
				
				{name: "hosts", kind: "Hosts", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onPlaySong: "playSong", onBannerMessage: "bannerMessage", onUpdateCounts: "updateCounts", onAmpacheConnect: "ampacheConnect", onSavePreferences: "savePreferences", onPreviousView: "previousView", onDbRequest: "dbRequest", onGetMediaPermissions: "getMediaPermissions"},
				
				{name: "nowplaying", kind: "Nowplaying", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onPlaySong: "playSong", onBannerMessage: "bannerMessage", onUpdateCounts: "updateCounts", onQueueNextSong: "queueNextSong", onPreviousView: "previousView", onDbRequest: "dbRequest", onStartingPlayback: "startingPlayback"},
				
				{name: "downloads", kind: "Downloads", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onPlaySong: "playSong", onBannerMessage: "bannerMessage", onUpdateCounts: "updateCounts", onQueueNextSong: "queueNextSong", onPreviousView: "previousView", onDbRequest: "dbRequest"},
				
				{name: "random", kind: "Random", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onPreviousView: "previousView", onDbRequest: "dbRequest", onUpdateCounts: "updateCounts"},
				
				{name: "artistsList", kind: "ArtistsList", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onPreviousView: "previousView", onSavePreferences: "savePreferences", onDbRequest: "dbRequest", onUpdateCounts: "updateCounts"},
				{name: "albumsList", kind: "AlbumsList", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onPreviousView: "previousView", onSavePreferences: "savePreferences", onDbRequest: "dbRequest", onUpdateCounts: "updateCounts"},
				{name: "playlistsList", kind: "PlaylistsList", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onPreviousView: "previousView", onSavePreferences: "savePreferences", onUpdateCounts: "updateCounts", onLocalplaylistSongs: "localplaylistSongs", onDbRequest: "dbRequest", onUpdateCounts: "updateCounts"},
				{name: "tagsList", kind: "TagsList", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onPreviousView: "previousView", onSavePreferences: "savePreferences", onDbRequest: "dbRequest", onUpdateCounts: "updateCounts"},
				
				{name: "songsList", kind: "SongsList", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onPlaySong: "playSong", onBannerMessage: "bannerMessage", onNowplayingUpdated: "nowplayingUpdated", onPreviousView: "previousView", onSavePreferences: "savePreferences", onUpdateCounts: "updateCounts", onDbRequest: "dbRequest", onStartingPlayback: "startingPlayback"},
				
				{name: "videosList", kind: "VideosList", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onPreviousView: "previousView", onUpdateCounts: "updateCounts", onDbRequest: "dbRequest"},
				
				{name: "help", kind: "Help", onViewSelected: "viewSelected", onDataRequest: "dataRequest", onUpdateSpinner: "updateSpinner", onBannerMessage: "bannerMessage", onPreviousView: "previousView", onDbRequest: "dbRequest"},
				
			]},
		]},
		
	],
	
	create: function() {
		if(debug) this.log("create");
		this.inherited(arguments);
		
		//enyo.keyboard.setResizesWindow(false);
		
		AmpacheXL.Metrix = new Metrix(); 
		
		if((AmpacheXL.prefsCookieString)&&(true)) {
		
			if(debug) this.log("we have cookie");
			AmpacheXL.prefsCookie = enyo.json.parse(AmpacheXL.prefsCookieString);
			
			//new settings
			if(AmpacheXL.prefsCookie.bannerOnPlayback == null) AmpacheXL.prefsCookie.bannerOnPlayback = true;
			
			
			if(AmpacheXL.prefsCookie.allowMetrix) setTimeout(enyo.bind(this,"submitMetrix"),60000);
			if(AmpacheXL.prefsCookie.autoLogin) setTimeout(enyo.bind(this,"ampacheConnect"),100);
			
			//if((AmpacheXL.prefsCookie.lastFM)&&(!AmpacheXL.prefsCookie.lastFMkey)) setTimeout(enyo.bind(this,"lastfmConnect"),200);
			if(AmpacheXL.prefsCookie.lastFM) setTimeout(enyo.bind(this,"lastfmConnect"),200);
			
			var appInfo = enyo.fetchAppInfo();
			
			if(AmpacheXL.prefsCookie.appVersion != appInfo.version) {
				if(debug) this.log("app had been upgraded from "+AmpacheXL.prefsCookie.appVersion+" to "+appInfo.version);
				
				if(AmpacheXL.prefsCookie.appVersion == null) setTimeout(enyo.bind(this, "localplaylistsSelect"), 1500)
			}
			
			AmpacheXL.prefsCookie.appVersion = appInfo.version;
			
			if(!AmpacheXL.prefsCookie.limitCount) AmpacheXL.prefsCookie.limitCount = 300;
			if(!AmpacheXL.prefsCookie.retryDownload) AmpacheXL.prefsCookie.retryDownload = true;
			
			if((AmpacheXL.prefsCookie.mediaAudioClass === true)||(AmpacheXL.prefsCookie.mediaAudioClass === false)) 
			{
				AmpacheXL.prefsCookie.mediaAudioClass = null;
				AmpacheXL.prefsCookie.playerType = "plugin";
			}
			
		} else {
		
			if(debug) this.log("we don't have cookie");
			AmpacheXL.prefsCookie = defaultCookie();
			
			setTimeout(enyo.bind(this, "openAbout"),150);
			
		}
		
		this.savePreferences();
			
		this.$.hosts.activate();
			
		enyo.setAllowedOrientation(AmpacheXL.prefsCookie.allowedOrientation);	
		debug = AmpacheXL.prefsCookie.debug;
		
		this.addClass(AmpacheXL.prefsCookie.theme);
		
		//if(window.PalmSystem) this.$.lockVolumeKeysService.call({subscribe: true, foregroundApp: true, parameters: {subscribe: true, foregroundApp: true}});
		
		//if(window.PalmSystem) this.$.keyService.call({subscribe: true, parameters: {subscribe: true}});
		//if(window.PalmSystem) this.$.headsetService.call({subscribe: true, parameters: {subscribe: true}});
		
		//this.activate();
		
		html5sql.openDatabase("ext:com.thewbman.ampachexl","AmpacheXL Database", 10*1024*1024);
		html5sql.changeVersion("","v5", "CREATE TABLE songs (id INTEGER, title TEXT, artist TEXT, artist_id INTEGER, album TEXT, album_id INTEGER, track INTEGER, time INTEGER, oldUrl TEXT, oldArt TEXT); CREATE TABLE artists (id INTEGER, name TEXT, albums TEXT, songs INTEGER); CREATE TABLE albums (id INTEGER, name TEXT, artist TEXT, artist_id INTEGER, tracks INTEGER, year TEXT, oldArt TEXT); CREATE TABLE localplaylist_songs (playlist_id INTEGER, id INTEGER, title TEXT, artist TEXT, artist_id INTEGER, album TEXT, album_id INTEGER, track INTEGER, time INTEGER, oldUrl TEXT, oldArt TEXT); CREATE TABLE localplaylists (playlist_id INTEGER PRIMARY KEY, name TEXT, items INTEGER, source TEXT, oldAuth TEXT)", enyo.bind(this, "changeVersion1Success"), enyo.bind(this, "changeVersion1Failure"));
		
		//html5sql.changeVersion("","v1", "CREATE TABLE songs (id INTEGER, title TEXT, artist TEXT, artist_id INTEGER, album TEXT, album_id INTEGER, track INTEGER, time INTEGER, oldUrl TEXT, oldArt TEXT)", enyo.bind(this, "changeVersion1Success"), enyo.bind(this, "changeVersion1Failure"));
		//html5sql.changeVersion("v1","v2", "CREATE TABLE artists (id INTEGER, name TEXT, albums TEXT, songs INTEGER)", enyo.bind(this, "changeVersion2Success"), enyo.bind(this, "changeVersion2Failure"));
		//html5sql.changeVersion("v2","v3", "CREATE TABLE albums (id INTEGER, name TEXT, artist TEXT, artist_id INTEGER, tracks INTEGER, year TEXT, oldArt TEXT)", enyo.bind(this, "changeVersion1Success"), enyo.bind(this, "changeVersion1Failure"));
		//html5sql.changeVersion("","v3", "CREATE TABLE songs (id INTEGER, title TEXT, artist TEXT, artist_id INTEGER, album TEXT, album_id INTEGER, track INTEGER, time INTEGER, oldUrl TEXT, oldArt TEXT); CREATE TABLE artists (id INTEGER, name TEXT, albums TEXT, songs INTEGER); CREATE TABLE albums (id INTEGER, name TEXT, artist TEXT, artist_id INTEGER, tracks INTEGER, year TEXT, oldArt TEXT)", enyo.bind(this, "changeVersion1Success"), enyo.bind(this, "changeVersion1Failure"));
		
		//html5sql.changeVersion("v3","v4", "CREATE TABLE localplaylist_songs (playlist_id INTEGER, id INTEGER, title TEXT, artist TEXT, artist_id INTEGER, album TEXT, album_id INTEGER, track INTEGER, time INTEGER, oldUrl TEXT, oldArt TEXT)", enyo.bind(this, "changeVersion4Success"), enyo.bind(this, "changeVersion4Failure"));
		//html5sql.changeVersion("v4","v5", "CREATE TABLE localplaylists (playlist_id INTEGER PRIMARY KEY, name TEXT, items INTEGER, source TEXT, oldAuth TEXT)", enyo.bind(this, "changeVersion5Success"), enyo.bind(this, "changeVersion5Failure"));
		html5sql.changeVersion("v3","v5", "CREATE TABLE localplaylist_songs (playlist_id INTEGER, id INTEGER, title TEXT, artist TEXT, artist_id INTEGER, album TEXT, album_id INTEGER, track INTEGER, time INTEGER, oldUrl TEXT, oldArt TEXT); CREATE TABLE localplaylists (playlist_id INTEGER, name TEXT, items INTEGER, source TEXT, oldAuth TEXT)", enyo.bind(this, "changeVersion5Success"), enyo.bind(this, "changeVersion5Failure"));
		
		
		AmpacheXL.audioPlayer = new AudioPlayer(this);
		
		if((AmpacheXL.prefsCookie.mediaPermissions != null)&&(window.PalmSystem)) this.getMediaPermissions();
		

		
	},
	rendered: function() {
		if(debug) this.log("rendered");
		this.inherited(arguments);
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			try {
				
				AmpacheXL.pluginObj = window.document.createElement("object");

				AmpacheXL.pluginObj.id = "wAMPPlugin";
				AmpacheXL.pluginObj.type = "application/x-palm-remote";
				AmpacheXL.pluginObj.setAttribute("height", "1px");
				AmpacheXL.pluginObj.setAttribute("width",	"1px");
				AmpacheXL.pluginObj.setAttribute('x-palm-pass-event', true);

				var param1 = window.document.createElement("param");
				param1.name = "appid";
				param1.value = OWNDER_STR;

				var param2 = window.document.createElement("param");
				param2.name = "exe";
				param2.value = "wAMP_plugin";

				AmpacheXL.pluginObj.appendChild(param1);
				AmpacheXL.pluginObj.appendChild(param2);
				
				if(debug) this.log("created object");
				
				//document.getElementsByTagName('body')[0].appendChild(pluginObj);
				document.getElementById('main_pluginHolder').appendChild(AmpacheXL.pluginObj);
				
				if(debug) this.log("added to body");
				
				AmpacheXL.pluginObj.StartSong = function(path, artist, title, iTrack) {
					this.pluginStartSong(path, artist, title, iTrack);
				}.bind(this)
				
				setTimeout(enyo.bind(this, "testPluginPlay"), 10000)
				
				/*
				//var domobjPlugin
				AmpacheXL.wampPlugin = CreatePluginHook();

				document.getElementsByTagName('body')[0].appendChild(AmpacheXL.wampPlugin);
				//document.getElementById('main_mainPane').appendChild(AmpacheXL.wampPlugin);
				
				if(debug) this.error("success CreatePluginHook and appendChild");
				
				//AmpacheXL.wampPlugin.Open("/media/internal/music/Adele/21/12.Adele - Rolling in the Deep.mp3", 0);
				//document.getElementById('wAMPPlugin').Open("/media/internal/music/Adele/21/12.Adele - Rolling in the Deep.mp3", 0);
				//document.getElementById('wAMPPlugin').AddToIndex('test', "dirty");
				objwAMP.CheckOS(document.getElementById('wAMPPlugin'));
				
				if(debug) this.error("checkIfPluginInit(): "+objwAMP.checkIfPluginInit());
				
				//objwAMP.CallOpenSong("/media/internal/music/Adele/21/12.Adele - Rolling in the Deep.mp3", 0);
				   
				//if(debug) this.error("after AmpacheXL.wampPlugin.Start(0)");
				*/
				
			} catch(e) {
				this.error(e);
			}
		}
	},
	
	testPluginPlay: function() {
		if(debug) this.log("testPluginPlay");
		
		//AmpacheXL.pluginObj.Open("/media/internal/music/Adele/21/01.mp3",0);
		//AmpacheXL.pluginObj.Open("http://192.168.1.105/ampache/play/index.php?ssid=69362153ccdc09824f98082a9e217672&oid=5934&uid=1&name=/Buckcherry%20-%20Crazy%20Bitch.mp3",0);
	
	},
	pluginStartSong: function(path, artist, title, iTrack) {
		if(debug) this.log("pluginStartSong: "+path+" "+artist+" "+title+" "+iTrack);
		
		this.$.startPlayingPopup.close();
		
		this.$.playback.pluginStartSong(path, artist, title, iTrack);
		
		//this.doBannerMessage("pluginStartSong: "+path+" "+artist+" "+title+" "+iTrack, true);
		
		setTimeout(enyo.bind(this,"pluginPlay"), 50);
	},
	pluginPlay: function() {
		if(debug) this.log("pluginPlay");
		
		AmpacheXL.pluginObj.Play(0);
	},
	
	activate: function() {
		if(debug) this.log("activate");
		
		//this.ampacheConnect();
	},
	savePreferences: function() {
		if(debug) this.log("savePreferences");
		
		enyo.setCookie("AmpacheXL-prefs", enyo.json.stringify(AmpacheXL.prefsCookie));
	},
	submitMetrix: function() {
		if(debug) this.log("submitMetrix");
		
		if(window.PalmSystem) {
			AmpacheXL.Metrix.postDeviceData();
			
			AmpacheXL.Metrix.checkBulletinBoard(10, false);
		}
	},
	openAbout: function() {
		if(debug) this.log("openAbout");
		
		this.$.aboutPopup.openAtCenter();
	},
	closeAboutPopup: function() {
		if(debug) this.log("closeAboutPopup");
		
		this.$.aboutPopup.close();
	},
	disconnect: function() {
		if(debug) this.log("disconnect");
		
		AmpacheXL.connected = false;
		
		AmpacheXL.currentSong = {};
		AmpacheXL.nextSong = {};
		
		AmpacheXL.connectResponse.auth = "";
		AmpacheXL.connectResponse.update = "";
		AmpacheXL.connectResponse.add = "";
		AmpacheXL.connectResponse.clean = "";
		AmpacheXL.connectResponse.songs = "";
		AmpacheXL.connectResponse.artists = "";
		AmpacheXL.connectResponse.albums = "";
		AmpacheXL.connectResponse.playlists = "";
		AmpacheXL.connectResponse.videos = "";
				
		AmpacheXL.connectResponse.tags = "";
		AmpacheXL.connectResponse.api = "";
		
		AmpacheXL.nowplaying.length = 0;
		AmpacheXL.allArtists.length = 0;
		AmpacheXL.allAlbums.length = 0;
		AmpacheXL.allPlaylists.length = 0;
		AmpacheXL.allTags.length = 0;
		AmpacheXL.allSongs.length = 0;
		AmpacheXL.allVideos.length = 0;
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			AmpacheXL.pluginObj.Pause(0);
		} else {
			AmpacheXL.audioPlayer.cleanup();
		}
		
		this.updateCounts();
		this.$.playback.disconnect();
		this.$.rightContent.selectViewByName("hosts");
		clearInterval(AmpacheXL.pingInterval);
	},
	openPreferences: function() {
		if(debug) this.log("openPreferences");
		
		this.$.preferencesPopup.openAtCenter();
	},
	beforePreferencesOpen: function() {
		if(debug) this.log("beforePreferencesOpen");
		
		var appInfo = enyo.fetchAppInfo();
		this.$.preferencesHeader.setContent(appInfo.title+" - "+appInfo.version);
		
		this.$.autoLogin.setState(AmpacheXL.prefsCookie.autoLogin);
		this.$.startingPane.setValue(AmpacheXL.prefsCookie.startingPane);
		this.$.limitCount.setValue(AmpacheXL.prefsCookie.limitCount);
		this.$.defaultAction.setValue(AmpacheXL.prefsCookie.defaultAction);
		this.$.nowPlayingEnd.setValue(AmpacheXL.prefsCookie.nowPlayingEnd);
		this.$.playerType.setValue(AmpacheXL.prefsCookie.playerType);
		//this.$.mediaAudioClass.setState(AmpacheXL.prefsCookie.mediaAudioClass);
		this.$.retryDownload.setState(AmpacheXL.prefsCookie.retryDownload);
		this.$.dashboardPlayer.setState(AmpacheXL.prefsCookie.dashboardPlayer);
		this.$.theme.setValue(AmpacheXL.prefsCookie.theme);
		this.$.albumsSort.setValue(AmpacheXL.prefsCookie.albumsSort);
		this.$.webArt.setState(AmpacheXL.prefsCookie.webArt);
		this.$.artOnLists.setState(AmpacheXL.prefsCookie.artOnLists);
		this.$.bannerOnPlayback.setState(AmpacheXL.prefsCookie.bannerOnPlayback);
		this.$.lastFM.setState(AmpacheXL.prefsCookie.lastFM);
		if(AmpacheXL.prefsCookie.lastFMusername) this.$.lastFMusername.setValue(AmpacheXL.prefsCookie.lastFMusername);
		if(AmpacheXL.prefsCookie.lastFMpassword) this.$.lastFMpassword.setValue(AmpacheXL.prefsCookie.lastFMpassword);
		this.$.allowMetrix.setState(AmpacheXL.prefsCookie.allowMetrix);
		this.$.debug.setState(AmpacheXL.prefsCookie.debug);
		
		this.lastFMToggle();
		
	},
	themeSelect: function(inSender, inValue, inOldValue) {
		if(debug) this.log("themeSelect from "+inOldValue+" to "+inValue);
		
		this.removeClass(inOldValue);
		this.addClass(inValue);
	},
	lastFMToggle: function() {
		if(debug) this.log("lastFMToggle");
		
		if(this.$.lastFM.getState()) {
			this.$.lastFMusernameItem.show();
			this.$.lastFMpasswordItem.show();
		} else {
			this.$.lastFMusernameItem.hide();
			this.$.lastFMpasswordItem.hide();
		}
	},
	playerTypeSelect: function() {
		this.doBannerMessage('NOTE: After changing this preferences, you must close and reopen the app for the changes to take effect.  <hr />Plugin is provided from <a href="http://developer.palm.com/appredirect/?packageid=com.epikwarlord.audiophilehdpro">AudiophileHD</a> and is still experimental, but can provide better playback for transcoded files.  <hr />Using the HTML5 audio with with media setting provides playback over bluetooth, but may occasionally pause when the TouchPad gets notifications.  <hr />The basic HTML5 audio does not support bluetooth playback, but will not pause when the TouchPad plays other sounds.', true); 
	},
	saveNewPreferences: function() {
		if(debug) this.log("saveNewPreferences");
		
		AmpacheXL.prefsCookie.autoLogin = this.$.autoLogin.getState();
		AmpacheXL.prefsCookie.startingPane = this.$.startingPane.getValue();
		AmpacheXL.prefsCookie.limitCount = this.$.limitCount.getValue();
		AmpacheXL.prefsCookie.defaultAction = this.$.defaultAction.getValue();
		AmpacheXL.prefsCookie.nowPlayingEnd = this.$.nowPlayingEnd.getValue();
		AmpacheXL.prefsCookie.playerType = this.$.playerType.getValue();
		//AmpacheXL.prefsCookie.mediaAudioClass = this.$.mediaAudioClass.getState();
		AmpacheXL.prefsCookie.retryDownload = this.$.retryDownload.getState();
		AmpacheXL.prefsCookie.dashboardPlayer = this.$.dashboardPlayer.getState();
		AmpacheXL.prefsCookie.theme = this.$.theme.getValue();
		AmpacheXL.prefsCookie.albumsSort = this.$.albumsSort.getValue();
		AmpacheXL.prefsCookie.webArt = this.$.webArt.getState();
		AmpacheXL.prefsCookie.artOnLists = this.$.artOnLists.getState();
		AmpacheXL.prefsCookie.bannerOnPlayback = this.$.bannerOnPlayback.getState();
		AmpacheXL.prefsCookie.lastFM = this.$.lastFM.getState();
		if(this.$.lastFM.getState()) AmpacheXL.prefsCookie.lastFMusername = this.$.lastFMusername.getValue();
		if(this.$.lastFM.getState()) AmpacheXL.prefsCookie.lastFMpassword = this.$.lastFMpassword.getValue();
		AmpacheXL.prefsCookie.allowMetrix = this.$.allowMetrix.getState();
		AmpacheXL.prefsCookie.debug = this.$.debug.getState();
		
		
		debug = this.$.debug.getState();
		
		this.savePreferences();
		this.$.preferencesPopup.close();
		
		if((AmpacheXL.prefsCookie.lastFM)&&(!AmpacheXL.prefsCookie.lastFMkey)) this.lastfmConnect();
		
	},
	openHelp: function() {
		if(debug) this.log("openHelp");
		
		this.$.rightContent.selectViewByName("help");
		
		this.$.aboutPopup.close();
	},
	openForums: function() {
		if(debug) this.log("openForums") 
		
		window.open("http://forums.precentral.net/webos-apps/288747-announcing-ampachexl-touchpad.html");
	},
	openBrowser: function() {
		if(debug) this.log("openBrowser") 
		
		window.open(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].url);
	},
	openCatalog: function() {
		if(debug) this.log("openCatalog");
		
		var appInfo = enyo.fetchAppInfo();
		
		window.open("http://developer.palm.com/appredirect/?packageid="+appInfo.id);
	},
	emailDeveloper: function() {
		if(debug) this.log("emailDeveloper"); 
		
		var appInfo = enyo.fetchAppInfo();
		
		window.open("mailto:ampachexl.help@gmail.com?subject=AmpacheXL Help - v"+appInfo.version);
	},	
	headerClick: function() {
		if(debug) this.log("got header click");
		
	},
	mainPaneViewSelected: function(inSender, inView, inPreviousView) {
		if(debug) this.log("mainPaneViewSelected from "+inPreviousView.name+" to "+inView.name);
		
		this.currentView = inView.name;
		
		//probably a better way to note activation
		switch(this.currentView) {
			case "asdf":
				this.$.asdf.activate();
			  break;
		}
	},
	rightContentViewSelected: function(inSender, inView, inPreviousView) {
		if(inPreviousView) {
			if(debug) this.log("rightContentViewSelected changing  from "+inPreviousView.name+" to "+inView.name);
			this.currentRightPane = inView.name;
			this.previousRightPane = inPreviousView.name;
		}
		
		this.savePreferences();
		
		this.updateCounts();
		this.$[inView.name].activate();
		
		try{ this.$[inPreviousView.name].deactivate();}
		catch(e) { this.log(e); };
	},
	
	doBannerMessage: function(inMessage, forcePopup) {
		this.bannerMessage("ampachexl", inMessage, forcePopup);
	},
	bannerMessage: function(inSender, inMessage, forcePopup) {
		if(debug) this.log("bannerMessage: "+inMessage);
		
		if(inMessage == "Error: Session Expired") this.disconnect();
		
		if((forcePopup)||(!window.PalmSystem)){
			this.bannerMessageText = inMessage;
			this.$.bannerMessagePopup.openAtCenter();
		} else {
			try {
				//enyo.windows.removeBannerMessage(this.bannerMessageId);
			} catch(e) {
				this.error(e);
			}
			
			this.bannerMessageId = enyo.windows.addBannerMessage(inMessage, "{}");
		}
		
	},
	beforeBannerMessageOpen: function() {
		if(debug) this.log("beforeBannerMessageOpen");
		
		this.$.bannerMessagePopupText.setContent(this.bannerMessageText);
	},
	closeBannerMessagePopup: function() {
		if(debug) this.log("closeBannerMessagePopup");
		
		this.$.bannerMessagePopup.close();
		
	},
	openAppMenu: function() {
		if(debug) this.log("openAppMenu");
		
		this.$.appMenu.open();
	},
	viewSelected: function(inSender, inItem) {
		if(debug) this.log("viewSelected: "+inItem);
		
		this.updateCounts();
		
		this.$.searchPopup.close();
		
		if(inItem == "searchSelector") {
			this.$.searchPopup.openAtCenter();
		} else {
			this.$.rightContent.selectViewByName(inItem);
		}
	},
	previousView: function() {
		if(debug) this.log("previousView");
		
		this.$.rightContent.back();
	},
	dataRequest: function(inSender, inView, inMethod, inParameters) {
		if(debug) this.log("dataRequest: "+inView+" "+inMethod+" "+inParameters);
		
		this.dataRequestView = inView;
		
		if(AmpacheXL.connectResponse.success) {
		
			var requestUrl = AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].url;
			requestUrl += "/server/xml.server.php?";
			requestUrl += "auth="+AmpacheXL.connectResponse.auth;
			requestUrl += "&action="+inMethod;
			requestUrl += inParameters;
		
			this.$.dataRequestService.setUrl(requestUrl);
			if(debug) this.log("dataRequestService url: "+this.$.dataRequestService.getUrl());
			this.$.dataRequestService.call();
		
		}
	},
	updateSpinner: function(inSender, inShow) {
		if(debug) this.log("updateSpinner: "+inShow);
		
		if(inShow) {
			//this.$.loadingPopup.openAtCenter();
			//this.$.loadingSpinner.show();
			this.$.spinnerScrim.show();
			this.$.scrimSpinner.show();
		} else {
			//this.$.loadingPopup.close();
			//this.$.loadingSpinner.hide();
			this.$.spinnerScrim.hide();
			this.$.scrimSpinner.hide();
		}
	},
	scrimClick: function() {
		if(debug) this.log("scrimClick");
		
		this.updateSpinner("ampachexl", false);
	},
	playSong: function(inSender, inSong) {
		if(debug) this.log("playSong");
		//if(debug) this.log("playSong: "+enyo.json.stringify(inSong));
		
		this.startingPlayback("ampachexl", inSong);
		
		this.$.playback.playSong(inSong);
		
		try {
			if(window.PalmSystem) enyo.windows.setWindowParams(this.dashWindow, inSong);
		} catch(e) {
			if(debug) this.log(e);
		}
	},
	previousTrack: function() {
		if(debug) this.log("previousTrack");
		
		//this.$.nowplaying.previousTrack();
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
		
			if(AmpacheXL.nowplayingIndex > 0) {
				AmpacheXL.nextSong = AmpacheXL.nowplaying[AmpacheXL.nowplayingIndex - 1];
				startingPlayback("amapchexl",AmpacheXL.nextSong);
				AmpacheXL.pluginObj.Open(AmpacheXL.nextSong.url,0);
				
			} else {
				//
			}
			
		} else {
			AmpacheXL.audioPlayer.previous();
		}
	},
	nextTrack: function() {
		if(debug) this.log("nextTrack");
		
		//this.$.nowplaying.nextTrack();
		
		if(AmpacheXL.prefsCookie.playerType == "plugin") {
			this.startingPlayback("amapchexl",AmpacheXL.nextSong);
			AmpacheXL.pluginObj.Open(AmpacheXL.nextSong.url,0);
		} else {
			AmpacheXL.audioPlayer.next();
		}
	},
	updateCounts: function() {
		if(debug) this.log("updateCounts");
		
		this.$.leftMenuKind.updateCounts();
		this.$.downloads.updateCounts();
	},
	nowplayingUpdated: function(inSender, inPlayAction) {
		if(debug) this.log("nowplayingUpdated: "+inPlayAction) 
		
		this.$.nowplaying.nowplayingUpdated(inPlayAction);
	},
	updatePlaybackStatus: function() {
		if(debug) this.log("updatePlaybackStatus");
		
		this.$.nowplaying.updatePlaybackStatus();
		
		try {
			if(window.PalmSystem) enyo.windows.setWindowParams(this.dashWindow, AmpacheXL.currentSong);
		} catch(e) {
			if(debug) this.log(e);
		}
		
		
		var expiresUTC = Date.parse(AmpacheXL.session_expire);
		var currentTime = new Date();
		var currentUTC = currentTime.getTime();
		
		if(expiresUTC < currentUTC) this.ampachePing();
		
	},
	queueNextSong: function(inSender, inSong) {
		if(debug) this.log("queueNextSong")
		
		this.$.playback.queueNextSong(inSong);
	},
	allItems: function(inSender, inView, inOther) {
		if(debug) this.log("allItems: "+inView);
		
		switch(inView) {
			case "songsList":
				this.$.songsList.allSongs(inOther);
				break;
			case "albumsList":
				this.$.albumsList.allAlbums(inOther);
				break;
			case "artistsList":
				this.$.artistsList.allArtists(inOther);
				break;
			case "playlistsList":
				this.$.playlistsList.allPlaylists(inOther);
				break;
			case "tagsList":
				this.$.tagsList.allTags(inOther);
				break;
			case "videosList":
				this.$.videosList.allVideos(inOther);
				break;
			
		}
	},
	localplaylistSongs: function(inSender, inPlaylistId, inAuth) {
		if(debug) this.log("localplaylistSongs: "+inPlaylistId+" "+inAuth);
		
		this.$.songsList.localplaylistSongs(inPlaylistId, inAuth);
	},
	dbRequest: function(inSender, inView, inProperty, inParameters) {
		if(debug) this.log("dbRequest: "+inView+" "+inProperty+" "+inParameters);
		
		this.$[inView].dbRequest(inProperty, inParameters);
	},
	startingPlayback: function(inSender, inSong) {
		this.$.startPlayingTitle.setContent(inSong.title);
		this.$.startPlayingArtist.setContent(inSong.artist);
		
		this.$.startPlayingPopup.openAtCenter();
	},
	closeStartingPlayback: function() {
		this.$.startPlayingPopup.close();
	},
	
	backHandler: function(inSender, e) {
		if(debug) this.log("backHandler");
		
	},
	resizeHandler: function() {
		if(debug) this.log("doing resize to "+document.body.clientWidth+"x"+document.body.clientHeight);
		
		this.$[this.currentRightPane].resize();
		
	},
	windowActivated: function() {
		if(debug) this.log("windowActivated");
		
		AmpacheXL.windowActivated = true;
		
		try {
			
			//document.getElementById('wAMPPlugin').Open("/media/internal/music/Adele/21/12.Adele - Rolling in the Deep.mp3", 0);
			//this.error("after plugin open");
		
			AmpacheXL.audioPlayer.UIStartPlaybackTimer();
			
			//if(this.doneFirstActivated) enyo.windows.setWindowParams(this.dashWindow, {close: true});
			if(this.doneFirstActivated) this.dashWindow.close();
			
			this.doneFirstActivated = true;
			
		} catch(e) {
			if(debug) this.log(e);
		}
	},
	windowDeactivated: function() {
		if(debug) this.log("windowDeactivated");
		
		AmpacheXL.windowActivated = false;
		
		if((AmpacheXL.prefsCookie.dashboardPlayer)&&(AmpacheXL.currentSong.title)) this.dashWindow = enyo.windows.openDashboard("dashboard.html", "dashWindowName", AmpacheXL.currentSong, {clickableWhenLocked: true});
		
		//AmpacheXL.audioPlayer.UIStopPlaybackTimer();
		
	},
	windowParamsChangeHandler: function() {
		if(debug) this.log("windowParamsChangeHandler: "+enyo.json.stringify(enyo.windowParams))
		
		switch(enyo.windowParams.playAction) {
			case "previous":
				this.previousTrack();
				break;
			case "next":
				this.nextTrack();
				break;
			case "play":
				this.$.playback.playClick();
				break;
			case "pause":
				this.$.playback.pauseClick();
				break;
		}
		
	},
	appUnloaded: function() {
		if(debug) this.log("appUnloaded");
		
		try {
			this.disconnect();
		} catch(e) {
			this.log(e);
		}
		
		try {
			this.dashWindow.close();
		} catch(e) {
			this.log(e);
		}

		AmpacheXL = {};
		
		if(window.PalmSystem) window.close();
	},
	
	lockVolumeKeysResponse: function(inSender, inResponse) {
		if(debug) this.log("lockVolumeKeysResponse: "+enyo.json.stringify(inResponse));
	},
	lockVolumeKeysFailure: function(inSender, inResponse) {
		if(debug) this.log("lockVolumeKeysFailure");
	},
	
	keyServiceResponse: function(inSender, inResponse) {
		if(debug) this.log("keyServiceResponse: "+enyo.json.stringify(inResponse));
		
		if(inResponse.state == "down"){
			switch(inResponse.key)
			{
				case "play":
					
					AmpacheXL.currentSong.status = "playing";
					
					if(AmpacheXL.prefsCookie.playerType == "plugin") {
						AmpacheXL.pluginObj.Play(0);
						setTimeout(enyo.bind(this, "updatePlaybackStatus", 100));
					} else {
						AmpacheXL.audioPlayer.play();
					}
					
					break;
				case "pause":
					AmpacheXL.currentSong.status = "paused";
					
					if(AmpacheXL.prefsCookie.playerType == "plugin") {
						AmpacheXL.pluginObj.Pause(0);
						setTimeout(enyo.bind(this, "updatePlaybackStatus", 100));
					} else {
						AmpacheXL.audioPlayer.pause();
					}
					
					break;
				case "stop":
					AmpacheXL.currentSong.status = "paused";
					
					if(AmpacheXL.prefsCookie.playerType == "plugin") {
						AmpacheXL.pluginObj.Pause(0);
						setTimeout(enyo.bind(this, "updatePlaybackStatus", 100));
					} else {
						AmpacheXL.audioPlayer.pause();
					}
					
					break;
				case "next":
					this.nextTrack();
					break;
				case "prev":
					this.previousTrack();
					break;
					
				case "nextAndPlay":
					this.nextTrack();
					break;			
					
				case "togglePausePlay":
					
					if(AmpacheXL.currentSong.status == "playing"){
						
						AmpacheXL.currentSong.status = "paused";
					
						if(AmpacheXL.prefsCookie.playerType == "plugin") {
							AmpacheXL.pluginObj.Pause(0);
							setTimeout(enyo.bind(this, "updatePlaybackStatus", 100));
						} else {
							AmpacheXL.audioPlayer.pause();
						}
						
					} else if(AmpacheXL.currentSong.status == "paused"){
						
						AmpacheXL.currentSong.status = "playing";
						
						if(AmpacheXL.prefsCookie.playerType == "plugin") {
							AmpacheXL.pluginObj.Play(0);
							setTimeout(enyo.bind(this, "updatePlaybackStatus", 100));
						} else {
							AmpacheXL.audioPlayer.play();
						}
					}
					
					break;
			}
		}
	},
	keyServiceFailure: function(inSender, inResponse) {
		if(debug) this.log("keyServiceFailure");
	},
	
	headsetServiceResponse: function(inSender, inResponse) {
		if(debug) this.log("headsetServiceResponse: "+enyo.json.stringify(inResponse));
		
		if(inResponse.key === "headset_button" && inResponse.state)
		{
			
			switch (inResponse.state)
			{
				case "single_click":
					
					if(AmpacheXL.currentSong.status == "playing"){
						
						AmpacheXL.currentSong.status = "paused";
					
						if(AmpacheXL.prefsCookie.playerType == "plugin") {
							AmpacheXL.pluginObj.Pause(0);
							setTimeout(enyo.bind(this, "updatePlaybackStatus", 100));
						} else {
							AmpacheXL.audioPlayer.pause();
						}
						
					} else if(AmpacheXL.currentSong.status == "paused"){
						
						AmpacheXL.currentSong.status = "playing";
						
						if(AmpacheXL.prefsCookie.playerType == "plugin") {
							AmpacheXL.pluginObj.Play(0);
							setTimeout(enyo.bind(this, "updatePlaybackStatus", 100));
						} else {
							AmpacheXL.audioPlayer.play();
						}
					}
					
					break;
				
				case "double_click":
					this.nextTrack();
					break;
			}
			
		}
	},
	headsetServiceFailure: function(inSender, inResponse) {
		if(debug) this.log("headsetServiceFailure");
	},
	
	ampacheConnect: function() {
		if(debug) this.log("ampacheConnect");
		
		if(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].source == "Device") {
	
			AmpacheXL.connected = true;
			
			AmpacheXL.connectResponse = {};
			
			if(AmpacheXL.prefsCookie.playerType == "plugin") {
				//
			} else {
				AmpacheXL.audioPlayer.initialize();
				if(AmpacheXL.prefsCookie.playerType == "basic") AmpacheXL.audioPlayer.setMediaAudioClass(false);
				AmpacheXL.audioPlayer.setNumBuffers(AmpacheXL.numBuffers);
				AmpacheXL.audioPlayer.setMainHandler(this);
				AmpacheXL.audioPlayer.setPlaybackHandler(this.$.playback);
			}
			
			this.finishedConnect();
		
		} else {
			this.$.ampacheConnectService.setUrl(getAmpacheConnectionUrl(AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex]));
			if(debug) this.log("ampacheConnectService url: "+this.$.ampacheConnectService.getUrl());
			this.$.ampacheConnectService.call();
		}
	},
	ampacheConnectResponse: function(inSender, inResponse) {
		if(debug) this.log("ampacheConnectResponse");
		//if(debug) this.log("ampacheConnectResponse: "+inResponse);
		
		AmpacheXL.connected = true;
		
		AmpacheXL.connectResponse = {};
		
		AmpacheXL.audioPlayer.initialize();
		AmpacheXL.audioPlayer.setMediaAudioClass(AmpacheXL.prefsCookie.mediaAudioClass);
		AmpacheXL.audioPlayer.setNumBuffers(AmpacheXL.numBuffers);
		AmpacheXL.audioPlayer.setMainHandler(this);
		AmpacheXL.audioPlayer.setPlaybackHandler(this.$.playback);
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		//var xmlobject = inResponse;
		
		try {
		
			if(xmlobject.getElementsByTagName("auth").length > 0) {
				if(debug) this.log("found auth field in XML so we have valid response");
				
				AmpacheXL.connectResponse.success = true;
				
				try {
				
					AmpacheXL.connectResponse.auth = xmlobject.getElementsByTagName("auth")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.update = xmlobject.getElementsByTagName("update")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.add = xmlobject.getElementsByTagName("add")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.clean = xmlobject.getElementsByTagName("clean")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.songs = xmlobject.getElementsByTagName("songs")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.artists = xmlobject.getElementsByTagName("artists")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.albums = xmlobject.getElementsByTagName("albums")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.playlists = xmlobject.getElementsByTagName("playlists")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.videos = xmlobject.getElementsByTagName("videos")[0].childNodes[0].nodeValue;
					
					if(debug) this.log("finshied most of connection parsing.  now trying tags and api");
					
					AmpacheXL.connectResponse.api = xmlobject.getElementsByTagName("api")[0].childNodes[0].nodeValue;
					AmpacheXL.connectResponse.tags = xmlobject.getElementsByTagName("tags")[0].childNodes[0].nodeValue;
				} catch(e) {
					if(debug) this.log(e)
				}
				
				/*
				http://ampache.org/wiki/dev:xmlapi
				
				<root>
					<auth>AUTHENTICATION TOKEN</auth>
					<version>APIVERSION</version>
					<update>Last Update ISO 8601 Date</update>
					<add>Last Add ISO 8601 Date</add>
					<clean>Last Clean ISO 8601 Date</clean>
					<songs>Total # of Songs</songs>
					<artists>Total # of Artists</artists>
					<albums>Total # of Albums</albums>
					<tags>Total # of Tags</tags>
					<videos>Total # of Videos</videos>
				</root>
				
				*/
				
				//if(debug) this.log("connectResponse: "+enyo.json.stringify(AmpacheXL.connectResponse));
				
				/*
				if(window.localStorage.getItem("allArtists")) {
					//AmpacheXL.allArtists = enyo.json.parse(window.localStorage.getItem("allArtists"));
					window.localStorage.setItem("allArtists", null);
				}
				
				if(window.localStorage.getItem("allAlbums")) {
					//AmpacheXL.allAlbums = enyo.json.parse(window.localStorage.getItem("allAlbums"));
					window.localStorage.setItem("allAlbums", null);
				}
				
				if(window.localStorage.getItem("allSongs")) {
					//AmpacheXL.allSongs = enyo.json.parse(window.localStorage.getItem("allSongs"));
					window.localStorage.setItem("allSongs", null);
				}
				*/
				
				
				this.finishedConnect();
			
				AmpacheXL.pingInterval = setInterval(enyo.bind(this, "ampachePing"),5000);
				
			} else {
			
				if(debug) this.log("did not find auth, so we got rejected from Ampache");
				
				AmpacheXL.connectResponse.success = false;
				
				var errorNodes, singleErrorNode;
				errorNodes = xmlobject.getElementsByTagName("error");
				for(var i = 0; i < errorNodes.length; i++) {
					singleErrorNode = errorNodes[i];
					
					this.doBannerMessage(singleErrorNode.childNodes[0].nodeValue, true);
					
				}
				
			}
			
		
		} catch(e) {
		
			this.error(e);
			
			this.doBannerMessage("Could not connect to ampache.  Check you settings.", true);
			
		}
		
	},
	ampacheConnectFailure: function(inSender, inResponse) {
		if(debug) this.log("ampacheConnectFailure");
		
		this.bannerMessage("ampachexl", "Failed to connect to AmpacheXL.  Check your settings.", true);
	},
	finishedConnect: function() {
		if(debug) this.log("finishedConnect");
		
				
				this.updateCounts();
		
				if(window.localStorage.getItem("localPlaylists")) {
					AmpacheXL.localPlaylists = enyo.json.parse(window.localStorage.getItem("localPlaylists"));
					//window.localStorage.setItem("localPlaylists", null);
				}
				
				switch(AmpacheXL.prefsCookie.startingPane) {
					case "nowplaying":
						this.$.rightContent.selectViewByName("nowplaying");
						break;
					case "random":
						/*if(AmpacheXL.allAlbums.length > 0) {
							this.$.rightContent.selectViewByName("random");
						} else {
							this.updateSpinner("AmpacheXL", true);
							this.dataRequest("AmpacheXL", "albumsList", "albums", "");
							this.$.rightContent.selectViewByName("albumsList");
						}*/
						this.allItems("albumsList", "albumsList", "random");
						this.$.rightContent.selectViewByName("albumsList");
						break;
						break;
					case "songsList":
						this.allItems("songsList", "songsList");
						this.$.rightContent.selectViewByName("songsList");
						break;
					case "albumsList":
						/*if(AmpacheXL.allAlbums.length == AmpacheXL.connectResponse.albums) {
							this.$.rightContent.selectViewByName("albumsList");
						} else {
							this.updateSpinner("AmpacheXL", true);
							this.dataRequest("AmpacheXL", "albumsList", "albums", "");
							this.$.rightContent.selectViewByName("albumsList");
						}
						*/
						this.allItems("albumsList", "albumsList");
						this.$.rightContent.selectViewByName("albumsList");
						break;
					case "artistsList":
						/*if(AmpacheXL.allArtists.length == AmpacheXL.connectResponse.artists) {
							this.$.rightContent.selectViewByName("artistsList");
						} else {
							this.updateSpinner("AmpacheXL", true);
							this.dataRequest("AmpacheXL", "artistsList", "artists", "");
							this.$.rightContent.selectViewByName("artistsList");
						}*/
						this.allItems("artistsList", "artistsList");
						this.$.rightContent.selectViewByName("artistsList");
						break;
					case "tagsList":
						//this.updateSpinner("AmpacheXL", true);
						//this.dataRequest("AmpacheXL", "tagsList", "tags", "");
						this.allItems("tagsList", "tagsList");
						this.$.rightContent.selectViewByName("tagsList");
						break;
					case "playlistsList":
						//this.updateSpinner("AmpacheXL", true);
						//this.dataRequest("AmpacheXL", "playlistsList", "playlists", "");
						//this.$.rightContent.selectViewByName("playlistsList");
						setTimeout(enyo.bind(this, "allItems", "playlistsList", "playlistsList"),500);
						this.$.rightContent.selectViewByName("playlistsList");
						break;
					case "videosList":
						this.updateSpinner("AmpacheXL", true);
						this.dataRequest("AmpacheXL", "videosList", "videos", "");
						this.$.rightContent.selectViewByName("videosList");
						break;
						
					default: 
						AmpacheXL.prefsCookie.startingPane = "albumsList";
						this.allItems("albumsList", "albumsList");
						this.$.rightContent.selectViewByName("albumsList");
						break;
				}
	},
	
	lastfmConnect: function() {
		if(debug) this.log("lastfmConnect");
		
		var url = "http://ws.audioscrobbler.com/2.0/";
		var secret = "ab3e2bdb8a9c8faced63b61fae1f842c";
		
		var params = {};
		params.api_key = "5b3c5775a14bc5dd0182b8b2965b62ac";
		params.method = "auth.getMobileSession";
		params.username = AmpacheXL.prefsCookie.lastFMusername;
		params.authToken = MD5_hexhash(AmpacheXL.prefsCookie.lastFMusername.toLowerCase()+MD5_hexhash(AmpacheXL.prefsCookie.lastFMpassword));
		
		params.api_sig = MD5_hexhash("api_key"+params.api_key+"authToken"+params.authToken+"method"+params.method+"username"+params.username+secret);
		
		this.$.lastfmConnectService.setUrl(url);
		if(debug) this.log("lastfmConnectService url: "+this.$.lastfmConnectService.getUrl()+enyo.json.stringify(params));
		this.$.lastfmConnectService.call(params);
		
	},
	lastfmConnectResponse: function(inSender, inResponse) {
		//if(debug) this.log("lastfmConnectResponse");
		if(debug) this.log("lastfmConnectResponse: "+inResponse);
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		var keyNode = xmlobject.getElementsByTagName("key")[0];
		AmpacheXL.prefsCookie.lastFMkey = keyNode.childNodes[0].nodeValue;
		
		this.savePreferences();
		
	},
	lastfmConnectFailure: function(inSender, inResponse) {
		if(debug) this.error("lastfmConnectFailure");
	},
	
	ampachePing: function() {
		if(debug) this.log("ampachePing") 
		
		var requestUrl = AmpacheXL.prefsCookie.accounts[AmpacheXL.prefsCookie.currentAccountIndex].url;
		requestUrl += "/server/xml.server.php?";
		requestUrl += "auth="+AmpacheXL.connectResponse.auth;
		requestUrl += "&action=ping";
		
		this.$.pingService.setUrl(requestUrl);
		if(debug) this.log("pingService url: "+this.$.pingService.getUrl());
		this.$.pingService.call();
		
	},
	ampachePingResponse: function(inSender, inResponse) {
		if(debug) this.log("ampachePingResponse");
		
		clearInterval(AmpacheXL.pingInterval);
		
		var xmlobject = inResponse;
		
		var rootNodes, singleRootNode, singleRootChildNode;
		var s = {};
		
		rootNodes = xmlobject.getElementsByTagName("root");
		for(var i = 0; i < rootNodes.length; i++) {
			singleRootNode = rootNodes[i];
			
			for(var j = 0; j < singleRootNode.childNodes.length; j++) {
				singleRootChildNode = singleRootNode.childNodes[j];
				
				switch(singleRootChildNode.nodeName) {
					case "session_expire":
						AmpacheXL.session_expire = singleRootChildNode.childNodes[0].nodeValue;
						break;
					case "server":
						AmpacheXL.prefsCookie.server = singleRootChildNode.childNodes[0].nodeValue;
						break;
					case "version":
						AmpacheXL.prefsCookie.version = singleRootChildNode.childNodes[0].nodeValue;
						break;
					case "compatible":
						AmpacheXL.prefsCookie.compatible = singleRootChildNode.childNodes[0].nodeValue;
						break;
				}
				
			}
		
		}
		
		var expiresUTC = Date.parse(AmpacheXL.session_expire);
		var currentTime = new Date();
		var currentUTC = currentTime.getTime();
		var timeRemaining = expiresUTC - currentUTC;
		timeRemaining *= 0.45;
		
		timeRemaining = Math.min(timeRemaining, 120);
		
		if(debug) this.log("ping session expires "+AmpacheXL.session_expire+" so we will ping in "+parseInt(timeRemaining/1000)+" seconds");
		
		//Set minimum ping time to 10 minutes
		AmpacheXL.pingInterval = setInterval(enyo.bind(this, "ampachePing"),parseInt(Math.max(timeRemaining,600000)));
		
	},
	ampachePingFailure: function(inSender) {
		if(debug) this.log("ampachePingFailure");
		
	},
	
	dataRequestResponse: function(inSender, inResponse) {
		//if(debug) this.log("dataRequestResponse: "+inResponse);
		if(debug) this.log("dataRequestResponse");
		
		this.$[this.dataRequestView].dataRequestResponse(inResponse);
		
	},
	dataRequestFailure: function(inSender, inResponse) {
		if(debug) this.log("dataRequestFailure");
		
		this.bannerMessare("AmpacheXL", "Data request failed", true);
	},
	
	beforeSearchOpen: function() {
		if(debug) this.log("beforeSearchOpen");
		
		this.$.searchInput.setValue("");
	},
	searchOpen: function() {
		if(debug) this.log("searchOpen");
		
		this.$.searchInput.forceFocusEnableKeyboard();
	},
	searchClick: function(inSender) {
		if(debug) this.log("searchClick: "+inSender.getName());
		
		switch(inSender.getName()) {
			case "artistsSearch":
				this.updateSpinner("ampachexl", true);
				this.dataRequest("ampachexl", "artistsList", "artists", "&filter="+this.$.searchInput.getValue());
				this.viewSelected("ampachexl", "artistsList");
				break;
			case "albumsSearch":
				AmpacheXL.selectedArtist = {};
				AmpacheXL.selectedArtist.name = this.$.searchInput.getValue();
				AmpacheXL.selectedArtist.type = "artistSearch";
				this.updateSpinner("ampachexl", true);
				this.dataRequest("ampachexl", "albumsList", "albums", "&filter="+this.$.searchInput.getValue());
				this.viewSelected("ampachexl", "albumsList");
				break;
			case "playlistsSearch":
				this.updateSpinner("ampachexl", true);
				this.dataRequest("ampachexl", "playlistsList", "playlists", "&filter="+this.$.searchInput.getValue());
				this.viewSelected("ampachexl", "playlistsList");
				break;
			case "songsSearch":
				this.updateSpinner("ampachexl", true);
				this.dataRequest("ampachexl", "songsList", "songs", "&filter="+this.$.searchInput.getValue());
				this.viewSelected("ampachexl", "songsList");
				break;
			case "tagsSearch":
				this.updateSpinner("ampachexl", true);
				this.dataRequest("ampachexl", "tagsList", "tags", "&filter="+this.$.searchInput.getValue());
				this.viewSelected("ampachexl", "tagsList");
				break;
			case "allSearch":
				this.updateSpinner("ampachexl", true);
				this.dataRequest("ampachexl", "songsList", "search_songs", "&filter="+this.$.searchInput.getValue());
				this.viewSelected("ampachexl", "songsList");
				break;
				
		}
		
		this.$.searchPopup.close();
		
		enyo.keyboard.setManualMode(false);
		
	},
	
	changeVersion1Success: function() {
		if(debug) this.log("changeVersion1Success");
		
	},
	changeVersion1Failure: function() {
		if(debug) this.error("changeVersion1Failure");
		
	},
	changeVersion2Success: function() {
		if(debug) this.log("changeVersion2Success");
		
	},
	changeVersion2Failure: function() {
		if(debug) this.error("changeVersion2Failure");
		
	},
	changeVersion3Success: function() {
		if(debug) this.log("changeVersion3Success");
		
	},
	changeVersion3Failure: function() {
		if(debug) this.error("changeVersion3Failure");
		
	},
	changeVersion4Success: function() {
		if(debug) this.log("changeVersion4Success");
		
	},
	changeVersion4Failure: function() {
		if(debug) this.error("changeVersion4Failure");
		
	},
	changeVersion5Success: function() {
		if(debug) this.log("changeVersion5Success");
		
	},
	changeVersion5Failure: function() {
		if(debug) this.error("changeVersion5Failure");
		
	},
	
	getMediaPermissions: function() {
		var album      = "com.palm.media.audio.album:1";
        var albumimage = "com.palm.media.image.album:1";
        var artist     = "com.palm.media.audio.artist:1";
        var audio      = "com.palm.media.audio.file:1";
        var genre      = "com.palm.media.audio.genre:1";
        var image      = "com.palm.media.image.file:1";
        var playlist   = "com.palm.media.audio.playlist.object:1";
        var video      = "com.palm.media.video.file:1";
        var params = {"read":[
			album, 
			albumimage, 
			artist, 
			audio, 
			genre, 
			image, 
			playlist, 
			video
		]}; 
		
        this.$.mediaPermissionsService.call({ "rights": params});
		
		
	},
	mediaPermissionsSuccess: function(inSender, inResponse) {
        if(debug) this.log("Get Permissions success, results=" + enyo.json.stringify(inResponse));
		
		AmpacheXL.prefsCookie.mediaPermissions = inResponse.isAllowed;
		
		var haveLocalHost = false;
		
		for(var i = 0; i < AmpacheXL.prefsCookie.accounts.length; i++) {
			if(AmpacheXL.prefsCookie.accounts[i].source == "Device") haveLocalHost = true;
		}
		
		if((!haveLocalHost)&&(AmpacheXL.prefsCookie.mediaPermissions)) AmpacheXL.prefsCookie.accounts.push({name: "This device", url: "", username: "", password: "", source: "Device"});
		
		this.$.hosts.activate();
		
    },          
    getPermFailure: function(inSender, inError, inRequest) {
        this.log(enyo.json.stringify(inError));
    },
	
	localplaylistsSelect: function() {
		if(debug) this.log("localplaylistsSelect");
		
		html5sql.database.transaction(function(tx) {    
			tx.executeSql('SELECT * FROM localplaylists', 
				[], 
				enyo.bind(this, "localplaylistsSelectResults"), 
				enyo.bind(this, "localplaylistsSelectFailure") 
			);
		}.bind(this));
				
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
		
		if(debug) this.log("AmpacheXL.localPlaylists: "+enyo.json.stringify(AmpacheXL.localPlaylists));
		
		window.localStorage.setItem("localPlaylists", enyo.json.stringify(AmpacheXL.localPlaylists));
		
		this.updateCounts();
		
		//if(this.currentView == "playlistsList") this.$.playlistsList.updateList();
		this.$.playlistsList.updateList();
		
	},
	localplaylistsSelectFailure: function(inError) {
		if(debug) this.error("localplaylistsSelectFailure: "+inError.message);
		
	},
	
	pluginReady: function() {
		if(debug) this.error("pluginReady");
	},
	pluginConnected: function() {
		if(debug) this.error("pluginConnected");
	},
	pluginDisconnected: function() {
		if(debug) this.error("pluginDisconnected");
	},
	
});
