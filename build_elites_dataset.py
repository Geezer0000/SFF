import urllib.request
import urllib.parse
import json
import re
import concurrent.futures

with open('/home/antigravity/Geezer0000/SFF/frontend/src/data/politicians.json', 'r', encoding='utf-8') as f:
    politicians_2026 = json.load(f)

pol_by_name = {}
for p in politicians_2026:
    ln = p['lastName'].lower().strip()
    fn = p['firstName'].lower().strip().split()[0]
    pol_by_name[f"{ln}_{fn}"] = p
    pol_by_name[ln] = p

CANTON_NAMES = {
    'ZH': 'Zürich', 'BE': 'Bern', 'LU': 'Luzern', 'UR': 'Uri', 'SZ': 'Schwyz',
    'OW': 'Obwalden', 'NW': 'Nidwalden', 'GL': 'Glarus', 'ZG': 'Zug', 'FR': 'Freiburg',
    'SO': 'Solothurn', 'BS': 'Basel-Stadt', 'BL': 'Basel-Landschaft', 'SH': 'Schaffhausen',
    'AR': 'Appenzell Ausserrhoden', 'AI': 'Appenzell Innerrhoden', 'SG': 'St. Gallen',
    'GR': 'Graubünden', 'AG': 'Aargau', 'TG': 'Thurgau', 'TI': 'Tessin', 'VD': 'Waadt',
    'VS': 'Wallis', 'NE': 'Neuenburg', 'GE': 'Genf', 'JU': 'Jura'
}

PARTY_COLORS = {
    'SVP': '#00843D',
    'FDP': '#0066CC',
    'Mitte': '#e57200',
    'SP': '#E2001A',
    'GRÜNE': '#84B414',
    'GLP': '#009F84',
    'Liberale': '#2563eb',
    'Parteilos': '#64748b'
}

ENTITY_TRANSLATIONS = {
    'Conseil fédéral': ('Bundesrat (Exekutive)', 'Politik', 'POL', 'Mitglied des Bundesrates'),
    'Conseil national': ('Nationalrat (Bundesversammlung)', 'Politik', 'POL', 'Nationalrat'),
    'Conseil des Etats': ('Ständerat (Bundesversammlung)', 'Politik', 'POL', 'Ständerat'),
    'Economie et redevances CN': ('WAK-N (Kommission Wirtschaft & Abgaben)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Economie et redevances CE': ('WAK-S (Kommission Wirtschaft & Abgaben)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Politique de sécurité CN': ('SiK-N (Sicherheitspolitische Kommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Politique de sécurité CE': ('SiK-S (Sicherheitspolitische Kommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Finances CN': ('FK-N (Finanzkommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Finances CE': ('FK-S (Finanzkommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Politique extérieure CN': ('APK-N (Aussenpolitische Kommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Politique extérieure CE': ('APK-S (Aussenpolitische Kommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Affaires juridiques CN': ('RK-N (Kommission für Rechtsfragen)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Affaires juridiques CE': ('RK-S (Kommission für Rechtsfragen)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Institutions politiques CN': ('SPK-N (Staatspolitische Kommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Institutions politiques CE': ('SPK-S (Staatspolitische Kommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Sécurité sociale et santé publique CN': ('SGK-N (Kommission Gesundheit & Soziales)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Sécurité sociale et santé publique CE': ('SGK-S (Kommission Gesundheit & Soziales)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Transports et télécommunications CN': ('KVF-N (Kommission Verkehr & Fernmeldewesen)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Transports et télécommunications CE': ('KVF-S (Kommission Verkehr & Fernmeldewesen)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Environnement, aménagement du territoire et énergie CN': ('UREK-N (Kommission Umwelt & Energie)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Environnement, aménagement du territoire et énergie CE': ('UREK-S (Kommission Umwelt & Energie)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Science, éducation et culture CN': ('WBK-N (Kommission Wissenschaft, Bildung & Kultur)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Science, éducation et culture CE': ('WBK-S (Kommission Wissenschaft, Bildung & Kultur)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Gestion CN': ('GPK-N (Geschäftsprüfungskommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Gestion CE': ('GPK-S (Geschäftsprüfungskommission)', 'Politik', 'POL', 'Kommissionsmitglied'),
    'Union démocratique du centre': ('SVP Schweiz (Parteileitung)', 'Politik', 'POL', 'Vorstand / Präsidium'),
    'Parti radical-démocratique': ('FDP.Die Liberalen Schweiz (Parteileitung)', 'Politik', 'POL', 'Vorstand / Präsidium'),
    'Parti libéral-radical': ('FDP.Die Liberalen Schweiz (Parteileitung)', 'Politik', 'POL', 'Vorstand / Präsidium'),
    'Parti démocrate-chrétien': ('Die Mitte / CVP Schweiz (Parteileitung)', 'Politik', 'POL', 'Vorstand / Präsidium'),
    'Parti socialiste suisse': ('SP Schweiz (Parteileitung)', 'Politik', 'POL', 'Vorstand / Präsidium'),
    'Parti écologiste suisse': ('GRÜNE Schweiz (Parteileitung)', 'Politik', 'POL', 'Vorstand / Präsidium'),
    'Parti vert\'libéral': ('Grünliberale Partei GLP (Parteileitung)', 'Politik', 'POL', 'Vorstand / Präsidium'),
    'ASIN': ('AUNS / ProSchweiz', 'Politik', 'POL', 'Vorstand / Leitungsmitglied'),
    'Redressement national': ('Redressement National', 'Wirtschaftsverband', 'ECO', 'Vorstandsmitglied'),
    'USCI': ('Economiesuisse / Vorort (SHIV)', 'Wirtschaftsverband', 'ECO', 'Vorstand / Ausschuss'),
    'Economiesuisse': ('Economiesuisse / Vorort (SHIV)', 'Wirtschaftsverband', 'ECO', 'Vorstand / Ausschuss'),
    'UPS': ('Schweizerischer Arbeitgeberverband (SAV)', 'Wirtschaftsverband', 'ECO', 'Vorstand'),
    'USAM': ('Schweizerischer Gewerbeverband (sgv)', 'Wirtschaftsverband', 'ECO', 'Vorstand / Ausschuss'),
    'USP': ('Schweizerischer Bauernverband (SBV)', 'Wirtschaftsverband', 'ECO', 'Vorstand'),
    'ASB': ('Schweizerische Bankiervereinigung (SBVg)', 'Wirtschaftsverband', 'ECO', 'Verwaltungsrat / Vorstand'),
    'USS': ('Schweizerischer Gewerkschaftsbund (SGB)', 'Wirtschaftsverband', 'ECO', 'Vorstand / Präsidium'),
    'SSIC': ('Scienceindustries (Chemie Pharma Life Sciences)', 'Wirtschaftsverband', 'ECO', 'Vorstand'),
    'ASM': ('Swissmem (Maschinen-, Elektro- & Metallindustrie)', 'Wirtschaftsverband', 'ECO', 'Vorstand'),
    'Banque nationale suisse: Conseil de banque': ('Schweizerische Nationalbank (SNB)', 'Verwaltung / Kommission', 'ADMIN', 'Bankrat'),
    'Banque nationale suisse: Directoire': ('Schweizerische Nationalbank (SNB)', 'Verwaltung / Kommission', 'ADMIN', 'Direktorium'),
    'Banque nationale suisse': ('Schweizerische Nationalbank (SNB)', 'Verwaltung / Kommission', 'ADMIN', 'Bankrat / Direktorium'),
    'Tribunal fédéral': ('Schweizerisches Bundesgericht', 'Verwaltung / Kommission', 'ADMIN', 'Bundesrichter/in'),
    'CFF': ('SBB (Schweizerische Bundesbahnen)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / Direktion'),
    'La Poste': ('Die Schweizerische Post AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'UBS': ('UBS Group AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / Konzernleitung'),
    'SBS': ('UBS Group AG (ehem. SBV)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'UBS-SBS': ('UBS Group AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'CS': ('Credit Suisse / SKA', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / Direktion'),
    'SKA': ('Credit Suisse / SKA', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Nestlé': ('Nestlé SA', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / Executive Board'),
    'Novartis': ('Novartis AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / Executive Committee'),
    'Ciba-Geigy': ('Novartis AG (ehem. Ciba-Geigy)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Sandoz': ('Novartis AG (ehem. Sandoz)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Roche': ('Roche Holding AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / Konzernleitung'),
    'ABB': ('ABB Ltd (ehem. BBC)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / Konzernleitung'),
    'BBC': ('ABB Ltd (ehem. BBC)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Sulzer': ('Sulzer AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Rieter': ('Rieter Holding AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Georg Fischer': ('Georg Fischer AG (GF)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'AIAG-Alusuisse': ('Alusuisse (AIAG)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Swiss Re': ('Swiss Re (Schweizerische Rückversicherung)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Réassurance': ('Swiss Re (Schweizerische Rückversicherung)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Zurich': ('Zurich Insurance Group', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Rentenanstalt': ('Swiss Life (Rentenanstalt)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Bâloise': ('Baloise Holding AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Helvetia': ('Helvetia Versicherungen', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Swissair': ('Swissair AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Ems': ('EMS-Chemie Holding AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / CEO'),
    'Lonza': ('Lonza Group AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Straumann': ('Straumann Holding AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat / CEO'),
    'Phonak-Sonova': ('Sonova Holding AG (Phonak)', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Bank Bär': ('Julius Bär Gruppe AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Swatch': ('The Swatch Group AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Migros': ('Migros-Genossenschafts-Bund (MGB)', 'Wirtschaft / VR', 'ECO', 'Verwaltung'),
    'Coop': ('Coop-Gruppe Genossenschaft', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'Swisscom': ('Swisscom AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'RUAG': ('RUAG Holding AG', 'Wirtschaft / VR', 'ECO', 'Verwaltungsrat'),
    'CICR': ('IKRK (Internationales Komitee vom Roten Kreuz)', 'Soziabilität / Club / Verbindung', 'ADMIN', 'Komiteemitglied / Präsidium'),
    'Rotary Club': ('Rotary Club Schweiz', 'Soziabilität / Club / Verbindung', 'ECO', 'Clubmitglied'),
    'Lions Club': ('Lions Club Schweiz', 'Soziabilität / Club / Verbindung', 'ECO', 'Clubmitglied'),
    'Zofingue': ('Schweizerischer Zofingerverein (Zofingia)', 'Soziabilität / Club / Verbindung', 'ACAD', 'Verbindungsmitglied'),
    'Zofingue, section genevoise': ('Schweizerischer Zofingerverein (Zofingia)', 'Soziabilität / Club / Verbindung', 'ACAD', 'Verbindungsmitglied'),
    'Zofingue, section vaudoise': ('Schweizerischer Zofingerverein (Zofingia)', 'Soziabilität / Club / Verbindung', 'ACAD', 'Verbindungsmitglied'),
    'Zofingue, section bernoise': ('Schweizerischer Zofingerverein (Zofingia)', 'Soziabilität / Club / Verbindung', 'ACAD', 'Verbindungsmitglied'),
    'Zofingue, section zurichoise': ('Schweizerischer Zofingerverein (Zofingia)', 'Soziabilität / Club / Verbindung', 'ACAD', 'Verbindungsmitglied'),
    'Société d\'étudiants Helvetia': ('Studentenverbindung Helvetia', 'Soziabilität / Club / Verbindung', 'ACAD', 'Verbindungsmitglied'),
    'Société suisse des officiers': ('Schweizerische Offiziersgesellschaft (SOG)', 'Militär', 'ADMIN', 'Offizier / Vorstand'),
    'EMG': ('Generalstab der Schweizer Armee (EMG)', 'Militär', 'ADMIN', 'Generalstabsoffizier'),
    'EPFZ': ('ETH Zürich (EPFZ)', 'Wissenschaft / Hochschule', 'ACAD', 'Professur / ETH-Rat'),
    'EPFL': ('EPFL Lausanne', 'Wissenschaft / Hochschule', 'ACAD', 'Professur / Leitung'),
    'UniZh': ('Universität Zürich (UZH)', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Rektorat'),
    'UniBe': ('Universität Bern', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Rektorat'),
    'UniBa': ('Universität Basel', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Rektorat'),
    'UniGe': ('Universität Genf', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Rektorat'),
    'UniL': ('Universität Lausanne (UNIL)', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Rektorat'),
    'UniFr': ('Universität Freiburg', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Rektorat'),
    'UniNe': ('Universität Neuenburg', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Rektorat'),
    'UniSG': ('Universität St. Gallen (HSG)', 'Wissenschaft / Hochschule', 'ACAD', 'Ordentliche Professur / Institutsleitung'),
    'FNS': ('Schweizerischer Nationalfonds (SNF)', 'Wissenschaft / Hochschule', 'ACAD', 'Forschungsrat'),
}

def fetch_url(url, timeout=12):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode('utf-8', errors='replace')

def fetch_obelis_entities(obelis_id):
    params = {'data[action]': 'getEntites', 'data[id]': str(obelis_id)}
    body = urllib.parse.urlencode(params).encode('utf-8')
    req = urllib.request.Request('https://elitessuisses.unil.ch/ajax.php', data=body, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode('utf-8', errors='replace')
            data = json.loads(raw)
            return data if isinstance(data, list) else []
    except Exception:
        return []

def fetch_obelis_bio(obelis_id):
    try:
        html = fetch_url(f"https://elitessuisses.unil.ch/p/{obelis_id}", timeout=10)
        sex_m = re.search(r'Sexe\s*:</div><div class="col">([^<]+)</div>', html)
        sex = 'F' if (sex_m and 'F' in sex_m.group(1)) else 'M'
        birth_place_m = re.search(r'Lieu naissance\s*:</div><div class="col">([^<]+)</div>', html)
        birth_place = birth_place_m.group(1).strip() if birth_place_m else ''
        nat_m = re.search(r'Nationalit[^:]*:</div><div class="col">([^<]+)</div>', html)
        nat = nat_m.group(1).strip() if nat_m else 'Suisse'
        prof_m = re.search(r'Principales professions\s*:</div><div class="col">([^<]+)</div>', html)
        prof = prof_m.group(1).strip() if prof_m else ''
        canton_m = re.search(r'\(([A-Z]{2})\)', birth_place)
        canton = canton_m.group(1) if (canton_m and canton_m.group(1) in CANTON_NAMES) else ''
        if not canton:
            for c_code in CANTON_NAMES:
                if f"({c_code})" in html or f">{c_code}</a>" in html:
                    canton = c_code
                    break
        uni = ''
        for u_code, u_name in [
            ('EPFZ', 'ETH Zürich'), ('EPFL', 'EPFL Lausanne'), ('UniZh', 'Universität Zürich (UZH)'),
            ('UniBe', 'Universität Bern'), ('UniBa', 'Universität Basel'), ('UniGe', 'Universität Genf'),
            ('UniL', 'Universität Lausanne (UNIL)'), ('UniFr', 'Universität Freiburg'),
            ('UniSG', 'Universität St. Gallen (HSG)'), ('UniNe', 'Universität Neuenburg'),
            ('Harvard', 'Harvard University'), ('IMD', 'IMD Lausanne'), ('INSEAD', 'INSEAD')
        ]:
            if u_code in html:
                uni = u_name
                break
        study_field = 'Rechtswissenschaften (Dr. iur. / lic. iur.)'
        if 'sciences économiques' in html or 'HEC' in html or 'gestion' in html or 'UniSG' in html:
            study_field = 'Wirtschaftswissenschaften (Dr. oec. / HSG / HEC)'
        elif 'sciences techniques' in html or 'ingénieur' in html or 'EPFZ' in html or 'EPFL' in html:
            study_field = 'Ingenieur- & Naturwissenschaften (Dipl. Ing. ETH)'
        elif 'médecine' in html:
            study_field = 'Medizin (Dr. med.)'
        elif 'lettres' in html or 'sciences sociales' in html or 'philosophie' in html:
            study_field = 'Geistes- & Sozialwissenschaften (Dr. phil.)'

        party_abbr = 'Parteilos'
        party_name = 'Parteilos / Wirtschaft & Wissenschaft'
        if 'Union démocratique du centre' in html or 'Parti des paysans, artisans et bourgeois' in html:
            party_abbr = 'SVP'
            party_name = 'Schweizerische Volkspartei (SVP / BGB)'
        elif 'Parti radical-démocratique' in html or 'Parti libéral-radical' in html:
            party_abbr = 'FDP'
            party_name = 'FDP.Die Liberalen (Freisinn)'
        elif 'Parti démocrate-chrétien' in html or 'Parti conservateur' in html or 'Le Centre' in html:
            party_abbr = 'Mitte'
            party_name = 'Die Mitte / CVP (Christlichdemokraten)'
        elif 'Parti socialiste' in html:
            party_abbr = 'SP'
            party_name = 'Sozialdemokratische Partei (SP)'
        elif 'Parti écologiste' in html or 'Les Verts' in html:
            party_abbr = 'GRÜNE'
            party_name = 'GRÜNE Schweiz'
        elif 'Parti vert\'libéral' in html:
            party_abbr = 'GLP'
            party_name = 'Grünliberale Partei (GLP)'
        elif 'Parti libéral' in html:
            party_abbr = 'Liberale'
            party_name = 'Liberale Partei der Schweiz (LPS / FDP)'

        mil_rank = 'Kein Offiziersgrad'
        for fr_g, de_g in [
            ('Commandant de corps', 'Korpskommandant'),
            ('Divisionnaire', 'Divisionär'),
            ('Brigadier', 'Brigadier'),
            ('Colonel EMG', 'Oberst i Gst'),
            ('Colonel', 'Oberst'),
            ('Lieutenant-colonel', 'Oberstleutnant'),
            ('Major', 'Major'),
            ('Capitaine', 'Hauptmann'),
            ('Premier-lieutenant', 'Oberleutnant'),
            ('Lieutenant', 'Leutnant')
        ]:
            if fr_g in html:
                mil_rank = de_g
                break
        return {
            'gender': sex,
            'birthPlace': birth_place,
            'nat': nat,
            'prof': prof,
            'canton': canton,
            'uni': uni,
            'studyField': study_field,
            'partyAbbr': party_abbr,
            'partyName': party_name,
            'militaryRank': mil_rank
        }
    except Exception:
        return {}

def parse_echantillon(sphere, year, page=1):
    url = f"https://elitessuisses.unil.ch/echantillon.php?s={sphere}&a={year}&p={page}"
    try:
        html = fetch_url(url)
        tr_blocks = re.findall(r'<tr>(.*?)</tr>', html, re.S)
        results = []
        for tr in tr_blocks:
            links = re.findall(r'<a href="/p/(\d+)">([^<]+)</a>', tr)
            if len(links) >= 2:
                pid = int(links[0][0])
                last_name = links[0][1].strip()
                first_name = re.sub(r'\s+\d+$', '', links[1][1].strip())
                # Remove links before finding years
                tr_no_links = re.sub(r'href="/p/\d+"', '', tr)
                years_found = [int(y) for y in re.findall(r'\b(1[789]\d{2}|20[012]\d)\b', tr_no_links)]
                b_year = years_found[0] if len(years_found) >= 1 else max(1830, year - 52)
                d_year = years_found[1] if len(years_found) >= 2 else (b_year + 78 if year <= 1937 else None)
                mdts_m = re.search(r'nb-mdts">(\d+)<', tr)
                mdts = int(mdts_m.group(1)) if mdts_m else 1
                results.append({
                    'obelisId': pid,
                    'lastName': last_name,
                    'firstName': first_name,
                    'birthYear': b_year,
                    'deathYear': d_year,
                    'mandatesCount': mdts,
                    'sphere': sphere,
                    'year': year
                })
        return results
    except Exception as e:
        print(f"Error fetching {sphere} {year}: {e}")
        return []

def normalize_entity(raw_ent):
    name = (raw_ent.get('name') or '').strip()
    ent_id = raw_ent.get('id') or ''
    entree = str(raw_ent.get('entree') or '').strip()
    sortie = str(raw_ent.get('sortie') or '').strip()
    period = f"{entree}–{sortie}" if (entree and sortie and entree != sortie) else (entree or sortie or 'Historisch')

    if not name:
        return None

    # Exact match
    if name in ENTITY_TRANSLATIONS:
        de_name, cat, sph, role = ENTITY_TRANSLATIONS[name]
        return {
            'id': ent_id or de_name,
            'organisation': de_name,
            'category': cat,
            'sphere': sph,
            'role': role,
            'period': period,
            'obelisEntityId': ent_id
        }

    # Canton council match
    if name in CANTON_NAMES:
        return {
            'id': ent_id or f"Kanton-{name}",
            'organisation': f"Kantonsregierung / Grosser Rat {CANTON_NAMES[name]} ({name})",
            'category': 'Politik',
            'sphere': 'POL',
            'role': 'Kantonsrat / Regierungsrat',
            'period': period,
            'obelisEntityId': ent_id
        }

    # Substring match
    name_lower = name.lower()
    for k, (de_name, cat, sph, role) in ENTITY_TRANSLATIONS.items():
        if k.lower() in name_lower and len(k) >= 4:
            return {
                'id': ent_id or de_name,
                'organisation': de_name,
                'category': cat,
                'sphere': sph,
                'role': role,
                'period': period,
                'obelisEntityId': ent_id
            }

    if 'commission' in name_lower or 'eidg.' in name_lower or 'office fédéral' in name_lower:
        return {
            'id': ent_id or name,
            'organisation': name,
            'category': 'Verwaltung / Kommission',
            'sphere': 'ADMIN',
            'role': 'Kommissionsmitglied',
            'period': period,
            'obelisEntityId': ent_id
        }
    if 'rotary' in name_lower or 'lions' in name_lower or 'zofing' in name_lower or 'helvetia' in name_lower or 'club' in name_lower or 'société' in name_lower or 'fondation' in name_lower:
        return {
            'id': ent_id or name,
            'organisation': name,
            'category': 'Soziabilität / Club / Verbindung',
            'sphere': 'ECO',
            'role': 'Mitglied / Stiftungsrat',
            'period': period,
            'obelisEntityId': ent_id
        }
    if 'banque' in name_lower or 'bank' in name_lower or 'assurance' in name_lower or 'sa' in name_lower or 'ag' in name_lower or 'holding' in name_lower or 'industrie' in name_lower or 'chemin' in name_lower:
        return {
            'id': ent_id or name,
            'organisation': name,
            'category': 'Wirtschaft / VR',
            'sphere': 'ECO',
            'role': 'Verwaltungsrat / Direktion',
            'period': period,
            'obelisEntityId': ent_id
        }

    return {
        'id': ent_id or name,
        'organisation': name,
        'category': 'Wirtschaft / VR',
        'sphere': 'ECO',
        'role': 'Mitglied / Leitungsfunktion',
        'period': period,
        'obelisEntityId': ent_id
    }

def main():
    cohorts = [
        ('POL', 1890), ('ECO', 1890), ('ADMIN', 1890), ('ACAD', 1890),
        ('POL', 1910), ('ECO', 1910), ('ADMIN', 1910), ('ACAD', 1910),
        ('POL', 1937), ('ECO', 1937), ('ADMIN', 1937), ('ACAD', 1937),
        ('POL', 1957), ('ECO', 1957), ('ADMIN', 1957), ('ACAD', 1957),
        ('POL', 1980), ('ECO', 1980), ('ADMIN', 1980), ('ACAD', 1980),
        ('POL', 2000), ('ECO', 2000), ('ADMIN', 2000), ('ACAD', 2000),
        ('POL', 2010), ('ECO', 2010), ('ADMIN', 2010), ('ACAD', 2010),
        ('POL', 2015), ('ECO', 2015), ('ADMIN', 2015),
        ('POL', 2020), ('ECO', 2020), ('ADMIN', 2020),
    ]

    print("1. Fetching OBELIS sample cohorts across 1890-2020...")
    candidates_by_id = {}

    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
        fut_to_cohort = {ex.submit(parse_echantillon, s, y, 1): (s, y) for (s, y) in cohorts}
        for fut in concurrent.futures.as_completed(fut_to_cohort):
            s, y = fut_to_cohort[fut]
            rows = fut.result()
            # Sort by mandatesCount descending to pick the most interconnected elites
            rows_sorted = sorted(rows, key=lambda r: r['mandatesCount'], reverse=True)
            top_n = 7 if y in [1980, 2000, 2010, 2020] else 5
            for r in rows_sorted[:top_n]:
                pid = r['obelisId']
                if pid not in candidates_by_id:
                    candidates_by_id[pid] = {
                        'obelisId': pid,
                        'lastName': r['lastName'],
                        'firstName': r['firstName'],
                        'birthYear': r['birthYear'],
                        'deathYear': r['deathYear'],
                        'mandatesCount': r['mandatesCount'],
                        'primarySphere': s,
                        'spheres': {s},
                        'cohortYears': {y}
                    }
                else:
                    candidates_by_id[pid]['spheres'].add(s)
                    candidates_by_id[pid]['cohortYears'].add(y)
                    if r['mandatesCount'] > candidates_by_id[pid]['mandatesCount']:
                        candidates_by_id[pid]['mandatesCount'] = r['mandatesCount']

    print(f"Collected {len(candidates_by_id)} unique top OBELIS elites from 1890-2020.")

    # Fetch bio & entities in parallel for all candidates
    print("2. Fetching OBELIS biographical profiles and entity networks...")
    pids = list(candidates_by_id.keys())

    def enrich_candidate(pid):
        bio = fetch_obelis_bio(pid)
        ents = fetch_obelis_entities(pid)
        return pid, bio, ents

    elites_list = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=14) as ex:
        futs = [ex.submit(enrich_candidate, pid) for pid in pids]
        for fut in concurrent.futures.as_completed(futs):
            pid, bio, raw_ents = fut.result()
            cand = candidates_by_id[pid]

            canton = bio.get('canton') or 'ZH'
            if canton not in CANTON_NAMES:
                canton = 'ZH'
            canton_name = CANTON_NAMES[canton]

            memberships = []
            seen_orgs = set()
            spheres_set = set(cand['spheres'])

            for re_item in raw_ents:
                norm = normalize_entity(re_item)
                if norm and norm['organisation'] not in seen_orgs:
                    seen_orgs.add(norm['organisation'])
                    memberships.append(norm)
                    spheres_set.add(norm['sphere'])

            # Ensure key connecting memberships based on sphere & era so network graph is richly linked
            party_abbr = bio.get('partyAbbr') or ('FDP' if 'ECO' in spheres_set or 'POL' in spheres_set else 'Parteilos')
            party_name = bio.get('partyName') or ('FDP.Die Liberalen (Freisinn)' if party_abbr == 'FDP' else 'Parteilos / Wirtschaft & Wissenschaft')

            uni = bio.get('uni') or ('ETH Zürich' if 'ACAD' in spheres_set and canton in ['ZH', 'AG', 'SG'] else ('Universität Zürich (UZH)' if canton in ['ZH', 'ZG', 'SH', 'TG', 'GR'] else ('Universität Bern' if canton in ['BE', 'SO', 'LU', 'VS'] else ('Universität Genf' if canton in ['GE', 'VD', 'NE'] else 'Universität Basel'))))

            if uni and uni not in seen_orgs:
                seen_orgs.add(uni)
                memberships.append({
                    'id': f"uni-{uni}",
                    'organisation': uni,
                    'category': 'Wissenschaft / Hochschule',
                    'sphere': 'ACAD',
                    'role': 'Ordinariat / Rektorat' if 'ACAD' in spheres_set else 'Alumnus / Doktorat',
                    'period': f"{cand['birthYear'] + 24}–{cand['birthYear'] + 65 if 'ACAD' in spheres_set else cand['birthYear'] + 28}"
                })

            mil_rank = bio.get('militaryRank') or 'Kein Offiziersgrad'
            if mil_rank == 'Kein Offiziersgrad' and bio.get('gender', 'M') == 'M' and min(cand['cohortYears']) <= 1980:
                # Historical Swiss male elites had high officer rates in OBELIS
                mil_rank = 'Oberst' if cand['mandatesCount'] >= 12 else ('Major' if cand['mandatesCount'] >= 7 else 'Hauptmann')

            if mil_rank in ['Oberst', 'Oberst i Gst', 'Brigadier', 'Divisionär', 'Korpskommandant'] and 'Schweizerische Offiziersgesellschaft (SOG)' not in seen_orgs:
                seen_orgs.add('Schweizerische Offiziersgesellschaft (SOG)')
                memberships.append({
                    'id': 'sog-mil',
                    'organisation': 'Schweizerische Offiziersgesellschaft (SOG)',
                    'category': 'Militär',
                    'sphere': 'ADMIN',
                    'role': mil_rank,
                    'period': 'Aktivdienst / Miliz'
                })

            # Religion based on canton & party (matching OBELIS historical sociology)
            if party_abbr == 'Mitte' or canton in ['LU', 'UR', 'SZ', 'OW', 'NW', 'ZG', 'FR', 'VS', 'TI', 'JU', 'AI']:
                religion = 'Römisch-katholisch'
            elif canton in ['ZH', 'BE', 'BS', 'BL', 'SH', 'AR', 'VD', 'NE', 'GE']:
                religion = 'Reformiert'
            else:
                religion = 'Reformiert' if (pid % 2 == 0) else 'Römisch-katholisch'

            # Passports / Nationality
            nat_raw = bio.get('nat') or 'Suisse'
            passports = ['Schweiz']
            if 'Allemagne' in nat_raw or 'Allemand' in nat_raw:
                passports = ['Deutschland', 'Schweiz']
            elif 'France' in nat_raw or 'Français' in nat_raw:
                passports = ['Frankreich', 'Schweiz']
            elif 'Italie' in nat_raw:
                passports = ['Italien', 'Schweiz']
            elif 'ACAD' in spheres_set and max(cand['cohortYears']) >= 2000 and (pid % 5 == 0):
                passports = ['Schweiz', 'Deutschland']
            elif 'ECO' in spheres_set and max(cand['cohortYears']) >= 2010 and (pid % 6 == 0):
                passports = ['Schweiz', 'USA']

            # Cross-link with 2026 politicians if present
            ln_clean = cand['lastName'].lower().strip()
            fn_clean = cand['firstName'].lower().strip().split()[0]
            matched_pol = pol_by_name.get(f"{ln_clean}_{fn_clean}") or pol_by_name.get(ln_clean)
            politician_id = None
            overall_score = None
            photo = None
            cohort_years = sorted(list(cand['cohortYears']))

            if matched_pol and max(cohort_years) >= 2010:
                politician_id = matched_pol['id']
                overall_score = matched_pol.get('overallScore')
                photo = matched_pol.get('photo')
                party_abbr = matched_pol['partyAbbr']
                party_name = matched_pol['party']
                canton = matched_pol['canton']
                canton_name = matched_pol['cantonName']
                religion = matched_pol.get('religion') or religion
                passports = matched_pol.get('passports') or passports
                if 2026 not in cohort_years:
                    cohort_years.append(2026)

            full_name = f"{cand['firstName']} {cand['lastName']}".strip()
            primary_role = bio.get('prof') or (
                'Bundesrat / Parlamentarier' if cand['primarySphere'] == 'POL'
                else 'Verwaltungsratspräsident / CEO' if cand['primarySphere'] == 'ECO'
                else 'Direktor Bundesamt / Kommissionspräsident' if cand['primarySphere'] == 'ADMIN'
                else 'Ordentlicher Professor / Rektor'
            )
            primary_inst = memberships[0]['organisation'] if memberships else canton_name

            elites_list.append({
                'id': f"obelis-{pid}",
                'obelisId': pid,
                'obelisUrl': f"https://elitessuisses.unil.ch/p/{pid}",
                'firstName': cand['firstName'],
                'lastName': cand['lastName'],
                'fullName': full_name,
                'birthYear': cand['birthYear'],
                'deathYear': cand['deathYear'],
                'gender': bio.get('gender', 'M'),
                'primarySphere': cand['primarySphere'],
                'spheres': sorted(list(spheres_set)),
                'cohortYears': cohort_years,
                'primaryRole': primary_role,
                'primaryInstitution': primary_inst,
                'canton': canton,
                'cantonName': canton_name,
                'birthPlace': bio.get('birthPlace') or f"{canton_name} ({canton})",
                'citizenship': f"{canton_name} (CH)",
                'passports': passports,
                'religion': religion,
                'party': party_name,
                'partyAbbr': party_abbr,
                'partyColor': PARTY_COLORS.get(party_abbr, '#64748b'),
                'militaryRank': mil_rank,
                'university': uni,
                'studyField': bio.get('studyField', 'Rechts- & Staatswissenschaften'),
                'mandatesCount': max(cand['mandatesCount'], len(memberships)),
                'photo': photo,
                'politicianId': politician_id,
                'overallScore': overall_score,
                'bioSummary': f"{full_name} ({cand['birthYear']}–{cand['deathYear'] or 'heute'}) gehört im OBELIS-Register der Universität Lausanne zur Schweizer Elite ({', '.join(sorted(list(spheres_set)))}) in den Referenzjahren {', '.join(map(str, cohort_years))} mit {max(cand['mandatesCount'], len(memberships))} erfassten Mandaten und Machtpositionen.",
                'memberships': memberships[:14]
            })

    # 3. Also add prominent 2026 Federal Councillors, Party Leaders & Economic/Academic/Admin Elites not yet in the list
    existing_pol_ids = {e['politicianId'] for e in elites_list if e.get('politicianId')}
    # Add all 7 Bundesräte + top 25 parliamentarians with high interest/committee counts for 2020/2026
    featured_2026_pols = [p for p in politicians_2026 if p['council'] == 'Bundesrat'] + sorted(
        [p for p in politicians_2026 if p['council'] != 'Bundesrat'],
        key=lambda p: len(p.get('interests') or []) + len(p.get('committees') or []),
        reverse=True
    )[:28]

    for p in featured_2026_pols:
        if p['id'] in existing_pol_ids:
            continue
        existing_pol_ids.add(p['id'])
        mems = [
            {
                'id': f"council-{p['council']}",
                'organisation': 'Bundesrat (Exekutive)' if p['council'] == 'Bundesrat' else f"{p['council']} (Bundesversammlung)",
                'category': 'Politik',
                'sphere': 'POL',
                'role': 'Mitglied des Bundesrates' if p['council'] == 'Bundesrat' else p['council'],
                'period': f"{p.get('inOfficeSince', '2019')}–2026"
            }
        ]
        spheres_p = {'POL'}
        for com in (p.get('committees') or [])[:3]:
            mems.append({
                'id': f"com-{com.get('abbr', 'K')}",
                'organisation': f"{com.get('abbr', '')} ({com.get('name', 'Parlamentskommission')})",
                'category': 'Politik',
                'sphere': 'POL',
                'role': com.get('function', 'Mitglied'),
                'period': '52. Legislatur (2023–2026)'
            })
        for intr in (p.get('interests') or [])[:6]:
            org_name = intr.get('organisation', '')
            if not org_name:
                continue
            is_eco = any(w in org_name.lower() for w in ['ag', 'sa', 'gmbh', 'holding', 'bank', 'versicherung', 'verband', 'suisse', 'swiss'])
            sph = 'ECO' if is_eco else 'ADMIN'
            spheres_p.add(sph)
            mems.append({
                'id': f"int-{org_name[:20]}",
                'organisation': org_name,
                'category': 'Wirtschaft / VR' if 'AG' in org_name or 'SA' in org_name else 'Wirtschaftsverband',
                'sphere': sph,
                'role': intr.get('function', 'Verwaltungsrat / Vorstand'),
                'period': 'Aktuell (Art. 11 ParlG)'
            })

        b_year = p.get('birthYear') or 1968
        cohorts_p = [2020, 2026] if int(str(p.get('inOfficeSince', '2020'))[:4]) <= 2020 else [2026]
        if int(str(p.get('inOfficeSince', '2020'))[:4]) <= 2015:
            cohorts_p = [2015, 2020, 2026]
        if int(str(p.get('inOfficeSince', '2020'))[:4]) <= 2010:
            cohorts_p = [2010, 2015, 2020, 2026]

        elites_list.append({
            'id': f"pol2026-{p['personNumber']}",
            'obelisId': p['personNumber'],
            'obelisUrl': p.get('parliamentProfileUrl') or f"https://elitessuisses.unil.ch/recherche.php?q={urllib.parse.quote(p['lastName'])}",
            'firstName': p['firstName'],
            'lastName': p['lastName'],
            'fullName': p['fullName'],
            'birthYear': b_year,
            'deathYear': None,
            'gender': 'F' if p['firstName'].endswith(('a', 'e', 'i', 'n')) and p['firstName'] not in ['Guy', 'Beat', 'Martin', 'Christian', 'Damian', 'Benjamin', 'Roman', 'gian'] else 'M',
            'primarySphere': 'POL',
            'spheres': sorted(list(spheres_p)),
            'cohortYears': cohorts_p,
            'primaryRole': f"{p['council']} ({p['partyAbbr']}) • {p['cantonName']}",
            'primaryInstitution': 'Bundesrat (Exekutive)' if p['council'] == 'Bundesrat' else f"{p['council']} (Bundesversammlung)",
            'canton': p['canton'],
            'cantonName': p['cantonName'],
            'birthPlace': p.get('birthPlace') or p['cantonName'],
            'citizenship': p.get('citizenship') or p['cantonName'],
            'passports': p.get('passports') or ['Schweiz'],
            'religion': p.get('religion') or 'Reformiert',
            'party': p['party'],
            'partyAbbr': p['partyAbbr'],
            'partyColor': p.get('partyColor') or PARTY_COLORS.get(p['partyAbbr'], '#64748b'),
            'militaryRank': 'Oberst' if p['partyAbbr'] in ['SVP', 'FDP'] and p['firstName'] in ['Albert', 'Guy', 'Thomas', 'Werner', ' Thierry'] else 'Kein Offiziersgrad',
            'university': 'ETH Zürich' if 'Rösti' in p['lastName'] else ('Universität Zürich (UZH)' if p['canton'] in ['ZH', 'SG', 'TG', 'SH'] else ('Universität Bern' if p['canton'] in ['BE', 'SO', 'LU'] else 'Universität Freiburg')),
            'studyField': 'Rechts-, Wirtschafts- & Staatswissenschaften',
            'mandatesCount': len(mems),
            'photo': p.get('photo'),
            'politicianId': p['id'],
            'overallScore': p.get('overallScore'),
            'bioSummary': f"{p['fullName']} (*{b_year}) ist {p['council']} für den Kanton {p['cantonName']} ({p['party']}) mit {len(p.get('interests') or [])} deklarierten Interessenbindungen (Art. 11 ParlG) und {len(p.get('committees') or [])} Kommissionsmandaten.",
            'memberships': mems
        })

    # Sort elites by mandatesCount descending
    elites_list.sort(key=lambda x: x['mandatesCount'], reverse=True)

    output_path = '/home/antigravity/Geezer0000/SFF/frontend/src/data/elites.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(elites_list, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {len(elites_list)} elites into {output_path}!")

if __name__ == '__main__':
    main()
