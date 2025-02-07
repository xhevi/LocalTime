// content.js
(function() {
    const timezones = {
        "PT": "America/Los_Angeles",
        "PST": "America/Los_Angeles",
        "PDT": "America/Los_Angeles",
        "ET": "America/New_York",
        "EST": "America/New_York",
        "EDT": "America/New_York",
        "CET": "Europe/Berlin",
        "CEST": "Europe/Berlin",
        "GMT": "Etc/GMT",
        "UTC": "Etc/UTC",
        "IST": "Asia/Kolkata",
        "JST": "Asia/Tokyo",
        "KST": "Asia/Seoul",
        "CST": "Asia/Shanghai",
        "AEST": "Australia/Sydney",
        "ACST": "Australia/Adelaide",
        "AWST": "Australia/Perth",
        "EAT": "Africa/Nairobi",
        "SAST": "Africa/Johannesburg",
        "WAT": "Africa/Lagos",
        "BRT": "America/Sao_Paulo",
        "ART": "America/Argentina/Buenos_Aires",
        "CLT": "America/Santiago"
    };

    function getCorrectTimezoneAbbreviation() {
        const localOffsetFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timeZoneName: "longOffset"
        });
        const localOffsetParts = localOffsetFormatter.formatToParts(new Date());
        const localOffsetString = localOffsetParts.find(part => part.type === "timeZoneName").value;
        const gmtOffset = parseFloat(localOffsetString.replace("GMT", ""));
        
        const gmtMapping = {
            "-8": "PST",
            "-7": "PDT",
            "-5": "EST",
            "-4": "EDT",
            "0": "GMT",
            "1": "CET",
            "2": "CEST",
            "3": "EAT",
            "5.5": "IST",
            "8": "CST",
            "9": "JST",
            "9.5": "ACST",
            "10": "AEST",
            "-3": "ART",
            "-4": "CLT",
            "-6": "CST"
        };
        
        return gmtMapping[gmtOffset] || localOffsetString;
    }

    function convertTime(text) {
        const regex = /\b(\d{1,2}):?(\d{2})?\s*(a\.?m\.?|p\.?m\.?|AM|PM|am|pm)?\s*(-\s*(\d{1,2}):?(\d{2})?\s*(a\.?m\.?|p\.?m\.?|AM|PM|am|pm)?)?\s*(PT|PST|PDT|ET|EST|EDT|CET|CEST|GMT|UTC|IST|JST|KST|CST|AEST|ACST|AWST|EAT|SAST|WAT|BRT|ART|CLT)\b/gi;
        return text.replace(regex, (match, startHour, startMinute = "00", startMeridian, _, endHour, endMinute = "00", endMeridian, tz) => {
            const timezone = timezones[tz.toUpperCase()];
            if (!timezone) return match;

            function convertSingleTime(hour, minute, meridian) {
                hour = parseInt(hour, 10);
                minute = parseInt(minute, 10);

                if (meridian) {
                    meridian = meridian.replace(/\./g, '').toUpperCase();
                    if (meridian === "PM" && hour < 12) {
                        hour += 12;
                    } else if (meridian === "AM" && hour === 12) {
                        hour = 0;
                    }
                }

                // Get correct UTC offset for the source timezone
                const sourceOffsetFormatter = new Intl.DateTimeFormat("en-US", {
                    timeZone: timezone,
                    timeZoneName: "longOffset"
                });
                const sourceOffsetParts = sourceOffsetFormatter.formatToParts(new Date());
                const sourceOffsetString = sourceOffsetParts.find(part => part.type === "timeZoneName").value;
                const sourceOffsetHours = parseFloat(sourceOffsetString.replace("GMT", ""));
                
                // Convert source time to UTC manually
                const utcTime = new Date(Date.UTC(
                    new Date().getUTCFullYear(),
                    new Date().getUTCMonth(),
                    new Date().getUTCDate(),
                    hour - sourceOffsetHours, // Adjust by offset hours
                    minute
                ));

                // Convert UTC to local timezone
                const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const convertedTime = new Date(utcTime.toLocaleString("en-US", { timeZone: localTimeZone }));
                const timezoneAbbreviation = getCorrectTimezoneAbbreviation();
                
                return convertedTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) + ' ' + timezoneAbbreviation;
            }

            let convertedStart = convertSingleTime(startHour, startMinute, startMeridian);
            let convertedEnd = endHour ? convertSingleTime(endHour, endMinute, endMeridian) : null;
            let formattedTime = convertedEnd ? `${convertedStart} - ${convertedEnd}` : convertedStart;
            
            return `<span style="background-color: white; color: black; padding: 2px; border-radius: 3px; position: relative; display: inline-block;">
                        <span class="converted-time" style="background-color: white; color: black; padding: 2px; border-radius: 3px;">${formattedTime}</span>
                        <span class="tooltip" style="visibility: hidden; position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 4px 6px; border-radius: 3px; white-space: nowrap; font-size: 12px; z-index: 1000;">
                            ${match}
                        </span>
                    </span>`;
        });
    }

    function scanAndReplace(node) {
        if (node.nodeType === 3) {
            let newText = convertTime(node.nodeValue);
            if (newText !== node.nodeValue) {
                const span = document.createElement("span");
                span.innerHTML = newText;
                let convertedTime = span.querySelector(".converted-time");
                let tooltip = span.querySelector(".tooltip");
                convertedTime.onmouseover = function() {
                    tooltip.style.visibility = "visible";
                };
                convertedTime.onmouseout = function() {
                    tooltip.style.visibility = "hidden";
                };
                node.replaceWith(span);
            }
        } else {
            node.childNodes.forEach(scanAndReplace);
        }
    }

    scanAndReplace(document.body);
})();
