 import { FileTreeCtxProvider } from "./FileTreeContext/FileTreeContext";
import FileContent from "./components/FileContent/FileContent";
 import FileTree from "~/views/note/Ainote/components/FileTree/FileTree";
import './index.scss'

export default function Ainote() {
   return (
      <FileTreeCtxProvider>
         <FileTree />
         <FileContent />
      </FileTreeCtxProvider>
   )
}
