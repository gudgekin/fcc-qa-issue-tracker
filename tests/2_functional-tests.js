const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Import the server

chai.use(chaiHttp);
const assert = chai.assert;

suite('Functional Tests', function() {

  let issueId = ''; // Global variable to store the ID of the issue being tested
  let tempIssueId = ''; // Variable for re-creating the issue later

  // --- 1. Create an issue with every field: POST request ---
  test('Create an issue with all required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test issue 1',
        issue_text: 'This is a test issue for all fields',
        created_by: 'Tester',
        assigned_to: 'Nobody',
        status_text: 'In Progress',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Test issue 1');
        issueId = res.body._id; // Store the ID for future tests
        done();
      });
  });

  // --- 2. Create an issue with only required fields: POST request ---
  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test issue 2 (Required)',
        issue_text: 'This is a test issue with only required fields',
        created_by: 'Tester',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.assigned_to, ''); // Should default to empty string
        assert.equal(res.body.status_text, ''); // Should default to empty string
        tempIssueId = res.body._id; // Store this ID to be updated/deleted later
        done();
      });
  });

  // --- 3. Create an issue with missing required fields: POST request ---
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test issue without created_by',
        issue_text: 'This is a test issue without created_by field',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  // --- 4. View issues on a project: GET request ---
  test('View all issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 2); // Should have at least the two issues created above
        done();
      });
  });

  // --- 5. View issues on a project with one filter: GET request ---
  test('View issues with one filter: assigned_to', function(done) {
    chai.request(server)
      .get('/api/issues/test?assigned_to=Nobody')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        res.body.forEach(function(issue) {
          assert.equal(issue.assigned_to, 'Nobody');
        });
        done();
      });
  });

  // --- 6. View issues on a project with multiple filters: GET request ---
  test('View issues with multiple filters: assigned_to and open=true', function(done) {
    chai.request(server)
      .get('/api/issues/test?assigned_to=Nobody&open=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        res.body.forEach(function(issue) {
          assert.equal(issue.assigned_to, 'Nobody');
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // --- 7. Update one field on an issue: PUT request ---
  test('Update one field on an issue (issue_text)', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: issueId,
        issue_text: 'Updated issue text!',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // --- 8. Update multiple fields on an issue: PUT request ---
  test('Update multiple fields on an issue (title and status)', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: issueId,
        issue_title: 'Updated Title',
        status_text: 'Resolved',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // --- 9. Update an issue with missing _id: PUT request ---
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        issue_title: 'Title without ID',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // --- 10. Update an issue with no fields to update: PUT request ---
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: issueId,
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: issueId });
        done();
      });
  });

  // --- 11. Update an issue with an invalid _id: PUT request ---
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: '5f665eb45832a504ea264516', // Example invalid but correctly formatted ID
        issue_title: 'Attempted Update',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', _id: '5f665eb45832a504ea264516' });
        done();
      });
  });

  // --- 12. Delete an issue with an invalid _id: DELETE request ---
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: '5f665eb45832a504ea264516' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', _id: '5f665eb45832a504ea264516' });
        done();
      });
  });
  
  // --- 13. Delete an issue with missing _id: DELETE request ---
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // --- 14. Delete an issue with a valid _id: DELETE request (This must be the last test on this ID) ---
  test('Delete an issue with a valid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: tempIssueId }) // Deletes the issue created in Test 2
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, tempIssueId);
        done();
      });
  });

});