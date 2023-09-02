// Base URL
const baseURL = "https://api.nf.domains/nfd/";

// Function to introduce delay
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateProgressBar(completed, total) {
  const percentage = Math.floor((completed / total) * 100);
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = `${percentage}%`;
  progressBar.textContent = `${percentage}%`;
}

// Attach event listener to form submit
document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById('nfdForm');
  const pickWinnerBtn = document.getElementById('pickWinnerBtn');

  form.addEventListener('submit', async function(event) {
    event.preventDefault();



    const filterByTwitter = document.getElementById('filterTwitter').checked;
    const inputValue = document.getElementById('nfd').value;
    let url1 = `${baseURL}${inputValue}?view=brief&poll=false&nocache=false`;

    try {
      let response = await fetch(url1);
      let data1 = await response.json();
      const appID = data1.appID;
      let url2 = `${baseURL}v2/search?parentAppID=${appID}&limit=200&vproperty=twitter&vvalue=&view=full`;

      response = await fetch(url2);
      let data2 = await response.json();
      let items = data2.nfds;
      let filteredItems = [];
      let twitterItems = Array();

      if (filterByTwitter) {
            // Initialize progress bar

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.properties && item.properties.verified && item.properties.verified.twitter) {
            twitterItems.push(item);
          };
        };
        let completedRequests = 0;
        let totalRequests = twitterItems.length;
        for (let i = 0; i < twitterItems.length; i++) {
          const item = twitterItems[i];
          if (item.properties && item.properties.verified && item.properties.verified.twitter) {
            // Introduce delay to avoid rate limiting
            

            const name = item.name;
            const badgeApiUrl = `${baseURL}badges/${name}`;
            response = await fetch(badgeApiUrl);
            completedRequests++;
            updateProgressBar(completedRequests, totalRequests);
            document.getElementById('progressContainer').style.display = 'block';
            await sleep(6000);
            let badgeData = await response.json();
            if (badgeData.twitter) {
              const twitterName = badgeData.twitter[0].twitterName || '';
              if (twitterName.toLowerCase() === name.toLowerCase()) {
                item.twitterName = twitterName;  // Add twitterName to the item
                filteredItems.push(item);
              }
            }
          }
        }
      } else {
        filteredItems = items;
      }

      let outputList = '<ul>';
      for (const item of filteredItems) {
        const name = item.name || "Unknown";
        const link = `${name}`;
        if (filterByTwitter) {
          const twitterHandle = item.properties.verified.twitter || "Unknown";
          const twitterName = item.twitterName || "Unknown";
          outputList += `<li><a href="https://app.nf.domains/name/${link}" target="_blank">Name: ${name}</a>, Twitter Handle: ${twitterHandle}</li>`;
        } else {
          outputList += `<li><a href="https://app.nf.domains/name/${link}" target="_blank">Name: ${name}</a></li>`;
        }
      }
      outputList += '</ul>';
      document.getElementById('output').innerHTML = outputList;
      pickWinnerBtn.style.display = 'block';

    } catch (error) {
      console.log(error);
      document.getElementById('output').textContent = "An error occurred while making the API calls.";
    }
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
