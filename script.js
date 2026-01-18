
const navbar = document.querySelector('.navbar');
const bars = document.querySelector('.fa-bars');
const xmark = document.querySelector('.fa-xmark');
const humburgerMenu = document.querySelector('.humburger');

humburgerMenu.addEventListener('click', () => {
    navbar.classList.toggle('active');
    xmark.classList.toggle('active');
    bars.classList.toggle('active');
});

/////////////////////////////////////////////////////////////////////////////////////////////

// 1. تعريف الرابط في بداية الملف لضمان قراءته من قبل جميع الدوال
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzqRLJLuIIUOf5utsujSDbZoaA8IfeL4DWzk8mfZs_eD9IfFOG74r20zUH0GSISvyYeow/exec'; 

async function loadOffers() {
    const container = document.getElementById('offersContainer');
    
    // التحقق من وجود الحاوية في الصفحة لتجنب خطأ JavaScript
    if (!container) return;

    try {
        // رسالة التحميل (تظهر فور استدعاء الدالة)
        container.innerHTML = `
            <div id="loading-msg" style="width: 100%; text-align: center; padding: 50px 0;">
                <p style="color: var(--luxury-gold); font-size: 22px; font-family: var(--main-font); font-weight: bold;">
                   جاري تحميل العروض الحصرية...
                </p>
            </div>`;

        // جلب البيانات مع تحديد النوع offers
        const response = await fetch(`${GAS_URL}?action=list&type=offers`);
        
        if (!response.ok) throw new Error("فشل الاتصال بالسيرفر");

        const allOffers = await response.json();

        // مسح رسالة التحميل بمجرد وصول البيانات
        container.innerHTML = ''; 

        if (!allOffers || allOffers.length === 0) {
            container.innerHTML = `
                <p style="color:var(--text-gray); text-align:center; width:100%; font-family: var(--main-font);">
                    لا توجد عروض حصرية متاحة حالياً.
                </p>`;
            return;
        }

        // إنشاء الكروت
        allOffers.forEach(offer => {
            // ربط البيانات بالأعمدة بناءً على أسماء جدول Offers الخاص بك
            const title = offer.title || 'عرض خاص';
            const mainImg = offer.main_image || 'img/default-property.png';
            const desc = offer.description || 'لا يوجد وصف متاح لهذا العرض حالياً';
            const id = offer.id || '';
            const price = offer.discounted_price || offer.base_price || ''; 

            const card = `
                <div class="service-box offer-box">
                    <div class="img-box">
                        <img src="${mainImg}" alt="${title}" onerror="this.src='img/default-property.png'">
                    </div>
                    <h3>${title}</h3>
                    ${price ? `<p style="color: var(--luxury-gold); font-weight: bold; margin-bottom: 5px; font-size: 20px;">السعر: ${price}</p>` : ''}
                    <p>${desc}</p>
                    <a href="ProductsDetails.html?id=${id}&source=offers" class="details-btn">اطلع علي العرض</a>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error("Offers Error:", error);
        container.innerHTML = `
            <p style="color:red; text-align:center; width:100%; font-family: var(--main-font);">
                حدث خطأ أثناء تحميل العروض، تأكد من اتصال الإنترنت.
            </p>`;
    }
}

// 2. تشغيل الدوال عند تحميل المستند
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('offersContainer')) {
        loadOffers();
    }
});


function scrollOffers(direction) {
    const container = document.getElementById('offersContainer');
    // مقدار المسافة التي سيتحركها السكرول (عرض الكارت + الفراغ)
    const scrollAmount = 390; 

    if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMsg');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // تغيير حالة الزر
            submitBtn.innerText = 'جاري الإرسال...';
            submitBtn.disabled = true;

            // تجميع البيانات بالشكل الصحيح (Matching your Google Sheet Columns)
            const payload = {
                action: 'create', // تأكد أن الأكشن 'create' كما في الـ Dashboard
                type: 'messages',
                data: {
                    name: document.getElementById('userName').value,
                    phone: document.getElementById('userPhone').value,
                    message: document.getElementById('userMessage').value,
                    // فصل التاريخ والوقت لضمان نزولهم في الأعمدة المخصصة (E و F)
                    date: new Date().toLocaleDateString('ar-EG'), 
                    time: new Date().toLocaleTimeString('ar-EG')
                }
            };

            try {
                // ملاحظة: يُفضل استخدام 'cors' بدلاً من 'no-cors' إذا كان السكربت يدعم ذلك 
                // ولكن سنلتزم بالـ POST المتوافق مع الـ Dashboard
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    // حذفنا no-cors لأنها تمنعك من معرفة هل السيرفر استلم البيانات فعلاً أم لا
                    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                    body: JSON.stringify(payload)
                });

                // مسح الحقول وإظهار رسالة النجاح
                contactForm.reset();
                if (successMsg) successMsg.style.display = 'block';
                submitBtn.innerText = 'تم الإرسال بنجاح';

                setTimeout(() => {
                    if (successMsg) successMsg.style.display = 'none';
                    submitBtn.innerText = 'ارسال';
                    submitBtn.disabled = false;
                }, 5000);

            } catch (error) {
                console.error('Error:', error);
                alert('حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.');
                submitBtn.innerText = 'ارسال';
                submitBtn.disabled = false;
            }
        });
    }
});