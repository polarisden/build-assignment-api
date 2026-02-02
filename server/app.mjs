import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());


app.post("/assignments", async (req, res) => {
  const newPost = {...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date()
  }

  // Validate required fields
  if (!newPost.title || !newPost.content || !newPost.category || 
      !newPost.length || !newPost.user_id || !newPost.status) {
    return res.status(400).json({
      message: "Server could not create assignment because there are missing data from client"
    })
  }

  try {
    const result = await connectionPool.query(`
      INSERT INTO assignments (title, content, category, length, user_id, status, created_at, updated_at, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      newPost.title,
      newPost.content,
      newPost.category,
      newPost.length,
      newPost.user_id,
      newPost.status,
      newPost.created_at,
      newPost.updated_at,
      newPost.published_at
    ])

    return res.status(201).json({
      message: "Created assignment sucessfully",
      data: result.rows[0]
    })
  } catch (error) {
    console.log("Error:", error.message)
    return res.status(500).json({
      message: "Server could not create assignment because database connection"
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
