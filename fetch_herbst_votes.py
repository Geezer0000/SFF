import urllib.request
import json

herbst_votes = [
    {
        "voteId": 38963,
        "businessNumber": "26.033",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Freihandelsabkommen zwischen den EFTA-Staaten und Mercosur. Genehmigung",
        "summary": "Genehmigung des umfassenden Freihandelsabkommens zwischen den EFTA-Staaten (Schweiz, Norwegen, Island, Liechtenstein) und den Mercosur-Staaten (Brasilien, Argentinien, Uruguay, Paraguay).",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20260033"
    },
    {
        "voteId": 38971,
        "businessNumber": "25.059",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "«Ja zum Importverbot für tierquälerisch erzeugte Pelzprodukte (Pelzinitiative)». Volksinitiative und indirekter Gegenvorschlag",
        "summary": "Volksinitiative und Gegenvorschlag für ein gesetzliches Einfuhrverbot von Pelzen und Pelzprodukten aus tierquälerischer Haltung oder grausamer Tötung.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20250059"
    },
    {
        "voteId": 38955,
        "businessNumber": "24.088",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Volksinitiative «Für ein modernes Bürgerrecht (Demokratie-Initiative)»",
        "summary": "Verfassungsinitiative zur Festlegung einheitlicher Kriterien für die Einbürgerung nach vier Jahren rechtmässigem Aufenthalt in der Schweiz ohne Willkür.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20240088"
    },
    {
        "voteId": 38961,
        "businessNumber": "26.022",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Bundesgesetz über die Unterstützung der Opfer der Brandkatastrophe von Crans-Montana vom 1. Januar 2026",
        "summary": "Schlussabstimmung über Bundesmittel zur Entschädigung und Unterstützung der Betroffenen der verheerenden Brandkatastrophe im Wallis.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20260022"
    },
    {
        "voteId": 38960,
        "businessNumber": "23.051",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Bundesgesetz über die Stromversorgung (Stromversorgungsgesetz, StromVG)",
        "summary": "Rahmengesetz für den schrittweisen Umbau der Stromversorgung, Stärkung der Marktintegration und Netzsicherheit in der Schweiz.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20230051"
    },
    {
        "voteId": 38950,
        "businessNumber": "24.081",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Volksinitiative «Ja zum Importverbot für Stopfleber (Stopfleber-Initiative)»",
        "summary": "Eidgenössische Volksinitiative für ein Importverbot für Stopfleber (Foie gras) aus tierquälerischer Zwangsfütterung.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20240081"
    },
    {
        "voteId": 38947,
        "businessNumber": "23.468",
        "date": "02-10-2026",
        "session": "Herbstsession 2026",
        "title": "Bundesgesetz über die Unverjährbarkeit von Mord (Änderung des Strafgesetzbuches)",
        "summary": "Aufhebung jeglicher Verjährungsfristen bei Morddelikten im Schweizerischen Strafgesetzbuch und Militärstrafgesetz.",
        "sourceUrl": "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20230468"
    }
]

print("Fetching Herbstsession member votes...")
results = {}
for hv in herbst_votes:
    vid = hv["voteId"]
    url = f"https://ws.parlament.ch/odata.svc/Voting?$filter=IdVote%20eq%20{vid}&$top=500&$format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            data = json.loads(r.read().decode('utf-8'))
            items = data['d']
            m_dict = {}
            for it in items:
                pnum = it.get('PersonNumber')
                if pnum:
                    m_dict[pnum] = it.get('DecisionText', 'Hat nicht teilgenommen')
            results[vid] = m_dict
            print(f"Vote {vid} ({hv['businessNumber']}): {len(m_dict)} members recorded")
    except Exception as e:
        print(f"Error {vid}:", e)
