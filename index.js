const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path'); // Include the path module

const session = require('express-session');

const app = express();


app.use(express.json());

const PORT = process.env.PORT || 3000;
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));





app.use(session({
    secret: '12345', // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: false
  }));

//let session_user_id =0;



app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 10000000 } // Set the cookie expiration time to 10 minutes (600000 milliseconds)
  }));
  

// Configure express-session middleware


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'postdb',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


// 

app.get('/tag/:tagName', (req, res) => {
  const { tagName } = req.params;

  // Execute SQL query to fetch posts associated with the specified tag
  // Adjust the query based on your database structure
  db.query(`
      SELECT p.post_id, p.post_title, p.content
      FROM post p
      JOIN post_tag pt ON p.post_id = pt.post_id
      JOIN tag t ON pt.tag_id = t.tag_id
      WHERE t.name = ?
  `, [tagName], (err, results) => {
      if (err) {
          console.error('Error fetching posts:', err);
          res.status(500).json({ error: 'Error fetching posts' });
      } else {
          res.json(results);
      }
  });
});





// Backend endpoint to retrieve combined information from multiple tables
app.get('/combined-data', (req, res) => {
  const combinedQuery = `
  SELECT 
  p.post_id, 
  p.post_title, 
  p.content, 
  w.username AS author, 
  lc.comment_text AS comment, -- Use the 'comment_text' column here
  c.name AS category
FROM 
  post p
JOIN 
  writer_user w ON p.user_id = w.user_id
LEFT JOIN 
  like_comment lc ON p.post_id = lc.post_id
LEFT JOIN 
  post_category pc ON p.post_id = pc.post_id
LEFT JOIN 
  category c ON pc.category_id = c.category_id;

  `;

  db.query(combinedQuery, (err, result) => {
    if (err) {
      console.error('Error fetching combined data:', err);
      res.status(500).json({ error: 'Error fetching combined data' });
    } else {
      res.status(200).json(result);
    }
  });
});




// Root route handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });



  // Signup route handler - serves signup.html for the '/signup' route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
  });
  
  // Signin route handler - serves signin.html for the '/signin' route
  app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
  });
  
    // Signin route handler - serves signin.html for the '/signin' route
    app.get('/home', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
      });
      
    //   app.get('/writer_user', (req, res) => {
    //     res.sendFile(path.join(__dirname, 'public', 'writer_user.html'));
    //   });
      

    //   // Assuming you have a 'db' variable configured for your database connection

// Route to fetch posts
// Assuming you have a 'db' variable configured for your database connection

// Route to fetch posts
app.get('/writer_user', (req, res) => {
    // Query the database to get posts
    db.query('SELECT p.*,c.* FROM post p LEFT JOIN post_category pc ON p.post_id=pc.post_id LEFT JOIN category c ON c.category_id=pc.category_id', (err, results) => {
      if (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      } else {
        res.status(200).json({ posts: results });
      }
    });
  });
  


// RollBACK Deletes Posts

// 
app.delete('/writer_user/:postId', (req, res) => {
    const postId = req.params.postId; // Retrieve post ID from request parameters
  
    // Perform the deletion operation in the database based on postId
    // Use a transaction to ensure atomicity when deleting from multiple tables
    db.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        res.status(500).json({ error: 'Error starting transaction' });
        return;
      }
  
      // Delete from post_category table first
      db.query('DELETE FROM post_category WHERE post_id = ?', postId, (err) => {
        if (err) {
          console.error('Error deleting from post_category:', err);
          db.rollback(() => {
            res.status(500).json({ error: 'Error deleting from post_category' });
          });
          return;
        }
  
        // If deletion from post_category was successful, delete from post table
        db.query('DELETE FROM post WHERE post_id = ?', postId, (err) => {
          if (err) {
            console.error('Error deleting from post:', err);
            db.rollback(() => {
              res.status(500).json({ error: 'Error deleting from post' });
            });
            return;
          }
  
          // Commit the transaction if both deletions were successful
          db.commit((err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              db.rollback(() => {
                res.status(500).json({ error: 'Error committing transaction' });
              });
              return;
            }
            res.status(200).json({ message: 'Post and associated records deleted successfully' });
          });
        });
      });
    });
  });
  

   








  // Handle POST request to delete a post
app.post('/delete_post/:postId', (req, res) => {
    const postId = req.params.postId;

    // Query to delete the post with the specified ID
    db.query('DELETE FROM post WHERE post_id = ?', [postId], (err, result) => {
      if (err) {
        console.error('Error deleting post:', err);
        res.status(500).send('Error deleting post');
      } else {
        res.status(200).send('Post deleted successfully');
      }
    });
  });
  

      // tags 


//    // Define a route to fetch posts from the database
// app.get('/create_post', (req, res) => {
//     // Fetch posts from the database
//     db.query('SELECT * FROM posts WHERE user_id = ?', [req.session.userId], (err, posts) => {
//       if (err) {
//         console.error('Error fetching posts:', err);
//         res.status(500).send('Error fetching posts');
//         return;
//       }
//       console.log("POSTS OF USERS" + posts);

//       res.json(posts); // Send the fetched posts as JSON response
//     });
//   });
  









  app.get('/viewer', (req, res) => {
    // Fetch all posts from the database
    db.query('SELECT p.*,c.* FROM post p LEFT JOIN post_category pc ON p.post_id=pc.post_id LEFT JOIN category c ON c.category_id=pc.category_id    ', (err, posts) => {
      if (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Error fetching posts');
        return;
      }
  
  
      res.json(posts); // Send the fetched posts as JSON response
    });
  });
  
  
  


// Assuming you have already set up your Express app and configured your database connection (db variable)

// Endpoint to handle saving comments to the like_comment table
app.post('/save-comment', (req, res) => {

    const viewerId = req.session.userId; // Retrieve the user ID from the session

    const { post_id, comment } = req.body; // Assuming the request body contains post_id and comment
  
    // Perform the database query to insert the comment into the like_comment table
    db.query('INSERT INTO like_comment (post_id, viewer_id, comment_text) VALUES (?, ?, ?)', [post_id, viewerId, comment], (err, result) => {
       try {
        console.log('Comment saved successfully');
        res.status(200).json({ message: 'Comment saved successfully' });
      }
      catch (err) {
        console.error('Error saving comment:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          // Handle duplicate entry error if required
          res.status(200).json({ message: 'Duplicate entry error occurred' });
        } else {
          res.status(500).json({ error: 'Error saving comment' });
        }
      }
    });
  });    
  




//

// GET endpoint to fetch tags for a specific post
app.get('/writer_user/tags/:postId', (req, res) => {
  const postId = req.params.postId;

  // Query to fetch tags associated with the given post ID
  db.query('SELECT t.name FROM tag t JOIN post_tag pt ON t.tag_id = pt.tag_id WHERE pt.post_id = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error fetching tags:', err);
      res.status(500).json({ error: 'Error fetching tags' });
    } else {
      const tags = results.map(row => ({ name: row.name }));
      res.status(200).json({ tags });
    }
  });
});








  // viewer


// category








// Signup Endpoit


app.post('/signup', (req, res) => {
    const { fullname, username, password, email, userType } = req.body;

    
        // Redirect based on user type after successful signin
        if (userType === 'write_user') {
            
          // Insert user data into the database
    db.query(
        'INSERT INTO writer_user (fullname, username, password, email, userType) VALUES (?,?, ?, ?, ?)',
        [fullname, username, password, email, userType],
        (err, result) => {
          if (err) {
            console.error('Error creating user:', err);
            res.status(500).send('Error creating user');
            return;
          }
          // Redirect to signin page after successful signup
          res.redirect('/signin.html');
        }
      );
    

        } else if (userType === 'viewer') {
            


            db.query(
                'INSERT INTO viewer (fullname, username, password, email, userType) VALUES (?,?, ?, ?, ?)',
                [fullname, username, password, email, userType],
                (err, result) => {
                  if (err) {
                    console.error('Error creating user:', err);
                    res.status(500).send('Error creating user');
                    return;
                  }
                  // Redirect to signin page after successful signup
                  res.redirect('/signin.html');
                }
              );
        }
   
    });
// SignIn Endpoint
// SignIn Endpoint
// SignIn Endpoint
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
  
    // Check signin for write_user
    db.query(
      'SELECT * FROM writer_user WHERE username = ? AND password = ?',
      [username, password],
      (err, writerResults) => {
        if (err) {
          console.error('Error fetching writer user:', err);
          res.status(500).send('Error fetching user');
          return;
        }
  
        if (writerResults.length > 0) {
          // If the user exists in writer_user table, redirect to the write_user page

          req.session.userId =writerResults[0].user_id;
       // session_user_id = writerResults[0].user_id;
         console.log("Writer USer results " + writerResults[0].user_id);

         
          res.redirect('/writer_user.html');
        } else {
          // Check signin for viewer if user not found in writer_user table
          db.query(
            'SELECT * FROM viewer WHERE username = ? AND password = ?',
            [username, password],
            (err, viewerResults) => {
              if (err) {
                console.error('Error fetching viewer:', err);
                res.status(500).send('Error fetching user');
                return;
              }
  
              if (viewerResults.length > 0) {

                req.session.userId =viewerResults[0].viewer_id;


               // session_user_id = viewerResults[0].user_id;

                console.log("Writer USer results " + viewerResults[0].user_id);

                // If the user exists in viewer table, redirect to the viewer page
                res.redirect('/viewer.html');
              } else {
                // User not found in either table
                res.status(401).send('Invalid credentials');
              }
            }
          );
        }
      }
    );
  });
  






  // Assuming you've set up your Express app and database connection already

  app.post('/create_post', (req, res) => {
    const { postTitle, postContent, category } = req.body;
    const userId = req.session.userId; // Retrieve the user ID from the session
  
    // Insert the post data into the database
    db.query(
      'INSERT INTO post (post_title, content, user_id, created_date) VALUES (?, ?, ?, NOW())',
      [postTitle, postContent, userId],
      (err, result) => {
        if (err) {
          console.error('Error creating post:', err);
          res.status(500).send('Error creating post');
          return;
        }
  
        // Retrieve the post_id of the newly inserted post
        const postId = result.insertId;
  
        let categoryId;
  
        // Determine categoryId based on the selected category
        // Adjustments for category names and IDs based on existing categories
        if (category === 'News') {
          categoryId = 1; // Assuming 'News' category has ID 1 in the 'category' table
        } else if (category === 'Entertainment') {
          categoryId = 2; // Assuming 'Entertainment' category has ID 2
        } else if (category === 'Politics') {
          categoryId = 3; // Assuming 'Politics' category has ID 3
        } else if (category === 'Science') {
          categoryId = 4; // Assuming 'Science' category has ID 4
        } else if (category === 'Sports') {
          categoryId = 5; // Assuming 'Sports' category has ID 5
        } else {
          // Handle the scenario where the category is not found or set a default value
          categoryId = 0; // For example, setting it to 0 as a default value
        }
  
        // Insert data into the post_category table if categoryId is valid
        if (categoryId !== 0) {
          db.query(
            'INSERT INTO post_category (post_id, category_id) VALUES (?, ?)',
            [postId, categoryId],
            (err) => {
              if (err) {
                console.error('Error linking post to category:', err);
                res.status(500).send('Error linking post to category');
                return;
              }
  
              // Redirect or send a success message as needed
              res.redirect('/writer_user.html');
            }
          );
        } else {
          // Handle the scenario where the category is not found or invalid
          console.error('Invalid category:', category);
          res.status(400).send('Invalid category');
        }
      }
    );
  });
  

// Handle POST request for creating a new post


//

// Endpoint to handle adding a new writer_user
// app.post('/writer_user', (req, res) => {
//     res.redirect('/addpost.html');

//   });










// Assuming you have required dependencies and set up your server using Express

// Import required database connection or initialization code

// POST endpoint to tag a post
app.post('/writer_user/tag/:postId', (req, res) => {
  const postId = req.params.postId;
  const { tagName } = req.body;

  // Assuming you have a function to query your database to insert a tag
  // Replace `insertTag` with your actual database function
  insertTag(tagName)
    .then(tagId => {
      // Insert the tagged information into the post_tag table
      // Replace `insertPostTag` with your actual database function
      return insertPostTag(postId, tagId);
    })
    .then(() => {
      res.status(200).json({ message: 'Post tagged successfully' });
    })
    .catch(error => {
      console.error('Error tagging post:', error);
      res.status(500).json({ error: 'Error tagging post' });
    });
});

// Function to insert a new tag into the tag table
function insertTag(tagName) {
  return new Promise((resolve, reject) => {
    // Query to insert the tag into the tag table
    // Replace with your actual database query to insert the tag
    db.query('INSERT INTO tag (name) VALUES (?)', [tagName], (err, result) => {
      if (err) {
        reject(err);
      } else {
        // Resolve with the newly inserted tag's ID
        resolve(result.insertId);
      }
    });
  });
}

// Function to insert the tagged information into the post_tag table
function insertPostTag(postId, tagId) {
  return new Promise((resolve, reject) => {
    // Query to insert the post-tag association into the post_tag table
    // Replace with your actual database query to associate the tag with the post
    db.query('INSERT INTO post_tag (post_id, tag_id) VALUES (?, ?)', [postId, tagId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// GET endpoint to fetch tags for a specific post
app.get('/writer_user/tags/:postId', (req, res) => {
  const postId = req.params.postId;

  // Assuming you have a function to query your database to get tags for a post
  // Replace `getTagsForPost` with your actual database function
  getTagsForPost(postId)
    .then(tags => {
      res.status(200).json({ tags });
    })
    .catch(error => {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Error fetching tags' });
    });
});

// Function to get tags for a specific post from the database
function getTagsForPost(postId) {
  return new Promise((resolve, reject) => {
    // Query to retrieve tags associated with the given post ID from the database
    // Replace with your actual database query to fetch tags for a post
    db.query('SELECT tag.name FROM tag INNER JOIN post_tag ON tag.tag_id = post_tag.tag_id WHERE post_tag.post_id = ?', [postId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const tags = rows.map(row => row.name);
        resolve(tags);
      }
    });
  });
}














// index.js (or your route file)






// Endpoint to handle sorting posts by the total number of comments
app.get('/sort-by-comments', (req, res) => {
  // Perform a database query to retrieve posts sorted by total comments
  db.query('SELECT post.*, COUNT(like_comment.post_id) AS total_comments FROM post LEFT JOIN like_comment ON post.post_id = like_comment.post_id GROUP BY post.post_id ORDER BY total_comments DESC', (err, results) => {
    if (err) {
      console.error('Error sorting posts by comments:', err);
      res.status(500).json({ error: 'Error sorting posts by comments' });
    } else {
      console.log('Posts sorted by comments successfully');
      console.log(results)
      res.status(200).json(results);
    }
  });
});









///edit post


app.put('/update_post/:postId', (req, res) => {
  const postId = req.params.postId;
  const { newTitle, newContent } = req.body;

  db.query('UPDATE post SET post_title = ?, content = ? WHERE post_id = ?', [newTitle, newContent, postId], (err, result) => {
    if (err) {
      console.error('Error updating post:', err);
      res.status(500).json({ error: 'Error updating post' });
    } else {
      res.status(200).json({ message: 'Post updated successfully' });
    }
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


