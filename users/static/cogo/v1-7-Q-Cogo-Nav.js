/*
	This heading must remain intact at all times.
	Copyright (c) 2022 Mark Mason.

	File:	Q-Cogo-Nav.js
	Use:	To provide navigation operations for Q-Cogo, <https://www.q-cogo.com/>.
	Ver:	1.7

	Created by Mark Mason. Latest version available from <https://www.q-cogo.com/>.



	This file is part of Q-Cogo.
	
	Q-Cogo is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Q-Cogo is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with Q-Cogo.  If not, see <http://www.gnu.org/licenses/>.



	FUNCTION LISTING

	[Global Variables]
	[(jQuery) OnReady]
	Win
	
	versionAlert
	removeBadge
	
	labelBigger
	labelSmaller
	keyButtonMake
	keyButtonDestroy
	toggleKeyboard
	
	TextExpand
	TextContract
	ScrollHelp
	CheckAllPoints
	CheckPointsFailure
	RevertPoints
	EditPoints
	ClearField
	SelectField
	ClearAll
	
	MoveFront
	PointsSwap
	TransformSwap
	AdjustSwap
	IntersectSwap
	InvDimSwap
	InvTypeSwap
	TravDimSwap
	TravTypeSwap
	SolverSwap
	LabelSwap
	
	qInfo
	qError
	qNext
	qG
	qF
*/



// *******************************************************************************************************************************

// Global Variables

// Set exit warning event

	$(window).on('beforeunload', function() {return 'Any data may be deleted! Have you backed up your work?';});

// Used in AutoPoint function

	var lastPt = '', tryPt = '';

// Used in various linework functions

	var lwRadPt = '', lwFromPt = '';
	
// Previous focus element tracker used to refocus elements

	window.prevFocus = $();
	
// Used to manage filename errors

	var CurrentFile;
	
// Sketch zoom and pan parameters

	var ZoomApplied = 1, ZoomMult = 1, PanX = 0, PanY = 0;

// *******************************************************************************************************************************

$(function() {

// Executes events using jQuery when the document is ready
// Input:  None
// Output: The page, prepared for use, once the DOM is loaded and ready to be manipulated

// Enable points area

	MoveFront('points');

// Enable mobile zooming

	var CanvasMobile = new Hammer(qG('PointsCanvas'));
	CanvasMobile.get('pinch').set({enable: true});
	
	CanvasMobile.on('pinch', function(ev) {
	
		CanvasMobile.get('pan').set({enable: false});
	
		var X = ev.center.x, Y = ev.center.y, dX = ev.deltaX, dY = ev.deltaY, Scale = ev.scale, Accel = 1.015;

		X = X + Math.round(document.body.scrollLeft + document.documentElement.scrollLeft);
		Y = Y + Math.round(document.body.scrollTop + document.documentElement.scrollTop);
		
		ZoomApplied = Scale / ZoomMult;		// Calculate incremental zoom to apply to arrive at total
		
		ZoomMult = ZoomMult * ZoomApplied;
		Dir = (ZoomApplied < 1 ? -1 : 1);
		Accel = (ZoomApplied < 1 ? 1 / Accel : Accel);
		
		var GoX = dX - PanX, GoY = dY - PanY;
		PanX = PanX + GoX;  PanY = PanY + GoY;
		
		PanSketch(GoX, GoY, 1);
		ZoomSketch(Dir, X, Y, ZoomApplied * Accel);
		
	}).on('pinchend', function(ev) {
	
		ZoomApplied = 1;  ZoomMult = 1;  PanX = 0;  PanY = 0;
		setTimeout(function(){CanvasMobile.get('pan').set({enable: true});}, 100);
		
	});
	
	CanvasMobile.on('pan', function(ev) {
	
		if (ev.pointerType == "touch") {
			
			var dX = ev.deltaX, dY = ev.deltaY;
			var GoX = dX - PanX, GoY = dY - PanY;
			PanX = PanX + GoX;  PanY = PanY + GoY;
			PanSketch(GoX, GoY, 1);
		
		}
	
	}).on('panend', function(ev) {PanX = 0;  PanY = 0;});
	
// Enable draggable canvas
	
	$('#PointsCanvas').draggable({stop: function(event, ui) {DropCanvas();}});
	
// Prepare sketch and pseudo-sketches, moving slightly right to accommodate controls area

	ClearAll();
	RefreshSketches();
	DrawControls();
	SketchPoints();
	
	$(window).resize(function () {RefreshSketches(); ZoomSketch(0, 0, 0);});

// Bind hotkeys and scroll events to menu items and sketch controls

	$(document).bind('keydown', 'p', function(){MoveFront('points'); return false;});
	$(document).bind('keydown', 't', function(){MoveFront('traverse'); return false;});
	$(document).bind('keydown', 'i', function(){MoveFront('inverse'); return false;});
	$(document).bind('keydown', 'x', function(){MoveFront('intersect'); return false;});
	$(document).bind('keydown', 'f', function(){MoveFront('transform'); return false;});
	$(document).bind('keydown', 'j', function(){MoveFront('adjust'); return false;});
	$(document).bind('keydown', 'a', function(){MoveFront('area'); return false;});
	$(document).bind('keydown', 'l', function(){MoveFront('solver'); return false;});
	$(document).bind('keydown', 's', function(){MoveFront('settings'); return false;});
	$(document).bind('keydown', 'h', function(){MoveFront('help'); return false;});

	$(document).bind('keydown', 'left', function(){PanSketch(1, 0); return false;});
	$(document).bind('keydown', 'right', function(){PanSketch(-1, 0); return false;});
	$(document).bind('keydown', 'up', function(){PanSketch(0, 1); return false;});
	$(document).bind('keydown', 'down', function(){PanSketch(0, -1); return false;});
	$(document).bind('keydown', 'home', function(){ZoomSketch(0, 0, 0); return false;});
	$(document).bind('keydown', 'pagedown', function(){ZoomSketch(-1, 0, 0); return false;});
	$(document).bind('keydown', 'pageup', function(){ZoomSketch(1, 0, 0); return false;});
	
	$(document).bind('keydown', 'esc', function(){ToolSwitch(); return false;});
	$(document).bind('keydown', 'ctrl+d', function(){ToolSwitch('DeleteLink'); return false;});
	$(document).bind('keydown', 'ctrl+a', function(){ToolSwitch('ArcLink'); return false;});
	$(document).bind('keydown', 'ctrl+l', function(){ToolSwitch('LineLink'); return false;});

	$('input').keydown(function(e) {if (e.which === 13) {e.stopPropagation(); e.preventDefault(); qNext();}});
	
	hookEvent('PointsCanvas', 'mousewheel', MouseZoom);
	
// Build help / info click behaviour

	$('#logo-link').click(function() {qInfo(this, 'VersionTip', 'infomessage'); removeBadge();});
	$('#points-headerlink').click(function() {qInfo(this, 'PointsRecordTip', 'helpmessage');});
	$('#points-tiplink').click(function() {qInfo(this, 'EditDeleteTip', 'helpmessage');});
	$('#help-tiplink').click(function() {qInfo(this, 'HelpTip', 'helpmessage');});
	$('#traverse-headerlink').click(function() {qInfo(this, 'TraverseRecordTip', 'helpmessage');});
	$('#traverse-tiplink').click(function() {qInfo(this, 'TraverseTip', 'helpmessage');});
	$('#inverse-headerlink').click(function() {qInfo(this, 'InverseRecordTip', 'helpmessage');});
	$('#inverse-tiplink').click(function() {qInfo(this, 'InverseTip', 'helpmessage');});
	$('#intersect-headerlink').click(function() {qInfo(this, 'IntersectRecordTip', 'helpmessage');});
	$('#intersect-tiplink').click(function() {qInfo(this, 'IntersectTip', 'helpmessage');});
	$('#transform-headerlink').click(function() {qInfo(this, 'TransformRecordTip', 'helpmessage');});
	$('#transform-tiplink').click(function() {qInfo(this, 'TransformTip', 'helpmessage');});
	$('#adjust-headerlink').click(function() {qInfo(this, 'AdjustRecordTip', 'helpmessage');});
	$('#adjust-tiplink').click(function() {qInfo(this, 'AdjustTip', 'helpmessage');});
	$('#area-headerlink').click(function() {qInfo(this, 'AreaRecordTip', 'helpmessage');});
	$('#area-tiplink').click(function() {qInfo(this, 'AreaTip', 'helpmessage');});
	$('#solver-headerlink').click(function() {qInfo(this, 'SolverRecordTip', 'helpmessage');});
	$('#solver-tiplink').click(function() {qInfo(this, 'SolverTip', 'helpmessage');});
	$('#settings-tiplink').click(function() {qInfo(this, 'PrecisionTip', 'helpmessage');});
	$('#settings-constantslink').click(function() {qInfo(this, 'ConstantsTip', 'helpmessage');});
	$('#settings-unitslink').click(function() {qInfo(this, 'UnitsTip', 'helpmessage');});
	$('#settings-travtoleranceslink').click(function() {qInfo(this, 'TolerancesTip', 'helpmessage');});
	$('#CopyrightLink').click(function() {qInfo(this, 'CopyrightTip', 'infomessage');});
	$('#AboutLink1, #AboutLink2').click(function() {qInfo(this, 'AboutTip', 'infomessage');});
	$('#DownloadLink1, #DownloadLink2').click(function() {qInfo(this, 'DownloadTip', 'infomessage');});
	$('#SaveFile').click(function() {qInfo(this, 'SaveFileTip', 'infomessage');});

// Set defaults for tooltips

	$.prompt.setDefaults({
		
		loaded: function(){$('.jqi').css('height', 'auto').css('overflow', 'visible'); $('#uVal').select();},
		persistent: false, promptspeed: 0, overlayspeed: 'fast', opacity: 0.50, top: '4px;'

	});

// Write spoofed addresses in place of NOTANADDRESS

	var Divs = [$('#AboutTip'), $('#CopyrightTip'), $('#GeneralTip'), $('#PerformanceTip')];

	for (var i=0; i<4; i++) {Divs[i].html(Divs[i].html().replace(/NOTANADDRESS/g, '<a class="submit" title="Email Q-Cogo" href="mailto:info@q-cogo.com" onclick="return Win(\'mailto:info@q-cogo.com\');">info@q-cogo.com</a>'));}
	
// Set file reader default behaviour

	$('#LoadFile').change(function(){LoadFrom();});
	qG('LoadFile').addEventListener('focus', function(){qG('LoadFile').classList.add('has-focus');});  // Allows Firefox to use show focus states
	qG('LoadFile').addEventListener('blur', function(){qG('LoadFile').classList.remove('has-focus');});

// Add icons before function links

	$('.del').prepend('<i class="fa fa-times fa-lg" style="color:#c0392b;">&nbsp;</i>');
	$('.sel').prepend('<i class="fa fa-mouse-pointer" style="color:#2980b9;">&nbsp;</i>');
	$('.sam').prepend('<i class="fa fa-flask fa-lg" style="color:#27ae60;">&nbsp;</i>');
	$('.edt').prepend('<i class="fa fa-pencil fa-lg" style="color:#e67e22;">&nbsp;</i>');
	$('.add').prepend('<i class="fa fa-check fa-lg" style="color:#27ae60;">&nbsp;</i>');
	$('.ren').prepend('<i class="fa fa-refresh fa-lg" style="color:#e67e22;">&nbsp;</i>');
	$('.clc').prepend('<i class="fa fa-cog fa-lg" style="color:#2980b9;">&nbsp;</i>');
	$('.lab').prepend('<i class="fa fa-tags fa-lg" style="color:#95a5a6;">&nbsp;</i>');
	$('.tt').html('<i class="fa fa-question-circle fa-lg" style="color:#2980b9;"></i>');

	var ICOsize = '20px';
	var ICOcolor = '#2980b9';

	var linHTML = '<svg width="' + ICOsize + '" height="' + ICOsize + '">';
	linHTML += '<line x1="3" y1="17" x2="17" y2="3" style="stroke:' + ICOcolor + '; stroke-width:2" />';
	linHTML += '<circle cx="3" cy="17" r="2.75" fill="' + ICOcolor + '"></circle>';
	linHTML += '<circle cx="17" cy="3" r="2.75" fill="' + ICOcolor + '"></circle>';
	linHTML += '</svg>';

	$('.lin').html(linHTML);
	
	var arcHTML = '<svg width="' + ICOsize + '" height="' + ICOsize + '">';
	arcHTML += '<path d="M17,3 A 11 11 0 0 0 3 17" style="stroke:' + ICOcolor + '; stroke-width:2;" fill="none" />';
	arcHTML += '<circle cx="3" cy="17" r="2.75" fill="' + ICOcolor + '"></circle>';
	arcHTML += '<circle cx="17" cy="3" r="2.75" fill="' + ICOcolor + '"></circle>';
	arcHTML += '</svg>';

	$('.arc').html(arcHTML);
	
	var delHTML = '<svg width="' + ICOsize + '" height="' + ICOsize + '">';
	delHTML += '<line x1="4" y1="4" x2="16" y2="16" style="stroke:' + ICOcolor + '; stroke-width:4" />';
	delHTML += '<line x1="4" y1="16" x2="16" y2="4" style="stroke:' + ICOcolor + '; stroke-width:4" />';
	delHTML += '</svg>';

	$('.de2').html(delHTML);
	
// Track previously focused text input elements
	
	var FocusEls = $('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]');

	FocusEls.focusin(function(e) {
	
		e.stopPropagation();

		if ($(this).is('input')) {window.prevFocus = $(this);}
		else {window.prevFocus = $();}
	
	});

	$(document).on('focusin click', 'input', function(e) {e.stopPropagation();});
	$(document).on('mousedown', 'div', function(e) {e.stopPropagation();});
	$(document).on('mousedown', function(e) {window.prevFocus = $();});

// Disrupt focus tracking when bare canvas clicked
	
	$('#SVGCanvas').click(function() {window.prevFocus = $();}).children().click(function(e) {return false;});

// Prepare keyboard switcher popups for mobile and clarifying label functionality

	$(':text').focus(function() {keyButtonMake(this);});
	$(':input').focus(function() {labelBigger(this);});
	
// Add version alert badge to logo if appropriate

	versionAlert();

});


// *******************************************************************************************************************************

function versionAlert() {
	
// Adds alert badge to logo if new version has been published for less than 180 days
// Input: None
// Output: The alert badge, which will disappear once clicked

	var pubDate = Date.parse($('#VersionTip div h5 span').html().split('–')[1].trim());
	var todayDate = new Date().getTime();
	var daysElapsed = (todayDate - pubDate) / (1000 * 60 * 60 * 24);

	if (daysElapsed < 180) {
		
		$('.title-block h1 a img').after('<span class="title-badge" id="title-badge">1</span>');
		$('#VersionTip div h5 a').first().after('<span class="new-notification">New</span>');
		
	}
	
}

// *******************************************************************************************************************************

function removeBadge() {

// Removes alert badge on logo if exists
// Input: None
// Output: The removed alert badge
	
	$('#title-badge').remove();
	
}

// *******************************************************************************************************************************

function labelBigger(elem) {
	
// Makes larger form label to expand contents for clarity, when field focused
// Input: The input element's "this"
// Output: The larger label

	if ($(elem).prev().hasClass('small-label') || $(elem).prev().hasClass('small-label-hidden')) {

// Get contents, either from data-desc tag or label HTML

		var oCont = $(elem).prev().html();
		var nCont = $(elem).prev().attr('data-desc');
		if (!nCont || typeof(nCont) == 'undefined') {nCont = oCont.replace(':', '');}
		
		var leftVal = $(elem).prev().width() + -93;
		
		var HTML = '<span class="big-label">' + nCont + '</span>';

		$(elem).before(HTML);
		$(elem).parent().children('.big-label').css('left', leftVal + 'px');
		$(elem).bind('blur', labelSmaller);
		
	}

}

// *******************************************************************************************************************************

var labelSmaller = function() {
	
// Undoes the changes done by the labelBigger function
// Input: The input element's "this"
// Output: The restored label

	$(this).parent().children('.big-label').remove();
	$(this).unbind('blur', labelSmaller);

}

// *******************************************************************************************************************************

function keyButtonMake(elem) {
	
// Makes the popup button to change input keyboard types for mobile users
// Input: The input element's "this"
// Output: The created button

	if (isTouch() && ($(elem).prev().hasClass('small-label') || $(elem).prev().hasClass('small-label-hidden'))) {
		
		$('.hoverkey').remove();
		
		setTimeout(function() {
		
			var HTML = '<a class="hoverkey" id="hoverkey" href="javascript:void(0);" tabindex="99999"><i class="fa fa-keyboard-o fa-lg" style="color:#eeeeee;"></i></a>';
			$(elem).after(HTML);
			
			$('#hoverkey').click(function(){toggleKeyboard(elem);});

			$(elem).bind('blur', keyButtonDestroy);
		
		}, 200);
	
	}
	
}

// *******************************************************************************************************************************

var keyButtonDestroy = function() {
	
// Destroys the popup keyboard button and restores the page
// Input: The input element's "this"
// Output: The destroyed button

	setTimeout(function() {$('.hoverkey').remove();}, 100);
	
	$(this).unbind('blur', keyButtonDestroy);
	
}

// *******************************************************************************************************************************

function toggleKeyboard(elem) {
	
// Toggles the inputmode property of a provided input element
// Input: The input element's "this"
// Output: The toggled property
	
	elem.inputMode = elem.inputMode == 'text' ? 'decimal' : 'text';
	$(elem).focus();
	
}

// *******************************************************************************************************************************

function Win(url) {var newWin = window.open(url);  return false;}

// Opens a new window or tab so a new link can be displayed without compromising the current points
// Input:  The url to open
// Output: The open url in a new window or tab

// *******************************************************************************************************************************

function TextExpand(Txt) {
	
// Expands a textarea to allow better viewing of contents
// Input:  The object to expand
// Output: The expanded textarea

// Target element and options bar

	Txt.style.height = '400px';  qG('OptionsHolder').style.marginTop = '821px';
	
// Sketch and options bar, if position is absolute (jQuery test more reliable)

	if ($('#PointsEasel').css('position') == 'absolute') {qG('PointsEasel').style.marginTop = '526px';  qG('OptionsHolder').style.marginTop = '821px';}
	
	return false;
	
}

// *******************************************************************************************************************************

function TextContract(Txt) {
	
// Contracts a textarea to save space
// Input:  The object to contract
// Output: The contracted textarea

// Target element and options bar

	Txt.style.height = '190px';  qG('OptionsHolder').style.marginTop = '611px';
	
// Sketch and options bar, if position is absolute

	if ($('#PointsEasel').css('position') == 'absolute') {qG('PointsEasel').style.marginTop = null;  qG('OptionsHolder').style.marginTop = null;}
	
}

// *******************************************************************************************************************************

function ScrollHelp(DivID) {var Field = qG('HelpIndex');  Field.scrollTop = qG(DivID).offsetTop - Field.offsetTop - 6;}

// Scrolls the help div to display specific items in its contents
// Input:  Element ID
// Output: The newly scrolled help div

// *******************************************************************************************************************************

function CheckAllPoints(InputData, suppress, callback, CBvector, element, mergePoints) {

// Checks users input when points area is blurred, or checks provided data variable
// Input:  Data string (optional), suppress flag (optional) to use the routine as a "precheck", callback function, callback option, focus element, merge points flag
// Output: Success confirmation if input is acceptable, appropriate prompts if it is not

	var ErrorHeader = 'POINT FORMAT';

// Get points contents from text area if not provided

	var PointsField = qG('pointsContentsCopy');
	var ptsCnts = PointsField.value + ' ';
	if (InputData) {ptsCnts = InputData;}
	
	var LFchar = 'qqqqqqqq';

// Remove special characters, line ends, and extra spaces and commas from points contents

	ptsCnts = ptsCnts.replace(/\r\n/g,LFchar);
	ptsCnts = ptsCnts.replace(/\n\r/g,LFchar);
	ptsCnts = ptsCnts.replace(/\n/g,LFchar);
	ptsCnts = ptsCnts.replace(/\r/g,LFchar);
	ptsCnts = ptsCnts.replace(/\t/g,' ');
	ptsCnts = ptsCnts.replace(/\b/g,'');
	ptsCnts = ptsCnts.replace(/\v/g,'');
	ptsCnts = ptsCnts.replace(/\f/g,'');
	ptsCnts = ptsCnts.replace(/\s+/g,' ');
	ptsCnts = ptsCnts.replace(/[,]+/g,',');
	
// Force space separated (from comma)

	var testCnts = ptsCnts.split(LFchar);
	var splitChar = ' ';
	
	if (testCnts[0].split(',').length > 4) {
	
		ptsCnts = ptsCnts.trim();
		ptsCnts = ptsCnts.replace(/\s+/g,'_');
		ptsCnts = ptsCnts.replace(/[,]+/g,' ');
		
	}

// Split points contents into a vector, remove spaces and commas from start and end

	ptsCnts = ptsCnts.replace(/qqqqqqqq/g,splitChar);
	ptsCnts = ptsCnts.trim();
	ptsCnts = ptsCnts.replace(/\s+/g,' ');
	
	ptsCnts = ((ptsCnts.substring(0,1) == splitChar) ? ptsCnts.substring(1) : ptsCnts);

	var pointsVector = ptsCnts.split(splitChar);

// Find length of points matrix, to initialize later

	var lP = ((pointsVector[0] == '') ? 0 : (pointsVector.length) / 5);
	
// Notify if input does not appear to have the appropriate number of values (5 values per point)

	if (lP != parseInt(lP)) {

		if (InputData || PointsField.readOnly == false)  {
			
			if (!suppress) {$.prompt(qP('Each point must have a point name, northing, easting, elevation, and description', ErrorHeader), {
		
				classes: {message: 'errormessage'},
				submit: function(){CheckPointsFailure(PointsField, element);},
				close: function(e,v,m,f){if (typeof v == 'undefined') {CheckPointsFailure(PointsField, element);}}
		
			});}
			
			return 0;
			
		}

	}

// Read data into 2D matrix

	var pointsMatrix = new Array(lP);

	for (var i=0; i<=lP; i++) {

		var tempPoint = new Array(5);
		tempPoint[0] = pointsVector[0 + i*5];  tempPoint[1] = pointsVector[1 + i*5];
		tempPoint[2] = pointsVector[2 + i*5];  tempPoint[3] = pointsVector[3 + i*5];
		tempPoint[4] = pointsVector[4 + i*5];
		pointsMatrix[i] = tempPoint;

	}

// Loop through matrix and check each value

	for (var i=0; i<=lP-1; i++) {

		if (pointsMatrix[i][0].search(/\+|\-|\*|\/|\,|\.|\(|\)|\[|\]|\{|\}/) >= 0) {

			if (!suppress) {$.prompt(qP('Point name formatting error for Point ' + pointsMatrix[i][0], ErrorHeader), {
		
				classes: {message: 'errormessage'},
				submit: function(){CheckPointsFailure(PointsField, element);},
				close: function(e,v,m,f){if (typeof v == 'undefined') {CheckPointsFailure(PointsField, element);}}
		
			});}
			
			return 0;

		}

		pointsMatrix[i][1] = ParseDecimal(pointsMatrix[i][1], 0, 0, '', 1);
		pointsMatrix[i][2] = ParseDecimal(pointsMatrix[i][2], 0, 0, '', 1);
		pointsMatrix[i][3] = ParseDecimal(pointsMatrix[i][3], 0, 0, '', 1);

		if (pointsMatrix[i][1] == 'X' || pointsMatrix[i][2] == 'X' || pointsMatrix[i][3] == 'X' || !CheckDesc(pointsMatrix[i][4], '', 1)) {
			
			var lineError = '';
			
			if (pointsMatrix[i][1] == 'X' || pointsMatrix[i][2] == 'X' || pointsMatrix[i][3] == 'X') {lineError = 'Coordinate formatting error for Point ' + pointsMatrix[i][0];}
			if (!CheckDesc(pointsMatrix[i][4], '', 1)) {lineError = 'Description formatting error for Point ' + pointsMatrix[i][0];}
			
			if (!suppress) {$.prompt(qP(lineError, ErrorHeader), {
		
				classes: {message: 'errormessage'},
				submit: function(){CheckPointsFailure(PointsField, element);},
				close: function(e,v,m,f){if (typeof v == 'undefined') {CheckPointsFailure(PointsField, element);}}
		
			});}
			
			return 0;
			
		}

		for (var j=i; j<lP; j++) {

			if (j != i && FormatString(pointsMatrix[i][0], 1, 0) == FormatString(pointsMatrix[j][0], 1, 0)) {

				if (!suppress) {$.prompt(qP('Point name duplicate detected for Point ' + pointsMatrix[i][0], ErrorHeader), {
			
					classes: {message: 'errormessage'},
					submit: function(){CheckPointsFailure(PointsField, element);},
					close: function(e,v,m,f){if (typeof v == 'undefined') {CheckPointsFailure(PointsField, element);}}
			
				});}
				
				return 0;

			}

		}

	}

// Confirm and output, rewrite, or leave open as appropriate

	if (!suppress && (InputData || PointsField.readOnly == false)) {

// If merge points flag set, build combined points matrix and count number of points overwritten
		
		if (mergePoints) {
			
			var ptMt = ParsePoints(); var lPM = ptMt.length;
			
			var numSame = 0;
			
			for (var g=0; g<lP; g++) {
				
				for (var h=0; h<lPM-1; h++) {

// If same name found, remove from old point list
					
					if (pointsMatrix[g][0] == ptMt[h][0]) {
						
						numSame++;
						ptMt.splice(h, 1);
						lPM--;
						h--;
						
					}
					
				}
				
			}

// Clean, concatenate, form new length
			
			pointsMatrix.splice(pointsMatrix.length-1, 1);
			pointsMatrix = pointsMatrix.concat(ptMt);
			lP = pointsMatrix.length - 1;
			
		}
		
		var overWarning = numSame ? (numSame + ' points will be overwritten! ') : '';
		
		$.prompt(qP(overWarning + 'Permanently edit points record? <br><br>To save your work first, choose "Cancel".', 'POINT DATABASE EDIT'), {
		
			classes: {message: 'editmessage'},
			buttons: {Ok: true, Cancel: false},
			submit: function(e,v,m,f){
				
				if (v) {
				
					OutputPoints(pointsMatrix, lP-1);
					AuditLines();
					PointsField.readOnly = true;
					PointsField.style.backgroundColor = '#ffffff';
					if (callback && typeof callback === "function") {callback(CBvector);}
					if (mergePoints) {SortPoints(0);}
					ClearSort();
					ZoomSketch(0, 0, 0, '#PointsCanvas');
					if (element) {element.focus();} else {qF('points-tiplink');}
					return 1;
					
				}
				
				else {RevertPoints(element); return 1;}
				
			},
			close: function(e,v,m,f){if (typeof v == 'undefined') {RevertPoints(element); return 1;}}
		
		});

	}

	else {RewritePoints(); return 1;}

}

// *******************************************************************************************************************************

function CheckPointsFailure(PointsField, element) {

// Presents choice: revert to previous points or continue editing (Called in the case of error in CheckAllPoints)
// Input:  PointsField (gotten by ID)
// Output: Confirms reversion to previous points, closes editing if appropriate

	$.prompt(qP('Points record not changed! Revert to previous points?', 'POINT DATABASE EDIT'), {
		
		classes: {message: 'editmessage'},
		buttons: {Ok: true, Cancel: false},
		submit: function(e,v,m,f){
			
			if (v) {RevertPoints(element);}
			else {PointsField.focus();}
			
		},
		close: function(e,v,m,f){if (typeof v == 'undefined') {PointsField.focus();}}
		
	});

}

// *******************************************************************************************************************************

function RevertPoints(element) {RewritePoints(); PointsField.readOnly = true; PointsField.style.backgroundColor = '#fff'; if (element) {qF(element.id);}}

// Reverts to last saved version of points database without saving edits
// Input:  None
// Output: The reverted points record

// *******************************************************************************************************************************

function EditPoints() {

// Opens the points area for editing
// Input:  None
// Output: Makes the points area editable at high precision, informs user

	var PrecisionField = qG('DPrecision');
	var PointsField = qG('pointsContentsCopy');
	
// Make points area high precision and change color to inform the user that it is opened for editing

	PrecisionVal = PrecisionField.value;

	PrecisionField.value = '5';
	RewritePoints();
	PrecisionField.value = PrecisionVal;

	PointsField.readOnly = false;
	PointsField.style.backgroundColor = '#f0f0ff';

// Focus the points area

	PointsField.focus();

}

// *******************************************************************************************************************************

function ClearField(FieldID) {

// Clears the contents of a given text field and canvases
// Input:  The html ID of the field that will be cleared
// Output: Clears the field and canvas contents, confirms with user if the field is a critical one

	var Field = qG(FieldID);

// If the requested field is the points field, then confirm clear with user

	if (FieldID == 'pointsContents') {

		$.prompt(qP('Delete all points?', 'POINT DATABASE EDIT'), {
		
			classes: {message: 'errormessage'},
			buttons: {Ok: true, Cancel: false},
			submit: function(e,v,m,f){
				
				if (v) {Field.value = '';  qG(FieldID + 'Copy').value = '';  qG('linesContents').value = '';  SketchPoints();}
				
			}
		
		});

	}

// Otherwise, clear without confirming and clear corresponding sketch and sketch state if necessary

	else  Field.value = '';

	if (FieldID.search('Log') >= 0) {

		var C = FieldID.replace('Log', '');
		if (C == 'Solver') {

			var STitle = qG('SolverTitle');  var SState = qG('SolverCanvasSt');

			if (STitle.innerHTML == 'Triangle') {SState.value = 'SketchTriangle(\'\', \'SVGCanvas\')';  SketchTriangle('','SVGCanvas');}
			else {SState.value = 'SketchCurve(\'\', \'SVGCanvas\')';  SketchCurve('','SVGCanvas');}
			ZoomSketch(0, 0, 0);

		}

		else if (C == 'Points') {SketchPoints;}
		else {qG(C + 'CanvasSt').value = 'SketchPtPt(\'\', \'SVGCanvas\')'; SketchPtPt('', 'SVGCanvas');}
		
		ZoomSketch(0, 0, 0);

	}

}

// *******************************************************************************************************************************

function SelectField(Field) {

// Selects the contents of a given text field
// Input:  The html DOM path to the field that will be selected
// Output: Selects the field contents

// If points field chosen, make high resolution

	if (Field == document.points.pointsContentsCopy) {

		var PrecisionField = qG('DPrecision');
		var PointsField = qG('pointsContentsCopy');
	
		PrecisionVal = PrecisionField.value;

		PrecisionField.value = '5';
		RewritePoints();
		PrecisionField.value = PrecisionVal;

	}

// Focus field

	Field.focus();
	Field.select();

}

// *******************************************************************************************************************************

function ClearAll() {

// Clears all inputs and textareas, sets to initial values as required, forces all browsers to clear and start fresh
// Input:  None
// Output: The cleared fields, the initial values as required

// Clear all input and textarea values, restore default value if set

	$('input, textarea').val('');
	
	$('input').each(function() {
	
		if (this.type != 'file' && typeof($(this).data('original-value')) !== 'undefined') {this.value = $(this).data('original-value');}
	
	});
	
// Set default values as required
	
	$('#PointsCanvasSt').val('SketchPoints()');
	$('#TraverseCanvasSt').val('SketchPtPt(\'\', \'SVGCanvas\')');
	$('#InverseCanvasSt').val('SketchPtPt(\'\', \'SVGCanvas\')');
	$('#IntersectCanvasSt').val('SketchPtPt(\'\', \'SVGCanvas\')');
	$('#TransformCanvasSt').val('SketchPtPt(\'\', \'SVGCanvas\')');
	$('#AdjustCanvasSt').val('SketchPtPt(\'\', \'SVGCanvas\')');
	$('#AreaCanvasSt').val('SketchPtPt(\'\', \'SVGCanvas\')');
	$('#SolverCanvasSt').val('SketchTriangle(\'\', \'SVGCanvas\')');
	
	$('#filename').val('Job 1');

}

function SyncDistArea(FieldID) {

// Ensures that the units dist / area fields can only be set to matching units
// Input:  The field id being changed
// Output: The synced fields, with matching units

	if (FieldID == 'DistUnits')  qG('AreaUnits').value = qG(FieldID).value;
	else  qG('DistUnits').value = qG(FieldID).value;

}

// *******************************************************************************************************************************

function MoveFront(DivID) {

// Moves the selected div and its corresponding label in front of the others, refreshes sketch
// Input:  The html ID of the div to be moved
// Output: The selected div at the front, the refreshed sketch

// Contract sketch

	ExpandSketch(1);

// Create array of all existing div layer IDs (and corresponding canvas, control, header, and canvas state)

	var Divs = new Array(6);
	Divs[0] = ['points', 'Points', 'PointsCanvasSt', 11, 'pointsContentsCopy', 11];
	Divs[1] = ['traverse', 'Traverse', 'TraverseCanvasSt', 11, 'TraverseLog', 11];
	Divs[2] = ['inverse', 'Inverse', 'InverseCanvasSt', 11, 'InverseLog', 11];
	Divs[3] = ['intersect', 'Intersect', 'IntersectCanvasSt', 11, 'IntersectLog', 11];
	Divs[4] = ['transform', 'Transform', 'TransformCanvasSt', 11, 'TransformLog', 11];
	Divs[5] = ['adjust', 'Adjust', 'AdjustCanvasSt', 11, 'AdjustLog', 11];
	Divs[6] = ['area', 'Area', 'AreaCanvasSt', 11, 'AreaLog', 11];
	Divs[7] = ['solver', 'Solver', 'SolverCanvasSt', 11, 'SolverLog', -1];
	Divs[8] = ['settings', 'Settings', '', -1, '', -1];
	Divs[9] = ['help', 'Help', '', -1, '', -1];

	var Header = qG('header');

// Loop through the array and move the selected layer to the front, change the title and sketch

	for (var i=0; i<Divs.length; i++) {

		var DivObject = qG(Divs[i][0]).style;
		var TabObject = qG(Divs[i][0] + '-tab');
		var FocusElement = $(window).height() > 550 ? qG(Divs[i][0] + '-tiplink') : null;

		if (Divs[i][0] == DivID) {

			DivObject.display = 'block';
			TabObject.setAttribute('class', 'legend-selected');
			Header.innerHTML = Divs[i][1];
			eval((Divs[i][2]) ? qG(Divs[i][2]).value : '');
			if (FocusElement!= null)  FocusElement.focus();
			qG('PointsEasel').style.display = (Divs[i][3] == 11 ? 'block' : 'none');
			qG('OptionsHolder').style.display = (Divs[i][5] == 11 ? 'block' : 'none');
			if (Divs[i][4]) {ScrlFld = qG(Divs[i][4]);  ScrlFld.scrollTop = ScrlFld.scrollHeight - ScrlFld.clientHeight;}

		}

		if (Divs[i][0] != DivID) {

			DivObject.display = 'none';
			TabObject.setAttribute('class', 'legend');

		}

	}

}

// *******************************************************************************************************************************

function PointsSwap() {
	
// Cycles the points fields area through point storage and bulk point editing
// Input:  None
// Output: Changed labels, fields and title link of the points area

// Get elements to be changed

	var Title = qG('PointsTitle');
	
	var Label1 = qG('PtLabel');
	var Label2 = qG('NLabel');
	var Label3 = qG('ELabel');
	var Label4 = qG('ZLabel');
	var Label5 = qG('DescLabel');
	var Label6 = qG('StartPtLabel');
	
	var Value1 = qG('Pt');
	var Value2 = qG('N');
	var Value3 = qG('E');
	var Value4 = qG('Z');
	var Value5 = qG('Desc');
	var Value6 = qG('StartPt');
	
	var Button1 = qG('DeleteButton');
	var Button2 = qG('RenameButton');

// Change the elements' inner HTML to the next values in the cycle

	var Titles = ['Store / Edit', 'Bulk Edit'];
	var Label1s = ['Pt:', 'Pts:'];
	var Descs1 = ['Point Name', 'Point List'];
	var Label2s = ['N:', '<i class="fa fa-angle-double-right" style="position: relative; top: -1px;"></i> N:'];
	var Descs2 = ['Northing', 'New Northing'];
	var Labe13s = ['E:', '<i class="fa fa-angle-double-right" style="position: relative; top: -1px;"></i> E:'];
	var Descs3 = ['Easting', 'New Easting'];
	var Label4s = ['Z:', '<i class="fa fa-angle-double-right" style="position: relative; top: -1px;"></i> Z:'];
	var Descs4 = ['Elevation', 'New Elevation'];
	var Label5s = ['Desc:', '<i class="fa fa-angle-double-right" style="position: relative; top: -1px;"></i> Desc:'];
	var Descs5 = ['Description', 'New Description'];
	var Label6s = ['none', 'inline'];
	var Value6s = ['none', 'inline'];
	var Button1s = ['inline', 'none'];
	var Button2s = ['none', 'inline'];
	
	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}
	
	Title.innerHTML = Titles[(i + 1) % Titles.length];
	Label1.innerHTML = Label1s[(i + 1) % Label1s.length];
	$(Label1).attr('data-desc', Descs1[(i + 1) % Descs1.length]);
	Label2.innerHTML = Label2s[(i + 1) % Label2s.length];
	$(Label2).attr('data-desc', Descs2[(i + 1) % Descs2.length]);
	Label3.innerHTML = Labe13s[(i + 1) % Labe13s.length];
	$(Label3).attr('data-desc', Descs3[(i + 1) % Descs3.length]);
	Label4.innerHTML = Label4s[(i + 1) % Label4s.length];
	$(Label4).attr('data-desc', Descs4[(i + 1) % Descs4.length]);
	Label5.innerHTML = Label5s[(i + 1) % Label5s.length];
	$(Label5).attr('data-desc', Descs5[(i + 1) % Descs5.length]);
	
// Handle changing element visibility 

	Label6.style.display = Label6s[(i + 1) % Label6s.length];
	Value6.style.display = Value6s[(i + 1) % Value6s.length];
	Button1.style.display = Button1s[(i + 1) % Button1s.length];
	Button2.style.display = Button2s[(i + 1) % Button2s.length];
	
// Handle changing onblur and onfocus behaviour
	
	Value1.onblur = Label1.innerHTML == 'Pt:' ? function onblur(){StrictPoint(this);}  : function onblur(){};
	Value1.onfocus = Label1.innerHTML == 'Pt:' ? function onfocus(){AutoPoint(this);}  : function onfocus(){createAutoComplete('Pt', 'PointSuggest1', 0, 1)};
	Value4.onblur = Label1.innerHTML == 'Pt:' ? function onblur(){StrictCheck(this, 0, 0, 'decimal');}  : function onblur(){StrictCheck(this, 0, '', 'decimal');};
	
// Clear necessary values
	
	Value1.value = '';  Value2.value = '';  Value3.value = '';  Value4.value = '';  Value5.value = '';

}

// *******************************************************************************************************************************

function TransformSwap() {

// Cycles the transform fields area through all types of transformations
// Input:  None
// Output: Changed labels and title link of the transform area

// Get elements to be changed

	var Title = qG('TransTitle');
	
	var Label1 = qG('TransValueLabel1');
	var Label2 = qG('TransValueLabel2');
	var Label3 = qG('TransValueLabel3');
	var Label4 = qG('TransValueLabel4');
	var Label5 = qG('TransValueLabel5');
	var Label6 = qG('TransValueLabel6');
	var Label7 = qG('TransValueLabel7');
	var Label8 = qG('TransValueLabel8');
	var Label9 = qG('TransValueLabel9');

	var Value1 = qG('TransAbout');
	var Value2 = qG('TransN');
	var Value3 = qG('TransE');
	var Value4 = qG('TransZ');
	var Value5 = qG('TransSF');
	var Value6 = qG('TransHA');
	var Value7 = qG('TransDir2');
	var Value8 = qG('TransField');
	var Value9 = qG('TransControl');

// Change the elements' inner HTML to the next values in the cycle

	var Titles = 	['Values', 			'Points', 				'Helmert\'s'];
	var Label2s = 	['+N:', 			'Az:', 					'n/a'];
	var Descs2 = 	['Northing Shift',	'Azimuth', 				'n/a'];
	var Label3s = 	['+E:', 			'HD:', 					'n/a'];
	var Descs3 = 	['Easting Shift', 	'Horizontal Distance', 	'n/a'];
	var Label6s = 	['Rot:', 			'Dir 1:', 				'n/a'];
	var Descs6 = 	['Rotation', 		'Initial Direction', 	'n/a'];

	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}

	Title.innerHTML = Titles[(i + 1) % Titles.length];
	Label2.innerHTML = Label2s[(i + 1) % Label2s.length];
	$(Label2).attr('data-desc', Descs2[(i + 1) % Descs2.length]);
	Label3.innerHTML = Label3s[(i + 1) % Label3s.length];
	$(Label3).attr('data-desc', Descs3[(i + 1) % Descs3.length]);
	Label6.innerHTML = Label6s[(i + 1) % Label6s.length];
	$(Label6).attr('data-desc', Descs6[(i + 1) % Descs6.length]);
	
// Handle changing element visibility

	Label1.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Value1.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Label2.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Value2.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Label3.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Value3.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Label4.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Value4.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Label5.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Value5.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Label6.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';
	Value6.style.display = TransTitle.innerHTML != 'Helmert\'s' ? 'inline' : 'none';

	Label7.style.display = TransTitle.innerHTML == 'Points' ? 'inline' : 'none';
	Value7.style.display = TransTitle.innerHTML == 'Points' ? 'inline' : 'none';
	
	Label8.style.display = TransTitle.innerHTML == 'Helmert\'s' ? 'inline' : 'none';
	Value8.style.display = TransTitle.innerHTML == 'Helmert\'s' ? 'inline' : 'none';
	Label9.style.display = TransTitle.innerHTML == 'Helmert\'s' ? 'inline' : 'none';
	Value9.style.display = TransTitle.innerHTML == 'Helmert\'s' ? 'inline' : 'none';

// Handle changing onblur behavior
	
	Value2.onblur = Label2.innerHTML == '+N:' ? function onblur(event){StrictCheck(this, 0, '', 'dN');}  : function onblur(event){StrictCheck(this, 0, '', 'DMS');}
	Value3.onblur = Label3.innerHTML == '+E:' ? function onblur(event){StrictCheck(this, 0, '', 'dE');}  : function onblur(event){StrictCheck(this, 0, '', 'decimal');}
	
// Clear necessary values
	
	Value2.value = '';  Value3.value = '';

}

// *******************************************************************************************************************************

function AdjustSwap() {

// Cycles the adjust fields area through both types of adjustments
// Input:  None
// Output: Changed the labels for the adjust fields area

// Get elements to be changed

	var Title = qG('AdjustTitle');
	
// Change the elements' inner HTML to the next values in the cycle

	var Titles = ['Compass Rule', 'Vertical Balance'];
	
	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}

	Title.innerHTML = Titles[(i + 1) % Titles.length];

}

// *******************************************************************************************************************************

function IntersectSwap() {

// Cycles the intersection fields area through all three types of intersections
// Input:  None
// Output: Changed the labels and title link of the intersect fields area

// Get elements to be changed

	var Title = qG('IntTitle');
	var FromLabel = qG('IntValueFromLabel');
	var ToLabel = qG('IntValueToLabel');
	
	var FromValue = qG('IntValueFrom');
	var ToValue = qG('IntValueTo');

// Change the elements' inner HTML to the next values in the cycle

	var Titles = ['Brg-Brg', 'Brg-Dist', 'Dist-Dist'];
	var Froms = ['Az:', 'Az:', 'HD:'];
	var FDescs = ['Azimuth', 'Azimuth', 'Horizontal Distance'];
	var Tos = ['Az:', 'HD:', 'HD:'];
	var TDescs = ['Azimuth', 'Horizontal Distance', 'Horizontal Distance'];

	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}

	Title.innerHTML = Titles[(i + 1) % Titles.length];
	FromLabel.innerHTML = Froms[(i + 1) % Froms.length];
	$(FromLabel).attr('data-desc', FDescs[(i + 1) % FDescs.length]);
	ToLabel.innerHTML = Tos[(i + 1) % Tos.length];
	$(ToLabel).attr('data-desc', TDescs[(i + 1) % TDescs.length]);
	
	
// Handle changing onblur behaviour
	
	FromValue.onblur = FromLabel.innerHTML == 'Az:' ? function onblur(event){StrictCheck(this, 0, '', 'DMS');}  : function onblur(event){StrictCheck(this, 0, '', 'decimal');}
	ToValue.onblur = ToLabel.innerHTML == 'Az:' ? function onblur(event){StrictCheck(this, 0, '', 'DMS');}  : function onblur(event){StrictCheck(this, 0, '', 'decimal');}

// Clear necessary values
	
	FromValue.value = '';  ToValue.value = '';
	
}

// *******************************************************************************************************************************

function InvDimSwap() {

// Changes the inverse dimension title link between 2D and 3D
// Input:  None
// Output: Changed title link of the inverse fields area

// Get element to be changed

	var Title = qG('InvDim');

// Change the elements' inner HTML to the next values in the cycle

	var Titles = ['2D', '3D'];

	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}

	Title.innerHTML = Titles[(i + 1) % Titles.length];

}

// *******************************************************************************************************************************

function InvTypeSwap() {

// Changes the inverse fields area between point to point and point to line methods
// Input:  None
// Output: Changed title link and input areas of the inverse area

// Get elements to be changed

	var Title = qG('InvType');
	var FromLabel = qG('InvFromPtLabel');
	var ToLabel = qG('InvToPtLabel');
	var Input1 = qG('InvPtPt');
	var PtLabel1 = qG('InvPtPtLabel');
	var Input2 = qG('InvPt');
	var PtLabel2 = qG('InvPtLabel');
	var Input3 = qG('InvDesc');
	var PtLabel3 = qG('InvDescLabel');
	var HR = qG('InvHR');
	var Button = qG('InvStore');

// Change the elements' inner HTML to the next values in the cycle

	var Titles = ['Point', 'Line'];
	var FromLabels = ['From:', 'Start:'];
	var FDescs = ['From Point', 'Line Start Point'];
	var ToLabels = ['To:', 'End:'];
	var TDescs = ['To Point', 'Line End Point'];
	var Inputs = ['none', 'inline'];
	var PtLabels = ['none', 'inline'];
	var HRs = ['none', 'block'];

	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}

	Title.innerHTML = Titles[(i + 1) % Titles.length];
	FromLabel.innerHTML = FromLabels[(i + 1) % FromLabels.length];
	$(FromLabel).attr('data-desc', FDescs[(i + 1) % FDescs.length]);
	ToLabel.innerHTML = ToLabels[(i + 1) % ToLabels.length];
	$(ToLabel).attr('data-desc', TDescs[(i + 1) % TDescs.length]);
	Input1.style.display = Inputs[(i + 1) % Inputs.length];
	PtLabel1.style.display = PtLabels[(i + 1) % PtLabels.length];
	Input2.style.display = Inputs[(i + 1) % Inputs.length];
	PtLabel2.style.display = PtLabels[(i + 1) % PtLabels.length];
	Input3.style.display = Inputs[(i + 1) % Inputs.length];
	PtLabel3.style.display = PtLabels[(i + 1) % PtLabels.length];
	HR.style.display = HRs[(i + 1) % HRs.length];
	Button.style.display = Inputs[(i + 1) % Inputs.length];

}

// *******************************************************************************************************************************

function TravDimSwap() {

// Changes the traverse title and fields between 2D and 3D
// Input:  None
// Output: Changed title link and input areas of the traverse area

// Get elements to be changed

	var Title = qG('TravDim');
	var DistLabel = qG('TravValueDistLabel');
	var ZALabel = qG('TravValueZALabel');
	var ZAInput = qG('TravZA');
	var HILabel = qG('TravValueHILabel');
	var HIInput = qG('TravHI');
	var HTLabel = qG('TravValueHTLabel');
	var HTInput = qG('TravHT');

// Change the elements' inner HTML to the next values in the cycle

	var Titles = ['2D', '3D'];
	var Dists = ['HD:', 'SD:'];
	var DDescs = ['Horizontal Distance', 'Slope Distance'];
	var Labels = ['none', 'inline'];
	var Inputs = ['none', 'inline'];

	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}

	Title.innerHTML = Titles[(i + 1) % Titles.length];
	DistLabel.innerHTML = Dists[(i + 1) % Dists.length];
	$(DistLabel).attr('data-desc', DDescs[(i + 1) % DDescs.length]);	
	ZALabel.style.display = Labels[(i + 1) % Labels.length];  ZAInput.style.display = Inputs[(i + 1) % Inputs.length];
	HILabel.style.display = Labels[(i + 1) % Labels.length];  HIInput.style.display = Inputs[(i + 1) % Inputs.length];
	HTLabel.style.display = Labels[(i + 1) % Labels.length];  HTInput.style.display = Inputs[(i + 1) % Inputs.length];

}

// *******************************************************************************************************************************

function TravTypeSwap() {

// Changes the traverse fields area between azimuth method and horizontal angle method
// Input:  None
// Output: Changed title link and input areas of the traverse area

// Get elements to be changed

	var Title = qG('TravType');
	var Ang = qG('TravValueAngLabel');
	var BSLabel = qG('TravValueBSLabel');
	var BSInput = qG('TravBS');

// Change the elements' inner HTML to the next values in the cycle

	var Titles = ['Azimuth', 'Angle'];
	var Angs = ['Az:', 'HA:'];
	var ADescs = ['Azimuth', 'Horizontal Angle'];
	var Labels = ['none', 'inline'];
	var Inputs = ['none', 'inline'];

	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}

	Title.innerHTML = Titles[(i + 1) % Titles.length];
	Ang.innerHTML = Angs[(i + 1) % Angs.length];
	$(Ang).attr('data-desc', ADescs[(i + 1) % ADescs.length]);	
	BSLabel.style.display = Labels[(i + 1) % Labels.length];
	BSInput.style.display = Inputs[(i + 1) % Inputs.length];

}

// *******************************************************************************************************************************

function SolverSwap() {

// Changes the solver fields area between triangle solver and circular curve solver
// Input:  None
// Output: Changed title link and input areas of the solver area

// Get elements to be changed

	var Inputs = new Array();

	Inputs[0] = ['A', 'B', 'C', 'aa', 'bb', 'cc'];
	Inputs[1] = ['Rad', 'Delta', 'Tang', 'Len', 'Chord'];

	var Title = qG('SolverTitle');

// Change the elements' inner HTML to display or not, the opposite of what they currently are

	var Titles = ['Triangle', 'Curve'];
	for (var i=0; i<Titles.length; i++) {if (Title.innerHTML == Titles[i])  break;}
	Title.innerHTML = Titles[(i + 1) % Titles.length];

	var j = (i + 1) % Inputs.length;

	for (var k=0; k<Inputs[0].length; k++) {

		if (k < Inputs[i].length) qG('Solver' + Inputs[i][k]).style.display = 'none';
		if (k < Inputs[i].length) qG('Solver' + Inputs[i][k] + 'Label').style.display = 'none';
		if (k < Inputs[j].length) qG('Solver' + Inputs[j][k]).style.display = 'inline';
		if (k < Inputs[j].length) qG('Solver' + Inputs[j][k] + 'Label').style.display = 'inline';

	}

	var State = qG('SolverCanvasSt');  var Tri = 'SketchTriangle(\'\', \'SVGCanvas\')';  var Crv = 'SketchCurve(\'\', \'SVGCanvas\')';

	if (State.value == Tri) {State.value = Crv;  eval(State.value);  ZoomSketch(0, 0, 0);}
	else if (State.value == Crv) {State.value = Tri;  eval(State.value);  ZoomSketch(0, 0, 0);}

}

// *******************************************************************************************************************************

function LabelSwap() {

// Changes the sketch point labelling type
// Input:  None
// Output: Changed link and point labels

// Get elements to be changed

	var Title = qG('LabelLink');

// Toggle through the point display options

	var Titles = ['Point Name', 'Elevation', 'Description', 'None'];
	
	var currentState = Title.innerHTML.split('</i>');
	
	for (var i=0; i<Titles.length; i++) {if (currentState[1] == Titles[i])  break;}
	Title.innerHTML = currentState[0] + '</i>' + Titles[(i + 1) % Titles.length];

// Redraw Canvas

	var Header = qG('header').innerHTML;
	eval(qG(Header + 'CanvasSt').value);

}

// *******************************************************************************************************************************

function qInfo(element, contents, messageType) {

// Forms help/info prompt for given element
// Input:  Element's "this", ID of existing help/info contents, message class
// Output: The required prompt, focus on the calling element once closed

	$.prompt(qG(contents).innerHTML, {classes: {message: messageType}, submit: function(){if (element) {qF(element.id);}}, close: function(){if (element) {qF(element.id);}}});

}

// *******************************************************************************************************************************

function qError(element, ErrorStr, Header, messageType) {

// Forms error prompt for given element
// Input:  Element's "this", error contents, message class
// Output: The required prompt, focus on the calling element once closed

	$.prompt(qP(ErrorStr, Header), {classes: {message: messageType}, submit: function(){if (element) {qF(element.id);}}, close: function(){if (element) {qF(element.id);}}});

}

// *******************************************************************************************************************************

function qNext() {

// Moves the focus to the next available element in a form, triggering a click in special cases
// Input:  None (function called when enter pressed or objects selected from sketch)
// Output: The focused element, triggered click if appropriate

	if (window.prevFocus) {

		var nextElem = window.prevFocus.parent().next();
		
		for (var i=0; i<20; i++) {

// Skip suggest divs
		
			if (nextElem.not('p').length > 0) {nextElem = nextElem.next();}

// Skip hidden inputs
			
			else if (nextElem.children('input').length > 0) {
				
				if (nextElem.children('input:hidden').length > 0) {nextElem = nextElem.next();}
				else {nextElem = nextElem.children('input'); break;}
				
			}

// Go to first link, not second
			
			else if (nextElem.children('a').length > 0) {nextElem = nextElem.children('a:first'); break;}
			
			else {nextElem = nextElem.next();}
			 
		}

// Focus result, trigger if link
		
		if (nextElem) {
		
// Blur for value check, move to next field if no error prompt found
		
			window.prevFocus.blur();
			
			if ($('div.jqi').length < 1) {
		
				nextElem.focus().select();
				if (nextElem.is('a')) {nextElem[0].click();}
		
			}
	
		}
		
	}

}

// *******************************************************************************************************************************

function qG(id) {return document.getElementById(id);}

// Makes getting an element by ID from the document shorter
// Input:  ID of element to get
// Output: The document DOM object corresponding to the ID

// *******************************************************************************************************************************

function qF(id) {

// Focuses an element, selects if possible, prevents event bubbling
// Input:  ID of element to focus
// Output: The focused element

	$('#' + id).focus();
	if ($('#' + id).is('input')) {$('#' + id).select();}

}
