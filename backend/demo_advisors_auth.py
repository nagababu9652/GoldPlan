"""Demo: unauthenticated vs authenticated /advisors/dashboard + /advisors/portfolio."""
import json
import uuid
import urllib.request
import urllib.error

BASE = "http://localhost:8000"


def call(method, path, token=None, data=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


email = f"demo_{uuid.uuid4().hex[:8]}@test.com"
print("== 1. No token (reproduces your curl result) ==")
print(call("GET", "/advisors/dashboard"))
print(call("GET", "/advisors/portfolio"))

print("== 2. Register advisor ==")
print(call("POST", "/auth/register", data={
    "first_name": "Demo", "last_name": "Advisor", "email": email,
    "password": "test1234", "role": "advisor",
})[0])

print("== 3. Login ==")
status, body = call("POST", "/auth/login", data={"email": email, "password": "test1234"})
print(status)
token = json.loads(body)["access_token"]

print("== 4. Authenticated /advisors/dashboard ==")
status, body = call("GET", "/advisors/dashboard", token=token)
print(status, body[:400])

print("== 5. Authenticated /advisors/portfolio (PortfolioPerformance data) ==")
status, body = call("GET", "/advisors/portfolio", token=token)
print(status, body[:600])