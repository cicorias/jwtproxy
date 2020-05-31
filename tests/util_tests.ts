import { expect } from 'chai';
import { checkUrl} from '../src/JwksHelper';
// import assert from 'assert';
import 'mocha';


describe('Utility function tests', ()=>{
  describe('Url http or https validation', ()=>{
    it('should allow https://', ()=>{
      const rv = checkUrl('https://foogar');
      expect(rv).true;
    });

    it('should allow http://', ()=>{
      const rv = checkUrl('http://foogar');
      expect(rv).true;
    });

    it('should allow not http//', ()=>{
      const rv = checkUrl('http//foogar');
      expect(rv).false;
    });

    it('should allow not https//', ()=>{
      const rv = checkUrl('http//foogar');
      expect(rv).false;
    });

    
    it('should not allow prefix space https://', ()=>{
      const rv = checkUrl(' https://foogar');
      expect(rv).false;
    });
  });
});