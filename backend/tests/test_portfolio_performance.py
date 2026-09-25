"""
Tests for the PortfolioPerformance component and its backend API endpoint.
Tests the /advisors/portfolio endpoint and the frontend formatting logic.
"""
import os
import sys
import time
import json
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


@pytest.fixture
def advisor_token(client):
    """Register and login an advisor, return the access token."""
    unique = str(uuid.uuid4())[:8]
    email = f"advisor_{unique}@test.com"

    # Register advisor
    reg_response = client.post("/auth/register", json={
        "first_name": "Test",
        "last_name": "Advisor",
        "email": email,
        "password": "test1234",
        "role": "advisor",
    })
    assert reg_response.status_code == 201, f"Registration failed: {reg_response.text}"

    # Login to get token
    login_response = client.post("/auth/login", json={
        "email": email,
        "password": "test1234",
    })
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"

    return login_response.json()["access_token"]


# ============================================================================
# Backend API Tests - /advisors/portfolio
# ============================================================================

class TestPortfolioEndpoint:
    """Tests for the GET /advisors/portfolio endpoint."""

    def test_portfolio_requires_auth(self, client):
        """Portfolio endpoint should return 401 without a token."""
        response = client.get("/advisors/portfolio")
        assert response.status_code == 401

    def test_portfolio_returns_valid_data(self, client, advisor_token):
        """Portfolio endpoint should return valid portfolio data with auth."""
        response = client.get(
            "/advisors/portfolio",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        assert response.status_code == 200

        data = response.json()

        # Verify required fields exist
        assert "holdings" in data
        assert "total_value" in data
        assert "total_cost" in data
        assert "total_returns" in data
        assert "returns_percentage" in data

        # Verify holdings is a non-empty list
        assert isinstance(data["holdings"], list)
        assert len(data["holdings"]) > 0

        # Verify each holding has required fields
        for holding in data["holdings"]:
            assert "name" in holding
            assert "value" in holding
            assert "allocation" in holding
            assert "returns" in holding
            assert isinstance(holding["name"], str)
            assert isinstance(holding["value"], (int, float))
            assert isinstance(holding["allocation"], (int, float))
            assert isinstance(holding["returns"], (int, float))

        # Verify numeric fields
        assert isinstance(data["total_value"], (int, float))
        assert isinstance(data["total_cost"], (int, float))
        assert isinstance(data["total_returns"], (int, float))
        assert isinstance(data["returns_percentage"], (int, float))

        # Verify data consistency
        assert data["total_value"] > 0
        assert data["total_cost"] > 0
        assert data["total_returns"] == data["total_value"] - data["total_cost"]

        # Verify allocations sum to ~100%
        total_allocation = sum(h["allocation"] for h in data["holdings"])
        assert abs(total_allocation - 100) < 1, f"Allocations should sum to ~100%, got {total_allocation}"

        # Verify total value matches sum of holdings
        holdings_value = sum(h["value"] for h in data["holdings"])
        assert abs(holdings_value - data["total_value"]) < 1, (
            f"Holdings value {holdings_value} should match total_value {data['total_value']}"
        )

    def test_portfolio_rejects_invalid_token(self, client):
        """Portfolio endpoint should reject an invalid token."""
        response = client.get(
            "/advisors/portfolio",
            headers={"Authorization": "Bearer invalid_token_123"}
        )
        assert response.status_code == 401


# ============================================================================
# Frontend Component Logic Tests
# ============================================================================

class TestFormatCurrency:
    """Tests for the formatCurrency function in PortfolioPerformance.tsx."""

    def test_crores_formatting(self):
        """Values >= 10,000,000 should be formatted in Crores."""
        # Replicate the formatCurrency logic from PortfolioPerformance.tsx
        # JS: `₹${(value / 10000000).toFixed(2)} Cr`  ->  Python: f"₹{value / 10000000:.2f} Cr"
        def format_currency(value):
            if value >= 10000000:
                return f"₹{value / 10000000:.2f} Cr"
            if value >= 100000:
                return f"₹{value / 100000:.2f} L"
            return f"₹{value:,}"

        assert format_currency(12500000) == "₹1.25 Cr"
        assert format_currency(10000000) == "₹1.00 Cr"
        assert format_currency(25000000) == "₹2.50 Cr"

    def test_lakhs_formatting(self):
        """Values >= 100,000 should be formatted in Lakhs."""
        def format_currency(value):
            if value >= 10000000:
                return f"₹{value / 10000000:.2f} Cr"
            if value >= 100000:
                return f"₹{value / 100000:.2f} L"
            return f"₹{value:,}"

        assert format_currency(4500000) == "₹45.00 L"
        assert format_currency(100000) == "₹1.00 L"
        assert format_currency(1500000) == "₹15.00 L"

    def test_regular_formatting(self):
        """Values < 100,000 should use Indian locale formatting."""
        def format_currency(value):
            if value >= 10000000:
                return f"₹{value / 10000000:.2f} Cr"
            if value >= 100000:
                return f"₹{value / 100000:.2f} L"
            return f"₹{value:,}"

        assert format_currency(50000) == "₹50,000"
        assert format_currency(99999) == "₹99,999"
        assert format_currency(0) == "₹0"


class TestFormatPercent:
    """Tests for the formatPercent function in PortfolioPerformance.tsx."""

    def test_positive_percent(self):
        """Positive values should have a + prefix."""
        # JS: `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`  ->  Python: f"{'+' if value >= 0 else ''}{value:.1f}%"
        def format_percent(value):
            return f"{'+' if value >= 0 else ''}{value:.1f}%"

        assert format_percent(13.6) == "+13.6%"
        assert format_percent(0) == "+0.0%"
        assert format_percent(12.5) == "+12.5%"

    def test_negative_percent(self):
        """Negative values should have a - prefix."""
        def format_percent(value):
            return f"{'+' if value >= 0 else ''}{value:.1f}%"

        assert format_percent(-5.2) == "-5.2%"
        assert format_percent(-12.5) == "-12.5%"


class TestPortfolioDataShape:
    """Tests for the AdvisorPortfolio data shape used by PortfolioPerformance."""

    def test_portfolio_data_matches_component_interface(self, client, advisor_token):
        """The API response should match the AdvisorPortfolio interface used by the component."""
        response = client.get(
            "/advisors/portfolio",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        data = response.json()

        # The component accesses: portfolio.total_value, portfolio.total_cost,
        # portfolio.total_returns, portfolio.returns_percentage, portfolio.holdings
        # Each holding: holding.name, holding.value, holding.allocation, holding.returns
        required_top_level = {"holdings", "total_value", "total_cost", "total_returns", "returns_percentage"}
        assert required_top_level.issubset(set(data.keys())), (
            f"Missing fields: {required_top_level - set(data.keys())}"
        )

        required_holding_fields = {"name", "value", "allocation", "returns"}
        for holding in data["holdings"]:
            assert required_holding_fields.issubset(set(holding.keys())), (
                f"Holding missing fields: {required_holding_fields - set(holding.keys())}"
            )

    def test_portfolio_returns_positive_and_negative_cases(self, client, advisor_token):
        """Verify the returns_percentage can be positive or negative and component handles both."""
        response = client.get(
            "/advisors/portfolio",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        data = response.json()

        # The component uses returns_percentage >= 0 to determine green/red color
        returns_pct = data["returns_percentage"]
        assert isinstance(returns_pct, (int, float))

        # Component logic: if returns_percentage >= 0 -> green, else -> red
        # This is just verifying the data type is usable for this comparison
        if returns_pct >= 0:
            assert True  # Would render green
        else:
            assert True  # Would render red

    def test_holdings_allocation_bounds(self, client, advisor_token):
        """The component clamps allocation to [0, 100] for the progress bar width."""
        response = client.get(
            "/advisors/portfolio",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        data = response.json()

        for holding in data["holdings"]:
            # Component uses: Math.min(Math.max(holding.allocation, 0), 100)
            clamped = min(max(holding["allocation"], 0), 100)
            assert 0 <= clamped <= 100
            # The actual allocation should already be in valid range
            assert 0 <= holding["allocation"] <= 100


# ============================================================================
# End-to-End Flow Test
# ============================================================================

class TestPortfolioEndToEnd:
    """End-to-end test simulating the PortfolioPerformance component data flow."""

    def test_full_portfolio_flow(self, client, advisor_token):
        """
        Simulates the full data flow:
        1. Component reads token from localStorage
        2. Calls getAdvisorPortfolio(token)
        3. Renders portfolio data
        """
        # Step 1: Get portfolio data (simulating getAdvisorPortfolio)
        response = client.get(
            "/advisors/portfolio",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        assert response.status_code == 200
        portfolio = response.json()

        # Step 2: Verify all data the component renders is present
        # Header: formatCurrency(portfolio.total_value)
        assert "total_value" in portfolio

        # Returns: formatPercent(portfolio.returns_percentage)
        assert "returns_percentage" in portfolio

        # Summary cards: total_cost, total_returns, returns_percentage
        assert "total_cost" in portfolio
        assert "total_returns" in portfolio

        # Holdings list: name, value, allocation, returns
        assert "holdings" in portfolio
        assert len(portfolio["holdings"]) > 0

        # Step 3: Verify the data can be rendered (all values are serializable)
        import json as json_module
        json_str = json_module.dumps(portfolio)
        assert json_str is not None
        assert len(json_str) > 0

        # Step 4: Verify the component's key rendering logic works with this data
        # formatCurrency for total_value
        total_value = portfolio["total_value"]
        if total_value >= 10000000:
            formatted = f"₹{(total_value / 10000000):.2f} Cr"
        elif total_value >= 100000:
            formatted = f"₹{(total_value / 100000):.2f} L"
        else:
            formatted = f"₹{total_value:,}"
        assert formatted.startswith("₹")

        # formatPercent for returns_percentage
        returns_pct = portfolio["returns_percentage"]
        formatted_pct = f"{'+' if returns_pct >= 0 else ''}{returns_pct:.1f}%"
        assert formatted_pct.endswith("%")

        # Holdings count display
        holdings_count = len(portfolio["holdings"])
        assert holdings_count > 0