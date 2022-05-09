/**
 * GlobalQuran (Global Quran) object to navigate through quran text, audio and lists of Quran/Recitation/Langauges.
 * @author Basit (i@basit.me || http://Basit.me)
 *
 * Online Quran Project
 * http://GlobalQuran.com/
 *
 * Copyright 2011, imegah.com
 * Simple Public License (Simple-2.0)
 * http://www.opensource.org/licenses/Simple-2.0
 * 
 */
var GlobalQuran = {
	
	config: {
		
		/**
		 * set to true if you want to use Quran for offline, make sure you download all the Quran data and all.json file.
		 */
		offline: false,		
		
		/**
		 * api settings
		 */
		api: {
			
			/**
			 * api key - required, from 4.0, they key is required for all api's request
			 */
			key: '',
			
			/**
			 * supported version for this GlobalQuran. this will pull data from the server according to its version. 
			 */
			version: '4.0',
			
			/**
			 * data api url
			 */
			url: 'http://api.globalquran.com/',
			
			/**
			 * audioPath audio data api path
			 */
			audioPath: 'http://audio.globalquran.com/',
		},
		
		/**
		 * saving the current location to the bookmark if bookmark is enabled (true). false for disable
		 */
		bookmark: true,		
		
		/**
		 * control how url should be displayed or turn it off from here
		 */
		url: { 
			enable: true,
			html5: true,	// html5 replaces hash (#) with backslashes / 
			
			/**
			 * puts backslash in the url, which can be used for sharing on facebook (lint feature). - requries .htaccess and metaTag plugin, to work properly.
			 * [NOTE] html5 must be set to true, for this to work
			 * 
			 * '/'; 		- adds / slash before the page values
			 * '/subfolder/'; -  if application is in the sub folder
			 * '?page=';	- adds ?page= before the page values - useful, if htaccess is not allowed on server
			 */
			startWith: '/',     // if html5 enabled, then starting url starts with / or subfolder name
			
			/**
			 * 'page'; 		- url page by page navigation
			 * 'ayah'; 		- url ayah by ayah navigation
			 */
			by: 'page'
		},
		
		data: {
			
			enable: true,
						
			/**
			 *  'page';     - Get Quran page by page.
			 *  'surah';    - Get Quran surah by surah.
			 *  'juz';      - Get Quran juz by juz.
			 */
			by: 'page', // surah or page
			
			/**
			 *  pre-caching the data so next page / surah / juz loads quickly.
			 *  
			 *   false;      - disable precache functionality
			 *   true;		- preload by above selected method. if it's page, then preload page, if its surah, then surah.
			 *  'page';     - Get Quran page by page.
			 *  'surah';    - Get Quran surah by surah.
			 *  'juz';      - Get Quran juz by juz.
			 *  'complete'; - Get Quran complete data.
			 */
			preload: true
		},
		
		player: {
			
			/**
			 * off Toggle the player on and off
			 */
			enable: false,
			
			/**
			 * start playing audio on start 
			 * [Note] mobile dont support auto play, it must be gesture to play audio. 
			 */
			autoPlay: false,
			
			/**
			 * preload three different settings for this 
			 * = true;  - two players playing continuesly
			 * = false; - play with one and load with other one
			 * = -1;    - just use only one player to play and load. This does not do preload. good for iphone or ipad
			 */
			preload: true,
			
			/**
			 * swfPath flash player path for non html5 support
			 */
			swfPath: 'http://globalquran.com/img',
			
			/**
			 * autoBitrate pass 'high' or 'low' for audio quality user wants
			 */
			autoBitrate: 'high', // high, low
			
			/**
			 * id player div id
			 */
			id: '#audioPlayer',
			
			/**
			 * id2 second player div id
			 */
			id2: '#audioPlayer2',
		},
		
		keyboard: true,
		
		/**
		 * googleAnalyticsID google analytics id for counting visitors on the site and the event they do
		 */
		googleAnalyticsID: ''
		
		// keyword, url - change/format, player... other config				
	},	
	
	
	/**
	 * internal usage
	 * settings holds the recent user settings for the site 
	 */
	settings: {
		ayah: 1,
		surah: 1,
		page: 1,
		juz: 1,
		selectedBy: null,
		selectedLanguage: null,
		selectedSearchBy: null,		
		
		selectedRecitor: null,
		selectedLastRecitorBytes: '',
		playing: false,
		volume: 100,
		muted: false,
		repeat: false,
		repeatEach: 'ayah',
		repeatTimes: 0,
		audioDelay: 0,
		
		showAlef: true,
		showSigns: true,
		ignoreInternalSigns: false,
		
		wbwDirection: 'arabic2english', // if change, then it will be english2arabic
		wbwMouseOver: false,
		
		font: 'auto',
		fontSize: 'medium'
	},
	
	_gaID: 'UA-1019966-3',
	
	
	/**
	 * internal usage
	 * data caching all the data here
	 */
	data: {
		loaded: false,
		quranList: {},
		quran: {},		
		languageCountryList: {},
		languageList: {},		
		search: {}
	},
	
	/**
	 * initial load on start, its required to run on start, before executing any other methods
	 * @returns {void} 
	 */
	init: function () {
		Quran.init();
		
		for (var i in Quran._data.UGroups)
	        Quran._data.UGroups[i] = this.quran.parse.regTrans(Quran._data.UGroups[i]);
		
		this.googleAnalytics();
	},
	
	/**
	 * set new configuration. if any setting was missing, it will use default settings for that setting.
	 * @param config {object}
	 */
	setConfig: function (config) {
		config = config || {};
		this.config = $.extend(true, this.config, config);		
	},
	
	/**
	 * add new setting key and its value. good for caching and retriving back on user revisit.
	 * @param name
	 * @param value
	 */
	addSetting: function (name, value)
	{
		GlobalQuran.settings[name] = value;
		GlobalQuran.save();
	},
	
	/**
	 * delete settings key and save
	 * @param name
	 */
	removeSetting: function (name)
	{
		delete GlobalQuran.settings[name];
		GlobalQuran.save();
	},
	
	/**
	 * starts the application
	 */
	start: function ()
	{
		GlobalQuran.init();						
		GlobalQuran.load.onStart();
	},
	
	/**
	 * language object holds all the site languages
	 * TODO still need to add more functions here
	 */
	language: {
		
		load: function () {},
		
		list: function ()
		{
			return GlobalQuran.data.languageList;
		},
		
		countryList: function ()
		{
			return GlobalQuran.data.languageCountryList;
		},
		
		selected: function ()
		{
			return GlobalQuran.settings.selectedLanguage;
		}
	},
	
	/**
	 * quran object lets you easily retrive data from quran and tell you detail about that data
	 */
	quran: {
		
		/**
		 * initial load
		 * @returns {void}
		 */
		init: function ()
		{
			if (GlobalQuran.settings.selectedBy && typeof(GlobalQuran.settings.selectedBy) == 'object' && this.length() > 0)
				return false;
			
			//backward compatibility
			if (GlobalQuran.settings.selectedBy && typeof(GlobalQuran.settings.selectedBy) != 'object')
			{
				by = GlobalQuran.settings.selectedBy;
				GlobalQuran.quran.reset();
				var selectedArray = by.split('|');
				$.each(selectedArray, function(a, quranBy) {
					GlobalQuran.quran.add(quranBy);					
				});
			}
			else
				GlobalQuran.quran.reset();
		},
		
		/**
		 * loads the current page again, useful for triggering after settings has been changed or quran translation has been deselected for rebuilding the page
		 * @return {void}
		 */
		load: function () {
			GlobalQuran.load.get(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
		},
		
		/**
		 * gets the Quran text for all the selected Quran translation & Quran selections.
		 * 
		 * @param dataBy juz, page or surah
		 * @param byNumber number of the dataBy (page, juz or surah)
		 * @returns {object}
		 */
		text: function (dataBy, byNumber)
		{
			var fromVerseNo, toVerseNo, 
			text = {}, 
			selected = this.selected(), selectedSorted,
			byList = GlobalQuran.quran.list('text'),
			verseObject;
			
			dataBy = dataBy || GlobalQuran.config.data.by;
			byNumber = byNumber || GlobalQuran.load._defaultByNumber();
			
			if (dataBy == 'juz')
			{
				fromVerseNo = Quran.verseNo.juz(byNumber);
				toVerseNo = Quran.verseNo.juz(byNumber+1)-1;
			}
			else if (dataBy == 'surah')
			{
				fromVerseNo = Quran.verseNo.surah(byNumber);
				toVerseNo = Quran.verseNo.surah(byNumber+1)-1;
			}
			else // default is page
			{
				fromVerseNo = Quran.verseNo.page(byNumber);
				toVerseNo = Quran.verseNo.page(byNumber+1)-1;
			}

			if (typeof selected == 'object')
			{	
				selectedSorted = [];

				$.each(selected, function(a, quranBy)
				{
					if (!byList[quranBy]) // dont exist
						return;
					
					if (byList[quranBy].type == 'quran')
						selectedSorted.unshift(quranBy);
					else
						selectedSorted.push(quranBy);
				});

				
				for (var i = fromVerseNo; i <= toVerseNo; i++)
				{	
					text[i] = Quran.ayah.fromVerse(i);
					text[i]['list'] = {};
					
					$.each(selectedSorted, function(a, quranBy)
					{						
						if (GlobalQuran.data.quran[quranBy])
						{
							verseObject = GlobalQuran.data.quran[quranBy][i];
							text[i]['list'][quranBy] = GlobalQuran.quran.parse.load(quranBy, verseObject);
							text[i]['list'][quranBy].type = byList[quranBy].type;
						}
						else
						{
							GlobalQuran.quran.remove(quranBy);
							GlobalQuran._gaqPush(['_trackEvent', 'Text', 'Error::`'+quranBy+'` not loaded in text']);
						}
					});
				}
			}
			
			return text;
		},
						
		/**
		 * Gets the list of quran
		 * @param format (optional) text or audio (audio is for list of recitors)
		 * @returns {object}
		 */
		list: function (format)
		{
			if (!format)
				return GlobalQuran.data.quranList;
			else
			{
				list = {};
				$.each(GlobalQuran.data.quranList, function(i, info) {
					if (format == info['format'])
						list[i] = info;
				});
				
				return list;
			}
		},
		
		/**
		 * Gets the Quran list.
		 * @returns {object}
		 */
		quranList: function ()
		{
			var list = GlobalQuran.quran.list('text'),
			newList = {};
			
			
			$.each(list, function (quranByID, by)
			{									
				if (by.type != 'quran')
					return; // continue to next loop
				
				// create object for language, if not created yet
				if (!newList[quranByID])
					newList[quranByID] = by;
				
				// check if language is been selected or not
				newList[quranByID]['selected'] = GlobalQuran.quran.isSelected(quranByID);
			});
			
			return newList;
		},
		
		/**
		 * Gets the Translation language list, list of languages that has the translation text
		 * @returns {object}
		 */
		languageList: function ()
		{
			var list = this.list('text'),
			newList = {};								
			
			
			$.each(list, function (quranByID, by)
			{
				if (by.type == 'quran')
					return; // continue to next loop
				
				// create object for language, if not created yet
				if (!newList[by.language_code])
				{
					newList[by.language_code] = GlobalQuran.language.list()[by.language_code];
					newList[by.language_code]['selected'] = false;
				}
				
				// check if language is been selected or not
				if (!newList[by.language_code]['selected'])
					newList[by.language_code]['selected'] = GlobalQuran.quran.isSelected(quranByID);
			});
			
			return newList;
		},
		
		/**
		 * Gets list of translation, filter by there language code or name
		 * @param langCode
		 * @returns {object}
		 */
		translationList: function (langCode)
		{
			langCode = langCode || '';
			langCode = $.trim(langCode).toLowerCase();
			var list = GlobalQuran.quran.list('text'),
			newList = {},
			searchString;
			
			$.each(list, function (quranByID, by)
			{									
				searchString = by.language_code; // filter by
				searchString = searchString.toLowerCase();
				
				if (by.type == 'quran' || (langCode != '' && searchString.indexOf(langCode) == -1))
					return; // continue to next loop
				
				// create object for language, if not created yet
				if (!newList[quranByID])
					newList[quranByID] = by;				
				
				// check if language is been selected or not
				newList[quranByID]['selected'] = GlobalQuran.quran.isSelected(quranByID);
			});
			
			return newList;
		},
		
		/**
		 * Gets the detail of a specific Quran translation by there quran id
		 * @param quranBy quran id
		 * @returns {object}
		 */
		detail: function (quranBy)
		{
			return this.list()[quranBy];
		},
		
		/**
		 * Gets the Quran text direction. left to right (left) or right to left (right)
		 * @param quranBy quran id
		 * @returns {string} right or left, if no direction was found, then default is left
		 */
		direction: function (quranBy)
		{
			if (by == 'quran-wordbyword')
				return (GlobalQuran.settings.wbwDirection == 'arabic2english') ? 'right' : 'left';
			else if (by == 'quran-kids')
				return (GlobalQuran.settings.wbwDirection == 'arabic2english') ? 'right' : 'left';
			
			var languageCode = this.detail(quranBy).language_code;
			return  (typeof(GlobalQuran.language.list()[languageCode]) !== 'undefined') ? GlobalQuran.language.list()[languageCode].dir : 'left';
		},
		
		/**
		 * list of selected Quran translation & text as object
		 * @returns {object}
		 */
		selected: function ()
		{
			return GlobalQuran.settings.selectedBy;
		},
		
		/**
		 * list of selected Quran translation & text as string
		 * @returns {string} seperated by pipe '+'
		 */
		selectedString: function ()
		{
			var by = [];
			var selected = this.selected();
					
			$.each(selected, function(i, quranBy) {
				by.push(quranBy);	
			});
			
			return by.join('+');
		},
		
		/**
		 * if any of the Quran text as not been cached yet, maybe because it was new selection, then this method will
		 * return the list of quran id(s) seperated by pipe '|' as string, you can use this directly on data url to fetch the missing Quran text.
		 * 
		 * @param dataBy juz, page, surah or complete
		 * @param byNumber number of the dataBy (page, juz or surah)
		 * @returns {string}  
		 */
		selectedStringNotCached: function (dataBy, byNumber)
		{
			var notCached = [],
			selected = this.selected(),
			fromVerseNo, toVerseNo;
			
			dataBy = dataBy || GlobalQuran.config.data.by;
			byNumber = byNumber || GlobalQuran.load._defaultByNumber();
			
			if (dataBy == 'juz')
			{
				fromVerseNo = Quran.verseNo.juz(byNumber);
				toVerseNo = Quran.verseNo.juz(byNumber+1)-1;
			}
			else if (dataBy == 'surah')
			{
				fromVerseNo = Quran.verseNo.surah(byNumber);
				toVerseNo = Quran.verseNo.surah(byNumber+1)-1;
			}
			else if (dataBy == 'complete')
			{
				fromVerseNo = 1;
				toVerseNo   = 6236;
			}
			else // default is page
			{
				fromVerseNo = Quran.verseNo.page(byNumber);
				toVerseNo = Quran.verseNo.page(byNumber+1)-1;
			}
					
			$.each(selected, function(i, quranBy) {

				if (GlobalQuran.data.quran[quranBy])
				{	
					for (i=fromVerseNo; i<=toVerseNo; i++)
					{
						if (!GlobalQuran.data.quran[quranBy][i])
						{
							notCached.push(quranBy);
							break;
						}
					}
				}
				else
					notCached.push(quranBy);	
			});
			
			return notCached.join('|');
		},
		
		/**
		 * reset the selection of quran list back to default selection
		 * @returns {void}
		 */
		reset: function ()
		{
			GlobalQuran.settings.selectedBy = {};
			GlobalQuran.save();
		},
		
		/**
		 * count the selected Quran translation & text
		 * @returns {integer}
		 */
		length: function ()
		{
			if (!GlobalQuran.settings.selectedBy || typeof(GlobalQuran.settings.selectedBy) != 'object')
				return 0;
			
			return Object.keys(GlobalQuran.settings.selectedBy).length;
		},
		
		/**
		 * check if Quran translation or text has been selected
		 * @param quranBy quran id
		 * @returns {Boolean}
		 */
		isSelected: function (quranBy)
		{
			return GlobalQuran.settings.selectedBy[quranBy] ? true : false;
		},
		
		/**
		 * add Quran translation or text to a selection
		 * @param quranBy quran id
		 * @returns {void}
		 */
		add: function (quranBy)
		{
			GlobalQuran.settings.selectedBy[quranBy] = quranBy;
			GlobalQuran.save();
			GlobalQuran.bind.load('after', 'quran.add', window, quranBy);
		},
		
		/**
		 * remove Quran translation or text from a selection
		 * @param quranBy quran id
		 * @returns {void}
		 */
		remove: function (quranBy)
		{
			delete GlobalQuran.settings.selectedBy[quranBy];
			GlobalQuran.save();
			GlobalQuran.bind.load('after', 'quran.remove', window, quranBy);
		},
		
		/**
		 * Quran text parse methods, for parsing the text and formating the text in the way that should be in
		 */
		parse: {
			
			/**
			 * parse the text in the proper required format
			 * @param quranBy quran id
			 * @param object verseObject {surah: 2, ayah: 4, verse: 'verse text here..'}
			 * @returns {string}
			 */
			load: function (quranBy, verseObject)
			{	
				var type = GlobalQuran.data.quranList[quranBy].type;
				
				verseObject.plainText = verseObject.verse;
				
				GlobalQuran.bind.load('before', 'quran.parse', window, quranBy, verseObject);

				if (type == 'quran' && /GlobalQuran-tajweed/.test(quranBy))
					this.parseGlobalQuranTajweed(quranBy, verseObject);
				else if (type == 'quran' && /tajweed/.test(quranBy))
					this.parseTajweed(quranBy, verseObject);
				else if (type == 'quran' && /wordbyword/.test(quranBy))
					this.parseWordByWord(quranBy, verseObject);
				else if (type == 'quran' && /kids/.test(quranBy))
					this.parseKidsWordByWord(quranBy, verseObject);
				else if (type == 'quran')
					this.parseQuran(quranBy, verseObject);
				else
					this.parseTranslation(quranBy, verseObject);
				
				GlobalQuran.bind.load('after', 'quran.parse', window, quranBy, verseObject);
				
				return verseObject;
			},
			
			/**
			 * converts the buck text into bare (no tashkeel) text
			 * @param buck
			 * @returns {string}
			 */
			buck2bare: function(buck)
			{ 
				if(!buck) 
					return null;

			    return buck.replace(/[{`><]/g, 'A').replace(/[\&]/g, 'w').replace(/[}]/g, 'y').replace( /[\FNK#aeiou~\^]/g, '');
			},
			
			/**
			 * converts the buck/bare text into arabic simple text (no tashkeel)
			 * @param buck
			 * @returns {string}
			 */
			buck2arabicSimple: function(buck)
			{
			    if(!buck)
			    	return null;
			    
			    buck = this.buck2bare(buck);
			    
			    var arabic = '', l, letter, found=false;
			    var wordArr = buck.split(''); //split into letters.
			    
			    for(l=0; l<wordArr.length; ++l)
			    {
			        letter = wordArr[l];
			        found = false;
			        
			        for(n=1; n<Quran._data.buck.length; ++n)
			        {
			            if(letter == Quran._data.buck[n])
			            {
			            	arabic += Quran._data.char[n];
			            	found = true;
			                break;
			            }
			        }
			        
			        if (!found)
			        	arabic += letter;
			    }
			    
			    return arabic;
			},
			
			/**
			 * converts the buck/bare text into arabic text
			 * @param buck
			 * @returns {string}
			 */
			buck2arabic: function(buck)
			{
			    if(!buck)
			    	return null;
			    
			    var arabic = '', l, letter, found=false;
			    var wordArr = buck.split(''); //split into letters.
			    
			    for(l=0; l<wordArr.length; ++l)
			    {
			        letter = wordArr[l];
			        found = false;
			        
			        for(n=1; n<Quran._data.buck.length; ++n)
			        {
			            if(letter == Quran._data.buck[n])
			            {
			            	arabic += Quran._data.char[n];
			            	found = true;
			                break;
			            }
			        }
			        
			        if (!found)
			        	arabic += letter;
			    }
			    
			    return arabic;
			},
			
			/**
			 * converts the arabic text into buck text
			 * @param arabic
			 * @returns {string}
			 */
			arabic2buck: function(arabic)
			{
			    if(!arabic)
			    	return null;
			  
			    var buck = '', l, letter, found=false;
			    var wordArr = arabic.split(''); //split into letters.
			      
			    for(l=0; l<wordArr.length; ++l)
			    {
			        letter = wordArr[l];
			        found = false;
			        
			        for(n=1; n<Quran._data.char.length; ++n)
			        {
			            if(letter == Quran._data.char[n]){
			            	buck += Quran._data.buck[n];
			            	found = true;
			                break;
			            }
			        }
			        
			        if (!found)
			        	buck += letter;
			    }
			    
			    return buck;
			},
			
			
			/**
			 * parse the tanzil text and changes signs, alef, meems and tatweel according to the user settings
			 * @param quranBy
			 * @param object verseObject {surah: 2, ayah: 4, verse: 'verse text here..'}
			 * @returns {String}
			 */
			parseQuran: function (quranBy, verseObject)
			{
				
				var text = verseObject.verse;
				
				if (GlobalQuran.settings.showSigns)
			    {
			        text = this.pregReplace(' ([$HIGH_SALA-$HIGH_SEEN])', '<span class="sign">&nbsp;$1</span>', text);
			        text = this.pregReplace('($SAJDAH)', GlobalQuran.settings.ignoreInternalSigns ? '' : '<span class="internal-sign">$1</span>', text);
			        text = this.pregReplace('$RUB_EL_HIZB', GlobalQuran.settings.ignoreInternalSigns ? '' : '<span class="icon juz-sign"></span>', text);
			    }
			    else
			    	text = this.pregReplace('[$HIGH_SALA-$RUB_EL_HIZB$SAJDAH]', '', text);
			    
			    if (!GlobalQuran.settings.showAlef)
			    	text = this.pregReplace('$SUPERSCRIPT_ALEF', '', text);
			    
			    if (GlobalQuran.settings.font == 'me_quran')
			    {
			        text = this.addSpaceTatweel(text);
			        text = this.pregReplace('($LAM$HARAKA*)$TATWEEL$HAMZA_ABOVE($HARAKA*$ALEF)', '$1$HAMZA$2', text);
			    }
			    else if (/uthmani/.test(quranBy))
			    {
			        text = this.removeExtraMeems(text);
			    }
			    
			    text = this.addTatweel(text);
			    text = this.pregReplace('$ALEF$MADDA', '$ALEF_WITH_MADDA_ABOVE', text);
			    
			    if (GlobalQuran.settings.font != 'me_quran')
			    {
			        text = this.pregReplace('($SHADDA)([$KASRA$KASRATAN])', '$2$1', text);
			        text = this.pregReplace('($LAM$HARAKA*$LAM$HARAKA*)($HEH)', '$1$TATWEEL$2', text);
			    }
			    
			    verseObject.verse = text;
			    
			    return text;
			},
			
			/**
			 * parse word by word text
			 * @param quranBy
			 * @param object verseObject {surah: 2, ayah: 4, verse: 'verse text here..'}
			 * @returns {String}
			 */
			parseWordByWord: function (quranBy, verseObject)
			{
				var text = verseObject.verse;
				var words = text.split('$');
				var verse_html = '';
				
				$.each(words, function(i, verse) {
					if (verse)
					{
						var verse = verse.split('|');
					
						if (verse.length <= 1) // if its not proper required array, then dont do anything - because it is probally parsed code already or overright from some other func
						{
							verse_html += verse[0];
							return;
						}
					    
						if (GlobalQuran.settings.wbwDirection == 'english2arabic')
						{
							if (GlobalQuran.settings.wbwMouseOver)
								verse_html += '<span class="word"><span class="en tipsWord" title="'+verse[0]+'">'+verse[1]+'</span></span>';
							else
								verse_html += '<span class="word staticWord"><span class="en first ltr" dir="ltr">'+verse[1]+'</span><span class="ar quran-text second rtl" dir="rtl">'+verse[0]+'</span></span>';
						}
						else
						{
							if (GlobalQuran.settings.wbwMouseOver)
								verse_html += '<span class="word"><span class="ar quran-text tipsWord" title="'+verse[1]+'">'+verse[0]+'</span></span>';
							else
								verse_html += '<span class="word staticWord"><span class="ar quran-text top first rtl" dir="rtl">'+verse[0]+'</span><span class="en second ltr" dir="ltr">'+verse[1]+'</span></span>'; 
						}
					}
				});
				
				verseObject.verse = verse_html;
				
				return verse_html;
			},
			
			/**
			 * parse kids word by word text
			 * @param quranBy
			 * @param object verseObject {surah: 2, ayah: 4, verse: 'verse text here..'}
			 * @returns {String}
			 */
			parseKidsWordByWord: function (quranBy, verseObject)
			{
				var text = verseObject.verse;
				var words = text.split('$');
				var verse_html = '';
				var color = this._color;
				$.each(words, function(i, verse) {
					if (verse)
					{
						var verse = verse.split('|');
						
						if (verse.length <= 1) // if its not proper required array, then dont do anything - because it is probally parsed code already or overright from some other func
						{
							verse_html += verse[0];
							return;
						}					    
					    
						if (GlobalQuran.settings.wbwDirection == 'english2arabic')
						{
							if (GlobalQuran.settings.wbwMouseOver)
								verse_html += '<span class="word wordColor'+color+'"><span class="en tipsWord" title="'+verse[0]+'">'+verse[1]+'</span></span>';
							else
								verse_html += '<span class="word wordColor'+color+' staticWord"><span class="en first ltr" dir="ltr">'+verse[1]+'</span><span class="ar quran-text second rtl" dir="rtl">'+verse[0]+'</span></span>';
						}
						else
						{
							if (GlobalQuran.settings.wbwMouseOver)
								verse_html += '<span class="word wordColor'+color+'"><span class="ar quran-text tipsWord" title="'+verse[1]+'">'+verse[0]+'</span></span>';
							else
								verse_html += '<span class="word wordColor'+color+' staticWord"><span class="ar quran-text top first rtl" dir="rtl">'+verse[0]+'</span><span class="en second ltr" dir="ltr">'+verse[1]+'</span></span>'; 
						}
					}
					
					if (color == 10)
						color = 1;
					++color;
				});
				
				this._color = color;
				
				verseObject.verse = verse_html;
				
				return verse_html;
			},
			_color: 1, // internal use with parse kids word by word
			
			/**
			 * parse the tajweed text
			 * @param quranBy
			 * @param object verseObject {surah: 2, ayah: 4, verse: 'verse text here..'}
			 * @returns {String}
			 */
			parseTajweed: function (quranBy, verseObject)
			{
				var text = verseObject.verse;
				text = text.replace(/\[h/g, '<span class="ham_wasl" title="Hamzat Wasl" alt="').replace(/\[s/g, '<span class="slnt" title="Silent" alt="').replace(/\[l/g, '<span class="slnt" title="Lam Shamsiyyah" alt="').replace(/\[n/g, '<span class="madda_normal" title="Normal Prolongation: 2 Vowels" alt="').replace(/\[p/g, '<span class="madda_permissible" title="Permissible Prolongation: 2, 4, 6 Vowels" alt="').replace(/\[m/g, '<span class="madda_necessary" title="Necessary Prolongation: 6 Vowels" alt="').replace(/\[q/g, '<span class="qlq" title="Qalqalah" alt="').replace(/\[o/g, '<span class="madda_obligatory" title="Obligatory Prolongation: 4-5 Vowels" alt="').replace(/\[c/g, '<span class="ikhf_shfw" title="Ikhfa\' Shafawi - With Meem" alt="').replace(/\[f/g, '<span class="ikhf" title="Ikhfa\'" alt="').replace(/\[w/g, '<span class="idghm_shfw" title="Idgham Shafawi - With Meem" alt="').replace(/\[i/g, '<span class="iqlb" title="Iqlab" alt="').replace(/\[a/g, '<span class="idgh_ghn" title="Idgham - With Ghunnah" alt="').replace(/\[u/g, '<span class="idgh_w_ghn" title="Idgham - Without Ghunnah" alt="').replace(/\[d/g, '<span class="idgh_mus" title="Idgham - Mutajanisayn" alt="').replace(/\[b/g, '<span class="idgh_mus" title="Idgham - Mutaqaribayn" alt="').replace(/\[g/g, '<span class="ghn" title="Ghunnah: 2 Vowels" alt="').replace(/\[/g, '" >').replace(/\]/g, '</span>');
				verseObject.verse = text;
				return text;
			},
			
			/**
			 * parse the GlobalQuran tajweed text
			 * @param quranBy
			 * @param object verseObject {surah: 2, ayah: 4, verse: 'verse text here..'}
			 * @returns {String}
			 */
			parseGlobalQuranTajweed: function (quranBy, verseObject)
			{
				var text = verseObject.verse;
				text = this.buck2arabic(text);
				verseObject.verse = text;
				return text;
				//return text.replace(/\[h/g, '<span class="ham_wasl" title="Hamzat Wasl" alt="').replace(/\[s/g, '<span class="slnt" title="Silent" alt="').replace(/\[l/g, '<span class="slnt" title="Lam Shamsiyyah" alt="').replace(/\[n/g, '<span class="madda_normal" title="Normal Prolongation: 2 Vowels" alt="').replace(/\[p/g, '<span class="madda_permissible" title="Permissible Prolongation: 2, 4, 6 Vowels" alt="').replace(/\[m/g, '<span class="madda_necessary" title="Necessary Prolongation: 6 Vowels" alt="').replace(/\[q/g, '<span class="qlq" title="Qalqalah" alt="').replace(/\[o/g, '<span class="madda_obligatory" title="Obligatory Prolongation: 4-5 Vowels" alt="').replace(/\[c/g, '<span class="ikhf_shfw" title="Ikhfa\' Shafawi - With Meem" alt="').replace(/\[f/g, '<span class="ikhf" title="Ikhfa\'" alt="').replace(/\[w/g, '<span class="idghm_shfw" title="Idgham Shafawi - With Meem" alt="').replace(/\[i/g, '<span class="iqlb" title="Iqlab" alt="').replace(/\[a/g, '<span class="idgh_ghn" title="Idgham - With Ghunnah" alt="').replace(/\[u/g, '<span class="idgh_w_ghn" title="Idgham - Without Ghunnah" alt="').replace(/\[d/g, '<span class="idgh_mus" title="Idgham - Mutajanisayn" alt="').replace(/\[b/g, '<span class="idgh_mus" title="Idgham - Mutaqaribayn" alt="').replace(/\[g/g, '<span class="ghn" title="Ghunnah: 2 Vowels" alt="').replace(/\[/g, '" >').replace(/\]/g, '</span>');
			},
			
			/**
			 * parse the translation text
			 * @param quranBy
			 * @param object verseObject {surah: 2, ayah: 4, verse: 'verse text here..'}
			 * @returns {String}
			 */
			parseTranslation: function (quranBy, verseObject)
			{
				var text = verseObject.verse;
				text = text.replace(/\]\]/g, '$').replace(/ *\[\[[^$]*\$/g, '');
				verseObject.verse = text;
				return text;
			},
		
			/**
			 * method for tanzil text
			 * @param text
			 * @returns {String}
			 */
			addSpaceTatweel: function (text)
			{
			    text = this.pregReplace('($SHADDA|$FATHA)($SUPERSCRIPT_ALEF)', '$1$TATWEEL$2', text);
			    text = this.pregReplace('([$HAMZA$DAL-$ZAIN$WAW][$SHADDA$FATHA]*)$TATWEEL($SUPERSCRIPT_ALEF)', '$1$ZWNJ$2', text);
			    return text;
			},
			
			/**
			 * method for tanzil text
			 * @param text
			 * @returns {String}
			 */
			addTatweel: function (text)
			{
			    text = this.pregReplace('($SHADDA|$FATHA)($SUPERSCRIPT_ALEF)', '$1$TATWEEL$2', text);
			    text = this.pregReplace('([$HAMZA$DAL-$ZAIN$WAW][$SHADDA$FATHA]*)$TATWEEL($SUPERSCRIPT_ALEF)', '$1$2', text);
			    return text;
			},
			
			/**
			 * method for tanzil text
			 * @param text
			 * @returns {String}
			 */
			removeExtraMeems: function (text)
			{
			    text = this.pregReplace('([$FATHATAN$DAMMATAN])$LOW_MEEM', '$1', text);
			    text = this.pregReplace('($KASRATAN)$HIGH_MEEM', '$1', text);
			    return text;
			},
			
			/**
			 * highlight the words based on pattern
			 * @param pattern
			 * @param str
			 * @returns {string}
			 */
			highlight: function (pattern, str)
			{
			    pattern = new RegExp('(' + pattern + ')', 'g');
			    str = str.replace(pattern, '◄$1►');
			    str = str.replace(/◄\s/g, ' ◄').replace(/\s►/g, '► ');
			    str = str.replace(/([^\s]*)◄/g, '◄$1').replace(/►([^\s]*)/g, '$1►');
			    
			    while (/◄[^\s]*◄/.test(str))
			    	str = str.replace(/(◄[^\s]*)◄/g, '$1').replace(/►([^\s]*►)/g, '$1');
			    
			    str = str.replace(/◄/g, '<span class="highlight">').replace(/►/g, '</span>');
			    return str;
			},
			
			/**
			 * internal usage
			 * @param fromExp
			 * @param toExp
			 * @param str
			 * @returns {String}
			 */
			pregReplace: function (fromExp, toExp, str)
			{
			    fromExp = new RegExp(this.regTrans(fromExp), 'g');
			    toExp = this.regTrans(toExp);
			    return str.replace(fromExp, toExp);
			},
			
			/**
			 * internal usage
			 * @param str
			 * @returns {String}
			 */
			regTrans: function (str) {
			    return str.replace(/\$([A-Z_]+)/g, function (s, i, ofs, all) {
			        return Quran._data.UGroups[i] || Quran._data.UChars[i] || '';
			    });
			}
		}
	},
	
	search: {
		
		_keyword: '',
		_position: 0,
		_positionStartVerse: 0,
		_loading: false,
		
		init: function ()
		{
			if (GlobalQuran.settings.selectedSearchBy && typeof(GlobalQuran.settings.selectedSearchBy) == 'object' && Object.keys(GlobalQuran.settings.selectedSearchBy).length > 0)
				return false;
			
			GlobalQuran.settings.selectedSearchBy = {};
			
			by = GlobalQuran.quran.list('text');
			$.each(by, function(quranBy, detail)
			{
				if (detail.type == 'quran')
					GlobalQuran.search.addQuranBy(quranBy);
				else if (GlobalQuran.data.languageCountryList[quranBy.language_code])
					GlobalQuran.search.addQuranBy(quranBy);
			});
		},
		
		isActive: function ()
		{
			return (this._keyword != '');
		},
		
		load: function (keyword, more)
		{
			if (more && !this.isNext())
				return false;
			
			if (/^[0-9]+:?[0-9]*$/.test(keyword))
			{
				verse = keyword.split(':');
				
				if (verse.length > 1)
				{
					GlobalQuran.settings.surah = Quran._fixSurahNum(parseInt(verse['0']));
					GlobalQuran.settings.ayah = Quran._fixAyahNum(GlobalQuran.settings.surah, parseInt(verse['1']));
				}
				else
				{
					verse = Quran.ayah.fromPage(keyword);
					GlobalQuran.settings.surah = verse.surah;
					GlobalQuran.settings.ayah = verse.ayah;
				}
				
				GlobalQuran.player.reset();
				GlobalQuran.load.get(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
				
				return true;
			}				
						
			this._keyword = keyword;
			this._position = more ? this.next() : 0;
			this._loading = true;
			GlobalQuran.search();
		},
		
		loading: function (set)
		{
			if (typeof set != 'undefined')
				this._loading = set;
			
			return this._loading;
		},
			
		stop: function ()
		{
			this._keyword = '';
			this._position = 0;
			GlobalQuran.load.get(GlobalQuran.surah(), GlobalQuran.ayah());
		},
		
		text: function ()
		{
			return GlobalQuran.data.search.quran;
		},
		
		keyword: function ()
		{
			return this._keyword;
		},
		
		position: function ()
		{
			return this._position;
		},
		
		isNext: function ()
		{
			return GlobalQuran.data.search.paging.next ? true : false;
		},
		
		next: function ()
		{
			return GlobalQuran.data.search.paging.next;
		},
		
		timeTook: function ()
		{
			return GlobalQuran.data.search.timeTook;
		},
		
		totalRows: function ()
		{
			return GlobalQuran.data.search.paging.total_rows;
		},
		
		totalShowing: function ()
		{
			return this.isNext() ? this.next() : this.totalRows; 
		},
		
		selected: function ()
		{
			return GlobalQuran.settings.selectedSearchBy;
		},
				
		isSelected: function (quranBy)
		{
			return GlobalQuran.settings.selectedSearchBy[quranBy] ? true : false;
		},
		
		addQuranBy: function (quranBy)
		{
			GlobalQuran.settings.selectedSearchBy[quranBy] = quranBy;
			GlobalQuran.save();
		},
		
		removeQuranBy: function (quranBy)
		{
			delete GlobalQuran.settings.selectedSearchBy[quranBy];
			GlobalQuran.save();
		},
		
		beginVerse: function ()
		{
			return this._positionStartVerse;
		}
	},
	
	/**
	 * recitor object lets you easily get list of recitors and there available bitrate list, while you can selection and removing them from selection
	 */
	recitor: {
		
		/**
		 * initial load
		 * @returns {void}
		 */
		init: function()
		{
			if (GlobalQuran.settings.selectedRecitor && typeof(GlobalQuran.settings.selectedRecitor) == 'object' && this.length() > 0)
			{
				GlobalQuran.recitor.remove('auto'); // incase it was added
				return false;
			}
			
			//backward compatibility
			if (GlobalQuran.settings.selectedRecitor && typeof(GlobalQuran.settings.selectedRecitor) != 'object')
			{
				by = GlobalQuran.settings.selectedRecitor;
				this.reset();
				var selectedArray = by.split('|');
				$.each(selectedArray, function(a, quranBy) {
					if (quranBy != 'auto')
						GlobalQuran.recitor.add(quranBy);					
				});
			}
			else
				this.reset();
		},
		
		/**
		 * load the selected recitor in the player
		 */
		load: function ()
		{
			GlobalQuran.player.load('new');
		},
		
		/**
		 * Gets the list of recitors
		 * @returns {object}
		 */
		list: function()
		{
			return GlobalQuran.quran.list('audio');
		},
		
		/**
		 * Gets the list of available bitrate and there type (mp3 or ogg) for a recitor
		 * @param quranBy quran id
		 * @returns {object}
		 */
		bitrateList: function (quranBy)
		{			
			row = GlobalQuran.quran.detail(quranBy);
			
			if (!row)
				return {'auto': 'mp3,ogg'};
					
			media = row.media;
			media = media ? $.parseJSON(media) : {};
			
			bitrate = {'auto': 'mp3,ogg'};
			$.each(media, function (id, mediaRow) {
				if (bitrate[mediaRow.kbs])
					bitrate[mediaRow.kbs] += ','+mediaRow.type;
				else
					bitrate[mediaRow.kbs] = mediaRow.type;
			});
			
			return bitrate;
		},
		
		/**
		 * Gets the list of selected recitors
		 * @returns {object}
		 */
		selected: function ()
		{
			return GlobalQuran.settings.selectedRecitor;
		},
		
		/**
		 * Gets the selected bitrate for a specific recitor
		 * @param quranBy quran id
		 * @returns {String}
		 */
		selectedKbs: function (quranBy)
		{
			return GlobalQuran.settings.selectedRecitor[quranBy];
		},
		
		/**
		 * reset the selected recitors
		 */
		reset: function ()
		{
			GlobalQuran.settings.selectedRecitor = {};
			GlobalQuran.save();
		},
		
		/**
		 * count the selected recitors
		 * @returns {integer}
		 */
		length: function ()
		{
			if (!GlobalQuran.settings.selectedRecitor || typeof(GlobalQuran.settings.selectedRecitor) != 'object')
				return 0;
			
			return Object.keys(GlobalQuran.settings.selectedRecitor).length;
		},
		
		/**
		 * check if recitor has been selected or not
		 * @param quranBy quran id is a recitor id
		 * @returns {Boolean}
		 */
		isSelected: function (quranBy)
		{			
			return GlobalQuran.settings.selectedRecitor[quranBy] ? true : false;
		},
		
		/**
		 * Add a recitor to a selection
		 * @param quranBy
		 * @param kbs (optional)
		 */
		add: function (quranBy, kbs)
		{	
			if (kbs)
				GlobalQuran.settings.selectedLastRecitorBytes = kbs;
			
			GlobalQuran.settings.selectedRecitor[quranBy] = kbs || 'auto';
			GlobalQuran.save();
			
			GlobalQuran.bind.load('after', 'recitor.add', window, quranBy);
		},
		
		/**
		 * Remove a recitor from a selection
		 * @param quranBy
		 */
		remove: function (quranBy)
		{
			delete GlobalQuran.settings.selectedRecitor[quranBy];
			GlobalQuran.save();
			
			GlobalQuran.bind.load('after', 'recitor.remove', window, quranBy);
		}		
	},
	
	/**
	 * player object - This object controls the media player for playing recitation
	 */
	player: {
		
		/**
		 * _recitor internal method - builds a list of recitor with there available bitrates and formats (mp3 or ogg), which can be played in
		 */
		_recitor: {},
		
		/**
		 * _currentPlayer internal var - pointer for indicating which player is current player
		 */
		_currentPlayer: 0,
		
		/**
		 * _i internal var - if repeat is enable with the limit of time it should repeat, then this method keep on note for how many times it has been repeated  
		 */
		_i: 0,
		
		/**
		 * _iBug internal var - for OS bug, triggers pause two times, need second trigger and ignore first 
		 */
		_iBug: 0,
		
		/**
		 * _delayID internal val - id from setTimeout function, which can be used to destroy the timeout session
		 */
		_delayID: '',
		
		/**
		 * setting - This object is jplayer settings object, you can replace the methods and vars in it, for customization calls, please check on jplayer.org for documentaion on this
		 */
		setting: {
			supplied: 'mp3,oga,m4v', // m4v is required here, but not required on files
			wmode: "window",
			preload: 'auto',
			cssSelectorAncestor: '',
			cssSelector: {
		        play: "",
		        pause: "",
		        stop: "",
		        seekBar: "",
		        playBar: "",
		        mute: "",
		        unmute: "",
		        volumeBar: "",
		        volumeBarValue: "",
		        currentTime: "",
		        duration: ""
		      },
			size: {
			  width:"0px",
			  height: "0px",
			  cssClass: ""
			},
			ready: function (event)
			{
				GlobalQuran.player.load('new'); // already getting load from recitation change
				GlobalQuran.bind.load('after', 'jplayer.ready', event, event);
			},				
			ended: function (event)
			{		
				if (!GlobalQuran.player.isOS())
				{
					if (GlobalQuran.settings.audioDelay && (GlobalQuran.settings.audioDelay > 0 || GlobalQuran.settings.audioDelay != false))
					{
						var delay = (GlobalQuran.settings.audioDelay == 'ayah') ? event.jPlayer.status.duration : GlobalQuran.settings.audioDelay;
						delay = delay * 1000;
						clearTimeout(GlobalQuran.player._delayID);
						GlobalQuran.player._delayID = setTimeout('GlobalQuran.player.next()', delay);
					}
					else
					{					        
						GlobalQuran.player.next();
					}
				}
				
				$('.buffer').css('width', '0%');
				GlobalQuran.bind.load('after', 'jplayer.ended', event, event);
			},
			loadstart: function (event)
			{
				if (GlobalQuran.player.status().seekPercent != 100)
				{
					$(".progressBar").addClass("audioLoading");
				}
				GlobalQuran.bind.load('after', 'jplayer.loadstart', event, event);
			},
			loadeddata: function (event)
			{
				$(".progressBar").removeClass("audioLoading");
				GlobalQuran._gaqPush(['_trackEvent', 'Audio', 'load', event.jPlayer.status.src]);
				GlobalQuran.bind.load('after', 'jplayer.loaddata', event, event);
			},
			seeking: function()
			{
				$(".progressBar").addClass("audioLoading");
				GlobalQuran.bind.load('after', 'jplayer.seeking', event, event);
			},
			seeked: function()
			{
				$(".progressBar").removeClass("audioLoading");
				GlobalQuran.bind.load('after', 'jplayer.seeked', event, event);
			},
			progress: function (event)
			{
				var percent = 0;
				var audio = GlobalQuran.player.data().htmlElement.audio;
				
				if((typeof audio.buffered === "object") && (audio.buffered.length > 0))
				{
					if(audio.duration > 0)
					{
						var bufferTime = 0;
						for(var i = 0; i < audio.buffered.length; i++)
						{
							bufferTime += audio.buffered.end(i) - audio.buffered.start(i);
							 //console.log(i + " | start = " + audio.buffered.start(i) + " | end = " + audio.buffered.end(i) + " | bufferTime = " + bufferTime + " | duration = " + audio.duration);
						}
						percent = 100 * bufferTime / audio.duration;
					} // else the Metadata has not been read yet.
					//console.log("percent = " + percent);
				} else { // Fallback if buffered not supported
					// percent = event.jPlayer.status.seekPercent;
					percent = 100; // Cleans up the inital conditions on all browsers, since seekPercent defaults to 100 when object is undefined.
				}
				
				$('.buffer').css('width', percent+'%');
				
				GlobalQuran.bind.load('after', 'jplayer.progress', event, event);
			},
			play: function (event)
			{
				$(this).jPlayer("pauseOthers"); // pause all players except this one.
				$(".playingTime").text($.jPlayer.convertTime(event.jPlayer.status.currentTime));
				$(".totalTime").text($.jPlayer.convertTime(event.jPlayer.status.duration));
				$(".progressBar").slider("value", event.jPlayer.status.currentPercentRelative);
				GlobalQuran.bind.load('after', 'jplayer.play', event, event);
			},
			pause: function (event)
			{
				var status = GlobalQuran.player.status();

				if (GlobalQuran.player.isOS() && ((GlobalQuran.player._iBug == 1) || (status.duration > 0 && $.jPlayer.convertTime(status.duration) != 'NaN' && $.jPlayer.convertTime(status.duration) != '00:00' && (status.currentTime == 0 || status.currentTime == status.duration))))
				{						
					if (GlobalQuran.player._iBug == 1)
						GlobalQuran.player.load('play');
					else
						GlobalQuran.player.next();
								
					GlobalQuran.player._iBug++;
				}
				
				GlobalQuran.bind.load('after', 'jplayer.pause', event, event);
			},
			timeupdate: function (event)
			{
				$(".playingTime").text($.jPlayer.convertTime(event.jPlayer.status.currentTime));
				$(".totalTime").text($.jPlayer.convertTime(event.jPlayer.status.duration));
				$(".progressBar").slider("value", event.jPlayer.status.currentPercentRelative);
				
				GlobalQuran.bind.load('after', 'jplayer.timeupdate', event, event);
			},
			error: function(event)
			{
				GlobalQuran._gaqPush(['_trackEvent', 'Audio', 'Error::'+event.jPlayer.error.type, event.jPlayer.error]);
				switch(event.jPlayer.error.type)
				{
					case $.jPlayer.error.URL:
						GlobalQuran._gaqPush(['_trackEvent', 'Audio', 'Error::MISSING'+$.jPlayer.error.URL]);
						GlobalQuran.player.next(); // A function you might create to move on to the next media item when an error occurs.
					break;
					case $.jPlayer.error.NO_SOLUTION:
						GlobalQuran._gaqPush(['_trackEvent', 'Audio', 'Error::NO_SOLUTION']);
				    break;
				}
				
				GlobalQuran.bind.load('after', 'jplayer.error', event, event);
			}
		},
		
		/**
		 * initial start up run, setup the player
		 */
		init: function () 
		{
			if (!GlobalQuran.config.player.enable)
				return; // player is off
			
			// set auto play value to playing.
			GlobalQuran.settings.playing = GlobalQuran.config.player.autoPlay;
			
			if (this.isOS()) // pre-settings for iphone/ipod/ipad/mac
			{
				GlobalQuran.settings.playing = false; // cant auto play in iphone
				GlobalQuran.player.preload = -1;  // cant load two instance in iphone
			}
			
			if (GlobalQuran.config.offline)
				GlobalQuran.settings.playing = false; // cant auto play if offline use
			
			this.setup();
		},
		
		/**
		 * setup the player, this function is being called from GlobalQuran.player.init();
		 */
		setup: function ()
		{	
			GlobalQuran.player.setting.volume = GlobalQuran.settings.volume;
			GlobalQuran.player.setting.muted = GlobalQuran.settings.muted;
			
			if (!$(GlobalQuran.config.player.id).length)
			{
				var id = GlobalQuran.config.player.id; id = id.replace(/#/, '');
				$('body').append('<div id="'+id+'"></div>');
			}
			
			$(GlobalQuran.config.player.id).jPlayer(GlobalQuran.player.setting);
			
			if (GlobalQuran.config.player.preload != -1)
			{
				if (!$(GlobalQuran.config.player.id2).length)
				{
					var id = GlobalQuran.config.player.id2; id = id.replace(/#/, '');
					$('body').append('<div id="'+id+'"></div>');
				}
				
				$(GlobalQuran.config.player.id2).jPlayer(GlobalQuran.player.setting);
			}
			
			$( ".progressBar" ).slider({
				range: "min",
				min: 0,
				max: 100,
				animate: true,
				slide: function( event, ui ) {
					GlobalQuran.player.seek(ui.value);
				}
			})
			.bind('mousemove', function(e) {
				var offset = $(this).offset();
				var x = e.pageX - offset.left;
				var w =  $(this).width();
				var percent = 100*x/w;
				var duration = GlobalQuran.player.duration();
				var time = percent * duration / 100;
				$('.progressBar').attr('title', $.jPlayer.convertTime(time));
			})
			.find('.ui-slider-handle').addClass('icon');
			
			$( ".volumeBar" ).slider({
				orientation: "vertical",
				range: "min",
				min: 0,
				max: 100,
				value: GlobalQuran.settings.volume,
				animate: true,
				slide: function( event, ui ) {
					GlobalQuran.player.volume(ui.value);
				}
			})
			.find('.ui-slider-handle').addClass('icon');
			
			$.jPlayer.timeFormat.padMin = false;
		},
		
		/**
		 * check if its OS (iphone, ipad or ipod) or not
		 * @returns {Boolean}
		 */
		isOS: function ()
		{
			if (/Android/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent) || /iPod/i.test(navigator.userAgent))
				return true;
			else
				return false;
		},
		
		/**
		 * load the audio in the player for playing
		 * @param action 'new' resetting player for different ayah/surah/page/juz or 'next' as just keep on moving next ayah/surah/page/juz (if repeat is enable, it will repeat that ayah/surah/page/juz)
		 */
		load: function (action)
		{
			if (!GlobalQuran.config.player.enable)
				return; // player is off
			
			if (action == 'new') // check if its new recitor or new bitrate, before reseting the settings.
			{
				this.reset();
			}

			if (!GlobalQuran.config.player.preload || GlobalQuran.config.player.preload == -1)
			{
				current = this._getFiles('current');
				$(GlobalQuran.config.player.id).jPlayer("setMedia", current);
				
				if (GlobalQuran.config.player.preload != -1)
				{
					next = this._getFiles('next');
					if (!next) // if reached to 6237 
						this.reset();
					else
						$(GlobalQuran.config.player.id2).jPlayer("setMedia", next); // just load only
				}
				
				this._currentPlayer = 1;
			}
			else if (action == 'new' || this._currentPlayer == 0) // this._currentPlayer == 0  needed for prev, but action is needed for new, because there is bug in FF
			{
				current = this._getFiles('current');
				next = this._getFiles('next');
				
				$(GlobalQuran.config.player.id).jPlayer("setMedia", current);
				if (!next) // if reached to 6237 
					this.reset();
				else
					$(GlobalQuran.config.player.id2).jPlayer("setMedia", next);
				
				this._currentPlayer = 1;
			}
			else if (this._currentPlayer == 1) // player 1
			{
				next = this._getFiles('next');
				if (next) // dont need NOT here, like others. also plays player 1 again, if set this.reset();
					$(GlobalQuran.config.player.id).jPlayer("setMedia", next);
				
				this._currentPlayer = 2; // play player 2, while 1 gets load
			}
			else // player 2
			{
				next = this._getFiles('next');
				if (!next) // if reached to 6237 
					this.reset();
				else
					$(GlobalQuran.config.player.id2).jPlayer("setMedia", next);
				
				this._currentPlayer = 1; // play player 1, while 2 gets load
			}
		
			if (GlobalQuran.settings.playing && !GlobalQuran.search.isActive()) // if playing, auto play
				this.play();
		},
		
		/**
		 * internal method
		 * get the current playing player id - mostly for internal usage
		 * @returns {String}
		 */
		_getPlayerID: function ()
		{
			if (this._currentPlayer == 0 || this._currentPlayer == 1)
				return GlobalQuran.config.player.id;
			else
				return GlobalQuran.config.player.id2;
		},
		
		/**
		 * internal method
		 * @param get 'current' or 'next'
		 * @returns {object}
		 */
		_getFiles: function (get)
		{
			get = get || 'current';
			var files = {};
			var rPos = this._recitor.position;
			var rLen = this._recitor.length;
			
			var surah = GlobalQuran.surah();
			var ayah = GlobalQuran.ayah();
			var verse = GlobalQuran.verse();

			if (get == 'next' && rLen > 1 && rPos <= rLen)
			{
				if (rPos == rLen) // reached the last position
					rPos = 1;
				else
					rPos++;
			}
			
			//single recitor
			var recitor = this._recitor['row'+rPos];
			
			if (rPos == 1 && recitor.lastLoad == verse && ((GlobalQuran.config.player.preload == true && this._currentPlayer != 0) || get == 'next')) // increment, sence its same ayah
			{
				verse++;
				next = Quran.ayah.fromVerse(verse);
				surah = next.surah;
				ayah = next.ayah;
			}
			else if (this._currentPlayer == 0 && recitor.lastLoad >= 0) // this is for prev ayahs
				verse = this._recitor['row'+rPos].lastLoad;

			if (surah != 115 && surah != 9 && ayah == 1 && this._recitor.auz && recitor.lastLoad != verse && recitor.lastLoad != 0 && recitor.lastLoad != 1) // play auz
				verse = 0;
			else if (surah != 115 && surah != 9 && surah != 1 && ayah == 1 && recitor.lastLoad != verse && recitor.lastLoad != 1) // play bis
				verse = 1;

			
			if (GlobalQuran.config.player.preload == true || ((!GlobalQuran.config.player.preload || GlobalQuran.config.player.preload == -1) && get != 'next'))
				this._recitor['row'+rPos].lastLoad = verse;
		
			if (verse == 6237)
				return false; // there is no verse 6237
			
			if (recitor.mp3)
				files.mp3 = GlobalQuran.config.api.audioPath+recitor.name+'/mp3/'+recitor.kbs+'kbs/'+verse+'.mp3';
			if (recitor.ogg)
				files.oga = GlobalQuran.config.api.audioPath+recitor.name+'/ogg/'+recitor.kbs+'kbs/'+verse+'.ogg';
						
			return files;
		},
		
		/**
		 * internal method
		 * resets the recitor list and current playing player
		 * @returns {void}
		 */
		_recitorReset: function ()
		{
			if (!GlobalQuran.data.loaded)
				return false; // need to load data first
			
			var recitorArray = GlobalQuran.recitor.selected();
			
			if (GlobalQuran.recitor.length() == 0)
			{
				GlobalQuran.recitor.add('ar.alafasy');
								
				list = GlobalQuran.recitor.list();
				$.each(list, function(by, row)
				{
					if (GlobalQuran.language.selected() != 'ar' && GlobalQuran.language.selected() == row.language_code)
					{
						GlobalQuran.recitor.add(by);
						return true;
					}
				});
			}			
			
			// setting the recitor array
			var recitor = {auz: true, position: 1, length: GlobalQuran.recitor.length()};
			
			recitorArray = GlobalQuran.recitor.selected();

			i = 0;
			$.each(recitorArray, function(recitorName, kbs) {
				++i; // increment on start, because i starts with 0
				recitorInfo = GlobalQuran.player._recitorInfo(recitorName);
				recitor['row'+i] = recitorInfo;
				recitor['row'+i].name = recitorName;
				recitor['row'+i].lastLoad = -1;
				
				if (!recitorInfo.auz) // if one of the recitor dont have auz, then turn off completely.
					recitor.auz = false;
			});

			this._recitor = recitor;
			this._currentPlayer = 0;
		},
		
		/**
		 * internal method
		 * builds the recitor selected bitrate (auto if not found)  
		 * @param recitorName quran id
		 * @returns {object} kbs, mp3, ogg and auz
		 */
		_recitorInfo: function (recitorName)
		{
			if (!recitorName)
				return {
					kbs: '0',
					mp3: false,
					ogg: false,
					auz: false
				};

			row = GlobalQuran.data.quranList[recitorName];
			kbs = GlobalQuran.recitor.selectedKbs(recitorName);
			
			media = row.media;
			media = media ? $.parseJSON(media) : {};
						
			if (kbs == 'auto' || (!media['mp3-'+kbs] && !media['ogg-'+kbs]))
			{
				$.each(media, function(key, mediaRow) {
					kbs = mediaRow.kbs;
					if (GlobalQuran.config.player.autoBitrate == 'low')
						return; // exit loop
				});
			}
			
			if (media['mp3-'+kbs] && media['mp3-'+kbs]['auz'])
				auz = true;
			else if (media['ogg-'+kbs] && media['ogg-'+kbs]['auz'])
				auz = true;
			else
				auz = false;
			
			return {
				kbs: kbs,
				mp3: media['mp3-'+kbs] ? true : false,
				ogg: media['ogg-'+kbs] ? true : false,
				auz: auz
			};
		},
		
		/**
		 * current playing recitor quran id
		 * @returns {String} quran id
		 */
		recitorBy: function ()
		{
			return (this._recitor.length > 0) ? this._recitor['row'+this._recitor.position].name : 'undefined';
		},
		
		/**
		 * current playing recitor bitrate
		 * @returns {String} bitrate
		 */
		recitorKbs: function ()
		{
			return (this._recitor.length > 0) ? this._recitor['row'+this._recitor.position].kbs  : 'undefined';
		},
		
		/**
		 * check if player is playing or is it in pause mode
		 * @returns {Boolean}
		 */
		isPlaying: function ()
		{
			return !this.status().paused;
		},		
		
		/**
		 * check if one should continue playing next audio. false if audio is on pause or stop 
		 * @returns {Boolean}
		 */
		isContinue: function ()
		{
			return GlobalQuran.settings.playing;
		},
		
		/**
		 * reset recitor, player, loop and playing position
		 */
		reset: function ()
		{
			this._recitorReset();
			this._recitor.position = 1;
			this._i = 0;
			this._currentPlayer = 0;
		},
		
		/**
		 * start playing the audio
		 */
		play: function ()
		{	
			if (!this.isPlaying())
				$(this._getPlayerID()).jPlayer('play');
			
			GlobalQuran.settings.playing = true;
			GlobalQuran.save();
			GlobalQuran._gaqPush(['_trackEvent', 'Audio', 'Play', this.recitorBy()]);
			GlobalQuran.bind.load('after', 'player.play');
		},
		
		/**
		 * pause the audio
		 */
		pause: function ()
		{	
			$(this._getPlayerID()).jPlayer('pause');
			GlobalQuran.settings.playing = false;
			GlobalQuran.save();
			GlobalQuran._gaqPush(['_trackEvent', 'Audio', 'Pause', this.recitorBy()]);
			GlobalQuran.bind.load('after', 'player.pause');
		},
		
		/**
		 * completely stop the audio
		 */
		stop: function ()
		{	
			$(this._getPlayerID()).jPlayer('stop');
			this.reset();
			GlobalQuran._gaqPush(['_trackEvent', 'Audio', 'Stop', this.recitorBy()]);
			GlobalQuran.bind.load('after', 'player.stop');
		},
		
		/**
		 * move to next audio - if loop enable then loop the same audio again and also checks the counter for loop
		 */
		next: function ()
		{
			var rPos = this._recitor.position;
			var rLen = this._recitor.length;
			var lastLoad = this._recitor['row'+rPos].lastLoad;
			
			var next = Quran.ayah.next(GlobalQuran.surah(), GlobalQuran.ayah());
			var page = Quran.ayah.page(next.surah, next.ayah);
			var juz  = Quran.ayah.juz(next.surah, next.ayah);
			var surah = next.surah;
			var ayah  =  next.ayah;
			var verse = Quran.verseNo.ayah(next.surah, next.ayah);
			var conf = GlobalQuran.settings;
	
			if (rLen > 1 && rPos != rLen)
			{
				this._recitor.position++;
				this.load('play');
				return;
			}
			else if (GlobalQuran.surah() != 9 && GlobalQuran.ayah() == 1 && (lastLoad == 0 || (GlobalQuran.surah() != 1 && lastLoad == 1))) // for auz,bis and ayah
			{
				if (rLen > 1 && rPos == rLen) // reset to first recitor
					this._recitor.position = 1; 
				
				this.load('play');
				return;
			}
			else if (rLen > 1 && rPos == rLen) // reset to first recitor
				this._recitor.position = 1;
						
			
			if (GlobalQuran.config.player.preload == true && rLen == 1 && lastLoad != verse && lastLoad != 0 && lastLoad != 1) // for single recitor
			{
				this.load('play');
				return;
			}
			
			
			if (conf.repeat && conf.repeatEach == 'ayah' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{			
				// loop through recitors, if more then one recitor is selected.
				if (rLen > 1)
				{
					this.load('play'); // recitor position has been reset above.
					return;
				}
				
				if (this.isOS())
					this.load('play'); // for OS we have to load again
				else
					this.play(); // just play, no load
				this._i++;
				return;
			}
			else if (surah != GlobalQuran.surah() && conf.repeat && conf.repeatEach == 'surah' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{
				if (GlobalQuran.config.player.preload != true)
					this._recitor['row1'].lastLoad = -1;
				GlobalQuran.load.get(GlobalQuran.surah(), 1);
				this._i++;
				return;
			}
			else if (page != GlobalQuran.page() && conf.repeat && conf.repeatEach == 'page' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{
				if (GlobalQuran.config.player.preload != true)
					this._recitor['row1'].lastLoad = -1;
				load = Quran.ayah.fromPage(GlobalQuran.page());
				GlobalQuran.load.get(load.surah, load.ayah);
				this._i++;
				return;
			}
			else if (juz != GlobalQuran.juz() && conf.repeat && conf.repeatEach == 'juz' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{
				if (GlobalQuran.config.player.preload != true)
					this._recitor['row1'].lastLoad = -1;
				load = Quran.ayah.fromJuz(GlobalQuran.juz());
				GlobalQuran.load.get(load.surah, load.ayah);
				this._i++;
				return;
			}
			else
			{	
				if (verse == Quran.verseNo.ayah(GlobalQuran.surah(), GlobalQuran.ayah()) && verse >= 6236)
				{
					if (GlobalQuran.settings.playing && verse >= 6236)
						this.stop();
					return;
				}
				
				GlobalQuran.next('ayah');
				GlobalQuran.bind.load('after', 'load.ayah');
				//GlobalQuran.load.get(surah, ayah);
				this._i = 0;
				return;
			}
		},
		
		/**
		 * move back to previous playing audio
		 */
		prev: function ()
		{
			var rPos = this._recitor.position;
			var rLen = this._recitor.length;
			var lastLoad = this._recitor['row'+rPos].lastLoad;
			
			var prev = Quran.ayah.prev(GlobalQuran.surah(), GlobalQuran.ayah());
			var page = Quran.ayah.page(prev.surah, prev.ayah);
			var juz  = Quran.ayah.juz(prev.surah, prev.ayah);
			var surah = prev.surah;
			var ayah  =  prev.ayah;
			var verse = Quran.verseNo.ayah(prev.surah, prev.ayah);
			var conf = GlobalQuran.settings;
			
			this._currentPlayer = 0;
			this._i = 0;
			
			//FIXME doesnt work properly on preload enabled, so for now we not repeating auz,bis for ayahs on prev
			if (!GlobalQuran.config.player.preload && GlobalQuran.config.player.preload == -1 && GlobalQuran.surah() != 9 && GlobalQuran.ayah() == 1 && ((lastLoad != 0 && this._recitor.auz) || (lastLoad != 1 && !this._recitor.auz) || ((lastLoad == 1 && rPos > 1) || (this._recitor.auz && lastLoad == 0 && rPos > 1)))) //&& (lastLoad == GlobalQuran.verse() || (GlobalQuran.surah() != 1 && lastLoad == 1))) // for auz,bis and ayah
			{
				if (!conf.repeat || (conf.repeat && conf.repeatEach != 'ayah')) // ayah repeat on bis gives problem
				{					
					if (rLen > 1 && rPos == 1) // reset to first recitor
						this._recitor.position = this._recitor.length;
					else if (rLen > 1 && rPos > 1)
						this._recitor.position--;
					
					lastLoad = this._recitor['row'+this._recitor.position].lastLoad; 
					
					if (lastLoad == 1 && this._recitor.auz)
					{
						if (GlobalQuran.config.player.preload == true)
							this._prevRestRecitor(this._recitor.position, verse);						
						this._recitor['row'+this._recitor.position].lastLoad = 0;
					}
					else if (lastLoad == GlobalQuran.verse())
					{
						if (GlobalQuran.config.player.preload == true)
							this._prevRestRecitor(this._recitor.position, this._recitor.auz ? 0 : 1);
						this._recitor['row'+this._recitor.position].lastLoad = 1;
					} 
					else if (lastLoad > GlobalQuran.verse())
					{
						if (GlobalQuran.config.player.preload == true)
							this._prevRestRecitor(this._recitor.position, 1);
						this._recitor['row'+this._recitor.position].lastLoad = GlobalQuran.verse();
					}
					
					this.load('play');
					return;
				}
			}
			
			if (rLen > 1 && rPos > 1)
			{
				this._recitor.position--;
				this._recitor['row'+this._recitor.position].lastLoad = GlobalQuran.verse();
				this.load('play');
				return;
			}
			else if (rLen > 1 && rPos == 1) // reset to first recitor
			{
				this._recitor.position = this._recitor.length;
				this._recitor['row'+this._recitor.position].lastLoad = verse;
			}
						
			if (conf.repeat && conf.repeatEach == 'ayah' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{
				this._recitor['row'+this._recitor.position].lastLoad = GlobalQuran.verse();
				// loop through recitors, if more then one recitor is selected.
				if (rLen > 1)
				{
					this.load('play'); // recitor position has been reset above.
					return;
				}
				this.play(); // just play, no load
				this._i = (this._i > 1) ? this._i-1 : 1;
				return;
			}
			else if (surah != GlobalQuran.surah() && conf.repeat && conf.repeatEach == 'surah' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{
				if (GlobalQuran.surah() == 114)
					verse = 6236;
				else
					verse = Quran.verseNo.surah(GlobalQuran.surah()+1)-1;
				
				this._recitor.position = this._recitor.length;
				this._recitor['row'+this._recitor.position].lastLoad = verse;
				
				load = Quran.ayah.fromVerse(verse);
				GlobalQuran.load.get(load.surah, load.ayah);
				this._i = (this._i > 1) ? this._i-1 : 1;
				return;
			}
			else if (page != GlobalQuran.page() && conf.repeat && conf.repeatEach == 'page' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{
				if (GlobalQuran.page() == 604)
					verse = 6236;
				else
					verse = Quran.verseNo.page(GlobalQuran.page()+1)-1;
				
				this._recitor.position = this._recitor.length;
				this._recitor['row'+this._recitor.position].lastLoad = verse;
				
				load = Quran.ayah.fromVerse(verse);		
				GlobalQuran.load.get(load.surah, load.ayah);
				this._i = (this._i > 1) ? this._i-1 : 1;
				return;
			}
			else if (juz != GlobalQuran.juz() && conf.repeat && conf.repeatEach == 'juz' && (!conf.repeatTimes || conf.repeatTimes >= this._i))
			{
				if (GlobalQuran.juz() == 30)
					verse = 6236;
				else
					verse = Quran.verseNo.juz(GlobalQuran.juz()+1)-1;
				
				this._recitor.position = this._recitor.length;
				this._recitor['row'+this._recitor.position].lastLoad = verse;
				
				load = Quran.ayah.fromVerse(verse);	
				GlobalQuran.load.get(load.surah, load.ayah);
				this._i = (this._i > 1) ? this._i-1 : 1;
				return;
			}
			else
			{
				this._recitor['row'+this._recitor.position].lastLoad = verse;
				
				if (verse == Quran.verseNo.ayah(GlobalQuran.surah(), GlobalQuran.ayah()) && verse == 1)
					return;

				GlobalQuran.load.get(surah, ayah);
				this._i = 0;
				return;
			}
		},
		
		/**
		 * internal method
		 * reset previous playing audio 
		 * @param pos
		 * @param verse
		 */
		_prevRestRecitor: function (pos, verse)
		{
			for ( var i = 1; i < pos; i++)
            {
				this._recitor['row'+i].lastLoad = verse;
            }
		},
		
		/**
		 * seek to new position in audio
		 * @param number
		 * @param usingSeconds if set to true, then number should be seconds / else percentage
		 */
		seek: function (number, usingSeconds)
		{
			number = number || 0;
			usingSeconds = usingSeconds || false;
			
			if (usingSeconds == false)
			{
				$(this._getPlayerID()).jPlayer('playHead', number);
			}
			else
			{
				if (this.isPlaying())
					$(this._getPlayerID()).jPlayer('play', number);
				else
					$(this._getPlayerID()).jPlayer('pause', number);				
			}
			
			GlobalQuran.bind.load('after', 'player.seek', window, number, usingSeconds);
		},
		
		/**
		 * increase or decrease the volume
		 * @param volume
		 */
		volume: function (volume)
		{
			$(GlobalQuran.config.player.id).jPlayer('volume', volume);
			$(GlobalQuran.config.player.id2).jPlayer('volume', volume);
			GlobalQuran.settings.volume = volume;
			GlobalQuran.save();
			
			GlobalQuran.bind.load('after', 'player.volume', window, volume);
		},
		
		/**
		 * mute the volume
		 */
		mute: function ()
		{			
			$(GlobalQuran.config.player.id).jPlayer('mute');
			$(GlobalQuran.config.player.id2).jPlayer('mute');
			GlobalQuran.settings.muted = true;
			GlobalQuran.save();
			
			GlobalQuran.bind.load('after', 'player.muted');
		},
		
		/**
		 * unmute the volume
		 */
		unmute: function ()
		{
			$(GlobalQuran.config.player.id).jPlayer('unmute');
			$(GlobalQuran.config.player.id2).jPlayer('unmute');
			GlobalQuran.settings.muted = false;
			GlobalQuran.save();
			
			GlobalQuran.bind.load('after', 'player.unmuted');
		},
		
		/**
		 * enable and disable the repeating audio
		 * @param bool
		 */
		repeat: function (bool)
		{
			GlobalQuran.settings.repeat = bool;
			GlobalQuran.save();
			GlobalQuran.bind.load('after', 'player.repeat', window, bool);
		},
		
		/**
		 * repeat each ayah, surah, page or juz
		 * @param repeat default is ayah
		 */
		repeatEach: function (repeat)
		{
			GlobalQuran.settings.repeatEach = repeat;
			GlobalQuran.save();
			GlobalQuran.bind.load('after', 'player.repeatEach', window, repeat);
		},
		
		/**
		 * repeat how many times?
		 * @param times default is 1
		 */
		repeatTimes: function (times)
		{
			GlobalQuran.settings.repeatTimes = times;
			GlobalQuran.save();
			GlobalQuran.bind.load('after', 'player.repeatTimes', window, times);
		},
		
		/**
		 * pause number of seconds before playing again
		 * @param delay number of seconds 1 for 1 second, 60 for 60 seconds - if set to 'ayah', then it will pause for current playing ayah seconds, before moving to next
		 */
		audioDelay: function (delay)
		{
			GlobalQuran.settings.audioDelay = delay;
			GlobalQuran.save();
			GlobalQuran.bind.load('after', 'player.audioDelay', window, delay);
		},
		
		/**
		 * duration of current playing audio
		 * @returns {integer}
		 */
		duration: function ()
		{
			return this.status().duration;
		},
		
		/**
		 * gets how much audio is already been played
		 * @returns {integer}
		 */
		playingTime: function ()
		{
			return this.status().currentTime;
		},
		
		/**
		 * jplayer status of current player or the given player id 
		 * @param playerID (optional)
		 * @returns {object}
		 */
		status: function (playerID)
		{
			var playerID = playerID || this._getPlayerID();
			return $(playerID).data("jPlayer") ? $(playerID).data("jPlayer").status : false;
		},
		
		/**
		 * jplayer data of current player or the given player id
		 * @param playerID (optional)
		 * @returns
		 */
		data: function (playerID)
		{
			var playerID = playerID || this._getPlayerID();
			return $(playerID).data("jPlayer");
		},
		
		/**
		 * destroy the player's
		 * @param playerID (optional) default will destroy both players
		 */
		destroy: function (playerID)
		{
			if (playerID)			
				$(playerID).jPlayer("destroy").remove();
			else
			{
				if ($(GlobalQuran.config.player.id).length)
					$(GlobalQuran.config.player.id).jPlayer("destroy").remove();
				if ($(GlobalQuran.config.player.id2).length)
					$(GlobalQuran.config.player.id2).jPlayer("destroy").remove();
			}
		}
	},
	
	/**
	 * font object holds the methods to change around the quran font text, after running the method make sure you run GlobalQuran.quran.load() for seeing the effect take pace
	 */
	font: {
		
		/**
		 * setting the font family
		 * @param fontFamily
		 */
		setFamily: function (fontFamily)
		{
			GlobalQuran.settings.font = fontFamily;
			GlobalQuran.save();
			
			GlobalQuran.bind.load('after', 'font.family', window, fontFamily);
		},
		
		/**
		 * set font size smaller, small, medium, large, larger, larger-x and larger-xx
		 * @param size
		 */
		setSize: function (size)
		{
			GlobalQuran.settings.fontSize = size;
			GlobalQuran.save();
			
			GlobalQuran.bind.load('after', 'font.size', window, size);
		},
		
		/**
		 * get font family for a quran text by there quran id
		 * @param quranBy quran id
		 * @returns {String}
		 */
		getFamily: function (quranBy)
		{			
			if (GlobalQuran.settings.font == 'auto' && GlobalQuran.quran.isSelected(quranBy) && GlobalQuran.quran.detail(quranBy).type == 'quran')
			{
				if (/mac/i.test(navigator.platform)) // isMac
						return 'Scheherazade';
				if (/uthmani/.test(quranBy)) // isUthamani
					return 'me_quran';
				else if (/tajweed/.test(quranBy)) // isTajweed
					return '_PDMS_Saleem_QuranFont';
				else
					return 'KFGlobalQuranPC Uthman Taha Naskh';
			}
			
			return (GlobalQuran.settings.font != 'auto') ? GlobalQuran.settings.font : '';			
		},
		
		/**
		 * get the font size
		 * @returns {String}
		 */
		getSize: function ()
		{
			return GlobalQuran.settings.fontSize;
		}
	},
	
	/**
	 * if argument was empty, then it will just return the current juz number, else it will set it.
	 * @param juz (optional)
	 * @returns {mixed} return current juz number if argument was not set (if set and current page is not same page, then it will return false and run GlobalQuran.load)
	 */
	juz: function (juz)
	{		
		if (juz)
		{
			juz = Quran._fixJuzNum(juz);
			var verse = Quran.ayah.fromJuz(juz);
			
			if (!this._isCurrent(surah, ayah))
			{
				this.load.get(verse.surah, verse.ayah);
				return false;
			}
			else
			{		
				this.settings.surah = verse.surah;
				this.settings.ayah = verse.ayah;
				this.settings.page  = Quran.ayah.page(verse.surah, verse.ayah);
				this.save();
				this.url.update();
				this.player.reset();
				GlobalQuran.bind.load('after', 'load.ayah');
				
			}
		}
		
		return this.settings.juz;
	},
	
	/**
	 * if argument was empty, then it will just return the current page number, else it will set it.
	 * @param page (optional)
	 * @returns {mixed} return current page number if argument was not set (if set and current page is not same page, then it will return false and run GlobalQuran.load)
	 */
	page: function (page)
	{		
		if (page)
		{
			page = Quran._fixPageNum(page);
			var verse = Quran.ayah.fromPage(page);

			if (!this._isCurrent(surah, ayah))
			{
				this.player.reset();
				this.load.get(verse.surah, verse.ayah);
				return false;
			}
			else
			{		
				this.settings.surah = verse.surah;
				this.settings.ayah = verse.ayah;
				this.settings.juz  = Quran.ayah.juz(verse.surah, verse.ayah);
				this.save();
				this.url.update();
				this.player.reset();
				GlobalQuran.bind.load('after', 'load.ayah');
				
			}
		}
		
		return this.settings.page;
	},
	
	/**
	 * if argument was empty, then it will just return the current surah number, else it will set it.
	 * @param surah (optional)
	 * @returns {mixed} return current surah number if argument was not set (if set and current page is not same page, then it will return false and run GlobalQuran.load)
	 */
	surah: function (surah)
	{		
		if (surah)
		{
			surah = Quran._fixSurahNum(surah);
			var ayah = 1;
			
			if (!this._isCurrent(surah, ayah))
			{		
				this.load.get(surah, ayah);
				return false;
			}
			else
			{		
				this.settings.ayah = 1;
				this.player.reset();
				GlobalQuran.bind.load('after', 'load.ayah');
			}
		}
		
		return this.settings.surah;
	},
	
	/**
	 * if argument was empty, then it will just return the current ayah number, else it will set it.
	 * @param surah (optional)
	 * @param ayah (optional)
	 * @returns {mixed} return current ayah number if argument was not set (if set and current page is not same page, then it will return false and run GlobalQuran.load)
	 */
	ayah: function (surah, ayah)
	{		
		if (surah)
		{
			surah = Quran._fixSurahNum(surah);
			ayah  = Quran._fixAyahNum(surah, ayah);
			
			if (!this._isCurrent(surah, ayah))
			{
				this.load.get(surah, ayah);
				return false;
			}
			else
			{
				this.settings.surah = surah;
				this.settings.ayah = ayah;
				this.player.load('new');
				this.save();
				this.url.update();
				GlobalQuran.bind.load('after', 'load.ayah');
			}
		}
		
		return this.settings.ayah;
	},
	
	/**
	 * check if current page, juz, surah is same as existing, or is it different. checks with GlobalQuran.config.data.by
	 * @param surah
	 * @param ayah
	 * @returns {Boolean}
	 */
	_isCurrent: function (surah, ayah)
	{
		if (GlobalQuran.config.data.by == 'juz')
			return (this.juz() == Quran.ayah.juz(surah, ayah));
		else if (GlobalQuran.config.data.by == 'surah')
			return (this.surah() == surah);
		else if (GlobalQuran.config.data.by == 'complete')
			return true;
		else // page
			return (this.page() == Quran.ayah.page(surah, ayah));
	},
	
	/**
	 * gets the current verse number or verse number for the passed surah & ayah.
	 * @param surah (optional)
	 * @param ayah  (optional)
	 * @returns {String}
	 */
	verse: function (surah, ayah)
	{
		surah = surah ? Quran._fixSurahNum(surah) : this.settings.surah;
		ayah  = ayah ? Quran._fixAyahNum(surah, ayah) : this.settings.ayah;
	
		return Quran.verseNo.ayah(surah, ayah);
	},
	
	/**
	 * move to next page, surah or juz. depend what is passed by moveBy or set in GlobalQuran.config.data.by
	 * 
	 * @param moveBy (optional)
	 * @returns void
	 */
	next: function (moveBy)
	{
		moveBy = moveBy || GlobalQuran.config.data.by;
		
		if (moveBy == 'ayah')
			return this.load._nextAyah();
		else if (moveBy == 'juz')
			return this.load._nextJuz();
		else if (moveBy == 'surah')
			return this.load._nextSurah();
		else 
			return this.load._nextPage();
	},
	
	/**
	 * move to previous page, surah or juz. depend what is passed by moveBy or set in GlobalQuran.config.data.by
	 * 
	 * @param moveBy (optional)
	 * @returns void
	 */
	prev: function (moveBy)
	{
		moveBy = moveBy || GlobalQuran.config.data.by;
		
		if (moveBy == 'ayah')
			return this.load._prevAyah();
		else if (moveBy == 'juz')
			return this.load._prevJuz();
		else if (moveBy == 'surah')
			return this.load._prevSurah();
		else 
			return this.load._prevPage();
	},
	
	/**
	 * gets the list of surah&ayah numbers for a current page / juz or surah 
	 * 
	 * @param listBy (optional)
	 * @param byNumber (optional)
	 * @returns {object}
	 */
	ayahList: function (listBy, byNumber)
	{		
		listBy = listBy || GlobalQuran.config.data.by;
		byNumber = byNumber || this._defaultByNumber();
		
		// if not searching and if data is request, then build ayahList
		if (listBy == 'juz')
			return Quran.ayah.listFromJuz(byNumber);
		else if (listBy == 'surah')
			return Quran.ayah.listFromSurah(byNumber);
		else if (listBy == 'complete')
			return {}; // ayah list of complete quran, not needed. This is useful for preload.
		else
			return Quran.ayah.listFromPage(byNumber);
	},
	
	/**
	 * save the settings
	 */
	save: function () {
		this._cookieSave(); // save settings
		GlobalQuran.bind.load('after', 'save');
	},
	
	/**
	 * all the methods to load the data from GlobalQuran api
	 */
	load: {
		
		/**
		 * call this method for first time loading the data, it will pull all the required data set from the api
		 * @param callback
		 */
		onStart: function (callback)
		{	
			GlobalQuran.bind.load('before', 'start');
			GlobalQuran.bind.load('before', 'load');
			
			GlobalQuran._cookieRead();
			GlobalQuran.url.load();
		
			this.dataOnly(GlobalQuran.config.data.by, this._defaultByNumber(), function (response)
			{
				GlobalQuran.player.init(); // player
				
				if (!GlobalQuran.quran.length() && typeof(response) == 'object' && response.quran)
				{
					$.each(response.quran, function(defaultQuranBy, ignore) {
						GlobalQuran.quran.add(defaultQuranBy);
					});
					
					this.url.save(); // cause defaultQuranBy set here
				}
				
				var isSuccess = (typeof(response) == 'object');	
												
				if (callback)
					callback.call(window, isSuccess);
				
				GlobalQuran.bind.load('after', 'load', window, isSuccess);
				GlobalQuran.bind.load('after', 'load.ayah');
				
				GlobalQuran.bind.load('after', 'start', window, isSuccess);
				
				GlobalQuran.load.preload();
				
			}, true);
		},
		
		/**
		 * loads the data by surah and ayah number and saves the position in bookmark
		 * [Note] if GlobalQuran.config.data.enable is set to false, then it will bookmark the locaiton only and run the callback
		 * 
		 * @param surah
		 * @param ayah
		 * @param callback
		 * @returns {Boolean}
		 */
		get: function (surah, ayah, callback)
		{
			if (!GlobalQuran.config.data.enable)
				return false;
			
			GlobalQuran.bind.load('before', 'load');
			
			GlobalQuran.settings.surah = surah || 1;
			GlobalQuran.settings.ayah = ayah || 1;
			GlobalQuran.settings.juz = Quran.ayah.juz(surah, ayah);
			GlobalQuran.settings.page = Quran.ayah.page(surah, ayah);
			GlobalQuran.data.ayahList =  Quran.ayah.listFromPage(GlobalQuran.settings.page);
			GlobalQuran.search._keyword = false; // disable search
			GlobalQuran.url.save();
			GlobalQuran.player.reset();
			
			GlobalQuran.save();
			GlobalQuran._gaqPush(['_trackPageview', GlobalQuran.url.page()]);
			
			var combineCallback = function (response)
			{
				var isSuccess = (typeof(response) == 'object');	
				
				GlobalQuran.bind.load('after', 'load', window, isSuccess);
				
				if (callback)
					callback.call(window, isSuccess);
				
				GlobalQuran.bind.load('after', 'load.ayah');
				
				GlobalQuran.player.load('play');
				
				GlobalQuran.load.preload();
			};
			
			
			if (!GlobalQuran.config.data.enable) // if data is not enable, then just run the callbacks only
				combineCallback.call(window, true);
			else
				this.dataOnly(GlobalQuran.config.data.by, this._defaultByNumber(), combineCallback);
		},
		
		/**
		 * loads the data only, does not save the position in the bookmark.
		 * 
		 * @param dataBy page, juz, surah or complete
		 * @param byNumber page number, juz number or surah number. for complete data, set 0.
		 * @param callback
		 * @param loadAll if set to true, then load all other (quran list, translation list, recitor list, languages...) data too with this request.
		 * @returns {Boolean}
		 */
		dataOnly: function (dataBy, byNumber, callback, loadAll)
		{	
			if (!GlobalQuran.config.data.enable)
				return false;
			
			// if its offline mode
			if (GlobalQuran.config.offline)
			{
				this.offline(callback, loadAll);
				return true;
			}
			
			if (!dataBy || !byNumber)
				return false;
			
			var notCachedQuranID = true,
			url = GlobalQuran.config.api.url;			
			
			if (loadAll)
				url += 'all/';
			
			// if not searching and if data is request, then build ayahList
			if (dataBy == 'juz')
			{
				GlobalQuran.data.ayahList = Quran.ayah.listFromJuz(byNumber);
				url += 'juz/'+byNumber;
			}
			else if (dataBy == 'surah')
			{
				GlobalQuran.data.ayahList = Quran.ayah.listFromSurah(byNumber);
				url += 'surah/'+byNumber;
			}
			else if (dataBy == 'complete')
			{
				GlobalQuran.data.ayahList = {}; // ayah list of complete quran, not needed. This is useful for preload.
				url += 'complete';
			}
			else
			{
				GlobalQuran.data.ayahList = Quran.ayah.listFromPage(byNumber);
				url += 'page/'+byNumber;
			}
			
			notCachedQuranID = GlobalQuran.quran.selectedStringNotCached(dataBy, byNumber); //TODO check cache data with the requested data set
			url += '/'+notCachedQuranID;
			
			/*if (this.settings.selectedLanguage) // TODO language selection here
			requestUrl += '/'+this.settings.selectedLanguage;*/
			
			if (!GlobalQuran.config.data.enable) // if no data need to be output, then run request only once
				notCachedQuranID = false;

			if (notCachedQuranID || loadAll)
			{
				// not in the cache
				this._getJSON(url, callback);
			}
			else
			{
				// data already exist, just call callback
				if (callback)
					callback.call(window, {});
			}
			
			return false;
		},
		
		/**
		 * internal usage for fetching the data from the api and adding 
		 * @param url
		 * @param callback
		 */
		_getJSON: function (url, callback)
		{
			var combineCallback = function (response) {
				GlobalQuran.load._addData(response);
				if (callback)
					callback.call(window, response);
			};
			
			$jsonp = ($.support.cors && !/complete/.test(url)) ? '' : '.jsonp?callback=?';
			$.ajaxSetup({
				cache: true, 
				jsonpCallback: 'quranData',
				'error': function(XMLHttpRequest, textStatus, errorThrown)
				{   
					GlobalQuran.bind.load('after', 'load.error', window, XMLHttpRequest, textStatus, errorThrown);
					GlobalQuran._gaqPush(['_trackEvent', 'Error', 'Oopss!!!, Something went wrong.']);
				}
			});

			$.getJSON(url+$jsonp, combineCallback);
		},
		
		/**
		 * internal method
		 * save data after the request comes back from the server
		 * 
		 * @param response json object from server
		 */
		_addData: function (response)
		{
			if (typeof(response) == 'object')			
			{
				GlobalQuran.data = $.extend(true, GlobalQuran.data, response);
				GlobalQuran.data.loaded = true;
			}			
			
			if (response.languageSelected)
				GlobalQuran.settings.selectedLanguage = response.languageSelected;
		},
		
		/**
		 * refresh the current page with new settings, if any set.
		 * 
		 * @param callback (optional)
		 */
		refresh: function (callback)
		{
			this.get(GlobalQuran.surah(), GlobalQuran.ayah(), callback);
		},
		
		/**
		 * loads data from the local folder of the application, if application is installed on device / desktop.
		 * 
		 * @param callback
		 * @param loadAll if set to true, then load all other (quran list, translation list, recitor list, languages...) data too with this request.
		 * @returns {Boolean}
		 */
		offline: function (callback, loadAll)
		{
			var selected = GlobalQuran.quran.selected();
			
			$.each(selected, function(i, quranBy)
			{
				if (!$('#'+quranBy).length)
				{
					quranFile = document.createElement('script');
					quranFile.setAttribute('type', 'text/javascript');
					quranFile.setAttribute('src', 'data/'+quranBy+'.js');
					quranFile.setAttribute('id', quranBy);
					
					if (!loadAll && typeof callback == 'function')
						quranFile.onload = function () {callback.call(window, true)};
										
					document.getElementsByTagName('head')[0].appendChild(quranFile);
				}	
			});
			
			
			if (loadAll)
			{
				quranList = document.createElement('script');
				quranList.setAttribute('type', 'text/javascript');
				quranList.setAttribute('src', 'data/all.js');
				quranList.setAttribute('id', 'js-list');
				
				if (typeof callback == 'function')
					quranList.onload = function () {callback.call(window, true)};;
				
				document.getElementsByTagName('head')[0].appendChild(quranList);
			}
		},
		
		/**
		 * preloading data according to the GlobalQuran.config.data.preload settings.
		 */
		preload: function ()
		{
			if (!GlobalQuran.config.data.preload) 
				return; // disabled
			
			var loadBy, byNumber;
			
			if (GlobalQuran.config.data.preload === true)
				loadBy = GlobalQuran.config.data.by;
			else
				loadBy = GlobalQuran.config.data.preload;
			
			if (loadBy == 'complete')
				byNumber = 1;
			else if (loadBy == 'juz')
				byNumber = (loadBy == GlobalQuran.config.data.by) ? Quran._fixJuzNum(GlobalQuran.juz()+1) : GlobalQuran.juz();
			else if (loadBy == 'surah')
				byNumber = (loadBy == GlobalQuran.config.data.by) ? Quran._fixSurahNum(GlobalQuran.surah()+1) : GlobalQuran.surah();
			else
				byNumber = (loadBy == GlobalQuran.config.data.by) ? Quran._fixPageNum(GlobalQuran.page()+1) : GlobalQuran.page();
			
				
			GlobalQuran.bind.load('before', 'preload');
			
			this.dataOnly(loadBy, byNumber, function (response) {
				GlobalQuran.bind.load('after', 'preload', window, response);
			});
		},
		
		search: function (callback)
		{
			var url = GlobalQuran.config.api.url;	
			GlobalQuran.search.loading(true);
			
			url += 'search/'+GlobalQuran.search.keyword()+'/'+GlobalQuran.search.position();
			
			if (GlobalQuran.search.position() == 0)
				GlobalQuran.url.save();
		
			GlobalQuran.save();
			GlobalQuran._gaqPush(['_trackPageview', GlobalQuran.url.page()]);
				
			this._getJSON(url, function(response) {			
				GlobalQuran.search.init();
				GlobalQuran.search.loading(false);
				if (GlobalQuran.search.totalRows() > 0)
				{
					for (var verseNo in response.search.quran)
					{
						GlobalQuran.search._positionStartVerse = verseNo;
						break;
					}
				}
				
				if (callback)
					callback.call(window, response);
			});
		},
		
		/**
		 * internal usage only
		 * @returns {integer}
		 */
		_defaultByNumber: function ()
		{
			var byNumber;
			
			if (GlobalQuran.config.data.by == 'juz')
				byNumber = Quran._fixJuzNum(GlobalQuran.settings.juz);
			else if (GlobalQuran.config.data.by == 'surah')
				byNumber = Quran._fixSurahNum(GlobalQuran.settings.surah);
			else
				byNumber = Quran._fixPageNum(GlobalQuran.settings.page);
		
			return byNumber;
		},
		
		/**
		 * Move the pointer to next ayah, if the ayah dont exist, it will trigger load function to get next page and show next ayah of it.
		 * @returns {mixed} object of Quran.ayah.next() if ayah already exist on the page, false if next ayah dont exist on page
		 */
		_nextAyah: function ()
		{
			var verse = Quran.ayah.next(GlobalQuran.surah(), GlobalQuran.ayah());
			
			// if player is playing, then move to next ayah using player next
			if (GlobalQuran.player.isContinue())
			{
				GlobalQuran.player.next();
				return verse;
			}
			
			if (verse.surah == GlobalQuran.surah() && verse.ayah == GlobalQuran.ayah())
				return verse; // ayah already exist on the page
		
			GlobalQuran.settings.surah = verse.surah;
			GlobalQuran.settings.ayah = verse.ayah;
					
			if (GlobalQuran.ayah(verse.surah, verse.ayah))
				return verse; // ayah already exist on the page
			else
				return false;	
		},
		
		/**
		 * Move the pointer to previous ayah, if the ayah dont exist, it will trigger load function to get previous page and show previous ayah of it.
		 * @returns {mixed} object of Quran.ayah.previous() if ayah already exist on the page, false if previous ayah dont exist on page
		 */
		_prevAyah: function ()
		{
			var verse = Quran.ayah.prev(GlobalQuran.surah(), GlobalQuran.ayah());
			
			// if player is playing, then move to previous ayah using player previous
			if (GlobalQuran.player.isContinue())
			{
				GlobalQuran.player.prev();
				return verse;
			}
			
			if (verse.surah == GlobalQuran.surah() && verse.ayah == GlobalQuran.ayah())
				return verse; // ayah already exist on the page

			GlobalQuran.settings.surah = verse.surah;
			GlobalQuran.settings.ayah = verse.ayah;
					
			if (GlobalQuran.ayah(verse.surah, verse.ayah))
				return verse; // ayah already exist on the page
			else
				return false;
		},
		
		/**
		 * Move to next page
		 * @returns {void}
		 */
		_nextPage: function ()
		{
			return GlobalQuran.page(GlobalQuran.page()+1);
		},
		
		/**
		 * Move to previous page
		 * @returns {void}
		 */
		_prevPage: function ()
		{
			return GlobalQuran.page(GlobalQuran.page()-1);
		},
		
		/**
		 * Move to next surah
		 * @returns {void}
		 */
		_nextSurah: function () {
			return GlobalQuran.surah(GlobalQuran.surah()+1);
		},
		
		/**
		 * Move to previous surah
		 * @returns {void}
		 */
		_prevSurah: function () {
			return GlobalQuran.surah(GlobalQuran.surah()-1);
		},

		/**
		 * Move to next juz
		 * @returns {void}
		 */
		_nextJuz: function () {
			return GlobalQuran.juz(GlobalQuran.juz()+1);
		},
		
		/**
		 * Move to previous juz
		 * @returns {void}
		 */
		_prevJuz: function () {
			return GlobalQuran.juz(GlobalQuran.juz()-1);
		}
	},
	
	/**
	 * url object can be used to retrive or set the new url for the page
	 */
	url: {
		
		/**
		 * internal check, if the load was run from bind function. it will avoid to overright the url again (good for back and forth button)
		 */
		_is_from_load: false,
		
		/**
		 * loads the url from the hash
		 * @returns {Boolean}
		 */
		load: function ()
		{
			var path, count;
					
			if (this.is_html5())
			{
				path = location.pathname;
				
				if (GlobalQuran.config.url.startWith != '/')
				{
					path = window.location+'';
					path = path.split(GlobalQuran.config.url.startWith);
					
					if (path[1] !== undefined)
						path = path[1];
					else
						path = location.pathname;
				}				
			}
			else
			{
				path = window.location.hash;
			}
			
			path = path.split('/');
			count = path.length;

			if (count > 2 && path['1'] == 'search')
			{
				if (GlobalQuran.search.keyword() == path['2'] && GlobalQuran.search.position() == 0)
					return false;
				
				GlobalQuran.search._keyword = path['2'];
				GlobalQuran.search._position = 0;
				
				return true;
			}
			else if (count > 2 && GlobalQuran.settings.page != path['2'])
			{
				GlobalQuran.quran.reset();
				selectedBy = path['1'].split('+');

				$.each (selectedBy, function(i, quranBy)
				{
					GlobalQuran.quran.add(quranBy);
				});
				
				verse = path['2'].split(':');
				
				if (verse.length > 1)
				{
					GlobalQuran.settings.surah = Quran._fixSurahNum(parseInt(verse['0']));
					GlobalQuran.settings.ayah = Quran._fixAyahNum(GlobalQuran.settings.surah, parseInt(verse['1']));
				}
				else
				{
					verse = Quran.ayah.fromPage(path['2']);
					GlobalQuran.settings.surah = verse.surah;
					GlobalQuran.settings.ayah = verse.ayah;
				}
				
				GlobalQuran.settings.page = Quran.ayah.page(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
				GlobalQuran.settings.juz  = Quran.ayah.juz(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
				
				GlobalQuran.player.reset();
			
				return true;
			}
			else if (/^[0-9]+:?[0-9]*$/.test(path['1']))
			{
				verse = path['1'].split(':');
				
				if (verse.length > 1)
				{
					GlobalQuran.settings.surah = Quran._fixSurahNum(parseInt(verse['0']));
					GlobalQuran.settings.ayah = Quran._fixAyahNum(GlobalQuran.settings.surah, parseInt(verse['1']));
				}
				else
				{
					verse = Quran.ayah.fromPage(path['1']);
					GlobalQuran.settings.surah = verse.surah;
					GlobalQuran.settings.ayah = verse.ayah;
				}
				
				GlobalQuran.settings.page = Quran.ayah.page(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
				GlobalQuran.settings.juz  = Quran.ayah.juz(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
				
				GlobalQuran.player.reset();
			
				return true;
			}
			
			return false;
		},
		
		/**
		 * save new url in the hash
		 */
		save: function ()
		{
			if (!GlobalQuran.config.url.enable) // disabled
				return;
			
			var url;
			
			if (GlobalQuran.url._is_from_load)
			{
				GlobalQuran.url._is_from_load = false;
				return;
			}
			
			if (GlobalQuran.config.url.by == 'page' || !this.is_html5()) //TODO by page, surah, juz!!!
				url = this.page();
			else
				url = this.ayah();
			
			if (this.is_html5())
				history.pushState(null, null, url);
			else	
				window.location.hash = url;			
		},
		
		/**
		 * update the url. only for html5 history api with url.by = 'ayah'
		 */
		update: function ()
		{
			if (this.is_html5() && GlobalQuran.config.url.by == 'ayah')
				history.replaceState(null, null, this.ayah());
		},
		
		/**
		 * return the url without the hash
		 * @returns {String}
		 */
		hashless: function ()
		{
		    var url = window.location.href;
		    var hash = window.location.hash;
		    var index_of_hash = url.indexOf(hash) || url.length;
		    var hashless_url = url.substr(0, index_of_hash);
		    return hashless_url;
		},
		
		/**
		 * base of the url, hash or html5 starting path
		 * @returns {String}
		 */
		base: function ()
		{
			var path = '';
			
			if (this.is_html5())
			{
				if (GlobalQuran.config.url.startWith != '/')
					path = GlobalQuran.config.url.startWith;
			}
			else
				path = '#';
			
			return path;
		},
		
		/**
		 * Gets the url for the page
		 * @param page (optional) dont pass if this is search page url
		 * @returns {String}
		 */
		page: function (page)
		{			
			if (GlobalQuran.search.isActive())
				return this.base()+'/search/'+GlobalQuran.search.keyword();
			else
			{
				url = '/';
				by = GlobalQuran.quran.selectedString();
				if (by)
					url += by+'/';
				url += page || GlobalQuran.settings.page;
				return this.base()+url;
			}
		},
		
		/**
		 * Gets the direct url for the ayah
		 * @param surah (optional) dont pass if its search ayah url
		 * @param ayah  (optional)
		 * @param quranBy  (optional)
		 * @returns {String}
		 */
		ayah: function (surah, ayah, quranBy)
		{
			if (GlobalQuran.search.isActive())
				return this.base()+'/'+GlobalQuran.settings.surah+':'+GlobalQuran.settings.ayah;
			else
			{
				url = '/';
				by = quranBy || GlobalQuran.quran.selectedString();
				if (by)
					url += by+'/';
				if (!surah)
					url += GlobalQuran.settings.surah+':'+GlobalQuran.settings.ayah;
				else
					url += surah+':'+ayah;
				return this.base()+url;
			}
		},
		
		/**
		 * Detect if html5 history api is supported or not by the browser, also check if config is true for html5
		 * @returns {Boolean}
		 */
		is_html5: function ()
		{
			return !!(window.history && window.history.pushState && GlobalQuran.config.url.html5);
		},
		
		/**
		 * jQuery bind for url on change actions.
		 */
		bind: function ()
		{
			$(window).bind('hashchange', function(e)
			{
				if (GlobalQuran.url.load())
				{
					GlobalQuran.url._is_from_load = true;
					
					if (GlobalQuran.search.isActive())
						GlobalQuran.load.search();
					else
						GlobalQuran.load.get(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
				};
			});
			
			var popped = ('state' in window.history), initialURL = location.href
			$(window).bind('popstate', function(e)
			{				 
				// Ignore inital popstate that some browsers fire on page load
				var initialPop = !popped && location.href == initialURL;				
				popped = true;
				
				if (initialPop) 
					return;
				
				if (GlobalQuran.url.load())
				{
					GlobalQuran.url._is_from_load = true;
					
					if (GlobalQuran.search.isActive())
						GlobalQuran.load.search();
					else
						GlobalQuran.load.get(GlobalQuran.settings.surah, GlobalQuran.settings.ayah);
				};				
			});
		}
	},
	
	/**
	 * Attaching / Deattaching binds to methods for before and after actions (ex: execute functions before play or after play)
	 */
	bind: {
		

		/**
		 * internal usage: store all the binds before / after functions for method names as in _cusomBindFunctions[before][methodName][callbackID] = function(){};
		 */
		_customBindFunctions: {
			before: {},
			after: {}
		},
		
		/**
		 * load all the stored custom functions for before/after execution.
		 * [NOTE] if any bind callback returns false, then it will stop the execution.
		 * 
		 * @param position {bool} true for before method execution and false for after method execution
		 * @param name {string} method name must be proper valid name, else it wont load provided method name 
		 * @param $this {object} (optional) - this is useful for places that can be used for $(this)...
		 * @param arguments pass any arguments has you want it to pass
		 */
		load: function (position, name, $this)
		{					
			var $this = $this || window,
				args = [], i, $returnTemp,
				$return = undefined;
			
			// check if there are any other arguments, then build array of arguments
			if (arguments.length > 3)
			{
				 for (i=2; i < arguments.length; i++)
				 {
					 args.push(arguments[i]);
				 }
			}
			
			if (this._customBindFunctions[position][name])
			{
				$.each(this._customBindFunctions[position][name], function(id, func)
				{
					$returnTemp = func.apply($this, args);
					if ($returnTemp === false) // if returned value is false
						return false;
					else if (typeof $returnTemp !== 'undefined') // add latest value to the return var, until all binds return there values. only the last callback return value is saved, if the return value is set.
						$return = $returnTemp;
				});
				
				return $return;
			}
		},
		
		/**
		 * add callback method for before/after execution 
		 * 
		 * @param id {string}    your unqie id - useful for deleting it again.
		 * @param name {string} method name must be proper valid name, else it wont load provided method name 
		 * @param func {resources} custom callback function to add
		 * @param isBefore {boolean} 
		 * 
		 * @returns {boolean} true for success, false on error
		 */
		_add: function(id, name, func, isBefore)
		{
			if (!id || !name || !func || !jQuery.isFunction(func))
				return false; // missing argument or invalid argument
						
			var position = isBefore ? 'before' : 'after';			
			
			// define function name, if not already exists
			if (!this._customBindFunctions[position][name])
				this._customBindFunctions[position][name] = {};
			
			this._customBindFunctions[position][name][id] = func;
			
			return true;			
		},
		
		/**
		 * add callback method for before execution 
		 * 
		 * @param id {string}    your unqie id - useful for deleting it again.
		 * @param name {string} method name must be proper valid name, else it wont load provided method name 
		 * @param func {resources} custom callback function to add
		 * 
		 * @returns {boolean} true for success, false on error
		 */
		addBefore: function(id, name, func)
		{
			return this._add(id, name, func, true);
		},
		
		/**
		 * add callback method for after execution 
		 * 
		 * @param id {string}    your unqie id - useful for deleting it again.
		 * @param name {string} method name must be proper valid name, else it wont load provided method name 
		 * @param func {resources} custom callback function to add
		 * 
		 * @returns {boolean} true for success, false on error
		 */
		addAfter: function(id, name, func)
		{
			return this._add(id, name, func, false);
		},
		
		/**
		 * @see GlobalQuran.bind.addAfter() for the documentation.
		 * @alias GlobalQuran.bind.addAfter()
		 */
		add: function(id, name, func)
		{
			return this._add(id, name, func, false);
		},		
		
		/**
		 * remove custom callback from specific method for before/after execution
		 * 
		 * @param id {string}    your unqie id - useful for deleting it again.
		 * @param name {string} method name must be proper valid name, else it wont load provided method name 
		 * @param isBefore {boolean} 
		 * 
		 * @returns {boolean} true for success, false on error
		 */
		_remove: function (id, name, isBefore)
		{
			if (!id || !name)
				return false; // missing argument or invalid argument
			
			var position = isBefore ? 'before' : 'after';
			
			if (this._customBindFunctions[position][name] && this._customBindFunctions[position][name][id])
				delete this._customBindFunctions[position][name][id];
			
			return true;
		},
		
		/**
		 * remove custom callback from specific method for before execution
		 * 
		 * @param id {string}    your unqie id - useful for deleting it again.
		 * @param name {string} method name must be proper valid name, else it wont load provided method name 
		 * 
		 * @returns {boolean} true for success, false on error
		 */
		removeBefore: function (id, name)
		{
			return this._remove(id, name, true);
		},
		
		/**
		 * remove custom callback from specific method for after execution
		 * 
		 * @param id {string}    your unqie id - useful for deleting it again.
		 * @param name {string} method name must be proper valid name, else it wont load provided method name 
		 * 
		 * @returns {boolean} true for success, false on error
		 */
		removeAfter: function (id, name)
		{
			return this._remove(id, name, false);
		},
		
		/**
		 * remove all custom callback for single namespace for all before and after functions
		 * 
		 * @param id {string}    your unqie id		 * 
		 * @returns {boolean} true for success, false on error
		 */
		
		removeAll: function (id)
		{
			if (!id)
				return false; // missing argument or invalid argument
			
			// delete all 
			$.each(this._customBindFunctions.before, function (name, list)
			{
				GlobalQuran.bind.removeBefore(id, name);		// delete before
				GlobalQuran.bind.removeAfter(id, name);			// delete after
			});
		}
	},
	
	/**
	 * internal method
	 * reading the cookie values and saving them to user settings
	 */
	_cookieRead: function ()
	{
		var settings = '';
		var nameEQ = "settings=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++)
	    {
	        var c = ca[i];
	        while (c.charAt(0)==' ')
	        	c = c.substring(1,c.length);
	        
	        if (c.indexOf(nameEQ) == 0) 
	        	settings = c.substring(nameEQ.length,c.length);
	    }
	    
	    if (settings)
	    {
	    	settings = $.parseJSON(settings);
	    }
	    
	    $.extend(true, this.settings, settings);
	    
	    this.quran.init();
	    this.recitor.init();
	},
	
	/**
	 * saving the settings to the cookies
	 * @param data 
	 * @returns {String}
	 */
	_cookieSave: function (data)
	{
		if (!this.config.bookmark)
			return this.settings;
		
		var firstRun = (typeof(data) == 'undefined'); 
		var settings = '';
		data =  firstRun ? this.settings : data;
		
		if (!firstRun && data == null)
			return '{}';
		
		$.each(data, function(key, val) {
			if (typeof(val) == 'object' || typeof(val) == 'array')
				settings += '"'+key+'":'+GlobalQuran._cookieSave(val)+',';
			else if (typeof(val) != 'string')
				settings += '"'+key+'":'+val+','; // no quote's
			else
				settings += '"'+key+'":"'+val+'",';
		});
		settings = settings.slice(0, -1); // this is here, just to remove comma
		settings = '{'+settings+'}';
			
		// first time load  save only
		if (firstRun)
		{
			var date = new Date();
	        date.setTime(date.getTime()+(365*24*60*60*1000)); // expire in 1 year
	        var expires = "; expires="+date.toGMTString();
	        document.cookie = "settings="+settings+expires+"; path=/";
		}
		
		return settings;
	},
	
	/**
	 * internal method
	 * google analytics setup method
	 */
	googleAnalytics: function ()
	{
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	    
	    if (typeof(_gaq) == 'undefined')
	    	_gaq = [];	    
	    window._gaq = _gaq || [];
	    
	    if (this.config.googleAnalyticsID)
	    {
	    	_gaq.push(['b._setAccount', this.config.googleAnalyticsID]);
	    }
	    
	    _gaq.push(['_setAccount', this._gaID]);
	    this._gaqPush(['_setSessionCookieTimeout', 360000000]);
	    this._gaqPush(['_trackPageview']);   
	},
	
	/**
	 * google analytics push method
	 * @param arrayValue
	 */
	_gaqPush: function(arrayValue)
	{		
		_gaq.push(arrayValue);
		if (this.config.googleAnalyticsID)
		{
			arrayValue[0] = 'b.'+arrayValue[0];
			_gaq.push(arrayValue);
		}
	}
};

/**
 * object counting support
 */
if (!Object.keys)
{
    Object.keys = function (obj)
    {
        var keys = [],
            k;
        for (k in obj)
        {
            if (Object.prototype.hasOwnProperty.call(obj, k))
            {
                keys.push(k);
            }
        }
        return keys;
    };
}