// edit_post.js

window.onload = function () {
    // Fetch the post data from the URL or your preferred method
    const postId = /* Get the postId from the URL or form data */;
  
    // Fetch and populate the form with existing post data based on postId
  
    // Add event listener for form submission
    const editPostForm = document.getElementById('postForm');
    editPostForm.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const postTitle = document.querySelector('input[name="postTitle"]').value;
      const postContent = document.querySelector('textarea[name="postContent"]').value;
  
      // Make a POST request to update the post
      fetch(`/update_post/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postTitle, postContent }),
      })
        .then(response => {
          if (response.ok) {
            // Redirect or handle success message after updating the post
            window.location.href = '/writer_user.html';
          } else {
            console.error('Failed to update the post');
          }
        })
        .catch(error => {
          console.error('Error updating post:', error);
        });
    });
  };
  