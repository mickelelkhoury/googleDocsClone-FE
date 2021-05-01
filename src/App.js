import TextEditor from './TextEditor';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

function App() {
	return (
		<div className='App'>
			{/* THIS IS THE ROUTE LATOUT TO CREATE NEW DOCUMENTS AND REDIRECT */}
			<Router>
				<Switch>
					<Route exact path='/'>
						<Redirect to={`/documents/${uuidV4()}`}></Redirect>
					</Route>
					<Route path='/documents/:id'>
						<TextEditor />
					</Route>
				</Switch>
			</Router>
		</div>
	);
}

export default App;
