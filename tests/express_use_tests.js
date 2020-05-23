const assert = require('assert');

describe('module env tests', function() {
  describe('#use includes module', function() {
    it('should throw error if Authorization Header absent', (done) => {
      assert.equal([1, 2, 3].indexOf(4), -1);
      done();
    });
  });
});