import json

# ProSchweiz Targets defined by user
proschweiz_targets = {
    "24.092": "Ja",    # Neutralitätsinitiative: ja
    "25.067": "Ja",    # sichere ernährung durch nachhaltige produktion: ja
    "25.070": "Nein",  # freihandelsabkommen: nein (wegen kosovo)
    "26.022": "Nein",  # crans montana unterstützung: nein
    "24.073": "Nein",  # 13. ahv zeugs: nein
    "25.018": "Nein",  # ja zu fairen bundessteuern auch für ehepaare: nein
    "25.047": "Nein",  # bundesgesetz über politische rechte, erleichterung der stimmabgabe: nein
    "25.068": "Ja",    # blackout stoppen: ja (nein zum gegenentwurf)
    "25.084": "Nein",  # modernisiertes freihandelsabkommen: nein (wegen ukraine)
    "25.440": "Ja",    # abgeltungen für pfas sanierungen rückwirkend zulassen: ja
    "26.018": "Ja",    # freihandelsabkommen malaysia und efta: ja
    "26.028": "Nein",  # abkommen über die zusammenarbeit ukraine: nein
}

with open("c:/SFF/frontend/src/data/politicians.json", "r", encoding="utf-8") as f:
    politicians = json.load(f)

for p in politicians:
    is_bundesrat = p.get("council") == "Bundesrat"
    
    # Check if this member is the Nationalratspräsident / Council President who does not vote
    presiding_votes = [b for b in p.get("recentVotes", []) if "präsident" in b.get("politicianPosition", "").lower() or "president" in b.get("politicianPosition", "").lower()]
    is_president = len(presiding_votes) >= 6 # Presiding over the council

    if is_bundesrat or is_president:
        p["scorePoints"] = None
        p["overallScore"] = None # Swiss Grade null / Ungraded (like Bundesrat)
        p["actionsAligned"] = 0
        p["actionsTotal"] = 12
        p["isPresident"] = is_president
        for b in p.get("recentVotes", []):
            bn = b["businessNumber"]
            b["targetPosition"] = proschweiz_targets.get(bn, "Ungraded")
            if is_bundesrat:
                b["rating"] = "Exekutive"
                b["alignment"] = "Executive"
            else:
                b["rating"] = "Präsidium"
                b["alignment"] = "President"
        continue

    total_points = 0
    aligned_count = 0
    total_actions = len(p.get("recentVotes", []))

    for b in p.get("recentVotes", []):
        bn = b["businessNumber"]
        target = proschweiz_targets.get(bn)
        b["targetPosition"] = target
        pos = b.get("politicianPosition", "").strip()

        if target is None:
            b["rating"] = "Ungraded"
            b["alignment"] = "Neutral"
            continue

        if pos == target:
            total_points += 5
            aligned_count += 1
            b["rating"] = "+5"
            b["alignment"] = "Aligned"
        elif any(k in pos.lower() for k in ["präsident", "president"]):
            # Specific vote presided: no penalty, 0 points
            b["rating"] = "0"
            b["alignment"] = "President"
        elif any(k in pos.lower() for k in ["enthaltung", "nicht teilgenommen", "abwesend"]):
            total_points -= 1
            b["rating"] = "-1"
            b["alignment"] = "Abstained"
        else: # Opposite vote
            total_points -= 5
            b["rating"] = "-5"
            b["alignment"] = "Opposed"

    grade = 1.0 + ((total_points + 60.0) / 120.0) * 5.0
    grade = max(1.0, min(6.0, grade))
    grade_rounded = round(grade, 1)

    p["scorePoints"] = total_points
    p["overallScore"] = grade_rounded
    p["actionsAligned"] = aligned_count
    p["actionsTotal"] = total_actions
    p["isPresident"] = False

# Check Pierre-André Page specifically
pa_page = [p for p in politicians if "Page" in p["fullName"]][0]
print("Pierre-André Page updated status:")
print(f"overallScore: {pa_page['overallScore']}, isPresident: {pa_page.get('isPresident')}")
print(f"First vote alignment: {pa_page['recentVotes'][0]['alignment']}, rating: {pa_page['recentVotes'][0]['rating']}")

with open("c:/SFF/frontend/src/data/politicians.json", "w", encoding="utf-8") as f:
    json.dump(politicians, f, ensure_ascii=False, indent=2)

print("\nSaved updated politicians.json successfully!")
