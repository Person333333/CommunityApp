from http.server import BaseHTTPRequestHandler
import json
import sys
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        query = data.get('query', '')

        if not query:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No query provided'}).encode('utf-8'))
            return

        # Try to use Gemini AI if available
        gemini_key = os.environ.get('VITE_GEMINI_API_KEY')
        
        if gemini_key and gemini_key != 'your_gemini_api_key_here':
            try:
                # Import here to avoid errors if google-generativeai not installed
                import google.generativeai as genai
                
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                # Create a focused prompt for resource categorization
                prompt = f"""You are a community resource assistant. Analyze this user query and suggest relevant resource categories.

User query: "{query}"

Available categories:
- Food Assistance
- Healthcare
- Housing
- Employment
- Mental Health
- Financial Assistance
- Education
- Transportation
- Child Care
- Senior Services
- Legal Aid
- Veterans Services

Respond in JSON format:
{{
  "categories": ["category1", "category2"],
  "recommendations": ["brief helpful tip 1", "brief helpful tip 2"],
  "explanation": "one sentence explaining why these categories match"
}}

Only suggest categories that are clearly relevant. Maximum 3 categories."""

                response = model.generate_content(prompt)
                result_text = response.text.strip()
                
                # Extract JSON from response (handle markdown code blocks)
                if '```json' in result_text:
                    result_text = result_text.split('```json')[1].split('```')[0].strip()
                elif '```' in result_text:
                    result_text = result_text.split('```')[1].split('```')[0].strip()
                
                ai_result = json.loads(result_text)
                
                response_data = {
                    'query': query,
                    'recommendations': ai_result.get('recommendations', [])[:3],
                    'explanation': ai_result.get('explanation', 'AI-powered search results'),
                    'categories': ai_result.get('categories', [])[:3],
                    'confidence': 0.9,
                    'type': 'gemini'
                }
                
                print(f'Gemini AI: "{query}" -> {response_data["categories"]}', file=sys.stderr)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                return
                
            except Exception as e:
                print(f'Gemini AI error: {e}, falling back to keyword matching', file=sys.stderr)
                # Fall through to keyword matching

        # Fallback: Smart keyword-to-category mapping
        query_lower = query.lower()
        categories = []
        recommendations = []
        
        # Food-related
        if any(word in query_lower for word in ['food', 'hungry', 'meal', 'eat', 'grocer', 'pantry']):
            categories.append('Food Assistance')
            recommendations.append('Found food banks, pantries, and meal programs in your area')
        
        # Healthcare
        if any(word in query_lower for word in ['health', 'doctor', 'medical', 'clinic', 'sick', 'medicine']):
            categories.append('Healthcare')
            recommendations.append('Located free and low-cost clinics and medical services')
        
        # Housing
        if any(word in query_lower for word in ['housing', 'shelter', 'home', 'rent', 'homeless']):
            categories.append('Housing')
            recommendations.append('Found emergency shelters and housing assistance programs')
        
        # Employment
        if any(word in query_lower for word in ['job', 'work', 'employ', 'career', 'resume']):
            categories.append('Employment')
            recommendations.append('Discovered job centers and career development resources')
        
        # Mental Health
        if any(word in query_lower for word in ['mental', 'therapy', 'counsel', 'depress', 'anxiety', 'stress']):
            categories.append('Mental Health')
            recommendations.append('Found counseling services and mental health support')
        
        # Financial
        if any(word in query_lower for word in ['money', 'bill', 'pay', 'financial', 'debt', 'utility']):
            categories.append('Financial Assistance')
            recommendations.append('Located bill payment assistance and financial aid programs')
        
        # Education
        if any(word in query_lower for word in ['education', 'learn', 'class', 'school', 'ged', 'tutor']):
            categories.append('Education')
            recommendations.append('Found educational programs and learning resources')
        
        # Transportation
        if any(word in query_lower for word in ['transport', 'ride', 'bus', 'travel', 'car']):
            categories.append('Transportation')
            recommendations.append('Located transportation assistance and ride services')
        
        # Child Care
        if any(word in query_lower for word in ['child', 'kid', 'daycare', 'babysit']):
            categories.append('Child Care')
            recommendations.append('Found child care services and assistance programs')
        
        # Senior Services
        if any(word in query_lower for word in ['senior', 'elder', 'older', 'retire', 'aging']):
            categories.append('Senior Services')
            recommendations.append('Located services specifically for older adults')
        
        # Legal Aid
        if any(word in query_lower for word in ['legal', 'lawyer', 'court', 'attorney', 'law']):
            categories.append('Legal Aid')
            recommendations.append('Found free legal assistance and legal services')
        
        # Veterans
        if any(word in query_lower for word in ['veteran', 'military', 'army', 'navy', 'marine']):
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
        response_data = {
            'query': query,
            'recommendations': recommendations[:3],
            'explanation': explanation,
            'categories': categories,
            'confidence': 0.7 if categories else 0.4,
            'type': 'keyword'
        }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
        
        print(f'Keyword matching: "{query}" -> {len(categories)} categories', file=sys.stderr)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
