from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Cache working model name globally to avoid redundant tests on serverless re-runs
WORKING_MODEL_NAME = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        task = data.get('task', 'search')
        query = data.get('query', '')
        
        # Site information for AI context
        site_info = """
        Website Name: Community Compass
        Mission: Helping people find community resources like food assistance, healthcare, housing, and financial aid.
        Key Features:
        - Discovery: A searchable list of hundreds of local resources.
        - AI Search: Users can type natural language (e.g., "I'm hungry") and the AI suggests categories.
        - Map: Interactive view with custom pins and a "Density View" to see resource clusters.
        - Favorites: Users can save resources to their account by clicking the heart icon.
        - Translation: One-click translation of everything. To change language, click the globe icon or the language selector in the top navigation bar.
        - Navigation: Nav links for Home, Discover, Map, Add Resource (Submit), About, and My Submissions (to manage your own posts).
        - Adding Resources: Click "Add Resource" in the navigation bar to share a new service with the community.
        """

        gemini_key = (
            os.environ.get('GEMINI_API_KEY') or
            os.environ.get('VITE_GEMINI_API_KEY') or 
            os.environ.get('NEXT_PUBLIC_GEMINI_API_KEY')
        )
        
        if not gemini_key or gemini_key == 'your_gemini_api_key_here':
            error_msg = "Gemini API key not found. Please add 'GEMINI_API_KEY' (without VITE_ prefix) to your Vercel Project Settings."
            print(f"ERROR: {error_msg}", file=sys.stderr)
            self.send_error(500, error_msg)
            return

        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key, transport='rest')
            
            # Use the exact model strings confirmed by your /api/debug output
            # Crucially, many environments now require the 'models/' prefix
            model_name = 'models/gemini-flash-latest'
            
            try:
                model = genai.GenerativeModel(model_name)
            except:
                # Primary fallback from confirmed list
                model_name = 'models/gemini-pro-latest'
                model = genai.GenerativeModel(model_name)
            
            print(f"DEBUG: AI Task started: {task} using {model_name}", file=sys.stderr)

            if task == 'validate_submission':
                submission = data.get('submission', {})
                prompt = f"""
                You are a quality control assistant for a community resource directory called Community Compass.
                Your job is to validate a user's resource submission.
                
                Submission Data:
                - Title: {submission.get('title')}
                - Description: {submission.get('description')}
                - Category: {submission.get('category')}
                - Services: {submission.get('services')}
                - Tags: {submission.get('tags')}
                
                Validation Criteria:
                1. Written in clear, proper English.
                2. Not gibberish or spam (e.g., random letters like "vorjovrk" or "0ijo9ij" MUST be rejected).
                3. The title, description, category, and services are logically consistent (e.g., if category is "Food", the services shouldn't be "Legal Aid").
                4. The description must be helpful and descriptive.
                
                If the title or description looks like random typing or placeholders, "isValid" MUST be false.
                
                Respond ONLY in JSON format:
                {{
                  "isValid": false,
                  "feedback": "Reason why it is invalid...",
                  "scores": {{ ... }}
                }}
                OR
                {{
                  "isValid": true,
                  "feedback": "Brief summary",
                  "scores": {{ ... }}
                }}
                """
                response = model.generate_content(prompt)
                result_text = response.text.strip()
                if '```json' in result_text:
                    result_text = result_text.split('```json')[1].split('```')[0].strip()
                elif '```' in result_text:
                    result_text = result_text.split('```')[1].split('```')[0].strip()
                
                self.send_json_response(json.loads(result_text))
                return

            elif task == 'helper_chat':
                history = data.get('history', [])
                current_message = data.get('message', '')
                
                prompt = f"""
                You are the Community Compass AI Assistant. You are warm, helpful, and knowledgeable about the platform.
                
                {site_info}
                
                Rules:
                - Respond to the user's latest question.
                - Use the site information to guide them on how to use the website.
                - If they ask about resources, tell them how to use the search or categories.
                - Keep responses concise but friendly (max 3-4 sentences).
                - Use bullet points for lists.
                
                Chat History:
                {json.dumps(history)}
                
                User's latest question: "{current_message}"
                """
                response = model.generate_content(prompt)
                
                # Robust extraction of text to handle safety blocks
                try:
                    chat_response = response.text.strip()
                except Exception as e:
                    print(f"DEBUG: AI Chat Blocked or Failed: {e}", file=sys.stderr)
                    chat_response = "I'm sorry, I encountered a safety filter or an error while generating a response. Please try rephrasing your question!"
                
                self.send_json_response({'response': chat_response})
                return

            else: # Default search/categorization
                prompt = f"""You are a community resource assistant. Analyze this user query and suggest relevant resource categories.

User query: "{query}"

Available categories:
- Food Assistance, Healthcare, Housing, Employment, Mental Health, Financial Assistance, Education, Transportation, Child Care, Senior Services, Legal Aid, Veterans Services

Respond in JSON format:
{{
  "categories": ["category1"],
  "recommendations": ["tip"],
  "explanation": "why"
}}
"""
                response = model.generate_content(prompt)
                result_text = response.text.strip()
                if '```json' in result_text:
                    result_text = result_text.split('```json')[1].split('```')[0].strip()
                ai_result = json.loads(result_text)
                self.send_json_response({
                    'query': query,
                    'recommendations': ai_result.get('recommendations', []),
                    'explanation': ai_result.get('explanation', ''),
                    'categories': ai_result.get('categories', []),
                    'confidence': 0.9,
                    'type': 'gemini'
                })
                return

        except Exception as e:
            error_type = type(e).__name__
            error_details = str(e)
            print(f'AI error ({error_type}): {error_details}', file=sys.stderr)
            self.send_error(500, f"AI Service Error ({error_type}): {error_details}")

    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
