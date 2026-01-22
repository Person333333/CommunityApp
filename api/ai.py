from http.server import BaseHTTPRequestHandler
import json
import sys

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        query = data.get('query', '').lower()

        if not query:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No query provided'}).encode('utf-8'))
            return

        # Smart keyword-to-category mapping
        categories = []
        recommendations = []
        
        # Food-related
        if any(word in query for word in ['food', 'hungry', 'meal', 'eat', 'grocer', 'pantry']):
            categories.append('Food Assistance')
            recommendations.append('Found food banks, pantries, and meal programs in your area')
        
        # Healthcare
        if any(word in query for word in ['health', 'doctor', 'medical', 'clinic', 'sick', 'medicine']):
            categories.append('Healthcare')
            recommendations.append('Located free and low-cost clinics and medical services')
        
        # Housing
        if any(word in query for word in ['housing', 'shelter', 'home', 'rent', 'homeless']):
            categories.append('Housing')
            recommendations.append('Found emergency shelters and housing assistance programs')
        
        # Employment
        if any(word in query for word in ['job', 'work', 'employ', 'career', 'resume']):
            categories.append('Employment')
            recommendations.append('Discovered job centers and career development resources')
        
        # Mental Health
        if any(word in query for word in ['mental', 'therapy', 'counsel', 'depress', 'anxiety', 'stress']):
            categories.append('Mental Health')
            recommendations.append('Found counseling services and mental health support')
        
        # Financial
        if any(word in query for word in ['money', 'bill', 'pay', 'financial', 'debt', 'utility']):
            categories.append('Financial Assistance')
            recommendations.append('Located bill payment assistance and financial aid programs')
        
        # Education
        if any(word in query for word in ['education', 'learn', 'class', 'school', 'ged', 'tutor']):
            categories.append('Education')
            recommendations.append('Found educational programs and learning resources')
        
        # Transportation
        if any(word in query for word in ['transport', 'ride', 'bus', 'travel', 'car']):
            categories.append('Transportation')
            recommendations.append('Located transportation assistance and ride services')
        
        # Child Care
        if any(word in query for word in ['child', 'kid', 'daycare', 'babysit']):
            categories.append('Child Care')
            recommendations.append('Found child care services and assistance programs')
        
        # Senior Services
        if any(word in query for word in ['senior', 'elder', 'older', 'retire', 'aging']):
            categories.append('Senior Services')
            recommendations.append('Located services specifically for older adults')
        
        # Legal Aid
        if any(word in query for word in ['legal', 'lawyer', 'court', 'attorney', 'law']):
            categories.append('Legal Aid')
            recommendations.append('Found free legal assistance and legal services')
        
        # Veterans
        if any(word in query for word in ['veteran', 'military', 'army', 'navy', 'marine']):
            categories.append('Veterans Services')
            recommendations.append('Located veteran-specific programs and benefits')

        # Default response if no categories matched
        if not categories:
            recommendations = [
                'Searching all available resources for your query',
                'Try using specific keywords like "food", "health", "housing", or "jobs"',
                'Browse categories to find the type of help you need'
            ]
            explanation = 'I\'m searching for resources that match your description. Try being more specific about what kind of help you need.'
        else:
            explanation = f'Based on your search, I recommend looking at {", ".join(categories)} resources.'

        # Build response
        response = {
            'query': data.get('query', ''),
            'recommendations': recommendations[:3],  # Limit to 3
            'explanation': explanation,
            'categories': categories,
            'confidence': 0.8 if categories else 0.4,
            'type': 'smart'  # Indicates this is rule-based, not LLM
        }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))
        
        print(f'AI Search: "{query}" -> {len(categories)} categories', file=sys.stderr)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
