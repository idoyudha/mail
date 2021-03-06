document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send email after submit form 
  document.querySelector('form').onsubmit = send_mail;
  
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
      load_mailbox('sent');
  });
  return false;
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#open-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails array
      console.log(emails);

      for (let i = 0; i < emails.length; i++) {
        let obj = emails[i];

        // create a new div element
        const mail = document.createElement("div");
        mail.className = "row rounded-right";

        if (obj.read) {
          mail.id = "email_read";
        } else {
          mail.id = "email_unread";
        }

        // render details for every email data (only work for last loop)
        mail.addEventListener('click', () => {
          view_email(obj.id, obj.sender);
        })

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
        div.appendChild(subject);

        const time = document.createElement("div");
        time.className = "col text-right";
        timedate = obj.timestamp;
        time.innerHTML = timedate;
        div.appendChild(time);
      }
  });
}

function view_email(email_id, sender) {
  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-view').style.display = 'block';

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      
      // get text of email in h3
      let user = document.getElementById("user_email").textContent;
  
      // check is we are in sent directory
      if (user != sender) {
        document.querySelector('#open-view').innerHTML = `<button type="button" class="btn btn-sm btn-outline-primary mb-2 ml-2" id="reply">Reply</button>` + 
        `<button type="button" class="btn btn-sm btn-outline-success mb-2 ml-2" id="archive">Archive</button>`;
        // archieve functions
        if (email.archived) {
          document.getElementById("archive").addEventListener('click', () => {
            fetch(`/emails/${email_id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
            .then(() => load_mailbox('inbox'))
          });
          document.getElementById("archive").innerHTML = "Unarchive";
        } else {
          document.getElementById("archive").addEventListener('click', () => {
            fetch(`/emails/${email_id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
            .then(() => load_mailbox('inbox'))
          });
          document.getElementById("archive").innerHTML = "Archive";
        }
      } else {
        document.querySelector('#open-view').innerHTML = `<button type="button" class="btn btn-sm btn-outline-primary mb-2 ml-2" id="reply">Reply</button>`;
      }
    
      // Passing value to reply functions
      document.getElementById("reply").addEventListener('click', () => reply(email.sender, email.subject, email.timestamp, email.body));
    
      // create a new div element for email detail
      const mail = document.createElement("div");
      mail.className = "card text-white bg-dark mb-3";
      mail.id = "data";
    
      // add the newly created element and its content into the DOM
      const a = document.getElementById("open-view");
      const div = a.appendChild(mail);
    
      const subject = document.createElement("div");
      subject.className = "card-header";
      subject.id = "view-subject";
      subject.innerHTML = `${email.subject}`;
      div.appendChild(subject);
    
      const bd = document.createElement("div");
      bd.className = "card-body";
      const det = div.appendChild(bd);
    
      const detail = document.createElement("div");
      detail.id = "detail";
      detail.innerHTML = `${email.sender}` + `<br>` + `${email.timestamp}` + `<br>` + `To: ${email.recipients}` +  `<hr>`
      det.appendChild(detail);
    
      const body_text = document.createElement("div");
      body_text.id = "body_text";
      body_text.innerHTML = `<pre>${email.body}</pre>`;
      det.appendChild(body_text);
  });
}

function reply(sender, subject, timestamp, body) {
  // Load compose function
  compose_email();

  // Fill value as specification
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = `Re: ${subject}`;
  document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote:\n${body}\n`;
}
