// Create local date and get timezone
var rightNow = new Date();
var tz = String(String(rightNow).split("(")[1]).split(")")[0]; 

// Wait for document ready first
$( document ).ready(function() {
 	// Will match the following...
	// October 16 at 10 a.m. PDT @Apple
	// 8 a.m. PT @Oscars
	// 8:30 PM ET @Fox, @CNBC, @NBCSport
	var m = $('body').html().match(/\d{1,2}([:.]?\d{1,2})?([ ]?[a|p|A|P](.)?[m|M](.)]?)?([ ])?(PT|PDT|PST|ET|EDT|EST|MST|GMT)/g);
	console.log(m);

	// Convert and replace each match with the local time
	if (!$.isEmptyObject(m)) {
		$.each(m, function (k,v) {
			// console.log(k+"->"+v);
		 	
		 	if (v.indexOf("PT") >= 0) vs = v.replace("PT", "PST"); // Replace Pacific time with daylight vs. standard
		 	else if (v.indexOf("ET") >= 0) vs = v.replace("ET", "EST"); // Replace Eastern time with daylight vs. standard
		 	else vs = v;

			//console.log("k: "+k+" v: "+v+" vs:"+vs);
		 	if (Date.parse(vs)) {
		 	 	t = Date.parse(vs).toString("HH:mm")+" "+tz; // Convert to local time
		 	 	console.log(k+": "+v+"->"+t);
		 	 	jQuery('*').replaceText(v, "<span style='background-color:#eee'>"+t+"</span>");
		 	} else {
		 		console.log("Cannot parse: "+v);
		 	}
		 	
		});	
	} else {
		console.log("No match");
	}

});

// TODO
// Add click event to show back the original time
// Detect daylight when replacing PT and ET
// Add detection of possible day before hour to the regex (eg. September 8 at 9 am PT)
// Find a match when time is in more than one tag eg. http://www.hbo.com/
// Detect style of replaced element so that when replacing the background, text is still visible eg.http://scores.nbcsports.msnbc.com/fb/scoreboard.asp?week=13
// Detect pattern like this 8:00 PM - 9:00 PM ET eg. http://www.cnbcprime.com/schedule/
// Detect local time zone and remove from search pattern (eg. no need to replace CEST for me)

