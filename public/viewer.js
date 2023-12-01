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
        listItem.textContent = `${post.post_title}: ${post.content}:(${post.name})`;

        // Create an "Add Comment" button for each post
        const addCommentButton = document.createElement('button');
        addCommentButton.textContent = 'Add Comment';
        addCommentButton.onclick = () => showCommentBox(post.post_id);
        listItem.appendChild(addCommentButton);

        // Create a div to hold comments for each post
        const commentsDiv = document.createElement('div');
        commentsDiv.setAttribute('id', `comments-${post.post_id}`); // Unique ID for each post's comments
        listItem.appendChild(commentsDiv);

        postsList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error.message);
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
