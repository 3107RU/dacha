import exitHook from 'exit-hook'

function run() {
    return new Promise(resolve => exitHook(signal => resolve(signal)))
}

export default run
