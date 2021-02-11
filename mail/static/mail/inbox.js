document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send email after submit form 
  document.querySelector('form').onsubmit = send_mail;
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function send_mail() {

  event.preventDefault()

  // define const for each form value
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print emails
      console.log(result);
      // ... do something else with emails ...
  });
  load_mailbox('sent');
  return false;
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails array
      console.log(emails);
      console.log(emails.length);
      
      for (var i = 0; i < emails.length; i++) {
        var obj = emails[i];

        // create a new div element
        const mail = document.createElement("div");
        mail.className = "row rounded-right";
        // add the newly created element and its content into the DOM
        const a = document.getElementById("emails-view");
        const div = a.appendChild(mail)
        
        const user = document.createElement("div");
        user.className = "col";
        if (mailbox === 'inbox') {
          user.innerHTML = obj.sender;
          div.appendChild(user);
        } else {
          user.innerHTML = obj.recipients;
          div.appendChild(user);
        }
        const subject = document.createElement("div");
        subject.className = "col-6";
        subject.innerHTML = obj.subject;
        div.appendChild(subject)

        const time = document.createElement("div");
        time.className = "col text-right";
        time.innerHTML = obj.timestamp;
        div.appendChild(time);
        
        // make loop just one time
        // div.appendChild(br)
      }
      

      
      
  // ... do something else with emails ...
  });
}