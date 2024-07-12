;; Mad Invariants / Properties
(define-read-only (mad-counter-non-negative)
  (>= (var-get counter) u0)
)

(define-read-only (mad-no-overflow)
  ;; Assuming Clarity's uint is properly bounded, this should always be true.
  (<= (var-get counter) u10000000000000000000000)
)

(define-read-only (mad-counter-not-reset-unexpectedly)
  ;; Ensure counter is not unexpectedly reset to 0 when incrementing.
  (not (is-eq (var-get counter) u0))
)