import urllib.request
import json

names_to_find = {
    'Keller-Sutter': None,
    'Rösti': None,
    'Baume-Schneider': None,
    'Jans': None,
    'Parmelin': None,
    'Amherd': None,
    'Cassis': None
}

# Scan IDs from 4000 to 4500
found = {}
for p_id in range(4000, 4400):
    url = f"https://ws.parlament.ch/odata.svc/Person(ID={p_id},Language='DE')?$format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))['d']
            ln = data.get('LastName', '')
            fn = data.get('FirstName', '')
            for target in names_to_find:
                if target.lower() in ln.lower():
                    print(f"MATCH: {p_id} -> {fn} {ln} (PersonIdCode={data.get('PersonIdCode')})")
                    found[target] = (p_id, data.get('PersonIdCode'), fn, ln)
    except Exception:
        pass

print("Finished scan.")
