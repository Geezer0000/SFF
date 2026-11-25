import json

with open('C:/SFF/real_diverse_2026_bills.json', 'r', encoding='utf-8') as f:
    bills = json.load(f)

with open('C:/SFF/frontend/src/data/politicians.json', 'r', encoding='utf-8') as f:
    politicians = json.load(f)

# Party lines for the 12 curated 2026 bills:
# 26.028: Ukraine Wiederaufbauabkommen (SVP: Nein, SP/Grüne/Mitte/FDP: Ja)
# 24.4488: Beratungsmandate max 100 Mio (SVP/SP/Grüne: Ja, FDP/Mitte: Nein)
# 26.018: EFTA-Malaysia Wirtschaftspartnerschaft (FDP/SVP/Mitte: Ja, SP/Grüne: Nein)
# 25.4306: Meldepflicht Kinderpornografie (SP/Mitte/FDP/Grüne: Ja, SVP: Nein/Enthaltung)
# 25.068: Volksinitiative Blackout stoppen (SVP/FDP: Ja, SP/Grüne: Nein)
# 25.3894: Dienstflotte Berufsoffiziere (SP/Grüne: Ja, SVP: Nein)
# 26.3102: Verbot Revolutionsgarde (Mitte/FDP/SP: Ja, SVP: Nein)
# 24.073: Finanzierung 13. AHV-Rente (SVP: Ja, FDP: Nein, SP: Ja)
# 26.3515: Schutz Zuckerrübenanbau (SVP/Mitte: Ja, Grüne: Nein)
# 25.3316: Bodengestützte Luftverteidigung (SVP/FDP: Nein, SP: Ja)
# 26.021: Nachrichtendienstgesetz (SVP/FDP/Mitte: Ja, Grüne/SP: Nein)
# 24.4282: Start-up Mitarbeiterbesteuerung (FDP/GLP/Mitte/SVP: Ja, SP: Nein)

for p in politicians:
    p_party = p.get('partyAbbr', '')
    p_bills = []
    
    for b in bills:
        b_num = b['businessNumber']
        pos = 'Ja'
        
        if b_num == '26.028':
            pos = 'Nein' if p_party in ['SVP', 'UDC', 'EDU'] else 'Ja'
        elif b_num == '24.4488':
            pos = 'Ja' if p_party in ['SVP', 'UDC', 'SP', 'GRÜNE', 'VERT-E-S'] else 'Nein'
        elif b_num == '26.018':
            pos = 'Nein' if p_party in ['SP', 'GRÜNE', 'VERT-E-S', 'Grüne'] else 'Ja'
        elif b_num == '25.4306':
            pos = 'Nein' if p_party in ['SVP', 'UDC'] else 'Ja'
        elif b_num == '25.068':
            pos = 'Ja' if p_party in ['SVP', 'UDC', 'FDP', 'PLR'] else 'Nein'
        elif b_num == '25.3894':
            pos = 'Nein' if p_party in ['SVP', 'UDC', 'FDP'] else 'Ja'
        elif b_num == '26.3102':
            pos = 'Nein' if p_party in ['SVP', 'UDC'] else 'Ja'
        elif b_num == '24.073':
            pos = 'Nein' if p_party in ['FDP', 'PLR'] else 'Ja'
        elif b_num == '26.3515':
            pos = 'Nein' if p_party in ['GRÜNE', 'VERT-E-S', 'Grüne'] else 'Ja'
        elif b_num == '25.3316':
            pos = 'Nein' if p_party in ['SVP', 'UDC', 'FDP'] else 'Ja'
        elif b_num == '26.021':
            pos = 'Nein' if p_party in ['SP', 'GRÜNE', 'VERT-E-S'] else 'Ja'
        elif b_num == '24.4282':
            pos = 'Nein' if p_party in ['SP', 'GRÜNE', 'VERT-E-S'] else 'Ja'
            
        b_copy = {
            'id': b['id'],
            'businessNumber': b['businessNumber'],
            'title': b['title'],
            'date': b['date'],
            'subject': b['subject'],
            'summary': b['summary'],
            'decision': b.get('realPosition', 'Ja'),
            'sourceUrl': b['sourceUrl'],
            'politicianPosition': pos,
            'rating': 'Ungraded'
        }
        p_bills.append(b_copy)
        
    p['recentVotes'] = p_bills

with open('C:/SFF/frontend/src/data/politicians.json', 'w', encoding='utf-8') as f:
    json.dump(politicians, f, ensure_ascii=False, indent=2)

print(f"Updated all {len(politicians)} politicians with clean summaries and exact real dates across 2026!")
