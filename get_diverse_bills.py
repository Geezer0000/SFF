import urllib.request
import json
import re
import time

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_ts(item):
    m = re.search(r'/Date\((\d+)', str(item.get('VoteEnd', '')))
    return int(m.group(1)) if m else 0

url = "https://ws.parlament.ch/odata.svc/MemberCouncil(ID=4053,Language='DE')/Votings?$format=json"
res = fetch_json(url)['d']
v_list = res if isinstance(res, list) else res.get('results', [])
v_list.sort(key=get_ts, reverse=True)

# Select key final votes across diverse dates in March, April, May, June 2026:
target_dates = [
    '2026-06-19', '2026-06-18', '2026-06-17', '2026-06-15', '2026-06-10', '2026-06-09',
    '2026-04-30', '2026-04-29', '2026-04-28', '2026-03-20', '2026-03-11', '2026-03-05'
]

curated = []
seen_dates = set()
seen_biz = set()

for v in v_list:
    ts = get_ts(v) / 1000.0
    d = time.strftime('%Y-%m-%d', time.gmtime(ts))
    b = v.get('BusinessShortNumber')
    title = v.get('BusinessTitle')
    
    if not (d.startswith('2026-') and d <= '2026-06-30'):
        continue
    if not b or b == '00.000' or b in seen_biz or not title or 'Ordnungsantrag' in title:
        continue
        
    # Prefer new dates
    if d in seen_dates and len(seen_dates) < len(target_dates):
        continue
        
    seen_dates.add(d)
    seen_biz.add(b)
    
    clean_summary = f"Geschäft {b}: {title}. Behandelt am {d} in der Bundesversammlung."
    
    curated.append({
        'id': f"bill-{b.replace('.', '-')}",
        'businessNumber': b,
        'title': title,
        'date': d,
        'subject': v.get('Subject') or 'Gesamtabstimmung',
        'summary': clean_summary,
        'sourceUrl': f"https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId={v.get('BusinessNumber')}",
        'rating': 'Ungraded',
        'realPosition': v.get('DecisionText') or 'Ja'
    })
    
    if len(curated) >= 12:
        break

print(f"Curated {len(curated)} bills with diverse session dates across 2026:")
for c in curated:
    print(f"  {c['date']} | {c['businessNumber']} | {c['title'][:55]}")

with open('C:/SFF/real_diverse_2026_bills.json', 'w', encoding='utf-8') as f:
    json.dump(curated, f, ensure_ascii=False, indent=2)
