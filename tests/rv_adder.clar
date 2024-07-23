;; RV Invariants / Properties
(define-read-only (rv-counter-non-negative)
  (>= (var-get counter) u0)
)

(define-read-only (rv-no-overflow)
  ;; Assuming Clarity's uint is properly bounded, this should always be true.
  (<= (var-get counter) u10000000000000000000000)
)

(define-read-only (rv-counter-not-reset-unexpectedly)
  ;; Ensure counter is not unexpectedly reset to 0 when incrementing.
  (not (is-eq (var-get counter) u0))
)