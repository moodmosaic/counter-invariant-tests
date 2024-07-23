The bigger picture can be:

;; Invariant properties (starting with `rv-` or `prop-`) are executed against a
;; random state of the SUT and they're either parameterless or take parameters.
;; - If they take parameters we randomly generate a value for each one of those
;;   parameters.
;; - If they are parameterless, we execute as-is.

(define-read-only (rv-foo-invariant-check (n uint))
  (>= (var-get counter) n)
)

;; NOTE: This is what currently works, and can be demoed.
(define-read-only (rv-bar-invariant-check)
  (>= (var-get counter) u0)
)

;; Unit tests, and property-based tests, are always executed against a fresh,
;; newly deployed contract. (Similar to what clarunit does when it's not a flow
;; test.)
;; - If they are parameterless, we execute once, and as-is.
;; - If they take parameters we randomly generate a value for each one of those
;;   parameters and execute `numRuns` (default 100).

(define-read-only (test-foo (n uint))
  ;; assert/bool on `foo(n)`.
  ;; It runs multiple times.
)

(define-read-only (test-foo-bar)
  ;; assert/bool on `foo(123)`.
  ;; It runs once.
)