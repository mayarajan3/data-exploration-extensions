const bindAll = require('lodash.bindall');
const React = require('react');

const Blocks = require('./blocks');
const GreenFlag = require('./green-flag');
const SpriteSelector = require('./sprite-selector');
const Stage = require('./stage');
const StopAll = require('./stop-all');
const VM = require('scratch-vm');
const VMManager = require('../lib/vm-manager');

class GUI extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['animate', 'onReceiveRenderer', 'onReceiveWorkspace']);
        this.state = {};
        this.vmManager = new VMManager(this.props.vm);
    }
    componentDidMount () {
        this.vmManager.attachKeyboardEvents();
        this.props.vm.loadProject(this.props.projectData);
        this.props.vm.start();
        requestAnimationFrame(this.animate);
    }
    componentWillReceiveProps (nextProps) {
        if (this.props.projectData !== nextProps.projectData) {
            this.props.vm.loadProject(nextProps.projectData);
        }
    }
    animate () {
        this.props.vm.animationFrame();
        requestAnimationFrame(this.animate);
    }
    onReceiveRenderer (renderer, stage) {
        this.renderer = renderer;
        this.stage = stage;
        this.props.vm.attachRenderer(this.renderer);
        this.vmManager.attachMouseEvents(this.stage);
    }
    onReceiveWorkspace (workspace) {
        this.workspace = workspace;
        this.vmManager.attachWorkspace(this.workspace);
    }
    render () {
        return (
            <div
                className="scratch-gui"
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }}
            >
                <GreenFlag vm={this.props.vm} />
                <StopAll vm={this.props.vm} />
                <Stage
                    onReceiveRenderer={this.onReceiveRenderer}
                />
                <SpriteSelector vm={this.props.vm} />
                <Blocks
                    options={{
                        media: this.props.basePath + 'static/blocks-media/'
                    }}
                    vm={this.props.vm}
                    onReceiveWorkspace={this.onReceiveWorkspace}
                />
            </div>
        );
    }
}

GUI.propTypes = {
    basePath: React.PropTypes.string,
    projectData: React.PropTypes.string,
    vm: React.PropTypes.object,
};

GUI.defaultProps = {
    basePath: '/',
    vm: new VM()
};

module.exports = GUI;
