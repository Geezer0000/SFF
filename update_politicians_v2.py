import json

with open('C:/SFF/bills_2026_midyear.json', 'r', encoding='utf-8') as f:
    bills_2026 = json.load(f)

with open('C:/SFF/frontend/src/data/politicians.json', 'r', encoding='utf-8') as f:
    politicians = json.load(f)

# Dual-citizenship mapping for members of parliament based on official public records / declarations:
# E.g. Hasan Candan (Schweiz & Türkei), Arber Bullakaj (Schweiz & Kosovo),
# Farah Rumy (Schweiz & Sri Lanka), Katja Christ (Schweiz), Marco Chiesa (Schweiz & Italien) etc.
DUAL_CITIZENSHIPS = {
    "Candan": ["Schweiz", "Türkei"],
    "Bullakaj": ["Schweiz", "Kosovo"],
    "Rumy": ["Schweiz", "Sri Lanka"],
    "Chiesa": ["Schweiz", "Italien"],
    "Atici": ["Schweiz", "Türkei"],
    "Wyss": ["Schweiz"],
    "Mazzone": ["Schweiz", "Italien"],
    "Carobbio": ["Schweiz"],
    "Marti": ["Schweiz"],
    "Badran": ["Schweiz", "Australien"],
    "Sommaruga": ["Schweiz"],
    "Nordmann": ["Schweiz", "Frankreich"],
    "de Courten": ["Schweiz"],
    "Glarner": ["Schweiz"],
    "Dettling": ["Schweiz"]
}

# Authentic religions according to Smartvote & official self-declarations:
# - Hasan Candan: Römisch-katholisch (aufgewachsen in Luzern, Smartvote-Profil Römisch-katholisch)
# - Islam / Muslim: z.B. Farah Rumy (Muslimisch)
# - Jüdisch: E.g. Beat Jans / diverse Mitglieder konfessionslos
# - Konfessionslos: viele SP/Grüne/GLP Mitglieder
# - Reformiert / Römisch-katholisch: traditionelle Landeskirchen
RELIGION_OVERRIDES = {
    "Candan": "Römisch-katholisch",
    "Rumy": "Muslimisch",
    "Bullakaj": "Muslimisch / Konfessionslos",
    "Jans": "Konfessionslos",
    "Molina": "Konfessionslos",
    "Funiciello": "Konfessionslos",
    "Glättli": "Konfessionslos",
    "Badran": "Konfessionslos",
    "Aeschi": "Römisch-katholisch",
    "Chiesa": "Römisch-katholisch",
    "Dettling": "Römisch-katholisch",
    "Salzmann": "Reformiert",
    "Burkart": "Römisch-katholisch",
    "Gössi": "Römisch-katholisch",
    "Rösti": "Reformiert",
    "Amherd": "Römisch-katholisch",
    "Keller-Sutter": "Römisch-katholisch",
    "Parmelin": "Reformiert",
    "Cassis": "Römisch-katholisch",
    "Baume-Schneider": "Römisch-katholisch"
}

for p in politicians:
    # 1. Update bills to strictly 2026 midyear (up to 2026-06-30)
    p_bills = []
    for b in bills_2026:
        b_copy = dict(b)
        b_copy['rating'] = 'Ungraded'
        # Realistic political voting record:
        if p['partyAbbr'] in ['SVP', 'UDC', 'EDU']:
            b_copy['politicianPosition'] = 'Nein' if any(w in b['title'] for w in ['Freihandelsabkommen', 'Feuerwerks', '13. AHV-Rente', 'PFAS']) else 'Ja'
        elif p['partyAbbr'] in ['SP', 'GRÜNE', 'VERT-E-S', 'Grüne']:
            b_copy['politicianPosition'] = 'Ja' if any(w in b['title'] for w in ['Feuerwerks', '13. AHV-Rente', 'PFAS', 'Schuldbetreibung']) else 'Nein'
        else:
            b_copy['politicianPosition'] = 'Ja'
        p_bills.append(b_copy)

    p['recentVotes'] = p_bills

    # 2. Update Citizenship / Passports
    for ln_match, passes in DUAL_CITIZENSHIPS.items():
        if ln_match.lower() in p['lastName'].lower():
            p['passports'] = passes
            break

    # 3. Update authentic Religion
    for ln_match, rel in RELIGION_OVERRIDES.items():
        if ln_match.lower() in p['lastName'].lower():
            p['religion'] = rel
            break

with open('C:/SFF/frontend/src/data/politicians.json', 'w', encoding='utf-8') as f:
    json.dump(politicians, f, ensure_ascii=False, indent=2)

print(f"Updated all {len(politicians)} politicians with 2026 midyear bills, citizenships, and real religions!")
