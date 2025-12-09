import openai
from anthropic import Anthropic
import google.generativeai as genai
from typing import List, Dict

class AIService:
    """Service for interacting with different AI platforms"""
    
    def __init__(self):
        pass
    
    def send_message(self, platform: str, model: str, api_key: str, messages: List[Dict]) -> Dict:
        """Send message to AI platform and get response"""
        
        if platform == 'openai':
            return self._openai_chat(model, api_key, messages)
        elif platform == 'anthropic':
            return self._anthropic_chat(model, api_key, messages)
        elif platform == 'google':
            return self._google_chat(model, api_key, messages)
        else:
            raise ValueError(f"Unsupported platform: {platform}")
    
    def _openai_chat(self, model: str, api_key: str, messages: List[Dict]) -> Dict:
        """Chat with OpenAI"""
        if not api_key:
            raise ValueError("OpenAI API key is required")
        
        client = openai.OpenAI(api_key=api_key)
        
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages
            )
            
            if not response.choices or len(response.choices) == 0:
                raise ValueError("No response from OpenAI")
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")
            
            tokens = response.usage.total_tokens if response.usage else 0
            
            # Calculate cost (approximate pricing)
            cost = self._calculate_openai_cost(model, tokens)
            
            return {
                'content': content,
                'tokens': tokens,
                'cost': cost,
                'metadata': {
                    'model': model,
                    'finish_reason': response.choices[0].finish_reason
                }
            }
        except openai.AuthenticationError as e:
            raise ValueError(f"OpenAI authentication failed: {str(e)}. Please check your API key.")
        except openai.RateLimitError as e:
            raise ValueError(f"OpenAI rate limit exceeded: {str(e)}")
        except openai.APIError as e:
            raise ValueError(f"OpenAI API error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error calling OpenAI: {str(e)}")
    
    def _anthropic_chat(self, model: str, api_key: str, messages: List[Dict]) -> Dict:
        """Chat with Anthropic"""
        client = Anthropic(api_key=api_key)
        
        # Convert messages format (Anthropic uses different format)
        system_message = None
        conversation_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                conversation_messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        response = client.messages.create(
            model=model,
            max_tokens=4096,
            system=system_message,
            messages=conversation_messages
        )
        
        content = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens
        
        # Calculate cost
        cost = self._calculate_anthropic_cost(model, tokens)
        
        return {
            'content': content,
            'tokens': tokens,
            'cost': cost,
            'metadata': {
                'model': model,
                'stop_reason': response.stop_reason
            }
        }
    
    def _list_google_models(self, api_key: str) -> List[str]:
        """List available Google Gemini models"""
        try:
            genai.configure(api_key=api_key)
            models = genai.list_models()
            available_models = []
            for m in models:
                if 'generateContent' in m.supported_generation_methods:
                    # Remove 'models/' prefix if present
                    model_name = m.name.replace('models/', '')
                    available_models.append(model_name)
            return available_models
        except Exception as e:
            print(f"Error listing models: {e}")
            return []
    
    def _google_chat(self, model: str, api_key: str, messages: List[Dict]) -> Dict:
        """Chat with Google Gemini"""
        try:
            genai.configure(api_key=api_key)
            
            # Map model names to actual working model names
            # Try to list available models first
            available_models = self._list_google_models(api_key)
            
            actual_model = None
            
            if available_models:
                # Use available models - try to match requested model
                if model in available_models:
                    actual_model = model
                elif 'pro' in model.lower():
                    pro_models = [m for m in available_models if 'pro' in m.lower()]
                    actual_model = pro_models[0] if pro_models else available_models[0]
                elif 'flash' in model.lower():
                    flash_models = [m for m in available_models if 'flash' in m.lower()]
                    actual_model = flash_models[0] if flash_models else available_models[0]
                else:
                    actual_model = available_models[0]
            else:
                # Fallback: use simple model name mapping
                # Most APIs support 'gemini-pro' as the basic model name
                model_mapping = {
                    'gemini-1.5-pro': 'gemini-pro',
                    'gemini-1.5-pro-latest': 'gemini-pro',
                    'gemini-1.5-flash': 'gemini-pro',  # Fallback to pro if flash not available
                    'gemini-1.5-flash-latest': 'gemini-pro',
                    'gemini-pro': 'gemini-pro',
                }
                actual_model = model_mapping.get(model, 'gemini-pro')
            
            model_instance = genai.GenerativeModel(actual_model)
            
            # Convert messages to Google format
            # Google Gemini expects alternating user/model messages in history
            history = []
            for i in range(len(messages) - 1):
                msg = messages[i]
                if msg['role'] == 'user':
                    history.append({'role': 'user', 'parts': [msg['content']]})
                elif msg['role'] == 'assistant':
                    history.append({'role': 'model', 'parts': [msg['content']]})
            
            # Start chat with history (if any)
            if history:
                chat = model_instance.start_chat(history=history)
            else:
                chat = model_instance.start_chat(history=[])
            
            # Send the last message
            last_message = messages[-1]['content']
            response = chat.send_message(last_message)
            
            content = response.text
            tokens = response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else 0
            
            # Calculate cost
            cost = self._calculate_google_cost(actual_model, tokens)
            
            return {
                'content': content,
                'tokens': tokens,
                'cost': cost,
                'metadata': {
                    'model': actual_model
                }
            }
        except Exception as e:
            error_msg = str(e)
            
            # Try to get available models for better error message
            try:
                available_models = self._list_google_models(api_key)
                available_msg = f"\n\nAvailable models: {', '.join(available_models) if available_models else 'Could not list models. Check API key permissions.'}"
            except:
                available_msg = "\n\nCould not retrieve available models. Please check your API key and ensure Generative Language API is enabled."
            
            if '404' in error_msg or 'not found' in error_msg.lower():
                raise ValueError(
                    f"Gemini model '{model}' not found.{available_msg}\n\n"
                    f"Please try:\n"
                    f"1. Use 'gemini-pro' (most widely supported)\n"
                    f"2. Check your Google Cloud Console - ensure Generative Language API is enabled\n"
                    f"3. Verify your API key has access to Gemini models\n"
                    f"4. Original error: {error_msg}"
                )
            elif 'API key' in error_msg or 'authentication' in error_msg.lower():
                raise ValueError(f"Gemini authentication failed: {error_msg}\n\nPlease check:\n1. Your API key is correct\n2. Generative Language API is enabled in Google Cloud Console\n3. Your billing account is active")
            else:
                raise ValueError(f"Error calling Gemini API: {error_msg}{available_msg}")
    
    def _calculate_openai_cost(self, model: str, tokens: int) -> float:
        """Calculate cost for OpenAI (approximate)"""
        pricing = {
            'gpt-4-turbo-preview': {'input': 0.01 / 1000, 'output': 0.03 / 1000},
            'gpt-4': {'input': 0.03 / 1000, 'output': 0.06 / 1000},
            'gpt-3.5-turbo': {'input': 0.0015 / 1000, 'output': 0.002 / 1000}
        }
        
        model_pricing = pricing.get(model, pricing['gpt-3.5-turbo'])
        # Rough estimate: 70% input, 30% output
        return (tokens * 0.7 * model_pricing['input']) + (tokens * 0.3 * model_pricing['output'])
    
    def _calculate_anthropic_cost(self, model: str, tokens: int) -> float:
        """Calculate cost for Anthropic (approximate)"""
        pricing = {
            'claude-3-opus-20240229': {'input': 0.015 / 1000, 'output': 0.075 / 1000},
            'claude-3-sonnet-20240229': {'input': 0.003 / 1000, 'output': 0.015 / 1000},
            'claude-3-haiku-20240307': {'input': 0.00025 / 1000, 'output': 0.00125 / 1000}
        }
        
        model_pricing = pricing.get(model, pricing['claude-3-sonnet-20240229'])
        return (tokens * 0.7 * model_pricing['input']) + (tokens * 0.3 * model_pricing['output'])
    
    def _calculate_google_cost(self, model: str, tokens: int) -> float:
        """Calculate cost for Google (approximate)"""
        # Google Gemini Pro is free for now, but we'll estimate
        return tokens * 0.000001  # Very low cost estimate

