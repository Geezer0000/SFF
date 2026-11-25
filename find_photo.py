import urllib.request
import json

url = "https://www.parlament.ch/_api/Lists/getByTitle('Entity%20Mappings')/Items?$filter=startswith(FileRef,'/Lists/Entity%20Mappings/Councilor/')&$select=Id,Title,ERMCategory,ERMExternalId,FileRef,ERMUrl_de&$format=json"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json;odata=verbose"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    for item in data['d']['results']:
        print(item.get('Title'), item.get('ERMCategory'), item.get('ERMUrl_de'))
