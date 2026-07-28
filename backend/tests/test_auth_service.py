import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.auth_service import normalize_ip_address, resolve_role_code


def test_resolve_role_code_maps_common_roles():
    assert resolve_role_code(None, "user") == "USER"
    assert resolve_role_code(None, "ADVISOR") == "ADVISOR"


def test_normalize_ip_address_rejects_non_ip_strings():
    assert normalize_ip_address("testclient") is None
    assert normalize_ip_address("192.168.1.10") == "192.168.1.10"
    assert normalize_ip_address("2001:db8::1") == "2001:db8::1"
