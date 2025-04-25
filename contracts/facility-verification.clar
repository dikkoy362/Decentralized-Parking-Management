;; Facility Verification Contract
;; Validates legitimate parking providers

(define-data-var admin principal tx-sender)

;; Data map to store facility information
(define-map facilities
  { facility-id: uint }
  {
    owner: principal,
    name: (string-ascii 100),
    location: (string-ascii 100),
    verified: bool
  }
)

;; Counter for facility IDs
(define-data-var next-facility-id uint u1)

;; Check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Register a new facility
(define-public (register-facility (name (string-ascii 100)) (location (string-ascii 100)))
  (let
    (
      (facility-id (var-get next-facility-id))
    )
    (asserts! (is-eq tx-sender contract-caller) (err u403))
    (map-insert facilities
      { facility-id: facility-id }
      {
        owner: tx-sender,
        name: name,
        location: location,
        verified: false
      }
    )
    (var-set next-facility-id (+ facility-id u1))
    (ok facility-id)
  )
)

;; Verify a facility (admin only)
(define-public (verify-facility (facility-id uint))
  (begin
    (asserts! (is-admin) (err u401))
    (match (map-get? facilities { facility-id: facility-id })
      facility (begin
        (map-set facilities
          { facility-id: facility-id }
          (merge facility { verified: true })
        )
        (ok true)
      )
      (err u404)
    )
  )
)

;; Update facility details (owner only)
(define-public (update-facility (facility-id uint) (name (string-ascii 100)) (location (string-ascii 100)))
  (match (map-get? facilities { facility-id: facility-id })
    facility (begin
      (asserts! (is-eq (get owner facility) tx-sender) (err u403))
      (map-set facilities
        { facility-id: facility-id }
        (merge facility { name: name, location: location })
      )
      (ok true)
    )
    (err u404)
  )
)

;; Get facility details
(define-read-only (get-facility (facility-id uint))
  (map-get? facilities { facility-id: facility-id })
)

;; Check if facility is verified
(define-read-only (is-facility-verified (facility-id uint))
  (match (map-get? facilities { facility-id: facility-id })
    facility (get verified facility)
    false
  )
)
