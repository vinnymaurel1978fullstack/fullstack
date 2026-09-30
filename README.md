# LLM Insurance Integration

A production-grade LLM integration for extracting structured data from unstructured insurance claims.

## The Problem

Insurance claims arrive as free-text descriptions — messy, unstructured, and hard to process at scale. Manual data entry is slow, error-prone, and doesn't scale.

## The Solution

This service uses an LLM to extract structured data from claims while maintaining production-grade reliability:

- **Structured outputs** — Forces the LLM to return valid JSON matching a strict schema
- **Validation layer** — Rejects malformed responses before they reach the database
- **Provider abstraction** — Swap between OpenAI, Anthropic, or with one env variable change
- **Graceful fallback** — If the LLM fails, the system returns a safe error instead of crashing
- **Low temperature (0.2)** — Ensures deterministic, consistent outputs
- **Audit logging** — All inputs and outputs are logged for debugging and review

## Example

**Input:**
My car was hit in a parking lot on 12 March 2025. The rear bumper and
left tail light are damaged. I have photos and a police report. The other
driver left a note but I think they might not be insured.


**Output:**
json
{
  "claimType": "Auto",
  "incidentDate": "2025-03-12",
  "summary": "Vehicle damaged in parking lot; rear bumper and tail light affected. Police report and photos available.",
  "priority": "Medium",
  "riskScore": 65
}

**Tech Stack:**
TypeScript
OpenAI SDK (compatible with Anthropic, and other providers)
Node.js

**Design Principles**
Treat the LLM as untrusted — Always validate its output
Design for failure — LLMs will fail; the system should handle it gracefully
Keep it swappable — Provider abstraction means no vendor lock-in
Log everything — You can't debug what you can't see
Ship to production — This isn't a demo; it's running in a live application
