const renderPeep = require("../templates/peep")
const renderAuthoredPeep = require("../templates/authoredPeep")

const feed = document.getElementById('feed');

let currentUser = {
  userid: null,
  handle: null,
  token: null
};

const checkFetch = (response) => {
  if (!response.ok) {
    throw Error(response.status);
  } else {
    return response;
  }
};

const fetchAllPeeps = (callback) => {
  fetch("https://chitter-backend-api-v2.herokuapp.com/peeps")
  .then(response => response.json()
  .then(peeps => callback(peeps)))
  .catch(error => {
    console.log("Fetch all peeps error:", error)
  })
};

const setupDeleteButtons = () => {
  let deletePeepButtons = document.querySelectorAll('.peep__delete-icon')
  console.log('hello')
  console.log(deletePeepButtons)
  deletePeepButtons.forEach(button => {
    button.addEventListener('click', () => {
      console.log('delete button clicked')
      let peep = button.closest('.peep');
      console.log('closest peep', peep);
      tryDeletePeep(peep.dataset.peepId);
    });
  });
};


const showAllPeeps = (peeps) => {
  console.log('inside show all peeps')
  peeps.forEach((peep) => {
    if (peep.user.id == currentUser.userid) {
      feed.insertAdjacentHTML('beforeend', renderAuthoredPeep(peep, peep.id));
    } else {
      feed.insertAdjacentHTML('beforeend', renderPeep(peep, peep.id));
    }
  });
  setupDeleteButtons();
};

const refreshPeeps = () => {
  feed.innerHTML = "";
  fetchAllPeeps((peeps) => showAllPeeps(peeps));
};

refreshPeeps()

const modalButtons = document.querySelectorAll('[data-target-modal]')
const modalCloseButtons = document.querySelectorAll('[data-modal-close]')
const overlay = document.getElementById('overlay')

modalButtons.forEach(button => {
  button.addEventListener('click', () => {
    let modal = document.querySelector(button.dataset.targetModal);
    /* selecting the modal the button is targeting,
    it converts the data attributes to camel case:
    button.target.modal = button.targetModal */
    showModal(modal);
  });
});

modalCloseButtons.forEach(button => {
  button.addEventListener('click', () => {
    let modal = button.closest('.modal');
    // finds the closest parent element that is a modal
    hideModal(modal);
  });
});

const tryDeletePeep = (peepid) => {
  console.log('inside tryDeletePeep');
  fetch(`https://chitter-backend-api-v2.herokuapp.com/peeps/${peepid}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Token token=${currentUser.token}`,
    'Content-Type': 'application/json'
  }})
  .then((response) => {
    return checkFetch(response);
  })
  .then(
    peepDeleteSuccess(peepid)
  )
  .catch((error) => {
    console.log('create peep error:', error)
    let errString = error.toString()
    errorElement = document.getElementById('peep-create-error');
    flashError(errString, errorElement);
  });
};

const peepDeleteSuccess = (peepid) => {
  let peep = document.querySelector(`[data-peep-id="${peepid}"]`);
  peep.remove();
};

overlay.addEventListener('click', () => {
  let modals = document.querySelectorAll('.modal.active')
  // selecting all the active (visible) modals
  modals.forEach(modal => {
    hideModal(modal);
  });
});

const showModal = (modal) => {
  modal.classList.add('active');
  overlay.classList.add('active');
};

const hideModal = (modal) => {
  modal.classList.remove('active');
  overlay.classList.remove('active');
  let error = modal.querySelector('.error.active');
  if (error) {
    hideError(error);
  };
  let inputs = modal.querySelectorAll('input');
  inputs.forEach((input) => {
    input.value = ""
  });
  // value doesn't reset because it's not a form - might change this
};

const signupFormButton = document.getElementById('signup-form-submit')

signupFormButton.addEventListener('click', () => {
  let handle = document.getElementById('signup-form-handle').value;
  let password = document.getElementById('signup-form-password').value;
  attemptSignup(handle, password)
});

const attemptSignup = (handle, password) => {
  fetch("https://chitter-backend-api-v2.herokuapp.com/users", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: `{"user": {"handle":"${handle}", "password":"${password}"}}`
  })
  .then((response) => {
    return checkFetch(response);
  })
  .then(() => {
    signUpSuccess(handle);
  })
  .catch((error) => {
    let errString = error.toString()
    if (errString.includes('422')) {
      errString = "That username is already taken"
    }
    let errorElement = document.getElementById('signup-error');
    flashError(errString, errorElement);
  });
};

const signUpSuccess = (handle) => {
  const signupFormModal = document.getElementById('signup-form');
  hideModal(signupFormModal);
  const successModal = document.getElementById('signup-success');
  const signupWelcome = document.getElementById('signup-welcome');
  signupWelcome.textContent = `Your account has been created successfully, welcome to Chitter ${handle}.`;
  showModal(successModal);
};

const logInSuccess = (handle, response) => {
  const loginFormModal = document.getElementById('login-form');
  hideModal(loginFormModal);
  currentUser.handle = handle;
  response.json().then((body) => {
    currentUser.userid = body.user_id;
    currentUser.token = body.session_key;
    loggedInView();
  }).then(refreshPeeps())
};

const loggedInView = () => {
  hideButton(document.getElementById('signup-button'));
  hideButton(document.getElementById('login-button'));
  showButton(document.getElementById('logout-button'));
  showButton(document.getElementById('peep-button'));
};

const showButton = (button) => {
  button.classList.add('active');
};

const hideButton = (button) => {
  button.classList.remove('active');
};

const flashError = (error, errorElement) => {
  errorElement.textContent = error
  showError(errorElement);
}

const showError = (error) => {
  error.classList.add('active');
};

const hideError = (error) => {
  error.classList.remove('active');
};

const attemptLogin = (handle, password) => {
  fetch("https://chitter-backend-api-v2.herokuapp.com/sessions", {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{"session": {"handle":"${handle}", "password":"${password}"}}`
  })
  .then((response) => {
    return checkFetch(response);
  })
  .then((response) => {
    logInSuccess(handle, response);
  })
  .catch((error) => {
    let errString = error.toString()
    errorElement = document.getElementById('login-error');
    flashError(errString, errorElement);
  });
};

const loginFormButton = document.getElementById('login-form-submit')

loginFormButton.addEventListener('click', () => {
  let handle = document.getElementById('login-form-handle').value;
  let password = document.getElementById('login-form-password').value;
  attemptLogin(handle, password)
});

const scrollToTopButton = document.getElementById('scroll-to-top-button')

scrollToTopButton.addEventListener('click', () => {
  document.body.scrollTop = 0; 
  document.documentElement.scrollTop = 0;
  // for different browsers
});

const createPeepButton = document.getElementById('peep-create-form-submit');

createPeepButton.addEventListener('click', () => {
  let content = document.getElementById('peep-create-content').value;
  attemptCreatePeep(content)
});

const attemptCreatePeep = (content) => {
  fetch("https://chitter-backend-api-v2.herokuapp.com/peeps", {
  method: 'POST',
  headers: {
    'Authorization': `Token token=${currentUser.token}`,
    'Content-Type': 'application/json'
  },
  body: `{"peep": {"user_id": ${currentUser.userid}, "body":" ${content}"}}`
  })
  .then((response) => {
    return checkFetch(response);
  })
  .then((response) => {
    peepCreateSuccess(response);
  })
  .catch((error) => {
    console.log('create peep error:', error)
    let errString = error.toString()
    errorElement = document.getElementById('peep-create-error');
    flashError(errString, errorElement);
  });
};

const peepCreateSuccess = (response) => {
  const peepCreateModal = document.getElementById('peep-create-form');
  response.json().then((peep) => {
    feed.insertAdjacentHTML('afterbegin', renderPeep(peep));
    hideModal(peepCreateModal);
  })
  // .then(refreshPeeps())
  /* I choose not to refresh here as if the program gets here the peep was
  created successfully, so a full refresh is unnecessary and slow */
};
