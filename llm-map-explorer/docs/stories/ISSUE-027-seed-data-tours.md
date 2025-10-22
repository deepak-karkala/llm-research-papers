# Issue #27: Seed Data - Tours with 3-5 Guided Tours

**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 4
**Priority:** P1
**Assignee:** Content Curator
**Status:** 🔄 Ready for Implementation

---

## 📖 User Story

**As a** content curator
**I want** to create seed data for 3-5 guided tours with multi-stage narratives
**So that** users can discover and follow curated learning paths through the LLM research landscape

---

## 🎯 Goal

Curate and structure 3-5 guided tours representing different LLM training pipelines and learning paths, each with multiple stages that guide users through landmark discoveries with narration and educational context.

---

## 📋 Acceptance Criteria

### ✅ Tours Data Structure
- [ ] `public/data/tours.json` created with valid JSON structure
- [ ] Tours schema matches Zod schema defined in architecture.md Section 4.4
- [ ] File validates against `tourSchema` without errors

### ✅ Tours Content (3-5 tours required)
- [ ] **Tour 1: "GPT Evolution"** (3-4 stages)
  - Trace the evolution from GPT to GPT-3 to modern variants
  - Covers: GPT, GPT-2, GPT-3, InstructGPT, GPT-3.5, GPT-4
  - Difficulty: Beginner
  - Estimated Duration: 8-10 minutes

- [ ] **Tour 2: "RLHF Pipeline"** (4-5 stages)
  - Explore reinforcement learning from human feedback
  - Covers: Supervised fine-tuning, RLHF training, reward models, policy optimization
  - Difficulty: Intermediate
  - Estimated Duration: 12-15 minutes

- [ ] **Tour 3: "PEFT Fine-tuning"** (3-4 stages)
  - Parameter-efficient fine-tuning techniques
  - Covers: LoRA, QLoRA, prompt tuning, adapter modules
  - Difficulty: Intermediate
  - Estimated Duration: 10-12 minutes

- [ ] **Tour 4: "Multimodal Vision-Language Models"** (3-4 stages)
  - Journey through multimodal model development
  - Covers: CLIP, DALL-E, LLaVA, GPT-4V, Flamingo
  - Difficulty: Intermediate
  - Estimated Duration: 10-12 minutes

- [ ] **Tour 5: "Quantization & Efficiency"** (3-4 stages) *(optional)*
  - Explore techniques for model compression
  - Covers: INT8 quantization, GPTQ, bfloat16, knowledge distillation
  - Difficulty: Advanced
  - Estimated Duration: 12-15 minutes

### ✅ Tour Schema Compliance
Each tour has:
- [ ] `id`: Unique identifier (kebab-case, e.g., "gpt-evolution")
- [ ] `title`: Human-readable tour name
- [ ] `description`: 2-3 sentence overview
- [ ] `difficulty`: "beginner" | "intermediate" | "advanced"
- [ ] `estimatedDuration`: Minutes as integer
- [ ] `stages`: Array of stage objects

### ✅ Stage Structure (per tour)
Each stage has:
- [ ] `index`: 0-based stage number
- [ ] `title`: Stage title (e.g., "Transformer Foundation")
- [ ] `description`: 2-3 sentence description of stage focus
- [ ] `narration`: 100-200 word explanatory text for user
- [ ] `landmarkIds`: Array of landmark IDs featured in stage (min 2, max 5)
- [ ] `mapCenter`: [lat, lng] coordinates for map focus
- [ ] `mapZoom`: Zoom level (integer, 0-18)
- [ ] `highlights`: Optional array of landmark IDs to highlight

### ✅ Landmark References
- [ ] All `landmarkIds` reference valid landmarks from `public/data/landmarks.json`
- [ ] Stage landmarks are related and coherent (not random)
- [ ] Map coordinates position users to relevant regions on map
- [ ] Zoom levels are appropriate for viewing stage landmarks

### ✅ Content Quality
- [ ] Narration text is educational and engaging
- [ ] Narration assumes general technical knowledge (beginner-friendly)
- [ ] Tour progression is logical and pedagogical
- [ ] No spelling or grammar errors
- [ ] Tone is consistent across all tours

### ✅ Verification
- [ ] `npm run validate-data` passes (validates against Zod schema)
- [ ] File is properly formatted JSON (no trailing commas, valid UTF-8)
- [ ] All tours render correctly in TourPanel component
- [ ] Landmarks in each stage exist and are accessible

---

## 🛠️ Technical Implementation

### Step 1: Review Landmarks Database

```bash
# Check available landmarks for tour creation
cat public/data/landmarks.json | jq '.[] | {id, name, type, year, capabilityId}' | head -30
```

Note the available landmarks and their IDs for reference in tours.

---

### Step 2: Create Tours Data File

Create `public/data/tours.json`:

```json
{
  "tours": [
    {
      "id": "gpt-evolution",
      "title": "GPT Evolution: From Transformers to GPT-4",
      "description": "Trace the evolutionary journey from the original Transformer architecture through GPT-3 to modern iterations. Discover how language models grew larger and more capable with each generation.",
      "difficulty": "beginner",
      "estimatedDuration": 9,
      "stages": [
        {
          "index": 0,
          "title": "The Transformer Foundation",
          "description": "Explore the foundational 'Attention Is All You Need' paper that started it all. Understand how the Transformer architecture revolutionized natural language processing.",
          "narration": "The Transformer architecture, introduced in 2017, fundamentally changed how we approach language modeling. Instead of relying on recurrent neural networks that process text sequentially, Transformers use self-attention mechanisms that allow models to consider all words in a sequence simultaneously. This parallelizable approach became the foundation for all modern large language models. The 'Attention Is All You Need' paper demonstrated that attention mechanisms alone, without recurrence, could achieve state-of-the-art results on translation tasks.",
          "landmarkIds": ["transformer-2017", "attention-paper"],
          "mapCenter": [25, 50],
          "mapZoom": 2,
          "highlights": []
        },
        {
          "index": 1,
          "title": "GPT & GPT-2: Early Language Models",
          "description": "Discover OpenAI's early generative language models that first demonstrated the power of scaling. See how GPT-2 shocked the world with its ability to generate coherent text.",
          "narration": "OpenAI's first GPT model applied the Transformer decoder architecture to generative language modeling at scale. But it was GPT-2 that truly captured public imagination, as it demonstrated impressive zero-shot task performance without explicit task-specific training. GPT-2's ability to generate coherent multi-paragraph text samples raised important questions about AI safety and capabilities. The model's surprising competence sparked widespread discussion about the implications of large-scale language models.",
          "landmarkIds": ["gpt-paper", "gpt2-paper"],
          "mapCenter": [25, 55],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 2,
          "title": "GPT-3: The Scaling Law Discovery",
          "description": "Witness the breakthrough moment when scaling laws showed that larger models exhibit emergent capabilities. GPT-3 demonstrated few-shot learning at unprecedented scale.",
          "narration": "GPT-3 represented a 100-fold scale increase from GPT-2, with 175 billion parameters. This scale jump revealed crucial insights about language model behavior: larger models develop emergent abilities to perform tasks with just a few examples (few-shot learning) rather than requiring extensive fine-tuning. GPT-3 showed unexpected proficiency at coding, mathematics, and reasoning tasks, demonstrating that scale alone could unlock capabilities not explicitly trained for. This discovery fundamentally changed how researchers thought about building intelligent systems.",
          "landmarkIds": ["gpt3-paper", "brown-gpt3"],
          "mapCenter": [25, 58],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 3,
          "title": "InstructGPT & GPT-3.5: Human Alignment",
          "description": "Explore how reinforcement learning from human feedback improved safety and usability. See how instruction following became a key capability.",
          "narration": "While GPT-3 was powerful, it sometimes produced harmful, biased, or unhelpful content. InstructGPT introduced a new training paradigm: fine-tune large language models using human feedback on model outputs. This approach, called RLHF (Reinforcement Learning from Human Feedback), made models more aligned with human values and intentions. GPT-3.5 applied these techniques at scale, significantly improving safety, instruction-following, and user satisfaction. This marked a shift from pure capability scaling toward making models more usable and trustworthy.",
          "landmarkIds": ["instructgpt-paper", "ouyang-instructgpt"],
          "mapCenter": [25, 60],
          "mapZoom": 3,
          "highlights": []
        }
      ]
    },
    {
      "id": "rlhf-pipeline",
      "title": "RLHF Pipeline: Training with Human Feedback",
      "description": "Deep dive into reinforcement learning from human feedback. Learn how human preferences guide model behavior, making AI systems more aligned and helpful.",
      "difficulty": "intermediate",
      "estimatedDuration": 13,
      "stages": [
        {
          "index": 0,
          "title": "Supervised Fine-Tuning Foundation",
          "description": "Begin with the supervised fine-tuning phase where human experts provide high-quality examples. This creates the base model for RLHF.",
          "narration": "The RLHF process starts with supervised fine-tuning (SFT). Expert annotators create demonstration datasets showing how the model should respond to various prompts. A large base model (like GPT-3) is then fine-tuned on these demonstrations to become more helpful and less harmful. This SFT phase creates an intermediate model that understands the general instruction-following task. The quality of SFT examples significantly impacts the final model quality, as human annotators essentially teach the model what good behavior looks like.",
          "landmarkIds": ["supervised-finetuning", "dataset-creation"],
          "mapCenter": [25, 52],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 1,
          "title": "Reward Model Training",
          "description": "Understand how reward models learn to predict human preferences. These models become the signal that guides further training.",
          "narration": "Next, human annotators score or rank model outputs, providing preference data. For example, they might rank four different model responses to the same prompt from best to worst. This preference data trains a 'reward model'—a neural network that learns to predict how good a given text is according to human preferences. The reward model distills human judgment into a scalar score, enabling automated evaluation of model outputs. Training a good reward model is critical because all subsequent training relies on its signals.",
          "landmarkIds": ["reward-model", "preference-learning"],
          "mapCenter": [25, 54],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 2,
          "title": "Policy Optimization with PPO",
          "description": "Apply reinforcement learning to optimize model behavior. Proximal Policy Optimization balances performance with stability.",
          "narration": "With a trained reward model in hand, we can use reinforcement learning to improve the model's performance on the reward. Proximal Policy Optimization (PPO) is the algorithm typically used here. PPO adjusts the base model's parameters to maximize expected reward while staying close to the original model (to avoid catastrophic performance degradation). The policy optimization phase is where the model learns human preferences—it generates outputs, receives scores from the reward model, and adjusts its weights to produce higher-scoring outputs.",
          "landmarkIds": ["ppo-algorithm", "schulman-ppo"],
          "mapCenter": [25, 56],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 3,
          "title": "Iteration & Red-Teaming",
          "description": "The RLHF process often repeats with new human feedback data and adversarial testing. Continuous improvement through iteration.",
          "narration": "RLHF is not a one-shot process. As the model improves, it may discover new failure modes or develop unexpected behaviors. Red-teaming—adversarially probing the model for failures—generates new examples for SFT and reward model training. Teams iterate on this cycle: deploy the model, collect failure cases, retrain components, and improve. This iterative refinement is how modern systems like ChatGPT and Claude achieve high standards of safety and helpfulness.",
          "landmarkIds": ["instructgpt-paper", "red-teaming"],
          "mapCenter": [25, 58],
          "mapZoom": 3,
          "highlights": []
        }
      ]
    },
    {
      "id": "peft-finetuning",
      "title": "PEFT Fine-tuning: Efficient Model Adaptation",
      "description": "Explore parameter-efficient fine-tuning techniques that reduce computational cost. Learn how to adapt large models without retraining everything.",
      "difficulty": "intermediate",
      "estimatedDuration": 11,
      "stages": [
        {
          "index": 0,
          "title": "The Fine-tuning Challenge",
          "description": "Understand why fine-tuning all parameters of a large model is expensive and slow.",
          "narration": "Large language models with billions or trillions of parameters are expensive to fine-tune. Traditional fine-tuning requires computing and storing gradients for every parameter, which demands massive GPU memory and compute resources. For a 70B parameter model, full fine-tuning might require 8+ high-end GPUs. This cost barrier prevents many organizations and researchers from customizing models to their specific domains or tasks. Parameter-efficient fine-tuning (PEFT) techniques aim to achieve strong adaptation results while training far fewer parameters.",
          "landmarkIds": ["finetuning-basics", "parameter-efficiency"],
          "mapCenter": [25, 50],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 1,
          "title": "LoRA: Low-Rank Adaptation",
          "description": "Discover LoRA, which trains small rank-decomposed weight matrices instead of full weight updates.",
          "narration": "LoRA (Low-Rank Adaptation) is a technique that freezes the large model and trains small learnable matrices that are added to the weights. Instead of updating every parameter in a weight matrix W (shape: m × n), LoRA introduces two smaller matrices A (m × r) and B (r × n) where r << n. During fine-tuning, only A and B are trained. This reduces trainable parameters from millions to thousands while maintaining high-quality adaptation. LoRA is especially effective for instruction tuning and task-specific adaptation.",
          "landmarkIds": ["lora-paper", "hu-lora"],
          "mapCenter": [25, 52],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 2,
          "title": "QLoRA & Quantized Efficiency",
          "description": "Combine quantization with LoRA for even greater efficiency. Quantize base model weights while adapting with LoRA.",
          "narration": "QLoRA takes PEFT further by quantizing the base model to lower precision (e.g., 4-bit) while using LoRA for adaptation. This reduces memory usage dramatically—a 70B parameter model can be fine-tuned on a single consumer GPU. QLoRA achieves this by: (1) quantizing model weights to 4-bit precision, (2) using LoRA adapters for fine-tuning, and (3) employing double quantization and paged optimizers to save memory. QLoRA makes large model fine-tuning accessible without professional-grade hardware.",
          "landmarkIds": ["qlora-paper", "dettmers-qlora"],
          "mapCenter": [25, 54],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 3,
          "title": "Other PEFT Techniques",
          "description": "Explore additional approaches like prompt tuning, prefix tuning, and adapter modules.",
          "narration": "Beyond LoRA and QLoRA, researchers have developed other PEFT methods. Prompt tuning learns soft prompt tokens prepended to inputs rather than modifying model weights. Prefix tuning freezes the model and learns input prefix embeddings. Adapters insert small bottleneck modules into the model, training only these adapters. Each approach offers different trade-offs between memory efficiency, quality, and simplicity. Many modern systems support multiple PEFT methods, allowing teams to choose the best approach for their constraints.",
          "landmarkIds": ["prompt-tuning", "adapter-modules"],
          "mapCenter": [25, 56],
          "mapZoom": 3,
          "highlights": []
        }
      ]
    },
    {
      "id": "multimodal-vision-language",
      "title": "Multimodal Learning: Vision-Language Models",
      "description": "Journey through the development of models that understand both text and images. See how vision and language are unified.",
      "difficulty": "intermediate",
      "estimatedDuration": 11,
      "stages": [
        {
          "index": 0,
          "title": "CLIP: Vision-Text Alignment",
          "description": "Explore OpenAI's CLIP model that learns visual concepts through text descriptions.",
          "narration": "CLIP (Contrastive Language-Image Pre-training) was a breakthrough in multimodal learning. The insight was elegant: if you have images and descriptions of them, you can train models to align visual and textual representations by contrasting matching image-text pairs against non-matching ones. CLIP learned to understand images based on natural language descriptions, without requiring human-labeled categories. This approach, called contrastive learning, proved far more scalable than traditional supervised learning.",
          "landmarkIds": ["clip-paper", "radford-clip"],
          "mapCenter": [25, 50],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 1,
          "title": "DALL-E: Image Generation from Text",
          "description": "See how language models can generate images. DALL-E demonstrates creative synthesis.",
          "narration": "DALL-E applies the Transformer architecture to image generation. The model was trained to generate images from text descriptions by (1) tokenizing images into discrete tokens (using a learned autoencoder), (2) concatenating image tokens with text tokens, and (3) training to predict image tokens autoregressively. DALL-E demonstrated that language model techniques could be repurposed for creative image generation. Users could prompt it with creative descriptions and receive novel images, showcasing generalization and compositionality.",
          "landmarkIds": ["dalle-paper", "dall-e-generation"],
          "mapCenter": [25, 52],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 2,
          "title": "LLaVA & Visual Instruction Following",
          "description": "Understand how to adapt language models for visual understanding. LLaVA connects vision encoders with language models.",
          "narration": "LLaVA (Large Language and Vision Assistant) demonstrates that a relatively simple architecture—a vision encoder (like CLIP) connected to a language model—can produce strong visual understanding. LLaVA was trained on image-question-answer pairs where humans provide instructions about images. The vision encoder extracts visual features, which are projected into the language model's embedding space. The language model then generates responses about the image. This approach bridged vision and language capabilities.",
          "landmarkIds": ["llava-paper", "liu-llava"],
          "mapCenter": [25, 54],
          "mapZoom": 3,
          "highlights": []
        },
        {
          "index": 3,
          "title": "GPT-4V & Multi-Image Understanding",
          "description": "See how modern systems like GPT-4V handle multiple images and complex visual reasoning.",
          "narration": "GPT-4V (GPT-4 with Vision) represents the state-of-the-art in multimodal language models. It can process multiple images simultaneously, reason about spatial relationships, read text within images, and even understand charts and diagrams. GPT-4V handles variable image sizes and aspect ratios while maintaining strong language capabilities. The model demonstrates how scaling vision-language systems produces emergent abilities in visual reasoning and understanding.",
          "landmarkIds": ["gpt4v-paper", "achiam-gpt4v"],
          "mapCenter": [25, 56],
          "mapZoom": 3,
          "highlights": []
        }
      ]
    }
  ]
}
```

**Note:** The landmark IDs above are templates. Update them to match actual landmark IDs from your `landmarks.json` file.

---

### Step 3: Map Coordinate Selection

Use these guidelines for `mapCenter` coordinates (based on your map regions):

- **Attention/Transformer region:** [25, 50]
- **GPT Evolution region:** [25, 55]
- **Fine-tuning region:** [25, 52]
- **Multimodal region:** [30, 60]
- **Quantization region:** [20, 48]

Adjust zoom levels (0-18) to show appropriate detail for featured landmarks.

---

### Step 4: Validate Tours Data

```bash
# Check JSON syntax
npm run validate-data tours

# Or manually validate with Node:
node -e "const data = require('./public/data/tours.json'); console.log('Tours loaded:', data.tours.length)"
```

---

### Step 5: Update Landmarks.json References

Ensure all `landmarkIds` in tours exist in `public/data/landmarks.json`:

```bash
# Extract all landmark IDs
cat public/data/landmarks.json | jq '.[] | .id' > landmark-ids.txt

# Cross-check tour landmark references
grep -o '"landmarkIds":\s*\[[^]]*\]' public/data/tours.json
```

---

## 🧪 Testing Checklist

### Content Quality
- [ ] Read through all tour narrations for clarity and accuracy
- [ ] Verify tour progression is logical and engaging
- [ ] Check for spelling/grammar errors
- [ ] Confirm difficulty levels are appropriate
- [ ] Validate estimated durations are reasonable

### Technical Validation
- [ ] Tours data is valid JSON
- [ ] All landmark IDs reference existing landmarks
- [ ] Map coordinates are within valid bounds (lat: -90 to 90, lng: -180 to 180)
- [ ] Zoom levels are integers between 0-18
- [ ] No duplicate tour IDs
- [ ] All required fields present in each tour and stage

### Integration Testing
- [ ] Tours load in application without errors
- [ ] TourPanel renders tour content correctly
- [ ] Stage navigation works smoothly
- [ ] Map flies to correct coordinates on stage change
- [ ] Landmarks in stages are visible on map

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 4.4 (Tours Data Structure)
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 5, Issue #27
- **Landmarks:** [landmarks.json](../../public/data/landmarks.json)

---

## 🔗 Dependencies

**Blocks:**
- Issue #28 (TourPanel Component)
- Issue #29 (Tour Stage Navigation)
- Issue #30 (Tour Map Synchronization)
- Issue #31 (Pause/Resume Functionality)
- Issue #32 (Keyboard Shortcuts)
- Issue #33 (Tour Catalog)

**Depends On:**
- Issue #5 (Zod Schemas) - Data validation
- Issue #12 (Landmarks Data) - Landmarks referenced in tours

---

## 🚧 Known Issues & Gotchas

### Issue 1: Landmark ID Mismatch
**Problem:** Tour references landmarks that don't exist in landmarks.json
**Solution:** Validate all IDs against actual landmarks before finalizing

### Issue 2: Coordinate Out of Bounds
**Problem:** Map coordinates cause Leaflet errors
**Solution:** Ensure coordinates are within valid ranges; test in browser

### Issue 3: Missing Narration Context
**Problem:** Narration references concepts not explained
**Solution:** Keep narrations self-contained; assume general technical knowledge

---

## ✅ Definition of Done

Before marking this issue complete, verify:

- [ ] ✅ `public/data/tours.json` created with valid structure
- [ ] ✅ 3-5 tours defined with pedagogical coherence
- [ ] ✅ All stages have clear narration and map coordinates
- [ ] ✅ All landmark references validated
- [ ] ✅ Data passes Zod schema validation
- [ ] ✅ Tours render correctly in application
- [ ] ✅ No TypeScript or validation errors
- [ ] ✅ Content reviewed for clarity and accuracy
- [ ] ✅ Peer review completed

---

## 📝 Notes for Implementation

### Time Estimate
- **Content Research & Planning:** 1 hour
- **Data Structure Creation:** 1 hour
- **Narration Writing:** 1-1.5 hours
- **Validation & Testing:** 30 minutes
- **Total:** ~4 hours (4 story points)

### Best Practices
1. **Know your landmarks** - Review landmarks.json before writing tours
2. **Tell a story** - Tours should have narrative coherence
3. **Test as you go** - Validate JSON regularly
4. **Educational focus** - Assume beginner-to-intermediate audience
5. **Coordinate precision** - Use map coordinates that make sense visually

### Next Steps After Completion
1. Move to Issue #28 (TourPanel Component)
2. Designers can use tour structure for UI mockups
3. Document any new landmark needs for future sprints

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ Tours data file exists at `public/data/tours.json`
✅ Contains 3-5 well-curated tours with coherent narratives
✅ All tours validate against Zod schema
✅ Landmark references are accurate and verified
✅ Tour content is educationally sound and engaging
✅ Map coordinates position users appropriately for each stage
✅ Tests pass in integration with TourPanel component

---

**Ready to curate?** Start by researching available landmarks, then write engaging narrations that connect them into learning journeys. If you encounter content gaps, log them for potential landmark additions in future sprints.

**Estimated Completion:** Days 1-2 of Sprint 5

---

**Issue Metadata:**
- **Created:** October 1, 2025
- **Sprint:** Sprint 5
- **Milestone:** Milestone 3 - Guided Tours
- **Labels:** `P1`, `data`, `content`, `sprint-5`, `tours`
- **Story Points:** 4

---

## Tasks
- [ ] Research and plan tour narratives
- [ ] Create tours.json with 3-5 tours
- [ ] Validate tours data structure and landmark references
- [ ] Test integration with TourPanel component

## Dev Agent Record

### Content Curator Model Used
- Content Curator (Human Review Recommended)

### Notes
- This is a content creation task suitable for subject matter experts
- Tour structure and narration benefit from domain knowledge in LLM research
- Recommend peer review of content for accuracy and pedagogy
