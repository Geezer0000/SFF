import urllib.request
import json

def get_all_votings_for_vote(vid):
    # Fetch all records for this vote
    records = {}
    skip = 0
    while True:
        url = f"https://ws.parlament.ch/odata.svc/Voting?$filter=IdVote%20eq%20{vid}&$skip={skip}&$top=500&$format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=12) as r:
            data = json.loads(r.read().decode('utf-8'))
            items = data['d']
            if not items:
                break
            for it in items:
                # store by PersonNumber
                pnum = it.get('PersonNumber')
                if pnum and pnum not in records:
                    records[pnum] = {
                        'name': f"{it.get('FirstName')} {it.get('LastName')}",
                        'canton': it.get('Canton'),
                        'party': it.get('ParlGroupCode'),
                        'decision': it.get('DecisionText'),
                        'decisionCode': it.get('Decision')
                    }
            if len(items) < 500:
                break
            skip += 500
    return records

res = get_all_votings_for_vote(36558)
print(f"Vote 36558: Total unique politicians recorded: {len(res)}")
# Print sample decisions by party
for pid, d in list(res.items())[:8]:
    print(f"- {d['name']} ({d['party']}, {d['canton']}): {d['decision']}")
