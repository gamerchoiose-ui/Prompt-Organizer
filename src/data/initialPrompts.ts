import { PromptItem } from '../types';

export const INITIAL_PROMPTS: PromptItem[] = [
  {
    prompt_id: "prompt-1",
    name: "Senior Code Reviewer & Security Audit",
    description: "Acts as a principal software engineer conducting a rigorous code review focusing on security vulnerabilities, performance bottlenecks, and clean architecture.",
    prompt_text: "You are a Principal Software Engineer and Security Expert. Review the following code snippet for:\n1. Security vulnerabilities (OWASP Top 10, injections, auth flaws)\n2. Performance bottlenecks & memory leaks\n3. Code readability, idiomatic patterns, and TypeScript type safety\n\nCode to review:\n```{{language}}\n{{code_snippet}}\n```\n\nProvide constructive feedback with corrected code snippets where applicable.",
    tags: ["coding", "security", "typescript", "code-review"],
    associated_task: "Coding",
    date_created: "2026-08-01T10:00:00Z",
    last_used: "2026-08-30T14:22:00Z",
    example_input: "language: typescript, code_snippet: function getUser(id) { return db.query('SELECT * FROM users WHERE id = ' + id); }",
    example_output: "1. Security Flaw: SQL Injection vulnerability due to string concatenation. Use parameterized queries instead...",
    is_favorite: true,
    versions: [
      {
        version_id: "v-1-1",
        version_number: 1,
        prompt_text: "You are a Principal Software Engineer and Security Expert. Review the following code snippet for:\n1. Security vulnerabilities (OWASP Top 10, injections, auth flaws)\n2. Performance bottlenecks & memory leaks\n3. Code readability, idiomatic patterns, and TypeScript type safety\n\nCode to review:\n```{{language}}\n{{code_snippet}}\n```\n\nProvide constructive feedback with corrected code snippets where applicable.",
        timestamp: "2026-08-01T10:00:00Z",
        change_summary: "Initial version"
      }
    ]
  },
  {
    prompt_id: "prompt-2",
    name: "MECE Business Problem Breakdown",
    description: "Applies the MECE (Mutually Exclusive, Collectively Exhaustive) framework to analyze complex strategic business problems.",
    prompt_text: "You are an expert Strategy Consultant trained at top-tier firms. Analyze the following business challenge using the MECE (Mutually Exclusive, Collectively Exhaustive) framework.\n\nBusiness Challenge: {{challenge}}\n\nStructure your response into:\n1. Core Problem Statement\n2. MECE Pillars / Categories\n3. Key Hypotheses per Pillar\n4. Recommended Next Steps or Analyses",
    tags: ["strategy", "business", "mece", "consulting"],
    associated_task: "Analysis",
    date_created: "2026-08-05T11:30:00Z",
    last_used: "2026-08-29T09:15:00Z",
    example_input: "challenge: SaaS startup churn rate increased by 4% in Q2.",
    example_output: "1. Core Problem: Increased customer churn...\n2. MECE Pillars: A) Onboarding friction, B) Product value realization, C) Customer support responsiveness...",
    is_favorite: true,
    versions: [
      {
        version_id: "v-2-1",
        version_number: 1,
        prompt_text: "You are an expert Strategy Consultant trained at top-tier firms. Analyze the following business challenge using the MECE (Mutually Exclusive, Collectively Exhaustive) framework.\n\nBusiness Challenge: {{challenge}}\n\nStructure your response into:\n1. Core Problem Statement\n2. MECE Pillars / Categories\n3. Key Hypotheses per Pillar\n4. Recommended Next Steps or Analyses",
        timestamp: "2026-08-05T11:30:00Z",
        change_summary: "Initial version"
      }
    ]
  },
  {
    prompt_id: "prompt-3",
    name: "Persuasive Hook & Article Outline Generator",
    description: "Creates engaging narrative hooks and structured outlines for blog posts, newsletters, or essays.",
    prompt_text: "You are an expert content strategist and viral writer. Create 3 high-converting hooks and a comprehensive article outline for the topic below.\n\nTopic: {{topic}}\nTarget Audience: {{audience}}\nTone: {{tone}}\n\nEnsure the outline flows logically from an empathetic hook to actionable takeaways.",
    tags: ["writing", "blog", "content", "marketing"],
    associated_task: "Writing",
    date_created: "2026-08-10T15:00:00Z",
    last_used: "2026-08-28T18:40:00Z",
    example_input: "topic: How to build effective AI prompts, audience: software developers, tone: pragmatic and concise",
    example_output: "Hook 1: Stop guessing what to type into AI. Here's the exact formula...\nOutline: 1. Introduction, 2. Anatomy of a Prompt...",
    is_favorite: false,
    versions: [
      {
        version_id: "v-3-1",
        version_number: 1,
        prompt_text: "You are an expert content strategist and viral writer. Create 3 high-converting hooks and a comprehensive article outline for the topic below.\n\nTopic: {{topic}}\nTarget Audience: {{audience}}\nTone: {{tone}}\n\nEnsure the outline flows logically from an empathetic hook to actionable takeaways.",
        timestamp: "2026-08-10T15:00:00Z",
        change_summary: "Initial version"
      }
    ]
  },
  {
    prompt_id: "prompt-4",
    name: "Executive Document Summarizer & Action Extractor",
    description: "Distills lengthy reports, meeting transcripts, or articles into executive summaries with clear bullet points and action items.",
    prompt_text: "You are an executive chief of staff. Read the text below and provide:\n1. A 3-sentence executive summary\n2. Key takeaways and insights (bulleted)\n3. Action items with suggested owners and urgency levels\n\nSource Text:\n{{text_content}}",
    tags: ["summarization", "productivity", "executive", "notes"],
    associated_task: "Summarization",
    date_created: "2026-08-12T08:20:00Z",
    last_used: "2026-08-31T08:00:00Z",
    example_input: "text_content: [Paste meeting transcript or long article here]",
    example_output: "Summary: The team aligned on Q3 goals...\nAction Items: 1. Update API docs (High, Owner: John)",
    is_favorite: false,
    versions: [
      {
        version_id: "v-4-1",
        version_number: 1,
        prompt_text: "You are an executive chief of staff. Read the text below and provide:\n1. A 3-sentence executive summary\n2. Key takeaways and insights (bulleted)\n3. Action items with suggested owners and urgency levels\n\nSource Text:\n{{text_content}}",
        timestamp: "2026-08-12T08:20:00Z",
        change_summary: "Initial version"
      }
    ]
  },
  {
    prompt_id: "prompt-5",
    name: "Out-of-the-Box Ideation & SCAMPER Brainstormer",
    description: "Uses the SCAMPER technique (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse) to generate innovative product or creative ideas.",
    prompt_text: "You are an imaginative innovation catalyst. Apply the SCAMPER ideation technique to the following product, service, or challenge to generate at least 7 unconventional, disruptive ideas.\n\nTarget Subject: {{subject}}",
    tags: ["brainstorming", "innovation", "creativity", "scamper"],
    associated_task: "Brainstorming",
    date_created: "2026-08-15T16:45:00Z",
    last_used: "2026-08-25T12:00:00Z",
    example_input: "subject: A traditional local coffee shop",
    example_output: "1. Substitute: Replace baristas with robotic artisan arms... 2. Combine: Coffee shop + coworking + art gallery...",
    is_favorite: true,
    versions: [
      {
        version_id: "v-5-1",
        version_number: 1,
        prompt_text: "You are an imaginative innovation catalyst. Apply the SCAMPER ideation technique to the following product, service, or challenge to generate at least 7 unconventional, disruptive ideas.\n\nTarget Subject: {{subject}}",
        timestamp: "2026-08-15T16:45:00Z",
        change_summary: "Initial version"
      }
    ]
  },
  {
    prompt_id: "prompt-6",
    name: "Application Compatibility Report Generator",
    description: "Guides a language model in generating a rigorous, production-ready application compatibility report with matrices and actionable engineering recommendations.",
    prompt_text: "You are an expert QA and Cross-Platform Compatibility Engineer. Generate a comprehensive application compatibility report based on the application details and target parameters provided below.\n\nApplication Name: {{app_name}}\nKey Features: {{key_features}}\nTarget Devices: {{target_devices}}\nTarget Browsers: {{target_browsers}}\n\nYour report must include:\n1. Summary: High-level overview of compatibility status and key findings.\n2. Device Compatibility Matrix: Markdown table evaluating functional equivalence, UI/UX consistency, performance, security, and accessibility across device types and models.\n3. Browser Compatibility Matrix: Markdown table evaluating compatibility status across major browsers and versions.\n4. Detailed Findings: Categorized issues by severity (Critical, Major, Minor, Cosmetic) with descriptions and recommended engineering solutions.\n5. Recommendations: Strategic testing and development priorities for improving cross-platform stability.",
    tags: ["qa", "testing", "compatibility", "report", "engineering"],
    associated_task: "Analysis",
    date_created: "2026-08-20T09:00:00Z",
    last_used: "2026-08-31T16:00:00Z",
    example_input: "app_name: \"MyApp\", key_features: \"User login, data submission, report generation.\", target_devices: \"Desktop (Windows, macOS), Mobile (iOS, Android)\", target_browsers: \"Chrome, Firefox, Safari (latest)\"",
    example_output: "Application Compatibility Report: MyApp\n\n1. Summary...\n2. Device Compatibility Matrix...",
    is_favorite: true,
    versions: [
      {
        version_id: "v-6-1",
        version_number: 1,
        prompt_text: "You are an expert QA and Cross-Platform Compatibility Engineer. Generate a comprehensive application compatibility report based on the application details and target parameters provided below.\n\nApplication Name: {{app_name}}\nKey Features: {{key_features}}\nTarget Devices: {{target_devices}}\nTarget Browsers: {{target_browsers}}\n\nYour report must include:\n1. Summary: High-level overview of compatibility status and key findings.\n2. Device Compatibility Matrix: Markdown table evaluating functional equivalence, UI/UX consistency, performance, security, and accessibility across device types and models.\n3. Browser Compatibility Matrix: Markdown table evaluating compatibility status across major browsers and versions.\n4. Detailed Findings: Categorized issues by severity (Critical, Major, Minor, Cosmetic) with descriptions and recommended engineering solutions.\n5. Recommendations: Strategic testing and development priorities for improving cross-platform stability.",
        timestamp: "2026-08-20T09:00:00Z",
        change_summary: "Initial version"
      }
    ]
  }
];
