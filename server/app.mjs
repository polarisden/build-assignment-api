import express, { json } from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json())

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  let result 
  try {result = await connectionPool.query(`
      select * from assignments
    `)

    return res.status(200).json({
      data: result.rows
    })
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    })
  }  
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId
  console.log(assignmentIdFromClient)
  let result 
  try {
    result = await connectionPool.query(`select * from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    )
    
    if (result.rows.length === 0){
      return res.status(404).json({
        message: "Server could not find a requested assignment"
      })
    }

    return res.status(200).json({
      data: result.rows[0]
    })
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    })
  }
})

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId
  const updatedAssignment = { ...req.body, updated_at: new Date()}
  let result
  try {
    result = await connectionPool.query(`
      update assignments
      set title = $2,
          content = $3,
          category = $4,
          length = $5,
          user_id = $6,
          status = $7,
          created_at = $8,
          updated_at = $9,
          published_at = $10
      WHERE assignment_id = $1
      `,[
        assignmentIdFromClient,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.length,
        updatedAssignment.user_id,
        updatedAssignment.status,
        updatedAssignment.created_at,
        updatedAssignment.updated_at,
        updatedAssignment.published_at
      ])

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Server could not find a requested assignment to delete"
        })
      }

      return res.status(200).json(
        { message: "Updated assignment successfully" }
      )
  } catch {
    return res.status(500).json({
      message: "Server could not find a requested assignment to update"
    })
  }
})

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId

  try {
    const result = await connectionPool.query(
      `delete from assignments
      where assignment_id = $1`,[assignmentIdFromClient])

    if (result.rowCount === 0){
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete"
      })
    }

    return res.status(200).json({
      message: "Deleted assignment successfully"
    })
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection"
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});