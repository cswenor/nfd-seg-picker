// Base URL
const baseURL = "https://api.nf.domains/nfd/";

// Attach event listener to form submit
document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById('nfdForm');
  const pickWinnerBtn = document.getElementById('pickWinnerBtn');
  
  form.addEventListener('submit', function(event) {
    event.preventDefault();


    const filterByTwitter = document.getElementById('filterTwitter').checked;

    const inputValue = document.getElementById('nfd').value;
    let url1 = `${baseURL}${inputValue}?view=brief&poll=false&nocache=false`;

    fetch(url1)
      .then(response => response.json())
      .then(data1 => {
        const appID = data1.appID;
        let url2 = `${baseURL}v2/search?parentAppID=${appID}&limit=200&vproperty=twitter&vvalue=&view=full`;

        return fetch(url2);
      })
      .then(response => response.json())
      .then(data2 => {
        let items = data2.nfds;

        // Apply the Twitter filter only if the checkbox is checked
        if (filterByTwitter) {
          items = data2.nfds.filter(item => item.properties && item.properties.verified && item.properties.verified.twitter);
        }
        let outputList = '<ul>';
        
        for (const item of items) {
          const name = item.name || "Unknown";
          const link = `${name}`;
          if (filterByTwitter) {
            const twitterHandle = item.properties.verified.twitter || "Unknown";
            outputList += `<li><a href="https://app.nf.domains/name/${link}" target="_blank">Name: ${name}</a>, Twitter Handle: ${twitterHandle}</li>`;
          } else {
            outputList += `<li><a href="https://app.nf.domains/name/${link}" target="_blank">Name: ${name}</a></li>`;
          }
        }

        outputList += '</ul>';
        document.getElementById('output').innerHTML = outputList;

        // Show the 'Pick a Winner' button
        pickWinnerBtn.style.display = 'block';
      })
      .catch(error => {
        console.log(error);
        document.getElementById('output').textContent = "An error occurred while making the API calls.";
      });

  // Pick a winner when the button is clicked
pickWinnerBtn.addEventListener('click', function() {
  
  const items = document.querySelectorAll('#output li');
  if (items.length > 0) {
    let interval;
    let counter = 0;
    const maxCycles = 20;  // Number of cycles before picking a winner
    const cycleSpeed = 100; // Milliseconds per cycle

    interval = setInterval(() => {
      // Cycle through the list
      const randomIndex = Math.floor(Math.random() * items.length);
      const candidate = items[randomIndex].textContent;

      document.getElementById('winnerOutput').innerHTML = `<p>Current Candidate: ${candidate}</p>`;
      document.getElementById('winnerOutput').scrollIntoView({ behavior: 'smooth' });

      if (counter >= maxCycles) {
        // Stop cycling and pick a winner
        clearInterval(interval);
        const winnerIndex = Math.floor(Math.random() * items.length);
        const winner = items[winnerIndex].textContent;

        // Display the winner with confetti
        document.getElementById('winnerOutput').innerHTML = `<h2>The Winner is:</h2> <p>${winner}</p>`;
        // Scroll to the winnerOutput div to show the winner
        document.getElementById('winnerOutput').scrollIntoView({ behavior: 'smooth' });
        confetti({
          spread: 180,
          particleCount: 150
        });


      }

      counter++;
    }, cycleSpeed);
  }
});
});
});