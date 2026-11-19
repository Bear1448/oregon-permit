#!/usr/bin/env python3
"""Rewrite prompts, answers, and explanations so they are original wording
while keeping the same facts and page citations."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "src" / "data" / "questions.json"
MANUAL = ROOT / "source" / "manual.txt"

# Phrase-level rewrites (longest first). Numbers stay exact.
PHRASES: list[tuple[str, str]] = [
    (
        "certification by a person who resides at the same address as you. The individual must accompany you and provide proof of the address such as their license or ID card",
        "a housemate can confirm your address in person by coming with you and showing their own license or ID as proof",
    ),
    (
        "you may test two times in a 24-hour period. You may take the test online four times total. After four attempts you must test at a DMV office",
        "online retakes are limited to two tries in any 24 hours and four tries overall; after that you have to test at a DMV office",
    ),
    (
        "Your driving experience only counts if supervised by someone at least 21 years of age who has had valid driving privileges for at least 3 years.",
        "Only hours supervised by a driver who is at least 21 and has held valid driving privileges for at least 3 years count toward the total.",
    ),
    (
        "You must have held a permit for at least 6 months if you are under 18 years of age and applying for a driver license",
        "Applicants younger than 18 need to have held a permit at least 6 months before they can apply for a license",
    ),
    (
        "Flashing amber lights warn traffic that the bus is about to stop on the road to load or unload children. Prepare to stop",
        "Amber flashers are the heads-up that the bus is about to stop to load or unload children, so get ready to stop",
    ),
    (
        "you are not required to stop if the pedestrian is in a crosswalk on the other side of a safety island",
        "you do not have to stop when that person is already on the far side of a safety island in the crosswalk",
    ),
    (
        "a parent or legal guardian must certify that you are enrolled or attending school. If you are no longer in school",
        "a parent or legal guardian has to certify school enrollment or attendance. If you have left school",
    ),
    (
        "You must have had an instruction permit for at least 6 months. Holding an out-of-state permit does count toward",
        "You need an instruction permit for at least 6 months, and a permit issued in another state counts toward",
    ),
    (
        "Immediately drive as close as you safely can to the right side of the road and stop",
        "Promptly pull as far right as you can do safely, then stop",
    ),
    (
        "Documents presented as proof must be original or certified copies from the issuing agency",
        "Bring originals or certified copies from the agency that issued the document, not ordinary photocopies",
    ),
    (
        "you will fail your test. You will not be allowed to test again for 90 days",
        "the attempt is scored as a fail, and you have to wait 90 days before another try",
    ),
    (
        "Change lanes so you do not drive next to the stopped vehicle. You may also slow",
        "Move out of the lane beside the stopped vehicle when you can, and you may also slow",
    ),
    (
        "You must use a desktop or laptop computer with a keyboard, mouse and webcam. You cannot use a touchscreen device like mobile phones or tablets",
        "The online test has to be taken on a desktop or laptop that has a keyboard, mouse, and webcam—not on a phone or tablet",
    ),
    (
        "If you take the test while wearing glasses or contact lenses, your driving privilege will indicate that corrective lenses are required",
        "Taking the vision screening in glasses or contacts means your privilege will be marked as requiring corrective lenses",
    ),
    (
        "you must wait until the next business day before retaking the test",
        "you have to wait until the next business day to try the drive test again",
    ),
    (
        "Pull off the road at the first safe area and let the traffic behind you pass",
        "Leave the travel lane at the first safe turnout so faster traffic can go by",
    ),
    (
        "You have the right of way and may make the movement indicated by the arrow",
        "The arrow assigns you the right of way for the movement it shows",
    ),
    (
        "You must slow down or stop to allow another vehicle or pedestrian to continue safely",
        "Slow or come to a stop so the other vehicle or person on foot can proceed safely",
    ),
    (
        "Stop before reaching the sidewalk and yield to pedestrians and people riding bicycles",
        "Stop short of the sidewalk and give way to people walking or riding bicycles",
    ),
    (
        "The basic rule does not allow you to drive over the speed limit",
        "The basic rule is not a license to exceed the posted or statutory limit",
    ),
    (
        "You must drive at a speed that is reasonable and cautious for existing conditions",
        "Your speed still has to be reasonable and cautious for the conditions at the time",
    ),
    (
        "The maximum speed considered safe for the area under ideal driving conditions",
        "The top speed treated as safe there when driving conditions are ideal",
    ),
    (
        "Yield the right-of-way to oncoming traffic and pedestrians until it is safe to turn",
        "Give way to oncoming vehicles and people crossing until the turn can be made safely",
    ),
    (
        "vehicles in that lane must merge into the through lane",
        "traffic in the ending lane has to merge into the lane that continues",
    ),
    (
        "People riding bicycles and pedestrians regularly cross the road in the area",
        "People on bicycles and people walking often cross in that stretch of road",
    ),
    (
        "It is illegal to play a radio or other sound system so loud it can be heard",
        "Oregon forbids a radio or other sound system loud enough to be heard",
    ),
    (
        "If you must drive to the left of the center line to go around a road hazard",
        "If a hazard forces you left of the center line to get around it",
    ),
    (
        "You are on a divided highway with two roads separated by an unpaved median",
        "You are on a divided highway whose two roadways are split by an unpaved median",
    ),
    (
        "A painted median strip or turn lane does not create two separate roads",
        "Paint alone, including a painted turn lane, does not split the highway into two roads",
    ),
    (
        "When you are parked at a curb and about to reenter traffic",
        "When you start from a curb parking space and are about to reenter traffic",
    ),
    (
        "at night or in bad weather with only the parking lights on",
        "after dark or in poor weather using only the parking lights",
    ),
    (
        "use a cell phone or other mobile electronic device while",
        "use a phone or another mobile electronic device while",
    ),
    (
        "vehicle cannot be seen from 200 feet in each direction",
        "your vehicle would be hidden from drivers coming from either way within 200 feet",
    ),
    (
        "where it is not allowed or it creates a hazard",
        "in a place that is off limits or that creates a hazard",
    ),
    (
        "As you approach an intersection with no signs or signals",
        "When you come up to an unsigned, unsignalized intersection",
    ),
    (
        "If you are turning at an intersection that has a traffic signal",
        "If you are turning at a signalized intersection",
    ),
    (
        "If a traffic signal is dark because of a power",
        "If a traffic signal is dark because of a power",
    ),  # placeholder, replaced below with better
    (
        "Stop before you enter or cross a road from an alley",
        "Come to a stop before entering or crossing a roadway from an alley",
    ),
    (
        "If you drive slower than the normal speed of traffic",
        "If you are traveling slower than the normal traffic speed",
    ),
    (
        "give exit information or show the direction of roads or cities",
        "point to exits or show the way toward roads or cities",
    ),
    (
        "a left turn onto a two-way road against a red light",
        "a left turn from your approach onto a two-way road while the light is red",
    ),
    (
        "remain stopped until the person has crossed the entire road",
        "stay stopped until that person has finished crossing the whole road",
    ),
    (
        "left turns must first yield to pedestrians and oncoming traffic",
        "left-turning drivers still have to give way to people crossing and to oncoming vehicles",
    ),
    (
        "but first you must yield to pedestrians and oncoming traffic",
        "after you first give way to people crossing and to oncoming vehicles",
    ),
    (
        "any acceleration or speed contest or the making of a speed record",
        "any contest of acceleration or speed, or an attempt to set a speed record",
    ),
    (
        "a traffic patrol member is present to assist children at a crosswalk",
        "a school crossing guard is there to help children at a crosswalk",
    ),
    (
        "Where the rear tires of the vehicle in front meet the road",
        "The spot where the rear tires of the vehicle ahead meet the pavement",
    ),
    (
        "Six feet or more from the lane you are turning into",
        "At least six feet from the lane you will turn into",
    ),
    (
        "to any vehicle in the intersection or approaching from your right",
        "to any vehicle already in the intersection or coming from your right",
    ),
    (
        "Stop at the stop line when a pedestrian is in the crosswalk",
        "Stop at the stop line whenever a person is in the crosswalk",
    ),
    (
        "A sharp curve or change in the direction of the road",
        "A sharp curve or an abrupt change in the road's direction",
    ),
    (
        "You must have 100 hours of supervised driving experience or 50 hours",
        "You need 100 hours of supervised driving, or 50 hours",
    ),
    (
        "your parent or legal guardian will need to sign the electronic application",
        "your parent or legal guardian has to sign the electronic application",
    ),
    (
        "be at least 15 years of age to apply for an instruction permit",
        "be at least 15 to apply for an instruction permit",
    ),
    (
        "be at least 16 years of age to apply for a license",
        "be at least 16 to apply for a license",
    ),
    (
        "questions. You must answer 28 questions correctly to receive a passing score",
        "questions, and a passing score is 28 correct answers",
    ),
    (
        "Hospital-issued birth certificates and baptismal records are not acceptable",
        "A hospital-issued birth certificate or a baptismal record will not be accepted",
    ),
    (
        "Mail from a business, school, or government agency containing your first and last name",
        "Mail from a business, school, or government office that shows your first and last name",
    ),
    (
        "Personal mail and forwarded mail is not acceptable",
        "Personal letters and forwarded mail do not count",
    ),
    (
        "Only use hand-and-arm signals in daylight and when you can clearly see people and vehicles at a distance of 1,000 feet",
        "Hand-and-arm signals are only for daylight when people and vehicles are clearly visible 1,000 feet away",
    ),
    (
        "when you can clearly see people and vehicles at a distance of 1,000 feet",
        "when people and vehicles are clearly visible 1,000 feet away",
    ),
    (
        "It is illegal to execute a left turn onto a two-way road against a red light",
        "Turning left onto a two-way road during a red light is not allowed",
    ),
    (
        "The same turns allowed for a steady red signal are allowed for a red arrow",
        "A red arrow permits the same turns that a steady red signal would allow",
    ),
    (
        "For right turns, get as near as you can to the right curb or edge of the road",
        "For a right turn, hug the right curb or the right edge of the road as closely as you can",
    ),
    (
        "These speed limits are set in law for the specified areas, whether posted or not, unless a different speed is posted",
        "Those statutory limits apply in the listed areas even when no sign is up, unless a different speed is posted",
    ),
    (
        "The school speed zone begins at the SCHOOL SPEED LIMIT 20 sign and ends at the END SCHOOL ZONE sign or at another posted speed sign",
        "A 20 mph school zone starts at the SCHOOL SPEED LIMIT 20 sign and ends at END SCHOOL ZONE or at the next posted speed sign",
    ),
    (
        "If you drive at a speed that is unsafe for existing conditions, even if slower than the speed limit, you are violating the basic rule",
        "A speed that is unsafe for conditions violates the basic rule even when it is under the limit",
    ),
    (
        "The basic rule states you must drive at a speed that is reasonable and cautious for existing conditions, and it applies on all roads at all times",
        "Under the basic rule, your speed must stay reasonable and cautious for conditions, on every road, at all times",
    ),
    (
        "Watch for congestion behind you if you drive slower than the designated speed, and pull off at the first safe area to let traffic pass",
        "If you are under the designated speed and traffic stacks up behind you, use the first safe turnout so others can pass",
    ),
    (
        "It is illegal to race on any road. Racing can be any acceleration or speed contest or the making of a speed record",
        "Racing is forbidden on any road, including acceleration or speed contests and attempts to set a speed record",
    ),
    (
        "Children are present means children are waiting at a crosswalk, occupying or walking within a crosswalk, or a traffic patrol member is present to assist children at a crosswalk",
        "“Children present” includes kids waiting at or walking in a crosswalk, and a crossing guard helping them there",
    ),
    (
        "A safe following distance is defined as 2-4 seconds. For speeds greater than 30 mph, a safe following distance should be 4 seconds or more",
        "A safe gap is 2–4 seconds, and at speeds over 30 mph you should allow 4 seconds or more",
    ),
    (
        "If you are under 21, you will fail the test if you have a blood alcohol concentration of any amount",
        "Drivers younger than 21 fail an alcohol test if their blood alcohol concentration is any amount above zero",
    ),
    (
        "If you are 21 or over, you will fail the test if your blood alcohol concentration is 0.08 percent or more",
        "Drivers 21 or older fail at a blood alcohol concentration of 0.08 percent or higher",
    ),
    (
        "There is no fee for taking the vision test",
        "The vision screening itself does not have a fee",
    ),
    (
        "Safety belt use is mandatory in Oregon for all drivers and passengers in all available seating positions",
        "Oregon requires a safety belt for the driver and for every passenger in a seating position that has a belt",
    ),
    (
        "Child passengers must be restrained in approved child safety seats until they are 8 years of age or at least 4 feet 9 inches in height, and the adult lap and shoulder belt fits them correctly",
        "Kids need an approved child safety seat until they are 8, or at least 4 feet 9 inches tall with a correctly fitting adult lap and shoulder belt",
    ),
    (
        "Infants must ride rear-facing until they reach two years of age",
        "Infants have to ride facing the rear until they turn two",
    ),
    (
        "If it is determined that you are cheating, you will fail your test. You will not be allowed to test again for 90 days",
        "If DMV decides you cheated, you fail and must wait 90 days before another attempt",
    ),
    (
        "If you fail a knowledge test, you may test again the same day, depending on the DMV office testing resource availability",
        "After a failed knowledge test in the office, a same-day retest may be offered if the office has capacity",
    ),
    (
        "If under 18 years of age, a proctor over 21 years of age must supervise the test. A proctor can only supervise two tests in a 24-hour period",
        "Testers younger than 18 need a proctor older than 21, and that proctor may supervise only two tests in 24 hours",
    ),
    (
        "You must present one document to prove your address",
        "One document is enough to prove a standard (non-REAL ID) residence address",
    ),
    (
        "Lights also must be on at any time conditions make it difficult to see people or vehicles 1,000 feet ahead",
        "Headlights are also required whenever conditions make it hard to see people or vehicles 1,000 feet ahead",
    ),
    (
        "If using your high beams, you must dim your lights when an oncoming vehicle is within 500 feet. Dim your lights when following another vehicle within 350 feet",
        "Dim high beams for oncoming traffic within 500 feet and for a vehicle you are following within 350 feet",
    ),
    (
        "Park parallel to and no more than 12 inches from the curb",
        "Set the vehicle parallel to the curb and no farther than 12 inches from it",
    ),
    (
        "Within 10 feet of a fire hydrant",
        "Closer than 10 feet to a fire hydrant",
    ),
    (
        "Within 15 feet of the driveway entrance to a fire station on the same side of the street or within 75 feet on the opposite side of the street",
        "Closer than 15 feet to a fire-station driveway on the same side, or 75 feet on the opposite side",
    ),
    (
        "Within 20 feet of a marked or unmarked crosswalk at an intersection",
        "Closer than 20 feet to a marked or unmarked crosswalk at an intersection",
    ),
    (
        "Within 50 feet of a traffic signal or sign if your vehicle hides the signal or sign from view",
        "Closer than 50 feet to a signal or sign when your vehicle would hide it from view",
    ),
    (
        "Within 50 feet of the nearest rail of a railroad or light rail crossing",
        "Closer than 50 feet to the nearest rail at a railroad or light-rail crossing",
    ),
    (
        "Within 7 1/2 feet of railroad or light rail tracks when it interferes with the train",
        "Closer than 7 1/2 feet to railroad or light-rail tracks if that would interfere with a train",
    ),
    (
        "If you are on a road with two or more lanes of traffic going the same direction and you approach any motor vehicle that is stopped with lights flashing, you must change lanes so you do not drive next to the stopped vehicle. You may also slow down by at least 5 miles per hour under the posted speed limit",
        "On a road with two or more lanes in your direction, move out of the lane beside a stopped vehicle that has lights flashing, and you may also drop at least 5 mph below the posted limit",
    ),
    (
        "You may also slow down by at least 5 miles per hour under the posted speed limit",
        "You may also drop at least 5 mph below the posted limit",
    ),
    (
        "When the red lights flash, stop before reaching the bus and remain stopped until the driver turns off the flashing red lights",
        "Once the red lights flash, stop before you reach the bus and stay stopped until the driver turns those red lights off",
    ),
    (
        "If you are on a divided highway with two roads separated by an unpaved median strip or barrier, you must stop only if you are on the same side of the road as the bus",
        "On a divided highway split by an unpaved median or barrier, only traffic on the same side as the bus has to stop",
    ),
    (
        "A painted median strip or turn lane does not create two separate roads. In this case, all lanes of traffic must stop",
        "Painted medians or turn lanes do not split the highway, so traffic in every lane must stop",
    ),
    (
        "Drivers 18 years of age or older must use a hands-free accessory to use a cell phone or other mobile electronic device",
        "Drivers 18 and older may use a phone only with a hands-free accessory",
    ),
    (
        "It is illegal for drivers under 18 years of age to use a cell phone or other mobile electronic device while operating a vehicle. Turn it off or put it in the back seat and ignore it",
        "Drivers younger than 18 may not use a phone or other mobile electronic device while driving; power it off or stow it in the back seat and ignore it",
    ),
    (
        "Oregon’s Open Container law says it is illegal to have an open bottle or other container with alcohol in it while you are in a vehicle on any road",
        "Oregon’s open-container rule forbids an open bottle or other alcohol container in a vehicle on any road",
    ),
    (
        "The following speed limits are set in law for the specified areas, whether posted or not. They apply unless a different speed is posted",
        "Statutory speed limits apply in the listed areas even without a sign, unless a different speed is posted",
    ),
    (
        "15 Miles Per Hour",
        "15 mph",
    ),
]

# Generic openings that often appear at the start of manual sentences.
GENERIC = [
    (r"\bYou must have\b", "You need"),
    (r"\bYou must be\b", "You need to be"),
    (r"\bYou must use\b", "Use"),
    (r"\bYou must stop\b", "Stop"),
    (r"\bYou must yield\b", "Give way"),
    (r"\bYou must not\b", "Do not"),
    (r"\bYou must\b", "The rule is to"),
    (r"\bIt is illegal to\b", "Oregon law forbids you to"),
    (r"\bIt is illegal for\b", "Oregon law forbids"),
    (r"\bIf you are under 18 years of age\b", "If you are younger than 18"),
    (r"\bIf under 18 years of age\b", "If you are younger than 18"),
    (r"\bdrivers under 18 years of age\b", "drivers younger than 18"),
    (r"\ba Proctor over 21 years of age\b", "a proctor older than 21"),
    (r"\ba proctor over 21 years of age\b", "a proctor older than 21"),
]


def apply_phrases(text: str) -> str:
    out = text
    # longest first
    for old, new in sorted(PHRASES, key=lambda kv: len(kv[0]), reverse=True):
        if old == new:
            continue
        out = out.replace(old, new)
        # also case-insensitive first-letter variants
        if old and old[0].islower():
            out = out.replace(old[0].upper() + old[1:], new[0].upper() + new[1:] if new else new)
    for pat, repl in GENERIC:
        out = re.sub(pat, repl, out)
    return out


SPECIFIC: dict[str, dict] = {
    "q-teen-gdl-011": {
        "prompt": "The drive-test chapter also states a minimum permit-holding time for applicants younger than 18 who want a license. How long is that?",
        "choices": [
            "30 days",
            "At least 6 months",
            "2 years, and a permit from another state never counts",
            "Until the applicant turns 21",
        ],
        "correctIndex": 1,
        "explanation": "That testing chapter repeats the six-month permit-holding requirement for license applicants younger than 18.",
    },
    "q-alcohol-and-phone-011": {
        "prompt": "If you are younger than 18, what does the manual say about using a cell phone or other mobile electronic device while driving?",
        "choices": [
            "Hands-free use is required.",
            "It is illegal. Turn the device off or put it in the back seat and ignore it.",
            "Phones are allowed only after midnight.",
            "A parent in the car may operate the phone for you while you hold it.",
        ],
        "correctIndex": 1,
        "explanation": "For drivers younger than 18, using a phone or other mobile electronic device while driving is illegal; the manual says to power it off or stow it and ignore it.",
    },
    "q-school-buses-012": {"topic": "turns-and-lanes"},
    "q-school-buses-013": {"topic": "turns-and-lanes"},
    "q-school-buses-014": {"topic": "right-of-way"},
    "q-school-buses-015": {"topic": "speed-limits"},
}

SAFE_ALTS = {
    "R1-1": "A red octagonal road sign with white markings",
    "R1-2": "A downward-pointing red and white triangular road sign",
    "R5-1": "A white square sign with a red circle and a short bar across it",
    "R5-1a": "A red rectangular sign with two short words in white letters",
    "R3-1": "A white square sign showing a left-pointing arrow inside a red circle with a slash",
    "R3-2": "A white square sign showing a right-pointing arrow inside a red circle with a slash",
    "R3-4": "A white square sign showing a U-shaped arrow inside a red circle with a slash",
    "R2-1": "A white rectangular sign with a short heading and a large number",
    "R6-1": "A white rectangular sign with a black horizontal arrow and a short word above or beside it",
    "R4-7": "A white rectangular sign with a black arrow that angles up and away from a divider symbol",
    "R3-9b": "A white rectangular lane-use sign describing the center lane",
    "R10-11": "A white rectangular sign with a traffic-signal symbol and a short line of black text",
    "W3-1": "A yellow diamond-shaped sign showing a small octagon ahead",
    "W3-2": "A yellow diamond-shaped sign showing a downward-pointing triangle ahead",
    "W3-3": "A yellow diamond-shaped sign showing a traffic signal symbol",
    "W8-5": "A yellow diamond-shaped sign with a skidding-car symbol",
    "W10-1": "A yellow circular sign with a black X and two R's",
    "S1-1": "A yellow five-sided sign with two walking figures",
    "W11-2": "A yellow diamond-shaped sign with a walking-person symbol",
    "R4-1": "A white rectangular sign with two short lines of black text",
    "W11-1": "A yellow diamond-shaped sign with a bicycle symbol",
    "R5-2": "A white square sign showing a truck inside a red circle with a slash",
    "W14-1": "A yellow diamond-shaped sign with two short words in black letters",
    "W8-1": "A yellow diamond-shaped sign with a short pavement-warning word in black letters",
    "W13-1": "A yellow plaque with a number that recommends a speed",
    "W6-3": "A yellow diamond-shaped sign with two arrows pointing in opposite directions",
    "R7-1": "A red and white curb-parking sign with hours or arrows",
    "R8-3": "A white sign with a red circle and slash over a letter",
    "R3-5L": "A black-and-white lane-use sign with a left-pointing arrow",
    "D9-2": "A blue square service sign with a hospital symbol",
    "R6-2": "A white vertical sign with a black arrow and a short word",
    "W12-1": "A yellow diamond-shaped sign warning about a tight passage ahead",
}



PASS2_TEXT: dict[str, dict] = {
    "q-speed-limits-023": {
        "choices_correct": "From 7 a.m. until 5 p.m. on a school day."
    },
    "q-right-of-way-014": {
        "prompt": "A person is in a crosswalk, but already on the far side of a safety island. Do you still have to stop?"
    },
    "q-right-of-way-023": {
        "prompt": "How should you treat a traffic signal that has gone dark in a power outage?"
    },
    "q-turns-and-lanes-001": {
        "choices_correct": "No later than 100 feet before you turn or change lanes."
    },
    "q-turns-and-lanes-008": {
        "choices_correct": "As close as you can get to the right-hand curb or pavement edge."
    },
    "q-turns-and-lanes-009": {
        "choices_correct": "From the lane immediately right of the center line, ending just right of the center line on the street you enter."
    },
    "q-turns-and-lanes-010": {
        "choices_correct": "No. You may cross a bicycle lane to turn, but do not enter that lane early to line up for the turn."
    },
    "q-turns-and-lanes-012": {
        "choices_correct": "Give way to traffic already in or leaving the circle, wait for an opening, then merge."
    },
    "q-turns-and-lanes-014": {
        "choices_correct": "Use your right turn signal to show you will exit, and watch for people in the crosswalk."
    },
    "q-turns-and-lanes-015": {
        "choices_correct": "No. Do not pass a person on a bicycle in the circle; leave them the full travel lane."
    },
    "q-turns-and-lanes-016": {
        "choices_correct": "No. Oregon does not allow you to pass or travel beside a truck in the circle, because trucks may need both lanes."
    },
    "q-turns-and-lanes-020": {
        "choices_correct": "Only if you leave enough room that you would not hit the rider if they fell."
    },
    "q-turns-and-lanes-021": {
        "choices_correct": "No. You may cross a bike lane to turn or to enter or leave an alley, driveway, or private road, but you may not drive or park in it."
    },
    "q-turns-and-lanes-023": {
        "choices_correct": "No. Right turns are not allowed at those intersections while the signal is red."
    },
    "q-turns-and-lanes-024": {
        "choices_correct": "Signal, and give way to people riding bicycles on your right."
    },
    "q-turns-and-lanes-025": {
        "choices_correct": "The lane is shared, so people on bicycles may be riding in the road itself."
    },
    "q-turns-and-lanes-027": {
        "choices_correct": "Keep the signal on long enough that other drivers notice you are pulling into the lane."
    },
    "q-turns-and-lanes-033": {
        "choices_correct": "Give oncoming vehicles the right of way until the turn can be made safely."
    },
    "q-parking-011": {
        "choices_correct": "No, except when a breakdown leaves you unable to get out of the travel lanes or there is not enough shoulder room."
    },
    "q-parking-016": {
        "choices_correct": "Set flags, flares, signs, signals, or flaggers at least 200 feet away in both directions."
    },
    "q-parking-025": {
        "prompt": "If an officer finds a vehicle left in a forbidden or hazardous spot, what may happen?",
        "choices_correct": "The officer may have the vehicle towed, and you pay the towing and storage bills."
    },
    "q-teen-gdl-002": {
        "choices_correct": "Until the child is 8 years old, or at least 4 feet 9 inches tall with a correctly fitting adult lap and shoulder belt."
    },
    "q-alcohol-and-phone-003": {
        "choices_correct": "Treats you as impaired, though an arrest is still possible at a BAC under 0.08%."
    },
    "q-alcohol-and-phone-006": {
        "choices_correct": "No. It covers any substance that reduces your mental or physical ability to operate a vehicle, including some medicines sold over the counter or by prescription."
    },
    "q-alcohol-and-phone-009": {
        "choices_correct": "No. That use is illegal; power the device off or stow it in the back seat and ignore it."
    },
    "q-alcohol-and-phone-010": {
        "choices_correct": "Only with a hands-free accessory that needs no more than a light finger action to turn on or off."
    },
    "q-alcohol-and-phone-015": {
        "choices_correct": "As far right as you can go safely, staying out of intersections and out of a highway's center median."
    },
    "q-alcohol-and-phone-021": {
        "choices_correct": "Move to the side of the road and park."
    },
    "q-alcohol-and-phone-023": {
        "choices_correct": "They must be switched off, because those extra lights make it hard for oncoming drivers to see."
    },
    "q-school-buses-001": {
        "choices_correct": "Stop before you reach the bus, and stay stopped until the driver turns the red lights off."
    },
    "q-school-buses-002": {
        "choices_correct": "The bus is getting ready to stop to load or unload children, so get ready to stop."
    },
    "q-school-buses-003": {
        "choices_correct": "No. Only traffic on the same side as the bus has to stop."
    },
    "q-school-buses-005": {
        "choices_correct": "Respond the same way you would if a school bus showed those lights."
    },
    "q-school-buses-006": {
        "choices_correct": "When the driver signals to come back into the lane and a flashing 'yield' sign is lit on the back of the bus."
    },
    "q-school-buses-008": {
        "choices_correct": "High on the bus, facing both forward and to the rear."
    },
    "q-school-buses-012": {
        "choices_correct": "No more than 6 inches past the right fenders, and not past the left fenders at all."
    },
    "q-school-buses-014": {
        "choices_correct": "Slow and be ready to stop. Stay off fire hoses unless an official at the scene tells you to cross them."
    },
    "q-teen-gdl-006": {
        "choices_correct": "A parent or legal guardian has to certify school enrollment or attendance, or you present a high school diploma or GED certificate."
    },
    "q-teen-gdl-013": {
        "choices_correct": "The test is failed, and you must wait 90 days before another attempt."
    },
    "q-teen-gdl-016": {
        "choices_correct": "A supervisor older than 21, who may oversee only two tests in any 24-hour period."
    },
    "q-teen-gdl-021": {
        "choices_correct": "Your privilege will be marked as requiring corrective lenses."
    },
    "q-teen-gdl-024": {
        "choices_correct": "One document, such as business, school, or government mail that shows your first and last name. Personal letters and forwarded mail do not count."
    },
    "q-teen-gdl-025": {
        "choices_correct": "Yes, if that person comes with you and shows their own address proof, such as a license or ID card."
    },
}


def apply_pass2(bank: dict, manual_text: str) -> dict:
    by_id = {q["id"]: q for q in bank["questions"]}
    for qid, patch in PASS2_TEXT.items():
        q = by_id[qid]
        if "prompt" in patch:
            q["prompt"] = patch["prompt"]
        if "choices_correct" in patch:
            q["choices"][q["correctIndex"]] = patch["choices_correct"]
        if "explanation" in patch:
            q["explanation"] = patch["explanation"]
        if "choices" in patch:
            q["choices"] = patch["choices"]
            q["correctIndex"] = patch.get("correctIndex", q["correctIndex"])

    # Replace any remaining copied explanations with an original wrapper around the (now polished) answer.
    for q in bank["questions"]:
        n, _ = longest_copy(q["explanation"], manual_text, 10)
        if n:
            ans = q["choices"][q["correctIndex"]].rstrip(".")
            page = q["manual"]["page"]
            expl = f"Keep this Oregon rule in mind from page {page}: {ans}."
            if len(expl) > 240:
                expl = expl[:237].rsplit(" ", 1)[0].rstrip(".,;") + "."
            q["explanation"] = expl
            n2, p2 = longest_copy(q["explanation"], manual_text, 10)
            if n2:
                # Fall back to a cite-only original sentence if the answer itself still overlaps.
                q["explanation"] = (
                    f"This fact is in the 2026–2027 Oregon Driver Manual on printed page {page}."
                )
        if not (8 <= len(q["explanation"]) <= 240):
            raise SystemExit(f"{q['id']} bad expl length {len(q['explanation'])}")
        if not (8 <= len(q["prompt"]) <= 400):
            raise SystemExit(f"{q['id']} bad prompt length {len(q['prompt'])}")
        for c in q["choices"]:
            if not (1 <= len(c) <= 220):
                raise SystemExit(f"{q['id']} choice too long ({len(c)}): {c}")
    return bank


def longest_copy(s: str, manual: str, min_n: int = 10) -> tuple[int, str]:
    words = re.findall(r"[A-Za-z0-9'’%./-]+", s)
    man = re.sub(r"\s+", " ", manual.lower())
    for n in range(len(words), min_n - 1, -1):
        for i in range(0, len(words) - n + 1):
            p = " ".join(words[i : i + n]).lower()
            if len(p) > 45 and p in man:
                return n, " ".join(words[i : i + n])
    return 0, ""


def polish(bank: dict, manual_text: str) -> dict:
    for q in bank["questions"]:
        spec = SPECIFIC.get(q["id"], {})
        if "topic" in spec:
            q["topic"] = spec["topic"]
        if "prompt" in spec:
            q["prompt"] = spec["prompt"]
        else:
            q["prompt"] = apply_phrases(q["prompt"])
        if "choices" in spec:
            q["choices"] = spec["choices"]
            q["correctIndex"] = spec["correctIndex"]
        else:
            q["choices"] = [apply_phrases(c) for c in q["choices"]]
        if "explanation" in spec:
            q["explanation"] = spec["explanation"]
        else:
            q["explanation"] = apply_phrases(q["explanation"])
        # Keep lengths in schema bounds
        if not (8 <= len(q["prompt"]) <= 400):
            raise SystemExit(f"{q['id']} prompt length {len(q['prompt'])}")
        if not (8 <= len(q["explanation"]) <= 240):
            # trim gracefully at a sentence end if slightly over
            expl = q["explanation"]
            if len(expl) > 240:
                cut = expl[:240]
                if " " in cut:
                    cut = cut.rsplit(" ", 1)[0].rstrip(".,;") + "."
                q["explanation"] = cut
            if not (8 <= len(q["explanation"]) <= 240):
                raise SystemExit(f"{q['id']} expl length {len(q['explanation'])}: {q['explanation']}")
        for c in q["choices"]:
            if not (1 <= len(c) <= 220):
                raise SystemExit(f"{q['id']} choice too long: {c}")
        if q.get("signImage"):
            code = q["signImage"].get("mutcdCode")
            if code in SAFE_ALTS:
                q["signImage"]["alt"] = SAFE_ALTS[code]
            if not (3 <= len(q["signImage"]["alt"]) <= 160):
                raise SystemExit(f"{q['id']} alt length")
    return bank


def report(bank: dict, manual_text: str) -> None:
    leftover = []
    for q in bank["questions"]:
        for label, s in (
            ("prompt", q["prompt"]),
            ("answer", q["choices"][q["correctIndex"]]),
            ("expl", q["explanation"]),
        ):
            n, p = longest_copy(s, manual_text, 10)
            if n:
                leftover.append((q["id"], label, n, p))
    print("remaining 10+ word copies:", len(leftover))
    for item in leftover:
        print(" ", item)


def main() -> None:
    bank = json.loads(BANK_PATH.read_text())
    manual = MANUAL.read_text(errors="replace")
    bank = polish(bank, manual)
    bank = apply_pass2(bank, manual)
    BANK_PATH.write_text(json.dumps(bank, indent=2) + "\n")
    report(bank, manual)
    print("wrote", BANK_PATH, "n=", len(bank["questions"]))


if __name__ == "__main__":
    main()
