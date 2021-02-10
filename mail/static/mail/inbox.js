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

      // Get data from json array
      for (var i = 0; i < emails.length; i++) {
        var obj = emails[i];
        var html_inbox = `<table class="table table-hover">
                          <tbody>
                            <tr>
                              <td class="text-left">${obj.sender}</td>
                              <td class="text-left">${obj.subject}</td>
                              <td class="text-right">${obj.timestamp}</td>
                            </tr>
                          </tbody>
                          </table>`

        var html_sent = `<table class="table table-hover">
                          <tbody>
                            <tr>
                              <td class="text-left">${obj.recipients}</td>
                              <td class="text-left">${obj.subject}</td>
                              <td class="text-right">${obj.timestamp}</td>
                            </tr>
                          </tbody>
                          </table>`
        if (mailbox === 'inbox') {
          document.getElementById("emails-view").innerHTML += html_inbox;
        }
        else if (mailbox === 'sent') {
          document.getElementById("emails-view").innerHTML += html_sent;
        }
        
      }
  // ... do something else with emails ...
  });
}