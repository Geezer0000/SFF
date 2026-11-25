import urllib.request
import json
import time

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("Fetching active Nationalrat and Ständerat seats...")
nr_data = fetch("https://ws.parlament.ch/odata.svc/SeatOrganisationNr?$format=json&$filter=Language%20eq%20'DE'")
sr_data = fetch("https://ws.parlament.ch/odata.svc/SeatOrganisationSr?$format=json&$filter=Language%20eq%20'DE'")

nr_seats = {r['PersonNumber']: r for r in nr_data['d']['results']}
sr_seats = {r['PersonNumber']: r for r in sr_data['d']['results']}

print(f"Unique active NR members: {len(nr_seats)}, SR members: {len(sr_seats)}")

# Official current 7 Bundesräte (Federal Council)
bundesrat_list = [
    {
        "id": "br-amherd",
        "personNumber": 10001,
        "personIdCode": 1058, # Viola Amherd
        "firstName": "Viola",
        "lastName": "Amherd",
        "fullName": "Viola Amherd",
        "council": "Bundesrat",
        "councilAbbr": "BR",
        "canton": "VS",
        "cantonName": "Wallis",
        "party": "Die Mitte",
        "partyAbbr": "Mitte",
        "partyColor": "#e57200",
        "photo": "https://www.parlament.ch/sitecollectionimages/profil/portrait-260/1058.jpg",
        "inOfficeSince": "2019",
        "termEnds": "2027",
        "seat": "Bundesrat (VBS)",
        "birthPlace": "Brig-Glis (VS)",
        "citizenship": "Brig-Glis (VS), Zwischbergen (VS)",
        "passports": ["Schweiz"],
        "religion": "Römisch-katholisch",
        "overallScore": None,
        "alignedCount": 0,
        "totalVotes": 0,
        "status": "Ungraded"
    },
    {
        "id": "br-parmelin",
        "personNumber": 10002,
        "personIdCode": 1139, # Guy Parmelin
        "firstName": "Guy",
        "lastName": "Parmelin",
        "fullName": "Guy Parmelin",
        "council": "Bundesrat",
        "councilAbbr": "BR",
        "canton": "VD",
        "cantonName": "Waadt",
        "party": "Schweizerische Volkspartei",
        "partyAbbr": "SVP",
        "partyColor": "#00843D",
        "photo": "https://www.parlament.ch/sitecollectionimages/profil/portrait-260/1139.jpg",
        "inOfficeSince": "2016",
        "termEnds": "2027",
        "seat": "Bundesrat (WBF)",
        "birthPlace": "Bursins (VD)",
        "citizenship": "Bursins (VD)",
        "passports": ["Schweiz"],
        "religion": "Reformiert",
        "overallScore": None,
        "alignedCount": 0,
        "totalVotes": 0,
        "status": "Ungraded"
    },
    {
        "id": "br-cassis",
        "personNumber": 10003,
        "personIdCode": 1332, # Ignazio Cassis
        "firstName": "Ignazio",
        "lastName": "Cassis",
        "fullName": "Ignazio Cassis",
        "council": "Bundesrat",
        "councilAbbr": "BR",
        "canton": "TI",
        "cantonName": "Tessin",
        "party": "FDP.Die Liberalen",
        "partyAbbr": "FDP",
        "partyColor": "#0066CC",
        "photo": "https://www.parlament.ch/sitecollectionimages/profil/portrait-260/1332.jpg",
        "inOfficeSince": "2017",
        "termEnds": "2027",
        "seat": "Bundesrat (EDA)",
        "birthPlace": "Sessa (TI)",
        "citizenship": "Sessa (TI)",
        "passports": ["Schweiz"], # gave up Italian passport before election
        "religion": "Römisch-katholisch",
        "overallScore": None,
        "alignedCount": 0,
        "totalVotes": 0,
        "status": "Ungraded"
    },
    {
        "id": "br-kellersutter",
        "personNumber": 10004,
        "personIdCode": 3037, # Karin Keller-Sutter
        "firstName": "Karin",
        "lastName": "Keller-Sutter",
        "fullName": "Karin Keller-Sutter",
        "council": "Bundesrat",
        "councilAbbr": "BR",
        "canton": "SG",
        "cantonName": "St. Gallen",
        "party": "FDP.Die Liberalen",
        "partyAbbr": "FDP",
        "partyColor": "#0066CC",
        "photo": "https://www.parlament.ch/sitecollectionimages/profil/portrait-260/3037.jpg",
        "inOfficeSince": "2019",
        "termEnds": "2027",
        "seat": "Bundesrat (EFD)",
        "birthPlace": "Niederbipp (BE)",
        "citizenship": "Jonschwil (SG), Kirchberg (SG)",
        "passports": ["Schweiz"],
        "religion": "Römisch-katholisch",
        "overallScore": None,
        "alignedCount": 0,
        "totalVotes": 0,
        "status": "Ungraded"
    },
    {
        "id": "br-roesti",
        "personNumber": 10005,
        "personIdCode": 3058, # Albert Rösti
        "firstName": "Albert",
        "lastName": "Rösti",
        "fullName": "Albert Rösti",
        "council": "Bundesrat",
        "councilAbbr": "BR",
        "canton": "BE",
        "cantonName": "Bern",
        "party": "Schweizerische Volkspartei",
        "partyAbbr": "SVP",
        "partyColor": "#00843D",
        "photo": "https://www.parlament.ch/sitecollectionimages/profil/portrait-260/3058.jpg",
        "inOfficeSince": "2023",
        "termEnds": "2027",
        "seat": "Bundesrat (UVEK)",
        "birthPlace": "Kandersteg (BE)",
        "citizenship": "Frutigen (BE)",
        "passports": ["Schweiz"],
        "religion": "Reformiert",
        "overallScore": None,
        "alignedCount": 0,
        "totalVotes": 0,
        "status": "Ungraded"
    },
    {
        "id": "br-baumeschneider",
        "personNumber": 10006,
        "personIdCode": 4317, # Elisabeth Baume-Schneider
        "firstName": "Elisabeth",
        "lastName": "Baume-Schneider",
        "fullName": "Elisabeth Baume-Schneider",
        "council": "Bundesrat",
        "councilAbbr": "BR",
        "canton": "JU",
        "cantonName": "Jura",
        "party": "Sozialdemokratische Partei",
        "partyAbbr": "SP",
        "partyColor": "#E2001A",
        "photo": "https://www.parlament.ch/sitecollectionimages/profil/portrait-260/4317.jpg",
        "inOfficeSince": "2023",
        "termEnds": "2027",
        "seat": "Bundesrat (EDI)",
        "birthPlace": "Saint-Imier (BE)",
        "citizenship": "Les Breuleux (JU)",
        "passports": ["Schweiz"],
        "religion": "Römisch-katholisch",
        "overallScore": None,
        "alignedCount": 0,
        "totalVotes": 0,
        "status": "Ungraded"
    },
    {
        "id": "br-jans",
        "personNumber": 10007,
        "personIdCode": 1144, # Beat Jans
        "firstName": "Beat",
        "lastName": "Jans",
        "fullName": "Beat Jans",
        "council": "Bundesrat",
        "councilAbbr": "BR",
        "canton": "BS",
        "cantonName": "Basel-Stadt",
        "party": "Sozialdemokratische Partei",
        "partyAbbr": "SP",
        "partyColor": "#E2001A",
        "photo": "https://www.parlament.ch/sitecollectionimages/profil/portrait-260/1144.jpg",
        "inOfficeSince": "2024",
        "termEnds": "2027",
        "seat": "Bundesrat (EJPD)",
        "birthPlace": "Basel (BS)",
        "citizenship": "Riehen (BS)",
        "passports": ["Schweiz"],
        "religion": "Konfessionslos / Reformiert",
        "overallScore": None,
        "alignedCount": 0,
        "totalVotes": 0,
        "status": "Ungraded"
    }
]

print("Bundesrat defined: 7 members")
