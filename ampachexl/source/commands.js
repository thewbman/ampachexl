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


var defaultCookie = function() {

	var newCookie = {
		accounts: [],
		currentAccountIndex: 0,
		autoLogin: false,
		startingPane: "albumsList",
		
		defaultAction: "queue[]:[]all[]:[]shuffled",
		nowPlayingEnd: "stop[]:[]straight",
		theme: "light",
		//allowedOrientation: "free",
		//recent: 0,
		//searchType: 0,
		dashboardPlayer: true,
		
		artOnLists: true,
		
		albumsSort: "album",
		//artistsSort: 0,
		//songsSort: 0,
		//playlistsSort: 0,
		//videosSort: 0,
		
		bannerOnPlayback: true,
		
		allowMetrix: true,
		
		debug: false,
		//streamDebug: false,
		
		version: "unknown",
		server: "unknown",
		compatible: "unknown",
		
		lastFM: false, 
		lastFMusername: "",
		lastFMpassword: "",
		
		limitCount: 300,
		
		retryDownload: true,
		
		//mediaAudioClass: true,
		playerType: "plugin",
		
		webArt: false,
	};
	
	return newCookie;
	
};


var sort_by = function(field, reverse, primer){

   reverse = (reverse) ? -1 : 1;

   return function(a,b){

       a = a[field];
       b = b[field];

       if (typeof(primer) != 'undefined'){
           a = primer(a);
           b = primer(b);
       }

       if (a<b) return reverse * -1;
       if (a>b) return reverse * 1;
       return 0;

   }
};

var double_sort_by = function(field1, field2, reverse, primer){

   reverse = (reverse) ? -1 : 1;

   return function(a,b){

       a = a[field1]+"_"+a[field2];
       b = b[field1]+"_"+b[field2];

       if (typeof(primer) != 'undefined'){
           a = primer(a);
           b = primer(b);
       }

       if (a<b) return reverse * -1;
       if (a>b) return reverse * 1;
       
	   return 0;

   }
};

var triple_sort_by = function(field1, field2, field3, reverse, primer){

   reverse = (reverse) ? -1 : 1;

   return function(a,b){

       a = a[field1]+"_"+a[field2]+"_"+a[field3];
       b = b[field1]+"_"+b[field2]+"_"+b[field3];

       if (typeof(primer) != 'undefined'){
           a = primer(a);
           b = primer(b);
       }

       if (a<b) return reverse * -1;
       if (a>b) return reverse * 1;
       
	   return 0;

   }
};



var getAmpacheConnectionUrl = function(accountObject) {

	var time = getAmpacheTime();
	if(debug) console.log("time", time);
	
	var key = SHA256(accountObject.password);
	if(debug) console.log("key", key);
	
	var passphrase = SHA256(time + key);
	if(debug) console.log("passphrase", passphrase);
	
	var connectionUrl = accountObject.url + "/server/xml.server.php?action=handshake&auth=" + passphrase + "&timestamp=" + time + "&version=350001&user=" + accountObject.username;
	if(debug) console.log("connectionUrl", connectionUrl);
	
	return connectionUrl;
	
};

var getAmpacheTime = function() {

	var myDate = new Date();				// Generic JS date object 
	var unixtime_ms = myDate.getTime();		// Returns milliseconds since the epoch 
	var unixtime = parseInt(unixtime_ms / 1000, 10);
	
	return unixtime;

};


var floatToTime = function(inFloat) {

	var minutes = parseInt(inFloat/60);
	var seconds = parseInt(inFloat - (minutes*60));
	
	if(minutes < 10) minutes = "0"+minutes;
	if(seconds < 10) seconds = "0"+seconds;
	
	return minutes+":"+seconds;

}