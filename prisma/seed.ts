import { PrismaClient, Prisma } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

// Hash password helper
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Sujal Sharma",
    email: "sujal@gmail.com",
    password: "1234",
    bio: "Full-stack developer passionate about building scalable web applications. Love hackathons and open source contributions.",
    location: "San Francisco, CA",
    github: "https://github.com/sujalsharma",
    linkedin: "https://linkedin.com/in/sujalsharma",
    twitter: "https://twitter.com/sujalsharma",
    portfolio: "https://sujalsharma.dev",
    role: "PARTICIPANT",
  },
  {
    name: "Shubh Patel",
    email: "shubh@gmail.com",
    password: "1234",
    bio: "Machine learning engineer with expertise in NLP and computer vision. Always looking for innovative AI challenges.",
    location: "New York, NY",
    github: "https://github.com/shubhpatel",
    linkedin: "https://linkedin.com/in/shubhpatel",
    portfolio: "https://shubhpatel.io",
    role: "PARTICIPANT",
  },
  {
    name: "Emily Chen",
    email: "emily.chen@gmail.com",
    password: "1234",
    bio: "Frontend developer specializing in React and TypeScript. UX enthusiast who believes in creating delightful user experiences.",
    location: "Seattle, WA",
    github: "https://github.com/emilychen",
    linkedin: "https://linkedin.com/in/emilychen",
    twitter: "https://twitter.com/emilychen_dev",
    portfolio: "https://emilychen.design",
    role: "PARTICIPANT",
  },
  {
    name: "Marcus Johnson",
    email: "marcus.johnson@gmail.com",
    password: "1234",
    bio: "Backend engineer with 5+ years of experience in distributed systems. Rust and Go advocate. Love building high-performance APIs.",
    location: "Austin, TX",
    github: "https://github.com/marcusjohnson",
    linkedin: "https://linkedin.com/in/marcusjohnson",
    role: "PARTICIPANT",
  },
  {
    name: "Priya Gupta",
    email: "priya.gupta@gmail.com",
    password: "1234",
    bio: "Data scientist turning complex data into actionable insights. Passionate about AI ethics and responsible machine learning.",
    location: "Boston, MA",
    github: "https://github.com/priyagupta",
    linkedin: "https://linkedin.com/in/priyagupta",
    twitter: "https://twitter.com/priya_data",
    portfolio: "https://priyagupta.ai",
    role: "PARTICIPANT",
  },
  {
    name: "Alex Rivera",
    email: "alex.rivera@gmail.com",
    password: "1234",
    bio: "Mobile developer crafting beautiful iOS and Android apps. Flutter enthusiast and open source contributor.",
    location: "Los Angeles, CA",
    github: "https://github.com/alexrivera",
    linkedin: "https://linkedin.com/in/alexrivera",
    portfolio: "https://alexrivera.mobile",
    role: "PARTICIPANT",
  },
  {
    name: "Sarah Kim",
    email: "sarah.kim@gmail.com",
    password: "1234",
    bio: "DevOps engineer automating everything. Kubernetes certified. Building reliable infrastructure one pipeline at a time.",
    location: "Denver, CO",
    github: "https://github.com/sarahkim",
    linkedin: "https://linkedin.com/in/sarahkim",
    twitter: "https://twitter.com/sarahkim_devops",
    role: "ORGANIZATION_ADMIN",
  },
  {
    name: "James Wilson",
    email: "james.wilson@gmail.com",
    password: "1234",
    bio: "Security researcher and ethical hacker. CTF player and bug bounty hunter. Making the internet a safer place.",
    location: "Washington, DC",
    github: "https://github.com/jameswilson",
    linkedin: "https://linkedin.com/in/jameswilson",
    twitter: "https://twitter.com/jameswilson_sec",
    role: "PARTICIPANT",
  },
  {
    name: "Aisha Mohammed",
    email: "aisha.mohammed@gmail.com",
    password: "1234",
    bio: "Product designer with a background in software engineering. Bridging the gap between design and development.",
    location: "Chicago, IL",
    linkedin: "https://linkedin.com/in/aishamohammed",
    portfolio: "https://aishamohammed.design",
    role: "PARTICIPANT",
  },
  {
    name: "David Lee",
    email: "david.lee@gmail.com",
    password: "1234",
    bio: "Blockchain developer and Web3 enthusiast. Building decentralized applications for a more open internet.",
    location: "Miami, FL",
    github: "https://github.com/davidlee",
    linkedin: "https://linkedin.com/in/davidlee",
    twitter: "https://twitter.com/davidlee_web3",
    role: "PARTICIPANT",
  },
  {
    name: "Nina Petrova",
    email: "nina.petrova@gmail.com",
    password: "1234",
    bio: "Game developer and graphics programmer. Unity and Unreal expert. Creating immersive experiences through code.",
    location: "Portland, OR",
    github: "https://github.com/ninapetrova",
    linkedin: "https://linkedin.com/in/ninapetrova",
    portfolio: "https://ninapetrova.games",
    role: "PARTICIPANT",
  },
  {
    name: "Carlos Mendez",
    email: "carlos.mendez@gmail.com",
    password: "1234",
    bio: "IoT engineer connecting the physical and digital worlds. Arduino and Raspberry Pi hacker. Smart home enthusiast.",
    location: "Phoenix, AZ",
    github: "https://github.com/carlosmendez",
    linkedin: "https://linkedin.com/in/carlosmendez",
    role: "PARTICIPANT",
  },
  {
    name: "Rachel Green",
    email: "rachel.green@gmail.com",
    password: "1234",
    bio: "Technical writer and developer advocate. Making complex technologies accessible to everyone through clear documentation.",
    location: "Atlanta, GA",
    github: "https://github.com/rachelgreen",
    linkedin: "https://linkedin.com/in/rachelgreen",
    twitter: "https://twitter.com/rachelgreen_dev",
    portfolio: "https://rachelgreen.tech",
    role: "ORGANIZATION_ADMIN",
  },
  {
    name: "Kevin Zhang",
    email: "kevin.zhang@gmail.com",
    password: "1234",
    bio: "Cloud architect designing scalable solutions on AWS and GCP. Helping startups build reliable infrastructure from day one.",
    location: "San Jose, CA",
    github: "https://github.com/kevinzhang",
    linkedin: "https://linkedin.com/in/kevinzhang",
    role: "PARTICIPANT",
  },
  {
    name: "Olivia Taylor",
    email: "olivia.taylor@gmail.com",
    password: "1234",
    bio: "QA engineer and automation specialist. Breaking things so users don't have to. Cypress and Playwright expert.",
    location: "Minneapolis, MN",
    github: "https://github.com/oliviataylor",
    linkedin: "https://linkedin.com/in/oliviataylor",
    twitter: "https://twitter.com/oliviataylor_qa",
    role: "PARTICIPANT",
  },
];

// Organization data - some users will create these
const organizationData = [
  {
    name: "TechVentures Inc",
    slug: "techventures",
    type: "COMPANY" as const,
    description: "A leading technology company focused on building innovative solutions for the future. We specialize in AI, cloud computing, and enterprise software.",
    website: "https://techventures.io",
    industry: "Technology",
    size: "51-200",
    location: "San Francisco, CA",
    isVerified: true,
    ownerEmail: "sarah.kim@gmail.com", // Sarah Kim creates this org
  },
  {
    name: "Stanford Innovation Lab",
    slug: "stanford-innovation-lab",
    type: "UNIVERSITY" as const,
    description: "Stanford's premier student-run innovation hub. We host hackathons, workshops, and connect students with industry mentors.",
    website: "https://innovation.stanford.edu",
    industry: "Education",
    size: "11-50",
    location: "Stanford, CA",
    isVerified: true,
    ownerEmail: "rachel.green@gmail.com", // Rachel Green creates this org
  },
  {
    name: "Code for Good",
    slug: "code-for-good",
    type: "NONPROFIT" as const,
    description: "Using technology to solve social problems. We organize hackathons focused on civic tech, healthcare, and environmental sustainability.",
    website: "https://codeforgood.org",
    industry: "Nonprofit",
    size: "11-50",
    location: "Washington, DC",
    isVerified: true,
    ownerEmail: "james.wilson@gmail.com", // James Wilson creates this org
  },
  {
    name: "DevHub Community",
    slug: "devhub-community",
    type: "OTHER" as const,
    description: "A global community of developers sharing knowledge, hosting events, and building open source projects together.",
    website: "https://devhub.community",
    industry: "Developer Community",
    size: "201-500",
    location: "Remote / Global",
    isVerified: false,
    ownerEmail: "marcus.johnson@gmail.com", // Marcus Johnson creates this org
  },
  {
    name: "AI Research Collective",
    slug: "ai-research-collective",
    type: "COMPANY" as const,
    description: "Pioneering the future of artificial intelligence through collaborative research and innovative hackathons.",
    website: "https://airesearch.co",
    industry: "Artificial Intelligence",
    size: "11-50",
    location: "Boston, MA",
    isVerified: true,
    ownerEmail: "priya.gupta@gmail.com", // Priya Gupta creates this org
  },
  {
    name: "Blockchain Builders Guild",
    slug: "blockchain-builders",
    type: "OTHER" as const,
    description: "Building the decentralized future one block at a time. We host Web3 hackathons and developer education programs.",
    website: "https://blockchainbuilders.io",
    industry: "Blockchain / Web3",
    size: "1-10",
    location: "Miami, FL",
    isVerified: false,
    ownerEmail: "david.lee@gmail.com", // David Lee creates this org
  },
];

export async function main() {
  console.log("🌱 Starting seed...");
  
  console.log("👥 Creating users...");
  const createdUsers: { [email: string]: string } = {};
  for (const u of userData) {
    // Hash the password before storing
    const hashedPassword = await hashPassword(u.password as string);
    
    // Use upsert to create or update (including password hash fix)
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword }, // Update password hash for existing users
      create: {
        ...u,
        password: hashedPassword,
      },
    });
    createdUsers[user.email] = user.id;
    console.log(`  ✅ Created/Updated user: ${user.name} (${user.email})`);
  }
  
  console.log("\n🏢 Creating organizations...");
  for (const org of organizationData) {
    const { ownerEmail, ...orgData } = org;
    const ownerId = createdUsers[ownerEmail];
    
    if (!ownerId) {
      console.log(`  ⚠️ Skipping ${org.name} - owner email ${ownerEmail} not found`);
      continue;
    }
    
    // Check if organization already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: org.slug },
    });
    
    if (existingOrg) {
      console.log(`  ℹ️ Organization already exists: ${org.name}`);
      continue;
    }
    
    // Create organization with owner as member
    const organization = await prisma.organization.create({
      data: {
        ...orgData,
        members: {
          create: {
            userId: ownerId,
            role: "OWNER",
          },
        },
      },
    });
    console.log(`  ✅ Created organization: ${organization.name} (owner: ${ownerEmail})`);
  }
  
  // Create hackathons
  console.log("\n🏆 Creating hackathons...");
  
  type StageData = {
    name: string;
    type: "REGISTRATION" | "TEAM_FORMATION" | "IDEATION" | "MENTORING_SESSION" | "CHECKPOINT" | "DEVELOPMENT" | "EVALUATION" | "PRESENTATION" | "RESULTS" | "CUSTOM";
    order: number;
    description: string;
    daysFromStart: number;
    durationDays: number;
    color: string;
    requiresSubmission?: boolean;
  };
  
  const hackathonData: Array<{
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    orgSlug: string;
    type: "OPEN" | "INVITE_ONLY" | "ORGANIZATION_ONLY";
    mode: "VIRTUAL" | "IN_PERSON" | "HYBRID";
    status: "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "IN_PROGRESS" | "JUDGING" | "COMPLETED" | "CANCELLED";
    registrationStart: Date;
    registrationEnd: Date;
    hackathonStart: Date;
    hackathonEnd: Date;
    resultsDate: Date;
    maxTeamSize: number;
    minTeamSize: number;
    maxParticipants: number;
    prizePool: number;
    themes: string[];
    tags: string[];
    rules: string;
    eligibility: string;
    allowSoloParticipants: boolean;
    requireApproval: boolean;
    isPublic: boolean;
    isFeatured: boolean;
    tracks: Array<{ name: string; description: string; prizeAmount: number; color: string }>;
    prizes: Array<{ title: string; description: string; amount: number; position: number }>;
    stages: StageData[];
    judges: string[];
    mentors: string[];
  }> = [
    {
      title: "AI Innovation Challenge 2026",
      slug: "ai-innovation-challenge-2026",
      description: "Join us for the biggest AI hackathon of the year! Build innovative AI solutions that solve real-world problems. Whether you're into machine learning, natural language processing, computer vision, or generative AI, this is your chance to showcase your skills and compete for amazing prizes.",
      shortDescription: "Build innovative AI solutions and compete for ₹50,000 in prizes",
      orgSlug: "ai-research-collective",
      type: "OPEN" as const,
      mode: "VIRTUAL" as const,
      status: "REGISTRATION_OPEN" as const,
      registrationStart: new Date("2026-02-01"),
      registrationEnd: new Date("2026-02-28"),
      hackathonStart: new Date("2026-03-01"),
      hackathonEnd: new Date("2026-03-03"),
      resultsDate: new Date("2026-03-10"),
      maxTeamSize: 4,
      minTeamSize: 2,
      maxParticipants: 500,
      prizePool: 50000,
      themes: ["AI/ML", "Healthcare", "Climate", "Education"],
      tags: ["artificial-intelligence", "machine-learning", "python", "tensorflow"],
      rules: "1. All code must be written during the hackathon period.\n2. Teams can use pre-trained models but must disclose them.\n3. Projects must be original work.\n4. All submissions must include a demo video.",
      eligibility: "Open to all developers, data scientists, and AI enthusiasts worldwide. Students and professionals welcome.",
      allowSoloParticipants: false,
      requireApproval: false,
      isPublic: true,
      isFeatured: true,
      tracks: [
        { name: "Healthcare AI", description: "AI solutions for healthcare and medical diagnostics", prizeAmount: 15000, color: "#EF4444" },
        { name: "Climate Tech", description: "AI for environmental sustainability and climate action", prizeAmount: 15000, color: "#10B981" },
        { name: "Education AI", description: "AI-powered learning and educational tools", prizeAmount: 10000, color: "#3B82F6" },
        { name: "Open Innovation", description: "Any AI application that solves a real problem", prizeAmount: 10000, color: "#8B5CF6" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Best overall project across all tracks", amount: 15000, position: 1 },
        { title: "Second Place", description: "Runner-up for best overall project", amount: 10000, position: 2 },
        { title: "Third Place", description: "Third place overall", amount: 5000, position: 3 },
        { title: "Best Demo", description: "Most impressive live demonstration", amount: 3000, position: 4 },
        { title: "People's Choice", description: "Voted by the community", amount: 2000, position: 5 },
      ],
      stages: [
        { name: "Registration", type: "REGISTRATION" as const, order: 1, description: "Sign up and form your team", daysFromStart: -30, durationDays: 28, color: "#6366F1", requiresSubmission: false },
        { name: "Kickoff & Ideation", type: "IDEATION" as const, order: 2, description: "Opening ceremony and brainstorming session", daysFromStart: 0, durationDays: 0.5, color: "#8B5CF6" },
        { name: "Development Sprint", type: "DEVELOPMENT" as const, order: 3, description: "Build your AI solution", daysFromStart: 0.5, durationDays: 2, color: "#10B981" },
        { name: "Submission", type: "CHECKPOINT" as const, order: 4, description: "Submit your project and demo video", daysFromStart: 2.5, durationDays: 0.25, requiresSubmission: true, color: "#F59E0B" },
        { name: "Judging", type: "EVALUATION" as const, order: 5, description: "Projects evaluated by judges", daysFromStart: 2.75, durationDays: 4, color: "#EF4444" },
        { name: "Results Announcement", type: "RESULTS" as const, order: 6, description: "Winners announced!", daysFromStart: 7, durationDays: 0.25, color: "#EC4899" },
      ],
      judges: ["priya.gupta@gmail.com", "shubh@gmail.com"],
      mentors: ["kevin.zhang@gmail.com", "emily.chen@gmail.com"],
    },
    {
      title: "Web3 Builder Hackathon",
      slug: "web3-builder-hackathon",
      description: "Build the decentralized future! Create innovative blockchain applications, DeFi protocols, NFT platforms, and Web3 tools. Whether you're a seasoned smart contract developer or just getting started with blockchain, join us for an exciting weekend of building.",
      shortDescription: "Create innovative blockchain and Web3 applications",
      orgSlug: "blockchain-builders",
      type: "OPEN" as const,
      mode: "HYBRID" as const,
      status: "PUBLISHED" as const,
      registrationStart: new Date("2026-03-01"),
      registrationEnd: new Date("2026-03-25"),
      hackathonStart: new Date("2026-04-05"),
      hackathonEnd: new Date("2026-04-07"),
      resultsDate: new Date("2026-04-14"),
      maxTeamSize: 5,
      minTeamSize: 1,
      maxParticipants: 300,
      prizePool: 30000,
      themes: ["DeFi", "NFTs", "DAOs", "Infrastructure"],
      tags: ["blockchain", "ethereum", "solidity", "web3", "smart-contracts"],
      rules: "1. Projects must use blockchain technology.\n2. Smart contracts must be deployed to testnet.\n3. Open source code required.",
      eligibility: "Open to all blockchain enthusiasts and developers.",
      allowSoloParticipants: true,
      requireApproval: false,
      isPublic: true,
      isFeatured: true,
      tracks: [
        { name: "DeFi", description: "Decentralized finance applications", prizeAmount: 10000, color: "#10B981" },
        { name: "NFTs & Gaming", description: "NFT platforms and blockchain games", prizeAmount: 8000, color: "#F59E0B" },
        { name: "Infrastructure", description: "Tools and infrastructure for Web3", prizeAmount: 7000, color: "#3B82F6" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Best Web3 project", amount: 10000, position: 1 },
        { title: "Second Place", description: "Runner-up", amount: 6000, position: 2 },
        { title: "Third Place", description: "Third place", amount: 4000, position: 3 },
      ],
      stages: [
        { name: "Registration", type: "REGISTRATION" as const, order: 1, description: "Register and form teams", daysFromStart: -35, durationDays: 24, color: "#6366F1" },
        { name: "Hacking Begins", type: "DEVELOPMENT" as const, order: 2, description: "Start building!", daysFromStart: 0, durationDays: 2, color: "#10B981" },
        { name: "Submission", type: "CHECKPOINT" as const, order: 3, description: "Submit your project", daysFromStart: 2, durationDays: 0.25, requiresSubmission: true, color: "#F59E0B" },
        { name: "Judging", type: "EVALUATION" as const, order: 4, description: "Expert judging", daysFromStart: 2.25, durationDays: 5, color: "#EF4444" },
        { name: "Results", type: "RESULTS" as const, order: 5, description: "Winners announced", daysFromStart: 9, durationDays: 0.25, color: "#EC4899" },
      ],
      judges: ["david.lee@gmail.com"],
      mentors: ["marcus.johnson@gmail.com"],
    },
    {
      title: "Civic Tech for Good",
      slug: "civic-tech-for-good-2026",
      description: "Use technology to make a positive impact in your community! Build solutions for civic engagement, government transparency, public health, and social justice. Partner with local nonprofits and government agencies to create real change.",
      shortDescription: "Build technology solutions for civic and social impact",
      orgSlug: "code-for-good",
      type: "OPEN" as const,
      mode: "VIRTUAL" as const,
      status: "REGISTRATION_OPEN" as const,
      registrationStart: new Date("2026-01-15"),
      registrationEnd: new Date("2026-02-10"),
      hackathonStart: new Date("2026-02-15"),
      hackathonEnd: new Date("2026-02-17"),
      resultsDate: new Date("2026-02-24"),
      maxTeamSize: 6,
      minTeamSize: 2,
      maxParticipants: 400,
      prizePool: 25000,
      themes: ["Civic Engagement", "Public Health", "Government", "Social Justice"],
      tags: ["civic-tech", "social-impact", "open-data", "community"],
      rules: "1. Projects must address a civic or social issue.\n2. Must use open data or create open data.\n3. Solutions should be sustainable and implementable.",
      eligibility: "Open to developers, designers, data analysts, and civic-minded individuals.",
      allowSoloParticipants: true,
      requireApproval: false,
      isPublic: true,
      isFeatured: false,
      tracks: [
        { name: "Government Transparency", description: "Open data and government accountability", prizeAmount: 8000, color: "#3B82F6" },
        { name: "Public Health", description: "Health equity and access solutions", prizeAmount: 8000, color: "#EF4444" },
        { name: "Community Building", description: "Tools for civic engagement", prizeAmount: 6000, color: "#10B981" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Most impactful civic tech solution", amount: 8000, position: 1 },
        { title: "Second Place", description: "Runner-up", amount: 5000, position: 2 },
        { title: "Third Place", description: "Third place", amount: 3000, position: 3 },
        { title: "Community Choice", description: "Voted by participants", amount: 2000, position: 4 },
      ],
      stages: [
        { name: "Registration", type: "REGISTRATION" as const, order: 1, description: "Sign up", daysFromStart: -31, durationDays: 26, color: "#6366F1" },
        { name: "Team Formation", type: "TEAM_FORMATION" as const, order: 2, description: "Find teammates", daysFromStart: -5, durationDays: 5, color: "#8B5CF6" },
        { name: "Kickoff", type: "IDEATION" as const, order: 3, description: "Problem statements revealed", daysFromStart: 0, durationDays: 0.25, color: "#10B981" },
        { name: "Building", type: "DEVELOPMENT" as const, order: 4, description: "Development time", daysFromStart: 0.25, durationDays: 1.75, color: "#F59E0B" },
        { name: "Demo Day", type: "PRESENTATION" as const, order: 5, description: "Present your solution", daysFromStart: 2, durationDays: 0.25, color: "#EF4444" },
        { name: "Results", type: "RESULTS" as const, order: 6, description: "Winners announced", daysFromStart: 9, durationDays: 0.25, color: "#EC4899" },
      ],
      judges: ["james.wilson@gmail.com", "rachel.green@gmail.com"],
      mentors: ["aisha.mohammed@gmail.com"],
    },
    {
      title: "TechVentures Innovation Sprint",
      slug: "techventures-innovation-sprint",
      description: "An intensive 48-hour hackathon hosted by TechVentures Inc. We're looking for innovative solutions in cloud computing, enterprise software, and developer tools. Top projects may receive internship offers or seed funding!",
      shortDescription: "Build enterprise solutions and win internship opportunities",
      orgSlug: "techventures",
      type: "OPEN" as const,
      mode: "IN_PERSON" as const,
      status: "PUBLISHED" as const,
      registrationStart: new Date("2026-04-01"),
      registrationEnd: new Date("2026-04-20"),
      hackathonStart: new Date("2026-05-01"),
      hackathonEnd: new Date("2026-05-03"),
      resultsDate: new Date("2026-05-10"),
      maxTeamSize: 4,
      minTeamSize: 2,
      maxParticipants: 200,
      prizePool: 40000,
      themes: ["Cloud", "DevTools", "Enterprise", "Security"],
      tags: ["cloud-computing", "aws", "kubernetes", "enterprise"],
      rules: "1. Must attend in person in San Francisco.\n2. All code must be original.\n3. Must present to judges on demo day.",
      eligibility: "Open to developers and engineers. Must be able to travel to San Francisco.",
      allowSoloParticipants: false,
      requireApproval: true,
      isPublic: true,
      isFeatured: true,
      tracks: [
        { name: "Cloud Infrastructure", description: "Cloud-native solutions and infrastructure tools", prizeAmount: 12000, color: "#3B82F6" },
        { name: "Developer Experience", description: "Tools that improve developer productivity", prizeAmount: 10000, color: "#10B981" },
        { name: "Security", description: "Cybersecurity and privacy solutions", prizeAmount: 10000, color: "#EF4444" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Best overall + internship opportunity", amount: 15000, position: 1 },
        { title: "Second Place", description: "Runner-up + interview fast-track", amount: 10000, position: 2 },
        { title: "Third Place", description: "Third place", amount: 7000, position: 3 },
        { title: "Best Technical Implementation", description: "Most technically impressive", amount: 5000, position: 4 },
      ],
      stages: [
        { name: "Application", type: "REGISTRATION" as const, order: 1, description: "Apply to participate", daysFromStart: -30, durationDays: 19, color: "#6366F1" },
        { name: "Check-in", type: "CUSTOM" as const, order: 2, description: "Arrive and check in", daysFromStart: 0, durationDays: 0.1, color: "#8B5CF6" },
        { name: "Hacking", type: "DEVELOPMENT" as const, order: 3, description: "48 hours of building", daysFromStart: 0.1, durationDays: 2, color: "#10B981" },
        { name: "Presentations", type: "PRESENTATION" as const, order: 4, description: "Demo to judges", daysFromStart: 2.1, durationDays: 0.25, color: "#F59E0B" },
        { name: "Awards Ceremony", type: "RESULTS" as const, order: 5, description: "Winners announced", daysFromStart: 2.35, durationDays: 0.1, color: "#EC4899" },
      ],
      judges: ["sarah.kim@gmail.com"],
      mentors: ["kevin.zhang@gmail.com", "marcus.johnson@gmail.com"],
    },
    {
      title: "Stanford HackX 2026",
      slug: "stanford-hackx-2026",
      description: "Stanford's flagship student hackathon returns! Join students from top universities for 36 hours of innovation, learning, and fun. Build anything you can imagine with support from industry mentors and sponsors.",
      shortDescription: "Stanford's premier student hackathon experience",
      orgSlug: "stanford-innovation-lab",
      type: "OPEN" as const,
      mode: "HYBRID" as const,
      status: "REGISTRATION_OPEN" as const,
      registrationStart: new Date("2026-02-01"),
      registrationEnd: new Date("2026-03-01"),
      hackathonStart: new Date("2026-03-15"),
      hackathonEnd: new Date("2026-03-17"),
      resultsDate: new Date("2026-03-20"),
      maxTeamSize: 4,
      minTeamSize: 1,
      maxParticipants: 600,
      prizePool: 35000,
      themes: ["Open Innovation", "Social Good", "EdTech", "FinTech"],
      tags: ["student", "university", "beginner-friendly", "networking"],
      rules: "1. Open to all university students.\n2. Beginners welcome!\n3. Use any technology you want.",
      eligibility: "Must be a current university student (undergraduate or graduate).",
      allowSoloParticipants: true,
      requireApproval: false,
      isPublic: true,
      isFeatured: true,
      tracks: [
        { name: "Best Overall", description: "Most impressive project overall", prizeAmount: 10000, color: "#6366F1" },
        { name: "Best Beginner Hack", description: "Best project by first-time hackers", prizeAmount: 5000, color: "#10B981" },
        { name: "Best Design", description: "Most beautiful and user-friendly", prizeAmount: 5000, color: "#EC4899" },
        { name: "Most Innovative", description: "Most creative and novel solution", prizeAmount: 5000, color: "#F59E0B" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Best overall project", amount: 10000, position: 1 },
        { title: "Runner Up", description: "Second best overall", amount: 6000, position: 2 },
        { title: "Third Place", description: "Third best overall", amount: 4000, position: 3 },
        { title: "Best Beginner", description: "For first-time hackers", amount: 3000, position: 4 },
        { title: "Crowd Favorite", description: "Voted by attendees", amount: 2000, position: 5 },
      ],
      stages: [
        { name: "Registration", type: "REGISTRATION" as const, order: 1, description: "Register now!", daysFromStart: -42, durationDays: 28, color: "#6366F1" },
        { name: "Opening Ceremony", type: "IDEATION" as const, order: 2, description: "Kickoff and team formation", daysFromStart: 0, durationDays: 0.125, color: "#8B5CF6" },
        { name: "Hacking", type: "DEVELOPMENT" as const, order: 3, description: "36 hours to build", daysFromStart: 0.125, durationDays: 1.5, color: "#10B981" },
        { name: "Submissions Due", type: "CHECKPOINT" as const, order: 4, description: "Submit your project", daysFromStart: 1.625, durationDays: 0.125, requiresSubmission: true, color: "#F59E0B" },
        { name: "Expo & Judging", type: "EVALUATION" as const, order: 5, description: "Demo to judges", daysFromStart: 1.75, durationDays: 0.25, color: "#EF4444" },
        { name: "Closing Ceremony", type: "RESULTS" as const, order: 6, description: "Awards announced", daysFromStart: 2, durationDays: 0.125, color: "#EC4899" },
      ],
      judges: ["rachel.green@gmail.com", "priya.gupta@gmail.com"],
      mentors: ["sujal@gmail.com", "emily.chen@gmail.com", "alex.rivera@gmail.com"],
    },
    {
      title: "DevHub Global Hack Week",
      slug: "devhub-global-hack-week",
      description: "A week-long global hackathon where developers from around the world collaborate on open source projects. No competition, just collaboration! Learn new technologies, contribute to meaningful projects, and connect with developers worldwide.",
      shortDescription: "A week of collaborative open source hacking",
      orgSlug: "devhub-community",
      type: "OPEN" as const,
      mode: "VIRTUAL" as const,
      status: "PUBLISHED" as const,
      registrationStart: new Date("2026-05-01"),
      registrationEnd: new Date("2026-05-20"),
      hackathonStart: new Date("2026-06-01"),
      hackathonEnd: new Date("2026-06-07"),
      resultsDate: new Date("2026-06-10"),
      maxTeamSize: 10,
      minTeamSize: 1,
      maxParticipants: 1000,
      prizePool: 15000,
      themes: ["Open Source", "DevTools", "Documentation", "Community"],
      tags: ["open-source", "collaboration", "community", "global"],
      rules: "1. All contributions must be to open source projects.\n2. Be respectful and inclusive.\n3. Help others learn!",
      eligibility: "Open to everyone, all skill levels welcome.",
      allowSoloParticipants: true,
      requireApproval: false,
      isPublic: true,
      isFeatured: false,
      tracks: [
        { name: "New Contributors", description: "First-time open source contributors", prizeAmount: 3000, color: "#10B981" },
        { name: "Documentation", description: "Best documentation improvements", prizeAmount: 3000, color: "#3B82F6" },
        { name: "Feature Development", description: "Most impactful new features", prizeAmount: 5000, color: "#8B5CF6" },
        { name: "Bug Fixes", description: "Most bugs squashed", prizeAmount: 2000, color: "#EF4444" },
      ],
      prizes: [
        { title: "Top Contributor", description: "Most impactful contributions", amount: 5000, position: 1 },
        { title: "Rising Star", description: "Best first-time contributor", amount: 3000, position: 2 },
        { title: "Documentation Hero", description: "Best docs contributions", amount: 2000, position: 3 },
        { title: "Community Champion", description: "Most helpful to others", amount: 2000, position: 4 },
      ],
      stages: [
        { name: "Registration", type: "REGISTRATION" as const, order: 1, description: "Sign up to participate", daysFromStart: -31, durationDays: 19, color: "#6366F1" },
        { name: "Kickoff", type: "IDEATION" as const, order: 2, description: "Find projects to work on", daysFromStart: 0, durationDays: 1, color: "#8B5CF6" },
        { name: "Hack Week", type: "DEVELOPMENT" as const, order: 3, description: "Contribute to open source!", daysFromStart: 1, durationDays: 5, color: "#10B981" },
        { name: "Showcase", type: "PRESENTATION" as const, order: 4, description: "Share what you built", daysFromStart: 6, durationDays: 0.5, color: "#F59E0B" },
        { name: "Celebration", type: "RESULTS" as const, order: 5, description: "Recognition and prizes", daysFromStart: 9, durationDays: 0.25, color: "#EC4899" },
      ],
      judges: ["marcus.johnson@gmail.com"],
      mentors: ["nina.petrova@gmail.com", "carlos.mendez@gmail.com", "olivia.taylor@gmail.com"],
    },
    {
      title: "Game Jam Winter 2026",
      slug: "game-jam-winter-2026",
      description: "Create an amazing game in just 48 hours! Whether you're into 2D platformers, 3D adventures, puzzle games, or experimental art games, this is your chance to bring your game ideas to life. All engines and frameworks welcome.",
      shortDescription: "Create a game in 48 hours",
      orgSlug: "devhub-community",
      type: "OPEN" as const,
      mode: "VIRTUAL" as const,
      status: "COMPLETED" as const,
      registrationStart: new Date("2025-12-01"),
      registrationEnd: new Date("2025-12-20"),
      hackathonStart: new Date("2026-01-10"),
      hackathonEnd: new Date("2026-01-12"),
      resultsDate: new Date("2026-01-19"),
      maxTeamSize: 4,
      minTeamSize: 1,
      maxParticipants: 250,
      prizePool: 10000,
      themes: ["Games", "Creativity", "Storytelling"],
      tags: ["game-development", "unity", "unreal", "godot", "indie"],
      rules: "1. Theme will be announced at the start.\n2. All assets must be created during the jam (or use royalty-free).\n3. Must be playable in browser or downloadable.",
      eligibility: "Open to game developers of all skill levels.",
      allowSoloParticipants: true,
      requireApproval: false,
      isPublic: true,
      isFeatured: false,
      tracks: [
        { name: "Best Gameplay", description: "Most fun to play", prizeAmount: 3000, color: "#10B981" },
        { name: "Best Art", description: "Most visually impressive", prizeAmount: 2500, color: "#EC4899" },
        { name: "Best Audio", description: "Best sound design and music", prizeAmount: 2000, color: "#8B5CF6" },
      ],
      prizes: [
        { title: "Best Game", description: "Overall best game", amount: 4000, position: 1 },
        { title: "Runner Up", description: "Second best game", amount: 2500, position: 2 },
        { title: "Third Place", description: "Third best game", amount: 1500, position: 3 },
      ],
      stages: [
        { name: "Registration", type: "REGISTRATION" as const, order: 1, description: "Sign up", daysFromStart: -40, durationDays: 19, color: "#6366F1" },
        { name: "Theme Reveal", type: "IDEATION" as const, order: 2, description: "Theme announced!", daysFromStart: 0, durationDays: 0.1, color: "#8B5CF6" },
        { name: "Game Jam", type: "DEVELOPMENT" as const, order: 3, description: "48 hours to create", daysFromStart: 0.1, durationDays: 2, color: "#10B981" },
        { name: "Voting", type: "EVALUATION" as const, order: 4, description: "Community voting", daysFromStart: 2.1, durationDays: 5, color: "#F59E0B" },
        { name: "Results", type: "RESULTS" as const, order: 5, description: "Winners announced", daysFromStart: 9, durationDays: 0.1, color: "#EC4899" },
      ],
      judges: ["nina.petrova@gmail.com"],
      mentors: ["alex.rivera@gmail.com"],
    },
    {
      title: "IoT Smart Home Challenge",
      slug: "iot-smart-home-challenge",
      description: "Build the future of smart homes! Create innovative IoT solutions for home automation, energy efficiency, security, and accessibility. Hardware hackers and software developers unite!",
      shortDescription: "Build innovative smart home IoT solutions",
      orgSlug: "techventures",
      type: "OPEN" as const,
      mode: "HYBRID" as const,
      status: "DRAFT" as const,
      registrationStart: new Date("2026-06-01"),
      registrationEnd: new Date("2026-06-25"),
      hackathonStart: new Date("2026-07-10"),
      hackathonEnd: new Date("2026-07-12"),
      resultsDate: new Date("2026-07-20"),
      maxTeamSize: 4,
      minTeamSize: 2,
      maxParticipants: 150,
      prizePool: 20000,
      themes: ["IoT", "Smart Home", "Energy", "Accessibility"],
      tags: ["iot", "hardware", "arduino", "raspberry-pi", "home-automation"],
      rules: "1. Must include a hardware component.\n2. Code must be open source.\n3. Safety first!",
      eligibility: "Open to hardware and software developers.",
      allowSoloParticipants: false,
      requireApproval: true,
      isPublic: true,
      isFeatured: false,
      tracks: [
        { name: "Energy Efficiency", description: "Solutions for reducing energy consumption", prizeAmount: 6000, color: "#10B981" },
        { name: "Home Security", description: "Smart security solutions", prizeAmount: 5000, color: "#EF4444" },
        { name: "Accessibility", description: "Making homes more accessible", prizeAmount: 5000, color: "#3B82F6" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Best IoT project", amount: 8000, position: 1 },
        { title: "Second Place", description: "Runner-up", amount: 5000, position: 2 },
        { title: "Third Place", description: "Third place", amount: 3000, position: 3 },
      ],
      stages: [
        { name: "Applications", type: "REGISTRATION" as const, order: 1, description: "Apply to participate", daysFromStart: -39, durationDays: 24, color: "#6366F1" },
        { name: "Hardware Prep", type: "CUSTOM" as const, order: 2, description: "Receive hardware kits", daysFromStart: -7, durationDays: 7, color: "#8B5CF6" },
        { name: "Hacking", type: "DEVELOPMENT" as const, order: 3, description: "Build your solution", daysFromStart: 0, durationDays: 2, color: "#10B981" },
        { name: "Demo Day", type: "PRESENTATION" as const, order: 4, description: "Show off your creation", daysFromStart: 2, durationDays: 0.25, color: "#F59E0B" },
        { name: "Awards", type: "RESULTS" as const, order: 5, description: "Winners announced", daysFromStart: 10, durationDays: 0.1, color: "#EC4899" },
      ],
      judges: ["carlos.mendez@gmail.com", "sarah.kim@gmail.com"],
      mentors: ["kevin.zhang@gmail.com"],
    },
    {
      title: "Healthcare Innovation Hackathon",
      slug: "healthcare-innovation-hackathon",
      description: "Tackle the biggest challenges in healthcare! Work alongside doctors, nurses, and healthcare professionals to build solutions for patient care, medical records, telemedicine, and health equity.",
      shortDescription: "Build solutions for healthcare challenges",
      orgSlug: "code-for-good",
      type: "INVITE_ONLY" as const,
      mode: "VIRTUAL" as const,
      status: "PUBLISHED" as const,
      registrationStart: new Date("2026-03-15"),
      registrationEnd: new Date("2026-04-05"),
      hackathonStart: new Date("2026-04-18"),
      hackathonEnd: new Date("2026-04-20"),
      resultsDate: new Date("2026-04-27"),
      maxTeamSize: 5,
      minTeamSize: 2,
      maxParticipants: 200,
      prizePool: 30000,
      themes: ["Healthcare", "Telemedicine", "Patient Care", "Health Equity"],
      tags: ["healthcare", "medical", "hipaa", "telemedicine"],
      rules: "1. Solutions must consider HIPAA compliance.\n2. Partner with a healthcare professional.\n3. Focus on real-world applicability.",
      eligibility: "By invitation or application. Healthcare experience preferred but not required.",
      allowSoloParticipants: false,
      requireApproval: true,
      isPublic: false,
      isFeatured: false,
      tracks: [
        { name: "Patient Care", description: "Improving patient outcomes and experience", prizeAmount: 10000, color: "#EF4444" },
        { name: "Telemedicine", description: "Remote healthcare solutions", prizeAmount: 8000, color: "#3B82F6" },
        { name: "Health Equity", description: "Addressing healthcare disparities", prizeAmount: 8000, color: "#10B981" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Most impactful healthcare solution", amount: 12000, position: 1 },
        { title: "Second Place", description: "Runner-up", amount: 8000, position: 2 },
        { title: "Third Place", description: "Third place", amount: 5000, position: 3 },
      ],
      stages: [
        { name: "Application", type: "REGISTRATION" as const, order: 1, description: "Apply to participate", daysFromStart: -33, durationDays: 21, color: "#6366F1" },
        { name: "Orientation", type: "IDEATION" as const, order: 2, description: "Meet healthcare partners", daysFromStart: 0, durationDays: 0.25, color: "#8B5CF6" },
        { name: "Development", type: "DEVELOPMENT" as const, order: 3, description: "Build with mentors", daysFromStart: 0.25, durationDays: 1.5, color: "#10B981" },
        { name: "Final Presentations", type: "PRESENTATION" as const, order: 4, description: "Present to panel", daysFromStart: 1.75, durationDays: 0.25, color: "#F59E0B" },
        { name: "Results", type: "RESULTS" as const, order: 5, description: "Winners announced", daysFromStart: 9, durationDays: 0.1, color: "#EC4899" },
      ],
      judges: ["james.wilson@gmail.com"],
      mentors: ["priya.gupta@gmail.com", "aisha.mohammed@gmail.com"],
    },
    {
      title: "Mobile App Sprint",
      slug: "mobile-app-sprint-2026",
      description: "Build beautiful, functional mobile apps in just one weekend! iOS, Android, Flutter, React Native – all platforms welcome. Focus on creating apps that people actually want to use.",
      shortDescription: "Create mobile apps in a weekend",
      orgSlug: "stanford-innovation-lab",
      type: "OPEN" as const,
      mode: "VIRTUAL" as const,
      status: "REGISTRATION_OPEN" as const,
      registrationStart: new Date("2026-02-10"),
      registrationEnd: new Date("2026-02-25"),
      hackathonStart: new Date("2026-03-07"),
      hackathonEnd: new Date("2026-03-09"),
      resultsDate: new Date("2026-03-15"),
      maxTeamSize: 3,
      minTeamSize: 1,
      maxParticipants: 300,
      prizePool: 18000,
      themes: ["Mobile", "UX", "Productivity", "Social"],
      tags: ["mobile", "ios", "android", "flutter", "react-native"],
      rules: "1. Must be a mobile app (iOS, Android, or cross-platform).\n2. App must be demo-able on a device or emulator.\n3. Clean, intuitive UX is a priority.",
      eligibility: "Open to all mobile developers.",
      allowSoloParticipants: true,
      requireApproval: false,
      isPublic: true,
      isFeatured: false,
      tracks: [
        { name: "Best iOS App", description: "Best native iOS app", prizeAmount: 4000, color: "#6366F1" },
        { name: "Best Android App", description: "Best native Android app", prizeAmount: 4000, color: "#10B981" },
        { name: "Best Cross-Platform", description: "Best Flutter/React Native app", prizeAmount: 4000, color: "#F59E0B" },
      ],
      prizes: [
        { title: "Grand Prize", description: "Best mobile app overall", amount: 6000, position: 1 },
        { title: "Second Place", description: "Runner-up", amount: 4000, position: 2 },
        { title: "Third Place", description: "Third place", amount: 2500, position: 3 },
        { title: "Best UI/UX", description: "Most beautiful and usable app", amount: 2000, position: 4 },
      ],
      stages: [
        { name: "Registration", type: "REGISTRATION" as const, order: 1, description: "Sign up", daysFromStart: -25, durationDays: 15, color: "#6366F1" },
        { name: "Kickoff", type: "IDEATION" as const, order: 2, description: "Start building!", daysFromStart: 0, durationDays: 0.1, color: "#8B5CF6" },
        { name: "Development", type: "DEVELOPMENT" as const, order: 3, description: "Build your app", daysFromStart: 0.1, durationDays: 1.9, color: "#10B981" },
        { name: "Submission", type: "CHECKPOINT" as const, order: 4, description: "Submit your app", daysFromStart: 2, durationDays: 0.25, requiresSubmission: true, color: "#F59E0B" },
        { name: "Judging", type: "EVALUATION" as const, order: 5, description: "Apps reviewed", daysFromStart: 2.25, durationDays: 4, color: "#EF4444" },
        { name: "Results", type: "RESULTS" as const, order: 6, description: "Winners announced", daysFromStart: 8, durationDays: 0.1, color: "#EC4899" },
      ],
      judges: ["alex.rivera@gmail.com", "emily.chen@gmail.com"],
      mentors: ["sujal@gmail.com"],
    },
  ];
  
  for (const hackathon of hackathonData) {
    const { tracks, prizes, stages, judges, mentors, orgSlug, ...hackathonFields } = hackathon;
    
    // Get organization
    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });
    
    if (!org) {
      console.log(`  ⚠️ Skipping ${hackathon.title} - organization ${orgSlug} not found`);
      continue;
    }
    
    // Check if hackathon already exists
    const existingHackathon = await prisma.hackathon.findUnique({
      where: { slug: hackathon.slug },
    });
    
    if (existingHackathon) {
      console.log(`  ℹ️ Hackathon already exists: ${hackathon.title}`);
      continue;
    }
    
    // Create hackathon
    const createdHackathon = await prisma.hackathon.create({
      data: {
        ...hackathonFields,
        organizationId: org.id,
        tracks: {
          create: tracks,
        },
        prizes: {
          create: prizes,
        },
        stages: {
          create: stages.map(stage => ({
            name: stage.name,
            type: stage.type,
            order: stage.order,
            description: stage.description,
            color: stage.color,
            startDate: new Date(hackathon.hackathonStart.getTime() + stage.daysFromStart * 24 * 60 * 60 * 1000),
            endDate: new Date(hackathon.hackathonStart.getTime() + (stage.daysFromStart + stage.durationDays) * 24 * 60 * 60 * 1000),
            requiresSubmission: stage.requiresSubmission || false,
          })),
        },
      },
    });
    
    // Add judges
    for (const judgeEmail of judges) {
      const judgeId = createdUsers[judgeEmail];
      if (judgeId) {
        await prisma.hackathonRole.create({
          data: {
            hackathonId: createdHackathon.id,
            userId: judgeId,
            role: "JUDGE",
            status: "ACCEPTED",
            acceptedAt: new Date(),
            expertise: ["Technical Review", "Innovation"],
          },
        });
      }
    }
    
    // Add mentors
    for (const mentorEmail of mentors) {
      const mentorId = createdUsers[mentorEmail];
      if (mentorId) {
        await prisma.hackathonRole.create({
          data: {
            hackathonId: createdHackathon.id,
            userId: mentorId,
            role: "MENTOR",
            status: "ACCEPTED",
            acceptedAt: new Date(),
            expertise: ["Technical Guidance", "Project Planning"],
          },
        });
      }
    }
    
    console.log(`  ✅ Created hackathon: ${createdHackathon.title} (${tracks.length} tracks, ${prizes.length} prizes, ${stages.length} stages)`);
  }
  
  console.log(`\n🎉 Seed completed! Processed ${userData.length} users, ${organizationData.length} organizations, and ${hackathonData.length} hackathons.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });