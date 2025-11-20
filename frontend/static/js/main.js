// ===== Global Variables =====
let currentLanguage = 'en';
let selectedSymptoms = [];
let currentConditions = [];

// ===== Translations =====
const translations = {
    en: {
        'symptoms-title': 'Select Symptoms',
        'age-label': 'Your Age:',
        'analyze-text': 'Analyze',
        'disclaimer-text': '⚠️ DISCLAIMER: This is an AI tool for informational purposes only. It is NOT a medical diagnosis. Always consult with a qualified healthcare professional.',
        'welcome-msg': 'Welcome! I\'m your AI Symptom Checker. Select your symptoms and I\'ll help you understand possible conditions.',
        'results-title': 'Possible Conditions',
        'booking-title': 'Book a Doctor',
        'name-label': 'Full Name',
        'phone-label': 'Phone Number',
        'email-label': 'Email (Optional)',
        'condition-label': 'Condition',
        'book-text': 'Book Appointment',
        'booking-success': 'Booking request submitted! A doctor will contact you soon.',
        'footer-text': '© 2025 AI Symptom Checker. For informational purposes only.',
        'no-symptoms': 'Please select at least one symptom',
        'analyzing': 'Analyzing your symptoms...',
        'match': 'Match',
        'severity': 'Severity'
    },
    ar: {
        'symptoms-title': 'اختر الأعراض',
        'age-label': 'عمرك:',
        'analyze-text': 'تحليل',
        'disclaimer-text': '⚠️ تنبيه: هذه أداة ذكية لأغراض إعلامية فقط. إنها ليست تشخيصاً طبياً. استشر دائماً متخصصاً طبياً مؤهلاً.',
        'welcome-msg': 'مرحباً! أنا مساعدك الذكي لفحص الأعراض. اختر أعراضك وسأساعدك في فهم الحالات المحتملة.',
        'results-title': 'الحالات المحتملة',
        'booking-title': 'حجز موعد مع الطبيب',
        'name-label': 'الاسم الكامل',
        'phone-label': 'رقم الهاتف',
        'email-label': 'البريد الإلكتروني (اختياري)',
        'condition-label': 'الحالة',
        'book-text': 'حجز موعد',
        'booking-success': 'تم تقديم طلب الحجز! سيتصل بك الطبيب قريباً.',
        'footer-text': '© 2025 فاحص الأعراض الذكي. لأغراض إعلامية فقط.',
        'no-symptoms': 'يرجى اختيار عرض واحد على الأقل',
        'analyzing': 'جاري تحليل أعراضك...',
        'match': 'التطابق',
        'severity': 'الشدة'
    }
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguage();
    loadSymptoms();
    setupEventListeners();
    addWelcomeMessage();
});

// ===== Language Management =====
function initializeLanguage() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLanguage = btn.dataset.lang;
            setLanguage(currentLanguage);
        });
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update all text elements
    updateTranslations();
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Reload symptoms with new language
    loadSymptoms();
}

function updateTranslations() {
    const trans = translations[currentLanguage];
    Object.keys(trans).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = trans[key];
        }
    });
}

// ===== Load Symptoms =====
async function loadSymptoms() {
    try {
        const response = await fetch(`/api/symptoms?lang=${currentLanguage}`);
        const data = await response.json();
        
        const symptomsList = document.getElementById('symptoms-list');
        symptomsList.innerHTML = '';
        
        data.symptoms.forEach(symptom => {
            const div = document.createElement('div');
            div.className = 'symptom-item';
            div.innerHTML = `
                <input type="checkbox" id="symptom-${symptom.id}" value="${symptom.id}">
                <label for="symptom-${symptom.id}">${symptom.name}</label>
            `;
            
            div.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedSymptoms.push(symptom.id);
                } else {
                    selectedSymptoms = selectedSymptoms.filter(s => s !== symptom.id);
                }
                updateAnalyzeButton();
            });
            
            symptomsList.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading symptoms:', error);
    }
}

function updateAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.disabled = selectedSymptoms.length === 0;
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Analyze button
    document.getElementById('analyze-btn').addEventListener('click', analyzeSymptoms);
    
    // Chat input
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Booking form
    document.getElementById('booking-form').addEventListener('submit', submitBooking);
}

// ===== Analyze Symptoms =====
async function analyzeSymptoms() {
    if (selectedSymptoms.length === 0) {
        alert(translations[currentLanguage]['no-symptoms']);
        return;
    }
    
    const age = parseInt(document.getElementById('age').value) || 30;
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: selectedSymptoms, age: age })
        });
        
        const data = await response.json();
        currentConditions = data.conditions;
        
        displayResults(data.conditions);
        addBotMessage(translations[currentLanguage]['analyzing']);
    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        addBotMessage('Error analyzing symptoms. Please try again.');
    }
}

// ===== Display Results =====
function displayResults(conditions) {
    const resultsSection = document.getElementById('results-section');
    const conditionsList = document.getElementById('conditions-list');
    
    conditionsList.innerHTML = '';
    
    conditions.forEach(condition => {
        const card = document.createElement('div');
        card.className = 'condition-card';
        
        const severityClass = `severity-${condition.severity}`;
        const lang = currentLanguage;
        const name = lang === 'ar' ? condition.name_ar : condition.name;
        const desc = lang === 'ar' ? condition.description_ar : condition.description;
        const recs = lang === 'ar' ? condition.recommendations_ar : condition.recommendations;
        
        card.innerHTML = `
            <div class="condition-header">
                <div class="condition-name">${name}</div>
                <div class="match-score">${condition.match_score}% ${translations[lang]['match']}</div>
            </div>
            <div class="condition-severity ${severityClass}">${condition.severity}</div>
            <p style="font-size: 13px; margin-bottom: 8px;">${desc}</p>
            <div style="font-size: 12px; color: #6b7280;">
                <strong>Recommendations:</strong><br>
                ${recs.join(', ')}
            </div>
            <button class="btn btn-primary" style="margin-top: 10px; width: 100%; font-size: 12px;" 
                    onclick="selectConditionForBooking('${condition.id}', '${name}')">
                Book Doctor for This
            </button>
        `;
        
        conditionsList.appendChild(card);
    });
    
    resultsSection.style.display = 'block';
    
    // Update condition select in booking form
    const conditionSelect = document.getElementById('condition-select');
    conditionSelect.innerHTML = '<option value="">Select a condition</option>';
    conditions.forEach(condition => {
        const option = document.createElement('option');
        option.value = condition.id;
        option.textContent = currentLanguage === 'ar' ? condition.name_ar : condition.name;
        conditionSelect.appendChild(option);
    });
}

function selectConditionForBooking(conditionId, conditionName) {
    document.getElementById('condition-select').value = conditionId;
    document.querySelector('.booking-panel').scrollIntoView({ behavior: 'smooth' });
}

// ===== Chat Functions =====
function addWelcomeMessage() {
    const msg = translations[currentLanguage]['welcome-msg'];
    addBotMessage(msg);
}

function addBotMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, language: currentLanguage })
        });
        
        const data = await response.json();
        addBotMessage(data.response);
    } catch (error) {
        console.error('Error sending message:', error);
        addBotMessage('Error processing your message. Please try again.');
    }
}

// ===== Booking Functions =====
async function submitBooking(e) {
    e.preventDefault();
    
    const name = document.getElementById('patient-name').value;
    const phone = document.getElementById('patient-phone').value;
    const email = document.getElementById('patient-email').value;
    const condition = document.getElementById('condition-select').value;
    
    if (!name || !phone || !condition) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const response = await fetch('/api/book-doctor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                phone: phone,
                email: email,
                condition: condition,
                symptoms: selectedSymptoms
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('booking-form').style.display = 'none';
            document.getElementById('booking-info').style.display = 'block';
            
            setTimeout(() => {
                document.getElementById('booking-form').style.display = 'flex';
                document.getElementById('booking-info').style.display = 'none';
                document.getElementById('booking-form').reset();
            }, 3000);
        }
    } catch (error) {
        console.error('Error booking doctor:', error);
        alert('Error submitting booking. Please try again.');
    }
}

