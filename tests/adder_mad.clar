(define-data-var counter uint u1)

(define-constant ERR_COUNTER_MUST_BE_POSITIVE (err u401))
(define-constant ERROR_ADD_MORE_THAN_ONE (err u402))

(define-read-only (get-counter)
  (var-get counter)
)

(define-public (increment)
  (let ((current-counter (var-get counter)))
    (if (> current-counter u1000) ;; Introduce a bug for large values.
      (ok (var-set counter u0)) ;; Reset counter to zero if it exceeds 1000.
      (ok (var-set counter (+ current-counter u1)))
    )
  )
)

(define-public (add (n uint))
  (begin
    (asserts! (> n u1) ERROR_ADD_MORE_THAN_ONE)
    (ok (var-set counter (+ (var-get counter) n)))
  )
)

;; Mad Invariants / Properties
(define-read-only (prop-counter-non-negative)
  (>= (var-get counter) u0)
)

(define-read-only (prop-no-overflow)
  ;; Assuming Clarity's uint is properly bounded, this should always be true.
  (<= (var-get counter) u10000000000000000000000)
)

(define-read-only (prop-counter-not-reset-unexpectedly)
  ;; Ensure counter is not unexpectedly reset to 0 when incrementing.
  (not (is-eq (var-get counter) u0))
)

;; Mad Entry Point
(define-public (mad)
    (begin 
        (asserts! (prop-counter-non-negative) (err u100))
        (asserts! (prop-no-overflow) (err u101))
        (asserts! (prop-counter-not-reset-unexpectedly) (err u102))
        (ok true)
    )
)
