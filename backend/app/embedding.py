from google import genai
import json

GEMINI_API_KEY = "AQ.Ab8RN6J20koWVQm1gN0m07wk9vno9Jgq5VF5JWSz9US2zbzfnw"
client = genai.Client(api_key=GEMINI_API_KEY)

EMBEDDING_DIM = 768

async def generate_embedding(text: str) -> list:
    try:
        response = client.models.embed_content(
            model="models/embedding-001",
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"خطأ في توليد المتجه: {str(e)}")
        return [0.0] * EMBEDDING_DIM

def serialize_embedding(embedding: list) -> str:
    return json.dumps(embedding)

def deserialize_embedding(embedding_str: str) -> list:
    if not embedding_str:
        return [0.0] * EMBEDDING_DIM
    try:
        return json.loads(embedding_str)
    except:
        return [0.0] * EMBEDDING_DIM