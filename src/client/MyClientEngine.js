const ClientEngine = require('lance-gg').ClientEngine;
const MyRenderer = require('../client/MyRenderer');

class MyClientEngine extends ClientEngine {

    constructor(gameEngine, options) {
        super(gameEngine, options, MyRenderer);

        this.serializer.registerClass(require('../common/PlayerAvatar'));
        this.gameEngine.on('client__preStep', this.preStep.bind(this));

        // keep a reference for key press state
        this.pressedKeys = {
            down: false,
            up: false,
            left: false,
            right: false,
            space: false
        };

        let that = this;
        document.onkeydown = (e) => { that.onKeyChange(e, true); };
        document.onkeyup = (e) => { that.onKeyChange(e, false); };
    }

    // our pre-step is to process all inputs
    preStep() {

        if (this.pressedKeys.up) {
            this.sendInput('up', { movement: true });
        }

        if (this.pressedKeys.down) {
            this.sendInput('down', { movement: true });
        }

        if (this.pressedKeys.left) {
            this.sendInput('left', { movement: true });
        }

        if (this.pressedKeys.right) {
            this.sendInput('right', { movement: true });
        }

        if (this.pressedKeys.space) {
            this.sendInput('space', { movement: true });
        }
    }

    onKeyChange(e, isDown) {
        e = e || window.event;

        if (e.keyCode == '38') {
            this.pressedKeys.up = isDown;
        } else if (e.keyCode == '40') {
            this.pressedKeys.down = isDown;
        } else if (e.keyCode == '37') {
            this.pressedKeys.left = isDown;
        } else if (e.keyCode == '39') {
            this.pressedKeys.right = isDown;
        } else if (e.keyCode == '32') {
            this.pressedKeys.space = isDown;
        }
    }
}

module.exports = MyClientEngine;
