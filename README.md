# Livy Client

Simple REST clien for Apache Livy

## Installation

```bash
npm install livy-client
```

## Usage

```js
const LivyClient = require('livy-client')

const start = async () => {

	// Create client
	const livy = new LivyClient({
		host: 'localhost',
		port: '8998'
	})

	// Get sessions
	const sessions = await livy.sessions()
	for (session of sessions) {
		const status = await session.status()
		console.log(`Session id: ${status.id}, state: ${status.state}`)
	}

	// Create session
	const newSession = await livy.createSession({
		kind: 'pyspark3',
		numExecutors: 4
	})

	// Listen event of a session
	newSession
		.on('starting', status => {
			console.log('Session starting... ' + status.log.slice(0, -1).slice(-1)[0].replace(/\n/g, ' '))
		})
		// Once ready, execute a code and kill the session
		.once('idle', async status => {
			const statement = await newSession.run('from time import sleep; sleep(5); print(spark)')
			statement
				.on('running', status => {
					console.log(`Statement running... ${Math.round(status.progress*100)}/100%`)
				}).once('available', response => {
					console.log(`Statement completed. Result: `)
					console.log(response.output)
					newSession.kill()
				})
		})

}

start()
```

## Reference

### Class: LivyClient

#### Events
- `update`
- `error`

#### Methods
- `sessions()`
- `createSession()`
- `stopUpdate()`
- `startUpdate()`

```js
// Constructor
const livy = new LivyClient({
	protocol: 'http',
	host: 'localhost',
	port: 8998,
	ua: 'Livy Client for Node.js',
	autoupdate: true,
	updateInterval: 1000
})

// Methods
const sessions = await livy.sessions() 			// array of Session instances

const newSession = await livy.createSession({ 	// Session instance
	kind,
	proxyUser,
	jars,
	pyFiles,
	files,
	driverMemory,
	driverCores,
	executorMemory,
	executorCores,
	numExecutors,
	archives,
	queue,
	name,
	conf,
	heartbeatTimeoutInSecond,
	autoupdate
})
```

### Class: Session

#### Events
- `not_started`
- `starting`
- `idle`
- `busy`
- `shutting_down`
- `error`
- `dead`
- `success`

#### Methods
- `status()`
- `state()`
- `log()`
- `statements()`
- `run()`
- `kill()`
- `stopUpdate()`
- `startUpdate()`

```js
const session = await livy.createSession({kind: 'pyspark3', numExecutors: 4})

// Methods
session.once('idle', async stat => {

	const status = await session.status() 						// status object
	const state = await session.state() 						// state object
	const log = await session.log() 							// array of logs
	const statements = await session.statements()				// array of Statement instances
	const run = await session.run('print("Hello, World!!")') 	// Statement instance
	const kill = await session.kill()							// result object

})
```

### Class: Statement

#### Events
- `waiting`
- `running`
- `available`
- `error`
- `cancelling`
- `cancelled`

#### Methods
- `status()`
	- Returns: Promise
	- {id: int, code: string, state: string, output: object}
- `cancel()`
	- Returns: Promise
	- {msg: 'cancelled'}
- `stopUpdate()`
- `startUpdate()`

```js
const statement = await session.run('print("Hello, World!!")')

// Methods
statement.once('running', async status => {
	console.log(status.progress)
	await statement.cancel()									// result object
}).once('available', res => {
	console.log(res.output)
}).once('cancelled', res => {
	console.log(res)
})
```