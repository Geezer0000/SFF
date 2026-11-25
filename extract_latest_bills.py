import urllib.request
import json
import re
import time

url = "https://ws.parlament.ch/odata.svc/MemberCouncil(ID=4169,Language='DE')/Votings?$format=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
res = json.loads(urllib.request.urlopen(req, timeout=15).read().decode('utf-8'))['d']
v_list = res if isinstance(res, list) else res.get('results', [])

def get_ts(item):
    m = re.search(r'/Date\((\d+)', str(item.get('VoteEnd', '')))
    return int(m.group(1)) if m else 0

# Sort descending by timestamp
v_list.sort(key=get_ts, reverse=True)

unique_bills = {}
recent_bills = []
for v in v_list:
    b_num = v.get('BusinessShortNumber') or str(v.get('BusinessNumber'))
    if b_num in unique_bills:
        continue
    unique_bills[b_num] = True
    
    ts = get_ts(v) / 1000.0
    date_str = time.strftime('%Y-%m-%d', time.gmtime(ts))
    b_title = v.get('BusinessTitle') or 'Geschäft der Bundesversammlung'
    decision = v.get('DecisionText') or 'Ja'
    meaning_yes = v.get('MeaningYes') or 'Zustimmung'
    meaning_no = v.get('MeaningNo') or 'Ablehnung'
    subject = v.get('Subject') or 'Schlussabstimmung'
    
    recent_bills.append({
        'id': f"bill-{v.get('IdVote', b_num)}",
        'businessNumber': b_num,
        'title': b_title,
        'date': date_str,
        'subject': subject,
        'summary': f"Geschäft {b_num}: {b_title}. {subject}. Ja: {meaning_yes}. Nein: {meaning_no}.",
        'decision': decision,
        'sourceUrl': f"https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId={v.get('BusinessNumber')}"
    })
    if len(recent_bills) >= 20:
        break

print(f"Extracted {len(recent_bills)} top current bills:")
for b in recent_bills[:8]:
    print(b['date'], b['businessNumber'], b['title'][:65])

with open('C:/SFF/latest_bills.json', 'w', encoding='utf-8') as f:
    json.dump(recent_bills, f, ensure_ascii=False, indent=2)
