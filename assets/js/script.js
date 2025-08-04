"use strict";

// element toggle function
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
const chevronIcon = document.getElementById("chevron-icon");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);

  // Toggle between chevron-down and chevron-up
  if (sidebar.classList.contains("active")) {
    chevronIcon.setAttribute("name", "chevron-up");
  } else {
    chevronIcon.setAttribute("name", "chevron-down");
  }

});

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () {
  elementToggleFunc(this);
});

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const targetPage = this.getAttribute("data-nav-link");

    for (let j = 0; j < pages.length; j++) {
      if (pages[j].getAttribute("data-page") === targetPage) {
        pages[j].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[j].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }
  });
}



// Contact form submission handling
form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Set timestamp
  document.getElementById('timestamp').value = new Date().toLocaleString();
  
  // Debug: Log form data
  const formData = new FormData(form);
  console.log('Form data being sent:');
  for (let [key, value] of formData.entries()) {
    console.log(key + ': ' + value);
  }
  
  // Show loading state
  formBtn.innerHTML = '<ion-icon name="paper-plane" style="color: black;"></ion-icon><span style="color: black;">Sending...</span>';
  formBtn.setAttribute("disabled", "");
  
  // Send email using EmailJS
  emailjs.sendForm('service_2jbyniv', 'template_8e7ku3z', form)
    .then(function() {
      // Success
      alert('Message sent successfully! Thank you for contacting me.');
      form.reset();
      formBtn.innerHTML = '<ion-icon name="paper-plane" style="color: black;"></ion-icon><span style="color: black;">Send Message</span>';
      formBtn.removeAttribute("disabled");
    }, function(error) {
      // Error
      console.log('EmailJS Error:', error);
      alert('Failed to send message. Error: ' + (error.text || error.message || 'Unknown error') + '. Please try again or contact me directly at rutwikdh@usc.edu');
      formBtn.innerHTML = '<ion-icon name="paper-plane" style="color: black;"></ion-icon><span style="color: black;">Send Message</span>';
      formBtn.removeAttribute("disabled");
    });
});



