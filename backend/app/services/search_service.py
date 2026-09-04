from duckduckgo_search import DDGS
from typing import Dict, Any

class SearchService:
    def __init__(self):
        self.is_available = True

    async def search(self, query: str, max_results: int = 5, **kwargs) -> Dict[str, Any]:
        try:
            results = []
            with DDGS() as ddgs:
                for r in ddgs.text(query, max_results=max_results):
                    results.append({
                        "title": r.get("title", "بدون عنوان"),
                        "url": r.get("href", ""),
                        "content": r.get("body", ""),
                    })
            return {"success": True, "results": results, "answer": ""}
        except Exception as e:
            return {"success": False, "error": str(e), "results": []}

    def format_search_context(self, search_results: Dict[str, Any]) -> str:
        if not search_results.get("success"):
            return "⚠️ لا توجد نتائج."
        context = "🔍 نتائج البحث:\n"
        for i, r in enumerate(search_results.get("results", [])[:5], 1):
            context += f"{i}. {r['title']}\n   {r['content'][:150]}...\n"
        return context