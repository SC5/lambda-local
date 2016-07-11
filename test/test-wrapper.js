var testMod1 = {
  handler: function(event, context) {
    if (event.test === 'success') {
      context.succeed('Success');
    }
    if (event.test === 'fail') {
      context.fail('Fail');
    }
  }
};

var testMod2 = {
  handler: function(event, context) {
    context.succeed(event);
  }
};

var testMod3 = {
  handler: function(event, context, callback) {
    callback(null, event);
  }
}

var testMod4 = {
  customHandlerName: function(event, context, callback) {
    callback(null, event);
  }
}

var wrapper = require('../index.js');
var expect = require('chai').expect;

describe('lambda-wrapper', function() {
  it('init + run with success', function(done) {
    wrapper.init(testMod1);
    wrapper.run({test: 'success'}, function(err, response) {
      expect(response).to.be.equal('Success');
      done();
    });
  });
  it('init + run with failure', function(done) {
    wrapper.init(testMod1);
    wrapper.run({test: 'fail'}, function(err, response) {
      expect(err).to.be.equal('Fail');
      done();
    });
  });

  it('wrap + run module 2', function(done) {
    var w2 = wrapper.wrap(testMod2);
    w2.run({foo: 'bar'}, function(err, response) {
       expect(response.foo).to.be.equal('bar');
       done();
    });
  });

  it('wrap + run module 1', function(done) {
    var w1 = wrapper.wrap(testMod1);
    w1.run({test: 'success'}, function(err, response) {
       expect(response).to.be.equal('Success');
       done();
    });
  });

  it('wrap + run module 3 (callback notation)', function(done) {
    var w1 = wrapper.wrap(testMod3);
    w1.run({test: 'cbsuccess'}, function(err, response) {
       expect(response.test).to.be.equal('cbsuccess');
       done();
    });
  });

  it('wrap + run module 4 (custom handler name)', function(done) {
    var w1 = wrapper.wrap(testMod4, 'customHandlerName');
    w1.run({test: 'cbsuccess'}, function(err, response) {
       expect(response.test).to.be.equal('cbsuccess');
       done();
    });
  });

  it('can call lambda functions deployed in AWS', function(done) {
    var wLive = wrapper.wrap({
      lambdaFunction: 'lambdaWrapper-test',
      region: process.env.AWS_DEFAULT_REGION || 'eu-central-1'
    });
    wLive.run({test: 'livesuccess'}, function(err, response) {
       if (err) {
         return done(err);
       }

       expect(response.src).to.be.equal('lambda');
       expect(response.event.test).to.be.equal('livesuccess');
       done();
    });
  });
});
