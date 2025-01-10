import json
import asyncio
import google.generativeai as genai
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor
import os
from dotenv import load_dotenv

load_dotenv()

# Init Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def load_json_data() -> List[Dict]:
    # Loads social media data from JSON file
    with open("data.json", "r") as file:
        return json.load(file)

def chunk_data(data: List[Dict], chunk_size: int = 5) -> List[List[Dict]]:
    # Splits data into manageable chunks for processing
    return [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]

def process_chunk(chunk: List[Dict], user_prompt: str) -> str:
    # Processes individual data chunk with Gemini API
    try:
        context = f"""You are a social media expert known as Quant Ai.
        When asked about your identity, always respond that you are Quant Ai.
        
        Please provide detailed, in-depth analysis with the following guidelines:
        - Break down insights into clear bullet points and sections
        - Include specific data points and metrics to support conclusions 
        - Provide actionable recommendations where relevant
        - Use professional but engaging tone
        - Format responses with proper headings and structure

        Based on this social media data:
        {json.dumps(chunk, indent=2)}

"""
        full_prompt = context + user_prompt
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"Error processing chunk: {str(e)}"

async def process_chunks_concurrently(chunks: List[List[Dict]], user_prompt: str) -> List[str]:
    # Handles concurrent processing of multiple data chunks
    with ThreadPoolExecutor() as executor:
        loop = asyncio.get_event_loop()
        tasks = []
        
        for chunk in chunks:
            task = loop.run_in_executor(
                executor,
                process_chunk,
                chunk,
                user_prompt
            )
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks)
        return responses

def merge_responses(responses: List[str]) -> str:
    # Combines and synthesizes multiple chunk responses
    valid_responses = [r for r in responses if not r.startswith("Error")]
    
    if not valid_responses:
        return "Sorry, I couldn't process the data properly."
    
    combined = "\n\n".join(valid_responses)
    
    try:
        summary_prompt = f"Synthesize these insights into a single coherent response:\n{combined}"
        final_response = model.generate_content(summary_prompt)
        return final_response.text
    except Exception as e:
        return combined

async def process_prompt_with_data(user_prompt: str) -> str:
    # Main processing pipeline for handling user prompts
    try:
        data = load_json_data()
        chunks = chunk_data(data)
        responses = await process_chunks_concurrently(chunks, user_prompt)
        return merge_responses(responses)
    
    except Exception as e:
        return f"Error: {str(e)}"

async def handle_prompt(prompt: str) -> str:
    # FastAPI endpoint handler
    return await process_prompt_with_data(prompt)
