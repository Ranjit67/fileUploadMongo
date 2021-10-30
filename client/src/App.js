import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { File, Redux } from "./Pages";
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/file" component={File} />
        <Route exact path="/" component={Redux} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
