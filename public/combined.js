// Function to fetch combined data
function fetchCombinedData() {
    fetch('/combined-data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Process the received data and display it on the page
        const combinedDataDiv = document.getElementById('combinedData');
        combinedDataDiv.innerHTML = '';
  
        data.forEach(item => {
          // Display each piece of information in the received data
          const postInfo = document.createElement('div');
          postInfo.innerHTML = `
            <p><strong>Post ID:</strong> ${item.post_id}</p>
            <p><strong>Title:</strong> ${item.post_title}</p>
            <p><strong>Content:</strong> ${item.content}</p>
            <p><strong>Author:</strong> ${item.author}</p>
            <p><strong>Comment:</strong> ${item.comment}</p>
            <p><strong>Category:</strong> ${item.category}</p>
            <hr>
          `;
          combinedDataDiv.appendChild(postInfo);
        });
      })
      .catch(error => {
        console.error('There was a problem fetching combined data:', error.message);
      });
  }
  
  // Call the function to fetch combined data when the page loads
  window.onload = function () {
    fetchCombinedData();
  };
  