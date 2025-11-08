import React from "react";
import styles from "./ComplaintList.module.css";

const ComplaintList = ({ complaints, userRole, onStatusUpdate, onComment }) => (
  <div className={styles.complaintList}>
    {complaints.length === 0 && <p>No complaints found.</p>}
    {complaints.map((c) => (
      <div className={styles.complaintCard} key={c._id}>
        <h4>{c.title}</h4>
        <p><strong>Department:</strong> {c.department}</p>
        <p><strong>Status:</strong> <span className={styles.status + " " + styles[c.status?.toLowerCase().replace("-", "")]}>{c.status}</span></p>
        <p>{c.description}</p>
        <div className={styles.meta}>
          <span>Created: {new Date(c.createdAt).toLocaleString()}</span>
        </div>
        {userRole === "authority" && (
          <form
            className={styles.statusForm}
            onSubmit={(e) => {
              e.preventDefault();
              onStatusUpdate(c._id, e.target.status.value);
            }}
          >
            <label>
              Update Status:
              <select name="status" defaultValue={c.status}>
                <option value="Registered">Registered</option>
                <option value="In-progress">In-progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </label>
            <button type="submit">Update</button>
          </form>
        )}
        <div className={styles.commentsSection}>
          <h5>Comments:</h5>
          {c.comments && c.comments.length > 0 ? (
            c.comments.map((com, idx) => (
              <div key={idx} className={styles.comment}>
                <strong>{com.citizen?.name || "User"}:</strong> {com.message} <span>({new Date(com.createdAt).toLocaleString()})</span>
              </div>
            ))
          ) : (
            <div>No comments yet.</div>
          )}
          {userRole === "citizen" && (
            <form
              className={styles.commentForm}
              onSubmit={(e) => {
                e.preventDefault();
                onComment(c._id, e.target.message.value);
                e.target.reset();
              }}
            >
              <input name="message" placeholder="Add a comment..." required />
              <button type="submit">Comment</button>
            </form>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default ComplaintList;