"""Model Router for Naz AI - Routes tasks to the best free model"""
from typing import Optional

class ModelRouter:
    """Routes requests to the most appropriate free model"""
    
    MODELS = {
        "gpt-oss-120b": "openai/gpt-oss-120b",
        "gpt-oss-20b": "openai/gpt-oss-20b",
        "qwen-32b": "qwen/qwen3.6-27b",
        "qwen-alt": "qwen/qwen3.8-27b",
        "allam": "allam-2-7b",
        "compound": "groq/compound",
    }
    
    def select_model(
        self, 
        task_type: str, 
        message: str, 
        has_file: bool = False,
        file_type: Optional[str] = None
    ) -> str:
        message_lower = (message or "").lower()
        
        # 1. Code tasks -> Qwen (better for code)
        if self._is_code_task(message_lower):
            return self.MODELS["qwen-32b"]
        
        # 2. Excel/CSV/Data -> Qwen
        if has_file and file_type in ["xlsx", "xls", "csv"]:
            return self.MODELS["qwen-32b"]
        
        # 3. Data analysis -> Qwen
        if self._is_data_analysis(message_lower):
            return self.MODELS["qwen-32b"]
        
        # 4. Visualization -> Qwen
        if self._is_visualization(message_lower):
            return self.MODELS["qwen-32b"]
        
        # 5. Quick questions -> GPT-OSS-20B (fastest)
        if len(message or "") < 200 and not has_file:
            return self.MODELS["gpt-oss-20b"]
        
        # 6. Default -> GPT-OSS-120B (best all-rounder)
        return self.MODELS["gpt-oss-120b"]
    
    def get_fallback_chain(self, primary: str) -> list:
        chain = [
            self.MODELS["gpt-oss-120b"],
            self.MODELS["qwen-32b"],
            self.MODELS["gpt-oss-20b"],
        ]
        if primary in chain:
            chain.remove(primary)
        return [primary] + chain
    
    def _is_code_task(self, msg: str) -> bool:
        keywords = ["كود", "code", "python", "function", "class", "javascript", "html", "css", "sql", "api", "def ", "import "]
        return any(k in msg for k in keywords)
    
    def _is_data_analysis(self, msg: str) -> bool:
        keywords = ["حلل", "analyze", "إحصائيات", "statistics", "ملخص", "summary", "تقرير", "report", "بيانات", "data", "csv", "excel", "مجموع", "sum", "متوسط", "average"]
        return any(k in msg for k in keywords)
    
    def _is_visualization(self, msg: str) -> bool:
        keywords = ["ارسم", "draw", "مخطط", "chart", "graph", "dashboard", "لوحة", "عرض", "visualize", "plot", "bar", "line", "pie", "infographic"]
        return any(k in msg for k in keywords)
