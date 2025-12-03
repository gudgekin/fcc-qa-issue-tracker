'use strict';

const Issue = require('../models/issue.js');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res) {

      let project = req.params.project;

      // Optional filters from query string
      let filter = { project }; // include project in filter
      for (let key in req.query) {
        filter[key] = req.query[key];
      }

      Issue.find(filter)
        .then(issues => res.json(issues))
        .catch(err => res.json({ error: 'could not fetch issues' }));
      
    }) // end .get
    
    .post(function (req, res) {

      let project = req.params.project;

      // Get the data from the request body
    
      const issueTitle = req.body.issue_title;
      const issueText = req.body.issue_text;
      const createdBy = req.body.created_by;
      const assignedTo = req.body.assigned_to || '';
      const statusText = req.body.status_text || '';

      // Check required fields
      if (!issueTitle || !issueText || !createdBy) {
        return res.json({ error: 'required field(s) missing' });
      }

      // Create new Issue
      const newIssue = new Issue({
        project: project,
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText
      });

      console.log("Project received:", project);

      // Save to MongoDB using Promise
      newIssue.save()
        .then(function(savedIssue) {
          console.log('Saved issue:', savedIssue);
          res.json(savedIssue);
        })
        .catch(function(err) {
          console.log('Save error:', err);
          res.json({ error: 'could not save issue' });
        });
      
    }) // end .post
    
    .put(function (req, res) {

      let project = req.params.project;

      const { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Remove empty fields
      for (let key in updates) {
        if (!updates[key]) {
          delete updates[key];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      updates.updated_on = new Date();

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

      let project = req.params.project;
      
      const { _id } = req.body;

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
