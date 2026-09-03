"""
Clinical AI Rate Limiter
========================
Sliding-window per-IP rate limiter for the AI Security Gateway.
Default: 60 AI requests per hour per IP address.
Returns 429 + retry-after header when limit is exceeded.
"""

import os
import threading
import time
import logging
from collections import defaultdict, deque
from typing import Tuple

logger = logging.getLogger("RateLimiter")

# Configurable via environment variable
RATE_LIMIT_PER_HOUR = int(os.getenv("AI_RATE_LIMIT_PER_HOUR", "60"))
WINDOW_SECONDS = 3600  # 1 hour sliding window


class SlidingWindowRateLimiter:
    """
    Thread-safe per-IP sliding window rate limiter.
    Tracks request timestamps per IP in a deque and evicts expired entries.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._buckets: dict = defaultdict(deque)
                cls._instance._bucket_lock = threading.Lock()
        return cls._instance

    def check(self, ip: str) -> Tuple[bool, int, int]:
        """
        Check if the given IP is within rate limits.

        Returns:
            (allowed: bool, requests_remaining: int, retry_after_seconds: int)
        """
        now = time.time()
        window_start = now - WINDOW_SECONDS

        with self._bucket_lock:
            bucket = self._buckets[ip]

            # Evict timestamps outside the sliding window
            while bucket and bucket[0] < window_start:
                bucket.popleft()

            current_count = len(bucket)

            if current_count >= RATE_LIMIT_PER_HOUR:
                # Calculate when the oldest request will expire
                oldest = bucket[0]
                retry_after = int(oldest + WINDOW_SECONDS - now) + 1
                remaining = 0
                logger.warning(f"[RATE LIMIT] IP={ip} count={current_count}/{RATE_LIMIT_PER_HOUR} retry_after={retry_after}s")
                return False, remaining, retry_after

            # Allow and record this request
            bucket.append(now)
            remaining = RATE_LIMIT_PER_HOUR - len(bucket)
            return True, remaining, 0

    def get_usage(self, ip: str) -> dict:
        """Get current usage stats for an IP."""
        now = time.time()
        window_start = now - WINDOW_SECONDS

        with self._bucket_lock:
            bucket = self._buckets[ip]
            while bucket and bucket[0] < window_start:
                bucket.popleft()
            count = len(bucket)

        return {
            "ip": ip,
            "requests_used": count,
            "requests_limit": RATE_LIMIT_PER_HOUR,
            "requests_remaining": max(0, RATE_LIMIT_PER_HOUR - count),
            "window_seconds": WINDOW_SECONDS
        }


# Global singleton
rate_limiter = SlidingWindowRateLimiter()
