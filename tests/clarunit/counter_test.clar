(define-data-var counter uint u0)

(define-constant ERR_COUNTER_MUST_BE_POSITIVE (err u401))
(define-constant ERROR_ADD_MORE_THAN_ONE (err u402))

(define-read-only (get-counter)
  (var-get counter)
)

(define-public (increment)
  (ok (var-set counter (+ (var-get counter) u1)))
)

(define-public (decrement)
  (let ((current-counter (var-get counter)))
    (asserts! (> current-counter u0) ERR_COUNTER_MUST_BE_POSITIVE)
    (ok (var-set counter (- current-counter u1)))
  )
)

(define-public (add (n uint))
  (begin
    (asserts! (> n u1) ERROR_ADD_MORE_THAN_ONE)
    (ok (var-set counter (+ (var-get counter) n)))
  )
)

;; (define-public (list-tests)
;;     (begin
;;         (print "test: test-get-counter")
;;         (print "test: test-increment")
;;         (print "test: test-decrement")
;;         (print "test: test-decrement-err")
;;         (print "test: test-add")
;;         (print "test: test-add-err")
;;         (ok true)
;;     ) 
;; )

(define-public (test-increment)
    (begin
        (print "test-increment")
        (asserts! (is-eq (ok true) (increment)) (err u0))
        (asserts! (is-eq u1 (get-counter)) (err u0))
        (ok true)
    )
)

(define-public (test-decrement)
    (begin
        (print "test-decrement")
        (asserts! (is-eq u1 (get-counter)) (err u0))
        (asserts! (is-eq (ok true) (decrement)) (err u0))
        (asserts! (is-eq u0 (get-counter)) (err u0))
        (ok true)
    )
)

;; (define-public (test-get-counter)
;;     (begin
;;         (print "test-get-counter")
;;         (asserts! (is-eq u0 (get-counter)) (err u0))
;;         (ok true)
;;     )
;; )

;; (define-public (test-increment)
;;     (begin
;;         (print "test-increment")
;;         (asserts! (is-eq (ok true) (increment)) (err u0))
;;         (asserts! (is-eq u1 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true)  (increment)) (err u0))
;;         (asserts! (is-eq u2 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (increment)) (err u0))
;;         (asserts! (is-eq u3 (get-counter)) (err u0))

;;         (ok true)
;;     )
;; )

;; (define-public (test-decrement)
;;     (begin
;;         (print "test-decrement")
;;         (asserts! (is-eq (err u401) (decrement)) (err u0))
;;         (asserts! (is-eq u2 (get-counter)) (err u1))

;;         (asserts! (is-eq (ok true) (decrement)) (err u2))
;;         (asserts! (is-eq u1 (get-counter)) (err u3))

;;         (asserts! (is-eq (ok true) (decrement)) (err u4))
;;         (asserts! (is-eq u0 (get-counter)) (err u5))

;;         (ok true)
;;     )
;; )

;; (define-public (test-decrement-err)
;;     (begin
;;         (print "test-decrement-err")
;;         (asserts! (is-eq (err u401) ( decrement)) (err u0))
;;         (ok true)
;;     )
;; )

;; (define-public (test-add)
;;     (begin
;;         (print "test-add")
;;         (asserts! (is-eq (ok true)  (add u10)) (err u0))
;;         (asserts! (is-eq u10 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (add u5)) (err u0))
;;         (asserts! (is-eq u15 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (add u12)) (err u0))
;;         (asserts! (is-eq u27 (get-counter)) (err u0))

;;         (ok true) 
;;     ) 
;; )

;; (define-public (test-add-err)
;;     (begin
;;         (print "test-add-err")
;;         (asserts! (is-eq (err u402) (add u1)) (err u0))
;;         (asserts! (is-eq (err u402) (add u0)) (err u0))
;;         (ok true)
;;     )
;; )

