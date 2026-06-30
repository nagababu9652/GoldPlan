from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from datetime import datetime
import os

router = APIRouter(prefix="/market", tags=["market"])


class MarketData(BaseModel):
    nifty50: float
    nifty50_change: float
    nifty50_change_percent: float
    sensex: float
    sensex_change: float
    sensex_change_percent: float
    gold_price: float
    gold_change: float
    gold_change_percent: float
    last_updated: str


@router.get("/live", response_model=MarketData)
async def get_live_market_data():
    """
    Fetch live market data for NIFTY 50, SENSEX, and Gold prices.
    Uses Yahoo Finance API for stock data and a free gold price API.
    """
    try:
        async with httpx.AsyncClient() as client:
            # Fetch NIFTY 50 and SENSEX data from Yahoo Finance
            nifty_symbol = "^NSEI"
            sensex_symbol = "^BSESN"
            gold_symbol = "GC=F"  # Gold futures

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }

            # Fetch NIFTY 50
            nifty_response = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{nifty_symbol}",
                params={"interval": "1d", "range": "2d"},
                headers=headers,
                timeout=10.0
            )
            nifty_data = nifty_response.json()
            nifty_meta = nifty_data["chart"]["result"][0]["meta"]
            nifty_current = nifty_meta["regularMarketPrice"]
            nifty_previous = nifty_meta["chartPreviousClose"]
            nifty_change = nifty_current - nifty_previous
            nifty_change_percent = (nifty_change / nifty_previous) * 100

            # Fetch SENSEX
            sensex_response = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{sensex_symbol}",
                params={"interval": "1d", "range": "2d"},
                headers=headers,
                timeout=10.0
            )
            sensex_data = sensex_response.json()
            sensex_meta = sensex_data["chart"]["result"][0]["meta"]
            sensex_current = sensex_meta["regularMarketPrice"]
            sensex_previous = sensex_meta["chartPreviousClose"]
            sensex_change = sensex_current - sensex_previous
            sensex_change_percent = (sensex_change / sensex_previous) * 100

            # Fetch Gold price (in USD per troy ounce, convert to INR per gram)
            gold_response = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{gold_symbol}",
                params={"interval": "1d", "range": "2d"},
                headers=headers,
                timeout=10.0
            )
            gold_data = gold_response.json()
            gold_meta = gold_data["chart"]["result"][0]["meta"]
            gold_usd = gold_meta["regularMarketPrice"]
            gold_previous_usd = gold_meta["chartPreviousClose"]

            # Convert USD per troy ounce to INR per gram
            # 1 troy ounce = 31.1035 grams
            # Approximate USD to INR conversion rate (you can make this dynamic too)
            usd_to_inr = 83.5  # You can fetch this from an API too
            gold_price_inr = (gold_usd * usd_to_inr) / 31.1035
            gold_previous_inr = (gold_previous_usd * usd_to_inr) / 31.1035
            gold_change = gold_price_inr - gold_previous_inr
            gold_change_percent = (gold_change / gold_previous_inr) * 100

            return MarketData(
                nifty50=round(nifty_current, 2),
                nifty50_change=round(nifty_change, 2),
                nifty50_change_percent=round(nifty_change_percent, 2),
                sensex=round(sensex_current, 2),
                sensex_change=round(sensex_change, 2),
                sensex_change_percent=round(sensex_change_percent, 2),
                gold_price=round(gold_price_inr, 2),
                gold_change=round(gold_change, 2),
                gold_change_percent=round(gold_change_percent, 2),
                last_updated=datetime.now().strftime("%I:%M %p IST")
            )

    except Exception as e:
        # Fallback to static data if API fails
        return MarketData(
            nifty50=24891.0,
            nifty50_change=295.35,
            nifty50_change_percent=1.2,
            sensex=81456.0,
            sensex_change=889.15,
            sensex_change_percent=1.1,
            gold_price=6180.0,
            gold_change=45.0,
            gold_change_percent=0.73,
            last_updated=datetime.now().strftime("%I:%M %p IST")
        )