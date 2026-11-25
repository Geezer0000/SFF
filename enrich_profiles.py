import json

pols = json.load(open('c:/SFF/frontend/src/data/politicians.json', encoding='utf-8'))
sli_data = json.load(open('c:/SFF/swisslivingindex_members.json', encoding='utf-8'))
sli = sli_data['members']
sli_by_id = {m['id']: m for m in sli}

group_names_de = {
    1: 'FDP-Liberale Fraktion',
    2: 'Sozialdemokratische Fraktion',
    3: 'Die Mitte-Fraktion. Die Mitte. EVP.',
    4: 'Fraktion der Schweizerischen Volkspartei',
    6: 'Grüne Fraktion',
    99: 'Fraktionslos',
    137: 'Grünliberale Fraktion'
}

group_colours = {
    1: '#0094eb',
    2: '#d0274e',
    3: '#ea7815',
    4: '#005e29',
    6: '#89ba2c',
    99: '#d2d22d',
    137: '#8a94a6'
}

for p in pols:
    p_num = p.get('personNumber')
    m = sli_by_id.get(p_num)
    if m:
        p['birthYear'] = m.get('birth_year')
        p['seatNumber'] = m.get('seat')
        p['inCouncilSince'] = m.get('in_council_since')
        p['groupId'] = m.get('group')
        p['groupName'] = group_names_de.get(m.get('group'), 'Fraktion')
        p['groupColour'] = group_colours.get(m.get('group'), '#666666')
        p['groupFunction'] = m.get('group_function', {}).get('de', 'Mitglied')
        
        # Email
        fn = p['firstName'].lower().replace(' ', '').replace('é','e').replace('è','e').replace('ä','ae').replace('ö','oe').replace('ü','ue')
        ln = p['lastName'].lower().replace(' ', '').replace('é','e').replace('è','e').replace('ä','ae').replace('ö','oe').replace('ü','ue')
        p['email'] = f"{fn}.{ln}@parl.ch"
        p['parliamentProfileUrl'] = f"https://www.parlament.ch/de/biografie?CouncillorId={p_num}"
        
        # Career
        p['career'] = m.get('career', [])
        
        # Occupations
        occ_de = m.get('occupations', {}).get('de', []) if isinstance(m.get('occupations'), dict) else []
        p['occupations'] = occ_de
        
        # Committees
        com_de = m.get('committees', {}).get('de', []) if isinstance(m.get('committees'), dict) else []
        p['committees'] = com_de
        
        # Interests
        int_de = m.get('interests', {}).get('de', []) if isinstance(m.get('interests'), dict) else []
        p['interests'] = int_de
        
        # Voting record & discipline
        p['votingRecord'] = m.get('voting_record')
        p['votingRecordEarlier'] = m.get('voting_record_earlier')

with open('c:/SFF/frontend/src/data/politicians.json', 'w', encoding='utf-8') as f:
    json.dump(pols, f, indent=2, ensure_ascii=False)

print('Successfully enriched all politicians with rich profile data!')
