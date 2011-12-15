// Ownder Mode - For Pro: 1; For Lite: 0, For Test: 0
// ADVANCE_OPT - For Pro: 1; For Lite: 0

// API Key:
// Pro: d95f01a1656cc7cb601ebc127bfc464d

var OWNER_MODE = 1;
var ADVANCE_OPT = 1;

// "v1" means a clean install
var WAMP_VERSION = "v2";

var SongSchema_ID = (OWNER_MODE ? "com.epikwarlord.pathindex:2" : "com.epik.pathindex:2");
var SearchSchema_ID = (OWNER_MODE ? "com.epikwarlord.searchindex:1" : "com.epik.searchindex:1");
//var OWNDER_STR = (OWNER_MODE ? "com.epikwarlord.audiophilehdpro" : "com.epik.audiophilehd");
var OWNDER_STR = "com.thewbman.ampachexl";

/******************************
 * Create the plugin html object code
 ******************************/
function CreatePluginHook()
{
	var pluginObj = window.document.createElement("object");

	pluginObj.id = "wAMPPlugin";
	pluginObj.type = "application/x-palm-remote";
	pluginObj.setAttribute("height", "1px");
	pluginObj.setAttribute("width",	"1px");
	pluginObj.setAttribute('x-palm-pass-event', true);

	var param1 = window.document.createElement("param");
	param1.name = "appid";
	param1.value = OWNDER_STR;

	var param2 = window.document.createElement("param");
	param2.name = "exe";
	param2.value = "wAMP_plugin";

	pluginObj.appendChild(param1);
	pluginObj.appendChild(param2);

	var df = window.document.createDocumentFragment();
	df.appendChild(pluginObj);

	return df;
}

var OfflineArray = new Array();

if (!window.PalmSystem)
{
	var cnt = 0;

	var Prep = function(strTitle, 
						strArtist, 
						strAlbum, 
						strGenre, 
						iTrack,
						strPath)
	{
		var objSong = new Object();
		
		if (strPath)
		{
			objSong.path = strPath;
		}
		else
		{
			objSong.path = '/media/internal/' +
							(cnt++) +
							'.mp3';
		}
		
		objSong.title = strTitle;
		
		if (strArtist)
			objSong.artist = strArtist;
		else
			objSong.artist = '[Unknown]';
			
		if (strAlbum)
			objSong.album = strAlbum;
		else
			objSong.album = '[Unknown]';
		
		if (strGenre)
			objSong.genre = strGenre;
		else
			objSong.genre = '[Unknown]';
		objSong.track = iTrack;								
		
		OfflineArray.push(objSong);
	};

	Prep("Rolling In The Deep", 
	"Adele", 
	"21", 
	"Pop", 
	1,
	"/media/internal/trest.mp3");
	Prep("Rumour Has It", 
	"Adele", 
	"21", 
	"Pop", 
	2,
	"/media/internal/yrest.mp3");
	Prep("Turning Tables",
	"Adele",
	"21",
	"Pop",
	3,
	"/media/internal/urest.mp3");
	Prep("Don't You Remember",
	"Adele",
	"21",
	"Pop",
	4,
	"/media/internal/irest.mp3");
	Prep("Give Me Everything",
	"Pitbull Featuring Ne-Yo, > AfroJack & Nayer",
	"Give Me Everything",
	"Dance",
	1,
	"/media/internal/orest.mp3");
	Prep("Home Is A Fire",
	"Death Cab for Cutie",
	"Codes and Keys",
	"Alternative Rock",
	1,
	"/media/internal/prest.mp3");
	Prep("Codes And Keys",
	"Death < Cab for Cutie",
	"Codes and Keys",
	"Alternative Rock",
	2,
	"/media/internal/crest.mp3");
	Prep("Some Boys",
	"Death Cab for Cutie",
	"Codes and Keys",
	"Alternative Rock",
	3,
	"/media/internal/vrest.mp3");
	Prep("What's The Matter Here?",
	"10,000 Maniacs",
	"In My Trib",
	"Alternative rock",
	1,
	"/media/internal/brest.mp3");
	Prep("E.T. (feat. Kanye West)",
	"Katy Perry",
	"E.T. (featuring Kanye West)",
	"Pop",
	1,
	"/media/internal/test.flac");
	Prep("Born This Way",
	"Lady Gaga",
	"Born This Way",
	"Pop",
	2);
	Prep("Howl",
	"Florence + The Machine",
	"Lungs",
	"Alternative Rock",
	4);
	Prep("Rabbit Heart (Raise It Up)",
	"Florence + The Machine",
	"Lungs",
	"Alternative Rock",
	2);
	Prep("Break Your Heart",
	"Taio Cruz",
	"Rokstarr",
	"Pop");
	Prep("Ice Ice Baby",
	"Vanilla Ice",
	0,
	"rap");
	Prep("I Want To > Break Free",
	"Queen",
	"Greatest Hits",
	"rock");	
	Prep("The Simpsons theme");	
	Prep("Intro",
	"Queen",
	"Queen Rock Montreal",
	"Pop",
	1);
	Prep("We Will Rock You (Fast)",
	"Queen",
	"Queen Rock Montreal",
	"Pop",
	2);
	Prep("Under Pressure",
	"Queen",
	"Queen Rock Montreal",
	"Pop",
	1);
	Prep("Dynamite",
	"Taio Cruz",
	"Rokstarr",
	"Pop",
	1);
	Prep("Take < Me Away",
	"Avril Lavigne",
	"Under My Skin",
	"Pop",
	1);
	Prep("Rock Steady",
	"Bad Company",
	"Bad Co",
	"Rock",
	3);
	Prep("Rock Steady",
	"Bad Company",
	"Bad Co",
	"Rock",
	3);
	Prep("Bad Company",
	"Bad Company",
	"Bad Co",
	"Rock",
	7);
	Prep("Make Love Last",
	"Bad English",
	"Backlash",
	"Rock",
	9);
	Prep("Surfer Girl",
	"Beach Boys, The",
	"Endless Summer",
	"Rock",
	2);
	Prep("Surfin' USA",
	"Beach > Boys, The",
	"Endless Summer",
	"Rock",
	1);
	Prep("He's a Mighty Good Leader",
	"Beck",
	"One Foot In The Grave",
	"Folk",
	1);
	Prep("Bring It On",
	"Black Lab",
	"Your Body Above Me",
	"Alternative",
	11);
	Prep("Black Sabbath",
	"Black Sabbath",
	"black sabbath",
	"Hard Rock",
	1);
	Prep("Wizard",
	"< Black Sabbath",
	"black sabbath",
	"Hard Rock",
	2);
	Prep("Pathetic",
	"blink 182",
	"Dude Ranch",
	"Punk Rock",
	1);
	Prep("Pretty Persuasion",
	"REM",
	"Reckoning",
	"Alternative",
	4);
	Prep("Dragula",
	"Rob Zombie",
	"Hellbilly Deluxe",
	"Metal",
	3);
	Prep("Too Rude",
	"Rolling Stones",
	"Dirty Work",
	"Rock",
	5);
	Prep("Rock Box",
	"Run-D.M.C.",
	"Run-D.M.C.",
	"Hip Hop",
	2);
	Prep("2112",
	"Rush",
	"2112",
	"Rock",
	1);
	Prep("Overture",
	"Rush",
	"2112",
	"Rock",
	2);
	Prep("A Passage To Bangkok",
	"Rush",
	"2112",
	"Rock",
	9);
	Prep("The Temples Of Syrinx",
	"Rush",
	"2112",
	"Rock",
	3);
	Prep("2112",
	"Rush",
	"2112",
	"Rock",
	1);
	Prep("Fly By Night",
	"Rush",
	"Fly By Night",
	"Rock",
	4);
	Prep("Bad Magick",
	"Godsmack",
	"Awake",
	"Nu Metal",
	4);
	Prep("Faceless",
	"Godsmac",
	"Faceless",
	"Nu Metal",
	2);
	Prep("Punk Rock Rules The Airwaves",
	"Green Day",
	"Maximum Green Day",
	"Punk Rock",
	1);
	Prep("Welcome To The Jungle",
	"Guns N Roses",
	"Appetite For Destruction",
	"Hard Rock",
	1);
	Prep("Paradise City",
	"Guns N Roses",
	"Appetite For Destruction",
	"Hard Rock",
	6);
	Prep("Sweet Child O'Mine",
	"Guns N Roses",
	"Appetite For Destruction",
	"Hard Rock",
	9);
	Prep("Going Home",
	"Kenny G",
	"Duotones",
	"Jazz",
	1);
	Prep("Cowboy",
	"Kid Rock",
	"Devil Without A Cause",
	"Rock/Rap",
	2);
	Prep("Detroit Rock City",
	"Kiss",
	"Destroyer",
	"Rock",
	1);
	Prep("Beth",
	"Kiss",
	"Destroyer",
	"Rock",
	8);
	Prep("King of the Night Time World",
	"Kiss",
	"Destroyer",
	"Rock",
	2);
	Prep("God of Thunder",
	"Kiss",
	"Destroyer",
	"Rock",
	3);
	Prep("Great Expectations",
	"Kiss",
	"Destroyer",
	"Rock",
	4);
	Prep("Flaming Youth",
	"Kiss",
	"Destroyer",
	"Rock",
	5);
	Prep("Sweet Pain",
	"Kiss",
	"Destroyer",
	"Rock",
	6);
	Prep("Shout it Out Loud",
	"Kiss",
	"Destroyer",
	"Rock",
	7);
	Prep("Do You Love Me",
	"Kiss",
	"Destroyer",
	"Rock",
	9);
	Prep("Fanfare (hidden track)",
	"Kiss",
	"Destroyer",
	"Rock",
	10);
	Prep("Did My Time",
	"Korn",
	"Take A Look In The Mirror",
	"Metal",
	6);
	Prep("Emotions",
	"Carey, Mariah",
	"Emotions",
	"Pop",
	1);
	Prep("Good Times Roll",
	"Cars, The",
	"Cars, The",
	"Rock",
	1);
	Prep("My Best Friend's Girl",
	"Cars, The",
	"Cars, The",
	"Rock",
	2);
	Prep("Dream Police",
	"Cheap Trick",
	"The Greatest Hits",
	"Rock",
	2);
	Prep("Surrender",
	"Cheap Trick",
	"The Greatest Hits",
	"Rock",
	9);
	Prep("speed of the sound",
	"Coldplay",
	"X&Y",
	"Rock",
	6);
	Prep("Simple",
	"Collective Soul",
	"Collective Soul",
	"Rock",
	1);
	Prep("Heavy",
	"Collective Soul",
	"Dosage",
	"Rock",
	2);
	Prep("TORN",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	1);
	Prep("MY OWN PRISON",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	2);
	Prep("WHATS THIS LIFE FOR",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	3);
	Prep("ONE",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	4);
	Prep("ARE YOU READY",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	5);
	Prep("HIGHER",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	6);
	Prep("WITH ARMS WIDE OPEN",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	7);
	Prep("WHAT IF",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	8);
	Prep("ONE LAST BREATH",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	9);
	Prep("ONE LAST BREATH",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	9);
	Prep("DON'T STOP DANCING",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	10);
	Prep("BULLETS",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	11);
	Prep("BULLETS",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	11);
	Prep("MY SACRIFICE",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	12);
	Prep("WEATHERED",
	"CREED",
	"GREATEST HITS",
	"ROCK",
	13);
	Prep("Born on the Bayou",
	"Creedence Clearwater Revival",
	"Bayou Country",
	"Classic Rock",
	1);
	Prep("Proud Mary",
	"Creedence Clearwater Revival",
	"Creedence Gold",
	"Classic Rock",
	1);
	Prep("Suzie Q",
	"Creedence Clearwater Revival",
	"Creedence Gold",
	"Classic Rock",
	8);
	Prep("Open Invitation",
	"Santana",
	"Inner Secrets",
	"Rock",
	2);
	Prep("Rock You Like A Hurricane",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	1);
	Prep("Can't Explain",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	2);
	Prep("Rhythm Of Love",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	3);
	Prep("Lovedrive",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	4);
	Prep("Is There Anybody There?",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	5);
	Prep("Holiday",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	6);
	Prep("Still Loving You",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	7);
	Prep("No One Like You",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	8);
	Prep("Another Piece of Meat",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	9);
	Prep("You Give Me All I Need",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	10);
	Prep("Hey You",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	11);
	Prep("The Zoo",
	"Scorpions",
	"Best Of Scorpions - Rockers 'n' Ballads",
	"Rock",
	12);
	Prep("Prison Song",
	"System Of A Down",
	"Toxicity",
	"Metal",
	1);
	Prep("Needles",
	"System Of A Down",
	"Toxicity",
	"Metal",
	2);
	Prep("Deer Dance",
	"System Of A Down",
	"Toxicity",
	"Metal",
	3);
	Prep("Jet Pilot",
	"System Of A Down",
	"Toxicity",
	"Metal",
	4);
	Prep("X",
	"System Of A Down",
	"Toxicity",
	"Metal",
	5);
	Prep("Chop Suey!",
	"System Of A Down",
	"Toxicity",
	"Metal",
	6);
	Prep("Bounce",
	"System Of A Down",
	"Toxicity",
	"Metal",
	7);
	Prep("Forest",
	"System Of A Down",
	"Toxicity",
	"Metal",
	8);
	Prep("ATWA",
	"System Of A Down",
	"Toxicity",
	"Metal",
	9);
	Prep("Science",
	"System Of A Down",
	"Toxicity",
	"Metal",
	10);
	Prep("Shimmy",
	"System Of A Down",
	"Toxicity",
	"Metal",
	11);
	Prep("Toxicity",
	"System Of A Down",
	"Toxicity",
	"Metal",
	12);
	Prep("Psycho",
	"System Of A Down",
	"Toxicity",
	"Metal",
	13);
	Prep("Aerials",
	"System Of A Down",
	"Toxicity",
	"Metal",
	14);
	Prep("Animals",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	1);
	Prep("Fight for All The Wrong Reasons",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	2);
	Prep("Photograph",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	3);
	Prep("Next Contestant",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	4);
	Prep("Savin' Me",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	5);
	Prep("Far Away",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	6);
	Prep("Someone That You're With",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	7);
	Prep("Follow You Home",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	8);
	Prep("Side Of A Bullet",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	9);
	Prep("If Everyone Cared",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	10);
	Prep("Rock Star",
	"Nickelback",
	"All The Right Reasons",
	"Alternative Metal",
	11);
}


var objwAMP = 
{
// Private:
	
	arrayExtList: 
			new Array(".mp3",".wma",".m4a",".aac",".flac",".ogg",".ra",".ram",".wav",".mp2",".mp1",".als"),
	
	// this is the current path we are on, set to root dir
	strCurrentPath: ["/media/internal", "/media/internal"],
	
	// this is an enum to tell whether we are using FileFolder type io or
	//	full indexing type io
	indexType: 0,
	
	mutexLikeCheck: 0,
	
	bShuffle: false,
	bRepeat: false,
	
	funcTextBanner: 0,
	
	// This will hold the song list for viewing
	arrayPlaylist: [[],[]],
		
	objectLsCache: new Object(),

	// this will be true if indexer failed to load
	bFolderOnly: false,
	
	isWebOS: ((window.PalmSystem) ? true : false),
	
	iSongIndex: [0, 0],
	iOpenIndex: [-1, -1],
	iNextIndex: [1, 1],
	
	fTransition: 0.0,
	
	funcIndexStart: 0,
	iIndexStatus: 0,
	
	bReinitInProgress: false,
	
	funcImgGenCB: 0,
	
	funcUpdatePLCallback: 0,
	
	funcPauseCallback: 0,
	
	funcNowPlaying: 0,
	
	funcSeekFinishFunc: [0, 0],
	
	tmoutSonTransDB: 0,
	tmoutTrebSet: 0,
	tmoutBassSet: 0,
	tmoutMidSet: 0,
	tmoutEQSet: 0,
	
	strNewSeekTime: [0, 0],
	
	arraySongStartObj: new Array(),

	bTrackNew: [0, 0],
	
	objParam: 0,
	
	objBufPL: new Object(),
	
	tmoutKeepAlive: 0,
	
	iBlockCount: 0,
	
	iBPM: 0,
	
	arrayPLRaw: {},
	
	objImageCache: new Object(),
	
	iIndexCallbackCnt: 0,
	
// Public:

	StatusString: "Attempting To Start Player Plug-In",
	
	BufferPL: function(iIndex, iPos, iArray)
	{
		objwAMP.arrayPlaylist[0] = iArray;
		objwAMP.bBuffer = 1;
		objwAMP.iIndex = iIndex;
		objwAMP.iPos = iPos;
		
		if (objwAMP.funcUpdatePLCallback)
		{
			objwAMP.OpenSong(0, objwAMP.iIndex);
			objwAMP.Seek(objwAMP.iPos, function() {}, 0);
			objwAMP.funcUpdatePLCallback(iArray);
		}
		else
			objwAMP.funcUpdatePLCallback = -1;
	},
	
	StartIndex: function()
	{		
		this.plugIn.StartIndex(objOptions.timeLastIndex,
								objOptions.strIndexingDir);
	},
	
	CopyPLForDJ: function()
	{
		this.arrayPlaylist[1] = this.arrayPlaylist[0].slice(0);
	},
	
	KeepAlive: function()
	{
		clearTimeout(objwAMP.tmoutKeepAlive);
		
		parameters =  
		{
			id: OWNDER_STR,
			duration_ms: '900000'
		}
		
		CallPalmService('palm://com.palm.power/com/palm/power/activityStart', 
							parameters,
							false,
							function(response)
							{
								objwAMP.tmoutKeepAlive = setTimeout(function()
								{
									objwAMP.KeepAlive();
								}, 110000);
							},
							function(response)
							{
								console.log("Error: " + JSON.stringify(response));
							});
	},
		
	CheckOS: function(obj)
	{
		this.plugIn = obj;
		
		this.plugIn.StartSong = function(path, artist, title, iTrack) 
		{
			objwAMP.StartSong(path, artist, title, iTrack);
		};
		this.plugIn.AddToIndex = function(str, lastMod)
		{
			objwAMP.AddToIndex(str, lastMod);
		};
		this.plugIn.FinishIndex = function() 
		{
			objwAMP.FinishIndex();
		};
		this.plugIn.FinishSeek = function(str, iTrack) 
		{
			//console.log('FinishSeek:' + str + ' ' + iTrack);
			objwAMP.FinishSeek(str, iTrack);
		};
		
		if (!this.isWebOS)
		{
			this.plugIn.bNextSet = false;
			
			this.plugIn.strSongState = "101";
			
			this.plugIn.Ping = function () {return 'Pong';};
											
			this.plugIn.StartIndex = function() 
			{
				setTimeout(function () 
				{
					objwAMP.plugIn.AddToIndex('test', "dirty");
					objwAMP.plugIn.FinishIndex();
				}, 1000);
			};
			
			this.plugIn.SetEQ = function() {};
			
			this.plugIn.GetCurrentDirLS = function ()
			{
				return '{"finishedIndexing":true, ' +
					   '"arrayFileList": [' +
							'{"name":"ice_ice_baby.mp3", "path":"/media/internal/ice_ice_baby.mp3", "artist":"Vanilla Ice", "album":"Ice Ice Baby", "genre":"rap", "title":"Ice Ice Baby", "isdir":false},' +
							'{"name":"every_rose.ogg", "path":"/media/internal/every_rose.ogg", "artist":"Poison", "album":"alllllvin", "genre":"rock", "title":"Every Rose Has It\'s Thorn", "isdir": false},' +
							'{"name":"wallpaper", "path":"/media/internal/wallpaper", "artist":"Mumford and Sons", "album":"alllllvin", "genre":"alternative", "title":"The Cave", "isdir": true},' +
							'{"name":"the_cave.flac", "path":"/media/internal/path4", "artist":"Leonard Skinner", "album":"alllllvin", "genre":"classic rock", "title":"Freebird", "isdir": false},' +
							'{"name":"f_o_g.wma", "path":"/media/internal", "artist":"Sting", "album":"Sting", "genre":"contemporary", "title":"Fields of Gold", "isdir": false},' +
							'{"name":"queen(I want to break free).mp3", "path":"/media/internal/path5", "artist":"Queen", "album":"Greatest Hits", "genre":"rock", "title":"I Want To Break Free", "isdir": false},' +
							'{"name":"stairway.mp3", "path":"/media/internal/path6", "artist":"Led Zepplin", "album":"", "genre":"classic rock", "title":"Stairway To Heaven", "isdir": false},' +
							'{"name":"dustinThewind.mp3", "path":"/media/internal/path7", "artist":"Kanasas", "album":"alllllvin", "genre":"classic rock", "title":"Dust in the wind", "isdir": false},' +
							'{"name":"ringtones", "path":"/media/internal/ringtones", "artist":"Queen", "album":"", "genre":"", "title":"Highlander Theme Song", "isdir": true},' +
							'{"name":"simpson_homer.mp3", "path":"/media/internal/path9", "artist":"", "album":"", "genre":"", "title":"The Simpsons theme", "isdir": false},' +
							'{"name":"hitmeonemoretime.bad", "path":"/media/internal/path10", "artist":"Britney", "album":"alllllvin", "genre":"pop", "title":"Hit Me Baby One More Time", "isdir": false},' +
							'{"name":"mrbright.ogg", "path":"/media/internal/path11", "artist":"The Killers", "album":"alllllvin", "genre":"pop", "title":"Mr. Brightside", "isdir": false},' +
							'{"name":"pokerface.mp3", "path":"/media/internal/path12", "artist":"Lady Gaga", "album":"poker face", "genre":"pop", "title":"Poker Face", "isdir": false},' +
							'{"name":"southpart.mp3", "path":"/media/internal/path13", "artist":"Cartman", "album":"", "genre":"", "title":"Cartman doing poker face", "isdir": false},' +
							'{"name":"born_usa.txt", "path":"/media/internal/path14", "artist":"Bruce", "album":"", "genre":"rock", "title":"Born in the U.S.A.", "isdir": false},' +
							'{"name":"winter.doc", "path":"/media/internal/path15", "artist":"", "album":"alllllvin", "genre":"classical", "title":"Winter", "isdir": false},' +
							'{"name":"crucify.mp3", "path":"/media/internal/path16", "artist":"Tori Amos", "album":"alllllvin", "genre":"pop", "title":"Crucify", "isdir": false},' +
							'{"name":"curcity(remix).flac", "path":"/media/internal/path17", "artist":"", "album":"alllllvin", "genre":"techno", "title":"Crucify (remix)", "isdir": false},' + 
							'{"name":"music", "path":"/media/internal/music", "artist":"Groove Coverage", "album":"alllllvin", "genre":"techno", "title":"Poison", "isdir": true},' +
							'{"name":"groovecov.mp3", "path":"/media/internal/path19", "artist":"Groove Coverage", "album":"alllllvin", "genre":"techno", "title":"20th Century Digital Girl", "isdir": false}' +
						']}';
			};
			
			this.plugIn.GetMetadata = function(str)
			{
				return new Object();
			};
			
			this.plugIn.iTestVar = 0;
			
			this.plugIn.Open = function(str, iTrack)	
			{
				objwAMP.plugIn.iTestVar = 0;
				objwAMP.plugIn.bNextSet = false;
			
				setTimeout(function() 
				{
					var i=0;
					
					while (i < OfflineArray.length)
					{
						if (str == OfflineArray[i].path)
						{
						
							objwAMP.plugIn.StartSong(OfflineArray[i].path, 
											OfflineArray[i].title,
											OfflineArray[i].artist,
											iTrack);
							return;
						}
						i++;
					}
				}, 100);
			};
			
			
			this.plugIn.SetNext = function() 
			{
				objwAMP.plugIn.bNextSet = true;
			};
			this.plugIn.playonce = 0;
			
			this.plugIn.Play = function() 
			{
				if (!objwAMP.plugIn.playonce)
				{
					console.log("Play Once Play: " + ++objwAMP.plugIn.playonce);
					objwAMP.plugIn.intervalTest = setInterval(function () {							
								objwAMP.plugIn.iTestVar++;
							}, 1000);
				}
			};
			this.plugIn.Pause = function() 
			{
				clearInterval(objwAMP.plugIn.intervalTest);
			};
			this.plugIn.GetCurTime = function() 
			{
				return Number(objwAMP.plugIn.iTestVar).toString();
			};
			this.plugIn.GetEndTime = function() 
			{
				return "280";
			};
			this.plugIn.SetSpeed = function() {};
			this.plugIn.SetVol = function() {};
			this.plugIn.SetTreble = function() {};
			this.plugIn.SetBass = function() {};
			this.plugIn.SetMid = function() {};
			this.plugIn.Seek = function(iTime, iTrack) 
			{
				objwAMP.plugIn.iTestVar = iTime;
				setTimeout(function()
				{
					objwAMP.FinishSeek(iTime, iTrack);
				}, 100); ;
			};
			this.plugIn.SetMetadataPath = function(str) {};
			this.plugIn.GetBPM = function(i) {return "100";};
			this.plugIn.SetNoNext = function(i) {};
			this.plugIn.GetAvgMagString = function() 
			{
				var array = new Array(256);
				
				for (var i=0;i<256;i++)
				{
					array[i] = 0|(Math.random() * 110);
				}
				
				return array.join('');
			};
			this.plugIn.CheckMusicDir = function()
			{
				return "1" | 0;
			};
			this.plugIn.GetFreqString = function() 
			{
				var array = new Array(128);
				
				for (var i=0;i<128;i++)
				{
					array[i] = 0|(Math.random() * 110);
				}
				
				return array.join('');
			};
			
			this.plugIn.CheckPathForImg = function()
			{
				return "-1";
			}
		}
	},	
	
	/******************************
	 * This function is checks whether the plugin has been
	 *	loaded yet or not
	 *
	 * Returns true - if loaded / false - if not loaded yet
	 ******************************/
	checkIfPluginInit: function()
	{
		try
		{
			//console.log("Start Here");
			if (this.plugIn.Ping)
			{
				//console.log("Better if we get here");
				if (this.plugIn.Ping() == "Pong")
				{
					//console.log("At least we are getting here");
					return true;
				}
				else
				{
					//console.log("No response to Ping");
					return false;
				}
			}
			else
			{
				//console.log("Ping hook not available");
				return false;
			}
		}
		catch (err) 
		{
			console.log(err);
			return false;
		}
	},
	
	CheckIndex: function(funcIndexStart)
	{
		objwAMP.funcIndexStart = funcIndexStart;
		objwAMP.hashPaths = {};
	},
	
	AddToIndex: function(str, modstate)
	{				
		var objSong = {"path":str,
					   "dirty": modstate,
					   "found": 0};
		
		objSong.name = str.substr(str.lastIndexOf('/') + 1)
		
		objwAMP.hashPaths[str] = objSong;
		objwAMP.iIndexCallbackCnt++;
	},
	
	/******************************
	 * Callback for reindex
	 ******************************/
	FinishIndex: function(strPath)
	{				
		//console.log("Finished");
		
		setTimeout(function()
		{
			objwAMP.IndexerCallbackFinish()
		}, 10);
	},
	
	/******************************
	 * Check if the index was previously run
	 ******************************/
	IndexerCallbackFinish: function()
	{
		ProfilerStart("IndexerCallbackFinish");
		
		objwAMP.iIndexStatus = objSongIndex.Init(function()
		{
			console.log("Indexer Called Back");
		
			objwAMP.funcIndexStart(!INDEX_FAILED_LOAD);
		},
		function()
		{
			objwAMP.iIndexStatus = INDEX_FAILED_LOAD;
		
			objwAMP.funcIndexStart(INDEX_FAILED_LOAD);		
		});
	
	},
	
	SetRecentPlayRaw: function(strRaw)
	{
		if (!strRaw)
			objwAMP.arrayPLRaw = new Array();
		else
			objwAMP.arrayPLRaw = strRaw.split('\\\\');
	},
	
	AddSongToRecentPlay: function(strNewPath)
	{
		if (objwAMP.arrayPLRaw.length)
		{
			objwAMP.arrayPLRaw = objwAMP.arrayPLRaw.filter(function(element)
			{
				return (element != strNewPath);
			});
		
			while (objwAMP.arrayPLRaw.length >= 25)
				objwAMP.arrayPLRaw.shift();
				
		}
		
		objwAMP.arrayPLRaw.push(strNewPath);
		
		objOptions.UpdateLastPlayed(objwAMP.arrayPLRaw.join('\\\\'), strNewPath);
	},
	
	GetRecentPlay: function()
	{
		return objwAMP.arrayPLRaw; 
	},
	
	/******************************
	 * This function gets the ls of whatever the current dir is set to
	 *
	 * Returns: An array of objects which is made up of
	 *			the songs and dirs in a particular file
	 ******************************/
	GetDirFileList: function(iTrackArg)
	{
		var iTrack;
		
		if (!iTrackArg)
			iTrack = 0;
		else
			iTrack = iTrackArg;
		
		try
		{
			// Check if we have already visited this dir previously
			if (this.objectLsCache[this.strCurrentPath[iTrack]])
			{
				// If we have, just return what we found before
				return this.objectLsCache[this.strCurrentPath[iTrack]];
			}
			else
			{	
				// this is the first time we have visited this dir
				//	so build the ls of it
			
				var objCache = new Object;
				
				// Seperate everything into three arrays, dirs/playbel/unknown
				objCache.Dir = new Array();
				objCache.Playable = new Array();
				objCache.Unknown = new Array();
				
			
				// Have the plugin get the info for the available files
				//	and pass it to the js app via JSON formatted string
				var strJSON = this.plugIn.GetCurrentDirLS(this.strCurrentPath[iTrack]);
			
				//this.Log(strJSON);
			
				// If our return string is NULL, it means that no sub dirs exist
				//	and no songs exist in that folder, so create an item to go up
				//	one dir
				if (!strJSON)
				{
					var objAppendItem = {
						isdir : true,
						name : "No Song Files Found\\nClick to return to previous dir",
						path : this.strCurrentPath[iTrack]
										.substr(0,this.strCurrentPath.lastIndexOf("/"))
					};
					
					objCache.Dir.push(objAppendItem);
					
					this.objectLsCache[this.strCurrentPath[iTrack]] = objCache;
					return this.objectLsCache[this.strCurrentPath[iTrack]];
				}
			
				// We get here if there was something in the JSON string, so parse it
				var jsonFileList = JSON.parse(strJSON);
				
				// If the current directory is not the root dir, then provide
				//	a method for going up one dir
				if (this.strCurrentPath[iTrack] !== "/media/internal")
				{
					var objAppendItem = {
						artist : "",
						album : "",
						genre : "",
						title : "",
						isdir : true,
						name : "..",
						path : this.strCurrentPath[iTrack]
										.substring(0,this.strCurrentPath[iTrack].lastIndexOf("/"))
					};
					
					objCache.Dir.push(objAppendItem);
				}
				
				for (var i=0; i < jsonFileList.arrayFileList.length; i++)
				{
					if (jsonFileList.arrayFileList[i].isdir)
					{
						objCache.Dir.push(jsonFileList.arrayFileList[i]);
						continue;
					}
					
					var iIndex = jsonFileList.arrayFileList[i].name.lastIndexOf(".")
					
					if (iIndex == -1)
					{
						objCache.Unknown.push(jsonFileList.arrayFileList[i]);
						continue;
					}
					
					var strExt = jsonFileList.arrayFileList[i].name.slice(iIndex).toLowerCase();
					var bIsPlayable = false;
					
					for (var j = 0; j < this.arrayExtList.length; j++) 
					{
					
						if (this.arrayExtList[j] == strExt) 
						{
							bIsPlayable = true;
							break; 
						}
					}
					
					jsonFileList.arrayFileList[i].artist = 
											jsonFileList.arrayFileList[i].path;
				
					jsonFileList.arrayFileList[i].title = 
											jsonFileList.arrayFileList[i].name;
				
					if (bIsPlayable)
						objCache.Playable.push(jsonFileList.arrayFileList[i]);
					else
						objCache.Unknown.push(jsonFileList.arrayFileList[i]);
				
				}
				
				this.objectLsCache[this.strCurrentPath[iTrack]] = objCache;
				return this.objectLsCache[this.strCurrentPath[iTrack]];
			}
		}
		catch (err) {console.log(err);}
		
	},
	
	GetDirOnly: function(path)
	{	
		try
		{
			// Seperate everything into three arrays, dirs/playbel/unknown
			var Dir = new Array();
		
			// Have the plugin get the info for the available files
			//	and pass it to the js app via JSON formatted string
			var strJSON = this.plugIn.GetCurrentDirLS(path);
		
			// If our return string is NULL, it means that no sub dirs exist
			//	and no songs exist in that folder, so create an item to go up
			//	one dir
			if (!strJSON)
			{
				var objAppendItem = {
					isdir : true,
					name : "No Song Files Found\\nClick to return to previous dir",
					path : path.substr(0,path.lastIndexOf("/"))
				};
				
				Dir.push(objAppendItem);
			}
		
			// We get here if there was something in the JSON string, so parse it
			var jsonFileList = JSON.parse(strJSON);
			
			// If the current directory is not the root dir, then provide
			//	a method for going up one dir
			if (path !== "/media/internal")
			{
				var objAppendItem = {
					"isdir" : true,
					"name" : "..",
					"path" : path.substring(0,path.lastIndexOf("/"))
				};
				
				Dir.push(objAppendItem);
			}
			
			for (var i=0; i < jsonFileList.arrayFileList.length; i++)
			{
				if (jsonFileList.arrayFileList[i].isdir)
				{
					Dir.push(jsonFileList.arrayFileList[i]);
					continue;
				}
			}
			
			return Dir;
		}
		catch (e)
		{
			return -1;
		}
	},
	
	/******************************
	 * Show spectrum data
	 *****************************/
	
	
	/******************************
	 * This function gets the current path for folder ls
	 *
	 * Returns: A string with the current path
	 ******************************/
	getCurrentPath: function(iTrack)
	{
		if (!iTrack)
			iTrqck = 0;
	
		return this.strCurrentPath[iTrack];
	},
	/******************************
	 * This function sets the current path for folder ls
	 *
	 * Returns: None
	 ******************************/
	SetCurrentPath: function(strDir, iTrack)
	{
		if (!iTrack)
			iTrack = 0;
	
		this.strCurrentPath[iTrack] = strDir;
	},
	
	 /******************************
	  * Deal with playback mode
	  * var PLAY_MODE_NORMAL = 0;
	  * var PLAY_MODE_REPEAT = 0;
	  * var PLAY_MODE_SHUFFLE = 0;
	  ******************************/
	SetMode: function(iMode)
	{
		switch(iMode)
		{
			case PLAY_MODE_SHUFFLE:
				this.bShuffle = true;
				this.bRepeat = false;
				break;
			case PLAY_MODE_REPEAT:
				this.bShuffle = false;
				this.bRepeat = true;
				break;
			case PLAY_MODE_NORMAL:
				this.bShuffle = false;
				this.bRepeat = false;	
		}
		
		if (objwAMP.checkIfPluginInit())
			this.SetNextSong();
		
		objOptions.UpdateOption(OPT_ID_SHUF_REP, iMode.toString());
	},
	GetMode: function()
	{
		if (this.bShuffle == true)
			return PLAY_MODE_SHUFFLE;
		else if (this.bRepeat == true)
			return PLAY_MODE_REPEAT;
		else
			return PLAY_MODE_NORMAL;
	},
	
	
	 /*******************************
	 * Tell the plugin to pause
	 *******************************/
	pause: function(iTrack)
	{
		if (!iTrack)
			iTrack = 0;
			
		this.plugIn.Pause(iTrack);
	},
	 
	 /*******************************
	 * Tell the plugin to play
	 *******************************/
	play: function(iTrack)
	{
		if (!iTrack)
			iTrack = 0;
	
		this.plugIn.Play(iTrack);
	},
	  

	/*******************************
	 * This function gets the current state
	 *******************************/
	GetState: function(iTrack)
	{
		if (!iTrack)
			iTrack = 0;
		
		var objState = new Object;
	
		try
		{
			objState.EndTime = Number(this.plugIn.GetEndTime(iTrack));
			//console.log(objState.EndTime);
			objState.CurTime = Number(this.plugIn.GetCurTime(iTrack));
			//console.log(objState.CurTime);
			objwAMP.iBPM = objState.BPM = Number(this.plugIn.GetBPM(iTrack));
			//console.log(objState.BPM);
		}
		catch(e) 
		{
			console.log(e);
			
			if (isNaN(objState.EndTime))
			{
				objState.EndTime = 0;
				objState.CurTime = 0;
			}
			else
				objState.CurTime = 0;
			
			objState.BPM = objwAMP.iBPM;
		}
			
		objSongIndex.SaveCurPos(objState.CurTime);
	
		return objState;
	},
	 
	/*******************************
	 * Set the speed control
	 *******************************/
	SetSpeed: function(fSpeed, iTrackNum)
	{
		//console.log(fSpeed);

		if (!iTrackNum)
			iTrackNum = 0;
	
		this.plugIn.SetSpeed(fSpeed, iTrackNum);
	},
	 
	 /*******************************
	 * Set the vol control
	 *******************************/
	SetVol: function(fVol, iTrack)
	{
		//console.log("Vol:" + fVol);
		
		this.plugIn.SetVol(fVol, iTrack);
	},
	 
	/*******************************
	 * Set the treble control
	 *******************************/
	SetTreble: function(fTreb, iTrackNum)
	{
		clearTimeout(objwAMP.tmoutTrebSet);
		
		objwAMP.tmoutTrebSet = setTimeout(function()
		{
			objOptions.UpdateOption(OPT_ID_TREB, 
									Number(fTreb).toString());
		
		}, 300);
		
		if (!iTrackNum)
			iTrackNum = 0;
		
		this.plugIn.SetTreble(fTreb * 2, iTrackNum);
	},
	 
	 /*******************************
	 * Set the bass control
	 *******************************/
	SetBass: function(fBass, iTrackNum)
	{	
		clearTimeout(objwAMP.tmoutBassSet);
		
		objwAMP.tmoutBassSet = setTimeout(function()
		{
			objOptions.UpdateOption(OPT_ID_BASS, 
									Number(fBass).toString());
		
		}, 300);
	
		if (!iTrackNum)
			iTrackNum = 0;
	
		this.plugIn.SetBass(fBass * 2, iTrackNum);
	},

	 /*******************************
	 * Set the midrange control
	 *******************************/
	SetMid: function(fMid, iTrackNum)
	{
		clearTimeout(objwAMP.tmoutMidSet);
		
		objwAMP.tmoutMidSet = setTimeout(function()
		{
			objOptions.UpdateOption(OPT_ID_MID, 
									Number(fMid).toString());
		
		}, 300);
	
		if (!iTrackNum)
			iTrackNum = 0;
	
		this.plugIn.SetMid(fMid * 2, iTrackNum);
	},
	
	 /*******************************
	 * Set an EQ coefficient
	 *******************************/
	SetEQCoef: function(iEQFreqID, fCoef)
	{	
		clearTimeout(objwAMP.tmoutEQSet);
	
		var iToFixed = (255 * fCoef) | 0;
		
		objOptions.arrayEQVals[iEQFreqID] = String.fromCharCode(iToFixed);
		
		objwAMP.tmoutEQSet = setTimeout(function()
		{
			objOptions.UpdateOption(OPT_ID_EQ, 
									objOptions.arrayEQVals.join(''));
		
		}, 300);
		
		this.plugIn.SetEQ(objOptions.arrayEQVals.join(''));
	}, 
	
	SetFullEQ: function()
	{	
		this.plugIn.SetEQ(objOptions.arrayEQVals.join(''));
	},
	
	 /*******************************
	 * Seek a part of the song
	 *******************************/
	Seek: function(iNewTime, funcFinishFunc, iTrackNum)
	{
		//console.log("Seek:" + iNewTime + " " + iTrackNum);
		
		if (!iTrackNum)
			iTrackNum = 0;
	
		this.funcSeekFinishFunc[iTrackNum] = funcFinishFunc;
		this.plugIn.Seek(iNewTime, iTrackNum);
	}, 

	RegisterPauseFunc: function(funcPauseFunc)
	{
		objwAMP.funcPauseCallback = funcPauseFunc;
	
	},
	
	/*********************************
	 * Callback function called by the plugin to
	 *	let the javascript know when a song has started.
	 *********************************/
	StartSong: function(path, artist, title, iTrackNumArg)
	{	
		var iTrackNum = iTrackNumArg;
		
		if ((!iTrackNum) || isNaN(iTrackNum))
			iTrackNum = 0;
		
		//console.log(path);
		
		//console.log(artist);
		
		//console.log(title);
		
		objwAMP.arraySongStartObj[iTrackNum] = new Object();

		objwAMP.arraySongStartObj[iTrackNum].path = path;
		
		if (artist && artist != "0")
			objwAMP.arraySongStartObj[iTrackNum].artist = artist;
		else
			objwAMP.arraySongStartObj[iTrackNum].artist = path;
		
		if (title && title != "0")
			objwAMP.arraySongStartObj[iTrackNum].title = title;
		else
		{
			var iFindName = path.lastIndexOf('/') + 1;
			
			objwAMP.arraySongStartObj[iTrackNum].title = path.substr(iFindName);
		}
		
		objwAMP.bTrackNew[iTrackNum] = 1;
		
		setTimeout(function()
		{
			objwAMP.AvoidPluginCall()
		}, 10);
	},
	/*********************************
	 * Need this to avoid calling the plugin
	 *  from the plugin callback
	 *********************************/
	AvoidPluginCall: function()
	{	
		objwAMP.KeepAlive();
		
		var iTrack = objwAMP.bTrackNew.length;
		
		while ((iTrack--) && (!objwAMP.bTrackNew[iTrack])) {};
	
		var objSong = objwAMP.arraySongStartObj[iTrack];
	
		if (!objSong.path)
		{
			console.log("Handling bad song");
			
			var iCheckIndex = this.GetNextIndex(iTrack);
			
			if ((objwAMP.iNextIndex[iTrack] == -1) ||
				(iCheckIndex == -1))
			{
				if (objwAMP.funcPauseCallback)
					objwAMP.funcPauseCallback(iTrack);
					
				objwAMP.funcTextBanner("Pick Another Song", "", iTrack);
				
				return;
			}
			
			this.SetIndex(this.iNextIndex[iTrack], iTrack);
			this.SetIndex(this.GetNextIndex(iTrack), iTrack);
			this.OpenNextSong(iTrack);
			return;
		}
		
		
		if (this.iOpenIndex[iTrack] == -1)
			this.SetIndex(this.iNextIndex[iTrack], iTrack);
		else
		{
			this.SetIndex(this.iOpenIndex[iTrack], iTrack);
			this.iOpenIndex[iTrack] = -1;
		}
		
		this.SetNextSong(iTrack);
		
		objwAMP.funcTextBanner(objSong.title, objSong.artist, iTrack);

		objSongIndex.SaveCurIndex(this.GetIndex(iTrack));

		objwAMP.AddSongToRecentPlay(objSong.path);
		
		if (objwAMP.funcNowPlaying)
			objwAMP.funcNowPlaying(this.GetIndex(iTrack), iTrack);
		
		//console.log("Calling Path from avoid:" + objSong.path);
		
		objwAMP.funcImgGenCB(objSong.path);
	},
	
	RegisterTextBanner: function(funcTextBanner)
	{
		objwAMP.funcTextBanner = funcTextBanner;
	},
	
	// Function to register call back for show album art
	RegisterImgGen: function(funcImgGenCB)
	{
		objwAMP.funcImgGenCB = funcImgGenCB;
	},
	
	RegisterSongTrans: function(funcSongTransition)
	{
		objwAMP.funcSongTransition = funcSongTransition;
	},
	
	RegisterNowPlaying: function(funcNowPlaying)
	{
		objwAMP.funcNowPlaying = funcNowPlaying;
	},
	
	/******************************
	 * Callback for reindex
	 ******************************/
	FinishReindex: function(strJSON)
	{	
		objwAMP.strIndexJSON = strJSON;
		
		setTimeout(function()
		{
			objwAMP.AvoidReindexPluginCall()
		}, 10);
	},
	/*********************************
	 * Need this to avoid calling the plugin
	 *  from the plugin callback
	 *********************************/
	AvoidReindexPluginCall: function()
	{
		this.jsonIndex = JSON.parse(this.strIndexJSON);
		objSongIndex.addArray(this.jsonIndex.arrayFileList);
		document.getElementById('idButtonGoesHere').style.display = "block";
	},
	
	
	/*******************************
	 * Called after plugin finishes seeking
	 *******************************/
	FinishSeek: function(strNewTime, iTrack)
	{
		//console.log("Finish Seek:" + strNewTime + " " + iTrack);
		objwAMP.strNewSeekTime[iTrack] = strNewTime;
		setTimeout(function()
		{
			objwAMP.AvoidSeekPluginCall(iTrack)
		}, 5);
	},
	/*********************************
	 * Need this to avoid calling the plugin
	 *  from the plugin callback
	 *********************************/
	AvoidSeekPluginCall: function(iTrack)
	{
		console.log("Finish avoid seek:" + iTrack);
		
		if (!iTrack)
			iTrack = 0;
		
		var iRet = parseFloat(objwAMP.strNewSeekTime[iTrack]);
		if (isNaN(iRet))
		{
			console.log(objwAMP.strNewSeekTime[iTrack]);
			iRet = 0;
		}
		
		if (this.funcSeekFinishFunc[iTrack])
			this.funcSeekFinishFunc[iTrack](iRet, iTrack);
	},
	
	/******************************
	 * Gets the file list based on which option we are using
	 ******************************/
	GetPlaylist: function(iTrack)
	{
		if (!(this.arrayPlaylist[iTrack]))
			this.arrayPlaylist[iTrack] = new Array();
	
		return this.arrayPlaylist[iTrack]
	},
	
	PLSize: function(iTrack)
	{
		if (!(this.arrayPlaylist[iTrack]))
			return 0;
		else
			return this.arrayPlaylist[iTrack].length;
	},

	RegisterPLCallback: function(funcUpdatePLCallback)
	{
		if (this.funcUpdatePLCallback == -1)
		{
			objwAMP.OpenSong(0, objwAMP.iIndex);
			objwAMP.Seek(objwAMP.iPos);	
			funcUpdatePLCallback(this.arrayPlaylist[0]);
		}
		
		this.funcUpdatePLCallback = funcUpdatePLCallback;
	},
	
	EmptyPlaylist: function(iTrack)
	{
		this.arrayPlaylist[iTrack] = new Array();
		this.SetIndex(0, iTrack);
		
		objSongIndex.SaveCurPlaylist(iTrack);
		if (this.funcUpdatePLCallback)
			this.funcUpdatePLCallback(this.arrayPlaylist[iTrack],
									  iTrack);
	},
	
	SetPlaylist: function(iTrack, arraySongs, bSkipDB8Update)
	{
		this.arrayPlaylist[iTrack] = arraySongs;
		
		try
		{
			if (!bSkipDB8Update)
				objSongIndex.SaveCurPlaylist(iTrack);
		}
		catch(e)
		{
			document.getElementById('idTellUser').innerHTML = 'Error: There was an error trying to save the playlist. ' +
					  'The playlist will not be saved on exit at this time. ' +
					  'Please report the following to blaclynx@yahoo.com:' + 
						e;
			document.getElementById('idButtonGoesHere').innerHTML = "Ok";
			document.getElementById('idDialog').style.display = "block";
		}
		
		try
		{
			if (this.funcUpdatePLCallback)
			{
				this.funcUpdatePLCallback(this.arrayPlaylist[iTrack],
										  iTrack);
			}
		}
		catch(e)
		{
			document.getElementById('idTellUser').innerHTML = 'Error: There was an error trying to display the playlist. ' +
					  'Please report the following to blaclynx@yahoo.com:' + 
						e;
			document.getElementById('idButtonGoesHere').innerHTML = "Ok";
			document.getElementById('idDialog').style.display = "block";
		}		
		
		this.SetNextSong(iTrack);
	},

	MoveSong: function(iTrack, oldPos, newPos)
	{
		var tmp = this.arrayPlaylist[iTrack].splice(oldPos, 1);
		this.arrayPlaylist[iTrack].splice(newPos, 0, tmp[0]);
		var iCur = this.GetIndex(iTrack);
		
		if (iCur == oldPos)
			this.SetIndex(newPos, iTrack);
		else if ((iCur >= newPos) && (iCur <= oldPos))
			this.SetIndex(++iCur, iTrack);
		else if ((iCur <= newPos) && (iCur >= oldPos))
			this.SetIndex(--iCur, iTrack);
		this.SetPlaylist(0, this.arrayPlaylist[iTrack]);
	},
	
	AppendPlaylist: function(arrayNewPL, iTrack, iIntoPnt)
	{
		if (iIntoPnt == null)
		{
			this.arrayPlaylist[iTrack] = 
					objwAMP.GetPlaylist(iTrack).concat(arrayNewPL);
		}
		else
		{
			if (isNaN(iIntoPnt))
			{
				console.log("Should not have sent this val:" + iIntoPnt);
				iIntoPnt = 0;
			}
			
			var arrayCur = objwAMP.GetPlaylist(iTrack);
			this.arrayPlaylist[iTrack] = 
					arrayCur.slice(0, iIntoPnt).concat(arrayNewPL,
													  arrayCur.slice(iIntoPnt));

			var iCur = this.GetIndex(iTrack);													  
			
			if (iCur >= iIntoPnt)
			{
				this.SetIndex((iCur+arrayNewPL.length), iTrack);
			}
		}
		
		objSongIndex.SaveCurPlaylist(iTrack);
		if (this.funcUpdatePLCallback)
			this.funcUpdatePLCallback(this.arrayPlaylist[iTrack]);
		this.SetNextSong(iTrack);
	},

	RemoveSong: function(iIndex, iTrack)
	{
		if (!iTrack)
			iTrack = 0;
		
		this.arrayPlaylist[iTrack].splice(iIndex, 1);
		
		var iCurSong = this.GetIndex(iTrack);
		
		if (iCurSong >= iIndex)
		{
			iCurSong--;
			this.SetIndex(iCurSong, iTrack);
		}			
		
		objSongIndex.SaveCurPlaylist();
		if (this.funcUpdatePLCallback)
			this.funcUpdatePLCallback(this.arrayPlaylist[iTrack]);
		this.SetNextSong(iTrack);
	},
	
	AddSong: function(objSong, iTrack, iPosition)
	{
		if ((iPosition != null) && 
			(this.arrayPlaylist[iTrack]) &&
			(iPosition < this.arrayPlaylist[iTrack].length))
		{
			if (isNaN(iPosition))
				iPosition = 0;
			
			switch (iPosition)
			{
			case PLAYLIST_POS_END:
				this.AddSongToPlaylist(objSong, iTrack);
				break;
			case PLAYLIST_POS_NEXT:
				this.AddSongNext(objSong, iTrack);
				break
			default:
				this.arrayPlaylist[iTrack].splice(iPosition,
										  0,
										  objSong);
				var iCurSong = this.GetIndex(iTrack);						  
				if (iPosition <= iCurSong)
					this.SetIndex(++iCurSong, iTrack);
				this.SetNextSong(iTrack);
			}
		}
		else
			this.AddSongToPlaylist(objSong, iTrack);
		
		objSongIndex.SaveCurPlaylist(0);
		
		if (this.funcUpdatePLCallback)
			this.funcUpdatePLCallback(this.arrayPlaylist[iTrack]);
	},
	
	AddSongToPlaylist: function(objSong, iTrack)
	{
		if (!this.arrayPlaylist[iTrack])
		{
			this.arrayPlaylist[iTrack] = new Array();
			this.arrayPlaylist[iTrack].push(objSong);
			this.OpenSong(0, iTrack);
		}
		else
			this.arrayPlaylist[iTrack].push(objSong);
		
		this.SetNextSong(iTrack);
	},
	
	AddSongNext: function(objSong, iTrack)
	{
		if (!this.arrayPlaylist[iTrack])
		{
			this.AddSongToPlayList(objSong, iTrack);
		}
		else
		{
			var iCurIndex = this.GetIndex(iTrack);
		
			this.arrayPlaylist[iTrack].splice(iCurIndex + 1,
									0,
									objSong);
			this.SetNextSong(iTrack, iCurIndex + 1);
		}
		
	},
	
	AddSongNow: function(objSong, iTrack)
	{
		this.AddSong(objSong, iTrack, this.GetIndex(iTrack));
	},
	
	SetSongTransition: function (fTransition)
	{
		clearTimeout(objwAMP.tmoutSonTransDB);
		
		objwAMP.tmoutSonTransDB = setTimeout(function()
		{
			objOptions.UpdateOption(OPT_ID_TRANS, 
									Number(fTransition).toString());
			objwAMP.SetNextSong(0);
		}, 400);
		this.fTransition = Number(fTransition).toFixed(1);
	},
	
	GetSongTransition: function()
	{
		return this.fTransition;
	},
	
	/******************************
	 * Tell the plugin handler which song to start playing
	 ******************************/
	SetIndex: function(iIndex, iTrack)
	{
		this.iSongIndex[iTrack] = iIndex;
	},
	GetIndex: function(iTrack)
	{
		return this.iSongIndex[iTrack];
	},
	
	GetCurSongPath: function(iTrack)
	{
		return objwAMP.arraySongStartObj[iTrack].path;
	},
	 
	/******************************
	 * Tell the plugin handler which song to start playing
	 ******************************/	
	GetNextIndex: function(iTrack)
	{
	
		if (!iTrack)
			iTrack = 0;
		
		if (!(this.arrayPlaylist[iTrack]) || (this.arrayPlaylist[iTrack].length == 0))
			return -1;	
	
		var iRet = this.GetIndex(iTrack);
	
		if (this.bShuffle == true)
			iRet = (Math.random()*this.arrayPlaylist[iTrack].length) | 0;
		else
		{
			iRet++;
			if (this.bRepeat == true)
				iRet = iRet % this.arrayPlaylist[iTrack].length;
			else
			{
				if (iRet >= this.arrayPlaylist[iTrack].length)
					return -1;
			}
		}
		
		return iRet;
	},
	 
	 /******************************
	 * Tell the plugin handler which song to start playing
	 ******************************/
	 getPreviousIndex: function(iTrack)
	 {
		if (!iTrack)
			iTrack = 0;
		
		if (!(this.arrayPlaylist[iTrack]) || (this.arrayPlaylist[iTrack].length == 0))
			return -1;	 
	 
		var iRet = this.GetIndex(iTrack);

		if (this.bShuffle == true)
			iRet = (Math.random()*this.arrayPlaylist[0].length) | 0;
		else
		{
			iRet--;
			if (iRet < 0)
			{
				if (this.bRepeat)
					iRet = this.arrayPlaylist[0].length - 1;
				else
					iRet = 0;
			}
		}	

		return iRet;
	 },
	 
	 
	/*******************************
	 * Tell the plugin to load the song at the current index
	 * 	or you can pass it an index variable
	 *******************************/
	 OpenSong: function(iTrack, iIndex)
	 {	 
	 	if (!iTrack)
			iTrack = 0;
		
		if (!(this.arrayPlaylist[iTrack]) || !(this.arrayPlaylist[iTrack].length))
			return;
		
		if (typeof(iIndex) != "undefined")
		{
			if (iIndex >= this.arrayPlaylist[iTrack].length)
				iIndex = this.arrayPlaylist[iTrack].length - 1;
			else if (iIndex < 0)
				iIndex = 0;
			this.SetIndex(iIndex, iTrack);
		}
			
		objwAMP.CallOpenSong(this.arrayPlaylist[iTrack][this.GetIndex(iTrack)].path, iTrack);
		this.iOpenIndex[iTrack] = this.GetIndex(iTrack);
	 },
	
	CallOpenSong: function(str, iTrack)
	{
		if ((typeof str == "string") && 
					(str.indexOf('/media/internal') != -1))
		{
			console.log("Opening: " + str);
			this.plugIn.Open(str, iTrack);
		}
	},
	
	CallSetNext: function(str, transition, iTrack)
	{
		if (isNaN(transition))
			transition = 0.0;

		if ((typeof str == "string") && 
					(str.indexOf('/media/internal') != -1))
		{
			console.log("Opening: " + str + " with:" + transition);
			this.plugIn.SetNext(str, transition, iTrack);
		}
		else
		{
			this.plugIn.SetNoNext(iTrack);
		}
	
	},
	
	/*******************************
	 * Tell the plugin to use a new next song
	 *******************************/
	SetNextSong: function(iTrack, iIndex)
	{	
		if (!iTrack)
			iTrack = 0;
		
		if (!this.arrayPlaylist[0] || !this.arrayPlaylist[0].length)
		{
			objwAMP.CallSetNext(0, 0, iTrack);
			return;
		}
	
		if ((this.arrayPlaylist[0].length == 1) &&
			 (this.bRepeat != true))
		{
			objwAMP.CallSetNext(0, 0, iTrack);
			return;
		}
	
		if (iIndex)
		{
			if (iIndex == -1)
			{
				this.iNextIndex[iTrack] = -1;
				objwAMP.CallSetNext(0, 0, iTrack);
				return;
			}
			
			var iBad = 0;
			
			try
			{
				objwAMP.CallSetNext(this.arrayPlaylist[0][iIndex].path,
									this.fTransition,
									iTrack);
			}
			catch (e)
			{
				console.log(e);
				iBad = 1;
				objwAMP.CallSetNext(0, 0, iTrack);
				return 0;
			}
			
			if (!iBad)
				this.iNextIndex[iTrack] = iIndex;
				
			return;
		}
	
		var iNextIndex = this.GetNextIndex(iTrack);
		
		if (iNextIndex == -1)
			return;
		
		try
		{
			if (!this.arrayPlaylist[0][iNextIndex])
			{
				objwAMP.CallSetNext(this.arrayPlaylist[0][0].path, 
									this.fTransition, iTrack);
			}
		
			objwAMP.CallSetNext(this.arrayPlaylist[0][iNextIndex].path, 
								this.fTransition, iTrack);
		}
		catch (e)
		{
			console.log(e);
			return 0;
		}					
							
		this.iNextIndex[iTrack] = iNextIndex;
	},

	
	 /*******************************
	 * Tell the plugin to Play the next song
	 *******************************/
	 OpenNextSong: function(iTrack)
	 {
	 	if (!iTrack)
			iTrack = 0;
	 
		var iNextIndex = this.GetNextIndex(iTrack);
		
		console.log("Open Next Song:" + iNextIndex);
		
		if (iNextIndex == -1)
		{
			return -1;
		}
		else
		{
			this.SetIndex(iNextIndex, iTrack);
			objwAMP.CallOpenSong(this.arrayPlaylist[0][this.GetIndex(iTrack)].path, iTrack);
			this.iOpenIndex[iTrack] = this.GetIndex(iTrack);
		}

	},
		
	 
	 /*******************************
	 * Tell the plugin to play the previous song
	 *******************************/
	OpenPrevSong: function(iTrack)
	{
		if (!iTrack)
			iTrack = 0;
	
		var iPrevIndex = this.getPreviousIndex(iTrack);
	 
	 	if (iPrevIndex == -1)
		{
			return -1;
		}
		else
		{
			this.SetIndex(iPrevIndex, iTrack);
			objwAMP.CallOpenSong(this.arrayPlaylist[0][iPrevIndex].path, iTrack);
			this.iOpenIndex[iTrack] = this.GetIndex(iTrack);
		}
	},
	
	GetAlbumArtist: function(strPath)
	{
		this.plugIn.SetMetadataPath(strPath);
		
		var str = this.plugIn.GetMetadata(5);
		if (str == '0')
			return 0;
		else
			return str;
	},
	
	/**********************
	 * Get metadata for a son
	 **********************/
	GetMetadata: function(strPath)
	{
		var obj = new Object();
		
		//console.log("Getting Metadata for " + strPath);
		
		this.plugIn.SetMetadataPath(strPath);
		
		obj.name = strPath.lastIndexOf('/') + 1;
		
		obj.genre = this.plugIn.GetMetadata(0);
		if (obj.genre == '0')
			obj.genre = '[Unknown]';
		
		obj.artist = this.plugIn.GetMetadata(1);
		if (obj.artist == '0')
			obj.artist = '[Unknown]';

		obj.album = this.plugIn.GetMetadata(2);
		if (obj.album == '0')
			obj.album = '[Unknown]';
		//console.log("Album:" + obj.album);
		
		obj.title = this.plugIn.GetMetadata(3);
		if (obj.title == '0')	
			obj.title = strPath.substr(obj.name);
	
		//console.log("Title:" + obj.title);
		

		//console.log("Genre:" + obj.genre);
		
		obj.track = this.plugIn.GetMetadata(4);
		if (obj.track == '0')
			obj.track = 0;
			
		//console.log("Track:" + obj.track);
		
		obj.albumArtist = this.plugIn.GetMetadata(5);
		if (obj.albumArtist == '0')
			obj.albumArtist = 0;
		
		return obj;
	},
	
	GetMetadataForPre: function(path)
	{
		var obj = new Object();
		
		console.log("Getting Metadata for " + strPath);
		
		this.plugIn.SetMetadataPath(strPath);	
		obj.albumArtist = this.plugIn.GetMetadata(5);
	},
	
	SetCrossfade: function(fPaneOneFade)
	{
		if (this.plugIn.SetCrossfade)
			this.plugIn.SetCrossfade(fPaneOneFade);
	},
	
	GetFreqStr: function(iTrack)
	{
		if (!iTrack)
			iTrack = 0;
	
		var str = this.plugIn.GetFreqString(iTrack);
	
		//console.log("Freq String: " + str.charCodeAt(100));
	
		return str;
	},
	
	GetAvgMagStr: function(iTrack)
	{
		if (!iTrack)
			iTrack = 0;
	
		var str = this.plugIn.GetAvgMagString(iTrack);
	
		//console.log("Freq String: " + str.charCodeAt(100));
	
		return str;
	},
	
	CheckForImg: function(strPath)
	{
		if (objwAMP.objImageCache[strPath])
			return objwAMP.objImageCache[strPath];
			
		return objwAMP.objImageCache[strPath] = 
							this.plugIn.CheckPathForImg(strPath);
	},
	
	CheckMusicDir: function(bCreate)
	{
		bCreate = bCreate | 0;
	
		return (this.plugIn.CheckMusicDir(bCreate) | 0);
	}
}