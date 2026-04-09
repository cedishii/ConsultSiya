const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Student books a consultation
router.post('/', authenticate, authorize('student'), async (req, res) => {
  const { professor_id, schedule_id, date, nature_of_advising, mode } = req.body;

  try {
    // Get student profile
    const studentResult = await pool.query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const student_id = studentResult.rows[0].id;

    // Check if slot is still available
    const scheduleCheck = await pool.query(
      `SELECT is_available FROM schedules WHERE id = $1`,
      [schedule_id]
    );

    if (!scheduleCheck.rows[0]?.is_available) {
      return res.status(400).json({ error: 'This schedule slot is no longer available.' });
    }

    // Create the consultation
    const result = await pool.query(
      `INSERT INTO consultations 
       (student_id, professor_id, schedule_id, date, nature_of_advising, mode)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, professor_id, schedule_id, date, nature_of_advising, mode]
    );

    // Mark slot as unavailable
    await pool.query(
      `UPDATE schedules SET is_available = false WHERE id = $1`,
      [schedule_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get consultations (professors see their own, students see their own)
router.get('/', authenticate, async (req, res) => {
  try {
    let result;

    if (req.user.role === 'professor') {
      const prof = await pool.query(
        `SELECT id FROM professors WHERE user_id = $1`, [req.user.id]
      );
      result = await pool.query(
        `SELECT c.*, s.full_name AS student_name, s.student_number,
                s.program, sch.day, sch.time_start, sch.time_end
         FROM consultations c
         JOIN students s ON c.student_id = s.id
         JOIN schedules sch ON c.schedule_id = sch.id
         WHERE c.professor_id = $1
         ORDER BY c.date DESC`,
        [prof.rows[0].id]
      );
    } else if (req.user.role === 'student') {
      const student = await pool.query(
        `SELECT id FROM students WHERE user_id = $1`, [req.user.id]
      );
      result = await pool.query(
        `SELECT c.*, p.full_name AS professor_name,
                sch.day, sch.time_start, sch.time_end
         FROM consultations c
         JOIN professors p ON c.professor_id = p.id
         JOIN schedules sch ON c.schedule_id = sch.id
         WHERE c.student_id = $1
         ORDER BY c.date DESC`,
        [student.rows[0].id]
      );
    } else {
      // Admin sees all
      result = await pool.query(
        `SELECT c.*, s.full_name AS student_name, p.full_name AS professor_name,
                sch.day, sch.time_start, sch.time_end
         FROM consultations c
         JOIN students s ON c.student_id = s.id
         JOIN professors p ON c.professor_id = p.id
         JOIN schedules sch ON c.schedule_id = sch.id
         ORDER BY c.date DESC`
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Professor marks consultation as completed + adds details
router.patch('/:id/complete', authenticate, authorize('professor'), async (req, res) => {
  const { id } = req.params;
  const { action_taken, referral, remarks } = req.body;

  try {
    // Mark consultation as completed
    await pool.query(
      `UPDATE consultations SET status = 'completed' WHERE id = $1`,
      [id]
    );

    // Save the details
    const result = await pool.query(
      `INSERT INTO consultation_details 
       (consultation_id, action_taken, referral, remarks)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, action_taken, referral, remarks]
    );

    res.json({ message: 'Consultation completed', details: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;