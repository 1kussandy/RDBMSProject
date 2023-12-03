// Function to fetch posts from the server for viewer.html
function fetchAllPostsForViewer() {
  fetch('/viewer')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const posts = data; // Assuming the JSON response directly contains posts data

      const postsList = document.getElementById('posts');
      postsList.innerHTML = ''; // Clear previous posts

      posts.forEach(post => {
        
        const listItem = document.createElement('li');
        const postContainer = document.createElement('div');
        postContainer.style.border = '1px solid black'; // Border around the post container
        postContainer.style.padding = '10px'; // Padding for space inside the container
        postContainer.style.marginBottom = '10px'; // Margin to create space between posts

        const titleElement = document.createElement('h2');
        titleElement.textContent = post.post_title;
        titleElement.style.color = 'red'; // Red color for title

        const contentElement = document.createElement('p');
        contentElement.textContent = post.content;
        contentElement.style.color = 'green'; // Green color for content

        const categoryElement = document.createElement('p');
        categoryElement.textContent = `Category: (${post.name})`;
        categoryElement.style.color = 'blue'; // Blue color for category

        const addCommentButton = document.createElement('button');
        addCommentButton.textContent = 'Add Comment';

        // Inside the forEach loop where you create the "Add Comment" button for each post
      
        addCommentButton.style.backgroundColor = 'blue';
        addCommentButton.style.color = 'white';
        addCommentButton.style.border = 'none';
        addCommentButton.style.padding = '8px 16px';
        addCommentButton.style.cursor = 'pointer';
        addCommentButton.style.borderRadius = '4px';
        addCommentButton.style.marginTop = '8px';
        addCommentButton.style.transition = 'background-color 0.3s ease-in-out';

        addCommentButton.addEventListener('mouseenter', () => {
          addCommentButton.style.backgroundColor = 'darkblue';
        });

        addCommentButton.addEventListener('mouseleave', () => {
          addCommentButton.style.backgroundColor = 'blue';
        });
        addCommentButton.style.backgroundColor = 'blue'; // Blue background for the button
        addCommentButton.onclick = () => showCommentBox(post.post_id);

        postContainer.appendChild(titleElement);
        postContainer.appendChild(contentElement);
        postContainer.appendChild(categoryElement);
        postContainer.appendChild(addCommentButton);

        // Create a div to hold comments for each post
        const commentsDiv = document.createElement('div');
        commentsDiv.setAttribute('id', `comments-${post.post_id}`); // Unique ID for each post's comments
        postContainer.appendChild(commentsDiv);

        listItem.appendChild(postContainer);
        postsList.appendChild(listItem);
        




        
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error.message);
    });
}












// Function to sort posts by total number of comments
function sortPostsByComments() {
  fetch('/sort-by-comments') // Fetch sorted posts from the server
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const posts = data; // Assuming the JSON response directly contains sorted posts data

      const postsList = document.getElementById('posts');
      postsList.innerHTML = ''; // Clear previous posts

      posts.forEach(post => {
        // Create the HTML elements for each post
        const listItem = document.createElement('li');
        const postContainer = document.createElement('div');
        postContainer.style.border = '1px solid black'; // Border around the post container
        postContainer.style.padding = '10px'; // Padding for space inside the container
        postContainer.style.marginBottom = '10px'; // Margin to create space between posts

        const titleElement = document.createElement('h2');
        titleElement.textContent = post.post_title;
        titleElement.style.color = 'red'; // Red color for title

        const contentElement = document.createElement('p');
        contentElement.textContent = post.content;
        contentElement.style.color = 'green'; // Green color for content

       
        const totalComments = document.createElement('p');
        totalComments.textContent = `Total_Comments: (${post.total_comments})`;

        // Append the elements to the post container
        postContainer.appendChild(titleElement);
        postContainer.appendChild(contentElement);
        postContainer.appendChild(totalComments);



        // Append the post container to the list item
        listItem.appendChild(postContainer);

        // Append the list item to the posts list
        postsList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('There was a problem sorting posts by comments:', error.message);
    });
}









// Function to show comment box
function showCommentBox(postId) {
  const commentBox = document.createElement('div');
  commentBox.innerHTML = `
    <textarea id="commentText-${postId}" rows="4" cols="50" placeholder="Write your comment here..."></textarea>
    <br>
    <button onclick="saveComment(${postId})">Done</button>
  `;

  const postsList = document.getElementById(`comments-${postId}`);
  postsList.appendChild(commentBox);
}

// Function to save comment to like_comment table
function saveComment(postId) {
  const commentText = document.getElementById(`commentText-${postId}`).value;

  // Perform a fetch request to save the comment
  fetch('/save-comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ post_id: postId, comment: commentText })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Comment saved successfully:', data);
      // Display the comment below the post
      const commentsDiv = document.getElementById(`comments-${postId}`);
      const commentParagraph = document.createElement('p');
      commentParagraph.textContent = commentText;
      commentsDiv.appendChild(commentParagraph);

      // Optionally, update the UI to reflect the comment addition
      // Refresh the page or load the comments again from the server
    })
    .catch(error => {
      console.error('There was a problem saving the comment:', error.message);
    });
}

// Call fetchAllPostsForViewer function when the page loads
window.onload = function () {
  fetchAllPostsForViewer();
};
