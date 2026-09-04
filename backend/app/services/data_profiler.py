# backend/app/services/data_profiler.py

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
import chardet
import re
from datetime import datetime

class DataProfiler:
    """تحليل الملفات واستخراج معلومات شاملة عن بنيتها وجودتها"""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.file_name = Path(file_path).name
        self.file_size = Path(file_path).stat().st_size
        self.file_extension = Path(file_path).suffix.lower()
        self.df = None
        self.profile = {}

    def detect_encoding(self) -> str:
        """اكتشاف ترميز الملف (خاص بـ CSV)"""
        if self.file_extension not in ['.csv', '.txt']:
            return 'utf-8'

        try:
            with open(self.file_path, 'rb') as f:
                raw_data = f.read(10000)
                result = chardet.detect(raw_data)
                return result['encoding'] or 'utf-8'
        except:
            return 'utf-8'

    def detect_separator(self) -> str:
        """اكتشاف المحدد في ملف CSV"""
        if self.file_extension not in ['.csv', '.txt']:
            return ','

        try:
            with open(self.file_path, 'r', encoding=self.detect_encoding()) as f:
                first_line = f.readline()
                # فحص أكثر المحددات شيوعاً
                for sep in [',', ';', '\t', '|']:
                    if sep in first_line:
                        return sep
            return ','
        except:
            return ','

    def load_file(self) -> bool:
        """تحميل الملف إلى DataFrame"""
        try:
            encoding = self.detect_encoding()
            separator = self.detect_separator()

            if self.file_extension in ['.xlsx', '.xls']:
                # قراءة Excel مع دعم جميع الأوراق
                excel_file = pd.ExcelFile(self.file_path)
                sheets = excel_file.sheet_names
                # تحميل أول Sheet بشكل افتراضي
                self.df = pd.read_excel(self.file_path, sheet_name=sheets[0])
                self.profile['sheets'] = sheets
                self.profile['total_sheets'] = len(sheets)

            elif self.file_extension in ['.csv', '.txt']:
                # محاولة قراءة CSV بترميزات مختلفة
                try:
                    self.df = pd.read_csv(
                        self.file_path,
                        encoding=encoding,
                        sep=separator,
                        dtype=str,
                        keep_default_na=False
                    )
                except:
                    # محاولة بترميز بديل
                    try:
                        self.df = pd.read_csv(
                            self.file_path,
                            encoding='utf-8',
                            sep=separator,
                            dtype=str,
                            keep_default_na=False
                        )
                    except:
                        self.df = pd.read_csv(
                            self.file_path,
                            encoding='windows-1256',
                            sep=separator,
                            dtype=str,
                            keep_default_na=False
                        )

            else:
                return False

            return self.df is not None

        except Exception as e:
            print(f"❌ خطأ في تحميل الملف: {e}")
            return False

    def analyze_structure(self) -> Dict[str, Any]:
        """تحليل بنية الملف"""
        if self.df is None:
            return {}

        rows, cols = self.df.shape
        self.profile['rows'] = rows
        self.profile['columns'] = cols
        self.profile['column_names'] = list(self.df.columns)

        # تحليل كل عمود
        column_analysis = {}
        for col in self.df.columns:
            col_data = self.df[col].astype(str)
            non_empty = col_data[col_data != '']
            empty_count = rows - len(non_empty)
            unique_values = non_empty.nunique()
            sample_values = non_empty.head(10).tolist()

            # تحديد النوع المحتمل
            data_type = self._detect_column_type(col_data)

            column_analysis[col] = {
                'empty_count': empty_count,
                'empty_percentage': round((empty_count / rows) * 100, 2),
                'unique_count': unique_values,
                'unique_percentage': round((unique_values / rows) * 100, 2),
                'sample_values': sample_values[:5],
                'data_type': data_type,
                'potential_issues': []
            }

            # الكشف عن المشاكل المحتملة
            issues = self._detect_column_issues(col, col_data, data_type)
            if issues:
                column_analysis[col]['potential_issues'] = issues

        self.profile['column_analysis'] = column_analysis

        # الكشف عن التكرارات
        duplicates = self.df.duplicated().sum()
        self.profile['duplicates'] = duplicates
        self.profile['duplicate_percentage'] = round((duplicates / rows) * 100, 2)

        return self.profile

    def _detect_column_type(self, col_data: pd.Series) -> str:
        """تحديد نوع العمود بناءً على البيانات"""
        non_empty = col_data[col_data != '']
        if len(non_empty) == 0:
            return 'empty'

        # فحص العينة الأولى
        sample = non_empty.head(20)

        # هل هي أرقام؟
        numeric_count = 0
        date_count = 0

        for val in sample:
            val_str = str(val).strip()
            if val_str == '':
                continue

            # فحص الأرقام (مع دعم الفواصل والعملات)
            cleaned = re.sub(r'[^\d.،-]', '', val_str)
            cleaned = cleaned.replace('،', '.')
            try:
                float(cleaned)
                numeric_count += 1
                continue
            except:
                pass

            # فحص التواريخ
            try:
                pd.to_datetime(val_str)
                date_count += 1
                continue
            except:
                pass

        total = len(sample)
        if numeric_count / total > 0.5:
            return 'numeric'
        if date_count / total > 0.5:
            return 'date'

        return 'text'

    def _detect_column_issues(self, col: str, col_data: pd.Series, data_type: str) -> List[str]:
        """الكشف عن المشاكل في العمود"""
        issues = []
        non_empty = col_data[col_data != '']

        if len(non_empty) == 0:
            issues.append('العمود فارغ بالكامل')
            return issues

        # فحص المسافات الزائدة
        trailing_spaces = sum(1 for v in non_empty if str(v).startswith(' ') or str(v).endswith(' '))
        if trailing_spaces > 0:
            issues.append(f'يوجد {trailing_spaces} قيمة تحتوي على مسافات زائدة')

        # فحص الأحرف غير المرئية
        invisible_chars = sum(1 for v in non_empty if any(ord(c) < 32 for c in str(v) if c != ' '))
        if invisible_chars > 0:
            issues.append(f'يوجد {invisible_chars} قيمة تحتوي على أحرف غير مرئية')

        # فحص التكرارات العالية (قد يكون عمود معرف)
        unique_ratio = len(non_empty.unique()) / len(non_empty)
        if unique_ratio < 0.1 and len(non_empty) > 10:
            issues.append('قيم مكررة بنسبة عالية جداً (قد يكون عمود تصنيف)')

        if data_type == 'text':
            # فحص القيم النصية غير الموحدة (مثل أسماء المدن)
            values = non_empty.unique()
            normalized = {str(v).strip().lower() for v in values}
            if len(normalized) < len(values):
                issues.append('يوجد اختلافات في كتابة القيم المتشابهة (مثل: الرياض / الرياض )')

        return issues

    def get_summary(self) -> Dict[str, Any]:
        """الحصول على ملخص كامل عن الملف"""
        summary = {
            'file_name': self.file_name,
            'file_size_kb': round(self.file_size / 1024, 2),
            'file_size_mb': round(self.file_size / (1024 * 1024), 2),
            'file_type': self.file_extension,
            'rows': self.profile.get('rows', 0),
            'columns': self.profile.get('columns', 0),
            'sheets': self.profile.get('sheets', []),
            'duplicates': self.profile.get('duplicates', 0),
            'duplicate_percentage': self.profile.get('duplicate_percentage', 0),
            'column_summary': {}
        }

        for col, analysis in self.profile.get('column_analysis', {}).items():
            summary['column_summary'][col] = {
                'empty_percentage': analysis['empty_percentage'],
                'unique_count': analysis['unique_count'],
                'data_type': analysis['data_type'],
                'has_issues': len(analysis.get('potential_issues', [])) > 0
            }

        return summary

    def get_full_profile(self) -> Dict[str, Any]:
        """الحصول على الملف الكامل للمعالجة"""
        return self.profile

    def run(self) -> Dict[str, Any]:
        """تشغيل التحليل الكامل"""
        if not self.load_file():
            return {'error': 'فشل في تحميل الملف'}

        self.analyze_structure()
        return self.get_summary()


# ============================================================
# مثال للاستخدام (اختبار)
# ============================================================
if __name__ == "__main__":
    # اختبار التحليل
    test_file = "test_data.xlsx"
    profiler = DataProfiler(test_file)
    result = profiler.run()
    print("📊 نتائج التحليل:")
    print(result)