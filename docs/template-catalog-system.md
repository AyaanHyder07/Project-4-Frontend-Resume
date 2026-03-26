# System Template Catalog

This catalog defines the first 50 seeded system templates for the portfolio platform.

Core rules:
- Each template is a seeded system template backed by a real frontend render family.
- Admin manages metadata, visibility, pricing, preview, profession targeting, and defaults.
- Premium users can customize color palette and fonts in real time on top of these templates.
- New admin-created templates should clone an existing render family instead of inventing an unknown renderer.

## Render Families

Each catalog entry belongs to one render family:

- `DEVFOLIO`: dark, terminal, animated, code-forward
- `CLASSICPRO`: dense, recruiter-friendly, compact, low-motion
- `DESIGNCASE`: editorial, asymmetrical, case-study-first
- `LENSWORK`: fullscreen, cinematic, gallery-led
- `FREELANCERKIT`: trust-building, service-led, testimonial-heavy
- `MENTORHUB`: premium coaching, booking-first, warm conversion flow
- `STARTUPFOUNDER`: bold, metric-driven, impact-heavy
- `WRITERSDESK`: literary/editorial, reading-focused
- `MLRESEARCH`: academic, minimalist, structured
- `CAREPULSE`: healthcare trust-first, calm, appointment-oriented
- `LEGALLEDGER`: credibility-first, formal, structured proof
- `ARTCANVAS`: expressive, exhibition-led, image-first

## Admin Variant Model

Each seeded template should map to:

- `templateKey`: unique seeded key, for example `DEVFOLIO_01`
- `renderFamily`: one of the families above
- `variantKey`: short variant slug, for example `neo-terminal`
- `professionTypes`: exact backend `ProfessionType` values
- `planLevel`
- `defaultTheme`
- `enabledSections`
- `sectionOrder`
- `navStyle`
- `supportsPremiumCustomization = true`
- `isSystemTemplate = true`
- `isEditableByAdmin = true`

## Developer Templates (8)

1. `DEVFOLIO_01` / `DEVFOLIO` / `neo-terminal`
   For: `SOFTWARE_ENGINEER`, `FULL_STACK_DEVELOPER`, `BACKEND_DEVELOPER`
   Style: dark shell, glowing accent, fixed top nav, rich motion

2. `DEVFOLIO_02` / `DEVFOLIO` / `minimal-hacker`
   For: `FRONTEND_DEVELOPER`, `BACKEND_DEVELOPER`, `DEVOPS_ENGINEER`
   Style: matte black, smaller type, sharper cards, restrained animation

3. `DEVFOLIO_03` / `DEVFOLIO` / `oss-grid`
   For: `SOFTWARE_ENGINEER`, `FULL_STACK_DEVELOPER`
   Style: open-source flavored, repo-grid projects, activity emphasis

4. `DEVFOLIO_04` / `DEVFOLIO` / `teal-runtime`
   For: `BACKEND_DEVELOPER`, `DEVOPS_ENGINEER`
   Style: infrastructure vibe, timeline-first, signal-heavy layout

5. `DEVFOLIO_05` / `DEVFOLIO` / `frontend-glow`
   For: `FRONTEND_DEVELOPER`, `UI_DESIGNER`
   Style: brighter accents, component showcase, animated cards

6. `DEVFOLIO_06` / `DEVFOLIO` / `data-pulse`
   For: `DATA_SCIENTIST`, `DATA_ANALYST`
   Style: data storytelling, charts/metrics space, clean dark UI

7. `DEVFOLIO_07` / `STARTUPFOUNDER` / `builder-founder`
   For: `PRODUCT_MANAGER`, `SOFTWARE_ENGINEER`
   Style: founder-builder crossover, metrics + products above fold

8. `DEVFOLIO_08` / `MLRESEARCH` / `ml-lab`
   For: `DATA_SCIENTIST`, `RESEARCHER`
   Style: research plus engineering hybrid, publications + projects

## Designer Templates (7)

9. `DESIGNCASE_01` / `DESIGNCASE` / `editorial-sidebar`
   For: `UX_DESIGNER`, `UI_DESIGNER`, `PRODUCT_MANAGER`
   Style: fixed sidebar, long case studies, editorial typography

10. `DESIGNCASE_02` / `DESIGNCASE` / `orange-studio`
    For: `GRAPHIC_DESIGNER`, `BRAND_DESIGNER`
    Style: bold accents, poster-like composition, visual-first cards

11. `DESIGNCASE_03` / `DESIGNCASE` / `portfolio-notes`
    For: `UX_DESIGNER`, `UI_DESIGNER`
    Style: process-focused, white-space heavy, annotated layouts

12. `DESIGNCASE_04` / `DESIGNCASE` / `contrast-grid`
    For: `GRAPHIC_DESIGNER`, `MOTION_DESIGNER`
    Style: asymmetrical grid, stronger hover states, motion previews

13. `DESIGNCASE_05` / `DESIGNCASE` / `soft-product`
    For: `PRODUCT_MANAGER`, `UX_DESIGNER`
    Style: softer palette, product outcomes, testimonial-backed

14. `DESIGNCASE_06` / `DESIGNCASE` / `lux-serif`
    For: `BRAND_DESIGNER`, `GRAPHIC_DESIGNER`
    Style: premium serif mix, luxury direction, slower transitions

15. `DESIGNCASE_07` / `ARTCANVAS` / `illustration-showcase`
    For: `ILLUSTRATOR`, `VISUAL_ARTIST`
    Style: art-led portfolio with project notes and case captions

## Photography and Film Templates (5)

16. `LENSWORK_01` / `LENSWORK` / `cinematic-dark`
    For: `PHOTOGRAPHER`, `FILMMAKER`, `VIDEOGRAPHER`
    Style: fullscreen hero, film-strip gallery, overlay navigation

17. `LENSWORK_02` / `LENSWORK` / `light-gallery`
    For: `PHOTOGRAPHER`
    Style: bright museum look, airy gallery spacing

18. `LENSWORK_03` / `LENSWORK` / `director-cut`
    For: `FILMMAKER`, `VIDEOGRAPHER`
    Style: trailer-first, reels, embedded video sections

19. `LENSWORK_04` / `ARTCANVAS` / `masonry-photo`
    For: `PHOTOGRAPHER`, `VISUAL_ARTIST`
    Style: masonry grid, exhibition mode, no heavy navbar

20. `LENSWORK_05` / `LENSWORK` / `monograph`
    For: `PHOTOGRAPHER`, `FILMMAKER`
    Style: monochrome, large captions, art-book transitions

## Freelancer and Service Templates (5)

21. `FREELANCERKIT_01` / `FREELANCERKIT` / `friendly-pricing`
    For: `BUSINESS_CONSULTANT`, `COACH`, `GENERALIST`
    Style: approachable, service cards, easy CTA flow

22. `FREELANCERKIT_02` / `FREELANCERKIT` / `agency-clean`
    For: `MARKETING_SPECIALIST`, `BUSINESS_CONSULTANT`
    Style: cleaner agency vibe, trust badges and packages

23. `FREELANCERKIT_03` / `MENTORHUB` / `coach-convert`
    For: `COACH`, `BUSINESS_CONSULTANT`
    Style: premium session booking, warm gradient motion

24. `FREELANCERKIT_04` / `CLASSICPRO` / `solo-consultant`
    For: `BUSINESS_CONSULTANT`, `ACCOUNTANT`
    Style: formal, conversion-aware, high readability

25. `FREELANCERKIT_05` / `STARTUPFOUNDER` / `fractional-lead`
    For: `PRODUCT_MANAGER`, `BUSINESS_CONSULTANT`
    Style: fractional exec profile, proof-heavy, strong callouts

## Founder, Product, and Business Templates (5)

26. `STARTUPFOUNDER_01` / `STARTUPFOUNDER` / `impact-black`
    For: `PRODUCT_MANAGER`, `SOFTWARE_ENGINEER`
    Style: bold black/orange, metric bands, founder story

27. `STARTUPFOUNDER_02` / `STARTUPFOUNDER` / `operator-clean`
    For: `PRODUCT_MANAGER`, `BUSINESS_CONSULTANT`
    Style: cleaner boardroom look, less motion, more trust

28. `STARTUPFOUNDER_03` / `CLASSICPRO` / `executive-bio`
    For: `GENERALIST`, `BUSINESS_CONSULTANT`
    Style: executive summary, achievements first

29. `STARTUPFOUNDER_04` / `FREELANCERKIT` / `advisor-network`
    For: `COACH`, `BUSINESS_CONSULTANT`
    Style: services, media appearances, endorsements

30. `STARTUPFOUNDER_05` / `MENTORHUB` / `speaker-founder`
    For: `GENERALIST`, `BUSINESS_CONSULTANT`
    Style: keynote/speaking profile with trust and contact conversion

## Writer and Publishing Templates (4)

31. `WRITERSDESK_01` / `WRITERSDESK` / `literary-serif`
    For: `WRITER`, `JOURNALIST`
    Style: serif-led editorial, reading progress, article archive

32. `WRITERSDESK_02` / `WRITERSDESK` / `newsletter-modern`
    For: `CONTENT_STRATEGIST`, `WRITER`
    Style: cleaner content business look, publication cards

33. `WRITERSDESK_03` / `DESIGNCASE` / `essay-casebook`
    For: `WRITER`, `CONTENT_STRATEGIST`
    Style: longform storytelling with portfolio proof

34. `WRITERSDESK_04` / `CLASSICPRO` / `newsroom-compact`
    For: `JOURNALIST`
    Style: high-density clips, publications, media appearances

## Research and Academic Templates (4)

35. `MLRESEARCH_01` / `MLRESEARCH` / `numbered-academic`
    For: `RESEARCHER`, `PROFESSOR`
    Style: numbered sections, mono accents, minimal motion

36. `MLRESEARCH_02` / `MLRESEARCH` / `lab-minimal`
    For: `RESEARCHER`, `DATA_SCIENTIST`
    Style: project/publication hybrid, clean scientific tone

37. `MLRESEARCH_03` / `CLASSICPRO` / `faculty-profile`
    For: `PROFESSOR`, `TEACHER`
    Style: institution-friendly, dense achievements and publications

38. `MLRESEARCH_04` / `WRITERSDESK` / `scholar-editorial`
    For: `RESEARCHER`, `PROFESSOR`
    Style: literary-academic crossover, text-first

## Healthcare Templates (4)

39. `CAREPULSE_01` / `CAREPULSE` / `doctor-trust`
    For: `DOCTOR`
    Style: calm white/blue, trust-focused, credentials and availability

40. `CAREPULSE_02` / `CAREPULSE` / `therapy-warm`
    For: `THERAPIST`
    Style: warm neutrals, gentle shapes, booking/contact emphasis

41. `CAREPULSE_03` / `CLASSICPRO` / `nurse-compact`
    For: `NURSE`
    Style: structured, readable, certification-forward

42. `CAREPULSE_04` / `MENTORHUB` / `wellness-premium`
    For: `THERAPIST`, `DOCTOR`
    Style: higher-end healthcare/consult setup, conversion-focused

## Legal and Finance Templates (4)

43. `LEGALLEDGER_01` / `LEGALLEDGER` / `legal-classic`
    For: `LAWYER`, `LEGAL_CONSULTANT`
    Style: formal typography, authority, publication and cases

44. `LEGALLEDGER_02` / `CLASSICPRO` / `finance-ledger`
    For: `ACCOUNTANT`, `FINANCIAL_ANALYST`
    Style: compact, precise, conservative visuals

45. `LEGALLEDGER_03` / `CLASSICPRO` / `banking-exec`
    For: `INVESTMENT_BANKER`
    Style: executive profile, impact and institution-ready

46. `LEGALLEDGER_04` / `FREELANCERKIT` / `advisory-modern`
    For: `LEGAL_CONSULTANT`, `FINANCIAL_ANALYST`
    Style: advisory services, clean trust UI, consultation CTA

## Creative and Artist Templates (4)

47. `ARTCANVAS_01` / `ARTCANVAS` / `museum-light`
    For: `VISUAL_ARTIST`, `ILLUSTRATOR`
    Style: white gallery, breathing room, exhibition-led

48. `ARTCANVAS_02` / `ARTCANVAS` / `bold-poster`
    For: `VISUAL_ARTIST`, `MOTION_DESIGNER`
    Style: poster typography, high-contrast color blocking

49. `ARTCANVAS_03` / `LENSWORK` / `immersive-exhibit`
    For: `VISUAL_ARTIST`, `ANIMATOR`
    Style: dark immersive project viewer, fullscreen sections

50. `ARTCANVAS_04` / `DESIGNCASE` / `process-atelier`
    For: `ILLUSTRATOR`, `BRAND_DESIGNER`
    Style: process notes, sketchbook-inspired storytelling

## Implementation Order

Build order for production rollout:

1. `DEVFOLIO`
2. `CLASSICPRO`
3. `DESIGNCASE`
4. `LENSWORK`
5. `FREELANCERKIT`
6. `MENTORHUB`
7. `STARTUPFOUNDER`
8. `WRITERSDESK`
9. `MLRESEARCH`
10. `CAREPULSE`
11. `LEGALLEDGER`
12. `ARTCANVAS`

The first 12 render families cover the full 50-template catalog through seeded variants.
