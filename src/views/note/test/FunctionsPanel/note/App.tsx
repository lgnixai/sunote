import { EditorProvider } from './components/EditorProvider';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import EditorContainer from './components/EditorContainer';
//import './index.css';

function EditorExample1() {


  return (
    <EditorProvider>
      <div className="app" style={{height:"600px"}}>

        <div className="main-content" style={{height:"600px"}}>

          <EditorContainer />
        </div>
      </div>
    </EditorProvider>
  );
}

export default EditorExample1;
