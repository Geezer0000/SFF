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

v_list.sort(key=get_ts, reverse=True)

# Select unique significant bills from 2026 up to middle of year (2026-06-30)
selected_bills = []
seen = set()

for v in v_list:
    ts = get_ts(v) / 1000.0
    date_str = time.strftime('%Y-%m-%d', time.gmtime(ts))
    
    # Must be 2026 and <= 2026-06-30
    if not (date_str.startswith('2026-') and date_str <= '2026-06-30'):
        continue
        
    b_num = v.get('BusinessShortNumber') or str(v.get('BusinessNumber'))
    if b_num in seen or b_num == '00.000':
        continue
    seen.add(b_num)

    b_title = v.get('BusinessTitle') or 'Geschäft der Bundesversammlung'
    decision = v.get('DecisionText') or 'Ja'
    meaning_yes = v.get('MeaningYes') or 'Zustimmung'
    meaning_no = v.get('MeaningNo') or 'Ablehnung'
    subject = v.get('Subject') or 'Gesamtabstimmung'

    selected_bills.append({
        'id': f"bill-{v.get('IdVote', b_num)}",
        'businessNumber': b_num,
        'title': b_title,
        'date': date_str,
        'subject': subject,
        'summary': f"Geschäft {b_num}: {b_title}. Behandelt am {date_str}. {subject}. Ja: {meaning_yes}. Nein: {meaning_no}.",
        'decision': decision,
        'sourceUrl': f"https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId={v.get('BusinessNumber')}"
    })
    
    if len(selected_bills) >= 20:
        break

print(f"Extracted {len(selected_bills)} bills strictly from Jan 2026 to Mid-2026:")
for b in selected_bills:
    print(f"{b['date']} | {b['businessNumber']} | {b['title'][:60]}")

with open('C:/SFF/bills_2026_midyear.json', 'w', encoding='utf-8') as f:
    json.dump(selected_bills, f, ensure_ascii=False, indent=2)
