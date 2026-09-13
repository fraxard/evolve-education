export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

export interface DifferentiatorCard {
  id: string;
  number: string;
  title: string;
  description: string;
  accentColor: 'leaf' | 'blue' | 'yellow' | 'purple';
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  ageGroup?: string;
  highlights: string[];
  primaryCta: string;
  secondaryCta: string;
  accentColor: string;
}

export interface MethodologyStep {
  step: string;
  number: string;
  title: string;
  description: string;
  accentColor: string;
}

export interface BenefitPoint {
  title: string;
  description: string;
}

export interface LearningPillar {
  title: string;
  description: string;
  iconName: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactDetails {
  email?: string;
  phone?: string;
  location?: string;
  hours?: string;
}

export const siteContent = {
  brand: {
    name: 'Evolve Education',
    tagline: 'Small Steps. Brighter Futures.',
    eyebrow: 'Learning made brighter.',
    logoSrc: '/assets/Evolve education logo.png',
    logoAlt: 'Evolve Education - Small Steps. Brighter Futures.'
  },

  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#why-us' },
    {
      label: 'Programs',
      href: '#programs',
      children: [
        {
          label: 'Abacus',
          href: '#abacus-program',
          description: 'Our Abacus learning program'
        },
        {
          label: 'All Programs',
          href: '#programs',
          description: 'Explore our educational programs'
        }
      ]
    },
    { label: 'Methodology', href: '#methodology' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Experience', href: '#learning-experience' },
    { label: 'FAQs', href: '#faq' },
    { label: 'Contact', href: '#contact' }
  ] as NavItem[],

  hero: {
    eyebrow: 'Learning made brighter.',
    headline: 'Small Steps.\nBrighter Futures.',
    supportingCopy: 'Helping children build mathematical thinking, concentration and confidence through engaging Abacus learning.',
    primaryCta: {
      label: 'Explore Abacus',
      href: '#abacus-program'
    },
    secondaryCta: {
      label: 'Enquire Now',
      href: '#contact'
    },
    trustBadges: [
      'Personalized Learning Support',
      'Dedicated Academic Mentors',
      'Step-by-Step Skill Growth'
    ]
  },

  whyChooseUs: {
    sectionNumber: '02',
    heading: 'Why Choose Our Educational Framework',
    subheading: 'A thoughtful approach designed to encourage curious minds and build lasting learning habits.',
    cards: [
      {
        id: 'personalized',
        number: '01',
        title: 'Personalized Learning',
        description: 'Learning support shaped around each child’s needs and pace.',
        accentColor: 'leaf',
        badgeBg: 'bg-[#EBF3E5]',
        badgeText: 'text-[#55723B]',
        borderColor: 'border-[#678A48]/30'
      },
      {
        id: 'focused',
        number: '02',
        title: 'Focused Practice',
        description: 'Structured activities that encourage attention and consistent practice.',
        accentColor: 'blue',
        badgeBg: 'bg-[#EBF1FA]',
        badgeText: 'text-[#2A436C]',
        borderColor: 'border-[#38588C]/30'
      },
      {
        id: 'interactive',
        number: '03',
        title: 'Interactive Approach',
        description: 'Engaging learning activities designed to keep children actively involved.',
        accentColor: 'yellow',
        badgeBg: 'bg-[#FAF6DF]',
        badgeText: 'text-[#968228]',
        borderColor: 'border-[#CFB850]/40'
      },
      {
        id: 'progressive',
        number: '04',
        title: 'Progressive Learning',
        description: 'Skills introduced step by step as learners build confidence.',
        accentColor: 'purple',
        badgeBg: 'bg-[#F2EDFB]',
        badgeText: 'text-[#6F4FB0]',
        borderColor: 'border-[#8F6BD4]/30'
      }
    ] as DifferentiatorCard[]
  },

  featuredPrograms: {
    sectionNumber: '03',
    eyebrow: 'OUR PROGRAM',
    heading: 'Discover the Evolve Abacus Program',
    subheading: 'Build concentration, confidence and mathematical thinking through structured, engaging Abacus learning.',
    programs: [
      {
        id: 'abacus',
        title: 'Abacus',
        subtitle: 'Mental Arithmetic & Cognitive Focus',
        description: 'Our structured Abacus curriculum guides students through tactile and visual calculation techniques, developing strong number sense, deep concentration, and mental arithmetic fluency.',
        highlights: [
          'Number sense & calculation',
          'Concentration & focus',
          'Mental arithmetic practice',
          'Confidence through progressive learning'
        ],
        primaryCta: 'Explore Abacus',
        secondaryCta: 'Enquire Now',
        accentColor: '#678A48'
      }
    ] as ProgramItem[],
    allProgramsInfo: {
      title: 'All Programs',
      countLabel: '1 Program Available',
      note: 'Additional specialized learning programs will be announced as our curriculum expands.'
    }
  },

  methodology: {
    sectionNumber: '04',
    heading: 'A Proven 4-Step Academic Process',
    subheading: 'A continuous cycle of assessment, customized planning, engaging instruction, and verified achievement.',
    steps: [
      {
        step: 'Stage 01',
        number: '01',
        title: 'Diagnostic & Assessment',
        description: 'Evaluating current baseline & student goals.',
        accentColor: '#678A48'
      },
      {
        step: 'Stage 02',
        number: '02',
        title: 'Custom Pathway',
        description: 'Tailoring curriculum and pacing schedule.',
        accentColor: '#38588C'
      },
      {
        step: 'Stage 03',
        number: '03',
        title: 'Interactive Learning',
        description: 'Active participation and guided application.',
        accentColor: '#D88B33'
      },
      {
        step: 'Stage 04',
        number: '04',
        title: 'Progress & Mastery',
        description: 'Continuous evaluation and outcome validation.',
        accentColor: '#8F6BD4'
      }
    ] as MethodologyStep[]
  },

  benefits: {
    sectionNumber: '05',
    eyebrow: 'Core Focus',
    heading: 'Building Skills That Grow With Your Child',
    subheading: 'Our Abacus approach focuses on developing core cognitive and mathematical abilities that support lifelong learning.',
    points: [
      {
        title: 'Number Sense',
        description: 'Developing a stronger understanding of numbers and calculation.'
      },
      {
        title: 'Concentration',
        description: 'Encouraging focused, consistent learning practice.'
      },
      {
        title: 'Mental Calculation',
        description: 'Building familiarity and confidence with mental arithmetic.'
      },
      {
        title: 'Confidence',
        description: 'Helping children approach learning with greater independence.'
      }
    ] as BenefitPoint[]
  },

  learningExperience: {
    sectionNumber: '06',
    eyebrow: 'Learning Environment',
    heading: 'What Learning at Evolve Looks Like',
    subheading: 'A purposeful learning environment built around clarity, active practice, and supportive mentoring.',
    pillars: [
      {
        title: 'Focused Learning',
        description: 'Structured practice designed to help children stay engaged.',
        iconName: 'Target'
      },
      {
        title: 'Progressive Learning',
        description: 'Skills build step by step from foundational concepts toward greater confidence.',
        iconName: 'TrendingUp'
      },
      {
        title: 'Encouraging Environment',
        description: 'A positive learning environment where children can learn, practise and grow.',
        iconName: 'HeartHandshake'
      }
    ] as LearningPillar[]
  },

  faq: {
    sectionNumber: '07',
    heading: 'Common Enquiries & Answers',
    subheading: 'Clear details on our learning approach, schedule flexibility, and enrollment roadmap.',
    items: [
      {
        question: 'What age groups and grade levels do you support?',
        answer: 'Our Abacus program is designed for learners within the age and grade groups currently served by Evolve Education. Contact us to confirm the appropriate level for your child.'
      },
      {
        question: 'How are classes scheduled and conducted?',
        answer: 'Classes are organized in structured, interactive learning sessions. Contact Evolve Education to learn about current batch timings and available options.'
      },
      {
        question: 'How does the admission and enrollment process work?',
        answer: 'Begin by contacting Evolve Education for an initial consultation. Our team can then guide you through the appropriate Abacus learning option and enrollment process.'
      },
      {
        question: 'What makes the Evolve Education methodology unique?',
        answer: 'Our approach unites small-step micro-goals with personalized mentoring, building both conceptual mastery and lasting self-assurance in young learners.'
      }
    ] as FaqItem[]
  },

  contact: {
    sectionNumber: '08',
    heading: 'Ready to Begin Your Educational Journey?',
    subheading: 'Get in touch with our team to learn more about the Abacus program, current batches and enrollment.',
    leadText: 'Contact Evolve Education to discuss your child’s learning path and schedule an initial consultation.',
    contactDetails: {} as ContactDetails,
    programOptions: [
      'Abacus',
      'General Consultation'
    ]
  },

  footer: {
    tagline: 'Small Steps. Brighter Futures.',
    mission: 'Empowering education through structured learning.',
    copyright: '© 2026 Evolve Education. All rights reserved.',
    quickLinks: [
      { label: 'Home', href: '#home' },
      { label: 'About Us', href: '#why-us' },
      { label: 'Methodology', href: '#methodology' },
      { label: 'Experience', href: '#learning-experience' },
      { label: 'FAQs', href: '#faq' }
    ],
    programs: [
      { label: 'Abacus', href: '#abacus-program' },
      { label: 'All Programs', href: '#programs' }
    ]
  }
};
