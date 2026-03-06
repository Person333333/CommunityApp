export interface CategoryNode {
    id: string;
    label: string;
    description?: string;
    children?: CategoryNode[];
}

export const categoryHierarchy: CategoryNode[] = [
    {
        id: 'food',
        label: 'Food',
        description: 'Food pantries, meals, SNAP assistance',
        children: [
            { id: 'food_pantries', label: 'Food Pantries' },
            { id: 'meals', label: 'Meals' },
            { id: 'help_paying_food', label: 'Help Paying for Food' },
            { id: 'nutrition_healthy_eating', label: 'Nutrition & Healthy Eating' },
            { id: 'baby_food_formula', label: 'Baby Food & Formula' },
            { id: 'emergency_food', label: 'Emergency Food' },
            { id: 'food_stamps', label: 'Food Stamps (SNAP)' },
            { id: 'community_gardens', label: 'Community Gardens' },
            { id: 'free_summer_meals', label: 'Free Summer Meals' }
        ]
    },
    {
        id: 'housing',
        label: 'Housing',
        description: 'Shelters, rent help, maintenance',
        children: [
            { id: 'help_finding_housing', label: 'Help Finding Housing' },
            { id: 'help_paying_housing', label: 'Help Paying for Housing' },
            { id: 'shelters', label: 'Shelters' },
            { id: 'housing_rights_advice', label: 'Housing Rights & Advice' },
            { id: 'home_maintenance', label: 'Home Maintenance' },
            { id: 'eviction_prevention', label: 'Eviction Prevention' },
            { id: 'section_8', label: 'Section 8' },
            { id: 'transitional_housing', label: 'Transitional Housing' },
            { id: 'utility_assistance', label: 'Utility Assistance (HEART/LIHEAP)' }
        ]
    },
    {
        id: 'health',
        label: 'Health',
        description: 'Medical, dental, mental health',
        children: [
            { id: 'medical_care', label: 'Medical Care' },
            { id: 'dental_care', label: 'Dental Care' },
            { id: 'mental_health', label: 'Mental Health' },
            { id: 'substance_use', label: 'Substance Use' },
            { id: 'sexual_health', label: 'Sexual Health' },
            { id: 'health_insurance', label: 'Health Insurance' },
            { id: 'diabetes_support', label: 'Diabetes Support' },
            { id: 'clinics', label: 'Clinics' },
            { id: 'counseling', label: 'Counseling' },
            { id: 'vision_care', label: 'Vision Care' },
            { id: 'prescription_assistance', label: 'Prescription Assistance' }
        ]
    },
    {
        id: 'employment',
        label: 'Employment',
        description: 'Job search, training, benefits',
        children: [
            { id: 'help_finding_job', label: 'Help Finding a Job' },
            { id: 'job_training', label: 'Job Training' },
            { id: 'rights_legal_issues', label: 'Rights & Legal Issues' },
            { id: 'unemployment_benefits', label: 'Unemployment Benefits' },
            { id: 'resume_help', label: 'Resume Help' },
            { id: 'career_counseling', label: 'Career Counseling' },
            { id: 'vocational_rehabilitation', label: 'Vocational Rehabilitation' },
            { id: 'apprenticeships', label: 'Apprenticeships' }
        ]
    },
    {
        id: 'education',
        label: 'Education',
        description: 'Schools, tutoring, childcare',
        children: [
            { id: 'schools_enrollment', label: 'Schools & Enrollment' },
            { id: 'tutoring_mentoring', label: 'Tutoring & Mentoring' },
            { id: 'higher_education', label: 'Higher Education' },
            { id: 'preschool_childcare', label: 'Preschool & Childcare' },
            { id: 'ged_adult_ed', label: 'GED/Adult Education' },
            { id: 'special_education', label: 'Special Education' },
            { id: 'financial_aid', label: 'Financial Aid' },
            { id: 'esl_classes', label: 'ESL Classes' }
        ]
    },
    {
        id: 'legal',
        label: 'Legal',
        description: 'Immigration, aid, domestic violence',
        children: [
            { id: 'immigration', label: 'Immigration' },
            { id: 'civil_rights', label: 'Civil Rights' },
            { id: 'criminal_justice', label: 'Criminal Justice' },
            { id: 'family_law', label: 'Family Law' },
            { id: 'housing_law', label: 'Housing Law' },
            { id: 'citizenship', label: 'Citizenship' },
            { id: 'legal_aid', label: 'Legal Aid' },
            { id: 'expungement', label: 'Expungement' },
            { id: 'domestic_violence_support', label: 'Domestic Violence Support' }
        ]
    },
    {
        id: 'money',
        label: 'Money',
        description: 'Coaching, taxes, benefits',
        children: [
            { id: 'financial_coaching', label: 'Financial Coaching' },
            { id: 'taxes', label: 'Taxes' },
            { id: 'public_benefits', label: 'Public Benefits' },
            { id: 'debt_credit', label: 'Debt & Credit' },
            { id: 'emergency_financial_assistance', label: 'Emergency Financial Assistance' },
            { id: 'free_tax_prep', label: 'Free Tax Prep (VITA)' },
            { id: 'social_security', label: 'Social Security' },
            { id: 'identity_theft', label: 'Identity Theft' },
            { id: 'loans', label: 'Loans' }
        ]
    },
    {
        id: 'family',
        label: 'Family',
        description: 'Childcare, seniors, LGBTQ+',
        children: [
            { id: 'childcare', label: 'Childcare' },
            { id: 'parenting_support', label: 'Parenting Support' },
            { id: 'senior_services', label: 'Senior Services' },
            { id: 'youth_services', label: 'Youth Services' },
            { id: 'lgbtq_services', label: 'LGBTQ+ Services' },
            { id: 'foster_care', label: 'Foster Care' },
            { id: 'adoption', label: 'Adoption' },
            { id: 'youth_centers', label: 'Youth Centers' },
            { id: 'caregiver_support', label: 'Caregiver Support' }
        ]
    },
    {
        id: 'urgent',
        label: 'Urgent',
        description: 'Crisis, disaster, hotlines',
        children: [
            { id: 'immediate_safety', label: 'Immediate Safety' },
            { id: 'disaster_relief', label: 'Disaster Relief' },
            { id: 'domestic_violence', label: 'Domestic Violence' },
            { id: 'suicide_prevention', label: 'Suicide Prevention' },
            { id: 'hotlines', label: 'Hotlines' },
            { id: 'emergency_shelters', label: 'Emergency Shelters' },
            { id: 'human_trafficking_support', label: 'Human Trafficking Support' }
        ]
    },
    {
        id: 'specialized_support',
        label: 'Specialized Support',
        description: 'Veterans, disability, immigrants',
        children: [
            { id: 'disability_services', label: 'Disability Services' },
            { id: 're_entry', label: 'Re-entry (formerly incarcerated)' },
            { id: 'veterans_services', label: 'Veterans Services' },
            { id: 'immigrants_refugees', label: 'Immigrants & Refugees' },
            { id: 'assistive_technology', label: 'Assistive Technology' },
            { id: 'va_benefits', label: 'VA Benefits' },
            { id: 'refugee_resettlement', label: 'Refugee Resettlement' },
            { id: 'accessible_transportation', label: 'Accessible Transportation' }
        ]
    }
];
