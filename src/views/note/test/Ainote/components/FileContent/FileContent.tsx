import { useStateSelector } from "../../FileTreeContext/useTreeCtxState"


export default function FileContent() {
   const selectedFile = useStateSelector((state) => state.FocusedNode.item?.name)
   return (
      <section
         className='file-content relative h-[100vh] left-164 flex items-center justify-center'
         style={{ width: 'calc(100% - 26rem)' }}
      >
         <h3>{selectedFile}</h3>
      </section>
   )
}
