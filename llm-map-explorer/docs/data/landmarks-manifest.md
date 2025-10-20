
# Landmarks Manifest

This document provides a summary of the `landmarks.json` data file.

## Landmark Count and Distribution

- **Total Landmarks:** 26
- **By Type:**
  - Papers: 7
  - Models: 16
  - Tools: 3
- **By Organization:**
  - OpenAI: 7
  - Google: 6
  - Meta: 2
  - Stanford: 2
  - Microsoft: 1
  - UW: 1
  - IST: 1
  - DeepMind: 1
  - Facebook: 1
  - Mistral AI: 1
  - Salesforce: 1
  - TII: 1
  - Hugging Face: 1
  - Various: 1
- **By Year:**
  - 2017: 1
  - 2018: 1
  - 2019: 4
  - 2020: 1
  - 2021: 5
  - 2022: 4
  - 2023: 10

## Capability Region Assignments

The landmarks are distributed across the following capability regions:

- **Attention & Architecture:** 5
- **Reasoning & Planning:** 6
- **Alignment & Safety:** 1
- **Multimodal Capabilities:** 2
- **Training & Optimization:** 1
- **RLHF Archipelago:** 2
- **Quantization Techniques:** 2
- **LoRA & PEFT Methods:** 3
- **Tool Use & Agents:** 1
- **Vision-Language:** 2

## Data Sources and External Links

All landmarks include external links to their respective papers, repositories, or official websites. These links serve as the primary source of information for each landmark.

## Coordinate Mapping Strategy

Landmark coordinates were manually assigned to fall within the polygon boundaries of their associated capability region. An effort was made to distribute the landmarks evenly within each region and to avoid placing them on the edges of the polygons.

## Validation

The `landmarks.json` file has been manually validated against the Zod schema defined in `src/lib/schemas.ts`. All required fields are present, and the data types are correct.
