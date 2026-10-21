import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import json
import http.cookiejar

cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

# 1. Test homepage
resp = opener.open('http://127.0.0.1:5000/')
assert resp.status == 200
html = resp.read().decode('utf-8')
assert 'SubAlert' in html
assert 'Reiniciar Valores' in html
assert 'Deshacer' in html
assert 'Guardar Cambios' in html
print('✓ Index HTML renders correctly with the 3 new buttons: Reiniciar, Deshacer, Guardar')

# 2. Test 1-click Demo Auth
req = urllib.request.Request('http://127.0.0.1:5000/api/auth/demo', data=b'{}', headers={'Content-Type': 'application/json'})
resp = opener.open(req)
data = json.loads(resp.read().decode('utf-8'))
assert data['user']['email'] == 'demo@subalert.app'
print('✓ Demo login working:', data['user']['name'])

# 3. Test Save-All endpoint
req = urllib.request.Request('http://127.0.0.1:5000/api/subscriptions/save-all', data=b'{}', headers={'Content-Type': 'application/json'})
resp = opener.open(req)
save_resp = json.loads(resp.read().decode('utf-8'))
assert 'éxito' in save_resp['message'].lower() or 'guardados' in save_resp['message'].lower()
print('✓ API Save-all endpoint confirmed:', save_resp['message'])

# 4. Test Reset endpoint
req = urllib.request.Request('http://127.0.0.1:5000/api/subscriptions/reset', data=b'{}', headers={'Content-Type': 'application/json'})
resp = opener.open(req)
reset_resp = json.loads(resp.read().decode('utf-8'))
print('✓ API Reset endpoint working:', reset_resp['message'])

# 5. Fetch after reset
resp = opener.open('http://127.0.0.1:5000/api/subscriptions')
subs_data = json.loads(resp.read().decode('utf-8'))
assert len(subs_data['subscriptions']) == 6
print(f'✓ Reset successfully repopulated {len(subs_data["subscriptions"])} default subscriptions')

# 6. Test Snapshot Restore (Undo API)
snapshot = subs_data['subscriptions']
# Modify by deleting one subscription
sub_id = snapshot[0]['id']
req = urllib.request.Request(f'http://127.0.0.1:5000/api/subscriptions/{sub_id}', headers={'Content-Type': 'application/json'})
req.get_method = lambda: 'DELETE'
opener.open(req)

# Verify count is 5
resp = opener.open('http://127.0.0.1:5000/api/subscriptions')
assert len(json.loads(resp.read().decode('utf-8'))['subscriptions']) == 5

# Now Restore Snapshot (Undo)
restore_data = {'subscriptions': snapshot}
req = urllib.request.Request('http://127.0.0.1:5000/api/subscriptions/restore', data=json.dumps(restore_data).encode('utf-8'), headers={'Content-Type': 'application/json'})
resp = opener.open(req)
restore_resp = json.loads(resp.read().decode('utf-8'))
print('✓ API Restore/Undo endpoint working:', restore_resp['message'])

# Verify count is back to 6
resp = opener.open('http://127.0.0.1:5000/api/subscriptions')
assert len(json.loads(resp.read().decode('utf-8'))['subscriptions']) == 6
print('✓ Undo verified: subscription was restored cleanly')

print('\n>>> TODOS LOS TESTS DE REINICIAR, DESHACER Y GUARDAR HAN PASADO AL 100%! <<<')
