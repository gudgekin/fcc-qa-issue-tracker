const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Import the server

chai.use(chaiHttp);
const assert = chai.assert;

suite('Functional Tests', function() {

  let issueId = '';

  // Test 1: Create an issue (with all required fields)
  test('Create an issue with all required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')  // Replace 'test' with your actual project name
      .send({
        issue_title: 'Test issue',
        issue_text: 'This is a test issue',
        created_by: 'Tester',
        assigned_to: 'Nobody',
        status_text: 'Open',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'created_by');
        assert.equal(res.body.issue_title, 'Test issue');
        assert.equal(res.body.issue_text, 'This is a test issue');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.status_text, 'Open');
        issueId = res.body._id;  // Store the created issue's ID
        done();
      });
  });

  // Test 2: Create an issue (missing required fields)
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')  // Replace 'test' with your actual project name
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

  // Test 3: Get all issues
  test('Get all issues', function(done) {
    chai.request(server)
      .get('/api/issues/test')  // Replace 'test' with your actual project name
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);  // Ensure at least 1 issue exists
        done();
      });
  });

  // Test 4: Get issues with filters (open=true)
  test('Get issues with filter open=true', function(done) {
    chai.request(server)
      .get('/api/issues/test?open=true')  // Replace 'test' with your actual project name
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(function(issue) {
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // Test 5: Get issues with multiple filters (assigned_to)
  test('Get issues with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/test?assigned_to=Nobody&open=true')  // Replace 'test' with your actual project name
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(function(issue) {
          assert.equal(issue.assigned_to, 'Nobody');
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // Test 6: Update an issue (with valid _id and fields)
  test('Update an issue with valid _id and fields', function(done) {
    chai.request(server)
      .put('/api/issues/test')  // Replace 'test' with your project name
      .send({
        _id: issueId,  // Use the issueId from the previous POST test
        issue_title: 'Updated Test issue',
        status_text: 'Closed',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // Test 7: Update an issue without _id
  test('Update an issue without _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')  // Replace 'test' with your project name
      .send({
        issue_title: 'Updated Test issue without _id',
        status_text: 'Closed',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // Test 8: Update an issue without update fields
  test('Update an issue without update fields', function(done) {
    chai.request(server)
      .put('/api/issues/test')  // Replace 'test' with your project name
      .send({
        _id: issueId,  // Use the issueId from the previous POST test
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: issueId });
        done();
      });
  });

  // Test 9: Delete an issue with valid _id
  test('Delete an issue with valid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')  // Replace 'test' with your project name
      .send({ _id: issueId })  // Send the issueId to delete the specific issue
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // Test 10: Delete an issue with missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')  // Replace 'test' with your project name
      .send({})  // Send no _id
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // Test 11: Update an issue with closed status (when it was previously open)
  test('Update issue to closed status', function(done) {
    chai.request(server)
      .put('/api/issues/test')  // Replace 'test' with your project name
      .send({
        _id: issueId,  // Use the issueId from the previous POST test
        status_text: 'Closed',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // Test 12: Update an issue with invalid status (testing edge cases)
  test('Update an issue with invalid status', function(done) {
    chai.request(server)
      .put('/api/issues/test')  // Replace 'test' with your project name
      .send({
        _id: issueId,  // Use the issueId from the previous POST test
        status_text: null,  // Invalid status
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', _id: issueId });
        done();
      });
  });

  // Test 13: Get issues by multiple filters
  test('Get issues with multiple filters and statuses', function(done) {
    chai.request(server)
      .get('/api/issues/test?open=true&assigned_to=Nobody')  // Replace 'test' with your actual project name
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(function(issue) {
          assert.equal(issue.assigned_to, 'Nobody');
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // Test 14: Invalid project name in GET request
  test('Get issues with invalid project name', function(done) {
    chai.request(server)
      .get('/api/issues/invalidproject')  // Replace with an invalid project name
      .end(function(err, res) {
        assert.equal(res.status, 404);  // Should return 404 if project doesn't exist
        done();
      });
  });

});
