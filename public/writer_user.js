// writer_user.js



 // Function to create tag button
function createTagButton(postId) {
  const tagButton = document.createElement('button');
  tagButton.textContent = 'Tag';
  tagButton.addEventListener('click', () => {
    const tagName = prompt('Enter tag name:');
    if (tagName !== null && tagName.trim() !== '') {
      tagPost(postId, tagName);
    }
  });
  return tagButton;
}



// / Function to tag a post
function tagPost(postId, tagName) {
  fetch(`/writer_user/tag/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tagName })
  })
    .then(response => {
      if (response.ok) {
        fetchPosts(); // Fetch posts again to update the list after tagging
      } else {
        console.error('Failed to tag the post!');
      }
    })
    .catch(error => {
      console.error('Error tagging post:', error);
    });
}




  //
// Function to create delete button
function createDeleteButton(postId) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deletePost(postId);
    });
    return deleteButton;
  }



 
  
  // Function to delete a post
  function deletePost(postId) {
    fetch(`/writer_user/${postId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          fetchPosts(); // Fetch posts again to update the list after deletion
        } else {
          console.error('Failed to delete the post!');
        }
      })
      .catch(error => {
        console.error('Error deleting post:', error);
      });
  }
  

// Function to fetch posts from the server
function fetchPosts() {
  fetch('/writer_user')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const posts = data.posts;
      const postsList = document.getElementById('posts');
      postsList.innerHTML = ''; // Clear previous posts

      posts.forEach(async post => {
        const listItem = document.createElement('li');
        listItem.textContent = `${post.post_title}: ${post.content}:(${post.name})`;

        const deleteButton = createDeleteButton(post.post_id);
        const tagButton = createTagButton(post.post_id);

        listItem.appendChild(tagButton);
        listItem.appendChild(deleteButton);

        // Fetch and display tags for each post
        const tags = await fetchTagsForPost(post.post_id);
        const tagsDiv = document.createElement('div');
        tagsDiv.textContent = `Tags: ${tags.map(tag => `#${tag.name}`).join(', ')}`; // Extract tag names and join with comma
        listItem.appendChild(tagsDiv);

        postsList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error.message);
    });
}

// Function to fetch tags for a specific post from the server
function fetchTagsForPost(postId) {
  return fetch(`/writer_user/tags/${postId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => data.tags)
    .catch(error => {
      console.error('Error fetching tags:', error.message);
      return [];
    });
}



  
  // Call fetchPosts function when the page loads
  window.onload = function () {
    fetchPosts();
  };
  