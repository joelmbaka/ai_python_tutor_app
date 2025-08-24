"""
LLM configuration for the AI Python Tutor backend.
Configure different models for various educational tasks.
"""

from crewai import LLM
import os
from dotenv import load_dotenv

load_dotenv()

# Primary LLM for lesson content generation (high quality, detailed responses)
llama_70b = LLM(
    model="meta/llama-3.3-70b-instruct",
    temperature=0.7,
    api_key=os.getenv("NVIDIA_NIM_API_KEY"),
    base_url="https://integrate.api.nvidia.com/v1"
)

# Fast LLM for quick responses and function calling
llama_scout = LLM(
    model="meta/llama-4-scout-17b-16e-instruct", 
    temperature=0.6,
    api_key=os.getenv("NVIDIA_NIM_API_KEY"),
    base_url="https://integrate.api.nvidia.com/v1"
)

# Specialized LLM for structured outputs and reasoning
llama_maverick = LLM(
    model="meta/llama-4-maverick-17b-128e-instruct",
    temperature=0.5,
    api_key=os.getenv("NVIDIA_NIM_API_KEY"),
    base_url="https://integrate.api.nvidia.com/v1"
)

# Alternative: OpenAI models (fallback option)
# Uncomment if you prefer to use OpenAI instead of NVIDIA NIM
"""
from openai import OpenAI

openai_gpt4 = LLM(
    model="gpt-4-turbo-preview",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
)

openai_gpt35 = LLM(
    model="gpt-3.5-turbo",
    temperature=0.6,
    api_key=os.getenv("OPENAI_API_KEY")
)
"""
