import http.client
import json
import time

conn = http.client.HTTPConnection('localhost', 8000)
body = json.dumps({
    'email': f'advisor_{int(time.time())}@test.com',
    'password': 'test1234',
    'first_name': 'Advisor',
    'last_name': 'Test',
    'role': 'advisor'
})
conn.request('POST', '/auth/register', body, {'Content-Type': 'application/json'})
r = conn.getresponse()
print('Status:', r.status)
print('Body:', r.read().decode())