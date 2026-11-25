import urllib.request
import json
import time

brs = [
    ('Viola_Amherd', 'amherd'),
    ('Guy_Parmelin', 'parmelin'),
    ('Ignazio_Cassis', 'cassis'),
    ('Karin_Keller-Sutter', 'kellersutter'),
    ('Albert_R%C3%B6sti', 'roesti'),
    ('Elisabeth_Baume-Schneider', 'baumeschneider'),
    ('Beat_Jans', 'jans')
]

results = {}
for title, key in brs:
    time.sleep(1.2)
    u = f"https://de.wikipedia.org/w/api.php?action=query&titles={title}&prop=pageimages&format=json&pithumbsize=500"
    req = urllib.request.Request(u, headers={'User-Agent': 'ProSchweizScorecardBot/1.0 (contact: info@proschweiz.ch)'})
    try:
        data = json.loads(urllib.request.urlopen(req, timeout=10).read().decode('utf-8'))
        p = list(data['query']['pages'].values())[0]
        thumb = p.get('thumbnail', {}).get('source')
        print(f"{key}: {thumb}")
        results[key] = thumb
    except Exception as e:
        print(f"Error {title}: {e}")

print("Results:", json.dumps(results, indent=2))
