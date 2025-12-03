'use strict';

const Issue = require('../models/issue.js');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res) {

      let project = req.params.project;

      // filter includes project name, optional parameters
      let filter = { project, ...req.query };

      // if 'open' convert to boolean
      if (filter.open) {
        filter.open = filter.open === 'true';
      }

      // query for issues, return array
      // if no issues, return empty array
      Issue.find(filter)
        .select('-__v') // exclude Mongoose version key
        .then(issues => {
          res.json(issues);
        })
        .catch(err => {
          console.error("GET error:", err);
          res.json({ error: 'could not fetch issues' });
        });
          
    }) // end .get
    
    .post(function (req, res) {

      let project = req.params.project;

      const issueTitle = req.body.issue_title;
      const issueText = req.body.issue_text;
      const createdBy = req.body.created_by;
      const assignedTo = req.body.assigned_to || '';
      const statusText = req.body.status_text || '';

      // check required fields
      if (!issueTitle || !issueText || !createdBy) {
        return res.json({ error: 'required field(s) missing' });
      }

      // create new Issue
      const newIssue = new Issue({
        project: project,
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText
      });

      // save to MongoDB
      newIssue.save()
        .then(function(savedIssue) {
          // return fields as required by the test
          res.json({
            _id: savedIssue._id,
            issue_title: savedIssue.issue_title,
            issue_text: savedIssue.issue_text,
            created_on: savedIssue.created_on,
            updated_on: savedIssue.updated_on,
            created_by: savedIssue.created_by,
            assigned_to: savedIssue.assigned_to,
            open: savedIssue.open,
            status_text: savedIssue.status_text
          });
        })
        .catch(function(err) {
          console.error('Save error:', err);
          res.json({ error: 'could not save issue' });
        });
      
    }) // end .post
    
    .put(function (req, res) {

      const _id = req.body._id;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let updates = {};
      let updateFieldsFound = false;

      // Iterate over req.body, include only non-empty update fields
      for (const key in req.body) {
        // Skip _id and project
        if (key !== '_id' && key !== 'project') {
          // check for non-falsy value (excluding 0)
          // The issue is fields being sent as "" or null.
          if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== "") {
            updates[key] = req.body[key];
            updateFieldsFound = true;
          }
        }
      }

      // if no update fields (only _id, or all fields empty)
      if (!updateFieldsFound) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      // check for status_text 'closed' to set 'open' to false
      if (updates.status_text && updates.status_text.toLowerCase() === 'closed') {
        updates.open = false;  // mark issue closed
      }
      
      // always update the updated_on field
      updates.updated_on = new Date();

      // update
      Issue.findByIdAndUpdate(_id, updates, { new: true })
        .then(result => {
          if (!result) {
            return res.json({ error: 'could not update', _id });
          }
          res.json({ result: 'successfully updated', _id });
        })
        .catch(err => {
          res.json({ error: 'could not update', _id });
        });
      
    }) // end .put
    
    .delete(function (req, res){

      const _id = req.body._id;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      Issue.findByIdAndDelete(_id)
        .then(result => {
          if (!result) {
            return res.json({ error: 'could not delete', _id });
          }
          res.json({ result: 'successfully deleted', _id });
        })
        .catch(err => {
          res.json({ error: 'could not delete', _id });
        });
      
    }); // end .delete
    
};