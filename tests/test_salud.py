from fastapi.testclient import TestClient

from index import app


def test_salud():
    r = TestClient(app).get("/api/py/salud")
    assert r.status_code == 200
    assert r.json() == {"ok": True}
