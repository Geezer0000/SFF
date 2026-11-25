import urllib.request
import json
import re
import time
import os

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_ts(item):
    m = re.search(r'/Date\((\d+)', str(item.get('VoteEnd', '')))
    return int(m.group(1)) if m else 0

# Sample 15 distinct significant bills handled on different days throughout spring & summer sessions 2026
url = "https://ws.parlament.ch/odata.svc/MemberCouncil(ID=4053,Language='DE')/Votings?$format=json"
res = fetch_json(url)['d']
v_list = res if isinstance(res, list) else res.get('results', [])
v_list.sort(key=get_ts, reverse=True)

# Select key final votes across diverse dates between March and June 2026:
target_bills = []
seen_business = set()

for v in v_list:
    ts = get_ts(v) / 1000.0
    date_str = time.strftime('%Y-%m-%d', time.gmtime(ts))
    if not (date_str.startswith('2026-') and date_str <= '2026-06-30'):
        continue
    
    b_num = v.get('BusinessShortNumber')
    b_title = v.get('BusinessTitle')
    subject = v.get('Subject') or 'Schlussabstimmung'
    
    # Filter out empty or duplicate or generic order votes
    if not b_num or b_num == '00.000' or b_num in seen_business:
        continue
    if not b_title or 'Ordnungsantrag' in b_title:
        continue
        
    seen_business.add(b_num)
    
    # Clean up summary: remove any French or repetitive "Vote final. Ja: ... Nein: ..."
    clean_summary = f"Geschäft {b_num}: {b_title}. Behandelt am {date_str} in der Bundesversammlung ({subject})."
    
    target_bills.append({
        'id': f"bill-{b_num.replace('.', '-')}",
        'businessNumber': b_num,
        'title': b_title,
        'date': date_str,
        'subject': subject,
        'summary': clean_summary,
        'sourceUrl': f"https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId={v.get('BusinessNumber')}",
        'rating': 'Ungraded'
    })
    
    if len(target_bills) >= 15:
        break

print(f"Curated {len(target_bills)} significant 2026 bills across session days:")
for b in target_bills:
    print(f"  {b['date']} | {b['businessNumber']} | {b['title'][:55]}")

with open('C:/SFF/curated_2026_bills.json', 'w', encoding='utf-8') as f:
    json.dump(target_bills, f, ensure_ascii=False, indent=2)
