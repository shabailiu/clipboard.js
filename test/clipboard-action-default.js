import Emitter from 'tiny-emitter';
import ClipboardActionDefault from '../src/clipboard-action-default';

describe('ClipboardActionDefault', () => {
  before(() => {
    global.input = document.createElement('input');
    global.input.setAttribute('id', 'input');
    global.input.setAttribute('value', 'abc');
    document.body.appendChild(global.input);

    global.paragraph = document.createElement('p');
    global.paragraph.setAttribute('id', 'paragraph');
    global.paragraph.textContent = 'abc';
    document.body.appendChild(global.paragraph);
  });

  after(() => {
    document.body.innerHTML = '';
  });

  describe('#resolveOptions', () => {
    it('should set base properties', () => {
      let clip = new ClipboardActionDefault({
        emitter: new Emitter(),
        container: document.body,
        text: 'foo',
      });

      assert.property(clip, 'action');
      assert.property(clip, 'container');
      assert.property(clip, 'emitter');
      assert.property(clip, 'target');
      assert.property(clip, 'text');
      assert.property(clip, 'trigger');
      assert.property(clip, 'selectedText');
    });
  });

  describe('#set action', () => {
    it('should throw an error since "action" is invalid', (done) => {
      try {
        let clip = new ClipboardActionDefault({
          text: 'foo',
          action: 'paste',
        });
      } catch (e) {
        assert.equal(
          e.message,
          'Invalid "action" value, use either "copy" or "cut"'
        );
        done();
      }
    });
  });

  describe('#set target', () => {
    it('should throw an error since "target" do not match any element', (done) => {
      try {
        let clip = new ClipboardActionDefault({
          target: document.querySelector('#foo'),
        });
      } catch (e) {
        assert.equal(e.message, 'Invalid "target" value, use a valid Element');
        done();
      }
    });
  });

  describe('#selectTarget', () => {
    it('should select text from editable element', () => {
      let clip = new ClipboardActionDefault({
        emitter: new Emitter(),
        container: document.body,
        target: document.querySelector('#input'),
      });

      assert.equal(clip.selectedText, clip.target.value);
    });

    it('should select text from non-editable element', () => {
      let clip = new ClipboardActionDefault({
        emitter: new Emitter(),
        container: document.body,
        target: document.querySelector('#paragraph'),
      });

      assert.equal(clip.selectedText, clip.target.textContent);
    });
  });

  describe('#copyText', () => {
    before(() => {
      global.stub = sinon.stub(document, 'execCommand');
    });

    after(() => {
      global.stub.restore();
    });

    it('should fire a success event on browsers that support copy command', (done) => {
      global.stub.returns(true);

      let emitter = new Emitter();

      emitter.on('success', () => {
        done();
      });

      let clip = new ClipboardActionDefault({
        emitter,
        target: document.querySelector('#input'),
      });
    });

    it('should fire an error event on browsers that support cut command', (done) => {
      let emitter = new Emitter();

      emitter.on('error', () => {
        done();
      });

      let clip = new ClipboardActionDefault({
        emitter,
        target: document.querySelector('#input'),
      });

      clip.handleResult(false);
    });
  });

  describe('#handleResult', () => {
    it('should fire a success event with certain properties', (done) => {
      let clip = new ClipboardActionDefault({
        emitter: new Emitter(),
        container: document.body,
        target: document.querySelector('#input'),
      });

      clip.emitter.on('success', (e) => {
        assert.property(e, 'action');
        assert.property(e, 'text');
        assert.property(e, 'trigger');
        assert.property(e, 'clearSelection');

        done();
      });

      clip.handleResult(true);
    });

    it('should fire a error event with certain properties', (done) => {
      let clip = new ClipboardActionDefault({
        emitter: new Emitter(),
        container: document.body,
        target: document.querySelector('#input'),
      });

      clip.emitter.on('error', (e) => {
        assert.property(e, 'action');
        assert.property(e, 'trigger');
        assert.property(e, 'clearSelection');

        done();
      });

      clip.handleResult(false);
    });
  });

  describe('#clearSelection', () => {
    it('should remove focus from target and text selection', () => {
      let clip = new ClipboardActionDefault({
        emitter: new Emitter(),
        container: document.body,
        target: document.querySelector('#input'),
      });

      clip.clearSelection();

      let selectedElem = document.activeElement;
      let selectedText = window.getSelection().toString();

      assert.equal(selectedElem, document.body);
      assert.equal(selectedText, '');
    });
  });
});
