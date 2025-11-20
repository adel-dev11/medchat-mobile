"""
Response Generator - نظام توليد الردود الذكية من ملف JSON
يرد على المستخدم بمعلومات طبية حقيقية من ملف HumanDO.json
"""

import random
import json
from typing import Dict, Any

class ResponseGenerator:
    """Generate intelligent interactive responses"""

    def __init__(self, disease_data_path: str = None):
        """Initialize Response Generator with optional disease data"""
        self.disease_data = {}
        if disease_data_path:
            try:
                with open(disease_data_path, 'r', encoding='utf-8') as f:
                    self.disease_data = json.load(f)
                print(f"✅ تم تحميل بيانات الأمراض من: {disease_data_path}")
            except Exception as e:
                print(f"⚠️ لم يتم تحميل ملف الأمراض: {e}")

        self.follow_up_questions = {
            "symptoms": [
                "منذ متى بدأت تشعر بهذه الأعراض؟",
                "هل الأعراض مستمرة أم تأتي وتختفي؟",
                "هل تتناول أي دواء حالياً؟",
                "هل لديك أمراض مزمنة؟",
                "هل الأعراض تزداد سوءاً مع الوقت؟"
            ],
            "disease": [
                "هل تعاني من أي أعراض من هذا المرض؟",
                "هل أحد في عائلتك يعاني من نفس المرض؟",
                "هل ترغب في نصائح للوقاية؟",
                "هل زرت الطبيب بخصوص هذا المرض؟"
            ],
            "medication": [
                "هل تأخذ هذا الدواء حالياً؟",
                "هل عندك حساسية من أي دواء؟",
                "هل استشرت الطبيب قبل تناول هذا الدواء؟"
            ]
        }

        self.greeting_responses = [
            "👋 أهلاً! كيف حالك اليوم؟",
            "🌸 السلام عليكم! أنا هنا لمساعدتك في أي استفسار طبي.",
            "😊 مرحباً بك! كيف أقدر أساعدك النهارده؟"
        ]

        self.general_tips = [
            "شرب الماء بانتظام يساعد الجسم على التعافي",
            "الراحة الجيدة والنوم الكافي عنصر أساسي للصحة",
            "تجنب القلق والتوتر قدر الإمكان",
            "تناول طعام متوازن وغني بالخضروات والفواكه",
            "مارس الرياضة الخفيفة مثل المشي"
        ]

   
    def generate_response(self, message: str, intent: str, context: Dict[str, Any]) -> str:
        """Generate intelligent response based on intent"""

        if intent == "greet":
            return random.choice(self.greeting_responses)

        elif intent == "report_symptoms":
            return self._generate_symptom_response(message, context)

        elif intent == "ask_about_disease":
            return self._generate_disease_response(message, context)

        elif intent == "ask_medical_advice":
            return self._generate_advice_response(context)

        elif intent == "emergency":
            return "🚨 حالة طارئة! برجاء الاتصال الفوري برقم الطوارئ 123."

        elif intent == "goodbye":
            return "👋 أتمنى لك الشفاء العاجل. لا تتردد في الرجوع وقت ما تحتاج."

        else:
            return "🤔 لم أفهم تماماً، ممكن توضح لي أكثر عن حالتك؟"

    
    def _generate_symptom_response(self, message: str, context: Dict[str, Any]) -> str:
        symptoms = context.get("symptoms", [])
        if symptoms:
            symptom = symptoms[-1]
            response = f"أفهم أنك تشعر بـ **{symptom}**. ممكن توضحلي أكتر؟"
        else:
            response = "هل يمكنك وصف الأعراض اللي تشعر بها بالتفصيل؟"

        follow_up = random.choice(self.follow_up_questions["symptoms"])
        return f"{response}\n\n{follow_up}"

    def _generate_disease_response(self, message: str, context: Dict[str, Any]) -> str:
        diseases = context.get("diseases", [])
        if not diseases:
            return "هل يمكنك تحديد اسم المرض الذي تريد معرفة معلومات عنه؟"

        disease = diseases[-1].lower()

      
        for d in self.disease_data.get("diseases", []):
            if d["name"].lower() == disease:
                info = d
                tips = "\n".join([f"• {t}" for t in info.get("treatment", ["استشر الطبيب لمزيد من التفاصيل"])])
                return (
                    f"📘 **معلومات عن {d['name']}**\n\n"
                    f"🔹 *الوصف:* {d.get('description', 'لا يوجد وصف')}\n"
                    f"🔹 *الأعراض:* {', '.join(d.get('symptoms', []))}\n"
                    f"🔹 *العلاج:* \n{tips}\n\n"
                    f"هل ترغب في معرفة طرق الوقاية؟"
                )

        return f"لم أجد معلومات عن **{disease}** حالياً، لكن يمكنك سؤالي عن مرض آخر."

    
    def _generate_advice_response(self, context: Dict[str, Any]) -> str:
        response = "بناءً على ما ذكرت، أنصحك بالتالي:\n"
        tips = random.sample(self.general_tips, 3)
        tips_text = "\n".join([f"• {tip}" for tip in tips])
        return f"{response}\n{tips_text}\n\n⚠️ تذكير: هذه النصائح لا تغني عن استشارة الطبيب."

