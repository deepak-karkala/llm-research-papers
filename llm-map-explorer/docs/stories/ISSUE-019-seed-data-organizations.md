# Issue #19: Seed Data - Organizations

**Sprint:** Sprint 3 (Week 5-6)

**Story Points:** 2

**Priority:** P1

**Labels:** data, content

**Dependencies:** #5

**Reference:** [prd.md Section 6.10](../prd.md), [architecture.md Section 4.3](../architecture.md)

---

## Title

Create seed organizations.json with 10-15 organizations

---

## Description

Curate major LLM research organizations and labs, establishing relationships between organizations and their landmark contributions (papers/models). This enables organization-based filtering and highlighting.

---

## Acceptance Criteria

- [ ] `public/data/organizations.json` created with proper schema
- [ ] 10-15 organizations included (OpenAI, Google DeepMind, Meta AI, Anthropic, etc.)
- [ ] Each organization has required fields: id, name, description, website, landmarkIds, color, logo
- [ ] landmarkIds reference valid IDs from landmarks.json (#12)
- [ ] Highlight colors chosen from front-end spec palette
- [ ] Data validates against Zod schema (Issue #5)
- [ ] Logo URLs provided (optional, can use placeholder images)
- [ ] File properly formatted JSON (valid syntax, readable)

---

## Data Schema

### Organization Object Structure

```json
{
  "id": "org-001",
  "name": "OpenAI",
  "description": "Artificial Intelligence research lab focused on large language models and safe AI development.",
  "website": "https://openai.com",
  "landmarkIds": ["landmark-001", "landmark-002", "landmark-005"],
  "color": "#10A37F",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1200px-OpenAI_Logo.svg.png"
}
```

### Field Specifications

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Unique identifier: "org-XXX" |
| `name` | string | Yes | Organization name (50 chars max) |
| `description` | string | Yes | Brief description (200-300 chars) |
| `website` | string | Yes | Organization website URL |
| `landmarkIds` | string[] | Yes | Array of landmark IDs from landmarks.json |
| `color` | string | Yes | Hex color code for highlighting |
| `logo` | string | No | URL to organization logo image |

---

## Organizations to Include

Minimum 10-15 organizations representing major LLM contributors:

### Tier 1: Major AI Labs (Include all)

1. **OpenAI** - GPT series, InstructGPT, RLHF techniques
2. **Google DeepMind** - BERT, LaMDA, Gemini foundations
3. **Meta AI (FAIR)** - Llama, Open-source LLM development
4. **Anthropic** - Constitutional AI, Safety research
5. **Microsoft Research** - Transformer contributions, partnerships

### Tier 2: Research Institutions (Include 5-7)

6. **Stanford University** - Foundational NLP research
7. **UC Berkeley** - Deep learning and optimization research
8. **Carnegie Mellon University** - NLP and ML research
9. **MIT-IBM Watson AI Lab** - LLM benchmarking and research
10. **Allen Institute for AI** - AllenNLP, open science
11. **University of Toronto** - Deep learning pioneers
12. **National University of Singapore** - NLP research

### Tier 3: Industry Players (Include 3-5)

13. **IBM Research** - Foundational ML, quantum computing integration
14. **Hugging Face** - Model hub, transformers library
15. **Stability AI** - Diffusion models and open-source

---

## Color Palette Guidance

Use colors from front-end spec palette for organization highlighting:

```
OpenAI: #10A37F (teal)
Google DeepMind: #4285F4 (blue)
Meta AI: #0A66C2 (professional blue)
Anthropic: #C73E1D (burnt orange)
Microsoft: #00A4EF (microsoft blue)
Stanford: #8B0000 (cardinal red)
UC Berkeley: #003262 (berkeley blue)
CMU: #EB6E1F (cmu red)
MIT-IBM: #A31C1C (MIT red)
Allen Institute: #005C8B (deep blue)
University of Toronto: #002A5C (toronto blue)
NUS: #003366 (nus blue)
IBM: #0F62FE (ibm blue)
Hugging Face: #FFD21E (hugging face yellow)
Stability AI: #0099FF (stability blue)
```

---

## Landmark Mapping

Each organization should have 2-5 landmark IDs representing their key contributions:

### Example Mapping

```json
{
  "OpenAI": [
    "gpt2", "gpt3", "gpt4", "instructgpt", "alignment-papers"
  ],
  "Google DeepMind": [
    "bert", "lamda", "alphago", "attention-is-all-you-need"
  ],
  "Meta AI": [
    "llama", "roberta", "wav2vec"
  ]
}
```

---

## Logo URLs

Logo URLs are optional but recommended. Priority:
1. Official logos from wikimedia commons or open-source CDNs
2. Company website logo files
3. Placeholder images if not available

---

## Validation

- All organization IDs must be unique
- All referenced landmark IDs must exist in landmarks.json
- All website URLs must be valid HTTP/HTTPS URLs
- All hex color codes must be valid 6-digit hex
- File must pass Zod schema validation

---

## Testing Requirements

### Data Validation Tests

- File parses as valid JSON
- Data validates against organizationSchema (Zod)
- All landmark IDs reference valid landmarks
- All colors are valid hex codes
- All URLs are valid format

### Content Quality Tests

- Descriptions are clear and accurate
- Organization names match official names
- At least 10 organizations included
- Color palette is consistent and accessible

---

## Dependencies

- Depends on: Issue #5 (Zod validation schemas), #12 (Landmarks data)
- Required for: Issue #22 (Organization highlighting), #23 (Highlight button)

---

## Output File Location

```
public/data/organizations.json
```

---

## Notes

- Organizations provide context for landmark attribution and discovery
- Color scheme should be visually distinct to support highlighting functionality (#22)
- Landmark relationships enable filtering by organization contributor (#22, #23)
- Consider adding more organizations in future sprints as dataset grows
- Maintain accurate, up-to-date information about organizations
