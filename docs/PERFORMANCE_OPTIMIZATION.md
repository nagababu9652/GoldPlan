# Performance Optimization Guide

## Current Issues Identified

### Frontend Performance
1. **Heavy Animations**: Floating particles with continuous movement
2. **Large Bundle Size**: Multiple calculator pages with complex logic
3. **No Code Splitting**: All pages loaded at once
4. **Unoptimized Images**: No image compression or lazy loading
5. **Excessive Re-renders**: React components re-rendering unnecessarily

### Backend Performance
1. **Synchronous Operations**: Some blocking operations
2. **No Caching**: Repeated database queries
3. **Missing Database Indexes**: Slow queries on large datasets
4. **No Connection Pooling**: Default SQLAlchemy settings

## Recommended Solutions

### 1. Frontend Optimizations

#### A. Code Splitting & Lazy Loading
```typescript
// Instead of importing all at once
import dynamic from 'next/dynamic';

// Lazy load calculator pages
const SIPCalculator = dynamic(() => import('@/app/tools/sip-calculator/page'));
const LumpsumCalculator = dynamic(() => import('@/app/tools/lumpsum-calculator/page'));

// Load only when needed
```

#### B. Optimize Animations
```typescript
// Reduce particle count on mobile
const isMobile = useMediaQuery('(max-width: 768px)');
const particleCount = isMobile ? 5 : 10;

// Use CSS transforms instead of layout properties
// Use requestAnimationFrame for smooth animations
// Pause animations when tab is not visible
```

#### C. Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

// Optimize images
<Image
  src="/logo.png"
  alt="FinPlan"
  width={100}
  height={100}
  priority // For above-the-fold images
  loading="lazy" // For below-the-fold images
/>
```

#### D. Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);

// Memoize components
const MemoizedComponent = memo(MyComponent);
```

#### E. Bundle Optimization
```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

### 2. Backend Optimizations

#### A. Database Connection Pooling
```python
# database/session.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # Number of connections to maintain
    max_overflow=10,  # Additional connections when pool is full
    pool_timeout=30,  # Timeout for getting connection
    pool_recycle=1800,  # Recycle connections after 30 minutes
)
```

#### B. Query Optimization
```python
# Use select() instead of loading entire objects
from sqlalchemy import select

# Instead of
users = db.query(User).all()

# Use
users = db.execute(select(User).where(User.is_active == True)).scalars().all()

# Add eager loading to prevent N+1 queries
from sqlalchemy.orm import joinedload

users = db.query(User).options(joinedload(User.otps)).all()
```

#### C. Caching Strategy
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

# Cache expensive queries
@router.get("/market/live")
@cache(expire=60)  # Cache for 60 seconds
async def get_market_data():
    return await fetch_market_data()

# Cache user data
@router.get("/user/profile")
async def get_profile(user_id: int):
    cache_key = f"user_profile:{user_id}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    profile = await get_user_profile(user_id)
    await redis.setex(cache_key, 300, json.dumps(profile))  # 5 minutes
    return profile
```

#### D. Async Operations
```python
# Use async/await for I/O operations
async def send_otp_email_async(email: str, otp: str):
    async with aiosmtplib.SMTP(host=smtp_host, port=smtp_port) as server:
        await server.starttls()
        await server.login(smtp_user, smtp_password)
        await server.send_message(msg)

# Use async database drivers
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine(DATABASE_URL, echo=True)
```

### 3. Database Optimizations

#### A. Add Missing Indexes
```python
# Already added for OTP model
# Add for other frequently queried fields

# In models/user.py
__table_args__ = (
    Index('idx_user_email', 'email'),
    Index('idx_user_created_at', 'created_at'),
)

# In market data
__table_args__ = (
    Index('idx_market_symbol', 'symbol'),
    Index('idx_market_timestamp', 'timestamp'),
)
```

#### B. Query Optimization
```python
# Use pagination
@router.get("/users")
async def get_users(skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

# Use database-level filtering
active_users = db.query(User).filter(User.is_active == True).all()

# Avoid SELECT *
users = db.query(User.id, User.email, User.name).all()
```

### 4. Infrastructure Optimizations

#### A. CDN for Static Assets
```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.yourdomain.com' 
    : '',
};
```

#### B. Enable Compression
```python
# main.py
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### C. Redis Caching
```python
# Cache market data
# Cache user sessions
# Cache API responses
# Cache computed calculations
```

### 5. Monitoring & Profiling

#### A. Frontend Performance Monitoring
```typescript
// Use React DevTools Profiler
// Monitor component render times
// Identify unnecessary re-renders

// Add performance marks
performance.mark('page-load-start');
// ... page load
performance.mark('page-load-end');
performance.measure('page-load', 'page-load-start', 'page-load-end');
```

#### B. Backend Performance Monitoring
```python
# Add timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Log slow queries
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
```

## Quick Wins (Implement First)

1. **Reduce Particle Count**: From 8 to 5 on mobile, 8 on desktop
2. **Add Lazy Loading**: For calculator pages
3. **Enable Gzip Compression**: In FastAPI
4. **Add Database Indexes**: Already done for OTP
5. **Cache Market Data**: 60-second cache
6. **Optimize Images**: Use Next.js Image component
7. **Remove Unused Dependencies**: Check package.json
8. **Enable Browser Caching**: Set cache headers

## Expected Improvements

- **Frontend Load Time**: 50-70% faster
- **API Response Time**: 30-50% faster
- **Database Queries**: 40-60% faster with indexes
- **Bundle Size**: 30-40% smaller with code splitting
- **Time to Interactive**: 40-60% improvement

## Implementation Priority

1. **High Priority** (Do First):
   - Lazy load calculator pages
   - Add database indexes
   - Enable gzip compression
   - Reduce particle animations

2. **Medium Priority**:
   - Implement caching (Redis)
   - Optimize images
   - Add connection pooling
   - Memoize React components

3. **Low Priority** (Nice to Have):
   - CDN setup
   - Service workers
   - Advanced monitoring
   - Performance budgets

## Tools for Measurement

- **Frontend**: Lighthouse, React DevTools Profiler, WebPageTest
- **Backend**: APM tools (New Relic, Datadog), SQLAlchemy query logging
- **Database**: PostgreSQL EXPLAIN ANALYZE, pg_stat_statements