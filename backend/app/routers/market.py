from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
import asyncio
from datetime import datetime, timedelta
import os
import math
import random

router = APIRouter(prefix="/market", tags=["market"])

# Simple in-memory cache
_market_cache = {"data": None, "timestamp": None, "ttl": 60}


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


class HistoryPoint(BaseModel):
    date: str
    value: float
    volume: Optional[float] = None


class Prediction(BaseModel):
    direction: str
    target: float
    confidence: str


class HistoryResponse(BaseModel):
    symbol: str
    range: str
    data: List[HistoryPoint]
    prediction: Optional[Prediction] = None


YAHOO_SYMBOLS = {
    "NIFTY": "^NSEI",
    "SENSEX": "^BSESN",
    "GOLD": "GC=F",
}

YAHOO_NAMES = {
    "^NSEI": "NIFTY 50",
    "^BSESN": "SENSEX",
    "GC=F": "Gold Futures",
}


def _is_cache_valid():
    """Check if cached data is still valid."""
    if _market_cache["data"] is None or _market_cache["timestamp"] is None:
        return False
    elapsed = (datetime.now() - _market_cache["timestamp"]).total_seconds()
    return elapsed < _market_cache["ttl"]


async def _fetch_single_market_data(client: httpx.AsyncClient, symbol: str, yahoo_symbol: str, headers: dict):
    """Fetch market data for a single symbol."""
    response = await client.get(
        f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}",
        params={"interval": "1d", "range": "2d"},
        headers=headers,
        timeout=10.0
    )
    data = response.json()
    meta = data["chart"]["result"][0]["meta"]
    current = meta["regularMarketPrice"]
    previous = meta["chartPreviousClose"]
    change = current - previous
    change_percent = (change / previous) * 100
    
    return {
        "symbol": symbol,
        "current": current,
        "change": change,
        "change_percent": change_percent,
    }


@router.get("/live", response_model=MarketData)
async def get_live_market_data():
    """
    Fetch live market data for NIFTY 50, SENSEX, and Gold prices.
    Uses Yahoo Finance API for stock data.
    Data is cached for 60 seconds to reduce API calls.
    """
    # Return cached data if valid
    if _is_cache_valid():
        return _market_cache["data"]
    
    try:
        async with httpx.AsyncClient() as client:
            nifty_symbol = "^NSEI"
            sensex_symbol = "^BSESN"
            gold_symbol = "GC=F"

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }

            # Parallelize all three API calls using asyncio.gather
            nifty_task = _fetch_single_market_data(client, "NIFTY", nifty_symbol, headers)
            sensex_task = _fetch_single_market_data(client, "SENSEX", sensex_symbol, headers)
            gold_task = _fetch_single_market_data(client, "GOLD", gold_symbol, headers)

            nifty_data, sensex_data, gold_data = await asyncio.gather(
                nifty_task, sensex_task, gold_task
            )

            # Convert gold price from USD/oz to INR/gram
            usd_to_inr = 83.5
            gold_price_inr = (gold_data["current"] * usd_to_inr) / 31.1035
            gold_change_inr = (gold_data["change"] * usd_to_inr) / 31.1035
            gold_change_percent = (gold_change_inr / ((gold_data["current"] - gold_data["change"]) * usd_to_inr / 31.1035)) * 100 if gold_data["change"] != 0 else 0

            market_data = MarketData(
                nifty50=round(nifty_data["current"], 2),
                nifty50_change=round(nifty_data["change"], 2),
                nifty50_change_percent=round(nifty_data["change_percent"], 2),
                sensex=round(sensex_data["current"], 2),
                sensex_change=round(sensex_data["change"], 2),
                sensex_change_percent=round(sensex_data["change_percent"], 2),
                gold_price=round(gold_price_inr, 2),
                gold_change=round(gold_change_inr, 2),
                gold_change_percent=round(gold_change_percent, 2),
                last_updated=datetime.now().strftime("%I:%M %p IST")
            )

            # Cache the result
            _market_cache["data"] = market_data
            _market_cache["timestamp"] = datetime.now()

            return market_data

    except Exception as e:
        # Fallback to static data if API fails
        fallback_data = MarketData(
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
        
        # Cache fallback data as well
        _market_cache["data"] = fallback_data
        _market_cache["timestamp"] = datetime.now()
        
        return fallback_data


def _compute_prediction(values: List[float]) -> Prediction:
    """Simple trend prediction based on linear regression."""
    n = len(values)
    if n < 5:
        return Prediction(direction="neutral", target=values[-1] if values else 0, confidence="Insufficient data")
    
    # Simple linear regression
    x_avg = (n - 1) / 2
    y_avg = sum(values) / n
    
    num = sum((i - x_avg) * (v - y_avg) for i, v in enumerate(values))
    den = sum((i - x_avg) ** 2 for i in range(n))
    
    slope = num / den if den != 0 else 0
    intercept = y_avg - slope * x_avg
    
    # Predict next 5 periods
    target = slope * (n + 5) + intercept
    
    # Calculate R-squared for confidence
    ss_res = sum((v - (slope * i + intercept)) ** 2 for i, v in enumerate(values))
    ss_tot = sum((v - y_avg) ** 2 for v in values)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
    
    direction = "up" if slope > 0 else "down"
    confidence_pct = min(abs(r_squared) * 100, 95)
    confidence = f"{'High' if confidence_pct > 70 else 'Medium' if confidence_pct > 40 else 'Low'} confidence ({confidence_pct:.0f}%)"
    
    return Prediction(
        direction=direction,
        target=round(target, 2),
        confidence=confidence
    )


@router.get("/history", response_model=HistoryResponse)
async def get_market_history(
    symbol: str = Query(..., description="Symbol: NIFTY, SENSEX, or GOLD"),
    range: str = Query("1M", description="Range: 1D, 1W, 1M, 3M, 1Y, 5Y"),
):
    """Fetch historical market data from Yahoo Finance."""
    yahoo_symbol = YAHOO_SYMBOLS.get(symbol.upper())
    if not yahoo_symbol:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Use: {', '.join(YAHOO_SYMBOLS.keys())}")
    
    # Map range to Yahoo Finance range parameter
    range_map = {
        "1D": "1d",
        "1W": "5d",
        "1M": "1mo",
        "3M": "3mo",
        "1Y": "1y",
        "5Y": "5y",
    }
    yahoo_range = range_map.get(range.upper(), "1mo")
    
    # Map range to interval
    interval_map = {
        "1D": "5m",
        "1W": "30m",
        "1M": "1d",
        "3M": "1d",
        "1Y": "1d",
        "5Y": "1wk",
    }
    interval = interval_map.get(range.upper(), "1d")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}",
                params={"interval": interval, "range": yahoo_range},
                headers=headers,
                timeout=15.0
            )
            data = response.json()
            
            result = data["chart"]["result"][0]
            timestamps = result["timestamp"]
            quotes = result["indicators"]["quote"][0]
            closes = quotes.get("close", [])
            volumes = quotes.get("volume", [])
            
            history_points = []
            values_for_prediction = []
            
            for i, ts in enumerate(timestamps):
                close_val = closes[i] if i < len(closes) and closes[i] is not None else None
                if close_val is None:
                    continue
                
                dt = datetime.fromtimestamp(ts)
                date_str = dt.strftime("%d %b")
                
                # For gold, convert USD to INR per gram
                if symbol.upper() == "GOLD":
                    usd_to_inr = 83.5
                    close_val = (close_val * usd_to_inr) / 31.1035
                
                vol = volumes[i] if i < len(volumes) and volumes[i] is not None else None
                
                history_points.append(HistoryPoint(
                    date=date_str,
                    value=round(close_val, 2),
                    volume=round(vol, 2) if vol else None
                ))
                values_for_prediction.append(close_val)
            
            # Compute prediction
            prediction = _compute_prediction(values_for_prediction)
            
            return HistoryResponse(
                symbol=symbol.upper(),
                range=range.upper(),
                data=history_points,
                prediction=prediction
            )
    
    except Exception as e:
        # Return sample data if Yahoo API fails
        points = {"1D": 24, "1W": 7, "1M": 30, "3M": 90, "1Y": 365, "5Y": 1825}
        num_points = points.get(range.upper(), 30)
        
        base_value = {"NIFTY": 24175, "SENSEX": 77502, "GOLD": 11100}
        base = base_value.get(symbol.upper(), 10000)
        volatility = 0.005 if symbol.upper() == "GOLD" else 0.01
        
        sample_data = []
        values = []
        val = base * 0.95  # Start slightly lower
        now = datetime.now()
        
        for i in range(num_points):
            d = now - timedelta(days=num_points - i)
            val = val * (1 + (random.random() - 0.48) * volatility)
            sample_data.append(HistoryPoint(
                date=d.strftime("%d %b"),
                value=round(val, 2),
                volume=None
            ))
            values.append(val)
        
        prediction = _compute_prediction(values)
        
        return HistoryResponse(
            symbol=symbol.upper(),
            range=range.upper(),
            data=sample_data,
            prediction=prediction
        )