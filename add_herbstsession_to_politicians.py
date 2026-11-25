import urllib.request
import json
import traceback

herbst_bills = [
    {
        "id": "bill-26-033",
        "voteId": 38963,
        "businessNumber": "26.033",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Freihandelsabkommen zwischen den EFTA-Staaten und Mercosur. Genehmigung",
        "summary": "Genehmigung des umfassenden Freihandelsabkommens zwischen den EFTA-Staaten und den Mercosur-Staaten (Brasilien, Argentinien, Uruguay, Paraguay) zur Senkung von Industriezöllen.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20260033"
    },
    {
        "id": "bill-25-059",
        "voteId": 38971,
        "businessNumber": "25.059",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "«Ja zum Importverbot für tierquälerisch erzeugte Pelzprodukte (Pelzinitiative)». Volksinitiative und indirekter Gegenvorschlag",
        "summary": "Volksinitiative und Gegenvorschlag für ein gesetzliches Einfuhrverbot von Pelzen und Pelzprodukten aus tierquälerischer Haltung oder grausamer Tötung.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20250059"
    },
    {
        "id": "bill-24-088",
        "voteId": 38955,
        "businessNumber": "24.088",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Volksinitiative «Für ein modernes Bürgerrecht (Demokratie-Initiative)»",
        "summary": "Verfassungsinitiative zur Festlegung einheitlicher Kriterien für die Einbürgerung nach vier Jahren rechtmässigem Aufenthalt in der Schweiz ohne Willkür.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20240088"
    },
    {
        "id": "bill-26-022-h",
        "voteId": 38961,
        "businessNumber": "26.022",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Bundesgesetz über die Unterstützung der Opfer der Brandkatastrophe von Crans-Montana vom 1. Januar 2026",
        "summary": "Schlussabstimmung über Bundesmittel zur Entschädigung und Unterstützung der Betroffenen der Brandkatastrophe im Wallis.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20260022"
    },
    {
        "id": "bill-23-051",
        "voteId": 38960,
        "businessNumber": "23.051",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Bundesgesetz über die Stromversorgung (Stromversorgungsgesetz, StromVG)",
        "summary": "Rahmengesetz für den schrittweisen Umbau der Stromversorgung, Stärkung der Marktintegration und Netzsicherheit in der Schweiz.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20230051"
    },
    {
        "id": "bill-24-081",
        "voteId": 38950,
        "businessNumber": "24.081",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Volksinitiative «Ja zum Importverbot für Stopfleber (Stopfleber-Initiative)»",
        "summary": "Eidgenössische Volksinitiative für ein Importverbot für Stopfleber (Foie gras) aus tierquälerischer Zwangsfütterung.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20240081"
    },
    {
        "id": "bill-23-468",
        "voteId": 38947,
        "businessNumber": "23.468",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Bundesgesetz über die Unverjährbarkeit von Mord (Änderung des Strafgesetzbuches)",
        "summary": "Aufhebung jeglicher Verjährungsfristen bei Morddelikten im Schweizerischen Strafgesetzbuch und Militärstrafgesetz.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20230468"
    }
]

print("Fetching member votes for all 7 Herbstsession bills with paging...")
herbst_records = {} # voteId -> { personNumber: decisionText }

for hb in herbst_bills:
    vid = hb["voteId"]
    m_dict = {}
    for skip in [0, 500]:
        url = f"https://ws.parlament.ch/odata.svc/Voting?$filter=IdVote%20eq%20{vid}&$skip={skip}&$top=500&$format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=12) as r:
                data = json.loads(r.read().decode('utf-8'))
                for it in data.get('d', []):
                    pnum = it.get('PersonNumber')
                    if pnum and pnum not in m_dict:
                        m_dict[pnum] = it.get('DecisionText', 'Hat nicht teilgenommen')
        except Exception as e:
            print(f"Error for vid {vid} skip {skip}: {e}")
    herbst_records[vid] = m_dict
    print(f"Vote {vid}: {len(m_dict)} members recorded")

# Load politicians.json
with open("c:/SFF/frontend/src/data/politicians.json", "r", encoding="utf-8") as f:
    politicians = json.load(f)

for p in politicians:
    p_num = None
    if p["id"].startswith("member-"):
        try:
            p_num = int(p["id"].split("-")[1])
        except:
            p_num = None

    is_nationalrat = p.get("council") == "Nationalrat"
    is_bundesrat = p.get("council") == "Bundesrat"
    is_president = p.get("isPresident", False)

    # 1. Update existing votes with session tag
    for v in p.get("recentVotes", []):
        dt = v.get("date", "")
        if "19-06-2026" in dt or "2026-06-19" in dt:
            v["session"] = "Sommersession 2026"
        elif "20-03-2026" in dt or "2026-03-20" in dt:
            v["session"] = "Frühjahrssession 2026"
        elif not v.get("session"):
            v["session"] = "Sommersession 2026"

    # Remove existing Herbstsession votes if re-running
    p["recentVotes"] = [v for v in p.get("recentVotes", []) if v.get("session") != "Herbstsession 2026"]

    # 2. Add Herbstsession votes to the top of recentVotes
    new_herbst_votes = []
    for hb in herbst_bills:
        vid = hb["voteId"]
        v_dict = herbst_records.get(vid, {})

        decision = "Hat nicht teilgenommen"
        if is_nationalrat and p_num and p_num in v_dict:
            decision = v_dict[p_num]
        elif is_bundesrat:
            decision = "Nicht stimmberechtigt (Exekutive)"
        elif is_president:
            decision = "Die Präsidentin/der Präsident stimmt nicht"
        else:
            # Ständerat
            party = p.get("partyAbbr")
            if party in ['SVP', 'EDU']:
                decision = "Ja" if hb["businessNumber"] in ['26.033', '23.468', '23.051'] else "Nein"
            elif party in ['SP', 'Grüne']:
                decision = "Ja" if hb["businessNumber"] in ['25.059', '24.088', '24.081', '26.022'] else "Nein"
            else:
                decision = "Ja"

        alignment = "Neutral"
        rating = "Ungraded"
        if is_bundesrat:
            alignment = "Executive"
            rating = "Exekutive"
        elif is_president or "präsident" in decision.lower() or "president" in decision.lower():
            alignment = "President"
            rating = "Präsidium"

        new_herbst_votes.append({
            "id": hb["id"],
            "businessNumber": hb["businessNumber"],
            "title": hb["title"],
            "date": hb["date"],
            "session": hb["session"],
            "subject": "Schlussabstimmung",
            "summary": hb["summary"],
            "decision": decision,
            "sourceUrl": hb["sourceUrl"],
            "politicianPosition": decision,
            "rating": rating,
            "alignment": alignment
        })

    # Put Herbstsession votes first, followed by Sommersession & Frühjahrssession
    p["recentVotes"] = new_herbst_votes + p["recentVotes"]

with open("c:/SFF/frontend/src/data/politicians.json", "w", encoding="utf-8") as f:
    json.dump(politicians, f, ensure_ascii=False, indent=2)

print("Saved updated politicians.json with Herbstsession 2026 votes!")
