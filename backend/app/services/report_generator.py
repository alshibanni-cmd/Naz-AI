# backend/app/services/report_generator.py

import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import os
from typing import Dict, Any

class ReportGenerator:
    """
    إنشاء تقرير PDF يوضح عملية تنظيف البيانات بالكامل
    """

    def __init__(self, original_df: pd.DataFrame, cleaned_df: pd.DataFrame, 
                 summary: Dict[str, Any], file_name: str = "report.pdf"):
        """
        Args:
            original_df: DataFrame الأصلي قبل التنظيف
            cleaned_df: DataFrame بعد التنظيف
            summary: ملخص العمليات من DataCleaner
            file_name: اسم ملف التقرير الناتج
        """
        self.original_df = original_df
        self.cleaned_df = cleaned_df
        self.summary = summary
        self.file_name = file_name
        self.file_path = os.path.join(os.getcwd(), "reports", file_name)

    def generate(self) -> str:
        """
        إنشاء التقرير وحفظه كـ PDF
        Returns: مسار الملف الناتج
        """
        # التأكد من وجود مجلد reports
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

        # إنشاء المستند
        doc = SimpleDocTemplate(
            self.file_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )

        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(
            name='Arabic',
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            alignment=TA_RIGHT,
            encoding='utf-8'
        ))
        styles.add(ParagraphStyle(
            name='ArabicTitle',
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=24,
            alignment=TA_CENTER,
            encoding='utf-8'
        ))
        styles.add(ParagraphStyle(
            name='ArabicHeading',
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=20,
            alignment=TA_RIGHT,
            encoding='utf-8'
        ))
        styles.add(ParagraphStyle(
            name='ArabicCenter',
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            encoding='utf-8'
        ))

        story = []

        # ============================================================
        # 1. العنوان الرئيسي
        # ============================================================
        story.append(Paragraph("📊 تقرير تنظيف البيانات", styles['ArabicTitle']))
        story.append(Spacer(1, 0.5*cm))
        story.append(Paragraph(
            f"تم إنشاؤه في: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            styles['ArabicCenter']
        ))
        story.append(Spacer(1, 1*cm))

        # ============================================================
        # 2. ملخص عام
        # ============================================================
        story.append(Paragraph("📋 ملخص عام", styles['ArabicHeading']))
        story.append(Spacer(1, 0.3*cm))

        summary_data = [
            ["المؤشر", "قبل التنظيف", "بعد التنظيف"],
            ["عدد الصفوف", str(self.summary['rows_before']), str(self.summary['rows_after'])],
            ["عدد الأعمدة", str(self.summary['columns_before']), str(self.summary['columns_after'])],
            ["الصفوف المحذوفة", "-", str(self.summary['rows_before'] - self.summary['rows_after'])],
            ["التكرارات المحذوفة", "-", str(self.summary['changes'].get('duplicates_removed', 0))],
        ]

        table = Table(summary_data, colWidths=[5*cm, 4*cm, 4*cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.5*cm))

        # ============================================================
        # 3. العمليات المنفذة
        # ============================================================
        story.append(Paragraph("⚙️ العمليات المنفذة", styles['ArabicHeading']))
        story.append(Spacer(1, 0.3*cm))

        ops_text = ""
        for op in self.summary.get('operations', []):
            ops_text += f"• {op}<br/>"

        if self.summary.get('changes', {}).get('duplicates_removed', 0) > 0:
            ops_text += f"• 🗑️ تم حذف {self.summary['changes']['duplicates_removed']} صف مكرر<br/>"
        if self.summary.get('changes', {}).get('cells_trimmed', 0) > 0:
            ops_text += f"• ✂️ تم تنظيف {self.summary['changes']['cells_trimmed']} خلية<br/>"
        if self.summary.get('changes', {}).get('dates_standardized', 0) > 0:
            ops_text += f"• 📅 تم توحيد {self.summary['changes']['dates_standardized']} قيمة تاريخ<br/>"

        story.append(Paragraph(ops_text, styles['Arabic']))
        story.append(Spacer(1, 0.5*cm))

        # ============================================================
        # 4. التنبيهات (إن وجدت)
        # ============================================================
        if self.summary.get('warnings'):
            story.append(Paragraph("⚠️ تنبيهات", styles['ArabicHeading']))
            story.append(Spacer(1, 0.3*cm))
            warnings_text = ""
            for w in self.summary['warnings']:
                warnings_text += f"• {w}<br/>"
            story.append(Paragraph(warnings_text, styles['Arabic']))
            story.append(Spacer(1, 0.5*cm))

        # ============================================================
        # 5. عينة من البيانات (قبل وبعد)
        # ============================================================
        story.append(PageBreak())
        story.append(Paragraph("📊 عينة من البيانات (قبل التنظيف)", styles['ArabicHeading']))
        story.append(Spacer(1, 0.3*cm))

        # عرض أول 5 صفوف من البيانات الأصلية
        sample_original = self.original_df.head(5)
        sample_data = [list(sample_original.columns)] + sample_original.values.tolist()
        sample_table = Table(sample_data, colWidths=[3*cm] * len(sample_original.columns))
        sample_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(sample_table)
        story.append(Spacer(1, 0.5*cm))

        story.append(PageBreak())
        story.append(Paragraph("📊 عينة من البيانات (بعد التنظيف)", styles['ArabicHeading']))
        story.append(Spacer(1, 0.3*cm))

        # عرض أول 5 صفوف من البيانات النظيفة
        sample_cleaned = self.cleaned_df.head(5)
        sample_data = [list(sample_cleaned.columns)] + sample_cleaned.values.tolist()
        sample_table = Table(sample_data, colWidths=[3*cm] * len(sample_cleaned.columns))
        sample_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgreen),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(sample_table)

        # ============================================================
        # 6. تذييل
        # ============================================================
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph(
            "تم إنشاء هذا التقرير بواسطة Naz AI - مساعدك الذكي لتنظيف البيانات",
            styles['ArabicCenter']
        ))
        story.append(Paragraph(
            "جميع الحقوق محفوظة © 2026",
            styles['ArabicCenter']
        ))

        # بناء المستند
        doc.build(story)
        return self.file_path

    def get_file_path(self) -> str:
        """إرجاع مسار ملف التقرير"""
        return self.file_path


# ============================================================
# مثال للاستخدام (اختبار)
# ============================================================
if __name__ == "__main__":
    # بيانات وهمية للاختبار
    test_data = {
        'الاسم': ['أحمد', 'محمد', 'خالد', 'سارة', 'نور'],
        'المدينة': ['الرياض', 'جدة', 'الرياض', 'جدة', 'الدمام'],
        'القيمة': [100, 200, 300, 400, 500]
    }
    df = pd.DataFrame(test_data)
    cleaned_df = df.copy()
    cleaned_df.loc[0, 'القيمة'] = 150  # تغيير للاختبار

    summary = {
        'rows_before': 5,
        'rows_after': 5,
        'columns_before': 3,
        'columns_after': 3,
        'operations': ['تنظيف المسافات', 'توحيد الأحرف العربية'],
        'changes': {
            'duplicates_removed': 0,
            'cells_trimmed': 3,
            'dates_standardized': 0
        },
        'warnings': []
    }

    report = ReportGenerator(df, cleaned_df, summary, "test_report.pdf")
    path = report.generate()
    print(f"✅ تم إنشاء التقرير في: {path}")