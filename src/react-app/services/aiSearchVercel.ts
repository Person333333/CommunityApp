// AI Service for Vercel deployment using environment variables
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AISearchResult {
  query: string;
  recommendations: string[];
  explanation: string;
  categories: string[];
  confidence: number;
}

export interface ResourceContext {
  title: string;
  description: string;
  category: string;
  tags?: string | null;
  services?: string | null;
}

export class AISearchService {
  private model: any = null;
  private initialized = false;

  constructor() {
    // Initialize Gemini AI with environment variable for browser
    // For Vercel, use import.meta.env
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    console.log('AI Service - API Key found:', !!apiKey);
    console.log('AI Service - API Key length:', apiKey?.length || 0);
    
    if (apiKey && apiKey !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.initialized = true;
        console.log('AI Service - Gemini initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize Gemini AI:', error);
        this.initialized = false;
        console.log('AI Service - Using keyword matching fallback only');
      }
    } else {
      console.warn('No valid Gemini API key found');
      this.initialized = false;
      console.log('AI Service - Using keyword matching fallback only');
    }
  }

  /**
   * Generate AI-powered search recommendations based on user query
   */
  async generateSearchRecommendations(
    query: string, 
    _resourceContext?: ResourceContext[]
  ): Promise<AISearchResult> {
    try {
      // Check if AI service is available
      if (!this.model) {
        return {
          query,
          recommendations: this.getFallbackRecommendations(query),
          explanation: 'Using intelligent keyword matching to find resources that match your description.',
          categories: this.extractCategoriesFromQuery(query),
          confidence: 0.6
        };
      }

      // Skip AI calls for now since they're failing, use keyword matching
      return {
        query,
        recommendations: this.getFallbackRecommendations(query),
        explanation: 'Using intelligent keyword matching to find resources that match your description.',
        categories: this.extractCategoriesFromQuery(query),
        confidence: 0.6
      };

    } catch (error) {
      console.error('AI Search Error:', error);
      
      // Fallback to keyword matching
      return {
        query,
        recommendations: this.getFallbackRecommendations(query),
        explanation: 'Using intelligent keyword matching to find resources that match your description.',
        categories: this.extractCategoriesFromQuery(query),
        confidence: 0.4
      };
    }
  }

  /**
   * Fallback recommendations using keyword matching
   */
  private getFallbackRecommendations(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const recommendations: string[] = [];

    // Keyword-based recommendations
    const keywordMap: Record<string, string[]> = {
      'food': [
        'Found food assistance resources including food banks and meal programs',
        'Showing resources that offer free groceries and hot meals',
        'Displaying food pantries and community food distribution programs'
      ],
      'health': [
        'Found healthcare resources including clinics and medical services',
        'Showing free clinics and community health centers',
        'Displaying medical assistance and healthcare programs'
      ],
      'housing': [
        'Found housing resources including shelters and housing assistance',
        'Showing emergency shelters and transitional housing programs',
        'Displaying rent assistance and housing support services'
      ],
      'job': [
        'Found employment resources including job centers and career services',
        'Showing resume help and job placement services',
        'Displaying vocational training and skill development programs'
      ],
      'money': [
        'Found financial assistance resources for bills and expenses',
        'Showing bill payment assistance and financial counseling',
        'Displaying emergency financial aid programs'
      ],
      'mental': [
        'Found mental health resources including counseling and therapy',
        'Showing support groups and mental health services',
        'Displaying crisis hotlines and counseling programs'
      ]
    };

    // Find matching keywords
    for (const [keyword, recs] of Object.entries(keywordMap)) {
      if (lowerQuery.includes(keyword)) {
        recommendations.push(...recs);
      }
    }

    // If no specific matches, provide general recommendations
    if (recommendations.length === 0) {
      if (query.trim() === '') {
        recommendations.push(
          'Type what you need help with in the search bar',
          'Try keywords like "food", "health", "housing", or "jobs"',
          'Be specific about what kind of assistance you need'
        );
      } else {
        recommendations.push(
          'Searching for resources that match your description',
          'Finding relevant community resources for your needs',
          'Displaying matching resources and assistance programs'
        );
      }
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  /**
   * Extract relevant categories from a natural language query
   */
  private extractCategoriesFromQuery(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const categories: string[] = [];

    // Food-related keywords
    if (lowerQuery.includes('food') || lowerQuery.includes('hungry') || lowerQuery.includes('meal') || lowerQuery.includes('grocer')) {
      categories.push('Food Assistance');
    }

    // Health-related keywords
    if (lowerQuery.includes('health') || lowerQuery.includes('doctor') || lowerQuery.includes('medical') || lowerQuery.includes('clinic')) {
      categories.push('Healthcare');
    }

    // Housing-related keywords
    if (lowerQuery.includes('housing') || lowerQuery.includes('shelter') || lowerQuery.includes('home') || lowerQuery.includes('rent')) {
      categories.push('Housing');
    }

    // Employment-related keywords
    if (lowerQuery.includes('job') || lowerQuery.includes('work') || lowerQuery.includes('employ') || lowerQuery.includes('career')) {
      categories.push('Employment');
    }

    // Mental health keywords
    if (lowerQuery.includes('mental') || lowerQuery.includes('therapy') || lowerQuery.includes('counsel') || lowerQuery.includes('depress')) {
      categories.push('Mental Health');
    }

    // Financial keywords - be more specific
    if (lowerQuery.includes('money') || lowerQuery.includes('bill') || lowerQuery.includes('pay') || lowerQuery.includes('financial')) {
      categories.push('Financial Assistance');
    }

    // Education keywords
    if (lowerQuery.includes('education') || lowerQuery.includes('learn') || lowerQuery.includes('class') || lowerQuery.includes('school')) {
      categories.push('Education');
    }

    // Transportation keywords
    if (lowerQuery.includes('transport') || lowerQuery.includes('ride') || lowerQuery.includes('bus') || lowerQuery.includes('travel')) {
      categories.push('Transportation');
    }

    // Child care keywords
    if (lowerQuery.includes('child') || lowerQuery.includes('kid') || lowerQuery.includes('daycare') || lowerQuery.includes('babysit')) {
      categories.push('Child Care');
    }

    // Senior services keywords
    if (lowerQuery.includes('senior') || lowerQuery.includes('elder') || lowerQuery.includes('older') || lowerQuery.includes('retire')) {
      categories.push('Senior Services');
    }

    // Legal aid keywords
    if (lowerQuery.includes('legal') || lowerQuery.includes('lawyer') || lowerQuery.includes('court') || lowerQuery.includes('attorney')) {
      categories.push('Legal Aid');
    }

    // Veterans keywords
    if (lowerQuery.includes('veteran') || lowerQuery.includes('military') || lowerQuery.includes('army') || lowerQuery.includes('navy')) {
      categories.push('Veterans Services');
    }

    // If no specific keywords found and query is empty or generic, don't suggest Financial Assistance
    if (categories.length === 0 && (query.trim() === '' || lowerQuery.includes('help') || lowerQuery.includes('resource'))) {
      return []; // Return empty array instead of defaulting to Financial Assistance
    }

    return categories;
  }

  /**
   * Generate contextual help messages
   */
  async generateHelpMessage(context: string): Promise<string> {
    try {
      if (!this.model) {
        return this.getFallbackHelpMessage(context);
      }

      // Skip AI calls for now since they're failing, use keyword matching
      return this.getFallbackHelpMessage(context);

    } catch (error) {
      console.error('Help Message Error:', error);
      return this.getFallbackHelpMessage(context);
    }
  }

  /**
   * Fallback help messages using keyword matching
   */
  private getFallbackHelpMessage(context: string): string {
    const lowerContext = context.toLowerCase();

    // Comprehensive keyword-based help responses
    const helpResponses: Record<string, string[]> = {
      // Search and navigation
      'search': [
        'Use the search bar to find resources by keywords like "food", "health", or "housing"',
        'Try combining search terms with category filters for better results',
        'Use the AI search button for intelligent recommendations based on your needs',
        'Search works with partial words - try "hungry" for food assistance or "doctor" for healthcare'
      ],
      'find': [
        'Click the search bar and type what you need help with',
        'Use category filters to narrow down to specific types of help',
        'The AI button can suggest categories based on what you describe',
        'Try the map view to see resources near your location'
      ],
      'look': [
        'Use the search bar at the top of the page',
        'Browse by category using the filter options',
        'Check the map tab for geographic resource locations',
        'Click the AI button for personalized recommendations'
      ],
      
      // Filters and categories
      'filter': [
        'Click the filter button to see category options like Food, Healthcare, Housing',
        'You can select multiple categories to broaden your search results',
        'Use the local filter to show resources near your current location',
        'Clear filters by clicking the "Clear filters" button'
      ],
      'categor': [
        'Categories include Food Assistance, Healthcare, Housing, Employment, Education, and more',
        'Select multiple categories to see all relevant resources',
        'AI can suggest categories based on your search terms',
        'Use category filters to narrow down to exactly what you need'
      ],
      'type': [
        'Filter by resource type: food banks, clinics, shelters, job centers, etc.',
        'Each category has specific resources for different needs',
        'Try combining categories if you need multiple types of assistance',
        'The AI button can help identify the right categories for your situation'
      ],
      
      // Map and location
      'map': [
        'Click the map tab to see resources geographically displayed',
        'Zoom in to see more resources in your specific area',
        'Click on map markers (pins) to see resource details and contact info',
        'The map shows resources within your local radius by default'
      ],
      'location': [
        'Enable location services to see resources near you',
        'Use the "Local only" filter to show nearby resources',
        'Map view helps you find the closest resources to your location',
        'Resources show distance from your current location when available'
      ],
      'near': [
        'Use the "Local only" filter to find nearby resources',
        'The map shows resources within your geographic area',
        'Enable location services for the most accurate nearby results',
        'Contact resources directly to confirm their current availability'
      ],
      
      // Favorites and saving
      'favorite': [
        'Click the heart icon on any resource to save it as a favorite',
        'View your favorites by clicking the favorites filter option',
        'Favorites are saved to your account for easy access later',
        'Sign in to sync your favorites across all your devices'
      ],
      'save': [
        'Click the heart icon to save resources you want to remember',
        'Sign in with Clerk to save your favorites permanently',
        'Access your saved favorites anytime from any device',
        'Use favorites to keep track of resources you plan to contact'
      ],
      'heart': [
        'The heart icon lets you favorite resources for later',
        'Click the heart again to remove from favorites',
        'Sign in to keep your favorites saved permanently',
        'Favorites help you track resources you want to contact'
      ],
      
      // Account and sign in
      'account': [
        'Sign in with Clerk to save favorites and get personalized features',
        'Your account syncs across devices for saved preferences',
        'Create a free account using email or Google sign-in',
        'Sign in is required to save favorites and access all features'
      ],
      'sign': [
        'Click "Sign In" to create an account or log in',
        'Use email, Google, or other available sign-in methods',
        'Account is free and only takes a moment to create',
        'Sign in to save favorites and get personalized recommendations'
      ],
      'login': [
        'Sign in to save your favorites and preferences',
        'Your account works across all your devices',
        'Free sign-in with email or social accounts',
        'Sign in required for favorites and personalized features'
      ],
      
      // Specific resource types - Food
      'food': [
        'Search "Food Assistance" to find food banks, pantries, and meal programs',
        'Many resources offer free groceries and hot meals for those in need',
        'Check each resource for eligibility requirements and distribution schedules',
        'Contact food banks directly to confirm current availability and requirements'
      ],
      'hungry': [
        'Food assistance programs offer free meals and groceries',
        'Food banks and pantries provide emergency food supplies',
        'Many locations require ID or proof of need - call ahead to confirm',
        'Some resources offer same-day food assistance for urgent needs'
      ],
      'meal': [
        'Meal programs serve hot meals at specific times and locations',
        'Soup kitchens and community centers often provide daily meals',
        'Check serving times and any requirements before visiting',
        'Many meal programs are free and open to anyone in need'
      ],
      'grocer': [
        'Food pantries provide free groceries for home preparation',
        'Many offer fresh produce, canned goods, and basic staples',
        'Distribution schedules vary - call ahead for availability',
        'Some pantries require appointments, others are walk-in'
      ],
      
      // Healthcare
      'health': [
        'Search "Healthcare" for free clinics, medical services, and health programs',
        'Many clinics offer free or low-cost services regardless of insurance status',
        'Call ahead to confirm availability and any required documentation',
        'Some clinics provide walk-in services, others require appointments'
      ],
      'doctor': [
        'Free clinics and community health centers provide medical care',
        'Many offer sliding scale fees based on income',
        'Call to confirm what services are available and requirements',
        'Some clinics specialize in specific types of medical care'
      ],
      'medical': [
        'Community health centers provide affordable medical services',
        'Many offer preventive care, treatment, and health education',
        'Check if you need to bring ID, income proof, or other documents',
        'Some clinics provide dental, vision, and mental health services too'
      ],
      'clinic': [
        'Free and low-cost clinics provide medical care for uninsured/underinsured',
        'Services often include primary care, preventive care, and specialist referrals',
        'Wait times can be long - call ahead or arrive early',
        'Some clinics require appointments, others accept walk-ins'
      ],
      
      // Housing
      'housing': [
        'Search "Housing" for emergency shelters, transitional housing, and rent assistance',
        'Emergency shelters provide immediate temporary housing',
        'Contact housing programs directly for current availability and requirements',
        'Many programs have waiting lists - apply as soon as possible'
      ],
      'shelter': [
        'Emergency shelters provide immediate temporary housing',
        'Most require check-in at specific times and have rules for residents',
        'Call ahead to confirm bed availability and intake requirements',
        'Some shelters specialize for families, women, or other specific groups'
      ],
      'rent': [
        'Rent assistance programs help with housing costs and prevent eviction',
        'Many programs have income requirements and application deadlines',
        'Contact programs quickly as funds are often limited',
        'Bring documentation of income, expenses, and housing situation'
      ],
      'home': [
        'Housing assistance includes emergency shelters and long-term solutions',
        'Transitional housing provides temporary support while finding permanent housing',
        'Many programs require case management and participation in services',
        'Apply to multiple programs as waiting lists are common'
      ],
      
      // Employment
      'job': [
        'Search "Employment" for job centers, career services, and employment programs',
        'Get help with resumes, job applications, and interview preparation',
        'Many centers offer free computer access for job searching',
        'Some programs provide job training and skill development'
      ],
      'work': [
        'Employment centers help with job searching, applications, and interviews',
        'Many offer resume writing assistance and career counseling',
        'Some provide professional clothing for interviews',
        'Check eligibility requirements as some programs have income or other criteria'
      ],
      'employ': [
        'Job placement services connect job seekers with employers',
        'Many centers specialize in specific industries or types of work',
        'Some offer vocational training and certification programs',
        'Career counseling can help identify job opportunities matching your skills'
      ],
      'career': [
        'Career services provide guidance for job searching and professional development',
        'Get help identifying career paths and required skills',
        'Many offer training programs to improve job qualifications',
        'Career counselors can help with resume building and interview skills'
      ],
      
      // Financial assistance
      'money': [
        'Search "Financial Assistance" for help with bills, expenses, and emergency costs',
        'Programs offer help with utilities, rent, and other essential expenses',
        'Contact programs quickly as funding is often limited',
        'Bring required documentation like ID, income proof, and expense records'
      ],
      'bill': [
        'Bill payment assistance helps with utilities, rent, and other essential costs',
        'Many programs have income requirements and application deadlines',
        'Contact utility companies directly about payment plans and assistance programs',
        'Some organizations provide emergency financial assistance for urgent needs'
      ],
      'pay': [
        'Financial assistance programs help with various expenses and bills',
        'Eligibility often based on income, family size, and specific circumstances',
        'Apply to multiple programs as each has different requirements and funding',
        'Some programs provide one-time help, others offer ongoing assistance'
      ],
      'assist': [
        'Financial assistance helps with bills, rent, utilities, and emergency expenses',
        'Many programs require proof of income, expenses, and household information',
        'Apply early as programs often have limited funding and waiting lists',
        'Case managers can help identify and apply for appropriate assistance programs'
      ],
      
      // Transportation
      'transport': [
        'Search "Transportation" for ride services, transit help, and transportation assistance',
        'Many programs offer free rides to medical appointments and essential services',
        'Check scheduling requirements and booking procedures in advance',
        'Some services specialize in medical transport or disability transportation'
      ],
      'ride': [
        'Free ride services help with transportation to medical appointments and essential services',
        'Many require advance booking - call at least 24-48 hours ahead',
        'Check if services are available in your specific area',
        'Some specialize in medical transport, others for general transportation needs'
      ],
      'bus': [
        'Transit assistance programs help with bus passes and transportation costs',
        'Many offer reduced fare programs for seniors, students, and low-income individuals',
        'Check eligibility requirements and application procedures',
        'Some provide free transportation to specific services like medical appointments'
      ],
      'travel': [
        'Transportation assistance helps with getting to medical appointments and essential services',
        'Many programs require advance scheduling and have specific service areas',
        'Check availability for your specific transportation needs',
        'Some services offer door-to-door transportation for mobility-impaired individuals'
      ],
      
      // Mental health
      'mental': [
        'Search "Mental Health" for counseling, therapy, and support services',
        'Free and low-cost counseling options are available through community mental health centers',
        'Crisis hotlines provide 24/7 support for urgent mental health needs',
        'Many providers offer sliding scale fees based on income'
      ],
      'therapy': [
        'Counseling and therapy services are available at community mental health centers',
        'Many offer free or low-cost services based on income',
        'Some specialize in specific issues like trauma, addiction, or family counseling',
        'Call ahead to confirm availability and intake procedures'
      ],
      'counsel': [
        'Mental health counseling provides support for emotional and psychological issues',
        'Community mental health centers offer affordable counseling services',
        'Some provide individual, group, and family therapy options',
        'Crisis counseling is available 24/7 through hotlines and emergency services'
      ],
      'depress': [
        'Mental health support is available for depression, anxiety, and other conditions',
        'Free counseling services are available through community mental health centers',
        'Crisis hotlines provide immediate support for urgent mental health needs',
        'Many providers offer specialized treatment for depression and related conditions'
      ],
      
      // Education
      'education': [
        'Search "Education" for learning programs, GED classes, and educational resources',
        'Many programs offer free classes for basic skills, GED preparation, and job training',
        'Check class schedules and enrollment requirements',
        'Some programs provide childcare and transportation assistance'
      ],
      'learn': [
        'Educational programs offer classes for basic skills, GED, and job training',
        'Many are free or low-cost for adults seeking to improve their skills',
        'Check enrollment requirements and class schedules',
        'Some programs offer flexible scheduling for working adults'
      ],
      'class': [
        'Educational classes include GED preparation, basic skills, and job training',
        'Many programs offer free classes for adult learners',
        'Check enrollment requirements and class availability',
        'Some provide childcare and support services for students'
      ],
      'school': [
        'Educational programs include GED classes, basic skills, and job training',
        'Many community organizations offer free educational services',
        'Check enrollment requirements and class schedules',
        'Some programs provide help with transportation and childcare'
      ],
      
      // Child care
      'child': [
        'Search "Child Care" for daycare, babysitting services, and child care assistance',
        'Many programs offer subsidized child care for low-income families',
        'Check licensing, hours, and enrollment requirements',
        'Some providers offer sliding scale fees based on income'
      ],
      'kid': [
        'Child care assistance helps with daycare costs and babysitting services',
        'Many programs offer subsidized rates for qualifying families',
        'Check provider qualifications, licensing, and safety records',
        'Some organizations provide emergency child care for urgent needs'
      ],
      'daycare': [
        'Child care centers provide supervised care for children while parents work',
        'Many offer sliding scale fees based on family income',
        'Check licensing, staff qualifications, and child-to-staff ratios',
        'Some provide meals, educational activities, and transportation'
      ],
      'babysit': [
        'Babysitting services provide temporary child care for various needs',
        'Check caregiver qualifications, experience, and references',
        'Many community organizations offer low-cost babysitting programs',
        'Some provide emergency babysitting for urgent situations'
      ],
      
      // Senior services
      'senior': [
        'Search "Senior Services" for programs specifically for older adults',
        'Services include meals, transportation, healthcare, and social activities',
        'Many programs are specifically designed for adults 60+ years old',
        'Check eligibility requirements and service availability in your area'
      ],
      'elder': [
        'Senior services provide specialized support for older adults',
        'Programs include meal delivery, transportation, and healthcare assistance',
        'Many centers offer social activities and wellness programs',
        'Check age requirements and service availability'
      ],
      'older': [
        'Services for older adults include meals, healthcare, and social support',
        'Many programs specifically serve adults 60 years and older',
        'Check eligibility requirements and enrollment procedures',
        'Some services are free, others based on income level'
      ],
      'retire': [
        'Senior services provide support for retired and older adults',
        'Programs include social activities, meals, and healthcare assistance',
        'Many centers offer wellness programs and educational classes',
        'Check age requirements and available services in your area'
      ],
      
      // Legal aid
      'legal': [
        'Search "Legal Aid" for free legal assistance and legal services',
        'Many organizations provide free legal help for civil legal issues',
        'Check eligibility requirements - often based on income and case type',
        'Some specialize in specific areas like housing, family, or immigration law'
      ],
      'lawyer': [
        'Legal aid organizations provide free legal services for qualifying individuals',
        'Many help with housing, family, employment, and consumer legal issues',
        'Check income requirements and types of cases handled',
        'Some offer legal clinics and self-help resources'
      ],
      'court': [
        'Legal aid services help with court appearances and legal procedures',
        'Many provide assistance with specific types of legal cases',
        'Check if they handle your type of legal issue',
        'Some offer help with paperwork and court preparation'
      ],
      'attorney': [
        'Free legal assistance is available through legal aid organizations',
        'Many provide help with housing, family, and consumer legal issues',
        'Check eligibility requirements and case types handled',
        'Some offer specialized legal clinics and workshops'
      ],
      
      // Veterans services
      'veteran': [
        'Search "Veterans Services" for programs specifically for military veterans',
        'Services include healthcare, housing, employment, and benefits assistance',
        'Many programs require proof of military service',
        'Contact VA and local veteran organizations for available services'
      ],
      'military': [
        'Veterans services provide specialized support for former military personnel',
        'Programs include healthcare, housing, employment, and education benefits',
        'Check eligibility requirements and documentation needed',
        'Many organizations help navigate VA benefits and services'
      ],
      'army': [
        'Veterans services support former Army and military personnel',
        'Programs include healthcare, education benefits, and employment assistance',
        'Check VA eligibility requirements and available benefits',
        'Many veteran organizations provide additional support services'
      ],
      'navy': [
        'Veterans services support former Navy and military personnel',
        'Programs include healthcare, housing, and employment assistance',
        'Check VA benefits eligibility and application procedures',
        'Many organizations help veterans access earned benefits'
      ],
      
      // How-to questions
      'how': [
        'Use the search bar and filters to find what you need',
        'Click on any resource to see details, contact information, and directions',
        'Use the map view to see resources near your location',
        'Click the AI button for personalized recommendations based on your needs'
      ],
      'use': [
        'Search by typing keywords in the search bar, then filter by categories',
        'Click on resources to see details like hours, requirements, and contact info',
        'Use the map tab to see resources geographically near you',
        'Save favorites by clicking the heart icon on any resource'
      ],
      
      // What questions
      'what': [
        'This app helps you find community resources like food, housing, healthcare, and more',
        'Browse categories or search for specific needs like "food assistance" or "job help"',
        'All resources are verified and regularly updated for accuracy',
        'Use the AI button to get personalized recommendations based on your situation'
      ],
      'app': [
        'This community resource app helps find local assistance programs and services',
        'Search for specific needs or browse categories like Food, Healthcare, Housing',
        'Click resources to see details, contact information, and directions',
        'Save favorites and use the map to find resources near you'
      ],
      
      // Emergency situations
      'emergency': [
        'For immediate life-threatening emergencies, call 911 or local emergency services',
        'Some resources offer emergency food, shelter, and financial assistance',
        'Crisis hotlines provide 24/7 support for urgent mental health needs',
        'Contact emergency shelters directly for immediate housing needs'
      ],
      'urgent': [
        'For urgent needs, call resources directly to confirm availability',
        'Emergency food assistance and shelters may have same-day availability',
        'Crisis hotlines provide immediate support for mental health emergencies',
        'Some programs offer emergency financial assistance for urgent situations'
      ],
      'crisis': [
        'For crisis situations, call 911 for immediate emergencies',
        'Crisis hotlines provide 24/7 mental health support',
        'Emergency shelters may have immediate availability for housing crises',
        'Some organizations offer crisis intervention and immediate assistance'
      ],
      
      // Contact and help
      'contact': [
        'Click on any resource to see phone numbers, addresses, and contact information',
        'Call ahead to confirm availability, hours, and requirements',
        'Many resources require appointments or specific documentation',
        'Save favorites to keep track of resources you want to contact'
      ],
      'call': [
        'Call resources directly to confirm current availability and requirements',
        'Many programs require advance appointments or have specific intake times',
        'Ask about required documents, eligibility, and service availability',
        'Save contact information for resources you plan to visit'
      ],
      'phone': [
        'Resource phone numbers are listed in the details section of each listing',
        'Call ahead to confirm hours, availability, and any requirements',
        'Some programs have specific intake times or appointment-only services',
        'Ask about documentation needed and eligibility requirements'
      ],
      
      // Hours and availability
      'hour': [
        'Check resource details for specific hours of operation',
        'Many programs have limited hours or specific intake times',
        'Call ahead to confirm current hours and availability',
        'Some resources require appointments during specific times'
      ],
      'time': [
        'Check each resource for specific hours and appointment requirements',
        'Many programs have limited service hours or specific intake schedules',
        'Call ahead to confirm availability and required documentation',
        'Some resources offer walk-in services during specific times'
      ],
      'open': [
        'Check resource details for opening hours and availability',
        'Many programs have specific hours or appointment-only services',
        'Call ahead to confirm current schedules and requirements',
        'Some resources have different hours for different services'
      ],
      
      // Requirements and eligibility
      'require': [
        'Check resource details for specific requirements and eligibility criteria',
        'Many programs require ID, proof of income, or other documentation',
        'Call ahead to confirm what documents and information you need to bring',
        'Some programs have residency or other eligibility requirements'
      ],
      'eligib': [
        'Each resource has specific eligibility requirements',
        'Check details for income limits, residency requirements, or other criteria',
        'Call programs directly to confirm your eligibility and required documents',
        'Some programs serve specific populations or geographic areas'
      ],
      'document': [
        'Many programs require specific documentation like ID, income proof, or residency papers',
        'Call ahead to confirm exactly what documents you need to bring',
        'Some programs accept alternative documents if you don\'t have standard requirements',
        'Resource details often list required documentation and eligibility criteria'
      ],
      
      // General help and support
      'help': [
        'I can help you find community resources for food, housing, healthcare, jobs, and more',
        'Try searching for specific needs like "food assistance" or "housing help"',
        'Use the AI button for personalized recommendations based on your situation',
        'Ask me specific questions about using the app or finding resources'
      ],
      'add': [
        'To add a resource, you would need to contact the app administrator or use an admin portal',
        'Currently, resources are managed by the app team to ensure quality and accuracy',
        'If you know of a resource that should be included, contact the app support team',
        'You can suggest resources by reaching out through the app\'s contact information'
      ],
      'resource': [
        'Resources in this app are curated and verified by the app team for quality',
        'To suggest a new resource, contact the app administrators with details',
        'All resources are checked for legitimacy before being included',
        'Resource suggestions should include location, services, and contact information'
      ],
      'new': [
        'New resources are added by the app team after verification and quality checks',
        'To suggest a new resource, provide details about services and contact information',
        'The app team ensures all resources are legitimate and helpful before inclusion',
        'Contact support if you know of resources that should be added to the app'
      ],
      'submit': [
        'Resource submissions are currently managed by the app team for quality control',
        'Contact the app administrators to suggest new resources for inclusion',
        'All resources are verified before being added to ensure they\'re legitimate and helpful',
        'Reach out through the app\'s support channels to recommend community resources'
      ],
      'suggest': [
        'To suggest a resource, contact the app administrators or support team',
        'Resources are carefully reviewed and verified before being added to the app',
        'Include resource details like location, services offered, and contact information',
        'The app team ensures all suggested resources meet quality standards before inclusion'
      ],
      'refer': [
        'References for resources include contact information, addresses, and service details',
        'Each resource listing includes phone numbers, addresses, and available services',
        'Click on any resource to see complete reference information and contact details',
        'Resource references are verified to ensure accurate and up-to-date information'
      ],
      'where': [
        'Find resources using the search bar, category filters, or map view',
        'Resources are displayed based on your location and selected categories',
        'Use the map tab to see resources geographically near your location',
        'Click on any resource to see its specific location and contact information'
      ],
      'problem': [
        'I can help you find resources for various problems and challenges',
        'Describe your situation and I can suggest appropriate resources and categories',
        'Many programs specialize in specific types of assistance and support',
        'Don\'t hesitate to reach out - these resources are here to help you'
      ]
    };

    // Find matching keywords - check for partial matches too
    for (const [keyword, responses] of Object.entries(helpResponses)) {
      if (lowerContext.includes(keyword)) {
        console.log(`Helper matched keyword: "${keyword}" in context: "${lowerContext}"`);
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    console.log(`Helper no match found for: "${lowerContext}"`);
    // Default help message
    return 'I can help you find community resources for food, housing, healthcare, jobs, and more. Try searching for specific needs like "food assistance", "housing help", or "job training", or ask me about using the app features!';
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.initialized && !!this.model;
  }
}

// Export singleton instance
export const aiSearchService = new AISearchService();
