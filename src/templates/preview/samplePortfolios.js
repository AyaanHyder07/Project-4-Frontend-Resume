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
    { id: "sk4", skillName: "Product Storytelling" },
  ],
  experience: [
    { id: "ex1", roleTitle: "Senior Product Engineer", organizationName: "Northstar Studio", startDate: "2023-01", endDate: "", currentlyWorking: true, roleDescription: "Leading portfolio platform architecture, premium frontend systems, and polished user journeys." },
    { id: "ex2", roleTitle: "Frontend Developer", organizationName: "Pixel Atelier", startDate: "2021-02", endDate: "2022-12", currentlyWorking: false, roleDescription: "Built editorial marketing sites and interactive landing pages for design and SaaS brands." },
  ],
  education: [
    { id: "ed1", degree: "B.Tech in Computer Science", institutionName: "Savitribai Phule University", startDate: "2017-06", endDate: "2021-06" },
  ],
  projects: [
    { id: "pr1", title: "StudioOS", description: "A premium client portal for creative studios with strong editorial layouts and high-conversion service pages.", techStack: ["React", "Spring", "MongoDB"], projectUrl: "https://example.com/studioos" },
    { id: "pr2", title: "Signal Deck", description: "A portfolio analytics workspace designed around crisp dashboards, realtime metrics, and storytelling.", techStack: ["TypeScript", "Node", "D3"], projectUrl: "https://example.com/signaldeck" },
  ],
  certifications: [
    { id: "cf1", title: "AWS Certified Developer", issuer: "Amazon Web Services", issueDate: "2025" },
  ],
  testimonials: [
    { id: "ts1", clientName: "Fatima Noor", clientRole: "Founder, Northstar", testimonialText: "A rare blend of product thinking, visual craft, and dependable execution." },
  ],
  services: [
    { id: "sv1", title: "Portfolio Strategy", description: "Positioning, structure, and narrative for stronger first impressions." },
    { id: "sv2", title: "Frontend Systems", description: "UI architecture and scalable component systems." },
    { id: "sv3", title: "Design Engineering", description: "High-fidelity implementation of premium interfaces." },
  ],
  publications: [
    { id: "pb1", title: "Designing Premium Product Surfaces", publisher: "UX Review", publishDate: "2025" },
  ],
  blogPosts: [
    { id: "bg1", title: "Building Premium Portfolio Experiences", publicationName: "Design Journal", excerpt: "A closer look at how content, motion, and typography work together.", publishDate: "2025" },
    { id: "bg2", title: "Writing for Product-Led Brands", publicationName: "Product Notes", excerpt: "How narrative and interface clarity reinforce trust.", publishDate: "2024" },
  ],
  exhibitions: [
    { id: "exh1", title: "New Interface Awards", description: "Selected among regional product storytelling showcases.", year: "2025" },
  ],
  mediaAppearances: [
    { id: "ma1", title: "Podcast Interview: Shipping Better Work", platform: "Builder FM", date: "2025" },
  ],
  financialCredentials: [
    { id: "fc1", title: "Procurement Compliance Certified", issuer: "Regional Council", issueDate: "2024" },
  ],
  contact: {
    email: "ayaan@example.com",
    phone: "+91 98765 43210",
    showContactForm: true,
    resumeId: "sample-resume-id",
  },
};

function baseVariant(key, title, themeData, profile, sectionOrder) {
  return {
    title,
    templateKey: key,
    renderFamily: key,
    openToWork: true,
    slug: `${String(key).toLowerCase()}-preview`,
    themeData,
    sectionOrder,
    profile: { ...baseProfile, ...profile },
    sections: baseSections,
  };
}

export function getSamplePortfolio(templateKey = "CLASSICPRO") {
  const key = String(templateKey || "CLASSICPRO").toUpperCase();

  const variants = {
    DEVFOLIO: baseVariant("DEVFOLIO", "Engineer Portfolio", { primaryColor: "#0A0A0A", accentColor: "#00FF88", backgroundColor: "#090B0B", textColor: "#E8F7F0", fontFamily: "JetBrains Mono", motionLevel: "rich" }, { fullName: "Mohammed Ayaan Hyder", professionalTitle: "Full Stack Dev", bio: "Motivated and detail-oriented builder focused on premium frontend systems, scalable backend architecture, and thoughtful product execution." }, ["skills", "experience", "projects", "education", "certifications", "contact"]),
    CLASSICPRO: baseVariant("CLASSICPRO", "Executive Portfolio", { primaryColor: "#1A1A2E", accentColor: "#E94560", backgroundColor: "#FFFFFF", textColor: "#1A1A2E", fontFamily: "Inter", motionLevel: "none" }, { fullName: "Alexandra Chen", professionalTitle: "Senior Product Designer", bio: "Recruiter-friendly portfolio focused on outcomes, product clarity, leadership, and the strongest work above the fold." }, ["experience", "education", "skills", "projects", "contact"]),
    DESIGNCASE: baseVariant("DESIGNCASE", "Creative Portfolio", { primaryColor: "#FFF6EC", accentColor: "#FF5A36", backgroundColor: "#F5EFE6", textColor: "#16110F", fontFamily: "DM Sans", motionLevel: "moderate" }, { fullName: "Nadia Sol", professionalTitle: "Brand & Product Designer", bio: "Editorial case-study portfolio built for designers who want stronger storytelling, art direction, and a premium client-facing presence." }, ["projects", "testimonials", "experience", "contact"]),
    LENSWORK: baseVariant("LENSWORK", "Gallery Portfolio", { primaryColor: "#0F0F10", accentColor: "#E8C547", backgroundColor: "#070707", textColor: "#F7F2E8", fontFamily: "Cormorant Garamond", motionLevel: "rich" }, { fullName: "Elena Moreau", professionalTitle: "Photographer & Director", bio: "Cinematic visual portfolio with immersive imagery, gallery-first storytelling, and an elegant high-end presentation." }, ["projects", "testimonials", "exhibitions", "contact"]),
    MENTORHUB: baseVariant("MENTORHUB", "Mentor Portfolio", { primaryColor: "#0F0C29", accentColor: "#A855F7", backgroundColor: "#0B0A1D", textColor: "#F5F1FF", fontFamily: "Inter", motionLevel: "moderate" }, { fullName: "Rhea Hart", professionalTitle: "Career Mentor & Advisor", bio: "Helping ambitious professionals package their story, sharpen positioning, and turn experience into clear career momentum." }, ["services", "testimonials", "experience", "contact"]),
    FREELANCERKIT: baseVariant("FREELANCERKIT", "Freelancer Portfolio", { primaryColor: "#1E293B", accentColor: "#38BDF8", backgroundColor: "#F8FAFC", textColor: "#0F172A", fontFamily: "Plus Jakarta Sans", motionLevel: "moderate" }, { fullName: "Imran Shah", professionalTitle: "Freelance Product Designer", bio: "Friendly, clear, and conversion-ready portfolio for independent professionals who need trust, proof, and a fast path to enquiry." }, ["services", "projects", "testimonials", "contact"]),
    STARTUPFOUNDER: baseVariant("STARTUPFOUNDER", "Founder Portfolio", { primaryColor: "#000000", accentColor: "#FF6B35", backgroundColor: "#050505", textColor: "#F8F3EC", fontFamily: "Syne", motionLevel: "rich" }, { fullName: "Kabir Malhotra", professionalTitle: "Founder & Product Strategist", bio: "Bold founder narrative built around traction, metrics, product thinking, and the signal that matters above the fold." }, ["projects", "experience", "skills", "contact"]),
    WRITERSDESK: baseVariant("WRITERSDESK", "Editorial Portfolio", { primaryColor: "#FFFDF7", accentColor: "#92400E", backgroundColor: "#FFFDF7", textColor: "#1C1917", fontFamily: "Playfair Display", motionLevel: "subtle" }, { fullName: "Sana Brooks", professionalTitle: "Writer & Editor", bio: "An editorial surface that now also supports projects, services, awards, and any other enabled sections without breaking the aesthetic." }, ["blogPosts", "publications", "projects", "experience", "contact"]),
    STUDIOGRID: baseVariant("STUDIOGRID", "Developer Studio", { primaryColor: "#081012", accentColor: "#5BFFAA", backgroundColor: "#081012", textColor: "#F0FFF8", fontFamily: "Space Grotesk", motionLevel: "moderate" }, { fullName: "Tamal-inspired Builder", professionalTitle: "Software Engineer, Front-end & App Developer", bio: "A structured developer portfolio with proof, expertise, and a premium first screen inspired by real engineering portfolio storytelling." }, ["experience", "projects", "skills", "certifications", "contact"]),
    PIXELMUSE: baseVariant("PIXELMUSE", "Playful Creative Portfolio", { primaryColor: "#FFF6EF", accentColor: "#D6007A", backgroundColor: "#FFF6EF", textColor: "#19120F", fontFamily: "Syne", motionLevel: "moderate" }, { fullName: "Cassie-inspired Creative", professionalTitle: "Artist, creative technologist, and internet person", bio: "Bold, playful, and still useful. A creative profile that can flex for artists, designers, developers, and anyone with expressive work." }, ["projects", "blogPosts", "experience", "services", "contact"]),
    CREATORFRAME: baseVariant("CREATORFRAME", "Creator Profile", { primaryColor: "#151518", accentColor: "#FF00A8", backgroundColor: "#151518", textColor: "#F6F1F7", fontFamily: "Outfit", motionLevel: "moderate" }, { fullName: "Jhey-style Creator", professionalTitle: "Web Developer, Creator, Speaker", bio: "A creator-profile portfolio with most of the identity and trust signals front-loaded into one strong framed screen, then the rest of the work below." }, ["projects", "blogPosts", "services", "testimonials", "contact"]),
    QUIETCANVAS: baseVariant("QUIETCANVAS", "Aesthetic Minimal Portfolio", { primaryColor: "#FAF4EC", accentColor: "#8F5B3E", backgroundColor: "#FAF4EC", textColor: "#171311", fontFamily: "Cormorant Garamond", motionLevel: "subtle" }, { fullName: "Mira Sol", professionalTitle: "Minimal creative portfolio", bio: "No navbar, no noise, and a softer frame. Most of the story lands in the first screen, while the rest unfolds with generous spacing below." }, ["projects", "experience", "publications", "services", "contact"]),
  };

  return variants[key] || variants.CLASSICPRO;
}
