# backend/app/services/data_cleaner.py

import pandas as pd
import numpy as np
import re
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime

class DataCleaner:
    """
    محرك تنظيف البيانات داخل المحادثة
    يقوم بفهم أمر المستخدم وتنفيذ العمليات المناسبة على DataFrame
    """

    def __init__(self, df: pd.DataFrame, command: str):
        self.original_df = df.copy()
        self.df = df.copy()
        self.command = command.lower()
        self.summary = {
            'operations': [],
            'rows_before': len(df),
            'rows_after': len(df),
            'columns_before': len(df.columns),
            'columns_after': len(df.columns),
            'changes': {
                'duplicates_removed': 0,
                'cells_trimmed': 0,
                'dates_standardized': 0,
                'missing_filled': 0,
                'columns_dropped': [],
                'rows_dropped': 0
            },
            'warnings': []
        }

    def parse_command(self) -> Dict[str, bool]:
        """تحليل الأمر النصي واستخراج العمليات المطلوبة"""
        cmd = self.command
        operations = {
            'remove_duplicates': False,
            'trim_spaces': False,
            'standardize_dates': False,
            'fill_missing': False,
            'remove_empty_rows': False,
            'remove_empty_columns': False,
            'standardize_text': False,
            'clean_numbers': False,
            'generate_report': False
        }

        arabic_keywords = {
            'remove_duplicates': ['مكرر', 'تكرار', 'duplicate', 'حذف المكررات', 'أزل المكررات'],
            'trim_spaces': ['مسافة', 'فراغ', 'trim', 'قص', 'تنظيف المسافات'],
            'standardize_dates': ['تاريخ', 'تنسيق التاريخ', 'date', 'توحيد التواريخ'],
            'fill_missing': ['فارغ', 'missing', 'قيمة مفقودة', 'تقدير', 'املأ'],
            'remove_empty_rows': ['صف فارغ', 'حذف الصفوف الفارغة', 'empty rows'],
            'remove_empty_columns': ['عمود فارغ', 'حذف الأعمدة الفارغة', 'empty columns'],
            'standardize_text': ['نص', 'توحيد', 'تنسيق النص', 'text', 'standardize'],
            'clean_numbers': ['رقم', 'عدد', 'تنسيق الأرقام', 'numbers'],
            'generate_report': ['تقرير', 'report', 'ملخص', 'أحصائيات']
        }

        for op, keywords in arabic_keywords.items():
            for kw in keywords:
                if kw in cmd:
                    operations[op] = True
                    break

        if not any(operations.values()):
            operations['trim_spaces'] = True
            operations['remove_empty_rows'] = True
            operations['standardize_dates'] = True
            self.summary['warnings'].append('⚠️ لم تحدد عملية محددة، تم تطبيق التنظيف الأساسي')

        return operations

    def remove_duplicates(self) -> int:
        before = len(self.df)
        self.df = self.df.drop_duplicates()
        removed = before - len(self.df)
        self.summary['changes']['duplicates_removed'] = removed
        self.summary['changes']['rows_dropped'] += removed
        self.summary['operations'].append(f'إزالة {removed} صف مكرر')
        return removed

    def trim_spaces(self) -> int:
        trimmed_count = 0
        for col in self.df.select_dtypes(include=['object', 'string']).columns:
            original = self.df[col].astype(str)
            cleaned = original.str.strip()
            cleaned = cleaned.str.replace(r'\s+', ' ', regex=True)
            self.df[col] = cleaned
            trimmed_count += (original != cleaned).sum()
        self.summary['changes']['cells_trimmed'] = trimmed_count
        self.summary['operations'].append(f'تنظيف المسافات من {trimmed_count} خلية')
        return trimmed_count

    def standardize_dates(self) -> int:
        standardized = 0
        for col in self.df.columns:
            try:
                self.df[col] = pd.to_datetime(self.df[col], errors='ignore')
                if pd.api.types.is_datetime64_any_dtype(self.df[col]):
                    self.df[col] = self.df[col].dt.strftime('%Y-%m-%d')
                    standardized += len(self.df[col].dropna())
                    self.summary['changes']['dates_standardized'] = standardized
                    self.summary['operations'].append(f'توحيد التواريخ في عمود {col}')
            except:
                continue
        return standardized

    def fill_missing(self) -> int:
        filled = 0
        for col in self.df.columns:
            if self.df[col].dtype == 'object':
                self.df[col] = self.df[col].fillna('')
                self.df[col] = self.df[col].replace(['NaN', 'nan', 'None', 'NULL', ''], '')
                filled += (self.df[col] == '').sum()
            else:
                if pd.api.types.is_numeric_dtype(self.df[col]):
                    mean_val = self.df[col].mean()
                    self.df[col] = self.df[col].fillna(mean_val)
                    filled += self.df[col].isna().sum()
        self.summary['changes']['missing_filled'] = filled
        self.summary['operations'].append(f'معالجة {filled} قيمة مفقودة')
        return filled

    def remove_empty_rows(self) -> int:
        before = len(self.df)
        self.df = self.df.dropna(how='all')
        removed = before - len(self.df)
        self.summary['changes']['rows_dropped'] += removed
        self.summary['operations'].append(f'حذف {removed} صف فارغ بالكامل')
        return removed

    def remove_empty_columns(self) -> int:
        before = len(self.df.columns)
        empty_cols = self.df.columns[self.df.isnull().all()].tolist()
        self.df = self.df.drop(columns=empty_cols, errors='ignore')
        removed = before - len(self.df.columns)
        self.summary['changes']['columns_dropped'].extend(empty_cols)
        self.summary['operations'].append(f'حذف {removed} عمود فارغ بالكامل')
        return removed

    def standardize_text(self) -> int:
        standardized = 0
        arabic_map = {
            'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
            'ة': 'ه',
            'ى': 'ي',
            'ؤ': 'و', 'ئ': 'ي'
        }

        for col in self.df.select_dtypes(include=['object', 'string']).columns:
            for old, new in arabic_map.items():
                self.df[col] = self.df[col].astype(str).str.replace(old, new, regex=False)
            standardized += 1
        self.summary['operations'].append('توحيد الأحرف العربية')
        return standardized

    def clean_numbers(self) -> int:
        cleaned = 0
        for col in self.df.columns:
            try:
                self.df[col] = pd.to_numeric(self.df[col], errors='ignore')
                if pd.api.types.is_numeric_dtype(self.df[col]):
                    self.df[col] = self.df[col].round(2)
                    cleaned += 1
            except:
                continue
        self.summary['operations'].append(f'تنظيف {cleaned} أعمدة رقمية')
        return cleaned

    def run(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        operations = self.parse_command()

        if operations['remove_empty_columns']:
            self.remove_empty_columns()
        if operations['remove_empty_rows']:
            self.remove_empty_rows()
        if operations['remove_duplicates']:
            self.remove_duplicates()
        if operations['trim_spaces']:
            self.trim_spaces()
        if operations['standardize_text']:
            self.standardize_text()
        if operations['clean_numbers']:
            self.clean_numbers()
        if operations['standardize_dates']:
            self.standardize_dates()
        if operations['fill_missing']:
            self.fill_missing()

        self.summary['rows_after'] = len(self.df)
        self.summary['columns_after'] = len(self.df.columns)

        return self.df, self.summary

    def get_cleaned_data(self) -> pd.DataFrame:
        return self.df

    def get_summary(self) -> Dict[str, Any]:
        return self.summary

    def get_report_text(self) -> str:
        summary = self.summary
        text = f"""
📊 **ملخص تنظيف البيانات**

- الصفوف: {summary['rows_before']} → {summary['rows_after']} (تم حذف {summary['rows_before'] - summary['rows_after']})
- الأعمدة: {summary['columns_before']} → {summary['columns_after']}

**العمليات المنفذة:**
"""
        for op in summary['operations']:
            text += f"- ✅ {op}\n"

        if summary['changes']['duplicates_removed'] > 0:
            text += f"- 🗑️ تم حذف {summary['changes']['duplicates_removed']} صف مكرر\n"
        if summary['changes']['cells_trimmed'] > 0:
            text += f"- ✂️ تم تنظيف {summary['changes']['cells_trimmed']} خلية\n"
        if summary['changes']['dates_standardized'] > 0:
            text += f"- 📅 تم توحيد {summary['changes']['dates_standardized']} قيمة تاريخ\n"
        if summary['changes']['missing_filled'] > 0:
            text += f"- 📝 تم معالجة {summary['changes']['missing_filled']} قيمة مفقودة\n"

        if summary['warnings']:
            text += "\n**⚠️ تنبيهات:**\n"
            for w in summary['warnings']:
                text += f"- {w}\n"

        text += "\n✅ الملف جاهز للاستخدام الآن."
        return text