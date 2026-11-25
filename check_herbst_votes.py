import urllib.request
import json

url = "https://ws.parlament.ch/odata.svc/Vote(ID=38963,Language='DE')?$format=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read().decode('utf-8'))
        d = data['d']
        print(d.get('ID'), d.get('BusinessShortNumber'), d.get('BusinessTitle'))
except Exception as e:
    print("Error:", e)
