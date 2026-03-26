const baseProfile = {
  fullName: "Ayaan Hyder",
  displayName: "Ayaan",
  professionalTitle: "Full Stack Engineer",
  title: "Full Stack Engineer",
  bio: "I design and build polished digital products with performance, clarity, and strong visual direction at the center of every screen.",
  email: "ayaan@example.com",
  phone: "+91 98765 43210",
  location: "Pune, India",
  linkedinUrl: "https://linkedin.com/in/ayaan",
  githubUrl: "https://github.com/ayaan",
  twitterUrl: "https://x.com/ayaan",
  websiteUrl: "https://ayaan.design",
  availabilityStatus: "OPEN_TO_WORK",
  profilePhotoUrl: "",
};

const baseSections = {
  skills: [
    { id: "sk1", skillName: "React" },
    { id: "sk2", skillName: "Spring Boot" },
    { id: "sk3", skillName: "System Design" },
    { id: "sk4", skillName: "Framer Motion" },
  ],
  experience: [
    {
      id: "ex1",
      roleTitle: "Senior Product Engineer",
      organizationName: "Northstar Studio",
      startDate: "2023-01",
      endDate: "",
      currentlyWorking: true,
      roleDescription: "Leading portfolio platform architecture, premium frontend systems, and polished user journeys.",
    },
    {
      id: "ex2",
      roleTitle: "Frontend Developer",
      organizationName: "Pixel Atelier",
      startDate: "2021-02",
      endDate: "2022-12",
      currentlyWorking: false,
      roleDescription: "Built editorial marketing sites and interactive landing pages for design and SaaS brands.",
    },
  ],
  education: [
    {
      id: "ed1",
      degree: "B.Tech in Computer Science",
      institutionName: "Savitribai Phule University",
      startDate: "2017-06",
      endDate: "2021-06",
    },
  ],
  projects: [
    {
      id: "pr1",
      title: "StudioOS",
      description: "A premium client portal for creative studios with strong editorial layouts and high-conversion service pages.",
      techStack: ["React", "Spring", "MongoDB"],
      projectUrl: "https://example.com/studioos",
    },
    {
      id: "pr2",
      title: "Signal Deck",
      description: "A portfolio analytics workspace designed around crisp dashboards, realtime metrics, and storytelling.",
      techStack: ["TypeScript", "Node", "D3"],
      projectUrl: "https://example.com/signaldeck",
    },
  ],
  certifications: [
    { id: "cf1", title: "AWS Certified Developer", issuer: "Amazon Web Services" },
  ],
  testimonials: [
    {
      id: "ts1",
      clientName: "Fatima Noor",
      testimonialText: "A rare blend of product thinking, visual craft, and dependable execution.",
    },
  ],
  services: [
    { id: "sv1", title: "Portfolio Strategy" },
    { id: "sv2", title: "Frontend Systems" },
    { id: "sv3", title: "Design Engineering" },
  ],
  publications: [
    { id: "pb1", title: "Designing Premium Product Surfaces", publisher: "UX Review" },
  ],
  blogPosts: [
    { id: "bg1", title: "Building Premium Portfolio Experiences", publicationName: "Design Journal", excerpt: "A closer look at how content, motion, and typography work together." },
    { id: "bg2", title: "Writing for Product-Led Brands", publicationName: "Product Notes", excerpt: "How narrative and interface clarity reinforce trust." },
  ],
  contact: {
    email: "ayaan@example.com",
    phone: "+91 98765 43210",
    showContactForm: true,
    resumeId: "sample-resume-id",
  },
};

export function getSamplePortfolio(templateKey = "CLASSICPRO") {
  const key = String(templateKey || "CLASSICPRO").toUpperCase();

  const variants = {
    DEVFOLIO: {
      title: "Engineer Portfolio",
      templateKey: "DEVFOLIO",
      renderFamily: "DEVFOLIO",
      openToWork: true,
      slug: "devfolio-preview",
      themeData: { primaryColor: "#0A0A0A", accentColor: "#00FF88", backgroundColor: "#090B0B", textColor: "#E8F7F0", fontFamily: "JetBrains Mono", motionLevel: "rich" },
      sectionOrder: ["skills", "experience", "projects", "education", "contact"],
      profile: { ...baseProfile, fullName: "Mohammed Ayaan Hyder", professionalTitle: "Full Stack Dev", bio: "Motivated and detail-oriented builder focused on premium frontend systems, scalable backend architecture, and thoughtful product execution." },
      sections: baseSections,
    },
    CLASSICPRO: {
      title: "Executive Portfolio",
      templateKey: "CLASSICPRO",
      renderFamily: "CLASSICPRO",
      openToWork: true,
      slug: "classicpro-preview",
      themeData: { primaryColor: "#1A1A2E", accentColor: "#E94560", backgroundColor: "#FFFFFF", textColor: "#1A1A2E", fontFamily: "Inter", motionLevel: "none" },
      sectionOrder: ["experience", "education", "skills", "projects", "contact"],
      profile: { ...baseProfile, fullName: "Alexandra Chen", professionalTitle: "Senior Product Designer", bio: "Recruiter-friendly portfolio focused on outcomes, product clarity, leadership, and the strongest work above the fold." },
      sections: baseSections,
    },
    DESIGNCASE: {
      title: "Creative Portfolio",
      templateKey: "DESIGNCASE",
      renderFamily: "DESIGNCASE",
      openToWork: true,
      slug: "designcase-preview",
      themeData: { primaryColor: "#FFF6EC", accentColor: "#FF5A36", backgroundColor: "#F5EFE6", textColor: "#16110F", fontFamily: "DM Sans", motionLevel: "moderate" },
      sectionOrder: ["projects", "testimonials", "experience", "contact"],
      profile: { ...baseProfile, fullName: "Nadia Sol", professionalTitle: "Brand & Product Designer", bio: "Editorial case-study portfolio built for designers who want stronger storytelling, art direction, and a premium client-facing presence." },
      sections: { ...baseSections, projects: [
        { id: "d1", title: "Northstar Rebrand", description: "A brand and digital system redesign for a venture-backed fintech company with new messaging, identity, and launch site.", techStack: ["Brand Strategy", "UI Systems", "Launch Design"], projectUrl: "https://example.com/northstar" },
        { id: "d2", title: "Atlas Mobile", description: "A product-led redesign focused on onboarding clarity, retention, and a more premium mobile visual language.", techStack: ["UX", "Product", "Research"], projectUrl: "https://example.com/atlas" },
      ] },
    },
    LENSWORK: {
      title: "Gallery Portfolio",
      templateKey: "LENSWORK",
      renderFamily: "LENSWORK",
      openToWork: false,
      slug: "lenswork-preview",
      themeData: { primaryColor: "#0F0F10", accentColor: "#E8C547", backgroundColor: "#070707", textColor: "#F7F2E8", fontFamily: "Cormorant Garamond", motionLevel: "rich" },
      sectionOrder: ["projects", "testimonials", "contact"],
      profile: { ...baseProfile, fullName: "Elena Moreau", professionalTitle: "Photographer & Director", bio: "Cinematic visual portfolio with immersive imagery, gallery-first storytelling, and an elegant high-end presentation." },
      sections: { ...baseSections, projects: [
        { id: "l1", title: "Desert Light", description: "An editorial campaign exploring texture, motion, and warm natural light across stills and short-form film.", techStack: ["Editorial", "Portrait", "Direction"], projectUrl: "https://example.com/desertlight" },
        { id: "l2", title: "Midnight Passage", description: "A moody monochrome series made for luxury hospitality and slow-living visual storytelling.", techStack: ["Luxury", "Hospitality", "Film"], projectUrl: "https://example.com/midnight" },
        { id: "l3", title: "Surface Study", description: "Material-focused campaign work with tactile compositions and premium art-book framing.", techStack: ["Campaign", "Texture", "Print"], projectUrl: "https://example.com/surface" },
      ] },
    },
    MENTORHUB: {
      title: "Mentor Portfolio",
      templateKey: "MENTORHUB",
      renderFamily: "MENTORHUB",
      openToWork: true,
      slug: "mentorhub-preview",
      themeData: { primaryColor: "#0F0C29", accentColor: "#A855F7", backgroundColor: "#0B0A1D", textColor: "#F5F1FF", fontFamily: "Inter", motionLevel: "moderate" },
      sectionOrder: ["services", "testimonials", "experience", "contact"],
      profile: { ...baseProfile, fullName: "Rhea Hart", professionalTitle: "Career Mentor & Advisor", bio: "Helping ambitious professionals package their story, sharpen positioning, and turn experience into clear career momentum." },
      sections: { ...baseSections, services: [
        { id: "m1", title: "Career Positioning" },
        { id: "m2", title: "Portfolio Reviews" },
        { id: "m3", title: "Mock Interviews" },
      ] },
    },
    FREELANCERKIT: {
      title: "Freelancer Portfolio",
      templateKey: "FREELANCERKIT",
      renderFamily: "FREELANCERKIT",
      openToWork: true,
      slug: "freelancerkit-preview",
      themeData: { primaryColor: "#1E293B", accentColor: "#38BDF8", backgroundColor: "#F8FAFC", textColor: "#0F172A", fontFamily: "Plus Jakarta Sans", motionLevel: "moderate" },
      sectionOrder: ["services", "projects", "testimonials", "contact"],
      profile: { ...baseProfile, fullName: "Imran Shah", professionalTitle: "Freelance Product Designer", bio: "Friendly, clear, and conversion-ready portfolio for independent professionals who need trust, proof, and a fast path to enquiry." },
      sections: baseSections,
    },
    STARTUPFOUNDER: {
      title: "Founder Portfolio",
      templateKey: "STARTUPFOUNDER",
      renderFamily: "STARTUPFOUNDER",
      openToWork: false,
      slug: "startupfounder-preview",
      themeData: { primaryColor: "#000000", accentColor: "#FF6B35", backgroundColor: "#050505", textColor: "#F8F3EC", fontFamily: "Syne", motionLevel: "rich" },
      sectionOrder: ["projects", "experience", "skills", "contact"],
      profile: { ...baseProfile, fullName: "Kabir Malhotra", professionalTitle: "Founder & Product Strategist", bio: "Bold founder narrative built around traction, metrics, product thinking, and the signal that matters above the fold." },
      sections: baseSections,
    },
    WRITERSDESK: {
      title: "Writer Portfolio",
      templateKey: "WRITERSDESK",
      renderFamily: "WRITERSDESK",
      openToWork: true,
      slug: "writersdesk-preview",
      themeData: { primaryColor: "#FFFDF7", accentColor: "#92400E", backgroundColor: "#FFFDF7", textColor: "#1C1917", fontFamily: "Playfair Display", motionLevel: "subtle" },
      sectionOrder: ["blogPosts", "publications", "contact"],
      profile: { ...baseProfile, fullName: "Sana Brooks", professionalTitle: "Writer & Editor", bio: "An editorial writing portfolio designed for long-form storytelling, publication proof, and a calm premium reading experience." },
      sections: { ...baseSections, projects: [], skills: [{ id: "ws1", skillName: "Editorial Strategy" }, { id: "ws2", skillName: "Feature Writing" }, { id: "ws3", skillName: "Research" }] },
    },
  };

  return variants[key] || variants.CLASSICPRO;
}
