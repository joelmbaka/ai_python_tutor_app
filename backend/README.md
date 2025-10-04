# AI Python Tutor Backend

A FastAPI backend service that generates personalized Python programming lessons for kids using CrewAI and advanced language models.

## 🎯 Features

- **Personalized Lesson Generation**: Creates custom Python lessons tailored to each student's age, experience, and interests
- **Age-Appropriate Content**: Adapts language complexity and concepts for ages 8-16
- **Structured Curriculum**: Progressive lesson blueprints covering Python fundamentals to advanced topics
- **Multiple Learning Styles**: Supports visual, text-based, and mixed learning approaches
- **Interactive Content**: Challenge-based lessons with practice exercises
- **CrewAI Integration**: Uses multiple AI agents for content generation and adaptation

## 🏗️ Architecture

```
backend/
├── main.py                    # FastAPI application entry point
├── models/                    # Pydantic models
│   ├── lesson_models.py      # Core lesson content models
│   └── api_models.py         # API request/response models
├── crews/                     # CrewAI crews and agents
│   └── lesson_generator.py   # Lesson content generation crew
├── data/                      # Static data and configuration
│   └── lesson_blueprints.py  # Curriculum structure definitions
├── llms.py                    # LLM configuration
└── pyproject.toml            # Dependencies and project config
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- UV package manager (recommended) or pip

### Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies with UV**:
   ```bash
   uv sync
   ```
   
   Or with pip:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run the server**:
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8083`

## 🔑 API Keys Setup

You'll need an API key from one of these providers:

### NVIDIA NIM (Recommended)
1. Sign up at [NVIDIA NGC](https://catalog.ngc.nvidia.com/)
2. Get your API key from the NIM service
3. Add to `.env`: `NVIDIA_NIM_API_KEY=your_key_here`

### OpenAI (Alternative)
1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add to `.env`: `OPENAI_API_KEY=your_key_here`
3. Uncomment OpenAI models in `llms.py`

## 📡 API Endpoints

### Core Endpoints

- **`POST /generate-lesson`** - Generate personalized lesson content
- **`GET /curriculum/{age_group}`** - Get curriculum overview for age group
- **`GET /lesson/blueprint/{blueprint_id}`** - Get lesson blueprint details
- **`GET /student/next-lesson`** - Get next recommended lesson
- **`GET /health`** - System health check

### Example Request

```bash
curl -X POST "http://localhost:8083/generate-lesson" \
  -H "Content-Type: application/json" \
  -d '{
    "blueprint_id": "variables_intro_8_10",
    "student_profile": {
      "name": "Alice",
      "age": 9,
      "experience": "beginner",
      "learning_style": "visual", 
      "interests": ["games", "art"],
      "completed_lessons": [],
      "current_streak": 0,
      "total_lessons_completed": 0
    }
  }'
```

## 🎓 Curriculum Structure

### Age Groups

- **8-10 years**: Visual & computational thinking foundation
- **11-13 years**: Mixed visual + text programming 
- **14-16 years**: Full text-based programming

### Lesson Format (Challenge-Only)

- **Challenge**: Interactive coding exercise with starter code, hints, solution, and explanation
- **Optional Exercise**: Open-ended practice prompt for additional exploration

### Sample Progression (Ages 8-10)

1. **Computational Thinking** - Pattern recognition and problem solving
2. **Variables** - "Magic boxes" that store information
3. **Print Function** - Making Python talk
4. **Emoji Patterns** - Creating art with loops

## 🤖 AI Agents

The system uses specialized CrewAI agents:

- **Python Tutor**: Expert in creating engaging, educational content
- **Content Adapter**: Ensures age-appropriate language and difficulty

## 🧪 Testing

Test the lesson generation crew:

```bash
cd backend
python crews/lesson_generator.py
```

## 📝 API Documentation

Visit `http://localhost:8083/docs` for interactive API documentation.

## 🔧 Development

### Extending Challenge Content

- Modify `SimpleChallenge` or `Exercise` in `models/lesson_models.py` to adjust structure
- Tweak crew prompts in `crews/lesson_generator.py` for different challenge complexity
- Update mock fallback in `main.py#create_mock_lesson_content` if schema changes

### Adding New Age Groups

1. Define blueprints in `data/lesson_blueprints.py`
2. Add age group logic in API endpoints
3. Update curriculum progression rules

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . .

RUN pip install uv
RUN uv sync --frozen

EXPOSE 8083
CMD ["python", "main.py"]
```

### Environment Variables for Production

```bash
DEBUG=false
HOST=0.0.0.0
PORT=8083
SECRET_KEY=your_production_secret_key
NVIDIA_NIM_API_KEY=your_production_api_key
```

## 📊 Monitoring

The `/health` endpoint provides detailed system status including:

- API operational status
- AI model connectivity
- Curriculum statistics
- Service health metrics

## 🤝 Contributing

1. Follow the existing code structure
2. Add type hints for all functions
3. Update API documentation
4. Test with different age groups and student profiles

## 📄 License

MIT License - see LICENSE file for details.
