import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity contract environment
let mockTxSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockContractCaller = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockAdmin = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"

// Mock contract state
let facilities = {}
let nextFacilityId = 1

// Mock contract functions
const registerFacility = (name, location) => {
	if (mockTxSender !== mockContractCaller) {
		return { type: "err", value: 403 }
	}
	
	const facilityId = nextFacilityId
	facilities[facilityId] = {
		owner: mockTxSender,
		name,
		location,
		verified: false,
	}
	
	nextFacilityId++
	return { type: "ok", value: facilityId }
}

const verifyFacility = (facilityId) => {
	if (mockTxSender !== mockAdmin) {
		return { type: "err", value: 401 }
	}
	
	if (!facilities[facilityId]) {
		return { type: "err", value: 404 }
	}
	
	facilities[facilityId].verified = true
	return { type: "ok", value: true }
}

const updateFacility = (facilityId, name, location) => {
	if (!facilities[facilityId]) {
		return { type: "err", value: 404 }
	}
	
	if (facilities[facilityId].owner !== mockTxSender) {
		return { type: "err", value: 403 }
	}
	
	facilities[facilityId].name = name
	facilities[facilityId].location = location
	return { type: "ok", value: true }
}

const getFacility = (facilityId) => {
	return facilities[facilityId] || null
}

const isFacilityVerified = (facilityId) => {
	return facilities[facilityId] ? facilities[facilityId].verified : false
}

describe("Facility Verification Contract", () => {
	beforeEach(() => {
		// Reset state before each test
		facilities = {}
		nextFacilityId = 1
	})
	
	it("should register a new facility", () => {
		const result = registerFacility("Test Facility", "Test Location")
		expect(result.type).toBe("ok")
		expect(result.value).toBe(1)
		expect(facilities[1]).toEqual({
			owner: mockTxSender,
			name: "Test Facility",
			location: "Test Location",
			verified: false,
		})
	})
	
	it("should verify a facility", () => {
		registerFacility("Test Facility", "Test Location")
		const result = verifyFacility(1)
		expect(result.type).toBe("ok")
		expect(result.value).toBe(true)
		expect(facilities[1].verified).toBe(true)
	})
	
	it("should update facility details", () => {
		registerFacility("Test Facility", "Test Location")
		const result = updateFacility(1, "Updated Facility", "Updated Location")
		expect(result.type).toBe("ok")
		expect(result.value).toBe(true)
		expect(facilities[1].name).toBe("Updated Facility")
		expect(facilities[1].location).toBe("Updated Location")
	})
	
	it("should get facility details", () => {
		registerFacility("Test Facility", "Test Location")
		const facility = getFacility(1)
		expect(facility).toEqual({
			owner: mockTxSender,
			name: "Test Facility",
			location: "Test Location",
			verified: false,
		})
	})
	
	it("should check if facility is verified", () => {
		registerFacility("Test Facility", "Test Location")
		expect(isFacilityVerified(1)).toBe(false)
		verifyFacility(1)
		expect(isFacilityVerified(1)).toBe(true)
	})
	
	it("should fail to verify non-existent facility", () => {
		const result = verifyFacility(999)
		expect(result.type).toBe("err")
		expect(result.value).toBe(404)
	})
	
	it("should fail to update non-existent facility", () => {
		const result = updateFacility(999, "Updated Facility", "Updated Location")
		expect(result.type).toBe("err")
		expect(result.value).toBe(404)
	})
	
	it("should fail to update facility if not owner", () => {
		registerFacility("Test Facility", "Test Location")
		// Change the mock sender
		const originalSender = mockTxSender
		mockTxSender = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
		
		const result = updateFacility(1, "Updated Facility", "Updated Location")
		expect(result.type).toBe("err")
		expect(result.value).toBe(403)
		
		// Restore the mock sender
		mockTxSender = originalSender
	})
})
