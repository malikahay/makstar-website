// Package ratelimit caps how often one client may hit an endpoint (login, order, contact form).
package ratelimit

import (
	"sync"
	"time"
)

// Limiter allows up to n events per key within each window. State is in memory, which is
// enough for a single API instance; a restart simply resets the counters.
type Limiter struct {
	n      int
	window time.Duration

	mu   sync.Mutex
	hits map[string]*bucket
}

type bucket struct {
	count int
	reset time.Time
}

func New(n int, window time.Duration) *Limiter {
	return &Limiter{n: n, window: window, hits: map[string]*bucket{}}
}

// Allow records an event for key and reports whether it is within the limit.
// When it is not, retry says how long until the key may try again.
func (l *Limiter) Allow(key string) (ok bool, retry time.Duration) {
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()
	if len(l.hits) > 10000 {
		for k, b := range l.hits {
			if now.After(b.reset) {
				delete(l.hits, k)
			}
		}
	}
	b := l.hits[key]
	if b == nil || now.After(b.reset) {
		b = &bucket{reset: now.Add(l.window)}
		l.hits[key] = b
	}
	if b.count >= l.n {
		return false, b.reset.Sub(now)
	}
	b.count++
	return true, 0
}
