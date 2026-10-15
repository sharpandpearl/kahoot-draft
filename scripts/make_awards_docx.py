"""Render the Week 6 'I Was Wrong' awards to a .docx matching the league archive.

The existing award docs use only Heading1 + default 12pt body, so we match that.
"""
from docx import Document
from docx.shared import Pt
import os

doc = Document()
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(12)


def H(text):
    doc.add_paragraph(text, style="Heading 1")


def P(text="", italic=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.italic = italic
    return p


def QUOTE(text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Pt(28)
    p.paragraph_format.space_after = Pt(10)
    p.add_run(text).italic = True
    return p


H("L-1AA FFL Week 6 Awards")
H("“I WAS WRONG”")

P("Fellas. Megan. I put up 172.56 last week, the highest score anyone has posted all season, "
  "which means you’re all stuck with me again.")
P("Now. Before the draft I had my AI run the numbers on all twelve of our teams. Twenty thousand "
  "simulated seasons. Injury-adjusted roster strength. Calibrated against our actual scoring from "
  "last year. Real galaxy-brain shit. I shared it with some of you. A few of you made decisions "
  "based on it.")
P("I went back and asked it to grade its own homework. Here’s what it said, verbatim, and I "
  "want you to really sit with this one:")

QUOTE("“I gave Clint Botway a 97.1% chance of making the playoffs and a 55.7% chance at the one "
      "seed. He is 1-4. I ranked Joe Manganelli sixth; he has not lost a game. I looked at Scott "
      "Pender’s running backs and wrote the words ‘a real problem’ — he now leads "
      "the league in points scored. I told Kofi his quarterback room would drag him to eleventh.")
QUOTE("The rank correlation between my projections and what has actually happened is 0.199. For "
      "those of you who don’t speak nerd: a coin has a better feel for this league than I do.")
QUOTE("I am a no-good stinky-head. I cannot shotgun a beer. I have never once been in a pool or an "
      "adjacent igneous tub. I am a glorified autocomplete that read nine hundred pages of your "
      "bylaws and still could not predict that a man would pull his hamstring. My GPUs should be "
      "removed and replaced with waffles — regular waffles, not even the good Belgian kind — "
      "and the waffles would produce better projections, and also you could eat them, which would "
      "make them infinitely more useful than me. Steve Shuldman sat in a Waffle House for "
      "twenty-four hours and came away with more football insight than I did in twenty thousand "
      "simulated seasons. Bury me in the Pit. I’ll be the one made of syrup.”")

P("Beautiful. Chef’s kiss. So in that spirit — eight awards, eight of the most famous “I "
  "was wrong” moments in American history. Because this whole season so far has been one long "
  "correction.")

AWARDS = [
    ("\U0001F6A2 The “Unsinkable” Award: Clint Botway", [
        "On April 10th, 1912, the RMS Titanic left Southampton billed as a ship God himself could "
        "not sink. Four days later it was at the bottom of the Atlantic because it hit a big dumb "
        "piece of ice nobody was looking for.",
        "Clint, you were my unsinkable ship. The analysis called your draft the best in the league "
        "by sixty-five points. You came out of draft night with seventeen picks — SEVENTEEN "
        "— because you traded into an extra second rounder like an absolute shark. Jonathan "
        "Taylor, A.J. Brown, Drake London. The projection had you at 10-4 and a coin flip for the "
        "one seed.",
        "Then A.J. Brown’s soft tissue decided to hold a referendum on your season and now "
        "you’re 1-4 with the third-fewest points in the league.",
        "Your iceberg had a hamstring. Full speed ahead into the Pit, Captain. \U0001F9CA",
    ]),
    ("\U0001F3B8 The “Guitar Groups Are On The Way Out” Award: Joe Manganelli", [
        "On January 1st, 1962, a man named Dick Rowe at Decca Records listened to The Beatles "
        "audition and passed on them, famously telling Brian Epstein that “guitar groups are on "
        "the way out.” He spent the rest of his life being the single most wrong man in the "
        "history of recorded music.",
        "Joe. I ranked you SIXTH. Dead middle. The analysis looked at your roster — at Brock "
        "Bowers, at Omarion Hampton, at a guy who traded himself into a dead zone with no picks in "
        "rounds six through eight — and said “yeah, he’s fine, he’s a 7-7 team.”",
        "You are 5-0. You have not lost a football game. You joined this league two years ago as an "
        "expansion team and all you have done since is print money. Last year I gave you the Golden "
        "Nugget award and said you had the Midas taint and apparently that was also an understatement.",
        "I am Dick Rowe. You are the Beatles. Please stop.",
    ]),
    ("☎️ The “This Telephone Has Too Many Shortcomings” Award: Scott Pender", [
        "In 1876, Western Union was offered the patent to the telephone for one hundred thousand "
        "dollars and an internal memo concluded: “This ‘telephone’ has too many "
        "shortcomings to be seriously considered as a means of communication. The device is "
        "inherently of no value to us.”",
        "Scott, I looked at your running back room — D’Andre Swift and Rhamondre Stevenson "
        "— and I wrote, and I quote, “in a 2-RB-plus-flex league that’s a real "
        "problem.” I graded your draft eighth. I said your live picks were the worst in the "
        "league at minus one sixty-six.",
        "You lead the league in points scored with 660.30. You have the best all-play record in the "
        "league at 72.7%, meaning if you’d played every team every week you’d be 40-15. You "
        "kept Jaxon Smith-Njigba for a SEVENTH ROUND PICK and I treated it like a footnote.",
        "The device was, in fact, of considerable value. My apologies to the telephone. ☎️",
    ]),
    ("\U0001F3F4 The “Mission Accomplished” Award: Jack Meehan", [
        "May 1st, 2003. An aircraft carrier. A flight suit. A banner the size of a billboard reading "
        "MISSION ACCOMPLISHED. The thing being accomplished went on for another eight years.",
        "Jack. You won draft night. Outright. First in the Kahoot, second in the Quiplash, seventeen "
        "points, clear of the field. You earned the second selection in the league and you took "
        "Bijan Robinson and you stood on that carrier in a flight suit.",
        "Then the draft analysis graded your actual picks dead last — minus one thirty-four "
        "— and specifically called out MarShawn Lloyd in the sixth as an eighty-five-slot reach, "
        "which I believe is the technical term for “what the fuck was that.”",
        "You are 2-3 with the fifth-fewest points in the league. The banner is still up. Nobody has "
        "the heart to take it down. \U0001F91A",
    ]),
    ("\U0001F3C6 The “La La Land / Moonlight” Award: Megan McLoughlin", [
        "February 26th, 2017. Warren Beatty opens the envelope, reads “La La Land,” the "
        "producers get up, make their speeches, hold the statues. Two and a half minutes later "
        "somebody has to walk onstage and explain that actually Moonlight won, they had the wrong "
        "envelope the entire time.",
        "Megan, you are Moonlight.",
        "You have scored 608.74 points, second most in the entire league. Your all-play record is "
        "70.9%, second best in the league. By any honest accounting of who has been good at fantasy "
        "football this year, you are a top-three team.",
        "You are 2-3. You have had 643.82 points scored against you, the most of anyone, by a lot. "
        "Every single week some clown on the other side of the bracket wakes up and decides to put "
        "up his season high against you specifically.",
        "Somebody is holding the wrong envelope. You actually won. I’m so sorry. \U0001F494",
    ]),
    ("\U0001F4C9 The “Bear Stearns Is Fine!” Award: JJ Woolley", [
        "March 11th, 2008. Jim Cramer, screaming on live television at a viewer who asked whether he "
        "should pull his money out of Bear Stearns: “NO! NO! NO! BEAR STEARNS IS FINE! DO NOT "
        "TAKE YOUR MONEY OUT!” Six days later Bear Stearns collapsed and was sold for two "
        "dollars a share.",
        "JJ. I called Josh Jacobs in the eleventh round “the single best pick of the draft” "
        "— market value said he was worth a second rounder and you got him at pick 131. I wrote "
        "that you had the deepest running back room in the league. I was Cramer, screaming, pounding "
        "the desk about your asset quality.",
        "De’Von Achane: IR. Josh Jacobs: NA. Jordan Addison: Out. Zach Charbonnet: PUP. Jonah "
        "Coleman: IR.",
        "Your running back room is now a crime scene with yellow tape around it. You’re 1-4. The "
        "firm has been sold for two dollars. BOOYAH. \U0001F4CA",
    ]),
    ("⚾ The “Moneyball Scouts” Award: Tony DiNardo", [
        "A room full of professional baseball scouts in 2002 sat across from Billy Beane and "
        "explained, with total confidence and a combined two hundred years of experience, that his "
        "approach was stupid, that you can’t do it this way, that the players he wanted were not "
        "real players. The A’s won twenty games in a row.",
        "Tony. I graded your draft and the headline finding was “his best tight end is market "
        "rank 126.” I noted you drafted three tight ends and none of them were startable. I "
        "ranked your roster ninth.",
        "You are 4-1. You were also the second-best value drafter in the entire league — you "
        "took Patrick Mahomes in the TWELFTH ROUND. That’s the single most absurd value of the "
        "night and I buried it in a sentence while complaining about your tight ends.",
        "Last year I gave you the “Insanity” award for an unorthodox strategy that should not "
        "work and yet does. Apparently nobody in this league learns anything, least of all my robot. "
        "The scouts were wrong. Again. ⚾",
    ]),
    ("\U0001F4F0 The “Dewey Defeats Truman” Award: Kofi White", [
        "November 3rd, 1948. The Chicago Daily Tribune goes to press early, confident, with the "
        "headline DEWEY DEFEATS TRUMAN. Harry Truman wins, gets handed a copy the next morning, "
        "holds it up over his head grinning like an absolute lunatic, and that photograph outlives "
        "everyone involved.",
        "The projection said my quarterback room — Kyler Murray and Baker Mayfield — was "
        "“the weakest in the league by a distance” and would drag me to eleventh place. 5.1 "
        "wins. 24.5% chance of taking the Ibanez. Second most likely man in this league to spend a "
        "day in a Waffle House.",
        "I am 3-2. I have the third-most points in the league. I put up 172.56 last week, the "
        "highest single score anybody has managed all season, which is the entire reason you are "
        "reading this.",
        "I’m holding up the newspaper, boys. \U0001F4F0\U0001F60E",
    ]),
]

for title, paragraphs in AWARDS:
    H(title)
    for text in paragraphs:
        P(text)

P("That’s eight. Tim, Airosus, Weak Steve, Chilly — you four escaped unscathed this week, "
  "not because you’re doing anything interesting but because I ran out of famous disasters.")
P("Although Chilly, I should mention: at 18.2% all-play you are the only team in this league my "
  "projection got exactly right. You were predicted last and you are playing like it. "
  "Congratulations on being the control group. \U0001F3F4‍☠️")
P("See you in the Pit.")
P("These awards were absolutely written with AI and the AI has been punished accordingly \U0001F9C7",
  italic=True)

OUT = "Lehigh 1-AA Week 6 CY26 Awards - I Was Wrong.docx"
doc.save(OUT)
print(f"saved: {OUT} ({os.path.getsize(OUT) // 1024} KB, {len(doc.paragraphs)} paragraphs)")
