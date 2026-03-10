document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM Elements ----
    const sections = {
        home: document.getElementById('section-home'),
        auth: document.getElementById('section-auth'),
        enrollment: document.getElementById('section-enrollment')
    };

    const nav = {
        home: document.getElementById('btn-home'),
        login: document.getElementById('btn-login-nav'),
        signup: document.getElementById('btn-signup-nav'),
        userProfile: document.getElementById('user-profile'),
        userName: document.getElementById('user-display-name'),
        logout: document.getElementById('btn-logout')
    };

    // Hero buttons
    const btnEnrollNow = document.getElementById('btn-enroll-now');
    const btnLearnMore = document.getElementById('btn-learn-more');

    // Auth toggles
    const toggleLogin = document.getElementById('toggle-login');
    const toggleSignup = document.getElementById('toggle-signup');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    // Multi-step Auth logic
    const currentUser = JSON.parse(localStorage.getItem('qhsUser'));

    // ---- Functions ----
    function showSection(sectionName) {
        Object.keys(sections).forEach(key => {
            if (key === sectionName) {
                sections[key].classList.remove('hidden');
                sections[key].classList.add('active');
            } else {
                sections[key].classList.add('hidden');
                sections[key].classList.remove('active');
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateNav() {
        const user = JSON.parse(localStorage.getItem('qhsUser'));
        if (user) {
            nav.login.classList.add('hidden');
            nav.signup.classList.add('hidden');
            nav.userProfile.classList.remove('hidden');
            nav.userName.textContent = `Hi, ${user.name.split(' ')[0]}`;
        } else {
            nav.login.classList.remove('hidden');
            nav.signup.classList.remove('hidden');
            nav.userProfile.classList.add('hidden');
        }
    }

    // Initialize Nav
    updateNav();

    // ---- Navigation Events ----
    nav.home.addEventListener('click', () => showSection('home'));
    
    nav.login.addEventListener('click', () => {
        showSection('auth');
        toggleLogin.click();
    });

    nav.signup.addEventListener('click', () => {
        showSection('auth');
        toggleSignup.click();
    });

    btnEnrollNow.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('qhsUser'));
        if (user) {
            showSection('enrollment');
        } else {
            showSection('auth');
            toggleSignup.click();
            alert('Please create an account or log in to continue enrollment.');
        }
    });

    btnLearnMore.addEventListener('click', () => {
        document.querySelector('.hero-image').scrollIntoView({ behavior: 'smooth' });
    });

    nav.logout.addEventListener('click', () => {
        localStorage.removeItem('qhsUser');
        updateNav();
        showSection('home');
    });

    // ---- Auth Events ----
    toggleLogin.addEventListener('click', () => {
        toggleLogin.classList.add('active');
        toggleSignup.classList.remove('active');
        formLogin.classList.remove('hidden');
        formSignup.classList.add('hidden');
    });

    toggleSignup.addEventListener('click', () => {
        toggleSignup.classList.add('active');
        toggleLogin.classList.remove('active');
        formSignup.classList.remove('hidden');
        formLogin.classList.add('hidden');
    });

    formSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        
        // Mock register
        const user = { name, email };
        localStorage.setItem('qhsUser', JSON.stringify(user));
        
        formSignup.reset();
        updateNav();
        // Redirect to enrollment
        showSection('enrollment');
    });

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        
        // Mock login
        const user = { name: "Student", email };
        localStorage.setItem('qhsUser', JSON.stringify(user));
        
        formLogin.reset();
        updateNav();
        showSection('enrollment');
    });

    // ---- Enrollment Multi-step Events ----
    let currentStep = 1;
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    const formEnrollment = document.getElementById('form-enrollment');
    const reviewContent = document.getElementById('review-content');

    function updateFormSteps() {
        formSteps.forEach(step => {
            step.classList.add('hidden');
            if (parseInt(step.id.split('-')[1]) === currentStep) {
                step.classList.remove('hidden');
            }
        });

        progressSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index < currentStep) {
                step.classList.add('active');
            }
        });
    }

    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            // Very basic validation check for Step 1
            const inputs = document.querySelectorAll('#step-1 input, #step-1 select');
            let valid = true;
            inputs.forEach(input => {
                if (input.required && !input.value) valid = false;
            });
            
            if (!valid) {
                alert('Please fill out all required fields.');
                return;
            }

            currentStep++;
            updateFormSteps();
        });
    });

    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateFormSteps();
        });
    });

    document.querySelector('.btn-next-review').addEventListener('click', () => {
        // Validation for step 2
        const level = document.getElementById('enroll-level').value;
        const prevSchool = document.getElementById('enroll-prevschool').value;
        
        if (!level || !prevSchool) {
            alert('Please select grade level and enter previous school.');
            return;
        }

        // Generate review HTML
        const formData = new FormData(formEnrollment);
        let html = '';
        
        const labels = {
            'entry.fname': 'First Name',
            'entry.lname': 'Last Name',
            'entry.dob': 'Date of Birth',
            'entry.gender': 'Gender',
            'entry.address': 'Address',
            'entry.contact': 'Contact No.',
            'entry.level': 'Grade Level',
            'entry.track': 'Track / Strand',
            'entry.prevschool': 'Previous School'
        };

        for (let [key, value] of formData.entries()) {
            if(labels[key]){
                html += `<div class="review-item"><strong>${labels[key]}:</strong> <span>${value || 'N/A'}</span></div>`;
            }
        }
        
        reviewContent.innerHTML = html;

        currentStep++;
        updateFormSteps();
    });

    // ---- Submit Enrollment ----
    const successModal = document.getElementById('success-modal');
    const btnSubmit = document.getElementById('btn-submit-enrollment');

    formEnrollment.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Mocking the request sending to "Google Drive" (Google Apps Script URL / Form endpoint)
        btnSubmit.textContent = 'Submitting to Drive...';
        btnSubmit.disabled = true;

        setTimeout(() => {
            successModal.classList.remove('hidden');
            btnSubmit.textContent = 'Submit Registration';
            btnSubmit.disabled = false;
            formEnrollment.reset();
            currentStep = 1;
            updateFormSteps();
        }, 1500);

        /* 
         * TO CONNECT TO A REAL GOOGLE DRIVE SCRIPT:
         * 
         * fetch('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL', {
         *   method: 'POST',
         *   body: new FormData(formEnrollment)
         * })
         * .then(res => res.json())
         * .then(data => {
         *      successModal.classList.remove('hidden');
         * })
         * .catch(err => console.error(err));
         */
    });

    document.getElementById('btn-close-modal').addEventListener('click', () => {
        successModal.classList.add('hidden');
        showSection('home');
    });

    // Disable track if not grade 11/12
    const gradeSelect = document.getElementById('enroll-level');
    const trackSelect = document.getElementById('enroll-track');
    
    gradeSelect.addEventListener('change', (e) => {
        if (e.target.value.includes('11') || e.target.value.includes('12')) {
            trackSelect.disabled = false;
        } else {
            trackSelect.value = 'None';
            trackSelect.disabled = true;
        }
    });
});
