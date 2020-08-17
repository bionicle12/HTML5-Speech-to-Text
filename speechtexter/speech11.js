var listening, speechrestart, speech, commands, customCommandslist, custom, commandslist = "", comrepOn = !0, noerror = !0, is_darkmode_on = !1, customWords = JSON.parse(localStorage.getItem("customWords")), customReplaceWords = JSON.parse(localStorage.getItem("customReplaceWords")), btn_start = document.getElementById("btn-start"), editor = document.getElementById("editor"), spinner = document.getElementById("spinner"), score = document.getElementById("score"), preview_box = document.getElementById("preview-box"), preview_text = document.getElementById("preview-text"), dictionary = document.getElementById("dictionary"), counter = document.getElementById("counter"), div_word_counter = document.getElementById("word_counter"), timeout = null, check_autosave = document.getElementById("check_autosave"), check_darkmode = document.getElementById("check_darkmode"), div_main = document.getElementById("main");

function init() {
	document.body.classList.add("lazy-bg"),
	  document.getElementById("info").classList.add("lazy-bg-info");
	for (var e = document.getElementsByClassName("lazy"), t = 0; t < e.length; t++) {
		console.log(e.length + " " + e),
		e[t].getAttribute("data-src") && e[t].setAttribute("src", e[t].getAttribute("data-src"))
	}
}

function autosave_onchange() {
	event.target.checked ? (localStorage.is_autosave_on = "true",
	  localStorage.saved_text = editor.innerHTML) : (localStorage.is_autosave_on = "false",
	  localStorage.saved_text = "")
}

function darkmode() {
	0 == is_darkmode_on ? (is_darkmode_on = !0,
	  div_main.classList.add("black-background"),
	  editor.classList.add("editor-darkmode"),
	  div_word_counter.classList.add("black-background"),
	  document.getElementById("btn-darkmode").classList.add("btn-active")) : (is_darkmode_on = !1,
	  div_main.classList.remove("black-background"),
	  editor.classList.remove("editor-darkmode"),
	  div_word_counter.classList.remove("black-background"),
	  document.getElementById("btn-darkmode").classList.remove("btn-active"))
}

window.onload = init;
var intro_executed = !1;

function slideIntro() {
	intro_executed || (intro_executed = !0,
	  $("#intro").slideUp("slow").dequeue(),
	  $("#main").css("visibility", "visible").hide().fadeIn("slow"),
	  void 0 === localStorage.saved_text ? localStorage.saved_text = "" : "true" == localStorage.is_autosave_on ? (check_autosave.checked = !0,
		editor.focus(),
		document.execCommand("insertHTML", !1, localStorage.saved_text)) : check_autosave.checked = !1)
}

function saveText() {
	"true" == localStorage.is_autosave_on && (localStorage.saved_text = editor.innerHTML,
	  console.log("saving >" + localStorage.is_autosave_on + "<> " + editor.innerHTML))
}

function diDefault() {
	custom = !1,
	  localStorage.custom = "customfalse",
	  command(),
	  document.getElementById("dictionary-default-button").style.background = "rgba(0,0,0,0.4)",
	  document.getElementById("dictionary-custom-button").style.background = "rgba(0,0,0,0.7)",
	  document.getElementById("words").innerHTML = commandslist,
	  document.getElementById("diControl").style.display = "none"
}

editor.onkeydown = function(e) {
	editor.innerText;
	var t = editor.innerText.length;
	(8 == e.keyCode && 1 == t || 8 == e.keyCode && 0 == t) && e.preventDefault()
}
  ,
  document.onkeydown = function(e) {
	  switch (e.which) {
		  case 27:
			  startlisten(),
				slideIntro()
	  }
  }
  ,
void 0 == localStorage.customWords && (customWords = ["my command word"],
  customReplaceWords = ["my result"]),
"customtrue" == localStorage.custom && diCustom(),
  dictionary.onkeydown = function(e) {
	  13 == e.keyCode && e.shiftKey && (this.id.innerText = "<@shift+enter>")
  }
;
var dwn = customWords.length;

function diCustom() {
	for (custom = !0,
		   localStorage.custom = "customtrue",
		   document.getElementById("dictionary-default-button").style.background = "rgba(0,0,0,0.7)",
		   document.getElementById("dictionary-custom-button").style.background = "rgba(0,0,0,0.4)",
		   document.getElementById("diControl").style.display = "block",
		   customCommandslist = "",
		   dwn = 0,
		   l = customWords.length,
		   console.log(customReplaceWords); dwn < l; ) {
		customCommandslist += '<div class="row"><div class="customcell1"><span id="l' + dwn + '" class="celltext" contenteditable="true" onfocusout="saveWord();">' + customWords[dwn] + '</span></div><div class="customcell2"><span id="r' + dwn + '" class="celltext" contenteditable="true" onfocusout="saveWord();">' + customReplaceWords[dwn] + '</span></div><div id="' + dwn + '" class="deleterow" onclick="deleteWord(this.id);">x</div></div>',
		  console.log(customReplaceWords[dwn]),
		  dwn++;
	}
	document.getElementById("words").innerHTML = customCommandslist
}

function addWord() {
	var e = document.getElementById("words").innerHTML;
	e += '<div class="row"><div class="customcell1"><span id="l' + dwn + '" class="celltext" contenteditable="true" onfocusout="saveWord();"></span></div><div class="customcell2"><span id="r' + dwn + '" class="celltext" contenteditable="true" onfocusout="saveWord();"></span></div><div id="' + dwn + '" class="deleterow" onclick="deleteWord(this.id);">x</div></div>',
	  document.getElementById("words").innerHTML = e,
	  dwn++,
	  saveWord()
}

function saveWord() {
	for (customWords.length = dwn - 1,
		   customReplaceWords.length = dwn - 1,
		   i = 0; i < dwn; i++) {
		customWords[i] = document.getElementById("l" + i).innerText,
		  customReplaceWords[i] = document.getElementById("r" + i).innerHTML;
	}
	localStorage.setItem("customWords", JSON.stringify(customWords)),
	  localStorage.setItem("customReplaceWords", JSON.stringify(customReplaceWords))
}

function deleteWord(e) {
	customWords.splice(e, 1),
	  customReplaceWords.splice(e, 1),
	  diCustom(),
	  localStorage.setItem("customWords", JSON.stringify(customWords)),
	  localStorage.setItem("customReplaceWords", JSON.stringify(customReplaceWords))
}

function initialize() {
	(speech = new webkitSpeechRecognition).continuous = !0,
	  speech.maxAlternatives = 5,
	  speech.interimResults = !0,
	  speech.lang = localStorage.language,
	  speech.onend = reset
}

var isOpera = /Opera|OPR\//.test(navigator.userAgent);
if ("webkitSpeechRecognition"in window && !isOpera) {
	if (void 0 === localStorage.language) {
		localStorage.language = "en-us",
		  document.getElementById("lang").value = "en-us",
		  localStorage.textDirLR = "dir_LTR";
	} else {
		document.getElementById("lang").value = localStorage.language;
		var drtl = ["ar-DZ", "ar-BH", "ar-EG", "ar-IQ", "ar-IL", "ar-JO", "ar-KW", "ar-LB", "ar-LY", "ar-MA", "ar-OM", "ar-PS", "ar-QA", "ar-SA", "ar-TN", "ar-AE", "ar-YE", , "fa-ir", , "he-il", "ur-PK", "ur-IN"];
		drtl.indexOf(localStorage.language) > -1 ? textDirection("dir_RTL") : textDirection("dir_LTR")
	}
	
	function reset() {
		speechrestart ? (speech.start(),
		  console.log("restarting")) : noerror ? (listening = !1,
		  preview_box.classList.add("hidden"),
		  btn_start.innerHTML = "► Start",
		  btn_start.classList.remove("button-glow")) : (preview_box.classList.remove("hidden"),
		  btn_start.innerHTML = "► Start",
		  btn_start.classList.remove("button-glow")),
		noerror || (speechrestart = !1)
	}
	
	function restart() {
		speech.stop()
	}
	
	function startlisten() {
		listening ? (speech.stop(),
		  speechrestart = !1,
		  reset()) : (speech.start(),
		  listening = !0,
		  preview_box.classList.remove("hidden"),
		  preview_text.innerHTML = "...",
		  btn_start.innerHTML = "■ Stop ",
		  btn_start.classList.add("button-glow"),
		  spinner.style.setProperty("color", "grey", "important"),
		  score.style.setProperty("color", "grey", "important"),
		  score.innerHTML = "..",
		  speechrestart = !0)
	}
	
	function clearpage() {
		var e = editor.innerText;
		"" === e || "\n" === e || (editor.focus(),
		  execCMD("selectAll"),
		  execCMD("removeFormat"),
		  execCMD("delete"))
	}
	
	function insertFirstP() {
		var e = localStorage.textDirLR;
		document.execCommand("formatBlock", !1, "p"),
		  editor.children[0].classList.add("p_edit", e)
	}
	
	function copyAll() {
		editor.focus(),
		  execCMD("selectAll"),
		  execCMD("copy")
	}
	
	function textDirection(e) {
		var t = editor.getElementsByClassName("p_edit");
		if ("dir_LTR" == e) {
			for (i = 0; i < t.length; i++) {
				t[i].classList.remove("dir_RTL"),
				  t[i].classList.add("dir_LTR");
			}
			document.getElementById("btn-ltr").classList.add("btn-active"),
			  document.getElementById("btn-rtl").classList.remove("btn-active"),
			  localStorage.textDirLR = "dir_LTR"
		} else if ("dir_RTL" == e) {
			for (i = 0; i < editor.getElementsByClassName("p_edit").length; i++) {
				t[i].classList.remove("dir_LTR"),
				  t[i].classList.add("dir_RTL");
			}
			document.getElementById("btn-ltr").classList.remove("btn-active"),
			  document.getElementById("btn-rtl").classList.add("btn-active"),
			  localStorage.textDirLR = "dir_RTL"
		}
	}
	
	void 0 === sessionStorage.transcript && (sessionStorage.transcript = "");
	var replacement = [".", ",", ":", ";", "!", "?", "<p>"];
	
	function command() {
		switch (localStorage.language) {
			case "af-za":
				commands = ["dubblepunt", "kommapunt", "punt", "komma", "uitroepteken", "vraagteken", "nuwe paragraaf"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "am-ET":
				commands = ["አራት ነጥብ", "ነጠላ ሰረዝ", "ነጠላ ሰረዝ", "ድርብ ሰረዝ", "አስረጂ ሰረዝ", "ሦስት ነጥብ", "አዲስ አንቀጽ"],
				  replacement = ["።", "፥", "፣", "፤", "፦", "፧", "\n"];
				break;
			case "ar-DZ":
			case "ar-BH":
			case "ar-EG":
			case "ar-IQ":
			case "ar-IL":
			case "ar-JO":
			case "ar-KW":
			case "ar-LB":
			case "ar-LY":
			case "ar-MA":
			case "ar-OM":
			case "ar-PS":
			case "ar-QA":
			case "ar-SA":
			case "ar-TN":
			case "ar-AE":
			case "ar-YE":
				commands = ["نقطتان", "فاصلة منقوطة", "نقطة", "فاصلة", "علامة التعجب", "علامة استفهام", "الفقرة الجديدة"],
				  replacement = [":", "؛", ".", "،", "!", "؟", "\n"];
				break;
			case "hy-AM":
				commands = ["վերջակետ", "ստորակետ", "միջակետ", "բութ", "նոր կետը"],
				  replacement = ["։", ",", "․", "՝", "\n"];
				break;
			case "az-AZ":
				commands = ["iki nöqtə", "nöqtəli vergül", "nöqtə", "vergül", "nida işarəsi", "sual işarəsi", "yeni paraqraf"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "bn-BD":
			case "bn-IN":
				commands = [],
				  replacement = [];
				break;
			case "id-id":
			case "ms-my":
				commands = ["titik dua", "titik koma", "titik", "koma", "tanda seru", "tanda tanya", "paragraf baru"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "bg-bg":
				commands = ["двоеточие", "точка и запетая", "точка", "запетая", "удивителен знак", "въпросителен знак", "нов параграф"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "ca-es":
				commands = ["dos punts", "punt i coma", "punt", "coma", "signe d'exclamació", "signe d'interrogació", "nou paràgraf"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "cs-cz":
				commands = ["dvojtečka", "středník", "tečka", "čárka", "vykřičník", "otazník", "nový odstavec"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "da-DK":
				commands = ["semikolon", "kolon", "punktum", "komma", "udråbstegn", "spørgsmålstegn", "nyt afsnit"],
				  replacement = [";", ":", ".", ",", "!", "?", "\n"];
				break;
			case "de-de":
				commands = ["Doppelpunkt", "Strichpunkt", "Punkt", "Komma", "Ausrufezeichen", "Fragezeichen", "Klammer öffnen", "Klammer schließen", "neuer Absatz"],
				  replacement = [":", ";", ".", ",", "!", "?", "(", ")", "\n"];
				break;
			case "en-au":
			case "en-ca":
			case "en-GH":
			case "en-in":
			case "en-IE":
			case "en-KE":
			case "en-NG":
			case "en-nz":
			case "en-PH":
			case "en-za":
			case "en-TZ":
			case "en-gb":
			case "en-us":
				commands = ["semicolon", "colon", "period", "full stop", "comma", "exclamation point", "question mark", "open parentheses", "close parentheses", "open quote", "close quote", "hyphen", "slash", "new paragraph"],
				  replacement = [";", ":", ".", ".", ",", "!", "?", "(", ")", '"', '"', "-", "/", "\n"];
				break;
			case "es-ar":
			case "es-bo":
			case "es-cl":
			case "es-co":
			case "es-cr":
			case "es-ec":
			case "es-sv":
			case "es-es":
			case "es-us":
			case "es-gt":
			case "es-hn":
			case "es-mx":
			case "es-ni":
			case "es-pa":
			case "es-py":
			case "es-pe":
			case "es-pr":
			case "es-do":
			case "es-uy":
			case "es-ve":
				commands = ["dos puntos", "punto y coma", "punto", "coma", "signo de exclamación", "signo de interrogación", "abrir paréntesis", "cerrar paréntesis", "abrir comillas", "cerrar comillas", "nuevo párrafo"],
				  replacement = [":", ";", ".", ",", "!", "?", "(", ")", '"', '"', "\n"];
				break;
			case "el-gr":
				commands = ["Άνω τελεία", "ερωτηματικό", "τελεία", "κόμμα", "θαυμαστικό", "Νέα παράγραφος"],
				  replacement = ["·", ";", ".", ",", "!", "\n"];
				break;
			case "eu-es":
				commands = ["bi puntu", "puntu eta koma", "puntua", "koma", "harridura-marka", "galdera-marka", "paragrafo berria"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "fa-ir":
				commands = ["دو نقطه", "نقطه‌ویرگول", "نقطه", "ویرگول", "علامت تعجب", "علامت سوال", "پاراگراف جدید"],
				  replacement = [":", "؛", ".", "،", "!", "؟", "\n"];
				break;
			case "fil-PH":
				commands = ["tutuldok", "tuldok-kuwit", "tuldok", "kuwit", "tandang padamdam", "tandang pananong", "bagong talata"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "fr-CA":
			case "fr-fr":
				commands = ["deux-points", "point-virgule", "point d'exclamation", "point d'interrogation", "point", "virgule", "nouveau paragraphe"],
				  replacement = [":", ";", "!", "?", ".", ",", "\n"];
				break;
			case "gl-es":
				commands = ["dous puntos", "punto e coma", "punto", "coma", "signo de exclamación", "signo de interrogación", "novo parágrafo"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "ka-GE":
			case "gu-IN":
				commands = [],
				  replacement = [];
				break;
			case "hi-in":
				commands = ["विसर्ग", "अर्ध विराम", "पूर्ण विराम", "अल्प विराम", "विस्मयादिवाचक चिन्ह", "प्रशनवाचक चिन्ह", "नया अनुच्छेद"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "hr_HR":
				commands = ["dvotočje", "točka sa zarezom", "točka", "zarez", "uskličnik", "upitnik", "novi odlomak"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "he-il":
				commands = ["נקודתיים", "נקודה ופסיק", "נקודה", "פסיק", "סימן קריאה", "סימן שאלה", "סעיף חדש"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "zu-za":
				commands = [],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "is-is":
				commands = ["samasemmerki", "semikomma", "punktur", "komma", "upphrópunarmerki", "spurningarmerki", "ný málsgrein"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "it-it":
			case "it-ch":
				commands = ["due punti", "punto e virgola", "punto esclamativo", "punto interrogativo", "punto", "virgola", "nuovo paragrafo"],
				  replacement = [":", ";", "!", "?", ".", ",", "\n"];
				break;
			case "jv-ID":
			case "kn-IN":
			case "km-KH":
			case "lo-LA":
			case "lv-LV":
				commands = [],
				  replacement = [];
				break;
			case "lt-LT":
				commands = ["dvitaškis", "kabliataškis", "taškas", "kablelis", "šauktukas", "klaustukas", "nauja pastraipa"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "la":
				commands = ["duo puncta", "punctum et virgula", "punctum", "virgula", "signum exclamationis", "signum interrogationis", "novum caput"],
				  replacement = [":", ";", ".", ",", "!", "?"];
				break;
			case "hu-hu":
				commands = ["kettőspont", "pontosvessző", "új mondat", "vessző", "felkiáltójel", "kérdőjel", "új bekezdés"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "ml-IN":
			case "mr-IN":
				commands = [],
				  replacement = [];
				break;
			case "nl-nl":
				commands = ["dubbelepunt", "puntkomma", "punt", "komma", "uitroepteken", "vraagteken", "nieuwe paragraaf"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "ne-NP":
				commands = [],
				  replacement = [];
				break;
			case "nb-NO":
				commands = ["semikolon", "kolon", "punktum", "komma", "utropstegn", "spørsmålstegn", "nytt avsnitt"],
				  replacement = [";", ":", ".", ",", "!", "?", "\n"];
				break;
			case "pl-pl":
				commands = ["dwukropek", "średnik", "kropka", "przecinek", "znak wykrzyknienia", "znak zapytania", "otworzyć nawias", "zamknąć nawias", "nowy ustęp"],
				  replacement = [":", ";", ".", ",", "!", "?", "(", ")", "\n"];
				break;
			case "pt-br":
			case "pt-pt":
				commands = ["dois pontos", "ponto e vírgula", "ponto de exclamação", "ponto de interrogação", "ponto", "vírgula", "novo paragrafo"],
				  replacement = [":", ";", "!", "?", ".", ",", "\n"];
				break;
			case "ro-ro":
				commands = ["două puncte", "punct și virgulă", "punct", "virgulă", "semnul exclamării", "semnul întrebării", "nou alineat"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "si-LK":
				commands = [],
				  replacement = [];
				break;
			case "ru-ru":
				commands = ["двоеточие", "точка с запятой", "точка", "запятая", "восклицательный знак", "вопросительный знак", "новый абзац"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "sr-rs":
				commands = ["tačka zarez", "dve tačke", "tačka", "zarez", "tri tačke", "znak uzvika", "znak pitanja", "otvorena zagrada", "zatvorena zagrada", "crtica", "povlaka", "kosa crta", "apostrof", "otvoreni polunavodnici", "zatvoreni polunavodnici", "otvoreni navodnici", "zatvoreni navodnici", "navodnici", "zvezdica", "znak jednakosti", "plus", "minus", "novi stav"],
				  replacement = [";", ":", ".", ",", "...", "!", "?", "(", ")", "-", "-", "/", "'", "‚", "'", "„", "”", '"', "*", "=", "+", "-", "\n"];
				break;
			case "sk-sk":
				commands = ["dvojbodka", "bodkočiarka", "bodka", "čiarka", "výkričník", "otáznik", "nový odsek"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "sl-SI":
			case "su-ID":
				commands = [],
				  replacement = [];
				break;
			case "sw-TZ":
			case "sw-KE":
				commands = [],
				  replacement = [];
				break;
			case "fi-fi":
				commands = ["kaksoispiste", "puolipiste", "piste", "pilkku", "huutomerkki", "kysymysmerkki", "uusi kappale"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "sv-se":
				commands = ["semikolon", "kolon", "ny punkt", "punkt", "kommatecken", "utropstecken", "frågetecken"],
				  replacement = [";", ":", "\n", ".", ",", "!", "?"];
				break;
			case "ta-IN":
			case "ta-SG":
			case "ta-LK":
			case "ta-MY":
			case "te-IN":
				commands = [],
				  replacement = [];
				break;
			case "vi-VN":
				commands = ["dấu hai chấm", "dấu chấm phẩy", "dấu chấm than", "dấu chấm hỏi", "dấu chấm", "dấu phẩy", "đoạn văn mới"],
				  replacement = [":", ";", "!", "?", ".", ",", "\n"];
				break;
			case "tr-tr":
				commands = ["iki nokta", "noktalı virgül", "nokta", "virgül", "ünlem işareti", "soru işareti", "yeni paragraf"],
				  replacement = [":", ";", ".", ",", "!", "?", "\n"];
				break;
			case "uk":
				commands = ["двокрапка", "крапка з комою", "крапка", "кома", "знак оклику", "знак питання", "відкрити дужки", "закрити дужки", "відкрити лапки", "закрити лапки", "новий параграф"],
				  replacement = [":", ";", ".", ",", "!", "?", "(", ")", "«", "»", "\n"];
				break;
			case "ur-PK":
			case "ur-IN":
			case "th-th":
			case "ko-kr":
				commands = [],
				  replacement = [];
				break;
			case "ja-jp":
				commands = ["中黒", "句点", "読点", "感嘆符"],
				  replacement = ["・", "。", "、", "!"];
				break;
			case "cmn-hans-cn":
			case "cmn-hans-hk":
			case "cmn-hant-tw":
			case "yue-hant-hk":
				commands = ["句號", "頓號"],
				  replacement = [" 。", "、"]
		}
		commandslist = "";
		for (var e = 0; e < commands.length; e++) {
			commandslist += '<div class="row"><div class="cell1">' + commands[e] + '</div><div class="cell2"><span>' + comrep(commands[e]) + "</span></div></div>";
		}
		1 != custom && (document.getElementById("words").innerHTML = commandslist)
	}
	
	function toggleComRep() {
		!0 === comrepOn ? (comrepOn = !1,
		  document.getElementById("dictionary-button").innerHTML = 'Dictionary is OFF <i class="fa fa-commenting-o" aria-hidden="true"></i>') : (comrepOn = !0,
		  command(),
		  document.getElementById("dictionary-button").innerHTML = 'Dictionary is ON <i class="fa fa-commenting-o" aria-hidden="true"></i>')
	}
	
	function comrep(e) {
		if (!0 === comrepOn) {
			if (1 == custom) {
				for (var t = 0; t < customWords.length; t++) {
					var n = new RegExp(customWords[t],"ig");
					e = e.replace(n, customReplaceWords[t].replace("<br><br>", "\n").replace("&nbsp;", "&"))
				}
			} else {
				for (t = 0; t < commands.length; t++) {
					n = new RegExp(commands[t],"ig");
					e = e.replace(n, replacement[t])
				}
			}
		}
		return e
	}
	
	function updateLang(e) {
		speech.stop();
		var t = e.options[e.selectedIndex].value;
		speech.lang = t,
		  localStorage.language = t,
		  command();
		["ar-DZ", "ar-BH", "ar-EG", "ar-IQ", "ar-IL", "ar-JO", "ar-KW", "ar-LB", "ar-LY", "ar-MA", "ar-OM", "ar-PS", "ar-QA", "ar-SA", "ar-TN", "ar-AE", "ar-YE", , "fa-ir", , "he-il", "ur-PK", "ur-IN"].indexOf(t) > -1 ? textDirection("dir_RTL") : textDirection("dir_LTR"),
		  restart()
	}
	
	function getCaret(e) {
		var t, n = 0, a = e.ownerDocument || e.document, o = a.defaultView || a.parentWindow;
		if (void 0 !== o.getSelection) {
			if ((t = o.getSelection()).rangeCount > 0) {
				var r = o.getSelection().getRangeAt(0)
				  , s = r.cloneRange();
				s.selectNodeContents(e),
				  s.setEnd(r.endContainer, r.endOffset),
				  n = s.toString().length
			}
		} else if ((t = a.selection) && "Control" != t.type) {
			var c = t.createRange()
			  , i = a.body.createTextRange();
			i.moveToElementText(e),
			  i.setEndPoint("EndToEnd", c),
			  n = i.text.length
		}
		return n
	}
	
	function WordCount() {
		getCaret(editor);
		var e = editor.innerText.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, "").replace(/\s+/g, " ");
		counter.innerText = e.split(" ").filter(function(e) {
			return "" != e
		}).length,
		  clearTimeout(timeout),
		  timeout = setTimeout(function() {
			  saveText()
		  }, 1e3)
	}
	
	function execCMD_extra(e, t) {
		document.execCommand(e, !1, t),
		  WordCount()
	}
	
	function execCMD(e) {
		document.execCommand(e, !1, null),
		  WordCount()
	}
	
	function execCMDcolor(e) {
		document.execCommand("styleWithCSS", !1, !0),
		  document.execCommand("foreColor", !1, e)
	}
	
	initialize(),
	  reset(),
	  command(),
	  speech.onerror = function(e) {
		  var t = e.error + " error";
		  console.log("101 ERROR: " + e.error + "<"),
			"no-speech" === e.error ? t = "No speech was detected. Please try again." : "audio-capture" === e.error ? t = "Please ensure that a microphone is connected to your computer." : "not-allowed" === e.error ? (t = "SpeechTexter cannot access your microphone. Click on the 'padlock' icon next to URL bar, find 'microphone' option and choose 'allow'.",
			  noerror = !1) : "aborted" === e.error && (t = "Speech recognition engine is busy. Please close other tabs that might be accessing it."),
			preview_text.innerHTML = "<p style='color:orange'>" + t + "</p>"
	  }
	  ,
	  speech.onstart = function() {
		  console.log("901 on start"),
			spinner.style.setProperty("color", "grey", "important"),
			score.style.setProperty("color", "grey", "important"),
			score.innerHTML = ".."
	  }
	  ,
	  speech.onaudiostart = function() {
		  console.log("901 on audio start")
	  }
	  ,
	  speech.onsoundstart = function() {
		  console.log("901 on sound start")
	  }
	  ,
	  speech.onspeechstart = function() {
		  console.log("901 on speech start")
	  }
	  ,
	  speech.onspeechend = function() {
		  console.log("901 on speech end")
	  }
	  ,
	  speech.onsoundend = function() {
		  console.log("901 on sound end")
	  }
	  ,
	  speech.onaudioend = function() {
		  console.log("901 on audio end")
	  }
	  ,
	  speech.onnomatch = function() {
		  console.log("901 on no match")
	  }
	  ,
	  document.execCommand("defaultParagraphSeparator", !1, "p"),
	  editor.onkeyup = WordCount,
	  editor.onmouseup = WordCount;
	var sentenceEnder = [".", "!", "?", "·"]
	  , rightPunctuation = [",", ":", ";", ")", "»"]
	  , leftPunctuation = ["(", "«"]
	  , punctuation = sentenceEnder.concat(rightPunctuation);
	speech.onresult = function(e) {
		var t = "";
		if (void 0 !== e.results) {
			for (var n = e.resultIndex; n < e.results.length; ++n) {
				var a = e.results[n][0].transcript;
				if (confidence = e.results[n][0].confidence,
				  score.innerHTML = Math.round(100 * confidence),
				  confidence >= .9 ? (spinner.style.setProperty("color", "lawngreen", "important"),
					score.style.setProperty("color", "lawngreen", "important")) : confidence > .7 ? (spinner.style.setProperty("color", "orange", "important"),
					score.style.setProperty("color", "orange", "important")) : (spinner.style.setProperty("color", "red", "important"),
					score.style.setProperty("color", "red", "important")),
				  e.results[n].isFinal) {
					var o = (new Date).getTime()
					  , r = getCaret(editor)
					  , s = !1
					  , c = !1
					  , i = ""
					  , d = editor.innerText.replace(/\r?\n|\r/g, "").substring(0, r).trim().slice(-1)
					  , l = editor.innerText.slice(-4);
					c = 0 != r && "\n\n\n\n" != l && -1 === leftPunctuation.indexOf(d),
					  s = 0 == r || -1 !== sentenceEnder.indexOf(d),
					" " == a.charAt(0) && (a = a.substring(1));
					for (var m = (a = comrep(a = a.replace(/\n\n/g, "\n"))).split(" "), u = 0; u < m.length; u++) {
						-1 !== punctuation.indexOf(m[u].charAt(m[u].length - 1)) ? (0 !== punctuation.indexOf(m[u].charAt(0)) && m[u].length > 1 && u > 0 && (i += " "),
						  i += m[u],
						-1 !== sentenceEnder.indexOf(m[u].charAt(m[u].length - 1)) && (s = !0),
						  c = !0) : "\n" == m[u] ? (c = !1,
						  i += m[u]) : (c && (i += " "),
						  -1 !== leftPunctuation.indexOf(m[u].charAt(m[u].length - 1)) ? (i += m[u],
							c = !1) : (i += s ? m[u].charAt(0).toUpperCase() + m[u].slice(1) : m[u],
							c = !0),
						  s = !1);
					}
					editor.focus(),
					  document.execCommand("insertText", !1, i),
					  saveText();
					var p = (new Date).getTime();
					timeDelta = p - o,
					  console.log("timeDelta " + timeDelta)
				} else {
					t += " " + comrep(a);
					var g = $("#preview-text")
					  , k = g[0].scrollHeight;
					g.scrollTop(k)
				}
			}
			preview_text.innerHTML = t
		} else {
			reset()
		}
	}
} else {
	preview_text.innerHTML = "The latest version of <a href='https://www.google.com/chrome/browser/' style='color:orange' target='_blank'>Google Chrome browser (for desktop)</a> is required.",
	  preview_box.classList.remove("hidden");
}

function printSpeech() {
	var e = editor.innerHTML
	  , t = screen.height / 3 * 2
	  , n = screen.width / 3 * 2
	  , a = "<html><head><title>SpeechTexter | Type with your voice!</title><link rel='stylesheet' type='text/css' href='style.css'></head><body style='background-color:white;background-image:none;'><div id='editor'>" + e + "</div><script>window.onload = function () { window.print(); setTimeout(window.close, 500); };<\/script></body></html>"
	  , o = window.open("", "SpeechTexter | Typing with my voice!", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=" + n + ",height=" + t + ",top=50,left=50");
	o.document.write(a),
	  o.document.close(),
	  o.focus()
}

function newFilename() {
	function e(e) {
		return ("0" + e).slice(-2)
	}
	
	var t = new Date;
	return "SpeechTexter_" + e(t.getHours()) + e(t.getMinutes()) + e(t.getSeconds())
}

function saveSpeechTXT() {
	var e = editor.innerText
	  , t = new Blob([e],{
		type: "text/plain;charset=utf-8"
	})
	  , n = newFilename() + ".txt";
	saveAs(t, n)
}

function Export2Doc() {
	var e = newFilename() + ".doc"
	  , t = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>" + editor.innerHTML + "</body></html>"
	  , n = new Blob(["\ufeff", t],{
		type: "application/msword"
	})
	  , a = "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(t)
	  , o = document.createElement("a");
	document.body.appendChild(o),
	  navigator.msSaveOrOpenBlob ? navigator.msSaveOrOpenBlob(n, e) : (o.href = a,
		o.download = e,
		o.click()),
	  document.body.removeChild(o)
}
