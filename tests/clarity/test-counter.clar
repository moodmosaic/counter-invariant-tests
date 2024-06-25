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

;; (define-public (test-get-counter (a uint))
;;     (begin
;;         (print "test-get-counter")
;;         (asserts! (is-eq u0 (get-counter)) (err u0))
;;         (ok u0)
;;     )
;; )

;; (define-public (test-increment (a uint))
;;     (begin
;;         (print "test-increment")
;;         (asserts! (is-eq (ok true) (increment)) (err u0))
;;         (asserts! (is-eq u1 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true)  (increment)) (err u0))
;;         (asserts! (is-eq u2 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (increment)) (err u0))
;;         (asserts! (is-eq u3 (get-counter)) (err u0))

;;         (ok u0)
;;     )
;; )

;; (define-public (test-decrement (a uint))
;;     (begin
;;         (print "test-decrement")
;;         (asserts! (is-eq (ok true) (decrement)) (err u0))
;;         (asserts! (is-eq u2 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (decrement)) (err u0))
;;         (asserts! (is-eq u1 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (decrement)) (err u0))
;;         (asserts! (is-eq u0 (get-counter)) (err u0))

;;         (ok u0)
;;     )
;; )

;; (define-public (test-decrement-err (a uint))
;;     (begin
;;         (print "test-decrement-err")
;;         (asserts! (is-eq (err u401) ( decrement)) (err u0))
;;         (ok u0)
;;     )
;; )

;; (define-public (test-add (a uint))
;;     (begin
;;         (print "test-add")
;;         (asserts! (is-eq (ok true)  (add u10)) (err u0))
;;         (asserts! (is-eq u10 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (add u5)) (err u0))
;;         (asserts! (is-eq u15 (get-counter)) (err u0))

;;         (asserts! (is-eq (ok true) (add u12)) (err u0))
;;         (asserts! (is-eq u27 (get-counter)) (err u0))

;;         (ok u0) 
;;     ) 
;; )

;; (define-public (test-add-err (a uint))
;;     (begin
;;         (print "test-add-err")
;;         (asserts! (is-eq (err u402) (add u1)) (err u0))
;;         (asserts! (is-eq (err u402) (add u0)) (err u0))
;;         (ok u0)
;;     )
;; )