window.onload = function() {
    const tagName = prompt('Enter the tag name:'); // Prompt for tag name input

    fetch(`/tag/${tagName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const posts = data;

            const postsContainer = document.getElementById('posts');
            postsContainer.innerHTML = ''; // Clear previous content

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.innerHTML = `
                    <h3>${post.post_title}</h3>
                    <p>${post.content}</p>
                    <hr>
                `;
                postsContainer.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error('There was a problem fetching posts:', error.message);
        });
};
